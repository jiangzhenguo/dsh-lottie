import { strFromU8, unzipSync } from 'fflate';

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ARCHIVE_UNPACKED_BYTES = 50 * 1024 * 1024;

const MIME_TYPES = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

function validAnimation(data) {
  return data && typeof data === 'object' && Array.isArray(data.layers) &&
    typeof data.w === 'number' && typeof data.h === 'number';
}

export function parseAnimation(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('invalid');
  }
  if (!validAnimation(data)) throw new Error('invalid');
  const hasExternalAssets = Array.isArray(data.assets) && data.assets.some((asset) =>
    asset && typeof asset.p === 'string' && !asset.p.startsWith('data:'));
  if (hasExternalAssets) throw new Error('externalAssets');
  return data;
}

function parsePackagedAnimation(bytes) {
  let data;
  try {
    data = JSON.parse(strFromU8(bytes));
  } catch {
    throw new Error('invalid');
  }
  if (!validAnimation(data)) throw new Error('invalid');
  return data;
}

function normalizePath(path) {
  return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
}

function dataUrl(bytes, filename) {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const mime = MIME_TYPES[extension] || 'application/octet-stream';
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

function inlineAssets(data, files) {
  if (!Array.isArray(data.assets)) return;
  for (const asset of data.assets) {
    if (!asset || typeof asset.p !== 'string' || asset.p.startsWith('data:')) continue;
    const filename = normalizePath(asset.p);
    const combined = normalizePath(`${asset.u || ''}${asset.p}`);
    const candidates = [...new Set([combined, `images/${filename}`, filename])];
    const path = candidates.find((candidate) => files[candidate] !== undefined);
    if (!path) throw new Error('missingAsset');
    asset.p = dataUrl(files[path], path);
    asset.u = '';
  }
}

function isZip(bytes) {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b &&
    ((bytes[2] === 3 && bytes[3] === 4) || (bytes[2] === 5 && bytes[3] === 6) ||
      (bytes[2] === 7 && bytes[3] === 8));
}

export function parseDotLottie(input, limits = {}) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const maxResourceBytes = limits.maxResourceBytes ?? MAX_FILE_BYTES;
  const maxUnpackedBytes = limits.maxUnpackedBytes ?? MAX_ARCHIVE_UNPACKED_BYTES;
  let files;
  let rejected = false;
  let acceptedBytes = 0;
  try {
    const extracted = unzipSync(bytes, {
      filter(file) {
        const name = normalizePath(file.name);
        const wanted = name === 'manifest.json' || name.startsWith('animations/') || name.startsWith('images/');
        if (!wanted) return false;
        if (file.originalSize > maxResourceBytes || acceptedBytes + file.originalSize > maxUnpackedBytes) {
          rejected = true;
          return false;
        }
        acceptedBytes += file.originalSize;
        return true;
      },
    });
    files = Object.create(null);
    for (const [name, content] of Object.entries(extracted)) {
      const normalized = normalizePath(name);
      if (files[normalized]) throw new Error('invalidArchive');
      files[normalized] = content;
    }
  } catch (reason) {
    if (reason.message === 'invalidArchive') throw reason;
    throw new Error('invalidArchive');
  }
  if (rejected) throw new Error('tooLarge');
  if (!files['manifest.json']) throw new Error('invalidManifest');

  let manifest;
  try {
    manifest = JSON.parse(strFromU8(files['manifest.json']));
  } catch {
    throw new Error('invalidManifest');
  }
  if (!manifest || !Array.isArray(manifest.animations) || manifest.animations.length === 0) {
    throw new Error('invalidManifest');
  }

  const animationIds = new Set();
  const animations = manifest.animations.map((entry) => {
    if (!entry || typeof entry.id !== 'string' || !entry.id || /[\\/]/.test(entry.id) || entry.id.includes('..') ||
        animationIds.has(entry.id)) {
      throw new Error('invalidManifest');
    }
    animationIds.add(entry.id);
    const path = `animations/${entry.id}.json`;
    if (!files[path]) throw new Error('invalidManifest');
    const data = parsePackagedAnimation(files[path]);
    inlineAssets(data, files);
    return { id: entry.id, data };
  });
  const activeAnimationId = animations.some((entry) => entry.id === manifest.activeAnimationId)
    ? manifest.activeAnimationId
    : animations[0].id;
  const active = animations.find((entry) => entry.id === activeAnimationId);
  return { data: active.data, animations, activeAnimationId };
}

export async function readResponseArrayBuffer(response, maxBytes = MAX_FILE_BYTES) {
  const length = Number(response.headers.get('Content-Length'));
  if (Number.isFinite(length) && length > maxBytes) {
    try { await response.body?.cancel(); } catch { /* The size error is the useful result. */ }
    throw new Error('tooLarge');
  }
  if (!response.body?.getReader) {
    const blob = await response.blob();
    if (blob.size > maxBytes) throw new Error('tooLarge');
    return blob.arrayBuffer();
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch { /* The size error is the useful result. */ }
        throw new Error('tooLarge');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Blob(chunks, {
    type: response.headers.get('Content-Type') || 'application/octet-stream',
  }).arrayBuffer();
}

export async function parseAnimationInput(input, filename = '') {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length > MAX_FILE_BYTES) throw new Error('tooLarge');
  if (filename.toLowerCase().endsWith('.lottie') || isZip(bytes)) return parseDotLottie(bytes);
  return { data: parseAnimation(strFromU8(bytes)) };
}
