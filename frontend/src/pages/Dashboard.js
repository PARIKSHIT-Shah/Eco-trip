import React, { useEffect, useState } from 'react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import TripFormModal from '../components/TripFormModal';

const STATUSES = ['all', 'planning', 'booked', 'ongoing', 'completed', 'cancelled'];

export default function Dashboard() {
  const { user } = useAuth();
  const { trips, stats, loading, filter, setFilter, fetchTrips, fetchStats } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    fetchTrips({ archived: showArchive });
    fetchStats();
  }, [filter, showArchive]);

  const firstName = user?.name?.split(' ')[0] || 'Traveller';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-block', background: 'var(--green-100)', color: 'var(--green-800)',
          fontSize: '.75rem', fontWeight: 500, padding: '.3rem 1rem', borderRadius: '100px',
          marginBottom: '.75rem', letterSpacing: '.05em', textTransform: 'uppercase'
        }}>🌍 Sustainable Travel Planner</div>

        <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', color: 'var(--green-900)', marginBottom: '.5rem' }}>
          {greeting}, <em style={{ fontStyle: 'italic', color: 'var(--green-600)' }}>{firstName}</em> 🌿
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Your eco-friendly trips, all in one place. Plan, track, and explore sustainably.
        </p>

        {/* ─── MAIN CTA BUTTON ─── */}
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '.65rem',
            background: 'var(--green-800)', color: '#fff',
            fontSize: '1.05rem', fontWeight: 500, padding: '.9rem 2.25rem',
            borderRadius: '100px', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(22,101,52,.25)',
            transition: 'all .25s'
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(22,101,52,.3)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(22,101,52,.25)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          Plan a New Eco Trip
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Trips', value: stats.total, icon: '🗺' },
            { label: 'Planning', value: stats.planning, icon: '✏️' },
            { label: 'Completed', value: stats.completed, icon: '✅' },
            { label: 'Travellers', value: stats.totalMembers, icon: '👥' },
            { label: 'Avg Eco Score', value: `${stats.avgEcoScore}/5`, icon: '🌱' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '.25rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', fontWeight: 600, color: 'var(--green-800)' }}>{s.value}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <span style={{ position: 'absolute', left: '.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '.9rem' }}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: '2.4rem', background: 'var(--card)' }}
            type="text"
            placeholder="Search destinations…"
            value={filter.search}
            onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filter.status === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '100px', textTransform: 'capitalize', fontSize: '.78rem' }}
              onClick={() => setFilter(p => ({ ...p, status: s }))}
            >{s}</button>
          ))}
        </div>

        {/* Sort */}
        <select
          className="form-select" style={{ width: 'auto', fontSize: '.85rem' }}
          value={filter.sort}
          onChange={e => setFilter(p => ({ ...p, sort: e.target.value }))}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="departure">By departure</option>
          <option value="budget">By budget</option>
        </select>

        {/* Archive toggle */}
        <button
          className={`btn btn-sm ${showArchive ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setShowArchive(p => !p)}
          style={{ fontSize: '.78rem' }}
        >📦 {showArchive ? 'Archived' : 'Archive'}</button>
      </div>

      {/* Trip Grid / Empty */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
          <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--green-600)', margin: '0 auto 1rem' }} />
          Loading trips…
        </div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{showArchive ? '📦' : '🗺️'}</div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--stone-700)', marginBottom: '.5rem' }}>
            {showArchive ? 'No archived trips' : filter.search || filter.status !== 'all' ? 'No trips match your filter' : 'No trips planned yet'}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
            {!showArchive && filter.status === 'all' && !filter.search
              ? 'Click "Plan a New Eco Trip" above to get started!'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {trips.map(trip => <TripCard key={trip._id} trip={trip} />)}
        </div>
      )}

      {showForm && <TripFormModal onClose={() => { setShowForm(false); fetchTrips(); fetchStats(); }} />}
    </div>
  );
}
