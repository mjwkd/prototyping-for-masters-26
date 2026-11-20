'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MobileView } from '../components/MobileView';
import { DesktopView } from '../components/DesktopView';
import { TopViewSwitcher } from '../components/TopViewSwitcher';
import { ActiveCallModal } from '../components/ActiveCallModal';
import { OverlapRange } from '../components/OverlapDial';
import {
  Contact,
  DEFAULT_CONTACTS,
  MY_LOCATION,
} from '../types/good-call';
import {
  fetchTimeFromWorldTimeApi,
  parseDateTimeString,
  TimeApiResponse,
} from '../lib/timeapi';

function getLiveNYTime() {
  try {
    const now = new Date();
    const nyStr = now.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const [h, m] = nyStr.split(':').map(Number);
    return { hour: isNaN(h) ? 12 : h, minute: isNaN(m) ? 0 : m };
  } catch {
    return { hour: 12, minute: 0 };
  }
}

export default function GoodCallApp() {
  // View toggle: mobile vs desktop
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('mom');

  // Time modes: 'live' (default: real New York time), 'mockup' (spec 21:10), 'custom' (scrubber)
  const [timeMode, setTimeMode] = useState<'live' | 'mockup' | 'custom'>('live');
  const [customHour, setCustomHour] = useState<number>(() => getLiveNYTime().hour);
  const [customMinute, setCustomMinute] = useState<number>(() => getLiveNYTime().minute);

  // TimeAPI.world data cache
  const [myApiData, setMyApiData] = useState<TimeApiResponse | null>(null);
  const [theirApiData, setTheirApiData] = useState<TimeApiResponse | null>(null);

  // Active call modal
  const [callingContact, setCallingContact] = useState<Contact | null>(null);

  // Active contact
  const activeContact = useMemo(() => {
    return contacts.find((c) => c.id === activeContactId) || contacts[0];
  }, [contacts, activeContactId]);

  // Screen size detection for smart initial view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('mobile');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch from TimeAPI.world
  const syncWithWorldTimeApi = useCallback(async () => {
    try {
      const [myData, contactData] = await Promise.all([
        fetchTimeFromWorldTimeApi(MY_LOCATION.timeZone),
        fetchTimeFromWorldTimeApi(activeContact.timeZone),
      ]);

      setMyApiData(myData);
      setTheirApiData(contactData);

      if (timeMode === 'live') {
        const parsed = parseDateTimeString(myData.datetime);
        setCustomHour(parsed.hour);
        setCustomMinute(parsed.minute);
      }
    } catch (err) {
      console.warn('Error fetching from World Time API:', err);
    }
  }, [activeContact.timeZone, timeMode]);

  // Trigger sync on mount and when contact changes
  useEffect(() => {
    syncWithWorldTimeApi();
    const interval = setInterval(syncWithWorldTimeApi, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [syncWithWorldTimeApi]);

  // Live clock interval when in live mode
  useEffect(() => {
    if (timeMode !== 'live') return;

    const tick = () => {
      const now = new Date();
      const nyStr = now.toLocaleTimeString('en-US', {
        timeZone: MY_LOCATION.timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      const [h, m] = nyStr.split(':').map(Number);
      setCustomHour(h);
      setCustomMinute(m);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [timeMode]);

  // Current hours and minutes in MY time (New York)
  const myHour = timeMode === 'mockup' ? 21 : customHour;
  const myMinute = timeMode === 'mockup' ? 10 : customMinute;

  // Offset between contact and me (Seoul is +14h relative to NY UTC-5)
  const offset = activeContact.utcOffset - MY_LOCATION.utcOffset;

  // Contact's current time
  const theirTotalMinutes = (myHour * 60 + myMinute + offset * 60 + 24 * 60) % (24 * 60);
  const theirHour = Math.floor(theirTotalMinutes / 60);
  const theirMinute = theirTotalMinutes % 60;

  // Dynamic Day calculations
  const [myDay, theirDay] = useMemo(() => {
    try {
      const now = new Date();
      const myFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: MY_LOCATION.timeZone,
        weekday: 'short',
      });
      const theirFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: activeContact.timeZone,
        weekday: 'short',
      });
      return [myFormatter.format(now), theirFormatter.format(now)];
    } catch {
      const dayOffset = Math.floor((myHour * 60 + myMinute + offset * 60) / (24 * 60));
      return ['Fri', dayOffset > 0 ? 'Sat' : dayOffset < 0 ? 'Thu' : 'Fri'];
    }
  }, [activeContact.timeZone, myHour, myMinute, offset]);

  // Overlap ranges
  const overlapRanges = useMemo<OverlapRange[]>(() => {
    if (activeContact.id === 'mom') {
      // Exact reference dial from spec: 17:00-24:00 and 08:00-09:00
      return [
        { start: 17, end: 24 },
        { start: 8, end: 9 },
      ];
    }

    const myStart = MY_LOCATION.awakeStart;
    const myEnd = MY_LOCATION.awakeEnd;
    const theirStartInMyTime = ((activeContact.awakeStart - offset) % 24 + 24) % 24;
    const theirEndInMyTime = ((activeContact.awakeEnd - offset) % 24 + 24) % 24;

    const ranges: OverlapRange[] = [];
    const isAwake = (h: number, start: number, end: number) => {
      if (start <= end) return h >= start && h < end;
      return h >= start || h < end;
    };

    let inOverlap = false;
    let rangeStart = 0;

    for (let h = 0; h < 24; h += 0.5) {
      const myAwake = isAwake(h, myStart, myEnd);
      const theirAwake = isAwake(h, theirStartInMyTime, theirEndInMyTime);
      const both = myAwake && theirAwake;

      if (both && !inOverlap) {
        inOverlap = true;
        rangeStart = h;
      } else if (!both && inOverlap) {
        inOverlap = false;
        ranges.push({ start: rangeStart, end: h });
      }
    }
    if (inOverlap) {
      ranges.push({ start: rangeStart, end: 24 });
    }

    return ranges;
  }, [activeContact, offset]);

  // Is current time in overlap?
  const currentTotalHour = myHour + myMinute / 60;
  const isOverlapNow = useMemo(() => {
    return overlapRanges.some((r) => {
      if (r.start <= r.end) {
        return currentTotalHour >= r.start && currentTotalHour <= r.end;
      }
      return currentTotalHour >= r.start || currentTotalHour <= r.end;
    });
  }, [currentTotalHour, overlapRanges]);

  // Overlap status text
  const overlapStatusInfo = useMemo(() => {
    if (isOverlapNow) {
      const currentRange = overlapRanges.find((r) => {
        if (r.start <= r.end) {
          return currentTotalHour >= r.start && currentTotalHour <= r.end;
        }
        return currentTotalHour >= r.start || currentTotalHour <= r.end;
      });

      const endH = currentRange ? currentRange.end : 24;
      const endFormatted =
        endH === 24 || endH === 0
          ? '12:00 AM'
          : endH > 12
          ? `${endH - 12}:00 PM`
          : `${endH}:00 AM`;

      return {
        label: `· until ${endFormatted}`,
        title: 'Overlap now',
        isNow: true,
      };
    } else {
      let minDiff = 999;
      overlapRanges.forEach((r) => {
        let diff = r.start - currentTotalHour;
        if (diff < 0) diff += 24;
        if (diff < minDiff) minDiff = diff;
      });

      if (minDiff < 999) {
        const diffH = Math.floor(minDiff);
        const diffM = Math.round((minDiff - diffH) * 60);
        return {
          label: `· in ${diffH > 0 ? `${diffH}h ` : ''}${diffM}m`,
          title: 'Overlap later',
          isNow: false,
        };
      }

      return {
        label: '· check tomorrow',
        title: 'No overlap today',
        isNow: false,
      };
    }
  }, [isOverlapNow, currentTotalHour, overlapRanges]);

  const formatTime = (h: number, m: number) => {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleAddContact = (name: string, city: string) => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name,
      city,
      country: 'Global',
      timeZone: 'UTC',
      utcOffset: 1,
      awakeStart: 8,
      awakeEnd: 23,
      avatar: {
        outer: '#06D6A0',
        middle: '#118AB2',
        core: '#8B6450',
        tagColor: '#06D6A0',
      },
    };

    setContacts((prev) => [...prev, newContact]);
    setActiveContactId(newContact.id);
  };

  const handleTriggerCall = (name: string) => {
    const target = contacts.find((c) => c.name === name) || activeContact;
    setCallingContact(target);
  };

  const isDefaultStaticMockup = timeMode === 'mockup' && activeContactId === 'mom';

  return (
    <div className="w-full min-h-screen bg-[#F5F5F4] text-[#1A1A1A] flex flex-col items-center">
      {/* Top Floating View Switcher Bar */}
      <TopViewSwitcher
        currentView={viewMode}
        onViewChange={setViewMode}
        activeContactName={activeContact.name}
      />

      {/* Render Mobile View or Desktop View */}
      {viewMode === 'mobile' ? (
        <MobileView
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={setActiveContactId}
          myHour={myHour}
          myMinute={myMinute}
          theirHour={theirHour}
          theirMinute={theirMinute}
          offset={offset}
          myDay={myDay}
          theirDay={theirDay}
          overlapRanges={overlapRanges}
          isOverlapNow={isOverlapNow}
          overlapStatusInfo={overlapStatusInfo}
          isDefaultStatic={isDefaultStaticMockup}
          formatTime={formatTime}
          onAddContact={handleAddContact}
          onTriggerCall={handleTriggerCall}
        />
      ) : (
        <DesktopView
          contacts={contacts}
          activeContact={activeContact}
          onSelectContact={setActiveContactId}
          myHour={myHour}
          myMinute={myMinute}
          theirHour={theirHour}
          theirMinute={theirMinute}
          offset={offset}
          myDay={myDay}
          theirDay={theirDay}
          overlapRanges={overlapRanges}
          isOverlapNow={isOverlapNow}
          overlapStatusInfo={overlapStatusInfo}
          isDefaultStatic={isDefaultStaticMockup}
          formatTime={formatTime}
          timeMode={timeMode}
          setTimeMode={setTimeMode}
          onScrubTime={(h, m) => {
            setCustomHour(h);
            setCustomMinute(m);
          }}
          onAddContact={handleAddContact}
          onTriggerCall={handleTriggerCall}
          myApiData={myApiData}
          theirApiData={theirApiData}
        />
      )}

      {/* Active Call In-Progress Simulation Modal */}
      {callingContact && (
        <ActiveCallModal
          contact={callingContact}
          onClose={() => setCallingContact(null)}
          theirTimeFormatted={formatTime(theirHour, theirMinute)}
        />
      )}
    </div>
  );
}
