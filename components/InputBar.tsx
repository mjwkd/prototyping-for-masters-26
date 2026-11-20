'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Thread, UserSession, ThreadWord } from '../types/thread';
import { validateWordInput, classifyWordHeuristically } from '../lib/heuristics';
import { ThreadService } from '../lib/threadService';

interface InputBarProps {
  thread: Thread | null;
  user: UserSession;
  words: ThreadWord[];
  onWordSubmitted: (isCut: boolean) => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  thread,
  user,
  words,
  onWordSubmitted,
}) => {
  const [wordInput, setWordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const isCurrentHolder = Boolean(
    thread?.penHolderId === user.id &&
    thread.penExpiresAt &&
    thread.penExpiresAt > Date.now()
  );

  const queuePosition = thread?.queue
    ? thread.queue.findIndex((q) => q.userId === user.id) + 1
    : 0;

  const totalWords = words.length;
  const canCut = totalWords >= 9; // Adding this word makes it >= 10

  // Pen countdown timer
  useEffect(() => {
    if (!isCurrentHolder || !thread?.penExpiresAt) {
      setSecondsRemaining(null);
      return;
    }
    const updateTimer = () => {
      const left = Math.max(0, Math.ceil((thread.penExpiresAt! - Date.now()) / 1000));
      setSecondsRemaining(left);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [isCurrentHolder, thread?.penExpiresAt]);

  // Focus input automatically when user acquires the pen
  useEffect(() => {
    if (isCurrentHolder && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCurrentHolder]);

  // Handle focus or click on input to request pen if not held
  const handleInputFocus = async () => {
    if (!thread || isCurrentHolder) return;
    try {
      await ThreadService.requestPen(thread.id, user);
    } catch (e) {
      // Ignored
    }
  };

  const handleSubmit = async (isCut: boolean) => {
    if (!thread) return;
    setErrorMessage(null);

    // If pen not yet held, request it first
    if (!isCurrentHolder) {
      const penRes = await ThreadService.requestPen(thread.id, user);
      if (!penRes.holding) {
        setErrorMessage(`In queue: position #${penRes.queuePosition}`);
        return;
      }
    }

    const validation = validateWordInput(wordInput);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter one word.');
      return;
    }

    if (isCut && !canCut) {
      setErrorMessage('Cut requires at least 10 words.');
      return;
    }

    setIsSubmitting(true);
    const moodResult = classifyWordHeuristically(validation.word);

    try {
      const res = await ThreadService.submitWord(
        thread.id,
        user,
        validation.word,
        isCut,
        moodResult.mood,
        moodResult.intensity
      );

      if (!res.success) {
        setErrorMessage(res.error || 'Could not submit word.');
        setIsSubmitting(false);
        return;
      }

      setWordInput('');
      onWordSubmitted(isCut);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-6 pt-1 font-sans select-none z-30">
      {/* Status indicator: pen countdown, queue, or error */}
      <div className="h-5 mb-1.5 flex items-center justify-center text-xs text-gray-500 font-sans">
        {errorMessage ? (
          <span className="text-gray-900 font-medium">{errorMessage}</span>
        ) : isCurrentHolder && secondsRemaining !== null ? (
          <span className="text-gray-600">Holding pen · {secondsRemaining}s</span>
        ) : queuePosition > 0 ? (
          <span className="text-gray-500">Queue position #{queuePosition}</span>
        ) : null}
      </div>

      {/* Input container */}
      <div className="bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-sm flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={wordInput}
          onFocus={handleInputFocus}
          onChange={(e) => {
            const noSpaces = e.target.value.replace(/\s+/g, '');
            setWordInput(noSpaces.slice(0, 30));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isSubmitting && wordInput.trim()) {
              handleSubmit(false);
            }
          }}
          placeholder="Add the next word"
          maxLength={30}
          disabled={isSubmitting}
          className="flex-1 bg-transparent px-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none"
        />

        <div className="flex items-center gap-1.5 pr-1">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !wordInput.trim()}
            className="px-4 py-2 bg-black hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-black text-white text-xs font-medium rounded-full transition"
          >
            Add
          </button>

          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || !wordInput.trim() || !canCut}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 text-gray-800 text-xs font-medium rounded-full transition"
          >
            Add & Cut
          </button>
        </div>
      </div>
    </div>
  );
};
