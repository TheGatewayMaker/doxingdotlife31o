import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  Auth,
  User,
} from "firebase/auth";

// Firebase config from environment variables (Vite client-side)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase config
const isValidFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => value && typeof value === "string" && value.length > 0,
);

if (!isValidFirebaseConfig) {
  console.error(
    "Firebase configuration is missing or incomplete. Please set the following environment variables:",
    "VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID",
  );
}

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let authInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  authInitialized = true;
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  authInitialized = false;
}

// Initialize Firebase Auth (only if app initialized successfully)
export let auth: Auth | null = null;

if (authInitialized && app) {
  try {
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Auth:", error);
    auth = null;
  }
}

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

// Authorized email domains/accounts
const AUTHORIZED_EMAILS = import.meta.env.VITE_AUTHORIZED_EMAILS
  ? import.meta.env.VITE_AUTHORIZED_EMAILS.split(",").map((email) =>
      email.trim().toLowerCase(),
    )
  : [];

/**
 * Sign in with Google
 * Returns user data if successful, throws error if email is not authorized
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Validate that user email is authorized
    if (user.email) {
      const isAuthorized = isEmailAuthorized(user.email);
      if (!isAuthorized) {
        await signOut(auth);
        throw new Error(
          "Your email is not authorized to access the admin panel. Please contact the administrator.",
        );
      }
    } else {
      await signOut(auth);
      throw new Error("Unable to retrieve email from Google account.");
    }

    return user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

/**
 * Check if an email is authorized
 */
export const isEmailAuthorized = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();

  if (AUTHORIZED_EMAILS.length === 0) {
    console.warn("No authorized emails configured");
    return false;
  }

  return AUTHORIZED_EMAILS.some((authorizedEmail) => {
    // Support both specific emails and domain wildcards (e.g., "@company.com")
    if (authorizedEmail.startsWith("@")) {
      return lowerEmail.endsWith(authorizedEmail);
    }
    return lowerEmail === authorizedEmail;
  });
};

/**
 * Get Firebase ID token for backend verification
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};
