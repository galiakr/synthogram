const GAIN_THRESHOLD = 0.001;

// from http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/
function createSlapbackDelay(context) {
  const input = context.createGain();
  const output = context.createGain();
  const delay = context.createDelay();
  const feedback = context.createGain();
  const wetLevel = context.createGain();

  input.connect(delay);
  input.connect(output);
  delay.connect(feedback);
  delay.connect(wetLevel);
  feedback.connect(delay);
  wetLevel.connect(output);

  return { input, output, delay, feedback, wetLevel };
}

/**
 * A bank of always-running oscillators, one per canvas row (index 0 = top =
 * highest pitch). Sound is shaped by setting each oscillator's gain per step.
 */
export class Synth {
  constructor({ volume, delayTime, delayFeedbackGain, delayWetGain, waveShape }) {
    if (typeof window.AudioContext === 'undefined') {
      throw new Error('Web Audio not supported (could not create audio context)');
    }
    this.context = new window.AudioContext();
    this.oscillators = [];
    this.volume = volume;
    this.waveShape = waveShape;
    this.playing = false;

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.context.destination);

    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.connect(this.masterGain);

    this.delayNode = createSlapbackDelay(this.context);
    this.delayNode.delay.delayTime.value = delayTime;
    this.delayNode.feedback.gain.value = delayFeedbackGain;
    this.delayNode.wetLevel.gain.value = delayWetGain;
    this.delayNode.output.connect(this.compressor);

    this.input = this.delayNode.input;
  }

  setDelayTime(value) {
    this.delayNode.delay.delayTime.value = value;
  }

  setDelayFeedbackGain(value) {
    this.delayNode.feedback.gain.value = value;
  }

  setDelayWetGain(value) {
    this.delayNode.wetLevel.gain.value = value;
  }

  setVolume(value) {
    this.volume = value;
    if (this.playing) {
      this.masterGain.gain.value = value;
    }
  }

  setWaveShape(shape) {
    this.waveShape = shape;
    for (const { oscillator } of this.oscillators) {
      oscillator.type = shape;
    }
  }

  setPlaying(playing) {
    this.playing = playing;
    if (playing) {
      // Browsers keep the context suspended until a user gesture; this is
      // called synchronously from click/pointer handlers, so resume works.
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
      this.masterGain.gain.value = this.volume;
    } else {
      this.masterGain.gain.value = 0;
    }
  }

  /** rows: [{value, name}] top-down; rebuilds the oscillator bank */
  rebuild(rows) {
    for (const { oscillator, gainNode } of this.oscillators) {
      gainNode.disconnect();
      oscillator.disconnect();
    }
    this.oscillators = rows.map((row) => {
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();
      oscillator.type = this.waveShape;
      oscillator.frequency.value = row.value;
      gainNode.gain.value = 0;
      oscillator.connect(gainNode);
      gainNode.connect(this.input);
      oscillator.start(0);
      return { oscillator, gainNode, frequency: row.value, name: row.name };
    });
  }

  /** step: array of amplitudes 0..1, one per oscillator (top-down) */
  play(step) {
    for (let i = 0; i < this.oscillators.length; i++) {
      // TODO: better gain normalization (perhaps based on the number of active oscillators?)
      const normalizedGain = (step[i] || 0) * 0.1;
      const gain = this.oscillators[i].gainNode.gain;
      if (Math.abs(gain.value - normalizedGain) > GAIN_THRESHOLD) {
        gain.value = normalizedGain;
      }
    }
  }

  dispose() {
    this.context.close();
  }
}
