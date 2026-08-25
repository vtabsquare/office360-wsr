import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing Firebase app or initialize once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

export const DEFAULT_SENDER_EMAIL = import.meta.env.VITE_GMAIL_SENDER_EMAIL || 'wsrvtabsquare@gmail.com';

function createGoogleProvider(forceConsent = false, loginHint?: string): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  GMAIL_SCOPES.forEach((scope) => provider.addScope(scope));

  // Only pass standard Google OAuth parameters supported in client popup
  if (forceConsent) {
    provider.setCustomParameters({
      prompt: 'consent',
      login_hint: loginHint || DEFAULT_SENDER_EMAIL
    });
  } else {
    provider.setCustomParameters({
      login_hint: loginHint || DEFAULT_SENDER_EMAIL
    });
  }

  return provider;
}

const TOKEN_STORAGE_KEY = 'officehub360_google_access_token';
const TOKEN_EXPIRY_KEY = 'officehub360_google_access_token_expiry';

let isSigningIn = false;
let cachedAccessToken: string | null = sessionStorage.getItem(TOKEN_STORAGE_KEY);

export const hasValidToken = () => {
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return false;
  return new Date().getTime() < parseInt(expiry, 10);
};

if (!hasValidToken()) {
  cachedAccessToken = null;
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken && hasValidToken()) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Need user interaction to get OAuth access token if not cached
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (
  forceConsent = false,
  preferredEmail?: string
): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const provider = createGoogleProvider(forceConsent, preferredEmail);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }
    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, cachedAccessToken);
    // OAuth access tokens typically expire in 1 hour. We set expiry to 50 mins (3000000 ms) to be safe.
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, (new Date().getTime() + 3000000).toString());
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      // User closed the sign-in popup - gracefully return null without erroring
      return null;
    }
    console.warn('Google Sign-in notice:', error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const clearAuthCache = (): void => {
  cachedAccessToken = null;
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!hasValidToken()) {
    clearAuthCache();
    return null;
  }
  return cachedAccessToken;
};

export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
  clearAuthCache();
};

