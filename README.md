# Astrocast - Parallel Connection

## Overview

The web app enhances the usability of Astrocast in OpenSpace by enabling users to view available sessions, create and share sessions with others, and join sessions directly from the website if OpenSpace is running.

This repository contains the frontend only. For the backend, see the [Wormhole](https://github.com/OpenSpace/Wormhole) repository, which relays data between OpenSpace instances and exposes the HTTP API this app talks to.

## Functionality

### Session Information

View detailed information about each session, including the number of participants, the creator of the room, the current host, and other relevant information.

### Join Existing Rooms

Easily connect to an existing room session via the website if you're connected to OpenSpace.

### Share Room

Share room links with others for automatic joining and seamless streaming.

### Create New Rooms

All sessions occupied? Log in with your Google, Facebook, Twitter, or GitHub account and create a new session.

## Getting Started

### Prerequisites

  - [Node.js and npm](https://nodejs.org)
  - A running instance of the [Wormhole](https://github.com/OpenSpace/Wormhole) backend server

### Installation

1. Clone this repository
1. Install dependencies:
   ```sh
   npm install
   ```
1. Copy `.env-sample` to `.env` and fill in the values (see [Environment Variables](#environment-variables) below)

### Running

| Command | Description |
| --------- | ------------- |
| `npm run dev` | Start the app with hot reload (development) |
| `npm run build` | Type-check and build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check formatting (Prettier) and linting (ESLint) |
| `npm run lint-fix` | Auto-fix formatting and lint issues |

### Environment Variables

| Variable | Required | Default | Description |
| ---------- | ---------- | --------- | ------------- |
| `VITE_SERVER_API_PATH` | ✓ | | Base path of the Wormhole backend API, e.g. `/api/v1` |
| `VITE_WORMHOLE_ADDRESS` | ✓ | | Address of the Wormhole TCP server used by OpenSpace to join a session |
| `VITE_WORMHOLE_PORT` | ✓ | | Port of the Wormhole TCP server |
| `VITE_AUTH_FIREBASE_API_KEY` | ✓ | | Firebase Web API key for the authentication project |
| `VITE_AUTH_FIREBASE_AUTH_DOMAIN` | ✓ | | Firebase auth domain for the authentication project |
| `VITE_AUTH_FIREBASE_PROJECT_ID` | ✓ | | Firebase project ID for the authentication project |
| `VITE_AUTH_FIREBASE_STORAGE_BUCKET` | ✓ | | Firebase storage bucket for the authentication project |
| `VITE_AUTH_FIREBASE_MESSAGING_SENDER_ID` | ✓ | | Firebase messaging sender ID for the authentication project |
| `VITE_AUTH_FIREBASE_APP_ID` | ✓ | | Firebase app ID for the authentication project |
| `VITE_DATABASE_FIREBASE_API_KEY` | ✓ | | Firebase Web API key for the realtime database project |
| `VITE_DATABASE_FIREBASE_AUTH_DOMAIN` | ✓ | | Firebase auth domain for the realtime database project |
| `VITE_DATABASE_FIREBASE_DATABASE_URL` | ✓ | | URL of the Firebase Realtime Database |
| `VITE_DATABASE_FIREBASE_PROJECT_ID` | ✓ | | Firebase project ID for the realtime database project |
| `VITE_DATABASE_FIREBASE_STORAGE_BUCKET` | ✓ | | Firebase storage bucket for the realtime database project |
| `VITE_DATABASE_FIREBASE_MESSAGING_SENDER_ID` | ✓ | | Firebase messaging sender ID for the realtime database project |
| `VITE_DATABASE_FIREBASE_APP_ID` | ✓ | | Firebase app ID for the realtime database project |

The authentication and realtime database configs can belong to the same or different Firebase projects. For each project, the values can be found in the [Firebase console](https://console.firebase.google.com) under **Project Settings** > **General** > **Your apps**.

For details on the Wormhole message protocol, see the [Wormhole](https://github.com/OpenSpace/Wormhole) repository.
