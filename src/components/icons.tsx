/** Inline SVG icons lifted from the prototype markup. */
import type { CtaIcon } from '../types';

export function PlayIcon({ className = 'play-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" aria-hidden="true">
      <polygon points="2,1 13,7 2,13" fill="currentColor" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg className="plus-icon" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TickIcon() {
  return (
    <svg className="plus-icon" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M1.5 7.5 5.5 11.5 12.5 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RestartIcon() {
  return (
    <svg className="restart-icon" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M11.5 7a4.5 4.5 0 1 1-1.32-3.18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <polyline points="11.5,1 11.5,4 8.5,4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CtaIconSvg({ icon }: { icon?: CtaIcon }) {
  switch (icon) {
    case 'play': return <PlayIcon />;
    case 'plus': return <PlusIcon />;
    case 'tick': return <TickIcon />;
    case 'restart': return <RestartIcon />;
    default: return null;
  }
}

export function ChevronIcon() {
  return (
    <svg className="dd-chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8 L12 16 L20 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Flame used by editorial strapline 1 (prototype used assets/icon-heat.png). */
export function HeatIcon() {
  return (
    <svg className="heat-icon" viewBox="0 0 21 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.6 0c.6 3.6-1 5.9-2.9 8.1C6.9 10.2 5 12.3 5 15.4 5 18.8 7.5 21 10.5 21s5.5-2.2 5.5-5.4c0-1.6-.6-3.1-1.6-4.3.1 1.8-.7 3.2-2 3.7.6-2.9-.1-5.6-2-7.6C14.3 5.9 15.2 3 11.6 0zM10.5 24C4.7 24 0 19.9 0 14.4 0 9.6 3.5 6.7 6.2 3.9 7.5 2.5 8.6 1.2 9 0c8.3 3.4 12 9.6 12 14.4C21 19.9 16.3 24 10.5 24z"
      />
    </svg>
  );
}

export function TrailerPlayBadge() {
  return (
    <svg className="trailer-play-badge" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="rgba(16,37,51,0.7)" stroke="#ffffff" strokeWidth="2" />
      <path d="M19 15 L34 24 L19 33 Z" fill="#ffffff" />
    </svg>
  );
}
