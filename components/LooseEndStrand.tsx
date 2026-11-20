'use client';

import React, { useState } from 'react';
import { LooseEnd } from '../types/thread';

interface LooseEndStrandProps {
  looseEnd: LooseEnd;
}

export const LooseEndStrand: React.FC<LooseEndStrandProps> = ({ looseEnd }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-start cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered(!hovered)}
    >
      {/* Hanging dangling thread strand */}
      <div className="loose-end-strand" />

      {/* Faint abandoned word tag hanging at bottom of strand */}
      <div
        className={`absolute top-12 left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none whitespace-nowrap text-[11px] font-caveat italic text-stone-500/70 select-none ${
          hovered ? 'opacity-100 scale-105 text-stone-700' : 'opacity-40'
        }`}
      >
        ~ {looseEnd.text}
      </div>

      {/* Tooltip on hover */}
      {hovered && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap bg-stone-800 text-stone-200 text-[10px] px-2 py-0.5 rounded shadow pointer-events-none">
          <span>Abandoned draft by {looseEnd.authorName}</span>
        </div>
      )}
    </div>
  );
};
