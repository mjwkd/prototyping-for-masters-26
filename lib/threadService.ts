import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getMockStore } from './mockStore';
import {
  Thread,
  ThreadWord,
  LooseEnd,
  LongestRecord,
  UserSession,
} from '../types/thread';
import { MoodType } from './moodStyles';

export class ThreadService {
  /**
   * Subscribe to the current active thread (or find/fork if queue > 5).
   */
  static subscribeActiveThread(
    callback: (thread: Thread | null) => void
  ): () => void {
    if (!isFirebaseConfigured || !db) {
      const store = getMockStore();
      const update = () => callback(store.getActiveThread());
      update();
      return store.subscribe(update);
    }

    // Query active threads from Firestore
    const q = query(
      collection(db, 'threads'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If no active thread exists, initialize one
          ThreadService.initiateNewThread();
          callback(null);
          return;
        }

        // Rule 7: If multiple active threads exist, find the one with the shortest queue
        const activeThreads = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Thread[];

        activeThreads.sort((a, b) => (a.queue?.length || 0) - (b.queue?.length || 0));
        callback(activeThreads[0]);
      },
      (error) => {
        console.warn('Firestore active thread listener error, falling back to mock:', error);
        const store = getMockStore();
        callback(store.getActiveThread());
      }
    );
  }

  /**
   * Subscribe to words in a thread ordered by index.
   */
  static subscribeWords(
    threadId: string,
    callback: (words: ThreadWord[]) => void
  ): () => void {
    if (!isFirebaseConfigured || !db) {
      const store = getMockStore();
      const update = () => callback(store.getWords(threadId));
      update();
      return store.subscribe(update);
    }

    const q = query(
      collection(db, 'threads', threadId, 'words'),
      orderBy('index', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const words = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ThreadWord[];
        callback(words);
      },
      (error) => {
        console.warn('Firestore words listener error:', error);
        callback(getMockStore().getWords(threadId));
      }
    );
  }

  /**
   * Subscribe to abandoned drafts (loose ends).
   */
  static subscribeLooseEnds(
    threadId: string,
    callback: (looseEnds: LooseEnd[]) => void
  ): () => void {
    if (!isFirebaseConfigured || !db) {
      const store = getMockStore();
      const update = () => callback(store.getLooseEnds(threadId));
      update();
      return store.subscribe(update);
    }

    const q = collection(db, 'threads', threadId, 'looseEnds');
    return onSnapshot(
      q,
      (snapshot) => {
        const looseEnds = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as LooseEnd[];
        callback(looseEnds);
      },
      (error) => {
        console.warn('Firestore looseEnds listener error:', error);
        callback(getMockStore().getLooseEnds(threadId));
      }
    );
  }

  /**
   * Subscribe to all-time record.
   */
  static subscribeLongestRecord(
    callback: (record: LongestRecord) => void
  ): () => void {
    if (!isFirebaseConfigured || !db) {
      const store = getMockStore();
      const update = () => callback(store.getLongestRecord());
      update();
      return store.subscribe(update);
    }

    return onSnapshot(
      doc(db, 'records', 'longest'),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as LongestRecord);
        } else {
          callback({
            threadId: 'init',
            wordCount: 0,
            endedAt: Date.now(),
          });
        }
      },
      (error) => {
        console.warn('Firestore record listener error:', error);
        callback(getMockStore().getLongestRecord());
      }
    );
  }

  /**
   * Subscribe to archived ended threads.
   */
  static subscribeArchives(
    callback: (threads: Thread[]) => void
  ): () => void {
    if (!isFirebaseConfigured || !db) {
      const store = getMockStore();
      const update = () => callback(store.getArchives());
      update();
      return store.subscribe(update);
    }

    const q = query(
      collection(db, 'threads'),
      where('status', '==', 'ended'),
      orderBy('endedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Thread[];
        callback(list);
      },
      (error) => {
        console.warn('Firestore archives listener error:', error);
        callback(getMockStore().getArchives());
      }
    );
  }

  /**
   * Request the pen for a user (atomic transaction).
   */
  static async requestPen(
    threadId: string,
    user: UserSession
  ): Promise<{ holding: boolean; queuePosition: number; expiresAt: number | null }> {
    if (!isFirebaseConfigured || !db) {
      return getMockStore().requestPen(user);
    }

    const threadRef = doc(db, 'threads', threadId);

    return runTransaction(db, async (transaction) => {
      const snap = await transaction.get(threadRef);
      if (!snap.exists()) {
        throw new Error('Thread does not exist');
      }

      const thread = snap.data() as Thread;
      const now = Date.now();
      const currentExpiry = thread.penExpiresAt || 0;
      const penHolderId = thread.penHolderId;
      const queue = thread.queue || [];

      // Check if current user already holds it
      if (penHolderId === user.id && currentExpiry > now) {
        return { holding: true, queuePosition: 0, expiresAt: currentExpiry };
      }

      // Check if pen is currently free or expired
      if (!penHolderId || currentExpiry <= now) {
        const expiresAt = now + 30000;
        const newQueue = queue.filter((q) => q.userId !== user.id);
        transaction.update(threadRef, {
          penHolderId: user.id,
          penHolderName: user.name,
          penExpiresAt: expiresAt,
          queue: newQueue,
        });
        return { holding: true, queuePosition: 0, expiresAt };
      }

      // Pen is occupied; check queue
      const existingPos = queue.findIndex((q) => q.userId === user.id);
      if (existingPos >= 0) {
        return { holding: false, queuePosition: existingPos + 1, expiresAt: null };
      }

      // Rule 7: If queue reaches > 5, trigger parallel thread spawn
      if (queue.length >= 5) {
        ThreadService.initiateNewThread();
      }

      const updatedQueue = [
        ...queue,
        { userId: user.id, userName: user.name, joinedAt: now },
      ];

      transaction.update(threadRef, { queue: updatedQueue });
      return { holding: false, queuePosition: updatedQueue.length, expiresAt: null };
    });
  }

  /**
   * Release the pen when user blurs, cancels, or times out.
   */
  static async releasePen(threadId: string, userId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      getMockStore().releasePen(userId);
      return;
    }

    const threadRef = doc(db, 'threads', threadId);
    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(threadRef);
        if (!snap.exists()) return;

        const thread = snap.data() as Thread;
        const now = Date.now();
        const queue = thread.queue || [];

        if (thread.penHolderId === userId) {
          if (queue.length > 0) {
            const next = queue[0];
            const remainingQueue = queue.slice(1);
            transaction.update(threadRef, {
              penHolderId: next.userId,
              penHolderName: next.userName,
              penExpiresAt: now + 30000,
              queue: remainingQueue,
            });
          } else {
            transaction.update(threadRef, {
              penHolderId: null,
              penHolderName: null,
              penExpiresAt: null,
            });
          }
        } else {
          // Remove from queue if waiting
          const remainingQueue = queue.filter((q) => q.userId !== userId);
          if (remainingQueue.length !== queue.length) {
            transaction.update(threadRef, { queue: remainingQueue });
          }
        }
      });
    } catch (err) {
      console.warn('Error releasing pen:', err);
    }
  }

  /**
   * Submit a word or cut the thread (atomic transaction with server rules).
   */
  static async submitWord(
    threadId: string,
    user: UserSession,
    wordText: string,
    isCut: boolean,
    mood: MoodType,
    intensity: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!isFirebaseConfigured || !db) {
      return getMockStore().submitWord(user, wordText, isCut, mood, intensity);
    }

    const threadRef = doc(db, 'threads', threadId);
    const wordsColRef = collection(db, 'threads', threadId, 'words');
    const recordRef = doc(db, 'records', 'longest');

    try {
      return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(threadRef);
        if (!snap.exists()) {
          return { success: false, error: 'Thread does not exist' };
        }

        const thread = snap.data() as Thread;
        const now = Date.now();

        if (thread.status !== 'active') {
          return { success: false, error: 'Thread has already ended' };
        }

        // Rule 1: Must hold pen
        if (thread.penHolderId !== user.id) {
          return { success: false, error: 'You do not hold the pen' };
        }

        // Rule 3: Cannot add two words in a row to the same thread
        if (thread.lastAuthorId === user.id) {
          return { success: false, error: 'You cannot add two words in a row to the same thread' };
        }

        // Rule 4: Cutting allowed only at 10 or more words
        if (isCut && thread.wordCount < 9) {
          return { success: false, error: 'Sentence must have at least 10 words to cut' };
        }

        const cleanedWord = wordText.trim() + (isCut ? '.' : '');
        const newWordIndex = thread.wordCount;
        const newWordRef = doc(wordsColRef);

        transaction.set(newWordRef, {
          id: newWordRef.id,
          text: cleanedWord,
          authorName: user.name,
          authorId: user.id,
          index: newWordIndex,
          mood,
          intensity,
          createdAt: now,
          isEndingWord: isCut,
        });

        const newWordCount = thread.wordCount + 1;
        const queue = thread.queue || [];

        if (isCut) {
          transaction.update(threadRef, {
            status: 'ended',
            endedAt: now,
            cutBy: user.name,
            endReason: 'cut',
            wordCount: newWordCount,
            penHolderId: null,
            penExpiresAt: null,
            queue: [],
          });

          // Check all-time record
          const recordSnap = await transaction.get(recordRef);
          const currentRecord = recordSnap.exists()
            ? (recordSnap.data() as LongestRecord)
            : { wordCount: 0 };

          if (newWordCount > currentRecord.wordCount) {
            transaction.set(recordRef, {
              threadId,
              wordCount: newWordCount,
              endedAt: now,
              cutBy: user.name,
            });
          }

          // Rule 6: When a thread ends, a new thread starts immediately
          ThreadService.initiateNewThread();
        } else {
          // Pass pen to next person in queue
          let nextPenHolderId: string | null = null;
          let nextPenHolderName: string | null = null;
          let nextPenExpiresAt: number | null = null;
          let remainingQueue = queue;

          if (queue.length > 0) {
            const next = queue[0];
            remainingQueue = queue.slice(1);
            nextPenHolderId = next.userId;
            nextPenHolderName = next.userName;
            nextPenExpiresAt = now + 30000;
          }

          transaction.update(threadRef, {
            wordCount: newWordCount,
            lastAuthorId: user.id,
            lastWordText: cleanedWord,
            updatedAt: now,
            penHolderId: nextPenHolderId,
            penHolderName: nextPenHolderName,
            penExpiresAt: nextPenExpiresAt,
            queue: remainingQueue,
          });
        }

        return { success: true };
      });
    } catch (err: any) {
      console.error('Submit word transaction failed:', err);
      return { success: false, error: err.message || 'Transaction failed' };
    }
  }

  /**
   * Record loose end draft abandoned while waiting or writing.
   */
  static async recordLooseEnd(
    threadId: string,
    user: UserSession,
    draftText: string,
    positionIndex: number
  ): Promise<void> {
    if (!draftText.trim()) return;

    if (!isFirebaseConfigured || !db) {
      getMockStore().recordLooseEnd(user, draftText, positionIndex);
      return;
    }

    try {
      const looseEndsCol = collection(db, 'threads', threadId, 'looseEnds');
      await addDoc(looseEndsCol, {
        text: draftText.trim(),
        authorName: user.name,
        authorId: user.id,
        positionIndex,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.warn('Failed to record loose end:', err);
    }
  }

  /**
   * Start a brand new active thread.
   */
  static async initiateNewThread(): Promise<string> {
    if (!isFirebaseConfigured || !db) {
      return 'active-thread-1';
    }

    try {
      const threadsCol = collection(db, 'threads');
      const newThreadRef = doc(threadsCol);
      const now = Date.now();

      await setDoc(newThreadRef, {
        id: newThreadRef.id,
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
      });

      return newThreadRef.id;
    } catch (err) {
      console.error('Failed to initiate new thread:', err);
      return '';
    }
  }
}
