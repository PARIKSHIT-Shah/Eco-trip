import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="navbar">
      <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div className="logo-mark">🌿</div>
        <div className="logo-text">Eco<span>Trip</span></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {location.pathname !== '/' && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Dashboard
          </button>
        )}

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              background: 'var(--green-50)', border: '1px solid var(--green-200)',
              borderRadius: '100px', padding: '.4rem .9rem .4rem .5rem',
              cursor: 'pointer', transition: '.2s'
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--green-800)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.75rem', fontWeight: 600
            }}>{initials}</div>
            <span style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--green-800)' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
              minWidth: 180, overflow: 'hidden', zIndex: 200
            }}>
              <div style={{ padding: '.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.875rem', fontWeight: 500 }}>{user?.name}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{user?.email}</div>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                style={{
                  width: '100%', padding: '.75rem 1rem', background: 'none',
                  border: 'none', text: 'left', cursor: 'pointer', fontSize: '.875rem',
                  color: 'var(--red-600)', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '.5rem'
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
