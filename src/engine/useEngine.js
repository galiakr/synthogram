import { useEffect } from 'react';
import { useStore, NUM_STEPS, CANVAS_HEIGHT } from '../store';
import { Synth } from './synth';
import { readStep } from './canvasSource';
import { paint } from '../paint';

/**
 * Creates the synth and runs the sequencer loop for the lifetime of the app,
 * keeping the audio graph in sync with the store (replaces the old
 * controller/sequencer/model change-listener wiring).
 */
export function useEngine(enabled) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const store = useStore;
    const state = store.getState();
    const synth = new Synth(state);
    synth.rebuild(state.rows);

    const unsubscribers = [
      store.subscribe((s) => s.rows, (rows) => synth.rebuild(rows)),
      store.subscribe((s) => s.waveShape, (shape) => synth.setWaveShape(shape)),
      store.subscribe((s) => s.volume, (volume) => synth.setVolume(volume)),
      store.subscribe((s) => s.delayTime, (v) => synth.setDelayTime(v)),
      store.subscribe((s) => s.delayFeedbackGain, (v) => synth.setDelayFeedbackGain(v)),
      store.subscribe((s) => s.delayWetGain, (v) => synth.setDelayWetGain(v)),
      store.subscribe((s) => s.isSynthPlaying, (playing) => synth.setPlaying(playing))
    ];

    let timer = null;
    let stopped = false;

    function tick() {
      if (stopped) {
        return;
      }
      const s = store.getState();
      let step = s.currentStep;
      if (s.isPlaying) {
        step = (step + 1) % NUM_STEPS;
      }

      if (paint.ctx) {
        synth.play(readStep(paint.ctx, step, CANVAS_HEIGHT, s.rows.length));
        paint.drawPlayhead(step);
      }
      if (step !== s.currentStep) {
        s.setCurrentStep(step);
      }

      timer = setTimeout(tick, 1000 / s.stepsPerSecond);
    }

    tick();

    return () => {
      stopped = true;
      clearTimeout(timer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      synth.dispose();
    };
  }, [enabled]);
}
