import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';

/**
 * Firebase Client Configuration
 * 
 * Values are injected at build/runtime from environment variables:
 * - In Production: Set via hosting platform (Vercel, Cloud Run, Firebase Hosting, etc.)
 * - In Development: Loaded from `.env.local`
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Determine environment modes
const isProduction = process.env.NODE_ENV === 'production';
const isEmulatorEnabled = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
const isDemoProject = firebaseConfig.projectId.startsWith('demo-');

// Production Validation: Ensure essential credentials exist in production
if (isProduction && !firebaseConfig.apiKey) {
  console.error(
    '❌ [Firebase Config Error]: Missing NEXT_PUBLIC_FIREBASE_API_KEY in production environment.'
  );
}

/**
 * Initialize Firebase App singleton
 */
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Firebase Service Instances
 * - Auth: User management & session tokens
 * - Functions: 2nd Gen HTTPS callable functions (us-central1 default)
 * - Firestore: Cloud Firestore NoSQL database instance
 */
export const auth: Auth = getAuth(app);
export const functions: Functions = getFunctions(
  app,
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || 'us-central1'
);
export const db: Firestore = getFirestore(app);

/**
 * Emulator Connection Logic
 * 
 * STRICT PRODUCTION GUARD:
 * - Emulators are ONLY connected when NOT in production (`!isProduction`)
 *   AND either `NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'` or a `demo-*` project ID is used.
 * - In production (`NODE_ENV === 'production'`), this code block is completely bypassed,
 *   guaranteeing all requests route to live Firebase services in Google Cloud.
 */
const shouldUseEmulator = !isProduction && (isEmulatorEnabled || isDemoProject);

if (typeof window !== 'undefined' && shouldUseEmulator) {
  try {
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || '127.0.0.1';
    const authPort = parseInt(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099', 10);
    const functionsPort = parseInt(
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT || '5001',
      10
    );
    const firestorePort = parseInt(
      process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080',
      10
    );

    // 1. Auth Emulator
    connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, {
      disableWarnings: true,
    });

    // 2. Functions Emulator
    connectFunctionsEmulator(functions, emulatorHost, functionsPort);

    // 3. Firestore Emulator
    connectFirestoreEmulator(db, emulatorHost, firestorePort);

    console.info(
      `🛠️ [Firebase] Connected to local emulators (${emulatorHost} -> Auth: ${authPort}, Functions: ${functionsPort}, Firestore: ${firestorePort})`
    );
  } catch {
    // Prevent errors on hot module reloading in development
  }
} else if (typeof window !== 'undefined' && !isProduction) {
  console.info(
    `🚀 [Firebase] Connected directly to live Firebase project: "${firebaseConfig.projectId || 'unconfigured'}"`
  );
}
