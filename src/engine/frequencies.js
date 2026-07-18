import { Note } from './music';

// http://www.phy.mtu.edu/~suits/NoteFreqCalcs.html
function getFrequency(n, startFrequency) {
  return startFrequency * Math.pow(Math.pow(2, 1 / 12.0), n);
}

/**
 * Build the list of oscillator frequencies for the given harmony settings,
 * ordered top-down as displayed on the canvas (row 0 = top = highest pitch).
 */
export function getRows({ startNoteKey, startNoteAccidental, startOctave, musicalScale, numOctaves }) {
  const startNote = startNoteKey + startNoteAccidental;
  const frequencies = [];
  for (let octave = startOctave; octave < startOctave + numOctaves; octave++) {
    const n = Note.fromLatin(startNote + octave);
    if (musicalScale === 'quarter notes') {
      for (let quarterIndex = 0; quarterIndex < 12; quarterIndex++) {
        frequencies.push({
          value: getFrequency(quarterIndex, n.frequency()),
          name: n.latin() + octave + '_' + (quarterIndex + 1)
        });
      }
    } else {
      const scale = n.scale(musicalScale);
      for (let noteIndex = 0; noteIndex < scale.length - 1; noteIndex++) {
        frequencies.push({
          value: scale[noteIndex].frequency(),
          name: scale[noteIndex].latin() + octave
        });
      }
    }
  }

  return frequencies.reverse();
}
