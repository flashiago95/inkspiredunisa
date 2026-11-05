# One UNISA: interactive pitch deck

A slide deck for the One UNISA board presentation, with a narrated tour, a cinematic globe opening and presenter tools. Everything it needs is in this folder, so it runs without internet.

## Open it

Double-click `index.html`. Chrome or Edge give the best result: the globe uses WebGL, and they have the most natural built-in voices.

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

Until the recorded voice is added, the tour uses the browser's own voice, which varies by computer. To record it with ElevenLabs:

1. Create an API key in ElevenLabs (Profile, API keys). A paid plan is needed for commercial use of the audio.
2. Optional: choose a voice. This lists the voices on your account:
   ```
   ELEVENLABS_API_KEY=your-key node tools/make-voiceover.mjs --list-voices
   ```
3. Record the tour (about 6,500 characters of ElevenLabs credit):
   ```
   ELEVENLABS_API_KEY=your-key node tools/make-voiceover.mjs --voice=VOICE_ID
   ```
   On Windows PowerShell, set the key first with `$env:ELEVENLABS_API_KEY="your-key"`.

This writes one MP3 per line into `audio/` and the word timings into `audio/timings.js`. Open the deck again: the narration uses the recording, the captions follow it word by word, and the visual cues land on the exact words.

To change the wording, edit `js/voiceover.js` and run the same command again. It re-records only the lines that changed. `voiceover-script.md` lists every line with its file name.

For music under the voice, add a licensed track as `audio/music.mp3` and run the command once more. It dips while the voice speaks.

## What is in the folder

| Path | What it is |
| --- | --- |
| `index.html` | The deck |
| `presenter.html`, `remote.html` | Presenter view and phone remote |
| `js/deck.js` | Slides, voiceover engine, transitions, presenter link |
| `js/globe.js`, `js/geo-dots.js` | The opening globe and its map dots |
| `js/voiceover.js` | The words of the narrated tour and how names are pronounced |
| `css/deck.css`, `fonts/` | Styles and the three typefaces |
| `img/` | Renders, plans, logos and presenter thumbnails |
| `audio/` | Recorded voiceover, once made |
| `tools/make-voiceover.mjs` | Records the voiceover with ElevenLabs |
| `tools/serve.mjs` | Serves the deck with the phone remote |
| `vendor/` | GSAP, three.js and a QR code library |

## Credits

Concept design and renders by Inkspired Architects. Built with GSAP (free for commercial use), three.js (MIT) and qrcode-generator (MIT). Map outlines from Natural Earth (public domain). Typefaces Archivo, IBM Plex Sans and IBM Plex Mono (SIL Open Font License). The globe's points of light are illustrative, not student locations.
