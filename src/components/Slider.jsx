import { useRef } from 'react';

/**
 * Horizontal slider. `scale` maps between the stored value and the displayed
 * integer value (e.g. volume 0..1 shown as 0..100), like the original sgSlider.
 */
export function Slider({ value, min = 0, max, scale = 1, onChange, balloon = true }) {
  const ref = useRef(null);
  const display = Math.floor(value * scale);
  const pct = Math.min(100, Math.max(0, ((display - min) / (max - min)) * 100));

  const update = (e) => {
    const rect = ref.current.getBoundingClientRect();
    let v = ((e.clientX - rect.left) / rect.width) * (max - min) + min;
    v = Math.max(min, Math.min(max, v));
    onChange(Math.floor(v) / scale);
  };

  return (
    <div
      className="horizontal-slider"
      ref={ref}
      onPointerDown={(e) => {
        ref.current.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons & 1) {
          update(e);
        }
      }}
    >
      <div className="fill" style={{ width: pct + '%' }} />
      <div className="slider-handle" style={{ left: `calc(${pct}% - 7px)` }}>
        {balloon && <span className="balloon">{display}</span>}
      </div>
    </div>
  );
}
