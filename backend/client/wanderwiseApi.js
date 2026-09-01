/**
 * WanderWise client SDK — the single seam between the React prototype and Firebase.
 *
 * Drop this into the app (e.g. src/api/wanderwiseApi.js), set the config below from
 * your env, and swap the prototype's `src/data.js` imports for these calls. Every
 * function maps 1:1 to a callable in the backend spec §4.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail, updateProfile, onAuthStateChanged,
  connectAuthEmulator,
} from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyFakeKeyForLocalDevOnly000000000',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wanderwise-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wanderwise-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wanderwise-dev.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const region = import.meta.env.VITE_FUNCTIONS_REGION || 'asia-south1';
export const functions = getFunctions(app, region);

const useEmulators =
  import.meta.env.DEV &&
  (import.meta.env.VITE_USE_EMULATORS === 'true' || import.meta.env.VITE_USE_EMULATOR === 'true');

if (useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
} else if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('[AppCheck] initialization failed:', err);
  }
}

/** Wrap a callable so errors surface as plain, user-presentable messages. */
const callable = (name) => {
  const fn = httpsCallable(functions, name);
  return async (payload = {}) => {
    try {
      const res = await fn(payload);
      return res.data;
    } catch (err) {
      const e = new Error(err.message || 'Something went wrong.');
      e.code = err.code;
      e.details = err.details;
      throw e;
    }
  };
};

// ---- Auth Callables & Local Fallback ---------------------------------------
const ensureUserProfileCallable = callable('ensureUserProfile');
const deleteAccountCallable = callable('deleteAccount');

const LOCAL_USERS_KEY = 'wanderwise.auth.users';
const getLocalUsers = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || {}; }
  catch { return {}; }
};
const saveLocalUsers = (u) => {
  try { localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(u)); }
  catch {}
};

const localListeners = new Set();
const notifyLocalListeners = (u) => {
  localListeners.forEach((cb) => {
    try { cb(u); } catch (e) { console.error('[Auth Listener Error]:', e); }
  });
};

const isConfigError = (code) =>
  [
    'auth/configuration-not-found',
    'auth/operation-not-allowed',
    'auth/api-key-not-valid',
    'auth/invalid-api-key',
    'auth/network-request-failed',
    'auth/internal-error',
  ].includes(code);

export const authApi = {
  watchUser: (cb) => {
    localListeners.add(cb);
    return onAuthStateChanged(auth, cb);
  },
  onChange: (cb) => {
    localListeners.add(cb);
    return onAuthStateChanged(auth, cb);
  },

  async signUp(arg1, arg2, arg3) {
    const name = (typeof arg1 === 'object' ? arg1.name : arg1) || 'Traveler';
    const email = (typeof arg1 === 'object' ? arg1.email : arg2) || '';
    const password = (typeof arg1 === 'object' ? arg1.password : arg3) || '';
    const cleanEmail = email.toLowerCase().trim();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      try {
        await ensureUserProfileCallable({ name });
      } catch (_) {}
      return cred.user;
    } catch (err) {
      if (isConfigError(err.code)) {
        console.warn(`[Firebase Auth] ${err.code} -> Using local prototype account.`);
        const users = getLocalUsers();
        const fallbackUser = {
          uid: 'local_' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
          displayName: name,
          email: cleanEmail,
        };
        users[cleanEmail] = { ...fallbackUser, password };
        saveLocalUsers(users);
        notifyLocalListeners(fallbackUser);
        return fallbackUser;
      }
      throw err;
    }
  },

  async signIn(arg1, arg2) {
    const email = (typeof arg1 === 'object' ? arg1.email : arg1) || '';
    const password = (typeof arg1 === 'object' ? arg1.password : arg2) || '';
    const cleanEmail = email.toLowerCase().trim();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      return cred.user;
    } catch (err) {
      if (isConfigError(err.code)) {
        console.warn(`[Firebase Auth] ${err.code} -> Signing in with local prototype profile.`);
        const users = getLocalUsers();
        let userRec = users[cleanEmail];
        if (!userRec) {
          userRec = {
            uid: 'local_' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
            displayName: cleanEmail.split('@')[0],
            email: cleanEmail,
          };
          users[cleanEmail] = userRec;
          saveLocalUsers(users);
        }
        const fallbackUser = {
          uid: userRec.uid,
          displayName: userRec.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
        };
        notifyLocalListeners(fallbackUser);
        return fallbackUser;
      }
      throw err;
    }
  },

  signOut: async () => {
    notifyLocalListeners(null);
    try { await signOut(auth); } catch (_) {}
  },
  resetPassword: async (email) => {
    try {
      return await sendPasswordResetEmail(auth, email);
    } catch (err) {
      if (isConfigError(err.code)) {
        console.warn('[Firebase Auth] Reset password simulation in local mode.');
        return;
      }
      throw err;
    }
  },
  deleteAccount: deleteAccountCallable,
};

export const api = {
  auth: authApi,
  deleteAccount: deleteAccountCallable,

  // ---- Discover -----------------------------------------------------------
  getDiscoverFeed: callable('getDiscoverFeed'),
  getCityDetail: callable('getCityDetail'),

  // ---- Estimate & itinerary ----------------------------------------------
  calculateEstimate: callable('calculateEstimate'),
  generateItinerary: callable('generateItinerary'),
  getTripMap: callable('getTripMap'),

  // ---- Route builder ------------------------------------------------------
  routeEstimate: (legs, budgetTier) =>
    callable('buildRoute')({ action: 'estimate', legs, budgetTier }),
  createRouteTrip: (legs, budgetTier) =>
    callable('buildRoute')({ action: 'create', legs, budgetTier }),
  saveTemplate: ({ name, notes, legs, budgetTier }) =>
    callable('buildRoute')({ action: 'saveTemplate', name, notes, legs, budgetTier }),

  // ---- Trips --------------------------------------------------------------
  getMyTrips: callable('getMyTrips'),
  getTripDetailTab: callable('getTripDetailTab'),
  updateTripSlot: callable('updateTripSlot'),

  // ---- Chat ---------------------------------------------------------------
  chatWithLocalGuide: callable('chatWithLocalGuide'),

  // ---- Static content -----------------------------------------------------
  getStaticContent: callable('getStaticContent'),
};

export default api;
