import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { env } from '@/config/env';
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
    baseUrl: env.VITE_SERVER_API_PATH,
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
    getHostPassword: builder.query<string, string>({
      query: (sessionId) => `/session/${sessionId}/host-password`,
      transformResponse: (response: { hostPassword: string }) => response.hostPassword
    }),
    // This is a bit of a workaround, since RKT is not meant to download files to disk but
    // we want to use the same headers and get access to the different states RTK exposes.
    // RTK is responsible of fetching the blob of data from the server, the actual file
    // download/creation is handled by the `handleDownload` function
    downloadRecordingFile: builder.query<void, string>({
      query: (sessionId) => ({
        url: `/session/${sessionId}/recording`,
        responseHandler: async (response) => {
          const blob = await response.blob();
          return { blob, sessionId };
        }
      }),
      transformResponse: async ({
        blob,
        sessionId
      }: {
        blob: Blob;
        sessionId: string;
      }) => {
        // Convert the blob of data to a downloadable file and trigger the download
        handleDownload(blob, `${sessionId}.astrorec`);
      },
      transformErrorResponse: (response) => {
        const data = response?.data as { sessionId?: string } | undefined;
        return { status: response.status, sessionId: data?.sessionId };
      },
      keepUnusedDataFor: 0
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
        url: `/session/${sessionId}/remove`,
        method: 'DELETE'
      })
    })
  })
});

export const {
  useFetchUserNameQuery,
  useGetHostPasswordQuery,
  useLazyDownloadRecordingFileQuery,
  useCreateSessionMutation,
  useRequestAdminRightsMutation,
  useClaimHostMutation,
  useRemoveSessionMutation
} = wormholeApi;

function handleDownload(blob: Blob, filename: string) {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    throw new Error('Failed to download recording file');
  }
}
