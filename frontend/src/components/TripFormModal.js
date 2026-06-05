import React, { useState } from 'react';
import axios from 'axios';
import { useTrips } from '../context/TripContext';

const PREFS = [
  '🥾 Hiking', '🌊 Water sports', '🦜 Wildlife', '🧘 Wellness',
  '🍃 Foraging', '📸 Photography', '🏘 Local culture', '🚴 Cycling', '🌱 Volunteering'
];

const STAYS = [
  'Eco-lodge / Glamping', 'Homestay / Farmstay', 'Budget guesthouse',
  'Tented camp', 'Treehouse / Off-grid cabin', 'Any eco-certified'
];

const SPOT_ICONS = ['🏛', '🌄', '🏖', '🌿', '⛩', '🗼', '🎭', '🏰', '🌊', '🎑', '🌁', '🏯'];
const FOOD_ICONS = ['🍜', '🥘', '🍛', '🫕', '🥗', '🍱', '🫙', '🥧', '🍢', '🫔'];
const CATEGORY_COLORS = {
  Nature: '#16a34a', History: '#b45309', Adventure: '#7c3aed',
  Culture: '#b45309', Beach: '#0284c7', Food: '#c2410c', Shopping: '#7c3aed'
};

export default function TripFormModal({ onClose }) {
  const { createTrip } = useTrips();
  const [form, setForm] = useState({
    destination: '', days: '', members: '', budget: '',
    departureDate: new Date().toISOString().split('T')[0],
    accommodation: '', notes: ''
  });
  const [selectedPrefs, setSelectedPrefs] = useState([]);
  const [step, setStep] = useState('form'); // form | generating | plan | saving
  const [aiPlan, setAiPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const togglePref = (p) => setSelectedPrefs(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
  );

  const handleGenerate = async () => {
    if (!form.destination || !form.days || !form.members || !form.budget) {
      setError('Please fill in destination, days, group size, and budget.');
      return;
    }
    setError('');
    setStep('generating');

    try {
      const { data } = await axios.post('/api/ai/plan', {
        destination: form.destination,
        days: form.days ? Number(form.days) : undefined,
        members: form.members ? Number(form.members) : undefined,
        budget: form.budget,
        departureDate: form.departureDate,
        accommodation: form.accommodation,
        preferences: selectedPrefs,
        notes: form.notes
      });
      setAiPlan(data.plan);
      setActiveDay(0);
      setStep('plan');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'AI planning failed. Please try again.');
      setStep('form');
    }
  };

  const handleSave = async () => {
    setStep('saving');
    try {
      const ecoScore = Math.min(5, 3 + (selectedPrefs.length > 3 ? 1 : 0) + (form.accommodation.includes('Eco') ? 1 : 0));
      // Serialize AI plan as formatted text for the itinerary field
      let itineraryText = '';
      if (aiPlan) {
        itineraryText += `🌍 ABOUT ${form.destination.toUpperCase()}\n${aiPlan.overview}\n\n`;
        if (aiPlan.tourist_spots?.length) {
          itineraryText += `🗺 TOP PLACES TO VISIT\n`;
          aiPlan.tourist_spots.forEach((s, i) => {
            itineraryText += `${i + 1}. ${s.name} [${s.category}]\n   ${s.description}\n   ⏰ Best time: ${s.best_time}\n\n`;
          });
        }
        if (aiPlan.famous_food?.length) {
          itineraryText += `🍽 MUST-TRY FOOD\n`;
          aiPlan.famous_food.forEach((f, i) => {
            itineraryText += `${i + 1}. ${f.name}: ${f.description}\n`;
          });
          itineraryText += '\n';
        }
        if (aiPlan.special_info) {
          itineraryText += `✨ LOCAL SECRETS & TIPS\n${aiPlan.special_info}\n\n`;
        }
        if (aiPlan.itinerary?.length) {
          itineraryText += `📋 DAY-BY-DAY ITINERARY\n\n`;
          aiPlan.itinerary.forEach(day => {
            itineraryText += `📅 DAY ${day.day} — ${day.title}\n`;
            day.slots?.forEach(slot => {
              itineraryText += `  ${slot.time} | ${slot.activity}\n  ${slot.description}\n`;
            });
            itineraryText += '\n';
          });
        }
      }
      await createTrip({
        ...form,
        days: Number(form.days),
        members: Number(form.members),
        budget: Number(form.budget),
        preferences: selectedPrefs,
        itinerary: itineraryText,
        ecoScore
      });
      onClose();
    } catch (err) {
      setError('Failed to save trip. Please try again.');
      setStep('plan');
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target.classList.contains('modal-backdrop') && onClose()}>
      <div className="modal" style={{ maxWidth: step === 'plan' ? 760 : 580, maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--green-900)' }}>
              {step === 'form' ? '🌿 Plan a New Eco Trip'
                : step === 'generating' ? '✨ AI is Planning Your Trip…'
                  : step === 'plan' ? `🎉 Your Eco Plan for ${form.destination}`
                    : '💾 Saving your trip…'}
            </h2>
            <p className="text-sm text-muted" style={{ marginTop: '.2rem' }}>
              {step === 'form' ? 'Fill in your trip details'
                : step === 'generating' ? 'Claude AI is crafting your sustainable adventure'
                  : step === 'plan' ? 'Review your AI-generated itinerary, then save'
                    : 'Almost done!'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* ── FORM ── */}
          {step === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">📍 Destination <span style={{ color: 'var(--red-600)' }}>*</span></label>
                <input className="form-input" type="text" placeholder="e.g. Coorg, Karnataka or Valley of Flowers"
                  value={form.destination} onChange={e => set('destination', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">📅 Departure Date</label>
                  <input className="form-input" type="date" value={form.departureDate} onChange={e => set('departureDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">🌙 Number of Days <span style={{ color: 'var(--red-600)' }}>*</span></label>
                  <input className="form-input" type="number" placeholder="5" min="1" max="90"
                    value={form.days} onChange={e => set('days', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">👥 Group Size <span style={{ color: 'var(--red-600)' }}>*</span></label>
                  <input className="form-input" type="number" placeholder="2" min="1" max="50"
                    value={form.members} onChange={e => set('members', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">💰 Budget (₹) <span style={{ color: 'var(--red-600)' }}>*</span></label>
                  <input className="form-input" type="number" placeholder="15000" min="0"
                    value={form.budget} onChange={e => set('budget', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">🏕 Accommodation Preference</label>
                <select className="form-select" value={form.accommodation} onChange={e => set('accommodation', e.target.value)}>
                  <option value="">Choose type...</option>
                  {STAYS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">✅ Interests (select all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem', marginTop: '.25rem' }}>
                  {PREFS.map(p => (
                    <div key={p} className={`pref-chip ${selectedPrefs.includes(p) ? 'active' : ''}`}
                      onClick={() => togglePref(p)}>{p}</div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">🗒 Special Notes</label>
                <textarea className="form-textarea" placeholder="Dietary needs, mobility considerations, special requests..."
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              {error && (
                <div style={{ background: 'var(--red-100)', color: 'var(--red-600)', padding: '.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '.875rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <button className="btn btn-primary" style={{ padding: '1rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }} onClick={handleGenerate}>
                ✨ Generate My AI Eco Plan
              </button>
            </div>
          )}

          {/* ── GENERATING ── */}
          {step === 'generating' && (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🌿</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', marginBottom: '1rem', color: 'var(--green-700)', fontSize: '1rem', fontWeight: 500 }}>
                <span className="spinner" style={{ borderTopColor: 'var(--green-600)', width: 24, height: 24 }} />
                AI is planning your trip to {form.destination}…
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>
                Building a day-by-day itinerary, finding top spots, local food & eco tips.<br />This takes about 15 seconds.
              </p>
            </div>
          )}

          {/* ── AI PLAN VIEW ── */}
          {step === 'plan' && aiPlan && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Overview Banner */}
              <div style={{
                background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
                borderRadius: 'var(--radius-md)', padding: '1.5rem',
                color: '#fff', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, background: 'rgba(255,255,255,.06)', borderRadius: '50%' }} />
                <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: '.5rem' }}>✦ Your AI Eco Travel Plan</p>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'Fraunces, serif', marginBottom: '.75rem' }}>{form.destination}</h2>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {form.days && <span style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: '100px', fontSize: '.78rem' }}>📅 {form.days} days</span>}
                  {form.budget && <span style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: '100px', fontSize: '.78rem' }}>💰 ₹{Number(form.budget).toLocaleString('en-IN')}</span>}
                  {form.members && <span style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: '100px', fontSize: '.78rem' }}>👥 {form.members} people</span>}
                  {form.departureDate && <span style={{ background: 'rgba(255,255,255,.2)', padding: '.25rem .75rem', borderRadius: '100px', fontSize: '.78rem' }}>🗓 {form.departureDate}</span>}
                </div>
                {aiPlan.overview && <p style={{ opacity: .88, fontSize: '.9rem', lineHeight: 1.7 }}>{aiPlan.overview}</p>}
              </div>

              {/* Tourist Spots */}
              {aiPlan.tourist_spots?.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--green-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    🗺 Top Places to Visit
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.75rem' }}>
                    {aiPlan.tourist_spots.map((spot, i) => (
                      <div key={i} className="card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.6rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{SPOT_ICONS[i % SPOT_ICONS.length]}</span>
                          {spot.category && (
                            <span style={{
                              background: `${CATEGORY_COLORS[spot.category] || '#16a34a'}18`,
                              color: CATEGORY_COLORS[spot.category] || '#16a34a',
                              fontSize: '.7rem', fontWeight: 600, padding: '.2rem .6rem', borderRadius: '100px'
                            }}>{spot.category}</span>
                          )}
                        </div>
                        <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '.95rem', marginBottom: '.4rem', color: 'var(--green-900)' }}>{spot.name}</h4>
                        <p style={{ color: 'var(--muted)', fontSize: '.8rem', lineHeight: 1.5, marginBottom: '.5rem' }}>{spot.description}</p>
                        {spot.best_time && <p style={{ fontSize: '.72rem', color: 'var(--green-700)' }}>⏰ Best: {spot.best_time}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Famous Food */}
              {aiPlan.famous_food?.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--green-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    🍽 Must-Try Local Food
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.6rem' }}>
                    {aiPlan.famous_food.map((food, i) => (
                      <div key={i} className="card" style={{ padding: '.9rem 1rem', display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{FOOD_ICONS[i % FOOD_ICONS.length]}</span>
                        <div>
                          <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '.85rem', marginBottom: '.25rem', color: 'var(--green-900)' }}>{food.name}</h4>
                          <p style={{ color: 'var(--muted)', fontSize: '.78rem', lineHeight: 1.4 }}>{food.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Info */}
              {aiPlan.special_info && (
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--green-900)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    ✨ Eco Tips & Hidden Gems
                  </h3>
                  <div style={{
                    background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
                    borderLeft: '4px solid var(--green-600)',
                    borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem'
                  }}>
                    <p style={{ color: 'var(--stone-700)', fontSize: '.9rem', lineHeight: 1.8 }}>{aiPlan.special_info}</p>
                  </div>
                </div>
              )}

              {/* Day-by-Day Itinerary */}
              {aiPlan.itinerary?.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--green-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    📋 Day-by-Day Itinerary
                  </h3>

                  {/* Day Tabs */}
                  <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {aiPlan.itinerary.map((day, i) => (
                      <button key={i} onClick={() => setActiveDay(i)}
                        style={{
                          padding: '.4rem 1rem', borderRadius: '100px',
                          border: `1.5px solid ${activeDay === i ? 'var(--green-600)' : 'var(--border)'}`,
                          background: activeDay === i ? 'var(--green-100)' : 'transparent',
                          color: activeDay === i ? 'var(--green-800)' : 'var(--muted)',
                          cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, transition: '.15s'
                        }}>
                        Day {day.day}
                      </button>
                    ))}
                  </div>

                  {aiPlan.itinerary[activeDay] && (
                    <div className="card" style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontFamily: 'Fraunces, serif', color: 'var(--green-700)', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
                        Day {aiPlan.itinerary[activeDay].day} — {aiPlan.itinerary[activeDay].title}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {aiPlan.itinerary[activeDay].slots?.map((slot, si) => (
                          <div key={si} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                            {si < aiPlan.itinerary[activeDay].slots.length - 1 && (
                              <div style={{ position: 'absolute', left: 45, top: 28, width: 2, height: '100%', background: 'var(--green-100)' }} />
                            )}
                            <div style={{ width: 56, flexShrink: 0, paddingTop: 12 }}>
                              <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--green-600)', whiteSpace: 'nowrap' }}>{slot.time}</span>
                            </div>
                            <div style={{ flexShrink: 0, paddingTop: 16 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green-500)', boxShadow: '0 0 0 3px var(--green-100)' }} />
                            </div>
                            <div style={{ flex: 1, padding: '8px 0 20px' }}>
                              <h5 style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.25rem', color: 'var(--green-900)' }}>{slot.activity}</h5>
                              <p style={{ color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.5 }}>{slot.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {error && (
                <div style={{ background: 'var(--red-100)', color: 'var(--red-600)', padding: '.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '.875rem' }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: '.75rem', paddingBottom: '.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('form')}>← Edit Details</button>
                <button className="btn btn-primary" style={{ flex: 2, padding: '.9rem' }} onClick={handleSave}>
                  💾 Save to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* ── SAVING ── */}
          {step === 'saving' && (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💾</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', color: 'var(--green-700)', fontSize: '1rem' }}>
                <span className="spinner" style={{ borderTopColor: 'var(--green-600)', width: 24, height: 24 }} />
                Saving your trip plan…
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
