import { useEffect, useRef } from 'react';
import { useStore, CANVAS_WIDTH, CANVAS_HEIGHT } from '../store';
import { paint } from '../paint';
import { getOscillatorForY } from '../engine/canvasSource';

const LIVE_PAD_WIDTH = 95;

function drawGrid(canvas, xStep, yStep) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  if (xStep) {
    for (let x = 0; x < width; x += xStep) {
      ctx.fillRect(x, 0, 1, height);
    }
  }
  for (let y = 0; y < height; y += yStep) {
    ctx.fillRect(0, Math.floor(y), width, 1);
  }
}

function drawGridLabels(canvas, rows) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '9px Calibri, sans-serif';
  const yStep = canvas.height / rows.length;
  rows.forEach((row, i) => {
    ctx.fillText(row.name, 2, (i + 0.5) * yStep + 3);
  });
}

/**
 * The sonogram surface: live pad, note labels and the paint canvas stack
 * (paint layer, playhead overlay, grid overlay).
 */
export function PaintArea() {
  const rows = useStore((s) => s.rows);
  const set = useStore((s) => s.set);

  const containerRef = useRef(null);
  const paintCanvasRef = useRef(null);
  const overlayRef = useRef(null);
  const overlayGridRef = useRef(null);
  const livePadGridRef = useRef(null);
  const labelsRef = useRef(null);
  const cursorRef = useRef(null);
  const liveState = useRef(null);
  const liveTimer = useRef(null);

  useEffect(() => {
    paint.register(paintCanvasRef.current, overlayRef.current);
  }, []);

  useEffect(() => {
    const yStep = CANVAS_HEIGHT / rows.length;
    drawGrid(overlayGridRef.current, 8, yStep);
    drawGrid(livePadGridRef.current, 0, yStep);
    drawGridLabels(labelsRef.current, rows);
  }, [rows]);

  const localPos = (e, el) => {
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const updateHover = (y) => {
    const row = rows[getOscillatorForY(y, CANVAS_HEIGHT, rows.length)];
    set({ hoverNote: row ? { name: row.name, frequency: row.value } : null });
  };

  // --- paint canvas drawing ---

  const onPaintDown = (e) => {
    const { x, y } = localPos(e, containerRef.current);
    containerRef.current.setPointerCapture(e.pointerId);
    const { tool, strokeColor, lineWidth } = useStore.getState();
    paint.strokeBegin(x, y, { tool, color: strokeColor, width: lineWidth });
  };

  const onPaintMove = (e) => {
    const { x, y } = localPos(e, containerRef.current);
    if (e.buttons & 1) {
      paint.strokeMove(x, y);
    }
    updateHover(y);
  };

  // --- live pad: paints at the playhead while it advances ---

  const livePadSize = (x) => Math.max(1, Math.floor((x / LIVE_PAD_WIDTH) * 20));

  const liveTick = () => {
    if (!liveState.current) {
      return;
    }
    const { size, y } = liveState.current;
    const step = useStore.getState().currentStep;
    paint.liveDraw(step + Math.ceil(size / 2), y, size);
  };

  const moveCursor = (e) => {
    const { x, y } = localPos(e, e.currentTarget);
    const cursor = cursorRef.current;
    cursor.style.left = x - 30 + 'px';
    cursor.style.top = y - 30 + 'px';
    return { x, y };
  };

  const onLiveDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = moveCursor(e);
    const state = useStore.getState();
    state.setSynthPlaying(true);
    const size = livePadSize(x);
    liveState.current = { size, y };
    paint.liveBegin(state.currentStep + Math.ceil(size / 2), y, size, state.strokeColor);
    cursorRef.current.classList.add('active');
    clearInterval(liveTimer.current);
    liveTimer.current = setInterval(liveTick, 20);
  };

  const onLiveMove = (e) => {
    const { x, y } = moveCursor(e);
    updateHover(y);
    if (liveState.current && e.buttons & 1) {
      liveState.current = { size: livePadSize(x), y };
      liveTick();
    }
  };

  const onLiveUp = () => {
    liveState.current = null;
    clearInterval(liveTimer.current);
    paint.liveEnd();
    cursorRef.current.classList.remove('active');
  };

  useEffect(() => () => clearInterval(liveTimer.current), []);

  return (
    <>
      <div
        id="livePad"
        onPointerDown={onLiveDown}
        onPointerMove={onLiveMove}
        onPointerUp={onLiveUp}
        onPointerCancel={onLiveUp}
        onPointerLeave={() => set({ hoverNote: null })}
      >
        <div className="livePadCursor" ref={cursorRef} />
      </div>
      <canvas
        id="livePadGrid"
        className="transparentOverlay"
        width={LIVE_PAD_WIDTH}
        height={CANVAS_HEIGHT}
        ref={livePadGridRef}
      />
      <div className="note-legend" id="gridLabels">
        <canvas id="gridLabelsCanvas" width="20" height={CANVAS_HEIGHT} ref={labelsRef} />
      </div>
      <div
        id="wPaint"
        ref={containerRef}
        onPointerDown={onPaintDown}
        onPointerMove={onPaintMove}
        onPointerUp={() => paint.strokeEnd()}
        onPointerCancel={() => paint.strokeEnd()}
        onPointerLeave={() => set({ hoverNote: null })}
      >
        <canvas id="paintCanvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={paintCanvasRef} />
        <canvas
          id="overlay"
          className="paintLayer transparentOverlay"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={overlayRef}
        />
        <canvas
          id="overlayGrid"
          className="paintLayer transparentOverlay"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={overlayGridRef}
        />
      </div>
    </>
  );
}
