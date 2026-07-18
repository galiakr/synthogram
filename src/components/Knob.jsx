import { useRef } from 'react';

const START_ANGLE = -135;
const SWEEP = 270;

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const end = polar(cx, cy, r, endDeg);
  const start = polar(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Rotary knob (replaces jquery.knob). Drag vertically to change the value.
 * `scale` maps the stored value to the displayed value, `step` snaps it.
 */
export function Knob({ value, onChange, min = 0, max = 100, step = 1, scale = 1 }) {
  const drag = useRef(null);
  const display = Math.round((value * scale) / step) * step;
  const fraction = Math.min(1, Math.max(0, (display - min) / (max - min)));

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startDisplay: display };
  };

  const onPointerMove = (e) => {
    if (!drag.current || !(e.buttons & 1)) {
      return;
    }
    const dy = drag.current.startY - e.clientY;
    let v = drag.current.startDisplay + (dy / 100) * (max - min);
    v = Math.round(v / step) * step;
    v = Math.max(min, Math.min(max, v));
    if (v !== display) {
      onChange(v / scale);
    }
  };

  return (
    <div
      className="knob"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => {
        drag.current = null;
      }}
    >
      <svg viewBox="0 0 50 50" width="50" height="50">
        <path
          d={arcPath(25, 25, 19, START_ANGLE, START_ANGLE + SWEEP)}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {fraction > 0 && (
          <path
            d={arcPath(25, 25, 19, START_ANGLE, START_ANGLE + SWEEP * fraction)}
            fill="none"
            stroke="#30dcf0"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}
        <text x="25" y="29" textAnchor="middle" fill="#fff" fontSize="11">
          {display}
        </text>
      </svg>
    </div>
  );
}
