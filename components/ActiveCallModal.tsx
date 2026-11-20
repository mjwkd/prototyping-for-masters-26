'use client';

import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { ConcentricAvatar } from './ConcentricAvatar';
import { Contact } from '../types/good-call';

interface ActiveCallModalProps {
  contact: Contact;
  onClose: () => void;
  theirTimeFormatted: string;
}

export function ActiveCallModal({
  contact,
  onClose,
  theirTimeFormatted,
}: ActiveCallModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'calling' | 'connected'>('calling');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 2200);

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/90 backdrop-blur-md flex flex-col items-center justify-between p-8 text-white font-mono animate-in fade-in duration-200 select-none">
      {/* Top Bar */}
      <div className="flex flex-col items-center gap-1 mt-6">
        <span className="text-xs uppercase tracking-widest text-[#BDBDBD]">
          {callStatus === 'calling' ? 'Calling...' : 'Connected'}
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-white">{contact.name}</h2>
        <span className="text-xs text-[#999999]">
          {contact.city} · Local Time: {theirTimeFormatted}
        </span>
      </div>

      {/* Center Avatar & Sound Wave Ring */}
      <div className="relative flex items-center justify-center my-auto">
        <div
          className={`absolute w-44 h-44 rounded-full border-2 border-[#FF5FBF]/40 transition-transform duration-1000 ${
            callStatus === 'calling' ? 'animate-ping' : 'scale-110'
          }`}
        />
        <ConcentricAvatar
          outer={contact.avatar.outer}
          middle={contact.avatar.middle}
          core={contact.avatar.core}
          size={120}
        />
      </div>

      {/* Call Duration Counter */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="text-sm font-semibold tracking-wider text-[#E5E5E5]">
          {callStatus === 'calling' ? 'Ringing...' : formatDuration(callDuration)}
        </span>

        {/* Action Controls */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
              isMuted
                ? 'bg-[#FF4D4D] text-white border-transparent'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-lg hover:bg-[#DC2626] transition-transform active:scale-95"
          >
            <PhoneOff size={24} />
          </button>

          <button
            onClick={() => alert('Speaker switched to phone/headset')}
            className="w-14 h-14 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
