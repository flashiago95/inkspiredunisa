# UNISA Global: interactive pitch deck

A slide deck for the UNISA Global board presentation, with a recorded narrated tour, a cinematic globe opening and presenter tools. Everything it needs is in this folder, so it runs without internet.

## Open it

Double-click `index.html`. Chrome or Edge give the best result: the globe uses WebGL.

Move with the arrow keys, a presentation clicker, the scroll wheel or trackpad, a swipe on a tablet, or the arrows in the bottom bar.

| Key | Does |
| --- | --- |
| → ← (or clicker) | Next and previous step. While the voiceover plays, skips a line. |
| Space | Play or pause the voiceover |
| P | Open the presenter view |
| B or . | Black screen (most clickers have a button for this) |
| F | Full screen |
| C | Captions on or off |
| N | Notes on this screen |
| Home, End, G | Start, the ask, the gallery |

## Presenting with two screens

1. Open `index.html` on the laptop and press **Present** (or P). A presenter view opens in a second window, with your notes, the next slide, a timer and voiceover controls.
2. Drag the deck window to the projector and press F there for full screen. Keep the presenter view on the laptop.

Both windows stay in sync. Clicks in the presenter view drive the deck.

### Phone as a remote (optional)

If the laptop has Node.js 18 or newer:

```
node tools/serve.mjs
```

Open the address it prints (http://localhost:8080) instead of double-clicking `index.html`, then press Present. The presenter view shows a QR code: scan it with a phone on the same Wi-Fi to change slides, pause the voice and black the screen. Only that QR code's private link can send commands.

## The voiceover

Press play on the cover or in the bottom bar. The tour plays the eleven recorded sections in `vo/`, about four minutes in all, and moves through the slides by itself, ending on the ask. Captions follow the voice word by word, and highlights land on the words they belong to. Pause at any time; play carries on from the same word.

`js/voiceover.js` holds each recording's timing table (every line's start and end time and its words) and which slide each line plays on. `voiceover-script.md` lists the same lines by slide, for reading. If a section is re-recorded, update its times there so the captions and cues stay in step. If an MP3 is missing, that part of the tour runs on timed captions instead.

## What is in the folder

| Path | What it is |
| --- | --- |
| `index.html` | The deck |
| `presenter.html`, `remote.html` | Presenter view and phone remote |
| `js/deck.js` | Slides, voiceover engine, transitions, presenter link |
| `js/globe.js`, `js/geo-dots.js` | The opening globe and its map dots |
| `js/netmap.js`, `js/netmap-data.js` | The network map of the three sites |
| `js/live.js` | Depth motion for the renders (switched off, see `LIVE_ON` in `js/deck.js`) |
| `js/voiceover.js` | Timing table of the recorded voiceover |
| `css/deck.css`, `fonts/` | Styles and the three typefaces |
| `img/` | Renders, plans, 3D views, material boards, logos and presenter thumbnails |
| `img/depth/` | Depth maps for the depth motion (unused while it is off) |
| `vid/` | Short films shown in the site viewer |
| `vo/` | The recorded voiceover, one MP3 per section |
| `tools/serve.mjs` | Serves the deck with the phone remote |
| `vendor/` | GSAP, three.js and a QR code library |

## Credits

Concept design and renders by Inkspired Architects. Built with GSAP (free for commercial use), three.js (MIT) and qrcode-generator (MIT). Map outlines from Natural Earth (public domain). Typefaces Archivo, IBM Plex Sans and IBM Plex Mono (SIL Open Font License). The globe's points of light are illustrative, not student locations.
