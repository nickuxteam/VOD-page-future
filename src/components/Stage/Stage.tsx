import { useEffect, useState, type ReactNode } from 'react';

/**
 * Fixed 1920×1080 CTV canvas, scaled down proportionally to fit the
 * browser window (letterboxed when the window is larger), matching the
 * prototype's viewport behaviour.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(1, window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div
      style={{
        width: 1920 * scale,
        height: 1080 * scale,
        flex: '0 0 auto',
        position: 'relative',
      }}
    >
      <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
