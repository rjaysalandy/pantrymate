import React, { useState, useRef } from 'react';

// ─── Rules — must mirror utils/passwordValidator.js ───────────────────────────
const RULES = [
  { id: 'length',    label: 'At least 8 characters',              test: p => p.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter (A–Z)', test: p => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'At least one lowercase letter (a–z)', test: p => /[a-z]/.test(p) },
  { id: 'number',    label: 'At least one number (0–9)',           test: p => /[0-9]/.test(p) },
  { id: 'special',   label: 'At least one special character (!@#$%^&*)', test: p => /[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/.test(p) },
];

function evalRules(pwd) {
  return RULES.map(r => ({ ...r, passed: r.test(pwd) }));
}

// ─── PasswordSection ──────────────────────────────────────────────────────────
// Props:
//   onChange(password, isValid)  — called whenever value or validity changes
//
// Usage on register page:
//   <PasswordSection onChange={(pwd, valid) => { setPassword(pwd); setPwValid(valid); }} />
export default function PasswordSection({ onChange }) {
  const [create,        setCreate]        = useState('');
  const [confirm,       setConfirm]       = useState('');
  const [createFocused, setCreateFocused] = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [confirmVisible,setConfirmVisible]= useState(false);

  const confirmRef = useRef(null);

  const rules        = evalRules(create);
  const allPassed    = rules.every(r => r.passed);
  const confirmMatch = confirm.length > 0 && create === confirm;
  const confirmMismatch = confirm.length > 0 && create !== confirm;
  const isFullyValid = allPassed && confirmMatch;

  // Determine create box border color
  function createBorder() {
    if (!create.length) return '#e0e0e0';
    if (submitted && !allPassed) return '#d03030';
    if (allPassed) return '#20b040';
    return '#e0e0e0';
  }

  // Determine confirm box border color
  function confirmBorder() {
    if (!confirm.length) return '#e0e0e0';
    if (confirmMatch) return '#20b040';
    if (confirmMismatch) return '#d03030';
    return '#e0e0e0';
  }

  function handleCreateChange(e) {
    const val = e.target.value;
    setCreate(val);
    setSubmitted(false);
    onChange?.(val, evalRules(val).every(r => r.passed) && val === confirm);
  }

  function handleConfirmChange(e) {
    const val = e.target.value;
    setConfirm(val);
    onChange?.(create, allPassed && create === val);
  }

  // When user presses Enter on create field: validate immediately
  function handleCreateKeyDown(e) {
    if (e.key === 'Enter') {
      setSubmitted(true);
      if (allPassed) confirmRef.current?.focus();
    }
  }

  // Rule dot color
  function ruleColor(rule) {
    if (!create.length) return '#d0d0d0';          // gray — not yet started
    if (rule.passed)    return '#20b040';           // green — satisfied
    if (submitted)      return '#d03030';           // red — failed on submit attempt
    return '#d0d0d0';                               // gray — not yet satisfied
  }

  function ruleTextColor(rule) {
    if (!create.length) return '#aaa';
    if (rule.passed)    return '#20b040';
    if (submitted)      return '#d03030';
    return '#aaa';
  }

  return (
    <div style={styles.wrapper}>

      {/* ── Create password ── */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Create password</label>
        <div style={styles.inputRow}>
          <input
            type={createVisible ? 'text' : 'password'}
            value={create}
            placeholder="Create a password"
            onChange={handleCreateChange}
            onFocus={() => setCreateFocused(true)}
            onBlur={() => setCreateFocused(false)}
            onKeyDown={handleCreateKeyDown}
            style={{
              ...styles.input,
              borderColor: createBorder(),
              boxShadow: createFocused ? `0 0 0 3px ${allPassed ? '#20b04020' : '#e0e0e040'}` : 'none',
            }}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setCreateVisible(v => !v)}
            style={styles.eyeBtn}
            tabIndex={-1}
          >
            {createVisible ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Requirements — shown once user has focused or started typing */}
        {(createFocused || create.length > 0) && (
          <div style={styles.rules}>
            {rules.map(rule => (
              <div key={rule.id} style={styles.ruleRow}>
                <span style={{ ...styles.dot, backgroundColor: ruleColor(rule) }} />
                <span style={{ ...styles.ruleText, color: ruleTextColor(rule) }}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Inline error on submit with unmet rules */}
        {submitted && !allPassed && (
          <div style={styles.errorBox}>
            {rules.filter(r => !r.passed).map(r => (
              <p key={r.id} style={styles.errorLine}>
                {r.label}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm password ── */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Confirm password</label>
        <div style={styles.inputRow}>
          <input
            ref={confirmRef}
            type={confirmVisible ? 'text' : 'password'}
            value={confirm}
            placeholder="Re-enter your password"
            onChange={handleConfirmChange}
            style={{
              ...styles.input,
              borderColor: confirmBorder(),
            }}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setConfirmVisible(v => !v)}
            style={styles.eyeBtn}
            tabIndex={-1}
          >
            {confirmVisible ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Match indicator */}
        {confirm.length > 0 && (
          <div style={styles.matchRow}>
            <span style={{
              ...styles.dot,
              backgroundColor: confirmMatch ? '#20b040' : '#d03030',
            }} />
            <span style={{
              ...styles.ruleText,
              color: confirmMatch ? '#20b040' : '#d03030',
            }}>
              {confirmMatch ? 'Passwords match' : 'Passwords do not match'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
  },
  inputRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '11px 52px 11px 14px',
    fontSize: '14px',
    border: '1.5px solid',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a1a',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    color: '#999',
    cursor: 'pointer',
    padding: '4px',
    fontFamily: "'DM Sans', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  rules: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    paddingLeft: '2px',
  },
  ruleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  matchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '2px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background-color 0.2s',
  },
  ruleText: {
    fontSize: '12px',
    transition: 'color 0.2s',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    border: '1px solid #f0c0c0',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  errorLine: {
    margin: 0,
    fontSize: '12px',
    color: '#c03030',
  },
};