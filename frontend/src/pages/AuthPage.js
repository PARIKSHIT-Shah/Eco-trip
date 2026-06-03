import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(187,247,208,.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(254,249,195,.3) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 60, height: 60, background: 'var(--green-800)',
            borderRadius: '50% 50% 50% 0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem'
          }}>🌿</div>
          <h1 style={{ fontSize: '2rem', color: 'var(--green-900)', marginBottom: '.25rem' }}>EcoTrip</h1>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Your sustainable travel companion</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '.5rem', marginBottom: '1.5rem',
            background: 'var(--stone-100)', borderRadius: '100px', padding: '.25rem'
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '.5rem', borderRadius: '100px', border: 'none',
                  fontSize: '.875rem', fontWeight: 500, transition: '.2s',
                  background: mode === m ? 'var(--card)' : 'transparent',
                  color: mode === m ? 'var(--green-800)' : 'var(--muted)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none'
                }}
              >{m === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-100)', color: 'var(--red-600)',
                padding: '.75rem 1rem', borderRadius: 'var(--radius-sm)',
                fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.5rem'
              }}>⚠️ {error}</div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '.5rem', padding: '.85rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Processing…</> : (mode === 'login' ? '🌿 Sign In' : '✨ Create Account')}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.8rem', marginTop: '1.5rem' }}>
          Travel lighter. Explore deeper. Leave only footprints. 🌍
        </p>
      </div>
    </div>
  );
}
