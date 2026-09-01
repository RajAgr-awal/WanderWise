import { useState } from 'react';
import * as I from '../icons.jsx';
import { Field } from '../components.jsx';
import { authApi } from '../api/wanderwiseApi.js';
import { useApp } from '../store.jsx';

// Firebase Auth error codes -> user-facing copy.
const AUTH_ERRORS = {
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/too-many-requests': 'Too many attempts — please wait a moment.',
  'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Console (Authentication → Sign-in method).',
  'auth/api-key-not-valid': 'Invalid Firebase API Key in configuration.',
  'auth/invalid-api-key': 'Invalid Firebase API Key.',
  'auth/network-request-failed': 'Network error connecting to Firebase auth servers.',
  'auth/configuration-not-found': 'Firebase Auth configuration not found for this project.',
};

export default function Auth() {
  const { setUser } = useApp();
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (mode === 'signup' && name.trim().length < 2) return setErr('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (pw.length < 8) return setErr('Password must be at least 8 characters.');
    setErr('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const u = await authApi.signUp(name.trim(), email, pw);
        if (u) setUser({ uid: u.uid, name: u.displayName || name.trim(), email: u.email });
      } else {
        const u = await authApi.signIn(email, pw);
        if (u) setUser({ uid: u.uid, name: u.displayName || u.email.split('@')[0], email: u.email });
      }
    } catch (e) {
      console.error('[WanderWise Auth Error]:', e.code, e.message, e);
      setErr(AUTH_ERRORS[e.code] || e.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const demoLogin = () => {
    setUser({
      uid: 'demo_traveler_' + Date.now(),
      name: 'Priya Sharma',
      email: 'priya@wanderwise.app',
    });
  };

  const forgot = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter your email above first, then tap "Forgot password?".');
    try {
      await authApi.resetPassword(email);
      setErr('');
      setPw('');
      setErr('Reset link sent — check your inbox.');
    } catch (e) {
      console.error('[WanderWise Forgot Password Error]:', e);
      setErr(AUTH_ERRORS[e.code] || 'Could not send reset email.');
    }
  };

  return (
    <div className="screen noTabs">
      <div className="pad" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <span className="wordmark">Wanderwise</span>
        <h1>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
        <p className="sub" style={{ marginBottom: 30 }}>
          {mode === 'signin' ? 'Sign in to plan your next escape.' : 'Begin curating your next journey.'}
        </p>

        {mode === 'signup' && (
          <Field label="Full name" icon={<I.IUser size={22} color="#7a7a7a" />}
            value={name} onChange={setName} placeholder="Ada Lovelace" />
        )}
        <Field label="Email" icon={<I.IMail size={22} color="#7a7a7a" />}
          value={email} onChange={setEmail} placeholder="you@email.com" type="email" />
        <Field label={mode === 'signup' ? 'Password (min. 8 chars)' : 'Password'}
          icon={<I.ILock size={22} color="#7a7a7a" />}
          value={pw} onChange={setPw} placeholder="••••••••" reveal />

        {mode === 'signin' && (
          <button onClick={forgot} className="gold"
            style={{ display: 'block', marginLeft: 'auto', marginBottom: 22, fontSize: 14, fontWeight: 600 }}>
            Forgot password?
          </button>
        )}
        {err && <p className="err" style={{ marginBottom: 16 }}>{err}</p>}

        <button className="btn" onClick={submit} disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button className="btn soft" onClick={demoLogin} style={{ width: '100%' }}>
            ⚡ Explore as Guest / Demo Mode
          </button>
        </div>

        {mode === 'signup' ? (
          <>
            <p className="tiny" style={{ textAlign: 'center', marginTop: 14 }}>
              By signing up you agree to our <b className="gold">Terms</b> and <b className="gold">Privacy Policy</b>.
            </p>
            <button onClick={() => { setMode('signin'); setErr(''); }}
              style={{ display: 'block', margin: '24px auto 0', fontWeight: 700 }}>
              Already have an account? <span className="gold">Sign in</span>
            </button>
          </>
        ) : (
          <>
            <div className="divider" style={{ margin: '20px 0' }}>OR</div>
            <button className="btn ghost" onClick={() => { setMode('signup'); setErr(''); }}>
              Create new account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
