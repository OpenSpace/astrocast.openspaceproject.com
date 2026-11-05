import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { onValue, ref, type Unsubscribe } from 'firebase/database';

import { db } from '@/firebase/config';
import type {
  SessionData,
  SessionHistoryData,
  StatisticData,
  Statistics
} from '@/types/types';

function toArray<T>(obj: Record<string, T>): T[] {
  return Object.values(obj);
}

// Statistics are stored in Firebase as `{ [sessionId]: { [dataPointId]: StatisticData } }`,
// so the session id lives in the outer key and must be preserved when flattening to an array.
function toStatisticsArray(
  obj: Record<string, Record<string, StatisticData>>
): Statistics[] {
  return Object.entries(obj).map(([id, dataPoints]) => ({
    id,
    data: Object.values(dataPoints)
  }));
}

export const databaseApi = createApi({
  reducerPath: 'databaseApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getSessions: builder.query<SessionData[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        _,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // We're currently doing client-side filtering which is ok for now since we don't
        // value a session as something super private.
        // @TODO (anden88 2026-11-03): Consider if we want to do server-side filtering,
        // but then we also need some kind of "update" system that re-fetches data when a
        // new session is created
        const sessionsRef = ref(db, 'SessionData');
        let unsubscribe: Unsubscribe | null = null;
        try {
          await cacheDataLoaded;
          unsubscribe = onValue(sessionsRef, (snapshot) => {
            updateCachedData(() =>
              snapshot.exists() ? toArray<SessionData>(snapshot.val()) : []
            );
          });
        } catch {
          // Cache entry was removed before the data was loaded, no need to do anything
        }
        await cacheEntryRemoved;
        if (unsubscribe) {
          unsubscribe();
        }
      }
    }),
    getSessionById: builder.query<SessionData | null, string>({
      queryFn: () => ({ data: null }),
      async onCacheEntryAdded(
        sessionId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const sessionRef = ref(db, `SessionData/${sessionId}`);
        let unsubscribe: Unsubscribe | null = null;
        try {
          await cacheDataLoaded;
          unsubscribe = onValue(sessionRef, (snapshot) => {
            updateCachedData(() =>
              snapshot.exists() ? (snapshot.val() as SessionData) : null
            );
          });
        } catch {
          // Cache entry was removed before the data was loaded, no need to do anything
        }
        await cacheEntryRemoved;
        if (unsubscribe) {
          unsubscribe();
        }
      }
    }),
    getSessionsHistory: builder.query<SessionHistoryData[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        _,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const historyRef = ref(db, 'SessionHistory');
        let unsubscribe: Unsubscribe | null = null;

        try {
          await cacheDataLoaded;
          unsubscribe = onValue(historyRef, (snapshot) => {
            updateCachedData(() =>
              snapshot.exists() ? toArray<SessionHistoryData>(snapshot.val()) : []
            );
          });
        } catch {
          // No need to do anything
        }
        await cacheEntryRemoved;
        if (unsubscribe) {
          unsubscribe();
        }
      }
    }),
    getStatistics: builder.query<Statistics[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        _,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const statisticsRef = ref(db, 'Statistics');
        let unsubscribe: Unsubscribe | null = null;

        try {
          await cacheDataLoaded;
          unsubscribe = onValue(statisticsRef, (snapshot) => {
            updateCachedData(() =>
              snapshot.exists() ? toStatisticsArray(snapshot.val()) : []
            );
          });
        } catch {
          // No need to do anything
        }
        await cacheEntryRemoved;
        if (unsubscribe) {
          unsubscribe();
        }
      }
    })
  })
});

export const {
  useGetSessionsQuery,
  useGetSessionByIdQuery,
  useGetSessionsHistoryQuery,
  useGetStatisticsQuery
} = databaseApi;
