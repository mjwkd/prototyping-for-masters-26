'use client';

import React from 'react';
import { MOOD_STYLES, MoodType } from '../lib/moodStyles';
import { X, Pen, Scissors, Flame, Clock, Users } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[88vh] flex flex-col overflow-hidden text-stone-900 animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              How the Thread Works
            </h2>
            <p className="text-xs text-stone-500">
              One sentence. Written by everyone.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700">
          {/* Tension banner */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <h3 className="font-serif font-bold text-stone-900 text-sm">
              The Heart of the Project
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              The shared ambition is to weave the longest sentence ever written. Cutting gives you permanent ownership of the ending, but breaks the chain for everyone.
            </p>
          </div>

          {/* Core Rules list */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-stone-900 text-sm">
              The Laws of the Thread
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <Pen className="w-3.5 h-3.5 text-amber-600" />
                  <span>One Pen at a Time</span>
                </div>
                <p className="text-stone-600">
                  Request the pen to hold it for 30 seconds. If someone else is writing, you join the queue.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>One Word per Turn</span>
                </div>
                <p className="text-stone-600">
                  Trimmed, max 30 letters, no spaces inside. You cannot add two words in a row to the same thread.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <Scissors className="w-3.5 h-3.5 text-rose-600" />
                  <span>The Snip (Min 10 Words)</span>
                </div>
                <p className="text-stone-600">
                  Cutting is unlocked once the sentence has at least 10 words. Your word seals the ending with a period.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>24h Inactivity & Forks</span>
                </div>
                <p className="text-stone-600">
                  If 24h pass without a word, the thread archives. If a queue exceeds 5, a parallel thread opens.
                </p>
              </div>
            </div>
          </div>

          {/* 10 Mood styles gallery */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-stone-900 text-sm">
              The 10 Moods of Language
            </h3>
            <p className="text-xs text-stone-500">
              Words are analyzed in real-time by linguistic heuristics and Gemini AI to adopt typography and subtle kinetic motions:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {(Object.keys(MOOD_STYLES) as MoodType[]).map((key) => {
                const mood = MOOD_STYLES[key];
                return (
                  <div
                    key={key}
                    className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center gap-1"
                  >
                    <span
                      className={`text-sm font-medium ${mood.animationClass}`}
                      style={{
                        fontFamily: mood.fontFamily,
                        color: mood.color,
                        fontStyle: mood.fontStyle || 'normal',
                      }}
                    >
                      {mood.label}
                    </span>
                    <span className="text-[10px] text-stone-500 capitalize">
                      {key}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
