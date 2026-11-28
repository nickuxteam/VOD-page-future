import '../SeriesNav/SeriesNav.css';
import './RailTabs.css';

export interface RailTabsProps {
  tabs: { id: string; label: string }[];
  /** Tab whose rail is showing (lime underline). */
  activeIndex: number;
  /** Tab row owns focus (white pill on the active tab). */
  hasFocus: boolean;
  onTabClick?: (index: number) => void;
}

/**
 * Tab row that switches the rail beneath it (My ITVX: Continue watching | My list).
 * Same Top Tabs styling as the VOD page's SeriesNav (`.series-tab`): 80px tabs,
 * white fill when focused, 4px lime underline on the active tab.
 */
export function RailTabs({ tabs, activeIndex, hasFocus, onTabClick }: RailTabsProps) {
  return (
    <section className="series-tabs-shell rail-tabs" role="tablist">
      <div className="series-tabs-track">
        {tabs.map((t, i) => {
          const cls = ['series-tab'];
          if (i === activeIndex) cls.push('active');
          if (hasFocus && i === activeIndex) cls.push('focused');
          return (
            <div key={t.id} className={cls.join(' ')} role="tab" aria-selected={i === activeIndex} onClick={() => onTabClick?.(i)}>
              <span className="series-tab-label">{t.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
