/**
 * Firebase Client SDK Initialization & Authentication Service
 * Project: kortex-246
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDfbP_rmlVUdXSr9xDsEYCX8bXtRqgwM3Q",
  authDomain: "kortex-246.firebaseapp.com",
  projectId: "kortex-246",
  storageBucket: "kortex-246.firebasestorage.app",
  messagingSenderId: "1008593196820",
  appId: "1:1008593196820:web:b4051dbb5d9b51a54a1401"
};

// Initialize Firebase App instance
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user with Firebase Email/Password
 */
export async function firebaseRegisterUser({ email, password, displayName }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    try {
      await updateProfile(userCredential.user, { displayName });
    } catch {
      // Non-fatal if display name update fails
    }
  }
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * Log in with existing Firebase Email/Password
 */
export async function firebaseLoginUser({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * 1-Click Sign In with Google
 */
export async function firebaseGoogleSignIn() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * Trigger official Google automated password reset email
 */
export async function firebaseSendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Sign out of Firebase session
 */
export async function firebaseSignOut() {
  return signOut(auth);
}

export { onAuthStateChanged };
