'use client';

import React from 'react';
import { ThreadWord } from '../types/thread';
import { MOOD_STYLES } from '../lib/moodStyles';
import { ThemeConfig } from '../lib/themeConfig';

interface ThreadOverviewBarProps {
  words: ThreadWord[];
  theme: ThemeConfig;
  scrollFraction: number; // 0 to 1
  visibleFraction: number; // 0 to 1
  onSeek: (fraction: number) => void;
}

export const ThreadOverviewBar: React.FC<ThreadOverviewBarProps> = ({
  words,
  theme,
  scrollFraction,
  visibleFraction,
  onSeek,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(fraction);
  };

  const viewportWidthPct = Math.max(10, Math.min(100, visibleFraction * 100));
  const maxLeftPct = 100 - viewportWidthPct;
  const viewportLeftPct = Math.max(0, Math.min(maxLeftPct, scrollFraction * 100));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 select-none">
      <div
        className="flex items-center justify-between text-[11px] font-mono mb-1 opacity-70"
        style={{ color: theme.inkPrimary }}
      >
        <span>Beginning</span>
        <span className="opacity-60">
          {words.length > 0 ? `${words.length} beads on living thread` : 'Empty thread'}
        </span>
        <span>Tail</span>
      </div>

      <div
        className="relative h-3.5 w-full rounded-full cursor-pointer overflow-hidden border flex items-center group transition-colors"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        }}
        onClick={handleClick}
        title="Click to seek along the thread"
      >
        {/* Continuous thread line through overview */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] opacity-40 z-0"
          style={{ backgroundColor: theme.inkPrimary }}
        />

        {/* Word ticks */}
        {words.map((w, i) => {
          const mood = MOOD_STYLES[w.mood] || MOOD_STYLES.neutral;
          const posPct = (i / Math.max(1, words.length - 1)) * 100;
          return (
            <div
              key={w.id || i}
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10 transition-transform group-hover:scale-125"
              style={{
                left: `calc(${posPct}% - 3px)`,
                backgroundColor: mood.color,
                opacity: 0.85,
              }}
            />
          );
        })}

        {/* Viewport indicator window */}
        <div
          className="absolute top-0 bottom-0 border-x-2 z-20 pointer-events-none rounded-sm transition-all duration-75"
          style={{
            left: `${viewportLeftPct}%`,
            width: `${viewportWidthPct}%`,
            backgroundColor: theme.inkFaint,
            borderColor: theme.inkPrimary,
          }}
        />
      </div>
    </div>
  );
};
