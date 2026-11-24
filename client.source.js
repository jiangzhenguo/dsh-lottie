import lottie from 'lottie-web';
import { MAX_FILE_BYTES, parseAnimationInput, readResponseArrayBuffer } from './loader.js';
import sample from './sample.json';

window.__ModuleLoader__.load({
  id: '@jiangzhenguo/dsh-lottie-player',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const ID = '@jiangzhenguo/dsh-lottie-player';
    const KIND = 'lottie-player';
    const NS = 'lottiePlayer';
    const LOAD_TIMEOUT_MS = 15000;

    const dictionaries = {
      en: {
        'guide.title': 'Lottie player',
        'guide.description': 'Preview Lottie JSON and .lottie animations',
        'type.label': 'Lottie',
        'player.sample': 'Built-in sample',
        'player.sampleAction': 'Sample',
        'player.open': 'Open file',
        'player.urlPlaceholder': 'https://example.com/animation.lottie',
        'player.loadUrl': 'Load',
        'player.loading': 'Loading animation…',
        'player.cancel': 'Cancel',
        'player.dropHint': 'Drop a Lottie JSON or .lottie file here',
        'player.animation': 'Animation in package',
        'player.dropActive': 'Release to open the animation',
        'player.play': 'Play',
        'player.pause': 'Pause',
        'player.restart': 'Restart',
        'player.loop': 'Loop',
        'player.speed': 'Playback speed',
        'player.progress': 'Playback progress',
        'player.urlLabel': 'Lottie JSON or .lottie URL',
        'error.invalid': 'This file is not a valid Lottie JSON animation.',
        'error.read': 'The animation could not be read. Check the file and try again.',
        'error.fetch': 'The URL could not be loaded. Check its address and CORS settings.',
        'error.protocol': 'Only HTTP(S) animation URLs are supported.',
        'error.invalidUrl': 'Enter a complete, valid HTTP(S) URL.',
        'error.timeout': 'Loading timed out. Try again or open a local JSON or .lottie file.',
        'error.tooLarge': 'The file exceeds the 10 MiB input or archive resource limit.',
        'error.externalAssets': 'Standalone JSON must embed external images as data URLs.',
        'error.invalidArchive': 'This .lottie file is not a readable ZIP archive.',
        'error.invalidManifest': 'The .lottie manifest or animation list is missing or invalid.',
        'error.missingAsset': 'An image referenced by the .lottie animation is missing from the package.',
        'error.dropFile': 'Drop one Lottie JSON or .lottie file.',
        'error.previous': 'The previous animation is still shown.',
        'error.render': 'Lottie could not render this animation.',
      },
      zh: {
        'guide.title': 'Lottie 播放器',
        'guide.description': '预览 Lottie JSON 和 .lottie 动画',
        'type.label': 'Lottie',
        'player.sample': '内置示例',
        'player.sampleAction': '示例',
        'player.open': '打开文件',
        'player.urlPlaceholder': 'https://example.com/animation.lottie',
        'player.loadUrl': '加载',
        'player.loading': '正在加载动画…',
        'player.cancel': '取消',
        'player.dropHint': '也可以将 Lottie JSON 或 .lottie 文件拖放到这里',
        'player.animation': '选择包内动画',
        'player.dropActive': '松开即可打开动画',
        'player.play': '播放',
        'player.pause': '暂停',
        'player.restart': '重播',
        'player.loop': '循环',
        'player.speed': '播放速度',
        'player.progress': '播放进度',
        'player.urlLabel': 'Lottie JSON 或 .lottie 地址',
        'error.invalid': '这不是有效的 Lottie JSON 动画。',
        'error.read': '无法读取动画，请检查文件后重试。',
        'error.fetch': '无法加载该地址，请检查 URL 和跨域（CORS）设置。',
        'error.protocol': '仅支持 HTTP(S) 动画地址。',
        'error.invalidUrl': '请输入完整有效的 HTTP(S) URL。',
        'error.timeout': '加载超时，请重试或打开本地 JSON / .lottie 文件。',
        'error.tooLarge': '文件超过 10 MiB 输入或压缩包资源大小限制。',
        'error.externalAssets': '独立 JSON 必须将外部图片嵌入为 data URL。',
        'error.invalidArchive': '该 .lottie 文件不是可读取的 ZIP 压缩包。',
        'error.invalidManifest': '.lottie 清单或动画列表缺失或无效。',
        'error.missingAsset': '.lottie 动画引用的图片在压缩包中缺失。',
        'error.dropFile': '请拖放一个 Lottie JSON 或 .lottie 文件。',
        'error.previous': '仍显示上一动画。',
        'error.render': 'Lottie 无法渲染该动画。',
      },
    };

    const CSS = `
      .dsh-lottie-root {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 0;
        box-sizing: border-box;
        container-type: inline-size;
        overflow: auto;
        color: var(--dsw-alias-label-primary);
        background: var(--dsw-alias-bg-base);
        font-family: inherit;
        font-size: 13px;
      }
      .dsh-lottie-root *, .dsh-lottie-root *::before, .dsh-lottie-root *::after {
        box-sizing: border-box;
      }
      .dsh-lottie-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dsh-lottie-source {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
      }
      .dsh-lottie-button, .dsh-lottie-select, .dsh-lottie-url {
        min-height: 32px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        color: var(--dsw-alias-label-primary);
        background: var(--dsw-alias-bg-layer-1);
        font: inherit;
      }
      .dsh-lottie-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 5px 10px;
        cursor: pointer;
        white-space: nowrap;
      }
      .dsh-lottie-button:hover:not(:disabled) {
        background: var(--dsw-alias-bg-layer-2);
        border-color: var(--dsw-alias-border-l2);
      }
      .dsh-lottie-button:focus-visible, .dsh-lottie-select:focus-visible,
      .dsh-lottie-url:focus-visible, .dsh-lottie-loop input:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 2px;
      }
      .dsh-lottie-button:disabled {
        cursor: default;
        opacity: 0.5;
      }
      .dsh-lottie-primary {
        color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-layer-1);
        border-color: var(--dsw-alias-brand-primary);
      }
      .dsh-lottie-primary:hover:not(:disabled) {
        color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-layer-2);
        border-color: var(--dsw-alias-brand-primary);
      }
      .dsh-lottie-url-form {
        display: flex;
        gap: 8px;
        padding: 12px 12px 0;
      }
      .dsh-lottie-url {
        flex: 1;
        min-width: 0;
        padding: 6px 10px;
      }
      .dsh-lottie-url::placeholder {
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-lottie-stage {
        position: relative;
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 240px;
        margin: 12px;
        overflow: hidden;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-layer-1);
      }
      .dsh-lottie-canvas {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        min-height: 220px;
        padding: 16px;
      }
      .dsh-lottie-canvas > div {
        width: 100% !important;
        height: 100% !important;
        max-width: 520px;
        max-height: 520px;
      }
      .dsh-lottie-drop-hint {
        padding: 0 12px 12px;
        color: var(--dsw-alias-label-secondary);
        text-align: center;
        font-size: 12px;
      }
      .dsh-lottie-drop-overlay {
        position: absolute;
        inset: 8px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed var(--dsw-alias-brand-primary);
        border-radius: 10px;
        color: var(--dsw-alias-brand-primary);
        background: var(--dsw-alias-bg-overlay);
        font-weight: 600;
        pointer-events: none;
      }
      .dsh-lottie-progress-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 12px;
      }
      .dsh-lottie-progress {
        flex: 1;
        min-width: 0;
        margin: 0;
        accent-color: var(--dsw-alias-brand-primary);
        cursor: pointer;
      }
      .dsh-lottie-progress:disabled {
        cursor: default;
        opacity: 0.5;
      }
      .dsh-lottie-progress:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 3px;
      }
      .dsh-lottie-time {
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .dsh-lottie-status {
        min-height: 20px;
        margin: 0 12px;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-lottie-error {
        color: var(--dsw-alias-state-error-primary);
      }
      .dsh-lottie-controls {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px;
      }
      .dsh-lottie-loop {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 32px;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
      }
      .dsh-lottie-loop input {
        width: 15px;
        height: 15px;
        margin: 0;
        accent-color: var(--dsw-alias-brand-primary);
      }
      .dsh-lottie-select {
        margin-left: auto;
        padding: 5px 8px;
      }
      .dsh-lottie-animation-select {
        max-width: 150px;
        margin-left: 0;
      }
      .dsh-lottie-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      @container (max-width: 420px) {
        .dsh-lottie-header, .dsh-lottie-url-form, .dsh-lottie-controls {
          padding-left: 10px;
          padding-right: 10px;
        }
        .dsh-lottie-stage {
          margin-left: 10px;
          margin-right: 10px;
        }
        .dsh-lottie-source {
          flex-basis: 100%;
        }
        .dsh-lottie-header {
          flex-wrap: wrap;
        }
        .dsh-lottie-select {
          margin-left: 0;
        }
      }
    `;

    function LottieIcon(props) {
      const size = props.size || 20;
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        'aria-hidden': true, className: props.className,
      },
      h('path', {
        d: 'M12 3.5a8.5 8.5 0 1 0 8 5.4', stroke: 'currentColor',
        strokeWidth: 1.8, strokeLinecap: 'round',
      }),
      h('path', {
        d: 'M18.5 3.5v5h-5', stroke: 'currentColor', strokeWidth: 1.8,
        strokeLinecap: 'round', strokeLinejoin: 'round',
      }),
      h('path', { d: 'm10 8 6 4-6 4V8Z', fill: 'currentColor' }));
    }

    function parseErrorKey(reason) {
      const keys = ['invalid', 'externalAssets', 'tooLarge', 'invalidArchive', 'invalidManifest', 'missingAsset'];
      return keys.includes(reason.message) ? `error.${reason.message}` : undefined;
    }

    function nameFromUrl(value) {
      try {
        const url = new URL(value);
        const segment = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
        return segment || url.hostname;
      } catch {
        return value;
      }
    }

    function formatTime(seconds) {
      const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      if (safeSeconds > 0 && safeSeconds < 1) {
        const hundredths = Math.round(safeSeconds * 100);
        return hundredths >= 100 ? '0:01' : `0:00.${String(hundredths).padStart(2, '0')}`;
      }
      const total = Math.floor(safeSeconds);
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const remainder = total % 60;
      const mm = String(minutes).padStart(hours > 0 ? 2 : 1, '0');
      const ss = String(remainder).padStart(2, '0');
      return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
    }

    function PlayerBody(props) {
      const t = props.t;
      const { tab } = props.useTabInfo();
      const containerRef = React.useRef(null);
      const fileInputRef = React.useRef(null);
      const animationRef = React.useRef(null);
      const requestRef = React.useRef(0);
      const controllerRef = React.useRef(null);
      const timeoutRef = React.useRef(null);
      const dragDepthRef = React.useRef(0);
      const [reducedMotion, setReducedMotion] = React.useState(() =>
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
      const [document, setDocument] = React.useState({ data: sample, isSample: true });
      const [playing, setPlaying] = React.useState(!reducedMotion);
      const [ready, setReady] = React.useState(false);
      const [frameInfo, setFrameInfo] = React.useState({ current: 0, total: 0, rate: 30 });
      const [loop, setLoop] = React.useState(true);
      const [speed, setSpeed] = React.useState(1);
      const [url, setUrl] = React.useState('');
      const [loading, setLoading] = React.useState(false);
      const [dragging, setDragging] = React.useState(false);
      const [error, setError] = React.useState('');
      const sourceName = document.isSample ? t('player.sample') : document.name;

      React.useEffect(() => {
        if (!containerRef.current) return undefined;
        let animation;
        setReady(false);
        try {
          animation = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay: false,
            animationData: JSON.parse(JSON.stringify(document.data)),
            rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
          });
          animationRef.current = animation;
          animation.setSpeed(speed);
          const onFrame = () => setFrameInfo({
            current: animation.currentFrame || 0,
            total: animation.totalFrames || 0,
            rate: animation.frameRate || 30,
          });
          const onComplete = () => {
            onFrame();
            setPlaying(false);
          };
          const onFailure = () => {
            setReady(false);
            setPlaying(false);
            setError(t('error.render'));
          };
          animation.addEventListener('enterFrame', onFrame);
          animation.addEventListener('complete', onComplete);
          animation.addEventListener('data_failed', onFailure);
          onFrame();
          setReady(true);
          if (playing && tab.visible) animation.play();
          return () => {
            animation.removeEventListener('enterFrame', onFrame);
            animation.removeEventListener('complete', onComplete);
            animation.removeEventListener('data_failed', onFailure);
            animation.destroy();
            if (animationRef.current === animation) animationRef.current = null;
          };
        } catch {
          setReady(false);
          setPlaying(false);
          setError(t('error.render'));
          return undefined;
        }
      }, [document]);

      React.useEffect(() => {
        const animation = animationRef.current;
        if (!animation) return;
        if (!tab.visible || !playing) animation.pause();
        else animation.play();
      }, [playing, tab.visible]);

      React.useEffect(() => {
        animationRef.current?.setSpeed(speed);
      }, [speed]);

      React.useEffect(() => {
        animationRef.current?.setLoop(loop);
      }, [loop]);

      React.useEffect(() => {
        const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!preference) return undefined;
        const onChange = (event) => {
          setReducedMotion(event.matches);
          if (event.matches) {
            animationRef.current?.pause();
            setPlaying(false);
          }
        };
        preference.addEventListener('change', onChange);
        return () => preference.removeEventListener('change', onChange);
      }, []);

      React.useEffect(() => () => {
        requestRef.current += 1;
        controllerRef.current?.abort();
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      }, []);

      const clearPending = () => {
        requestRef.current += 1;
        controllerRef.current?.abort();
        controllerRef.current = null;
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setLoading(false);
      };

      const showDocument = (result, name, isSample = false) => {
        setError('');
        setReady(false);
        setFrameInfo({ current: 0, total: 0, rate: 30 });
        setDocument({ ...result, data: result.data, name, isSample });
        setPlaying(!reducedMotion);
      };

      const fail = (key) => {
        const suffix = animationRef.current ? ` ${t('error.previous')}` : '';
        setError(`${t(key)}${suffix}`);
      };

      const errorKey = (reason, fallback) => parseErrorKey(reason) || fallback;

      const openFile = async (file) => {
        if (!file) return;
        clearPending();
        const request = ++requestRef.current;
        setLoading(true);
        setError('');
        try {
          if (file.size > MAX_FILE_BYTES) throw new Error('tooLarge');
          const buffer = await file.arrayBuffer();
          if (request !== requestRef.current) return;
          const result = await parseAnimationInput(buffer, file.name);
          if (request !== requestRef.current) return;
          showDocument(result, file.name);
        } catch (reason) {
          if (request !== requestRef.current) return;
          fail(errorKey(reason, 'error.read'));
        } finally {
          if (request === requestRef.current) setLoading(false);
        }
      };

      const loadUrl = async (event) => {
        event.preventDefault();
        const value = url.trim();
        if (!value || loading) return;
        let parsed;
        try {
          parsed = new URL(value);
        } catch {
          setError(t('error.invalidUrl'));
          return;
        }
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          setError(t('error.protocol'));
          return;
        }
        clearPending();
        const request = ++requestRef.current;
        const controller = new AbortController();
        controllerRef.current = controller;
        let timedOut = false;
        timeoutRef.current = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, LOAD_TIMEOUT_MS);
        setLoading(true);
        setError('');
        let parsing = false;
        try {
          const response = await fetch(parsed.href, { signal: controller.signal });
          if (!response.ok) throw new Error('fetch');
          const buffer = await readResponseArrayBuffer(response, MAX_FILE_BYTES);
          if (request !== requestRef.current) return;
          parsing = true;
          const result = await parseAnimationInput(buffer, nameFromUrl(parsed.href));
          if (request !== requestRef.current) return;
          showDocument(result, nameFromUrl(parsed.href));
          setUrl('');
        } catch (reason) {
          if (request !== requestRef.current) return;
          fail(timedOut ? 'error.timeout' : errorKey(reason, parsing ? 'error.read' : 'error.fetch'));
        } finally {
          if (request === requestRef.current) {
            if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            controllerRef.current = null;
            setLoading(false);
          }
        }
      };

      const togglePlayback = () => {
        const animation = animationRef.current;
        if (!animation) return;
        setError('');
        if (playing) {
          animation.pause();
          setPlaying(false);
        } else {
          if (!loop && animation.currentFrame >= animation.totalFrames - 1) animation.goToAndPlay(0, true);
          else animation.play();
          setPlaying(true);
        }
      };

      const restart = () => {
        const animation = animationRef.current;
        if (!animation) return;
        setError('');
        animation.goToAndPlay(0, true);
        setPlaying(true);
      };

      const seek = (event) => {
        const animation = animationRef.current;
        if (!animation) return;
        const lastFrame = Math.max(0, (animation.totalFrames || 0) - 1);
        const frame = Math.max(0, Math.min(Number(event.target.value), lastFrame));
        if (playing) animation.goToAndPlay(frame, true);
        else animation.goToAndStop(frame, true);
        setFrameInfo({
          current: animation.currentFrame || frame,
          total: animation.totalFrames || 0,
          rate: animation.frameRate || 30,
        });
      };

      const selectAnimation = (event) => {
        const id = event.target.value;
        setError('');
        setReady(false);
        setFrameInfo({ current: 0, total: 0, rate: 30 });
        setDocument((current) => {
          const selected = current.animations?.find((entry) => entry.id === id);
          return selected ? { ...current, data: selected.data, activeAnimationId: id } : current;
        });
        setPlaying(!reducedMotion);
      };

      const restoreSample = () => {
        clearPending();
        showDocument({ data: sample }, undefined, true);
      };

      const lastFrame = Math.max(0, frameInfo.total - 1);
      const currentFrame = Math.max(0, Math.min(frameInfo.current, lastFrame));
      const currentTime = formatTime(Math.min(frameInfo.total, currentFrame + 1) / frameInfo.rate);
      const duration = formatTime(frameInfo.total / frameInfo.rate);

      return h('section', { className: 'dsh-lottie-root', 'aria-label': t('type.label') },
        h('style', null, CSS),
        h('header', { className: 'dsh-lottie-header' },
          h('div', { className: 'dsh-lottie-source', title: sourceName }, sourceName),
          document.animations?.length > 1 ? h('select', {
            className: 'dsh-lottie-select dsh-lottie-animation-select',
            value: document.activeAnimationId,
            'aria-label': t('player.animation'),
            onChange: selectAnimation,
          }, document.animations.map((entry) => h('option', {
            key: entry.id, value: entry.id,
          }, entry.id))) : null,
          h('button', {
            type: 'button', className: 'dsh-lottie-button', onClick: restoreSample,
          }, t('player.sampleAction')),
          h('button', {
            type: 'button', className: 'dsh-lottie-button dsh-lottie-primary',
            onClick: () => fileInputRef.current?.click(),
          }, t('player.open')),
          h('input', {
            ref: fileInputRef, type: 'file', accept: '.json,.lottie,application/json,application/zip',
            style: { display: 'none' },
            onChange: (event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              void openFile(file);
            },
          })),
        h('form', { className: 'dsh-lottie-url-form', onSubmit: loadUrl },
          h('input', {
            className: 'dsh-lottie-url', type: 'url', value: url,
            'aria-label': t('player.urlLabel'), placeholder: t('player.urlPlaceholder'),
            onChange: (event) => setUrl(event.target.value), disabled: loading,
          }),
          loading ? h('button', {
            className: 'dsh-lottie-button', type: 'button', onClick: clearPending,
          }, t('player.cancel')) : h('button', {
            className: 'dsh-lottie-button', type: 'submit', disabled: !url.trim(),
          }, t('player.loadUrl'))),
        h('div', {
          className: 'dsh-lottie-stage',
          onDragEnter: (event) => {
            if (!Array.from(event.dataTransfer?.types || []).includes('Files')) return;
            event.preventDefault();
            dragDepthRef.current += 1;
            setDragging(true);
          },
          onDragOver: (event) => {
            if (!Array.from(event.dataTransfer?.types || []).includes('Files')) {
              setDragging(false);
              return;
            }
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            setDragging(true);
          },
          onDragLeave: () => {
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
            if (dragDepthRef.current === 0) setDragging(false);
          },
          onDrop: (event) => {
            event.preventDefault();
            dragDepthRef.current = 0;
            setDragging(false);
            const files = Array.from(event.dataTransfer?.files || []);
            if (files.length !== 1) {
              fail('error.dropFile');
              return;
            }
            void openFile(files[0]);
          },
        },
        h('div', {
          ref: containerRef, className: 'dsh-lottie-canvas', role: 'img',
          'aria-label': sourceName,
        }),
        h('div', { className: 'dsh-lottie-drop-hint' }, t('player.dropHint')),
        dragging ? h('div', { className: 'dsh-lottie-drop-overlay' }, t('player.dropActive')) : null),
        h('div', { className: 'dsh-lottie-progress-row' },
          h('input', {
            className: 'dsh-lottie-progress', type: 'range', min: 0,
            max: lastFrame, step: 1, value: currentFrame,
            'aria-label': t('player.progress'),
            'aria-valuetext': `${currentTime} / ${duration}`,
            onChange: seek, disabled: !ready || frameInfo.total <= 0,
          }),
          h('span', { className: 'dsh-lottie-time' }, `${currentTime} / ${duration}`)),
        h('div', {
          className: 'dsh-lottie-status', 'aria-live': 'polite',
        }, loading ? t('player.loading') : null),
        error ? h('div', {
          className: 'dsh-lottie-status dsh-lottie-error', role: 'alert',
        }, error) : null,
        h('footer', { className: 'dsh-lottie-controls' },
          h('button', {
            type: 'button', className: 'dsh-lottie-button dsh-lottie-primary',
            onClick: togglePlayback, disabled: !ready,
          }, playing ? t('player.pause') : t('player.play')),
          h('button', {
            type: 'button', className: 'dsh-lottie-button', onClick: restart, disabled: !ready,
          }, t('player.restart')),
          h('label', { className: 'dsh-lottie-loop' },
            h('input', {
              type: 'checkbox', checked: loop,
              onChange: (event) => setLoop(event.target.checked),
            }), t('player.loop')),
          h('select', {
            className: 'dsh-lottie-select', value: speed,
            'aria-label': t('player.speed'),
            onChange: (event) => setSpeed(Number(event.target.value)),
          }, [0.5, 0.75, 1, 1.5, 2].map((value) => h('option', {
            key: value, value,
          }, `${value}×`)))));
    }

    function PlayerTitle(props) {
      const { tab } = props.useTabInfo();
      return h('span', { className: 'dsh-lottie-title' }, h(LottieIcon, { size: 16 }), tab.title);
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);
        const body = (props) => h(PlayerBody, { ...props, t });
        ctx.effect(() => ctx.locale.register(NS, dictionaries), 'lottie-player: dictionaries');
        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: ID,
          kind: KIND,
          priority: 'extension',
          keepMounted: true,
          title: () => t('type.label'),
          guide: [{
            id: 'player',
            order: 60,
            title: () => t('guide.title'),
            description: () => t('guide.description'),
            icon: LottieIcon,
          }],
        }), 'lottie-player: tab type');
        ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab', key: ID, locale: NS,
        }, body)), 'lottie-player: body');
        ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab.title', key: ID, locale: NS,
        }, PlayerTitle)), 'lottie-player: title');
      },
    };
  },
});
