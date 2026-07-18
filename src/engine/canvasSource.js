/**
 * Read one column of the paint canvas as amplitudes, one per oscillator row
 * (index 0 = top). Amplitude is darkness weighted by alpha, like the original:
 * a black opaque pixel is 1, white or transparent is 0.
 */
export function readStep(ctx, stepIndex, canvasHeight, numOscillators) {
  const data = ctx.getImageData(stepIndex, 0, 1, canvasHeight).data;
  const heightScale = canvasHeight / numOscillators;

  const step = [];
  for (let y = 0; y < numOscillators; y++) {
    let scaledY = Math.floor(y * heightScale);
    const scaledYEnd = Math.floor((y + 1) * heightScale);
    const pixelsToSum = scaledYEnd - scaledY;
    let ampSum = 0;
    while (scaledY < scaledYEnd) {
      const red = data[scaledY * 4];
      const green = data[scaledY * 4 + 1];
      const blue = data[scaledY * 4 + 2];
      const alpha = data[scaledY * 4 + 3];

      if (alpha !== 0) {
        ampSum += (255 - (red + green + blue) / 3) * (alpha / 255);
      }
      scaledY++;
    }
    step.push(ampSum / pixelsToSum / 255);
  }

  return step;
}

export function getOscillatorForY(y, canvasHeight, numOscillators) {
  const index = Math.floor(y / (canvasHeight / numOscillators));
  return Math.min(Math.max(index, 0), numOscillators - 1);
}
