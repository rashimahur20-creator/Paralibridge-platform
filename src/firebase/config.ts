import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyByQZa_yZLGtNDXNiYnZhk8B8nysQeon1o",
  authDomain: "parali-bridge.firebaseapp.com",
  projectId: "parali-bridge",
  storageBucket: "parali-bridge.firebasestorage.app",
  messagingSenderId: "999782872793",
  appId: "1:999782872793:web:169c5c1e8fcacec221f0c8"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);
export default app;

// Check if Firebase is using placeholder config
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY";
};

// Add these rules in Firebase Console → Firestore → Rules:
// allow read, write: if request.auth != null;
