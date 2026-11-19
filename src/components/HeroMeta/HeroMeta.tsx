import type { ReactNode } from 'react';
import type { AccessTag, GuidanceMode } from '../../types';
import { HeatIcon } from '../icons';
import './HeroMeta.css';

/* ---------------------------------------------------------------- Tag */
export interface TagProps {
  children: ReactNode;
  /** Defaults to ITVX Accents/Primary. */
  variant?: 'primary' | 'brand' | 'live';
}

const TAG_STYLE = {
  primary: undefined,
  brand: { background: 'var(--brand-primary)', color: 'var(--text-inverse)' },
  live: { background: 'var(--accent-tertiary)', color: 'var(--bg-secondary)' },
} as const;

/** Figma Tag, Type=Standard: h28, radius 4, uppercase. */
export function Tag({ children, variant = 'primary' }: TagProps) {
  return <span className="pill-exclusive" style={TAG_STYLE[variant]}>{children}</span>;
}

/* ---------------------------------------------------- AccessibilityTags */
export interface AccessibilityTagsProps {
  tags: AccessTag[];
  /** BBFC-style age rating (films), rendered with the warning outline. */
  rating?: string;
}

/** Figma "1920 accessibility icons": AD / S / BSL outline chips. */
export function AccessibilityTags({ tags, rating }: AccessibilityTagsProps) {
  return (
    <span className="pill-access-group">
      {rating && <span className="pill-access rating">{rating}</span>}
      {tags.map((t) => (
        <span key={t} className={`pill-access ${t.toLowerCase()}`} aria-label={ACCESS_LABEL[t]}>{t}</span>
      ))}
    </span>
  );
}

const ACCESS_LABEL: Record<AccessTag, string> = {
  AD: 'Audio described',
  S: 'Subtitles',
  BSL: 'British Sign Language',
};

/* ------------------------------------------------------------ MetaLine */
/** "• 3 Series • 45 mins" — Figma "1920 meta line". */
export function MetaLine({ items }: { items: Array<string | { text: string; color?: string }> }) {
  return (
    <>
      {items.map((it, i) => {
        const text = typeof it === 'string' ? it : it.text;
        const color = typeof it === 'string' ? undefined : it.color;
        return (
          <span key={i} style={{ display: 'contents' }}>
            <span className="pill-bullet">•</span>
            <span className="pill-meta" style={color ? { color } : undefined}>{text}</span>
          </span>
        );
      })}
    </>
  );
}

/* ----------------------------------------------------------- Strapline */
export interface StraplineProps {
  children: ReactNode;
  /** 1 = Perso (yellow glow, no stroke); 2 = PreTX & Release (mint glow, stroke). */
  variant?: 1 | 2;
  icon?: ReactNode;
}

export function Strapline({ children, variant = 1, icon }: StraplineProps) {
  return (
    <span
      className={'strap-chip' + (variant === 2 ? ' vod-hero-strapline' : '')}
      id={variant === 1 ? 'heroStrap1Wrap' : 'heroStrapline'}
    >
      {icon ?? (variant === 1 ? <HeatIcon /> : null)}
      <span>{children}</span>
    </span>
  );
}

/* --------------------------------------------------------- GuidanceMsg */
function Guidance({ className, text }: { className: string; text: string }) {
  return (
    <div className={className} aria-live="polite">
      <span className="guid-g" aria-hidden="true">G</span>
      <span className="guid-text">{text}</span>
    </div>
  );
}

/* ---------------------------------------------------------- EpisodeHero */
export interface EpisodeHeroProps {
  title: string;
  /** Title-art URL; otherwise an SVG text lockup of `title`. */
  logo?: string;
  tags?: ReactNode;
  access?: AccessTag[];
  rating?: string;
  meta?: Array<string | { text: string; color?: string }>;
  straplines?: ReactNode;
  description: string;
  keywords?: string[];
  guidance?: { mode: GuidanceMode; full: string; short: string };
  /** The CTA tower — rendered in the hero grid's left column. */
  children?: ReactNode;
}

/**
 * Section 1 — Figma "EPISODE HERO META & LOGO". Two-column grid:
 * title logo across the top, meta line + CTA tower on the left,
 * straplines / description / keywords on the right.
 */
export function EpisodeHero({
  title, logo, tags, access = [], rating, meta = [], straplines, description,
  keywords = [], guidance, children,
}: EpisodeHeroProps) {
  const mode = guidance?.mode ?? 'off';
  return (
    <>
      {mode === 'topright' && <Guidance className="guidance-tr" text={guidance!.full} />}
      <section className="vod-hero">
        <h1 className="vod-hero-title" aria-label={title}>
          {logo ? (
            <img className="vod-hero-logo" src={logo} alt="" />
          ) : (
            <svg className="vod-hero-logo" viewBox="0 0 1200 180" role="img" aria-hidden="true">
              <text
                x="0" y="148" fill="#ffffff"
                fontFamily="'F37 Zagma','Arial Black','Helvetica Neue',Arial,sans-serif"
                fontWeight="900" fontSize="180" letterSpacing="-8"
                textLength="1200" lengthAdjust="spacingAndGlyphs"
              >
                {title.toUpperCase()}
              </text>
            </svg>
          )}
        </h1>
        {mode === 'belowlogo' && <Guidance className="guidance-below-logo" text={guidance!.full} />}
        <div className="vod-hero-pills">
          {(access.length > 0 || rating) && <AccessibilityTags tags={access} rating={rating} />}
          {tags}
          <MetaLine items={meta} />
        </div>
        <div className="vod-hero-desc-block">
          <div className="vod-hero-subtitle">
            {straplines}
            {mode === 'strap3' && (
              <span className="strap-chip guidance-chip">
                <span className="guid-g" aria-hidden="true">G</span>
                <span className="guid-text">{guidance!.short}</span>
              </span>
            )}
          </div>
          {mode === 'abovedesc' && (
            <p className="guidance-above-desc">
              <span className="guid-prefix">GUIDANCE - </span>
              <span className="guid-text">{guidance!.full}</span>
            </p>
          )}
          <p className="vod-hero-desc">{description}</p>
          {keywords.length > 0 && (
            <div className="vod-hero-keywords">
              {keywords.map((k, i) => (
                <span key={k} className={'vod-hero-keyword' + (i === keywords.length - 1 ? ' kw-last' : '')}>{k}</span>
              ))}
            </div>
          )}
        </div>
        {children}
      </section>
    </>
  );
}
