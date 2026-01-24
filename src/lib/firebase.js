// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Sanitize environment variables to remove hidden characters
const sanitizeEnvVar = (value) => {
  if (!value) return '';
  return value.toString().trim().replace(/[\r\n\t]/g, '');
};

// Your web app's Firebase configuration (sanitized)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: sanitizeEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: sanitizeEnvVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnvVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnvVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnvVar(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: sanitizeEnvVar(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID)
};

// Verification: Log config values to check for hidden characters
console.log('🔥 Firebase Config Verification:');
console.log('API Key length:', firebaseConfig.apiKey.length, 'Expected: 39');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);

// Validate critical config values
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase Config Error: Missing required values');
  throw new Error('Firebase configuration is incomplete. Check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
let analytics;
try {
  analytics = getAnalytics(app);
  console.log('✅ Firebase Analytics initialized');
} catch (error) {
  console.warn('⚠️ Analytics not available:', error.message);
}

// Initialize Firebase Authentication
export const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

// Initialize Firestore
export const db = getFirestore(app);
console.log('✅ Firestore initialized');

// Export app for other services
export { app };

// Initialize Google Auth Provider for native-style Google Sign-In
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log('✅ Firebase initialization complete');
