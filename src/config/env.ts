import { z } from 'zod';

const envSchema = z.object({
  // Firebase authentication config
  VITE_AUTH_FIREBASE_API_KEY: z.string(),
  VITE_AUTH_FIREBASE_AUTH_DOMAIN: z.string(),
  VITE_AUTH_FIREBASE_PROJECT_ID: z.string(),
  VITE_AUTH_FIREBASE_STORAGE_BUCKET: z.string(),
  VITE_AUTH_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_AUTH_FIREBASE_APP_ID: z.string(),

  // Firebase realtime database config
  VITE_DATABASE_FIREBASE_API_KEY: z.string(),
  VITE_DATABASE_FIREBASE_AUTH_DOMAIN: z.string(),
  VITE_DATABASE_FIREBASE_DATABASE_URL: z.httpUrl(),
  VITE_DATABASE_FIREBASE_PROJECT_ID: z.string(),
  VITE_DATABASE_FIREBASE_STORAGE_BUCKET: z.string(),
  VITE_DATABASE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_DATABASE_FIREBASE_APP_ID: z.string(),

  // Server API path
  VITE_SERVER_API_PATH: z.string(),

  // Wormhole TCP server, used by OpenSpace to join a session
  VITE_WORMHOLE_ADDRESS: z.string(),
  VITE_WORMHOLE_PORT: z.string()
});

const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  console.error('Invalid environment configuration:', result.error);
  throw new Error('Invalid environment configuration');
}

export const env = result.data;
