interface ImportMetaEnv {
  // Firebase authentication config
  readonly VITE_AUTH_FIREBASE_API_KEY: string;
  readonly VITE_AUTH_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_AUTH_FIREBASE_PROJECT_ID: string;
  readonly VITE_AUTH_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_AUTH_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_AUTH_FIREBASE_APP_ID: string;

  // Firebase realtime database config
  readonly VITE_DATABASE_FIREBASE_API_KEY: string;
  readonly VITE_DATABASE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_DATABASE_FIREBASE_DATABASE_URL: string;
  readonly VITE_DATABASE_FIREBASE_PROJECT_ID: string;
  readonly VITE_DATABASE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_DATABASE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_DATABASE_FIREBASE_APP_ID: string;

  // Server API path
  readonly VITE_SERVER_API_PATH: string;

  readonly VITE_WORMHOLE_PORT: string;
  readonly VITE_WORMHOLE_ADDRESS: string;
}
