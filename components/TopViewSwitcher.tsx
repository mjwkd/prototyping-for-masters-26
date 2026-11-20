'use client';

import React from 'react';
import { Smartphone, Monitor, Globe } from 'lucide-react';

interface TopViewSwitcherProps {
  currentView: 'mobile' | 'desktop';
  onViewChange: (view: 'mobile' | 'desktop') => void;
  activeContactName: string;
}

export function TopViewSwitcher({
  currentView,
  onViewChange,
  activeContactName,
}: TopViewSwitcherProps) {
  return (
    <aside
      aria-label="View Switcher"
      className="sticky top-2 z-40 w-full max-w-fit mx-auto px-2 py-1.5 rounded-full bg-[#1A1A1A]/90 text-white backdrop-blur-md shadow-lg border border-white/20 flex items-center gap-2 text-xs font-mono select-none animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center gap-1.5 pl-2 pr-1 font-bold text-[11px] text-[#FF86D9]">
        <span className="w-2 h-2 rounded-full bg-[#FF5FBF] animate-pulse" />
        <span className="hidden sm:inline">GOOD CALL</span>
      </div>

      <div className="flex items-center bg-white/10 rounded-full p-0.5">
        <button
          type="button"
          onClick={() => onViewChange('mobile')}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold text-xs transition-all ${
            currentView === 'mobile'
              ? 'bg-white text-[#1A1A1A] shadow-md'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <Smartphone size={14} />
          <span>Mobile App</span>
          <span className="text-[10px] opacity-60 hidden md:inline">(390px)</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('desktop')}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold text-xs transition-all ${
            currentView === 'desktop'
              ? 'bg-white text-[#1A1A1A] shadow-md'
              : 'text-white/80 hover:text-white'
          }`}
        >
          <Monitor size={14} />
          <span>Desktop Website</span>
          <span className="text-[10px] opacity-60 hidden md:inline">(Full View)</span>
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-1.5 pl-1 pr-2 text-[10px] text-white/70">
        <Globe size={11} className="text-[#38BDF8]" />
        <span>timeapi.world</span>
      </div>
    </aside>
  );
}
