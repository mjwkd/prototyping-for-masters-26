'use client';

import React, { useState } from 'react';
import {
  Phone,
  Calendar,
  MessageSquare,
  Clock,
  Search,
  Plus,
  Send,
  X,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Radio,
  Sliders,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { OverlapDial, OverlapRange } from './OverlapDial';
import { ConcentricAvatar } from './ConcentricAvatar';
import { Contact, MY_LOCATION } from '../types/good-call';
import { TimeApiResponse } from '../lib/timeapi';

interface DesktopViewProps {
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
  timeMode: 'mockup' | 'live' | 'custom';
  setTimeMode: (mode: 'mockup' | 'live' | 'custom') => void;
  onScrubTime: (hour: number, minute: number) => void;
  onAddContact: (name: string, city: string) => void;
  onTriggerCall: (contactName: string) => void;
  myApiData?: TimeApiResponse | null;
  theirApiData?: TimeApiResponse | null;
}

export function DesktopView({
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
  timeMode,
  setTimeMode,
  onScrubTime,
  onAddContact,
  onTriggerCall,
  myApiData,
  theirApiData,
}: DesktopViewProps) {
  // Modals & Panels
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'message' | 'api'>('schedule');

  // New person form state
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');

  // Quick message input in sidebar
  const [quickMessage, setQuickMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCity.trim()) return;
    onAddContact(newName.trim(), newCity.trim());
    setNewName('');
    setNewCity('');
    setShowAddModal(false);
  };

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessage.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setQuickMessage('');
    }, 3000);
  };

  const isNight = (h: number) => h < 6 || h >= 22;

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6 select-none font-mono">
      {/* Top Desktop Navigation & Brand Bar */}
      <header className="w-full bg-white rounded-3xl p-5 border border-[#E5E5E3] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-sm">
            GC
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] tracking-[0.16em] text-[#1A1A1A]">GOOD CALL</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFD9F0] text-[#D12A8C] text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5FBF] animate-pulse" />
                Desktop Web Edition
              </span>
            </div>
            <span className="text-xs text-[#6B6B6B]">
              Find mutual awake hours across oceans & continents
            </span>
          </div>
        </div>

        {/* Global Timezone Indicator & API Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* User Location Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#F4F4F2] text-xs text-[#1A1A1A] border border-[#E8E8E6]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-[#6B6B6B]">You:</span>
            <span className="font-semibold">{MY_LOCATION.city}</span>
            <span className="text-[#6B6B6B]">(EST · UTC-5)</span>
            <span className="font-bold text-[#1A1A1A] ml-1">{formatTime(myHour, myMinute)}</span>
          </div>

          {/* TimeAPI.world Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] text-[11px] text-[#7E22CE]">
            <Globe size={13} className="text-[#A855F7]" />
            <span>TimeAPI.world:</span>
            <span className="font-bold">gateway.timeapi.world</span>
          </div>

          {/* Add Contact Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#333333] transition-colors"
          >
            <Plus size={14} />
            <span>Add Person</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Hero Dial, Time Comparison & Interactive Scrubbing (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Hero Workspace Card */}
          <div className="w-full bg-white rounded-3xl p-6 lg:p-8 border border-[#E5E5E3] shadow-sm flex flex-col items-center gap-6 relative">
            {/* Contact Switcher Pills Bar */}
            <div className="w-full flex items-center justify-between pb-4 border-b border-[#F0F0EE] gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0">
                <span className="text-xs text-[#6B6B6B] font-semibold mr-1 shrink-0">CONTACT:</span>
                {contacts.map((contact) => {
                  const isSelected = contact.id === activeContact.id;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => onSelectContact(contact.id)}
                      className={`h-9 px-3.5 rounded-full flex items-center gap-2 text-xs font-semibold shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-white shadow-sm'
                          : 'bg-[#F2F2F0] text-[#1A1A1A] hover:bg-[#EAEAE8]'
                      }`}
                    >
                      <ConcentricAvatar
                        outer={contact.avatar.outer}
                        middle={contact.avatar.middle}
                        core={contact.avatar.core}
                        size={20}
                      />
                      <span>{contact.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-[#FF86D9]' : 'text-[#6B6B6B]'}`}>
                        ({contact.city})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time Mode Quick Select */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-[#F4F4F2] rounded-xl border border-[#E5E5E3] text-[11px] shrink-0">
                <button
                  onClick={() => setTimeMode('mockup')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    timeMode === 'mockup' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  Mockup (21:10)
                </button>
                <button
                  onClick={() => setTimeMode('live')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    timeMode === 'live' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  Live
                </button>
                <button
                  onClick={() => setTimeMode('custom')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    timeMode === 'custom' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  Scrub
                </button>
              </div>
            </div>

            {/* Dual Time Big Comparison Header */}
            <div className="w-full grid grid-cols-2 gap-4 bg-[#FAF9F8] p-5 rounded-2xl border border-[#EEEEEC]">
              {/* Left Clock: YOU (New York) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6B6B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BDBDBD]" />
                  <span>OUTER · YOU</span>
                  {isNight(myHour) ? (
                    <Moon size={13} className="text-[#6B6B6B]" />
                  ) : (
                    <Sun size={13} className="text-[#FF8C1A]" />
                  )}
                </div>
                <div className="text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                  {formatTime(myHour, myMinute)}
                </div>
                <div className="text-xs text-[#6B6B6B]">
                  {MY_LOCATION.city}, {MY_LOCATION.country} · {myDay}
                </div>
                <div className="text-[11px] text-[#888888]">
                  Awake window: 8:00 AM – 12:00 AM
                </div>
              </div>

              {/* Right Clock: ACTIVE CONTACT (e.g. Seoul) */}
              <div className="flex flex-col gap-1 border-l border-[#E5E5E3] pl-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6B6B]">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: activeContact.avatar.tagColor }}
                  />
                  <span>INNER · {activeContact.name.toUpperCase()}</span>
                  {isNight(theirHour) ? (
                    <Moon size={13} className="text-[#6B6B6B]" />
                  ) : (
                    <Sun size={13} className="text-[#FF8C1A]" />
                  )}
                </div>
                <div className="text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                  {formatTime(theirHour, theirMinute)}
                </div>
                <div className="text-xs text-[#6B6B6B]">
                  {activeContact.city}, {activeContact.country} · {theirDay} · {offset >= 0 ? `+${offset}h` : `${offset}h`}
                </div>
                <div className="text-[11px] text-[#888888]">
                  Awake window: 7:00 AM – 12:00 AM
                </div>
              </div>
            </div>

            {/* Overlap Status Banner */}
            <div
              className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
                overlapStatusInfo.isNow
                  ? 'bg-[#FFF0F8] text-[#D12A8C] border border-[#FFD9F0]'
                  : 'bg-[#F2F2F0] text-[#6B6B6B] border border-[#E5E5E3]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    overlapStatusInfo.isNow ? 'bg-[#FF5FBF] animate-ping' : 'bg-[#999999]'
                  }`}
                />
                <span className="font-bold">{overlapStatusInfo.title}</span>
                <span>{overlapStatusInfo.label}</span>
              </div>
              <span className="text-[11px] font-normal text-[#6B6B6B]">
                Mutual Awake Window: 17:00 – 24:00 EST (07:00 – 14:00 KST)
              </span>
            </div>

            {/* Hero Overlap Dial SVG (Expanded 400px Display) */}
            <div className="py-2 flex items-center justify-center">
              <OverlapDial
                myHour={myHour}
                myMinute={myMinute}
                offset={offset}
                overlapRanges={overlapRanges}
                isDefaultStatic={isDefaultStatic}
                size={380}
              />
            </div>

            {/* Dial Legend */}
            <div className="flex items-center justify-center gap-6 text-[11px] text-[#6B6B6B] pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F2F2F2] border border-[#D5D5D3]" />
                <span>Outer Ring: You ({MY_LOCATION.city})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white border border-[#D5D5D3]" />
                <span>Inner Disc: {activeContact.name} ({activeContact.city})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#FFD9F0] border border-[#FFB0DE]" />
                <span>Pink Fan: Mutual Awake Overlap</span>
              </div>
            </div>

            {/* 24-Hour Interactive Timeline Scrubbing Bar */}
            <div className="w-full bg-[#FAF9F8] p-4 rounded-2xl border border-[#EEEEEC] flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-[#FF5FBF]" />
                  <span className="font-bold text-[#1A1A1A]">24-Hour Time Scrubber:</span>
                  <span className="text-[#6B6B6B]">
                    Drag to preview any hour of the day
                  </span>
                </div>
                <div className="font-bold text-[#1A1A1A] bg-white px-2.5 py-1 rounded-lg border border-[#E5E5E3]">
                  {formatTime(myHour, myMinute)} (NY) ↔ {formatTime(theirHour, theirMinute)} ({activeContact.city})
                </div>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="23.9"
                step="0.25"
                value={myHour + myMinute / 60}
                onChange={(e) => {
                  setTimeMode('custom');
                  const val = parseFloat(e.target.value);
                  const h = Math.floor(val);
                  const m = Math.round((val - h) * 60);
                  onScrubTime(h, m);
                }}
                className="w-full h-2 bg-[#E5E5E3] rounded-lg appearance-none cursor-pointer accent-[#FF5FBF]"
              />

              {/* Visual Time Track Legend & Quick Jumps */}
              <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] pt-1">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTimeMode('mockup');
                      onScrubTime(21, 10);
                    }}
                    className="hover:underline font-semibold text-[#D12A8C]"
                  >
                    21:10 (Mockup Prime)
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      setTimeMode('custom');
                      onScrubTime(8, 0);
                    }}
                    className="hover:underline"
                  >
                    08:00 (Morning)
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      setTimeMode('custom');
                      onScrubTime(17, 0);
                    }}
                    className="hover:underline"
                  >
                    17:00 (Overlap Start)
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      setTimeMode('custom');
                      onScrubTime(23, 0);
                    }}
                    className="hover:underline"
                  >
                    23:00 (Late Night)
                  </button>
                </div>
                <span className="font-medium text-[#1A1A1A]">24h Radial Synchronization</span>
              </div>
            </div>

            {/* Primary Action Buttons Station */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Call Button */}
              {isOverlapNow ? (
                <button
                  onClick={() => onTriggerCall(activeContact.name)}
                  className="h-14 rounded-2xl bg-[#1A1A1A] text-white font-bold text-sm hover:bg-[#333333] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Phone size={18} />
                  <span>Call {activeContact.name} now</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="h-14 rounded-2xl bg-[#1A1A1A] text-white font-bold text-sm hover:bg-[#333333] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageSquare size={18} />
                  <span>Leave a message</span>
                </button>
              )}

              {/* Book Call Button */}
              <button
                onClick={() => setShowBookModal(true)}
                className="h-14 rounded-2xl bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-sm hover:bg-[#F9F9F8] transition-all flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                <span>{isOverlapNow ? 'Book a Call' : 'Book for Tomorrow'}</span>
              </button>

              {/* Async Note Button */}
              <button
                onClick={() => {
                  if (isOverlapNow) {
                    setShowMessageModal(true);
                  } else {
                    onTriggerCall(activeContact.name);
                  }
                }}
                className="h-14 rounded-2xl bg-[#F4F4F2] text-[#1A1A1A] font-semibold text-sm hover:bg-[#EAEAE8] transition-all flex items-center justify-center gap-2"
              >
                <Send size={16} />
                <span>{isOverlapNow ? 'Send Voice Note' : 'Call Anyway'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Directory, Multi-Timezone Circle, Calendar Matrix & TimeAPI Hub (5 cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Card 1: Your International Circle */}
          <div className="w-full bg-white rounded-3xl p-6 border border-[#E5E5E3] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#F0F0EE] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1A1A1A]">YOUR CIRCLE</span>
                <span className="text-xs text-[#6B6B6B]">({contacts.length} people)</span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-semibold text-[#D12A8C] hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add new</span>
              </button>
            </div>

            {/* Contact Cards List */}
            <div className="flex flex-col gap-2.5">
              {contacts.map((contact) => {
                const isSelected = contact.id === activeContact.id;
                const contactOffset = contact.utcOffset - MY_LOCATION.utcOffset;
                const contactMins = (myHour * 60 + myMinute + contactOffset * 60 + 24 * 60) % (24 * 60);
                const cH = Math.floor(contactMins / 60);
                const cM = contactMins % 60;
                const isAwake = cH >= contact.awakeStart && cH < contact.awakeEnd;

                return (
                  <div
                    key={contact.id}
                    onClick={() => onSelectContact(contact.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#1A1A1A] bg-[#FAF9F8] shadow-xs'
                        : 'border-[#EAEAEA] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ConcentricAvatar
                        outer={contact.avatar.outer}
                        middle={contact.avatar.middle}
                        core={contact.avatar.core}
                        size={36}
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1A1A1A]">{contact.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isAwake
                                ? 'bg-[#DCFCE7] text-[#16A34A]'
                                : 'bg-[#F3F4F6] text-[#6B7280]'
                            }`}
                          >
                            {isAwake ? 'Awake now' : 'Sleeping'}
                          </span>
                        </div>
                        <span className="text-xs text-[#6B6B6B]">
                          {contact.city} · {contactOffset >= 0 ? `+${contactOffset}h` : `${contactOffset}h`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-bold text-base text-[#1A1A1A]">
                        {formatTime(cH, cM)}
                      </span>
                      <span className="text-[11px] text-[#888888]">
                        Awake {contact.awakeStart}:00–{contact.awakeEnd}:00
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Tabs Hub: Weekly Overlap Schedule / TimeAPI.world Diagnostics / Async Message */}
          <div className="w-full bg-white rounded-3xl p-6 border border-[#E5E5E3] shadow-sm flex flex-col gap-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-[#F0F0EE] pb-3 text-xs">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`pb-1 font-semibold border-b-2 transition-all ${
                  activeTab === 'schedule'
                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                Weekly Matrix
              </button>
              <button
                onClick={() => setActiveTab('message')}
                className={`pb-1 font-semibold border-b-2 transition-all ${
                  activeTab === 'message'
                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                Wake-up Dispatcher
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`pb-1 font-semibold border-b-2 transition-all flex items-center gap-1 ${
                  activeTab === 'api'
                    ? 'border-[#D12A8C] text-[#D12A8C]'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                <Radio size={12} />
                <span>TimeAPI Live</span>
              </button>
            </div>

            {/* TAB CONTENT: Weekly Matrix */}
            {activeTab === 'schedule' && (
              <div className="flex flex-col gap-3">
                <span className="text-xs text-[#6B6B6B]">
                  Upcoming optimal call slots with {activeContact.name} ({activeContact.city})
                </span>
                <div className="flex flex-col gap-2">
                  {[
                    { day: 'Tonight (Fri)', my: '21:00 EST', their: '11:00 KST', tag: 'Recommended' },
                    { day: 'Tomorrow (Sat)', my: '20:30 EST', their: '10:30 KST', tag: 'Weekend Prime' },
                    { day: 'Sunday (Sun)', my: '21:00 EST', their: '11:00 KST', tag: 'Open Slot' },
                    { day: 'Monday (Mon)', my: '21:30 EST', their: '11:30 KST', tag: 'Weekdays' },
                  ].map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF9F8] border border-[#EAEAEA] flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1A1A1A]">{slot.day}</span>
                        <span className="text-[#6B6B6B]">
                          {slot.my} ↔ {slot.their}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#E8E8E6] text-[10px] text-[#444444] font-medium">
                          {slot.tag}
                        </span>
                        <button
                          onClick={() => {
                            alert(`Booked ${slot.day} at ${slot.my} with ${activeContact.name}!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] text-white text-[11px] font-semibold hover:bg-[#333333]"
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Asynchronous Wake-up Message Composer */}
            {activeTab === 'message' && (
              <form onSubmit={handleSendQuickMessage} className="flex flex-col gap-3">
                <div className="text-xs text-[#6B6B6B]">
                  Write a note now. We will queue and dispatch it right when {activeContact.name} wakes up at 8:00 AM {activeContact.city} time.
                </div>
                <textarea
                  rows={3}
                  value={quickMessage}
                  onChange={(e) => setQuickMessage(e.target.value)}
                  placeholder={`Hi ${activeContact.name}, hope you have a great day! Quick question on...`}
                  className="w-full p-3 rounded-xl border border-[#D5D5D3] bg-[#FDFDFD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
                    <Clock size={13} className="text-[#FF5FBF]" />
                    <span>Delivers in ~{((activeContact.awakeStart - theirHour + 24) % 24)}h</span>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#333333] transition-colors flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Schedule Message</span>
                  </button>
                </div>

                {messageSent && (
                  <div className="p-2.5 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={15} />
                    <span>Message scheduled for 8:00 AM delivery to {activeContact.name}!</span>
                  </div>
                )}
              </form>
            )}

            {/* TAB CONTENT: TimeAPI.world Diagnostics Feed */}
            {activeTab === 'api' && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F0EE]">
                  <span className="font-bold text-[#1A1A1A]">World Time API Inspector</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-semibold">
                    HTTP 200 Live
                  </span>
                </div>

                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="bg-[#FAF9F8] p-2.5 rounded-xl border border-[#E5E5E3]">
                    <span className="text-[#888888] block text-[10px]">TIMEZONE: YOU</span>
                    <span className="font-bold text-[#1A1A1A]">America/New_York (UTC-5)</span>
                    <span className="text-[#6B6B6B] block">
                      Endpoint: /api/time?timezone=America/New_York
                    </span>
                    <span className="text-[#10B981] block font-semibold">
                      Status: Active · Time: {formatTime(myHour, myMinute)}
                    </span>
                  </div>

                  <div className="bg-[#FAF9F8] p-2.5 rounded-xl border border-[#E5E5E3]">
                    <span className="text-[#888888] block text-[10px]">TIMEZONE: {activeContact.name.toUpperCase()}</span>
                    <span className="font-bold text-[#1A1A1A]">{activeContact.timeZone} (UTC+{activeContact.utcOffset})</span>
                    <span className="text-[#6B6B6B] block">
                      Endpoint: /api/time?timezone={activeContact.timeZone}
                    </span>
                    <span className="text-[#10B981] block font-semibold">
                      Status: Active · Time: {formatTime(theirHour, theirMinute)}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F3F4F6] text-[#4B5563] text-[10px]">
                    Gateway: <code className="text-[#D12A8C]">https://gateway.timeapi.world</code> (Timezone, GeoIP, and DST calculator).
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MODAL: ADD SOMEONE (Desktop) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 flex flex-col gap-4 border border-[#EAEAEA] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <h2 className="text-base font-bold text-[#1A1A1A]">Add Someone Far Away</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#F2F2F0] flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X size={16} />
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
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D5D5D3] bg-[#FDFDFD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] uppercase mb-1">
                  City (Timezone via TimeAPI.world)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tokyo, Berlin, Sydney, Paris"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full h-11 px-3.5 pl-9 rounded-xl border border-[#D5D5D3] bg-[#FDFDFD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
                  />
                </div>
              </div>

              <div className="bg-[#F2F2F0] p-3 rounded-xl flex items-center justify-between text-xs text-[#6B6B6B]">
                <span>Default awake window</span>
                <span className="font-semibold text-[#1A1A1A]">8:00 AM – 11:00 PM</span>
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-2xl bg-[#1A1A1A] text-white font-semibold text-xs hover:bg-[#333333] transition-all mt-2"
              >
                Add to your circle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BOOK A CALL (Desktop) */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 flex flex-col gap-4 border border-[#EAEAEA] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-[#1A1A1A]">Schedule Call with {activeContact.name}</h2>
                <span className="text-xs text-[#6B6B6B]">Only mutually awake hours are listed</span>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="w-8 h-8 rounded-full bg-[#F2F2F0] flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { my: '18:00', their: '08:00', label: 'Early Evening (NY) / Morning' },
                { my: '20:00', their: '10:00', label: 'Prime Overlap' },
                { my: '21:00', their: '11:00', label: 'Recommended Peak' },
                { my: '22:00', their: '12:00', label: 'Late Night' },
              ].map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    alert(`Call booked for ${slot.my} EST / ${slot.their} (${activeContact.city})!`);
                    setShowBookModal(false);
                  }}
                  className="p-3 rounded-2xl border border-[#E5E5E5] hover:border-[#1A1A1A] bg-white flex flex-col text-left text-xs transition-all"
                >
                  <span className="font-bold text-[#1A1A1A]">
                    {slot.my} (You) ↔ {slot.their} ({activeContact.city})
                  </span>
                  <span className="text-[#6B6B6B] text-[11px] mt-1">{slot.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                alert(`Invite link sent to ${activeContact.name}!`);
                setShowBookModal(false);
              }}
              className="h-12 w-full rounded-2xl bg-[#1A1A1A] text-white font-semibold text-xs hover:bg-[#333333] transition-all flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>Send Calendar Invite</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: LEAVE A MESSAGE (Desktop) */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 flex flex-col gap-4 border border-[#EAEAEA] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-[#1A1A1A]">Leave a Message for {activeContact.name}</h2>
                <span className="text-xs text-[#6B6B6B]">
                  Scheduled to arrive at 8:00 AM ({activeContact.city} time)
                </span>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="w-8 h-8 rounded-full bg-[#F2F2F0] flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              rows={4}
              placeholder={`Hey ${activeContact.name}, wanted to share...`}
              className="w-full p-3.5 rounded-2xl border border-[#D5D5D3] bg-[#FDFDFD] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] resize-none"
            />

            <div className="flex items-center gap-2 text-xs text-[#6B6B6B] bg-[#F2F2F0] p-3 rounded-xl">
              <Clock size={14} className="text-[#FF5FBF]" />
              <span>Will be delivered when {activeContact.name} wakes up in {((activeContact.awakeStart - theirHour + 24) % 24)} hours</span>
            </div>

            <button
              onClick={() => {
                alert(`Message queued for ${activeContact.name}!`);
                setShowMessageModal(false);
              }}
              className="h-12 w-full rounded-2xl bg-[#1A1A1A] text-white font-semibold text-xs hover:bg-[#333333] transition-all flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>Schedule Wake-up Delivery</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
