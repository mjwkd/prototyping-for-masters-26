'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  Send,
  Search,
  Clock,
  Phone,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { OverlapDial, OverlapRange } from './OverlapDial';
import { ConcentricAvatar } from './ConcentricAvatar';
import { Contact, MY_LOCATION } from '../types/good-call';

interface MobileViewProps {
  contacts: Contact[];
  activeContact: Contact;
  onSelectContact: (id: string) => void;
  myHour: number;
  myMinute: number;
  theirHour: number;
  theirMinute: number;
  offset: number;
  myDay: string;
  theirDay: string;
  overlapRanges: OverlapRange[];
  isOverlapNow: boolean;
  overlapStatusInfo: {
    label: string;
    title: string;
    isNow: boolean;
  };
  isDefaultStatic: boolean;
  formatTime: (h: number, m: number) => string;
  onAddContact: (name: string, city: string) => void;
  onTriggerCall: (contactName: string) => void;
}

export function MobileView({
  contacts,
  activeContact,
  onSelectContact,
  myHour,
  myMinute,
  theirHour,
  theirMinute,
  offset,
  myDay,
  theirDay,
  overlapRanges,
  isOverlapNow,
  overlapStatusInfo,
  isDefaultStatic,
  formatTime,
  onAddContact,
  onTriggerCall,
}: MobileViewProps) {
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // New person form state
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCity.trim()) return;
    onAddContact(newName.trim(), newCity.trim());
    setNewName('');
    setNewCity('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full flex justify-center py-2 md:py-6">
      {/* Primary iPhone Container — Exact 390×844 Layout Matching Mockup */}
      <main
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '390px',
          minHeight: '844px',
          boxSizing: 'border-box',
          padding: '20px 20px 24px',
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontFamily: "'IBM Plex Mono', monospace",
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflow: 'hidden',
        }}
        className="rounded-[40px] shadow-2xl border-[6px] border-[#1E1E1E] relative select-none"
      >
        {/* iPhone Speaker Ear Speaker & Dynamic Island Visual Notch */}
        <div className="w-28 h-4 bg-[#1E1E1E] rounded-full mx-auto -mt-2.5 mb-1 hidden md:block" />

        {/* Header: Title + Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '44px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em' }}>GOOD CALL</span>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            aria-label="Add someone"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              background: '#F2F2F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
            className="hover:bg-[#E5E5E3] transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Contact Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }} className="no-scrollbar">
          {contacts.map((contact) => {
            const isSelected = contact.id === activeContact.id;
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => onSelectContact(contact.id)}
                style={{
                  height: '40px',
                  padding: '0 14px 0 6px',
                  borderRadius: '20px',
                  border: 'none',
                  background: isSelected ? '#1A1A1A' : '#F2F2F0',
                  color: isSelected ? '#FFFFFF' : '#1A1A1A',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '14px',
                  fontWeight: isSelected ? 700 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <ConcentricAvatar
                  outer={contact.avatar.outer}
                  middle={contact.avatar.middle}
                  core={contact.avatar.core}
                  size={28}
                />
                {contact.name}
              </button>
            );
          })}
        </div>

        {/* Overlap Dial (350px × 350px SVG) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OverlapDial
            myHour={myHour}
            myMinute={myMinute}
            offset={offset}
            overlapRanges={overlapRanges}
            isDefaultStatic={isDefaultStatic}
            size={350}
          />
        </div>

        {/* Dual Time Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          {/* Left: OUTER · YOU */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: '#6B6B6B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '5px', background: '#BDBDBD' }} />
              OUTER · YOU
            </span>
            <span style={{ fontSize: '34px', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {formatTime(myHour, myMinute)}
            </span>
            <span style={{ fontSize: '12px', color: '#6B6B6B' }}>
              {MY_LOCATION.city} · {myDay}
            </span>
          </div>

          {/* Right: INNER · CONTACT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: '#6B6B6B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: activeContact.avatar.tagColor,
                }}
              />
              INNER · {activeContact.name.toUpperCase()}
            </span>
            <span style={{ fontSize: '34px', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {formatTime(theirHour, theirMinute)}
            </span>
            <span style={{ fontSize: '12px', color: '#6B6B6B' }}>
              {activeContact.city} · {theirDay} · {offset >= 0 ? `+${offset}h` : `${offset}h`}
            </span>
          </div>
        </div>

        {/* Bottom CTA Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
          {/* Status pill indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              marginBottom: '2px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '5px',
                background: overlapStatusInfo.isNow ? '#FF5FBF' : '#6B6B6B',
              }}
            />
            <span style={{ fontWeight: 700 }}>{overlapStatusInfo.title}</span>
            <span style={{ color: '#6B6B6B' }}>{overlapStatusInfo.label}</span>
          </div>

          {/* Primary Action Button */}
          {isOverlapNow ? (
            <button
              type="button"
              onClick={() => onTriggerCall(activeContact.name)}
              style={{
                height: '56px',
                borderRadius: '28px',
                border: 'none',
                background: '#1A1A1A',
                color: '#FFFFFF',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
              className="hover:bg-[#2F2F2F] active:scale-[0.99] transition-all"
            >
              <Phone size={18} />
              Call now
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowMessageModal(true)}
              style={{
                height: '56px',
                borderRadius: '28px',
                border: 'none',
                background: '#1A1A1A',
                color: '#FFFFFF',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
              className="hover:bg-[#2F2F2F] active:scale-[0.99] transition-all"
            >
              <MessageSquare size={18} />
              Leave a message
            </button>
          )}

          {/* Secondary Action Button */}
          <button
            type="button"
            onClick={() => setShowBookModal(true)}
            style={{
              height: '56px',
              boxSizing: 'border-box',
              borderRadius: '28px',
              border: '1.5px solid #1A1A1A',
              background: '#FFFFFF',
              color: '#1A1A1A',
              fontSize: '16px',
              fontWeight: 500,
              fontFamily: "'IBM Plex Mono', monospace",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
            className="hover:bg-[#F7F7F6] active:scale-[0.99] transition-all"
          >
            <Calendar size={18} />
            {isOverlapNow ? 'Book a call' : 'Book a call for tomorrow'}
          </button>

          {/* Tertiary Action Link */}
          <button
            type="button"
            onClick={() => {
              if (isOverlapNow) {
                setShowMessageModal(true);
              } else {
                onTriggerCall(activeContact.name);
              }
            }}
            style={{
              alignSelf: 'center',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              color: '#555555',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
            className="hover:text-[#1A1A1A] transition-colors"
          >
            {isOverlapNow ? 'Leave a message instead' : 'Call anyway'}
          </button>
        </div>

        {/* MODAL: ADD SOMEONE */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-end animate-in fade-in duration-200">
            <div className="w-full bg-white rounded-t-[32px] p-6 flex flex-col gap-4 border-t border-[#EAEAEA] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                <h2 className="text-base font-bold text-[#1A1A1A]">Who do you want to stay close to?</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-[#F2F2F0] flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6B6B] uppercase mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D5D5D3] bg-[#FDFDFD] text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B6B6B] uppercase mb-1">
                    City (determines time zone)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tokyo, Berlin, Sydney"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full h-11 px-3.5 pl-9 rounded-xl border border-[#D5D5D3] bg-[#FDFDFD] text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                    />
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
                    />
                  </div>
                </div>

                <div className="bg-[#F2F2F0] p-3 rounded-xl flex items-center justify-between text-xs text-[#6B6B6B]">
                  <span>Awake hours</span>
                  <span className="font-semibold text-[#1A1A1A]">8:00 AM – 11:00 PM</span>
                </div>

                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#1A1A1A] text-white font-semibold text-[14px] hover:bg-[#2A2A2A] transition-all mt-1"
                >
                  Add someone
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: BOOK A CALL */}
        {showBookModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-end animate-in fade-in duration-200">
            <div className="w-full bg-white rounded-t-[32px] p-6 flex flex-col gap-4 border-t border-[#EAEAEA] shadow-2xl max-h-[85%] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-[#1A1A1A]">Pick a time with {activeContact.name}</h2>
                  <span className="text-xs text-[#6B6B6B]">Only hours you're both awake are shown</span>
                </div>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="w-7 h-7 rounded-full bg-[#F2F2F0] flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {['Today', 'Tomorrow', 'Sunday', 'Monday'].map((day, idx) => (
                  <button
                    key={day}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                      idx === 0
                        ? 'bg-[#1A1A1A] text-white'
                        : 'bg-[#F2F2F0] text-[#1A1A1A] hover:bg-[#EAEAE8]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {[
                  { my: '18:00', their: '08:00', label: 'Evening / Morning' },
                  { my: '20:00', their: '10:00', label: 'Prime Overlap' },
                  { my: '21:00', their: '11:00', label: 'Recommended' },
                  { my: '22:00', their: '12:00', label: 'Late Night' },
                ].map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      alert(`Call invitation scheduled for ${slot.my} (NY) / ${slot.their} (${activeContact.city})!`);
                      setShowBookModal(false);
                    }}
                    className="p-3 rounded-2xl border border-[#E5E5E5] hover:border-[#1A1A1A] bg-white flex items-center justify-between text-xs transition-all"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-[#1A1A1A] text-[13px]">
                        {slot.my} (You) ↔ {slot.their} ({activeContact.name})
                      </span>
                      <span className="text-[#6B6B6B] text-[11px]">{slot.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-[#999999]" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  alert(`Request sent to ${activeContact.name}!`);
                  setShowBookModal(false);
                }}
                className="h-12 w-full rounded-full bg-[#1A1A1A] text-white font-semibold text-[14px] hover:bg-[#2A2A2A] mt-2 transition-all flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>Send request</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL: LEAVE A MESSAGE */}
        {showMessageModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-end animate-in fade-in duration-200">
            <div className="w-full bg-white rounded-t-[32px] p-6 flex flex-col gap-4 border-t border-[#EAEAEA] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-[#1A1A1A]">Leave a message</h2>
                  <span className="text-xs text-[#6B6B6B]">
                    Delivered when {activeContact.name} wakes up (8:00 AM {activeContact.city})
                  </span>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="w-7 h-7 rounded-full bg-[#F2F2F0] flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  <X size={15} />
                </button>
              </div>

              <textarea
                rows={4}
                placeholder={`Hey ${activeContact.name}, quick question about...`}
                className="w-full p-3.5 rounded-2xl border border-[#D5D5D3] bg-[#FDFDFD] text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] resize-none"
              />

              <div className="flex items-center gap-2 text-xs text-[#6B6B6B] bg-[#F2F2F0] p-3 rounded-xl">
                <Clock size={14} className="text-[#FF5FBF]" />
                <span>Scheduled delivery: in {((activeContact.awakeStart - theirHour + 24) % 24)} hours</span>
              </div>

              <button
                onClick={() => {
                  alert(`Message scheduled for ${activeContact.name}!`);
                  setShowMessageModal(false);
                }}
                className="h-12 w-full rounded-full bg-[#1A1A1A] text-white font-semibold text-[14px] hover:bg-[#2A2A2A] transition-all flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>Send message</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
