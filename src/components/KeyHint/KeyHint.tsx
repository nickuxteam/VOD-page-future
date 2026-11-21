import './KeyHint.css';

/** Bottom hint bar mapping keyboard keys to the TV remote. Labels are spans (not bare text)
 *  so the flex-gap fallback margins can space them on old engines. */
export function KeyHint() {
  return (
    <div className="hint">
      <div className="keys">
        <span><kbd>←</kbd><kbd>→</kbd><span>Move</span></span>
        <span><kbd>↑</kbd><kbd>↓</kbd><span>Section</span></span>
        <span><kbd>Enter</kbd><span>Select</span></span>
        <span><kbd>Backspace</kbd><span>Back</span></span>
      </div>
    </div>
  );
}
