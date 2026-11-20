'use client';

import React, { useState } from 'react';
import { ThreadWord } from '../types/thread';
import { getWordStyle, MOOD_STYLES } from '../lib/moodStyles';

interface WordBeadProps {
  word: ThreadWord;
  isLast?: boolean;
  onSelect?: (word: ThreadWord) => void;
}

export const WordBead: React.FC<WordBeadProps> = ({ word, isLast, onSelect }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const style = getWordStyle(word.mood, word.intensity);
  const moodConfig = MOOD_STYLES[word.mood] || MOOD_STYLES.neutral;

  const timeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className="relative flex items-center justify-center group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => {
        setShowTooltip(!showTooltip);
        onSelect?.(word);
      }}
    >
      {/* Word Bead container */}
      <span
        className={`word-bead px-2.5 py-1.5 cursor-pointer rounded-md transition-all duration-200 select-none ${
          style.animationClass
        } hover:bg-stone-200/50 hover:scale-105 active:scale-95`}
        style={{
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          letterSpacing: style.letterSpacing,
          color: style.color,
          fontStyle: style.fontStyle || 'normal',
          textTransform: style.textTransform || 'none',
        }}
        title={`${word.text} — by ${word.authorName}`}
      >
        {word.text}
      </span>

      {/* Floating Info Tooltip */}
      {showTooltip && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none whitespace-nowrap bg-stone-900 text-stone-100 text-xs px-2.5 py-1 rounded shadow-lg border border-stone-800 flex items-center gap-1.5 animate-fadeIn">
          <span className="font-medium text-stone-200">{word.authorName}</span>
          <span className="text-stone-400">•</span>
          <span
            className="capitalize px-1.5 py-0.5 rounded text-[10px] font-semibold"
            style={{
              backgroundColor: moodConfig.color + '33',
              color: moodConfig.accentColor || '#fff',
            }}
          >
            {word.mood} {Math.round((word.intensity || 0.5) * 100)}%
          </span>
          <span className="text-stone-400 text-[10px]">{timeAgo(word.createdAt)}</span>
        </div>
      )}
    </div>
  );
};
