/**
 * src/lib/firebase.js
 *
 * Thin re-export layer — the real Firebase singleton (app, auth, db,
 * storage, functions, emulator wiring, App Check) now lives in
 * src/api/wanderwiseApi.js so there is one and only one initializeApp()
 * call in the whole frontend.
 *
 * Any screen that previously imported from here can keep doing so;
 * they'll get the same objects.
 */
export { app, auth, db, storage, functions } from '../api/wanderwiseApi.js';
