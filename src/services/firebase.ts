// LifeBridge India - Firebase Web SDK v10 Initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Actual Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6wBnVu-Pioa2RTkDn16y4HpdLhfFe-d4",
  authDomain: "lifebridge-india.firebaseapp.com",
  projectId: "lifebridge-india",
  storageBucket: "lifebridge-india.firebasestorage.app",
  messagingSenderId: "954405041836",
  appId: "1:954405041836:web:4cf58c13b7c2b26de65109",
  measurementId: "G-6VRBGTWETZ"
};

// Release metadata
export const RELEASE_CONFIG = {
  LABEL: "LifeBridge India V1.1 — Trusted Medical Support Platform",
  VERSION: "1.1.0",
  BUILD_DATE: "2026-09-02",
  NOTICE: "LifeBridge India connects verified medical support campaigns, hospitals, donors, and voluntary networks through a transparent platform."
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "asia-south1");
export const googleProvider = new GoogleAuthProvider();
