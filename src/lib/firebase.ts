import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Project Credentials configuration from Vite env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyChhi6OPHY2-JUu1aLCqgAoWB_u4hF2jag',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'coffee-b9956.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'coffee-b9956',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'coffee-b9956.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '457060751818',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:457060751818:web:f884eba6b44ee491895733',
};

// Check if Firebase is configured with credentials
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey
);

// Initialize Firebase SDK
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
