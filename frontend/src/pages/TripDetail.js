import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTrips } from '../context/TripContext';

const CATEGORY_COLORS = {
  packing: { bg: 'var(--sky-100)', color: 'var(--sky-600)', icon: '🎒' },
  booking: { bg: 'var(--purple-100)', color: 'var(--purple-600)', icon: '🎫' },
  documents: { bg: 'var(--earth-100)', color: 'var(--earth-700)', icon: '📄' },
  health: { bg: 'var(--red-100)', color: 'var(--red-600)', icon: '💊' },
  other: { bg: 'var(--stone-100)', color: 'var(--stone-500)', icon: '📌' }
};

const STATUS_LABELS = {
  planning: '🗺 Planning', booked: '🎫 Booked',
  ongoing: '✈️ Ongoing', completed: '✅ Completed', cancelled: '❌ Cancelled'
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleChecklistItem, addChecklistItem, deleteChecklistItem, updateStatus, deleteTrip } = useTrips();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCat, setNewCat] = useState('other');
  const [activeTab, setActiveTab] = useState('checklist');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const { data } = await axios.get(`/api/trips/${id}`);
      setTrip(data.trip);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemId) => {
    const updated = await toggleChecklistItem(trip._id, itemId);
    setTrip(updated);
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    const updated = await addChecklistItem(trip._id, newItem.trim(), newCat);
    setTrip(updated);
    setNewItem('');
  };

  const handleDeleteItem = async (itemId) => {
    const updated = await deleteChecklistItem(trip._id, itemId);
    setTrip(updated);
  };

  const handleStatusChange = async (status) => {
    await updateStatus(trip._id, status);
    setTrip(p => ({ ...p, status }));
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete trip to ${trip.destination}? This cannot be undone.`)) {
      await deleteTrip(trip._id);
      navigate('/');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--green-600)' }} />
      <p style={{ color: 'var(--muted)' }}>Loading trip…</p>
    </div>
  );

  if (!trip) return null;

  const checklist = trip.checklistItems || [];
  const filtered = filterCat === 'all' ? checklist : checklist.filter(i => i.category === filterCat);
  const done = checklist.filter(i => i.completed).length;
  const progress = checklist.length ? Math.round((done / checklist.length) * 100) : 0;

  const grouped = {};
  filtered.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: '1.5rem' }}>
        ← Back to Dashboard
      </button>

      {/* Trip Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
        borderRadius: 'var(--radius-xl)', padding: '2rem', color: '#fff', marginBottom: '1.5rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: .06 }}>🌿</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: '#fff', marginBottom: '.5rem' }}>{trip.destination}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', fontSize: '.875rem', opacity: .85 }}>
              <span>📅 {trip.days} days</span>
              <span>👥 {trip.members} people</span>
              <span>💰 ₹{Number(trip.budget).toLocaleString('en-IN')}</span>
              {trip.departureDate && <span>🗓 {new Date(trip.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              {trip.accommodation && <span>🏡 {trip.accommodation}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <select
              value={trip.status}
              onChange={e => handleStatusChange(e.target.value)}
              style={{
                background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)',
                borderRadius: '100px', padding: '.4rem .9rem', color: '#fff',
                fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v} style={{ color: 'var(--text)', background: '#fff' }}>{l}</option>)}
            </select>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Delete</button>
          </div>
        </div>

        {/* Eco score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '.8rem', opacity: .8 }}>Eco Score:</span>
          <div className="eco-dots">
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{ width: 10, height: 10, borderRadius: '50%', background: n <= trip.ecoScore ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)' }} />
            ))}
          </div>
          <span style={{ fontSize: '.8rem', opacity: .8 }}>{trip.ecoScore}/5</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '.5rem' }}>
        {[
          { id: 'checklist', label: `✅ Checklist (${done}/${checklist.length})` },
          { id: 'itinerary', label: '📋 Itinerary' },
          { id: 'info', label: 'ℹ️ Info' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none',
              background: activeTab === tab.id ? 'var(--green-100)' : 'transparent',
              color: activeTab === tab.id ? 'var(--green-800)' : 'var(--muted)',
              fontWeight: activeTab === tab.id ? 500 : 400, fontSize: '.875rem',
              cursor: 'pointer', transition: '.15s'
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── CHECKLIST TAB ── */}
      {activeTab === 'checklist' && (
        <div className="fade-in">
          {/* Progress */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
              <span style={{ fontWeight: 500, fontSize: '.9rem' }}>Trip Preparation</span>
              <span style={{ fontSize: '.875rem', color: 'var(--green-700)', fontWeight: 500 }}>{progress}% complete</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '.75rem', fontSize: '.78rem', color: 'var(--muted)' }}>
              <span>✅ {done} done</span>
              <span>⏳ {checklist.length - done} remaining</span>
            </div>
          </div>

          {/* Add new item */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                style={{ flex: '1 1 200px' }}
                placeholder="Add a checklist item…"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              />
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
              >
                {Object.entries(CATEGORY_COLORS).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {k.charAt(0).toUpperCase() + k.slice(1)}</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAddItem} style={{ flexShrink: 0 }}>
                + Add Item
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button className={`btn btn-sm ${filterCat === 'all' ? 'btn-primary' : 'btn-secondary'}`} style={{ borderRadius: '100px' }} onClick={() => setFilterCat('all')}>All</button>
            {Object.entries(CATEGORY_COLORS).map(([cat, { icon }]) => (
              <button key={cat} className={`btn btn-sm ${filterCat === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '100px', textTransform: 'capitalize' }}
                onClick={() => setFilterCat(cat)}>{icon} {cat}</button>
            ))}
          </div>

          {/* Checklist items grouped */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No items in this category</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {Object.entries(grouped).map(([cat, items]) => {
                const { bg, color, icon } = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
                return (
                  <div key={cat} className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '.75rem 1.25rem', background: bg, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ fontSize: '.9rem' }}>{icon}</span>
                      <span style={{ fontSize: '.8rem', fontWeight: 600, color, textTransform: 'capitalize', letterSpacing: '.03em' }}>{cat}</span>
                      <span style={{ fontSize: '.75rem', color, marginLeft: 'auto' }}>
                        {items.filter(i => i.completed).length}/{items.length}
                      </span>
                    </div>
                    <div style={{ padding: '.5rem .75rem' }}>
                      {items.map(item => (
                        <div key={item._id} className="checklist-item">
                          <div className={`check-box ${item.completed ? 'checked' : ''}`} onClick={() => handleToggle(item._id)} />
                          <span className={`checklist-text ${item.completed ? 'done' : ''}`}>{item.text}</span>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone-300)', fontSize: '.85rem', padding: '.2rem', borderRadius: '4px', transition: '.15s', flexShrink: 0 }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--red-600)'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--stone-300)'}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ITINERARY TAB ── */}
      {activeTab === 'itinerary' && (
        <div className="fade-in">
          {trip.itinerary ? (
            <div style={{
              background: 'var(--green-50)',
              border: '1.5px solid var(--green-200)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              fontFamily: 'inherit',
              fontSize: '.88rem',
              color: 'var(--stone-700)',
              lineHeight: 1.9,
              whiteSpace: 'pre-wrap'
            }}>
              {trip.itinerary}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>📋</div>
              <p>No itinerary generated yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── INFO TAB ── */}
      {activeTab === 'info' && (
        <div className="fade-in">
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--green-900)' }}>Trip Details</h3>
            <table style={{ width: '100%', fontSize: '.9rem', borderCollapse: 'collapse' }}>
              {[
                ['Destination', trip.destination],
                ['Dates', trip.departureDate ? `${new Date(trip.departureDate).toLocaleDateString('en-IN')} (${trip.days} days)` : `${trip.days} days`],
                ['Group Size', `${trip.members} people`],
                ['Budget', `₹${Number(trip.budget).toLocaleString('en-IN')}`],
                ['Accommodation', trip.accommodation || 'Not specified'],
                ['Status', STATUS_LABELS[trip.status]],
                ['Eco Score', `${trip.ecoScore}/5 🌱`],
                ['Created', new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })]
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid var(--stone-100)' }}>
                  <td style={{ padding: '.6rem 0', color: 'var(--muted)', width: '40%' }}>{label}</td>
                  <td style={{ padding: '.6rem 0', fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </table>
          </div>

          {trip.preferences?.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '.75rem', color: 'var(--green-900)' }}>Interests</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {trip.preferences.map(p => (
                  <span key={p} style={{ background: 'var(--green-100)', color: 'var(--green-800)', fontSize: '.8rem', padding: '.3rem .8rem', borderRadius: '100px', fontWeight: 500 }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {trip.notes && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '.75rem', color: 'var(--green-900)' }}>Notes</h3>
              <p style={{ fontSize: '.9rem', color: 'var(--stone-700)', lineHeight: 1.7 }}>{trip.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
