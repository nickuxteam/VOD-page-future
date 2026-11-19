import './KeyHint.css';

/** Bottom hint bar mapping keyboard keys to the TV remote. */
export function KeyHint() {
  return (
    <div className="hint">
      <div className="keys">
        <span><kbd>←</kbd><kbd>→</kbd> Move</span>
        <span><kbd>↑</kbd><kbd>↓</kbd> Section</span>
        <span><kbd>Enter</kbd> Select</span>
        <span><kbd>Backspace</kbd> Back</span>
      </div>
    </div>
  );
}
