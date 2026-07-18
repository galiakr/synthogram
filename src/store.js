import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getRows } from './engine/frequencies';

export const CANVAS_WIDTH = 384;
export const CANVAS_HEIGHT = 240;
export const NUM_STEPS = CANVAS_WIDTH;

export const SETTINGS_KEYS = [
  'stepsPerSecond',
  'volume',
  'delayTime',
  'delayFeedbackGain',
  'delayWetGain',
  'startNoteKey',
  'startNoteAccidental',
  'startOctave',
  'musicalScale',
  'numOctaves',
  'waveShape'
];

const HARMONY_KEYS = ['startNoteKey', 'startNoteAccidental', 'startOctave', 'musicalScale', 'numOctaves'];

const defaults = {
  stepsPerSecond: 40,
  volume: 0.5,
  delayTime: 0.125,
  delayFeedbackGain: 0.25,
  delayWetGain: 0.3,
  startNoteKey: 'C',
  startNoteAccidental: '',
  startOctave: 4,
  musicalScale: 'major',
  numOctaves: 2,
  waveShape: 'sine',
  isPlaying: false,
  isSynthPlaying: false,
  isMuted: false,
  currentStep: 0,
  // paint tool state
  tool: 'pencil',
  strokeColor: '#000000',
  lineWidth: 4,
  // {name, frequency} for the row under the mouse, or null
  hoverNote: null
};

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    ...defaults,
    // Oscillator rows, top-down (row 0 = highest pitch). Derived from harmony settings.
    rows: getRows(defaults),
    unMuteVolume: defaults.volume,

    set,

    setHarmony(patch) {
      const merged = { ...get(), ...patch };
      set({ ...patch, rows: getRows(merged) });
    },

    setVolume(volume) {
      set({
        volume,
        isMuted: volume === 0,
        ...(volume > 0 ? { unMuteVolume: volume } : {})
      });
    },

    toggleMute() {
      const { isMuted, volume, unMuteVolume } = get();
      if (isMuted) {
        set({ isMuted: false, volume: unMuteVolume });
      } else {
        set({
          isMuted: true,
          volume: 0,
          ...(volume > 0 ? { unMuteVolume: volume } : {})
        });
      }
    },

    // Playing the synth also starts the sequencer (like the original model).
    setSynthPlaying(isSynthPlaying) {
      set({ isSynthPlaying, isPlaying: isSynthPlaying });
    },

    togglePlay() {
      get().setSynthPlaying(!get().isSynthPlaying);
    },

    setCurrentStep(currentStep) {
      set({ currentStep });
    },

    applySettings(settings) {
      const known = {};
      for (const key of SETTINGS_KEYS) {
        if (settings && key in settings) {
          known[key] = settings[key];
        }
      }
      const harmony = {};
      for (const key of HARMONY_KEYS) {
        if (key in known) {
          harmony[key] = known[key];
        }
      }
      set(known);
      get().setHarmony(harmony);
      if ('volume' in known) {
        get().setVolume(known.volume);
      }
    },

    getSettings() {
      const state = get();
      const settings = {};
      for (const key of SETTINGS_KEYS) {
        settings[key] = state[key];
      }
      return settings;
    }
  }))
);
