'use client';

import React, { useState } from 'react';
import { Thread, ThreadWord } from '../types/thread';
import { ThreadService } from '../lib/threadService';
import { X } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archives: Thread[];
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  archives,
}) => {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [threadWords, setThreadWords] = useState<ThreadWord[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);

  if (!isOpen) return null;

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread);
    setLoadingWords(true);
    ThreadService.subscribeWords(thread.id, (words) => {
      setThreadWords(words);
      setLoadingWords(false);
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm font-sans animate-fadeIn">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden text-gray-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black">
            Archive
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {selectedThread ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedThread(null)}
                className="text-xs text-gray-400 hover:text-black transition"
              >
                ← Back to archive
              </button>

              <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-black">
                    {selectedThread.wordCount} words
                  </span>
                  <span className="text-gray-400">
                    {formatDate(selectedThread.endedAt || selectedThread.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {selectedThread.endReason === 'cut'
                    ? `Cut by ${selectedThread.cutBy || 'Anonymous'}`
                    : 'Ended by 24h silence'}
                </p>
              </div>

              {/* Full sentence text */}
              <div className="p-4 border border-gray-100 rounded-xl">
                {loadingWords ? (
                  <div className="py-6 text-center text-xs text-gray-400">Loading...</div>
                ) : (
                  <p className="text-sm text-gray-800 leading-relaxed font-serif">
                    {threadWords.map((w) => w.text).join(' ')}
                  </p>
                )}
              </div>
            </div>
          ) : archives.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No threads have ended yet.
            </div>
          ) : (
            <div className="space-y-2">
              {archives.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectThread(t)}
                  className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-black block">
                      {t.wordCount} words
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {t.endReason === 'cut' ? `Cut by ${t.cutBy || 'Anonymous'}` : 'Timed out'} • {formatDate(t.endedAt || t.createdAt)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Read →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
