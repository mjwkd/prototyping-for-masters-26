'use client';

import React, { useState } from 'react';
import { generateRandomFriendlyName } from '../lib/nameGenerator';
import { updateClientUserName } from '../lib/cookies';
import { Dices, X, Check } from 'lucide-react';

interface NameModalProps {
  currentName: string;
  isOpen: boolean;
  onClose: () => void;
  onNameChanged: (newName: string) => void;
}

export const NameModal: React.FC<NameModalProps> = ({
  currentName,
  isOpen,
  onClose,
  onNameChanged,
}) => {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  const handleRollRandom = () => {
    setName(generateRandomFriendlyName());
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim() || generateRandomFriendlyName();
    updateClientUserName(finalName);
    onNameChanged(finalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-sm w-full p-6 text-stone-900 animate-scaleUp">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-stone-900">Your Writer Name</h2>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          No sign-in required. When you add a word or cut the thread, this name appears on your beads and in the archive.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="e.g. Quiet Otter"
              maxLength={30}
              className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              autoFocus
            />
            <button
              type="button"
              onClick={handleRollRandom}
              title="Roll a random name"
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-200 transition active:scale-95 flex items-center gap-1 text-xs"
            >
              <Dices className="w-4 h-4 text-stone-600" />
              <span>Roll</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 text-xs font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium rounded-xl transition active:scale-95 shadow flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Name</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
