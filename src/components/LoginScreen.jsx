import { useState, useRef, useEffect } from 'react';
import { TEAM_PASSWORDS } from '../config/auth.js';

/**
 * Full-screen login card shown before the dashboard loads.
 * Checks the entered password against the team-password map and
 * calls onLogin(teamName) on success.
 */
export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const team = TEAM_PASSWORDS[password.trim()];
    if (team) {
      onLogin(team);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div style={styles.backdrop}>
      <form onSubmit={handleSubmit} style={styles.card}>
        {/* Lock icon */}
        <div style={styles.iconWrap}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 style={styles.title}>AIO Utilization</h1>
        <p style={styles.hint}>Enter your team password to continue</p>

        {/* Password field */}
        <div
          style={{
            ...styles.inputWrap,
            borderColor: error ? '#ef4444' : '#2d3148',
            animation: shake ? 'login-shake 0.4s ease' : 'none',
          }}
        >
          <input
            ref={inputRef}
            type={showPassword ? 'text' : 'password'}
            value={password}
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
            style={styles.input}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {error && <p style={styles.error}>Incorrect password</p>}

        <button type="submit" style={styles.submit}>
          Sign In
        </button>
      </form>

      <style>{`
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

/* ── Inline SVG icons (no extra deps) ─────────────────────────── */

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ── Styles ───────────────────────────────────────────────────── */

const styles = {
  backdrop: {
    minHeight: '100vh',
    background: '#0f1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: 14,
    padding: '40px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(99,102,241,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: '#f9fafb',
    letterSpacing: '-0.01em',
  },
  hint: {
    margin: '8px 0 24px',
    fontSize: 13,
    color: '#6b7280',
    fontWeight: 500,
  },
  inputWrap: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    background: '#0f1117',
    border: '1px solid #2d3148',
    borderRadius: 10,
    padding: '0 12px',
    transition: 'border-color 0.2s',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f3f4f6',
    fontSize: 14,
    padding: '12px 0',
    fontFamily: 'Inter, sans-serif',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    margin: '10px 0 0',
    fontSize: 13,
    color: '#ef4444',
    fontWeight: 600,
  },
  submit: {
    width: '100%',
    marginTop: 20,
    padding: '12px 0',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
    transition: 'opacity 0.2s',
    fontFamily: 'Inter, sans-serif',
  },
};
