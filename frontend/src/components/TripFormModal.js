import React, { useState } from 'react';
import { useTrips } from '../context/TripContext';

const PREFS = [
  '🥾 Hiking', '🌊 Water sports', '🦜 Wildlife', '🧘 Wellness',
  '🍃 Foraging', '📸 Photography', '🏘 Local culture', '🚴 Cycling', '🌱 Volunteering'
];

const STAYS = [
  'Eco-lodge / Glamping', 'Homestay / Farmstay', 'Budget guesthouse',
  'Tented camp', 'Treehouse / Off-grid cabin', 'Any eco-certified'
];

export default function TripFormModal({ onClose }) {
  const { createTrip } = useTrips();
  const [form, setForm] = useState({
    destination: '', days: '', members: '', budget: '',
    departureDate: new Date().toISOString().split('T')[0],
    accommodation: '', notes: ''
  });
  const [selectedPrefs, setSelectedPrefs] = useState([]);
  const [step, setStep] = useState('form'); // form | generating | done
  const [itinerary, setItinerary] = useState('');
  const [streamText, setStreamText] = useState('');
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
    setStreamText('');

    const prompt = `You are an expert eco-travel planner for India. Create a detailed, practical eco-friendly travel itinerary:

Destination: ${form.destination}
Duration: ${form.days} days | Group: ${form.members} people | Budget: ₹${form.budget}
Departure: ${form.departureDate || 'flexible'} | Stay: ${form.accommodation || 'any eco-friendly'}
Interests: ${selectedPrefs.length ? selectedPrefs.join(', ') : 'general eco travel'}
Notes: ${form.notes || 'none'}

Provide:
1. Eco destination intro (2-3 sentences)
2. Day-by-day itinerary (morning / afternoon / evening)
3. Eco accommodation recommendations with approximate ₹ rates
4. Local sustainable food spots
5. Low-carbon transport tips (trains, buses, cycles)
6. Budget breakdown in ₹
7. Eco packing checklist (5-7 items)
8. Carbon footprint reduction tips

Use clear headings and emojis for readability. Be warm, practical, and inspiring.`;

    let full = '';
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1800,
          stream: true,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = dec.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.delta?.text) {
                full += parsed.delta.text;
                setStreamText(full);
              }
            } catch { }
          }
        }
      }

      setItinerary(full);
      setStep('done');
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
      setStep('form');
    }
  };

  const handleSave = async () => {
    try {
      const ecoScore = Math.min(5, 3 + (selectedPrefs.length > 3 ? 1 : 0) + (form.accommodation.includes('Eco') ? 1 : 0));
      await createTrip({
        ...form,
        days: Number(form.days),
        members: Number(form.members),
        budget: Number(form.budget),
        preferences: selectedPrefs,
        itinerary,
        ecoScore
      });
      onClose();
    } catch (err) {
      setError('Failed to save trip. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target.classList.contains('modal-backdrop') && onClose()}>
      <div className="modal" style={{ maxWidth: step === 'generating' || step === 'done' ? 680 : 580 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--green-900)' }}>
              {step === 'form' ? '🌿 Plan a New Eco Trip' : step === 'generating' ? '✨ Crafting Your Itinerary…' : '🎉 Your Eco Itinerary is Ready!'}
            </h2>
            <p className="text-sm text-muted" style={{ marginTop: '.2rem' }}>
              {step === 'form' ? 'Fill in your trip details' : step === 'generating' ? 'AI is planning your sustainable adventure' : 'Review and save to your dashboard'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* ── FORM ── */}
          {step === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group">
                <label className="form-label">📍 Destination</label>
                <input className="form-input" type="text" placeholder="e.g. Coorg, Karnataka or Valley of Flowers, Uttarakhand"
                  value={form.destination} onChange={e => set('destination', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">📅 Departure Date</label>
                  <input className="form-input" type="date" value={form.departureDate} onChange={e => set('departureDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">🌙 Number of Days</label>
                  <input className="form-input" type="number" placeholder="5" min="1" max="90"
                    value={form.days} onChange={e => set('days', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">👥 Group Size</label>
                  <input className="form-input" type="number" placeholder="2" min="1" max="50"
                    value={form.members} onChange={e => set('members', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">💰 Budget (₹)</label>
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
                ✨ Generate My Eco Trip :
              </button>
            </div>
          )}

          {/* ── GENERATING ── */}
          {(step === 'generating' || step === 'done') && (
            <div>
              {step === 'generating' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem', color: 'var(--green-700)', fontSize: '.875rem' }}>
                  <span className="spinner" style={{ borderTopColor: 'var(--green-600)' }} />
                  Planning your sustainable adventure for {form.destination}…
                </div>
              )}

              <div style={{
                background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
                borderRadius: 'var(--radius-md)', padding: '1.25rem',
                maxHeight: '50vh', overflowY: 'auto'
              }}>
                <pre style={{ fontFamily: 'inherit', fontSize: '.875rem', color: 'var(--green-900)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {streamText || '🌿 Starting your eco itinerary…'}
                </pre>
              </div>

              {step === 'done' && (
                <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('form')}>← Edit Details</button>
                  <button className="btn btn-primary" style={{ flex: 2, padding: '.85rem' }} onClick={handleSave}>
                    💾 Save to Dashboard
                  </button>
                </div>
              )}
              {error && (
                <div style={{ background: 'var(--red-100)', color: 'var(--red-600)', padding: '.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '.875rem', marginTop: '1rem' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
