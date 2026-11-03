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
  // Optional by design: users may not provide them. The backend validates the
  // format of all sessions.
  description?: string;
  version?: string;
  keepAlive?: boolean;
  startDate?: number;
  endDate?: number;
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
