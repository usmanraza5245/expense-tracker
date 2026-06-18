import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Reuse the existing app across Fast Refresh re-runs instead of re-initializing.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let firestore: Firestore;
try {
  // React Native mis-negotiates Firestore's default streaming transport, which
  // can make the first load after a cold start hang for many seconds. Forcing
  // long polling makes the connection establish quickly and reliably.
  firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  // Already initialized (e.g. this module re-ran under Fast Refresh) — reuse it.
  firestore = getFirestore(app);
}

export const db = firestore;
