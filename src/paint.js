import { CANVAS_WIDTH, CANVAS_HEIGHT } from './store';

const MAX_UNDO = 30;

/**
 * Imperative drawing surface (replaces the wPaint jQuery plugin).
 * The PaintArea component registers its canvas here; toolbar buttons,
 * keyboard shortcuts and the sequencer all talk to this singleton.
 */
export const paint = {
  canvas: null,
  ctx: null,
  overlayCtx: null,
  undoStack: [],
  redoStack: [],
  stroke: null,
  live: null,

  register(canvas, overlayCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.overlayCtx = overlayCanvas.getContext('2d');
  },

  snapshot() {
    this.undoStack.push(this.ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
    if (this.undoStack.length > MAX_UNDO) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  },

  undo() {
    if (this.undoStack.length === 0) {
      return;
    }
    this.redoStack.push(this.ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
    this.ctx.putImageData(this.undoStack.pop(), 0, 0);
  },

  redo() {
    if (this.redoStack.length === 0) {
      return;
    }
    this.undoStack.push(this.ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
    this.ctx.putImageData(this.redoStack.pop(), 0, 0);
  },

  clear() {
    this.snapshot();
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },

  applyTool(tool, color, width) {
    this.ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  },

  strokeBegin(x, y, { tool, color, width }) {
    this.snapshot();
    this.applyTool(tool, color, width);
    this.stroke = { x, y };
    // draw a dot so single clicks leave a mark
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + 0.01, y);
    this.ctx.stroke();
  },

  strokeMove(x, y) {
    if (!this.stroke) {
      return;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(this.stroke.x, this.stroke.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.stroke = { x, y };
  },

  strokeEnd() {
    this.stroke = null;
  },

  // Live pad: paints at the playhead position while it advances.
  liveBegin(x, y, size, color) {
    this.snapshot();
    this.applyTool('pencil', color, size);
    this.live = { x, y };
  },

  liveDraw(x, y, size) {
    if (!this.live) {
      return;
    }
    if (size) {
      this.ctx.lineWidth = size;
    }
    if (x < this.live.x) {
      // the playhead wrapped around: lift the pen and start a new stroke
      this.live = { x, y };
    }
    this.ctx.beginPath();
    this.ctx.moveTo(this.live.x, this.live.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.live = { x, y };
  },

  liveEnd() {
    this.live = null;
  },

  drawPlayhead(stepIndex) {
    if (!this.overlayCtx) {
      return;
    }
    this.overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.overlayCtx.beginPath();
    this.overlayCtx.moveTo(stepIndex + 0.5, 0);
    this.overlayCtx.lineTo(stepIndex + 0.5, CANVAS_HEIGHT);
    this.overlayCtx.stroke();
  },

  getImage() {
    return this.canvas.toDataURL('image/png');
  },

  setImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.ctx.drawImage(img, 0, 0);
      this.ctx.restore();
    };
    img.src = dataUrl;
  }
};
