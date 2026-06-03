import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../context/TripContext';

const STATUS_LABELS = {
  planning: '🗺 Planning', booked: '🎫 Booked',
  ongoing: '✈️ Ongoing', completed: '✅ Completed', cancelled: '❌ Cancelled'
};

export default function TripCard({ trip }) {
  const navigate = useNavigate();
  const { togglePin, toggleArchive, deleteTrip, updateStatus } = useTrips();

  const progress = trip.checklistProgress ?? 0;
  const doneItems = trip.checklistItems?.filter(i => i.completed).length ?? 0;
  const totalItems = trip.checklistItems?.length ?? 0;

  const handleAction = (e, fn) => { e.stopPropagation(); fn(); };

  return (
    <div className={`trip-card fade-in ${trip.isPinned ? 'pinned' : ''}`} onClick={() => navigate(`/trips/${trip._id}`)}>
      {/* Header */}
      <div className={`trip-card-header status-${trip.status}`}>
        {trip.isPinned && <span className="pin-indicator" title="Pinned">📌</span>}
        <div style={{ paddingRight: trip.isPinned ? '1.5rem' : 0 }}>
          <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '.35rem' }}>{trip.destination}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', fontSize: '.8rem', opacity: .85, color: '#fff' }}>
            <span>📅 {trip.days}d</span>
            <span>👥 {trip.members}</span>
            <span>💰 ₹{Number(trip.budget).toLocaleString('en-IN')}</span>
            {trip.departureDate && <span>🗓 {new Date(trip.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="trip-card-body">
        {/* Status + Eco */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
          <span className={`badge badge-${trip.status}`}>{STATUS_LABELS[trip.status]}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.75rem', color: 'var(--muted)' }}>
            <span>Eco</span>
            <div className="eco-dots">
              {[1,2,3,4,5].map(n => <div key={n} className={`eco-dot ${n <= trip.ecoScore ? 'active' : ''}`} />)}
            </div>
          </div>
        </div>

        {/* Checklist progress */}
        {totalItems > 0 && (
          <div style={{ marginBottom: '.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.35rem' }}>
              <span>Checklist</span>
              <span>{doneItems}/{totalItems} done</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Preferences */}
        {trip.preferences?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
            {trip.preferences.slice(0, 3).map(p => (
              <span key={p} style={{
                background: 'var(--green-100)', color: 'var(--green-800)',
                fontSize: '.7rem', padding: '.2rem .55rem', borderRadius: '100px', fontWeight: 500
              }}>{p}</span>
            ))}
            {trip.preferences.length > 3 && (
              <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>+{trip.preferences.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="trip-card-footer">
        <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
          {new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
        <div style={{ display: 'flex', gap: '.25rem' }} onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            title={trip.isPinned ? 'Unpin' : 'Pin'}
            onClick={e => handleAction(e, () => togglePin(trip._id))}
            style={{ fontSize: '.9rem' }}
          >{trip.isPinned ? '📌' : '📍'}</button>

          <select
            value={trip.status}
            onChange={e => updateStatus(trip._id, e.target.value)}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: '.72rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '.2rem .4rem', background: 'var(--stone-50)', cursor: 'pointer', color: 'var(--stone-700)'
            }}
          >
            {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>

          <button
            className="btn btn-ghost btn-icon btn-sm"
            title="Archive"
            onClick={e => handleAction(e, () => toggleArchive(trip._id))}
            style={{ fontSize: '.9rem' }}
          >📦</button>

          <button
            className="btn btn-danger btn-icon btn-sm"
            title="Delete"
            onClick={e => handleAction(e, () => { if (window.confirm(`Delete trip to ${trip.destination}?`)) deleteTrip(trip._id); })}
            style={{ fontSize: '.9rem' }}
          >🗑</button>
        </div>
      </div>
    </div>
  );
}
