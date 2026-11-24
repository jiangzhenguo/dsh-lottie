import assert from 'node:assert/strict';
import test from 'node:test';
import { strToU8, zipSync } from 'fflate';
import {
  MAX_FILE_BYTES,
  parseAnimation,
  parseAnimationInput,
  parseDotLottie,
  readResponseArrayBuffer,
} from './loader.js';

function animation(name, assets = []) {
  return {
    v: '5.9.6', fr: 30, ip: 0, op: 30, w: 100, h: 100, nm: name,
    layers: [], assets,
  };
}

function archive({ activeAnimationId = 'first', assets = [], image = true } = {}) {
  return zipSync({
    'manifest.json': strToU8(JSON.stringify({
      version: '1.0', activeAnimationId,
      animations: [{ id: 'first' }, { id: 'second' }],
    })),
    'animations/first.json': strToU8(JSON.stringify(animation('First'))),
    'animations/second.json': strToU8(JSON.stringify(animation('Second', assets))),
    ...image ? { 'images/pixel.png': new Uint8Array([137, 80, 78, 71]) } : {},
  });
}

test('parses standalone Lottie JSON', () => {
  const result = parseAnimation(JSON.stringify(animation('Plain')));
  assert.equal(result.nm, 'Plain');
});

test('rejects external images in standalone JSON', () => {
  const input = JSON.stringify(animation('External', [{ p: 'pixel.png', u: 'images/' }]));
  assert.throws(() => parseAnimation(input), /externalAssets/);
});

test('selects activeAnimationId and exposes every packaged animation', () => {
  const result = parseDotLottie(archive({ activeAnimationId: 'second' }));
  assert.equal(result.activeAnimationId, 'second');
  assert.equal(result.data.nm, 'Second');
  assert.deepEqual(result.animations.map((entry) => entry.id), ['first', 'second']);
});

test('falls back to the first animation when activeAnimationId is unknown', () => {
  const result = parseDotLottie(archive({ activeAnimationId: 'missing' }));
  assert.equal(result.activeAnimationId, 'first');
  assert.equal(result.data.nm, 'First');
});

test('inlines packaged images as data URLs', () => {
  const result = parseDotLottie(archive({
    activeAnimationId: 'second',
    assets: [{ id: 'image', p: 'pixel.png', u: '/images/', w: 1, h: 1 }],
  }));
  const asset = result.data.assets[0];
  assert.equal(asset.u, '');
  assert.match(asset.p, /^data:image\/png;base64,/);
});

test('detects .lottie ZIP content without relying on its filename', async () => {
  const result = await parseAnimationInput(archive(), 'download.bin');
  assert.equal(result.data.nm, 'First');
  assert.equal(result.animations.length, 2);
});

test('reports missing packaged images', () => {
  assert.throws(() => parseDotLottie(archive({
    assets: [{ p: 'missing.png', u: '/images/' }],
  })), /missingAsset/);
});

test('reports invalid ZIP and manifest data', () => {
  assert.throws(() => parseDotLottie(new Uint8Array([1, 2, 3, 4])), /invalidArchive/);
  const noManifest = zipSync({ 'animations/first.json': strToU8(JSON.stringify(animation('First'))) });
  assert.throws(() => parseDotLottie(noManifest), /invalidManifest/);
});

test('rejects unsafe animation ids in the manifest', () => {
  const input = zipSync({
    'manifest.json': strToU8(JSON.stringify({ animations: [{ id: '../secret' }] })),
  });
  assert.throws(() => parseDotLottie(input), /invalidManifest/);
});

test('enforces the compressed input size limit', async () => {
  await assert.rejects(
    parseAnimationInput(new Uint8Array(MAX_FILE_BYTES + 1), 'huge.lottie'),
    /tooLarge/,
  );
});

test('normalizes ZIP entry paths before lookup', () => {
  const input = zipSync({
    './manifest.json': strToU8(JSON.stringify({ animations: [{ id: 'first' }] })),
    './animations/first.json': strToU8(JSON.stringify(animation('Normalized'))),
  });
  assert.equal(parseDotLottie(input).data.nm, 'Normalized');
});

test('rejects duplicate animation ids', () => {
  const input = zipSync({
    'manifest.json': strToU8(JSON.stringify({ animations: [{ id: 'same' }, { id: 'same' }] })),
    'animations/same.json': strToU8(JSON.stringify(animation('Duplicate'))),
  });
  assert.throws(() => parseDotLottie(input), /invalidManifest/);
});

test('supports common image paths and skips existing data URLs', () => {
  const embedded = 'data:image/png;base64,iVBORw0KGgo=';
  const result = parseDotLottie(archive({
    activeAnimationId: 'second',
    assets: [{ p: 'pixel.png', u: '' }, { p: embedded, u: '' }],
  }));
  assert.match(result.data.assets[0].p, /^data:image\/png;base64,/);
  assert.equal(result.data.assets[1].p, embedded);
});

test('enforces per-resource and total archive expansion limits', () => {
  const largeManifest = zipSync({ 'manifest.json': new Uint8Array(32) });
  assert.throws(
    () => parseDotLottie(largeManifest, { maxResourceBytes: 10 }),
    /tooLarge/,
  );
  const largeTotal = zipSync({
    'manifest.json': new Uint8Array(8),
    'animations/a.json': new Uint8Array(32),
    'animations/b.json': new Uint8Array(32),
  });
  assert.throws(
    () => parseDotLottie(largeTotal, { maxResourceBytes: 40, maxUnpackedBytes: 48 }),
    /tooLarge/,
  );
});

test('reads a bounded streaming response', async () => {
  const response = new Response(new Uint8Array([1, 2, 3, 4]));
  const result = await readResponseArrayBuffer(response, 4);
  assert.deepEqual(new Uint8Array(result), new Uint8Array([1, 2, 3, 4]));
});

test('cancels a response as soon as streamed bytes exceed the limit', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(6));
      controller.enqueue(new Uint8Array(6));
    },
    cancel() { cancelled = true; },
  });
  await assert.rejects(readResponseArrayBuffer(new Response(stream), 10), /tooLarge/);
  assert.equal(cancelled, true);
});
