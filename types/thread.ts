import { MoodType } from '../lib/moodStyles';

export type ThreadStatus = 'active' | 'ended';
export type EndReason = 'cut' | 'timeout' | null;

export interface QueueItem {
  userId: string;
  userName: string;
  joinedAt: number;
}

export interface Thread {
  id: string;
  status: ThreadStatus;
  createdAt: number;
  updatedAt: number;
  endedAt: number | null;
  wordCount: number;
  penHolderId: string | null;
  penHolderName: string | null;
  penExpiresAt: number | null; // epoch ms
  queue: QueueItem[];
  cutBy: string | null; // display name of person who cut
  endReason: EndReason;
  lastAuthorId: string | null;
  lastWordText?: string | null;
}

export interface ThreadWord {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  index: number;
  mood: MoodType;
  intensity: number; // 0.0 - 1.0
  createdAt: number;
  isEndingWord?: boolean;
}

export interface LooseEnd {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  positionIndex: number;
  createdAt: number;
}

export interface LongestRecord {
  threadId: string;
  wordCount: number;
  endedAt: number;
  cutBy?: string | null;
}

export interface MoodClassificationResult {
  mood: MoodType;
  intensity: number;
  allowed: boolean;
  reason?: string;
  source: 'gemini' | 'heuristic';
}

export interface UserSession {
  id: string;
  name: string;
}
