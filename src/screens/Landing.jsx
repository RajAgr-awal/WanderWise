import * as I from '../icons.jsx';
import { useApp } from '../store.jsx';

export default function Landing({ onStart, onAuth, onGuest }) {
  const { setUser } = useApp();

  const handleGuest = () => {
    if (onGuest) return onGuest();
    setUser({
      uid: 'guest_traveler_' + Date.now(),
      name: 'Guest Explorer',
      email: 'explorer@wanderwise.app',
    });
  };

  return (
    <div className="screen noTabs fadeIn" style={{ paddingBottom: 50 }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: -80,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 320,
        height: 320,
        background: 'radial-gradient(circle, rgba(224,194,80,0.18) 0%, rgba(10,10,10,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="pad" style={{ paddingTop: 48, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        
        {/* Animated Brand Logo Icon */}
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(224,194,80,0.22), rgba(20,20,20,0.9))',
            border: '2px solid var(--gold)',
            boxShadow: '0 0 35px rgba(224,194,80,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold)',
            position: 'relative',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" stroke="var(--gold)" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="12" cy="12" r="6" stroke="var(--gold)" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="var(--gold)" />
              <polygon points="12,5 14,11 20,12 14,13 12,19 10,13 4,12 10,11" fill="var(--gold)" />
            </svg>
          </div>
        </div>

        {/* Brand Name & Motto */}
        <span className="wordmark" style={{ letterSpacing: '0.36em', fontSize: 13, display: 'block' }}>
          WanderWise
        </span>
        <h1 style={{ fontSize: 36, margin: '10px 0 6px', lineHeight: 1.12, letterSpacing: '-0.02em' }}>
          Intelligent Travel, <br />
          <span style={{
            background: 'linear-gradient(135deg, #fff 20%, var(--gold) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Grounded in Reality.
          </span>
        </h1>

        {/* Motto Box */}
        <div style={{
          margin: '18px auto 0',
          padding: '12px 18px',
          borderRadius: 999,
          background: 'rgba(224,194,80,0.08)',
          border: '1px solid var(--gold-dim)',
          display: 'inline-block',
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--gold)', fontStyle: 'italic' }}>
            “Curated like a local, structured by algorithms, verified against ground truth.”
          </p>
        </div>

        {/* Mission Statement Card */}
        <div className="card" style={{
          marginTop: 28,
          textAlign: 'left',
          background: 'linear-gradient(145deg, #181818, #101010)',
          border: '1px solid rgba(224,194,80,0.25)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}>
          <div className="row" style={{ gap: 10, marginBottom: 8 }}>
            <span className="iconCirc" style={{ width: 34, height: 34, flex: '0 0 34px' }}>
              <I.ISpark size={17} />
            </span>
            <span className="label gold" style={{ fontSize: 12 }}>Our Mission</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#d0d0d0', lineHeight: 1.6 }}>
            To empower travellers with intelligent, zero-hallucination journey planning.
            WanderWise combines algorithmic sequencing with audited ground-truth local logistics,
            transparent price tiers, and verified regional heritage — eliminating generic tourist traps and planning friction.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginTop: 18,
          textAlign: 'center',
        }}>
          <div className="card" style={{ padding: '12px 6px' }}>
            <div className="gold" style={{ fontSize: 20, fontWeight: 800 }}>39+</div>
            <div className="tiny" style={{ fontSize: 11, marginTop: 2 }}>Curated Cities</div>
          </div>
          <div className="card" style={{ padding: '12px 6px' }}>
            <div className="gold" style={{ fontSize: 20, fontWeight: 800 }}>60+</div>
            <div className="tiny" style={{ fontSize: 11, marginTop: 2 }}>Heritage POIs</div>
          </div>
          <div className="card" style={{ padding: '12px 6px' }}>
            <div className="gold" style={{ fontSize: 20, fontWeight: 800 }}>100%</div>
            <div className="tiny" style={{ fontSize: 11, marginTop: 2 }}>Real Pricing</div>
          </div>
        </div>

        {/* Feature Pillars */}
        <div style={{ marginTop: 28, textAlign: 'left' }}>
          <span className="label" style={{ display: 'block', marginBottom: 14 }}>Core Capabilities</span>

          <div className="card row" style={{ gap: 14, marginBottom: 10, padding: 14 }}>
            <span className="iconCirc" style={{ width: 44, height: 44, flex: '0 0 44px' }}>
              <I.ICal size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Algorithmic Day-by-Day Itineraries</div>
              <div className="tiny" style={{ marginTop: 2 }}>Chronological slots tailored strictly to Budget, Mid, or Luxury tiers.</div>
            </div>
          </div>

          <div className="card row" style={{ gap: 14, marginBottom: 10, padding: 14 }}>
            <span className="iconCirc" style={{ width: 44, height: 44, flex: '0 0 44px' }}>
              <I.IShield size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Zero-Hallucination Grounding</div>
              <div className="tiny" style={{ marginTop: 2 }}>Audited venues, exact price-for-two tags, and authentic local transit fares.</div>
            </div>
          </div>

          <div className="card row" style={{ gap: 14, marginBottom: 10, padding: 14 }}>
            <span className="iconCirc" style={{ width: 44, height: 44, flex: '0 0 44px' }}>
              <I.ICompass size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>6 Deep Travel Dimensions</div>
              <div className="tiny" style={{ marginTop: 2 }}>Culture, Signature Dishes, Stays, Transit, Bazaars, and Route Optimizer.</div>
            </div>
          </div>

          <div className="card row" style={{ gap: 14, padding: 14 }}>
            <span className="iconCirc" style={{ width: 44, height: 44, flex: '0 0 44px' }}>
              <I.IPhone size={20} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Universal PWA &amp; Native APK</div>
              <div className="tiny" style={{ marginTop: 2 }}>Offline-ready progressive web app + lightweight Android APK package.</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn" onClick={onStart || handleGuest}>
            <I.ICompass size={20} /> Start Exploring Destinations
          </button>

          <a
            href="https://github.com/RajAgr-awal/WanderWise/releases/download/latest-apk/WanderWise.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="btn soft"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            <I.IDownload size={19} /> Download Android App (APK ~10MB)
          </a>

          <button className="btn ghost" onClick={onAuth || handleGuest}>
            <I.IUser size={18} /> Sign In / Account
          </button>
        </div>

        {/* Footer Brand Line */}
        <div style={{ marginTop: 36, color: 'var(--muted2)', fontSize: 12 }}>
          <p style={{ margin: 0 }}>WanderWise AI Travel Companion · v1.0.0</p>
          <p style={{ margin: '4px 0 0' }}>Built with pride for smart, sustainable travel 🌍✨</p>
        </div>
      </div>
    </div>
  );
}
