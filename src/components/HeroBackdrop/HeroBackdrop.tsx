import './HeroBackdrop.css';

export interface HeroBackdropProps {
  /** 16:9 backdrop image URL. */
  image?: string;
}

/**
 * Full-screen hero art behind the page. Dims to 20% in the tab view and
 * collapses away in discover mode — both driven by the .app classes.
 */
export function HeroBackdrop({ image }: HeroBackdropProps) {
  return (
    <div
      className="hero show"
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
      aria-hidden="true"
    />
  );
}
