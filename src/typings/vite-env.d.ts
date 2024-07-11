/*****************************************************************************************
 *                                                                                       *
 * Wormhole                                                                              *
 *                                                                                       *
 * Copyright (c) 2022-2024                                                               *
 *                                                                                       *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this  *
 * software and associated documentation files (the "Software"), to deal in the Software *
 * without restriction, including without limitation the rights to use, copy, modify,    *
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to    *
 * permit persons to whom the Software is furnished to do so, subject to the following   *
 * conditions:                                                                           *
 *                                                                                       *
 * The above copyright notice and this permission notice shall be included in all copies *
 * or substantial portions of the Software.                                              *
 *                                                                                       *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,   *
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A         *
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT    *
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF  *
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE  *
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                         *
 ****************************************************************************************/

/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client-react" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  readonly VITE_SERVER_API_PATH: string;

  readonly ADDRESS: string;
  readonly HTTP_PORT: number;

  readonly VITE_WORMHOLE_ADDRESS: string;
  readonly VITE_WORMHOLE_PORT: number;

  readonly VITE_OPENSPACE_ADDRESS: string;
  readonly VITE_OPENSPACE_PORT: number;

  readonly ADMIN_AUTH_SDK_FILEPATH: string;
  readonly ADMIN_DB_SDK_FILEPATH: string;

  // Authentication firebase config
  readonly VITE_AUTH_FIREBASE_API_KEY: string;
  readonly VITE_AUTH_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_AUTH_FIREBASE_PROJECT_ID: string;
  readonly VITE_AUTH_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_AUTH_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_AUTH_FIREBASE_APP_ID: string;

  // Realtime database firebase config
  readonly VITE_DATABASE_FIREBASE_API_KEY: string;
  readonly VITE_DATABASE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_DATABASE_FIREBASE_DATABASE_URL: string;
  readonly VITE_DATABASE_FIREBASE_PROJECT_ID: string;
  readonly VITE_DATABASE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_DATABASE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_DATABASE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
