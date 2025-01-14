# canvas-record

[![npm version](https://img.shields.io/npm/v/canvas-record)](https://www.npmjs.com/package/canvas-record)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://www.npmjs.com/package/canvas-record)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/canvas-record)](https://bundlephobia.com/package/canvas-record)
[![dependencies](https://img.shields.io/librariesio/release/npm/canvas-record)](https://github.com/dmnsgn/canvas-record/blob/main/package.json)
[![types](https://img.shields.io/npm/types/canvas-record)](https://github.com/microsoft/TypeScript)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673.svg)](https://conventionalcommits.org)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://github.com/prettier/prettier)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://github.com/eslint/eslint)
[![license](https://img.shields.io/github/license/dmnsgn/canvas-record)](https://github.com/dmnsgn/canvas-record/blob/main/LICENSE.md)

Record a video in the browser or directly on the File System from a canvas (2D/WebGL/WebGPU) as MP4, WebM, MKV, GIF, PNG/JPG Sequence using WebCodecs and Wasm when available.

[![paypal](https://img.shields.io/badge/donate-paypal-informational?logo=paypal)](https://paypal.me/dmnsgn)
[![coinbase](https://img.shields.io/badge/donate-coinbase-informational?logo=coinbase)](https://commerce.coinbase.com/checkout/56cbdf28-e323-48d8-9c98-7019e72c97f3)
[![twitter](https://img.shields.io/twitter/follow/dmnsgn?style=social)](https://twitter.com/dmnsgn)

![](https://raw.githubusercontent.com/dmnsgn/canvas-record/main/screenshot.gif)

## Installation

```bash
npm install canvas-record
```

## Usage

```js
import { Recorder, RecorderStatus, Encoders } from "canvas-record";
import createCanvasContext from "canvas-context";
import { AVC } from "media-codecs";

// Setup
const pixelRatio = devicePixelRatio;
const width = 512;
const height = 512;
const { context, canvas } = createCanvasContext("2d", {
  width: width * pixelRatio,
  height: height * pixelRatio,
  contextAttributes: { willReadFrequently: true },
});
Object.assign(canvas.style, { width: `${width}px`, height: `${height}px` });

const mainElement = document.querySelector("main");
mainElement.appendChild(canvas);

// Animation
let canvasRecorder;

function render() {
  const width = canvas.width;
  const height = canvas.height;

  const t = canvasRecorder.frame / canvasRecorder.frameTotal || Number.EPSILON;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "red";
  context.fillRect(0, 0, t * width, height);
}

const tick = async () => {
  render();

  if (canvasRecorder.status !== RecorderStatus.Recording) return;
  await canvasRecorder.step();

  if (canvasRecorder.status !== RecorderStatus.Stopped) {
    requestAnimationFrame(() => tick());
  }
};

canvasRecorder = new Recorder(context, {
  name: "canvas-record-example",
  encoderOptions: {
    codec: AVC.getCodec({ profile: "Main", level: "5.2" }),
  },
});

// Start and encode frame 0
await canvasRecorder.start();

// Animate to encode the rest
tick(canvasRecorder);
```

## API

Encoder comparison:

| Encoder        | Extension              | Required Web API   | WASM                  | Speed    |
| -------------- | ---------------------- | ------------------ | --------------------- | -------- |
| `WebCodecs`    | `mp4` / `webm` / `mkv` | WebCodecs          | ❌                    | Fast     |
| `MP4Wasm`      | `mp4`                  | WebCodecs          | ✅ (embed)            | Fast     |
| `H264MP4`      | `mp4`                  |                    | ✅ (embed)            | Medium   |
| `FFmpeg`       | `mp4` / `webm`         | SharedArrayBuffer  | ✅ (need binary path) | Slow     |
| `GIF`          | `gif`                  | WebWorkers (wip)   | ❌                    | Fast     |
| `Frame`        | `png` / `jpg`          | File System Access | ❌                    | Fast     |
| `MediaCapture` | `mkv` / `webm`         | MediaStream        | ❌                    | Realtime |

Note:

- `WebCodecs` encoderOptions allow different codecs to be used: VP8/VP9/AV1/HEVC. See [media-codecs](https://github.com/dmnsgn/media-codecs) to get a codec string from human readable options and check which ones are supported in your browser with [github.io/media-codecs](https://dmnsgn.github.io/media-codecs/).
- `WebCodecs` 5-10x faster than H264MP4Encoder and 20x faster than `FFmpeg` (it needs to mux files after writing png to virtual FS)
- `FFmpeg` (mp4 and webm) and `WebCodecs` (mp4) have a AVC maximum frame size of 9437184 pixels. That's fine until a bit more than 4K 16:9 @ 30fps. So if you need 4K Square or 8K exports, be patient with `H264MP4Encoder` (which probably also has the 4GB memory limit) or use Frame encoder and mux them manually with `FFmpeg` CLI (`ffmpeg -framerate 30 -i "%05d.jpg" -b:v 60M -r 30 -profile:v baseline -pix_fmt yuv420p -movflags +faststart output.mp4`)
- `MP4Wasm` is embedded from [mp4-wasm](https://github.com/mattdesl/mp4-wasm/) for ease of use (`FFmpeg` will require `encoderOptions.corePath`)

Roadmap:

- [ ] add debug logging
- [ ] use WebWorkers for gifenc

<!-- api-start -->

## Modules

<dl>
<dt><a href="#module_index">index</a></dt>
<dd><p>Re-export Recorder, RecorderStatus, all Encoders and utils.</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Recorder">Recorder</a></dt>
<dd><p>Base Recorder class.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#onStatusChangeCb">onStatusChangeCb(RecorderStatus)</a></dt>
<dd><p>A callback to notify on the status change. To compare with RecorderStatus enum values.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#RecorderOptions">RecorderOptions</a> : <code>object</code></dt>
<dd><p>Options for recording. All optional.</p>
</dd>
<dt><a href="#RecorderStartOptions">RecorderStartOptions</a> : <code>object</code></dt>
<dd><p>Options for recording. All optional.</p>
</dd>
</dl>

<a name="module_index"></a>

## index

Re-export Recorder, RecorderStatus, all Encoders and utils.

<a name="Recorder"></a>

## Recorder

Base Recorder class.

**Kind**: global class
**Properties**

| Name      | Type                 | Default           | Description                                     |
| --------- | -------------------- | ----------------- | ----------------------------------------------- |
| [enabled] | <code>boolean</code> | <code>true</code> | Enable/disable pointer interaction and drawing. |

- [Recorder](#Recorder)
  - [new Recorder(context, options)](#new_Recorder_new)
  - [.start(startOptions)](#Recorder+start)
  - [.step()](#Recorder+step)
  - [.stop()](#Recorder+stop) ⇒ <code>ArrayBuffer</code> \| <code>Uint8Array</code> \| <code>Array.&lt;Blob&gt;</code> \| <code>undefined</code>
  - [.dispose()](#Recorder+dispose)

<a name="new_Recorder_new"></a>

### new Recorder(context, options)

| Param   | Type                                             |
| ------- | ------------------------------------------------ |
| context | <code>RenderingContext</code>                    |
| options | [<code>RecorderOptions</code>](#RecorderOptions) |

<a name="Recorder+start"></a>

### recorder.start(startOptions)

Start the recording by initializing and optionally calling the initial step.

**Kind**: instance method of [<code>Recorder</code>](#Recorder)

| Param        | Type                                                       |
| ------------ | ---------------------------------------------------------- |
| startOptions | [<code>RecorderStartOptions</code>](#RecorderStartOptions) |

<a name="Recorder+step"></a>

### recorder.step()

Encode a frame and increment the time and the playhead.
Calls `await canvasRecorder.stop()` when duration is reached.

**Kind**: instance method of [<code>Recorder</code>](#Recorder)
<a name="Recorder+stop"></a>

### recorder.stop() ⇒ <code>ArrayBuffer</code> \| <code>Uint8Array</code> \| <code>Array.&lt;Blob&gt;</code> \| <code>undefined</code>

Stop the recording and return the recorded buffer.
If options.download is set, automatically start downloading the resulting file.
Is called when duration is reached or manually.

**Kind**: instance method of [<code>Recorder</code>](#Recorder)
<a name="Recorder+dispose"></a>

### recorder.dispose()

Clean up

**Kind**: instance method of [<code>Recorder</code>](#Recorder)
<a name="RecorderStatus"></a>

## RecorderStatus : <code>enum</code>

Enum for recorder status

**Kind**: global enum
**Read only**: true
**Example**

```js
// Check recorder status before continuing
if (canvasRecorder.status !== RecorderStatus.Stopped) {
  rAFId = requestAnimationFrame(() => tick());
}
```

<a name="onStatusChangeCb"></a>

## onStatusChangeCb(RecorderStatus)

A callback to notify on the status change. To compare with RecorderStatus enum values.

**Kind**: global function

| Param          | Type                | Description |
| -------------- | ------------------- | ----------- |
| RecorderStatus | <code>number</code> | the status  |

<a name="RecorderOptions"></a>

## RecorderOptions : <code>object</code>

Options for recording. All optional.

**Kind**: global typedef
**Properties**

| Name             | Type                                               | Default                                           | Description                                                                                                             |
| ---------------- | -------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [name]           | <code>string</code>                                | <code>&quot;\&quot;\&quot;&quot;</code>           | A name for the recorder, used as prefix for the default file name.                                                      |
| [duration]       | <code>number</code>                                | <code>10</code>                                   | The recording duration in seconds. If set to Infinity, `await canvasRecorder.stop()` needs to be called manually.       |
| [frameRate]      | <code>number</code>                                | <code>30</code>                                   | The frame rate in frame per seconds. Use `await canvasRecorder.step();` to go to the next frame.                        |
| [download]       | <code>boolean</code>                               | <code>true</code>                                 | Automatically download the recording when duration is reached or when `await canvasRecorder.stop()` is manually called. |
| [extension]      | <code>boolean</code>                               | <code>&quot;mp4&quot;</code>                      | Default file extension: infers which Encoder is selected.                                                               |
| [target]         | <code>string</code>                                | <code>&quot;\&quot;in-browser\&quot;&quot;</code> | Default writing target: in-browser or file-system when available.                                                       |
| [encoder]        | <code>object</code>                                |                                                   | A specific encoder. Default encoder based on options.extension: GIF > WebCodecs > H264MP4.                              |
| [encoderOptions] | <code>object</code>                                |                                                   | See `src/encoders` or individual packages for a list of options.                                                        |
| [muxerOptions]   | <code>object</code>                                |                                                   | See "mp4-muxer" and "webm-muxer" for a list of options.                                                                 |
| [onStatusChange] | [<code>onStatusChangeCb</code>](#onStatusChangeCb) |                                                   |                                                                                                                         |

<a name="RecorderStartOptions"></a>

## RecorderStartOptions : <code>object</code>

Options for recording. All optional.

**Kind**: global typedef
**Properties**

| Name       | Type                 | Description                                                                   |
| ---------- | -------------------- | ----------------------------------------------------------------------------- |
| [filename] | <code>string</code>  | Overwrite the file name completely.                                           |
| [initOnly] | <code>boolean</code> | Only initialised the recorder and don't call the first await recorder.step(). |

<!-- api-end -->

## License

All MIT:

- [mp4-wasm](https://github.com/mattdesl/mp4-wasm/blob/master/LICENSE.md)
- [h264-mp4-encoder](https://github.com/TrevorSundberg/h264-mp4-encoder/blob/master/LICENSE.md)
- [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/LICENSE)
- [gifenc](https://github.com/mattdesl/gifenc/blob/master/LICENSE.md)
- [webm-muxer](https://github.com/Vanilagy/webm-muxer/blob/main/LICENSE)
- [mp4-muxer](https://github.com/Vanilagy/mp4-muxer/blob/main/LICENSE)

MIT. See [license file](https://github.com/dmnsgn/canvas-record/blob/main/LICENSE.md).
