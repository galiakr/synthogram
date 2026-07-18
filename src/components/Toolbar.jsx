import { useStore } from '../store';
import { paint } from '../paint';

const COLORS = ['#000000', '#555555', '#0000FF', '#FF0000', '#008000', '#FFA500', '#800080'];
const SIZES = [2, 4, 8, 14];

/** Drawing toolbar (replaces the wPaint menu). */
export function Toolbar() {
  const tool = useStore((s) => s.tool);
  const strokeColor = useStore((s) => s.strokeColor);
  const lineWidth = useStore((s) => s.lineWidth);
  const set = useStore((s) => s.set);

  return (
    <div id="paint-toolbar">
      <div className="tool-group">
        <button
          className={'tool-button' + (tool === 'pencil' ? ' selected' : '')}
          title="Pencil"
          onClick={() => set({ tool: 'pencil' })}
        >
          ✎ Pencil
        </button>
        <button
          className={'tool-button' + (tool === 'eraser' ? ' selected' : '')}
          title="Eraser"
          onClick={() => set({ tool: 'eraser' })}
        >
          ⌫ Eraser
        </button>
      </div>

      <div className="tool-group">
        {SIZES.map((size) => (
          <button
            key={size}
            className={'size-button' + (lineWidth === size ? ' selected' : '')}
            title={`Brush size ${size}`}
            onClick={() => set({ lineWidth: size })}
          >
            <span className="size-dot" style={{ width: size, height: size }} />
          </button>
        ))}
      </div>

      <div className="tool-group">
        {COLORS.map((color) => (
          <button
            key={color}
            className={'color-swatch' + (strokeColor === color ? ' selected' : '')}
            style={{ backgroundColor: color }}
            title={color}
            onClick={() => set({ strokeColor: color, tool: 'pencil' })}
          />
        ))}
      </div>

      <div className="tool-group">
        <button className="tool-button" title="Undo (Ctrl+Z)" onClick={() => paint.undo()}>
          ↶
        </button>
        <button className="tool-button" title="Redo (Ctrl+Shift+Z)" onClick={() => paint.redo()}>
          ↷
        </button>
        <button className="tool-button" title="Clear canvas" onClick={() => paint.clear()}>
          Clear
        </button>
      </div>
    </div>
  );
}
