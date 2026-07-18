synthogram
==========

HTML5 Synthesizer for canvas paintings

http://www.synthogram.com

Synthogram is an experiment in synthesizing drawings on a painting canvas.

It uses the HTML5 Web Audio API, which enables sound synthesis in the browser.
Draw on the canvas and press play: each column of pixels is a step in the
sequence, each row is a note in the selected scale, and darker pixels play
louder.

Running locally
---------------

The app is built with [React](https://react.dev) and [Vite](https://vitejs.dev).

```bash
npm install
npm run dev      # start a dev server with hot reload
npm run build    # production build into dist/
npm run preview  # serve the production build
```

Project layout
--------------

- `src/engine/` — the audio engine: oscillator bank (`synth.js`), note/scale
  math (`music.js`, `frequencies.js`), canvas pixel reading (`canvasSource.js`),
  and the sequencer loop + store wiring (`useEngine.js`).
- `src/store.js` — application state (zustand), including the coupled
  volume/mute and harmony-derived oscillator rows.
- `src/paint.js` — the imperative drawing surface (strokes, undo/redo,
  live-pad painting, playhead overlay).
- `src/components/` — the React UI: paint area and toolbar, sequencer
  transport, harmony/sound side panel, sliders and knobs.

Creations are saved to `localStorage` with the Save button.

Credits
-------

- Development: [Amitay Dobo](http://www.doboism.com)
- Graphic design: Galia Kropach
- Musical consultant: [Dror Shiman](http://drorshiman.com)
- Title theme music: Ray Atencio
