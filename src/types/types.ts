import type { ReactNode } from 'react';
import type { UserInfo } from 'firebase/auth';

export type AuthUser = Pick<UserInfo, 'uid' | 'displayName' | 'email' | 'photoURL'> & {
  isAdmin: boolean;
  providerIds: string[];
};

export interface SessionData {
  id: string;
  active: boolean;
  inactiveTimestamp: number;
  created: number;
  usage: number;
  password: string;
  nPeers: number;
  // Display name of the current host; may be omitted to avoid exposing PII.
  currentHost?: string;
  roomName: string;
  profile: string;
  isPrivate: boolean;
  owner: string;
  // Always present: the backend writes these on every session, applying
  // defaults when the creator omits them (description/version default to '',
  // keepAlive to false, start/end dates to 0 = unset).
  description: string;
  version: string;
  keepAlive: boolean;
  startDate: number;
  endDate: number;
}

export interface SessionHistoryData {
  id: string;
  inactiveTimestamp: number;
  created: number;
  uptime: number;
  usage: number;
  roomName: string;
  owner: string;
  // Copied from the session when it is archived, older history entries lack it.
  description?: string;
  // Set when the owner removes the session; hidden from users, still visible to admins.
  removedByUser?: boolean;
}

export interface StatisticData {
  nPeers: number;
  timestamp: number;
}

export interface Statistics {
  id: string;
  data: StatisticData[];
}

export interface DetailItem {
  label: string;
  value: ReactNode;
}
