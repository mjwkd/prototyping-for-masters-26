import { Thread, ThreadWord, LooseEnd, LongestRecord, UserSession } from '../types/thread';
import { MoodType } from './moodStyles';

type Listener = () => void;

class MockThreadStore {
  private activeThread: Thread;
  private words: Map<string, ThreadWord[]> = new Map();
  private looseEnds: Map<string, LooseEnd[]> = new Map();
  private archives: Thread[] = [];
  private longestRecord: LongestRecord = {
    threadId: 'seed-thread-legacy',
    wordCount: 14,
    endedAt: Date.now() - 86400000,
    cutBy: 'Wandering Sparrow',
  };
  private listeners: Set<Listener> = new Set();
  private timerInterval: any = null;

  constructor() {
    const threadId = 'active-thread-1';
    const now = Date.now();

    this.activeThread = {
      id: threadId,
      status: 'active',
      createdAt: now - 3600000,
      updatedAt: now - 120000,
      endedAt: null,
      wordCount: 10,
      penHolderId: null,
      penHolderName: null,
      penExpiresAt: null,
      queue: [],
      cutBy: null,
      endReason: null,
      lastAuthorId: 'user_seed_author_99',
      lastWordText: 'fire',
    };

    // Initial starter sentence showcasing the solid 3D typographies
    const starterWords: Array<{ text: string; mood: MoodType; intensity: number; author: string }> = [
      { text: 'sunshine', mood: 'joy', intensity: 0.9, author: 'Golden Lark' },
      { text: 'is', mood: 'neutral', intensity: 0.2, author: 'Gentle Bear' },
      { text: 'rain', mood: 'calm', intensity: 0.8, author: 'Misty Lynx' },
      { text: 'and', mood: 'neutral', intensity: 0.2, author: 'Echoing Moth' },
      { text: 'love', mood: 'love', intensity: 0.9, author: 'Amber Fox' },
      { text: 'the', mood: 'neutral', intensity: 0.2, author: 'Silver Deer' },
      { text: 'heavy', mood: 'heavy', intensity: 0.9, author: 'Patient Heron' },
      { text: 'whisper', mood: 'whisper', intensity: 0.8, author: 'Quiet Otter' },
      { text: 'of', mood: 'neutral', intensity: 0.2, author: 'Curious Cricket' },
      { text: 'fire', mood: 'anger', intensity: 0.9, author: 'Brave Falcon' },
    ];

    const threadWords: ThreadWord[] = starterWords.map((item, idx) => ({
      id: `w_${idx}`,
      text: item.text,
      authorName: item.author,
      authorId: `author_${idx}`,
      index: idx,
      mood: item.mood,
      intensity: item.intensity,
      createdAt: now - (starterWords.length - idx) * 300000,
    }));

    this.words.set(threadId, threadWords);

    // Starter loose end example
    this.looseEnds.set(threadId, [
      {
        id: 'loose_1',
        text: 'trembling',
        authorName: 'Curious Cricket',
        authorId: 'user_cricket',
        positionIndex: 6,
        createdAt: now - 1800000,
      },
    ]);

    // Seed archived thread
    this.archives.push({
      id: 'thread-archived-0',
      status: 'ended',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000,
      endedAt: now - 86400000,
      wordCount: 14,
      penHolderId: null,
      penHolderName: null,
      penExpiresAt: null,
      queue: [],
      cutBy: 'Wandering Sparrow',
      endReason: 'cut',
      lastAuthorId: 'user_sparrow',
      lastWordText: 'forever.',
    });

    const archiveWords: ThreadWord[] = [
      'In', 'the', 'deep', 'silence', 'of', 'winter', 'we', 'remembered', 'how', 'fire', 'tasted', 'like', 'home', 'forever.'
    ].map((txt, idx) => ({
      id: `arch_w_${idx}`,
      text: txt,
      authorName: idx === 13 ? 'Wandering Sparrow' : 'Chorus',
      authorId: `arch_author_${idx}`,
      index: idx,
      mood: idx === 9 ? 'anger' : idx === 3 ? 'calm' : idx === 12 ? 'love' : 'neutral',
      intensity: 0.6,
      createdAt: now - 86400000 + idx * 1000,
      isEndingWord: idx === 13,
    }));
    this.words.set('thread-archived-0', archiveWords);

    if (typeof window !== 'undefined') {
      this.startExpirationCheck();
    }
  }

  private startExpirationCheck() {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      this.checkPenExpiry();
      this.checkThreadInactivity();
    }, 1000);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getActiveThread(): Thread {
    return { ...this.activeThread };
  }

  public getWords(threadId: string): ThreadWord[] {
    return [...(this.words.get(threadId) || [])];
  }

  public getLooseEnds(threadId: string): LooseEnd[] {
    return [...(this.looseEnds.get(threadId) || [])];
  }

  public getLongestRecord(): LongestRecord {
    return { ...this.longestRecord };
  }

  public getArchives(): Thread[] {
    return [...this.archives].sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));
  }

  private checkPenExpiry() {
    const now = Date.now();
    if (this.activeThread.penHolderId && this.activeThread.penExpiresAt) {
      if (now >= this.activeThread.penExpiresAt) {
        // Pen expired! Pass to next in queue or free
        if (this.activeThread.queue.length > 0) {
          const next = this.activeThread.queue.shift()!;
          this.activeThread.penHolderId = next.userId;
          this.activeThread.penHolderName = next.userName;
          this.activeThread.penExpiresAt = now + 30000;
        } else {
          this.activeThread.penHolderId = null;
          this.activeThread.penHolderName = null;
          this.activeThread.penExpiresAt = null;
        }
        this.notify();
      }
    }
  }

  private checkThreadInactivity() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (this.activeThread.status === 'active' && now - this.activeThread.updatedAt > twentyFourHours) {
      // 24h timeout -> automatically end thread with no owner
      this.endCurrentThread('timeout', null);
    }
  }

  public requestPen(user: UserSession): { holding: boolean; queuePosition: number; expiresAt: number | null } {
    const now = Date.now();
    this.checkPenExpiry();

    // If user is already the pen holder and timer is active
    if (this.activeThread.penHolderId === user.id && this.activeThread.penExpiresAt && this.activeThread.penExpiresAt > now) {
      return { holding: true, queuePosition: 0, expiresAt: this.activeThread.penExpiresAt };
    }

    // If pen is free
    if (!this.activeThread.penHolderId || (this.activeThread.penExpiresAt && this.activeThread.penExpiresAt <= now)) {
      this.activeThread.penHolderId = user.id;
      this.activeThread.penHolderName = user.name;
      this.activeThread.penExpiresAt = now + 30000;
      // remove from queue if they were in it
      this.activeThread.queue = this.activeThread.queue.filter((q) => q.userId !== user.id);
      this.notify();
      return { holding: true, queuePosition: 0, expiresAt: this.activeThread.penExpiresAt };
    }

    // Pen is taken -> check or add to queue
    const existingIndex = this.activeThread.queue.findIndex((q) => q.userId === user.id);
    if (existingIndex >= 0) {
      return { holding: false, queuePosition: existingIndex + 1, expiresAt: null };
    }

    this.activeThread.queue.push({
      userId: user.id,
      userName: user.name,
      joinedAt: now,
    });
    this.notify();
    return { holding: false, queuePosition: this.activeThread.queue.length, expiresAt: null };
  }

  public releasePen(userId: string) {
    const now = Date.now();
    if (this.activeThread.penHolderId === userId) {
      if (this.activeThread.queue.length > 0) {
        const next = this.activeThread.queue.shift()!;
        this.activeThread.penHolderId = next.userId;
        this.activeThread.penHolderName = next.userName;
        this.activeThread.penExpiresAt = now + 30000;
      } else {
        this.activeThread.penHolderId = null;
        this.activeThread.penHolderName = null;
        this.activeThread.penExpiresAt = null;
      }
      this.notify();
    } else {
      // Remove from queue if they left while waiting
      this.activeThread.queue = this.activeThread.queue.filter((q) => q.userId !== userId);
      this.notify();
    }
  }

  public submitWord(
    user: UserSession,
    wordText: string,
    isCut: boolean,
    mood: MoodType,
    intensity: number
  ): { success: boolean; error?: string; word?: ThreadWord } {
    const now = Date.now();
    this.checkPenExpiry();

    if (this.activeThread.status !== 'active') {
      return { success: false, error: 'The current thread has already ended.' };
    }

    if (this.activeThread.penHolderId !== user.id) {
      return { success: false, error: 'You do not hold the pen right now.' };
    }

    if (this.activeThread.queue.length > 0 && this.activeThread.lastAuthorId === user.id) {
      return { success: false, error: 'You cannot add two words in a row while others are waiting.' };
    }

    if (isCut && this.activeThread.wordCount < 9) {
      return { success: false, error: 'Cutting is only allowed once the sentence has at least 10 words.' };
    }

    const cleanedWord = wordText.trim() + (isCut ? '.' : '');
    const currentWords = this.words.get(this.activeThread.id) || [];
    const newWord: ThreadWord = {
      id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text: cleanedWord,
      authorName: user.name,
      authorId: user.id,
      index: currentWords.length,
      mood,
      intensity,
      createdAt: now,
      isEndingWord: isCut,
    };

    currentWords.push(newWord);
    this.words.set(this.activeThread.id, currentWords);

    const newWordCount = currentWords.length;
    this.activeThread.wordCount = newWordCount;
    this.activeThread.lastAuthorId = user.id;
    this.activeThread.lastWordText = cleanedWord;
    this.activeThread.updatedAt = now;

    if (isCut) {
      // End the thread!
      this.endCurrentThread('cut', user.name);
    } else {
      // Pass pen to next person in queue
      if (this.activeThread.queue.length > 0) {
        const next = this.activeThread.queue.shift()!;
        this.activeThread.penHolderId = next.userId;
        this.activeThread.penHolderName = next.userName;
        this.activeThread.penExpiresAt = now + 30000;
      } else {
        this.activeThread.penHolderId = null;
        this.activeThread.penHolderName = null;
        this.activeThread.penExpiresAt = null;
      }
    }

    this.notify();
    return { success: true, word: newWord };
  }

  public recordLooseEnd(user: UserSession, draftText: string, positionIndex: number) {
    if (!draftText.trim()) return;
    const looseList = this.looseEnds.get(this.activeThread.id) || [];
    looseList.push({
      id: `loose_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: draftText.trim(),
      authorName: user.name,
      authorId: user.id,
      positionIndex,
      createdAt: Date.now(),
    });
    this.looseEnds.set(this.activeThread.id, looseList);
    this.notify();
  }

  private endCurrentThread(reason: 'cut' | 'timeout', cutterName: string | null) {
    const now = Date.now();
    const finishedThread: Thread = {
      ...this.activeThread,
      status: 'ended',
      endedAt: now,
      endReason: reason,
      cutBy: cutterName,
      penHolderId: null,
      penHolderName: null,
      penExpiresAt: null,
      queue: [],
    };

    this.archives.unshift(finishedThread);

    // Update longest record if broken
    if (finishedThread.wordCount > this.longestRecord.wordCount) {
      this.longestRecord = {
        threadId: finishedThread.id,
        wordCount: finishedThread.wordCount,
        endedAt: now,
        cutBy: cutterName,
      };
    }

    // Start a new thread immediately (Rule 6)!
    const newThreadId = `thread_${Date.now()}`;
    this.activeThread = {
      id: newThreadId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      endedAt: null,
      wordCount: 0,
      penHolderId: null,
      penHolderName: null,
      penExpiresAt: null,
      queue: [],
      cutBy: null,
      endReason: null,
      lastAuthorId: null,
      lastWordText: null,
    };
    this.words.set(newThreadId, []);
    this.looseEnds.set(newThreadId, []);
    this.notify();
  }
}

let globalMockStore: MockThreadStore | null = null;

export function getMockStore(): MockThreadStore {
  if (!globalMockStore) {
    globalMockStore = new MockThreadStore();
  }
  return globalMockStore;
}
