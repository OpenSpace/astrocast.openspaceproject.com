import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { auth } from '@/firebase/config';
import type { SessionData } from '@/types/types';

export type CreateSessionRequest = {
  roomName: string;
  profile: string;
  isPrivate: boolean;
  password?: string;
  hostPassword: string;
};

export type AdminRightsRequest = {
  uid: string;
  secret: string;
};

export const wormholeApi = createApi({
  reducerPath: 'wormholeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_API_PATH,
    prepareHeaders: async (headers) => {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    fetchUserName: builder.query<string, string>({
      query: (userId) => `/fetch-user-name/${userId}`,
      transformResponse: (response: { name: string }) => response.name
    }),
    createSession: builder.mutation<SessionData, CreateSessionRequest>({
      query: (body) => ({
        url: '/request-session',
        method: 'POST',
        body
      })
    }),
    requestAdminRights: builder.mutation<{ message: string }, AdminRightsRequest>({
      query: (body) => ({
        url: '/request-admin-rights',
        method: 'POST',
        body
      })
    }),
    getHostPassword: builder.query<string, string>({
      query: (sessionId) => `/session/${sessionId}/host-password`,
      transformResponse: (response: { hostPassword: string }) => response.hostPassword
    }),
    claimHost: builder.mutation<
      { message: string },
      { sessionId: string; password: string }
    >({
      query: ({ sessionId, password }) => ({
        url: `/session/${sessionId}/claim-host`,
        method: 'POST',
        body: { password }
      })
    }),
    removeSession: builder.mutation<{ message: string }, string>({
      query: (sessionId) => ({
        url: `/session/${sessionId}`,
        method: 'DELETE'
      })
    })
  })
});

export const {
  useFetchUserNameQuery,
  useCreateSessionMutation,
  useRequestAdminRightsMutation,
  useGetHostPasswordQuery,
  useClaimHostMutation,
  useRemoveSessionMutation
} = wormholeApi;
