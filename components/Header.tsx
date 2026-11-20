'use client';

import React from 'react';
import { LongestRecord, Thread } from '../types/thread';

interface HeaderProps {
  thread: Thread | null;
  longestRecord: LongestRecord | null;
  onOpenArchiveModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  thread,
  longestRecord,
  onOpenArchiveModal,
}) => {
  const wordCount = thread?.wordCount || 0;
  const recordCount = longestRecord?.wordCount || 0;

  return (
    <header className="w-full bg-white px-6 py-4 select-none z-40 border-b border-gray-100 font-sans">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Thread the Word */}
        <h1 className="text-base font-semibold text-black tracking-tight">
          Thread the Word
        </h1>

        {/* Right: "{count} words · Record {recordCount}" and Archive link */}
        <div className="flex items-center gap-4 text-xs font-normal text-gray-500">
          <span>
            {wordCount} words · Record {recordCount}
          </span>
          <button
            onClick={onOpenArchiveModal}
            className="text-gray-900 hover:text-black hover:underline transition font-medium"
          >
            Archive
          </button>
        </div>
      </div>
    </header>
  );
};
