import { useState } from 'react';
import { useStore } from '../store';
import { ButtonSet } from './ButtonSet';
import { Knob } from './Knob';

const SCALES = [
  { value: 'harmonic minor', label: 'Harmonic Minor' },
  { value: 'major', label: 'Major' },
  { value: 'major pentatonic', label: 'Major Pentatonic' },
  { value: 'minor pentatonic', label: 'Minor Pentatonic' },
  { value: 'natural minor', label: 'Natural Minor' },
  { value: 'quarter notes', label: 'Quarter Notes' }
];

const NOTE_KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((n) => ({ value: n, label: n }));
const ACCIDENTALS = [
  { value: '#', label: '#' },
  { value: 'b', label: 'b' }
];
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: n, label: String(n) }));
const NUM_OCTAVES = [1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }));
const WAVE_SHAPES = [
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'sawtooth', label: 'Sawtooth' },
  { value: 'triangle', label: 'Triangle' }
];

function HarmonyTab() {
  const s = useStore();
  const setHarmony = s.setHarmony;
  return (
    <div className="tab-content">
      <div className="box" id="musicalScale">
        <h4>Musical Scale</h4>
        <ButtonSet
          options={SCALES}
          value={s.musicalScale}
          onChange={(v) => setHarmony({ musicalScale: v })}
        />
      </div>
      <div className="sep" />
      <div className="box" id="startNote">
        <h4>Starting Note</h4>
        <ButtonSet
          options={NOTE_KEYS}
          value={s.startNoteKey}
          onChange={(v) => setHarmony({ startNoteKey: v })}
        />
        <ButtonSet
          options={ACCIDENTALS}
          value={s.startNoteAccidental}
          allowNone
          onChange={(v) => setHarmony({ startNoteAccidental: v })}
        />
      </div>
      <div className="sep" />
      <div className="box" id="startOctave">
        <h4>Starting Octave</h4>
        <ButtonSet
          options={OCTAVES}
          value={s.startOctave}
          onChange={(v) => setHarmony({ startOctave: v })}
        />
      </div>
      <div className="sep" />
      <div className="box" id="numOctaves">
        <h4>Number of octaves</h4>
        <ButtonSet
          options={NUM_OCTAVES}
          value={s.numOctaves}
          onChange={(v) => setHarmony({ numOctaves: v })}
        />
      </div>
    </div>
  );
}

function SoundTab() {
  const s = useStore();
  return (
    <div className="tab-content">
      <div className="box" id="oscillatorType">
        <h4>Wave Shape</h4>
        <ButtonSet
          options={WAVE_SHAPES}
          value={s.waveShape}
          onChange={(v) => s.set({ waveShape: v })}
        />
      </div>
      <div className="sep" />
      <div className="box" id="delay">
        <ul>
          <li>
            <span>Time</span>
            <div className="control">
              <Knob
                value={s.delayTime}
                min={0}
                max={1000}
                step={5}
                scale={1000}
                onChange={(v) => s.set({ delayTime: v })}
              />
            </div>
          </li>
          <li>
            <span>Depth</span>
            <div className="control">
              <Knob
                value={s.delayWetGain}
                min={0}
                max={100}
                scale={100}
                onChange={(v) => s.set({ delayWetGain: v })}
              />
            </div>
          </li>
          <li>
            <span>Feedback</span>
            <div className="control">
              <Knob
                value={s.delayFeedbackGain}
                min={0}
                max={100}
                scale={100}
                onChange={(v) => s.set({ delayFeedbackGain: v })}
              />
            </div>
          </li>
        </ul>
        <h4>Delay</h4>
      </div>
    </div>
  );
}

export function SidePanel() {
  const [tab, setTab] = useState('harmony');
  const hoverNote = useStore((s) => s.hoverNote);

  return (
    <div className="compSide">
      <div className="note">
        <div id="freqData">
          Note: <span id="freqName">{hoverNote ? hoverNote.name : '--'}</span> | Freq:{' '}
          <span id="freqHertz">{hoverNote ? hoverNote.frequency.toFixed(2) : '--'}</span> Hz
        </div>
      </div>
      <div className="side-tabs">
        <div
          className={`tab-label boxing harmony ${tab === 'harmony' ? 'selected' : ''}`}
          onClick={() => setTab('harmony')}
        >
          Harmony
        </div>
        <div
          className={`tab-label boxing sound ${tab === 'sound' ? 'selected' : ''}`}
          onClick={() => setTab('sound')}
        >
          Sound
        </div>
      </div>
      <div className="sidecontent">{tab === 'harmony' ? <HarmonyTab /> : <SoundTab />}</div>
    </div>
  );
}
