import { useStore, NUM_STEPS } from '../store';
import { Slider } from './Slider';

/** Transport: position, play/hold buttons, speed and volume. */
export function SequencerControls() {
  const currentStep = useStore((s) => s.currentStep);
  const isPlaying = useStore((s) => s.isPlaying);
  const isSynthPlaying = useStore((s) => s.isSynthPlaying);
  const isMuted = useStore((s) => s.isMuted);
  const stepsPerSecond = useStore((s) => s.stepsPerSecond);
  const volume = useStore((s) => s.volume);
  const store = useStore.getState();

  return (
    <div id="sequencer" className="componenet">
      <div id="progress">
        <span className="current-position">
          {currentStep} / {NUM_STEPS}
        </span>
        <Slider
          value={currentStep}
          min={0}
          max={NUM_STEPS - 1}
          balloon={false}
          onChange={(v) => store.setCurrentStep(v)}
        />
      </div>
      <div className="media-controls">
        <div className="media-buttons">
          <div
            className={`button buttonShadow ${isSynthPlaying ? 'stop' : 'play'}`}
            title={isSynthPlaying ? 'Stop' : 'Play'}
            onClick={() => store.togglePlay()}
          >
            <a />
          </div>
          <div
            className={`button hold buttonShadow ${isPlaying ? '' : 'selected'}`}
            title="Hold Tune"
            onClick={() => store.set({ isPlaying: !useStore.getState().isPlaying })}
          >
            <a />
          </div>
        </div>
      </div>
      <div className="play-controls">
        <div id="speed">
          <label>Speed</label>
          <Slider
            value={stepsPerSecond}
            min={1}
            max={120}
            onChange={(v) => store.set({ stepsPerSecond: v })}
          />
        </div>
        <div id="volume" className="volume-controls">
          <div className="media-buttons">
            <div
              className={`button volume ${isMuted ? 'mute' : 'volume-on'}`}
              title="Mute"
              onClick={() => store.toggleMute()}
            >
              <a />
            </div>
          </div>
          <Slider value={volume} min={0} max={100} scale={100} onChange={(v) => store.setVolume(v)} />
        </div>
      </div>
    </div>
  );
}
