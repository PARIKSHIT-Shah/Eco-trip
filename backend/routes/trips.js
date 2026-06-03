const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// ─── GET all trips for user ───────────────────────────────────────────────────
// GET /api/trips?status=planning&search=Goa&sort=newest
router.get('/', async (req, res) => {
  try {
    const { status, search, sort = 'newest', archived = 'false' } = req.query;
    const filter = { user: req.user._id, isArchived: archived === 'true' };

    if (status && status !== 'all') filter.status = status;
    if (search) filter.destination = { $regex: search, $options: 'i' };

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      departure: { departureDate: 1 },
      budget: { budget: -1 }
    };

    const trips = await Trip.find(filter)
      .sort({ isPinned: -1, ...(sortMap[sort] || sortMap.newest) })
      .lean({ virtuals: true });

    res.json({ success: true, count: trips.length, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET single trip ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id })
      .lean({ virtuals: true });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── CREATE trip ──────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      destination, days, members, budget, departureDate,
      accommodation, preferences, notes, itinerary, ecoScore,
      status, checklistItems, tags
    } = req.body;

    const trip = await Trip.create({
      user: req.user._id,
      destination, days, members, budget,
      departureDate: departureDate || null,
      accommodation, preferences, notes, itinerary,
      ecoScore: ecoScore || 3,
      status: status || 'planning',
      checklistItems: checklistItems || getDefaultChecklist(),
      tags: tags || []
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalTrips: 1 } });

    res.status(201).json({ success: true, trip });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── UPDATE trip ──────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE trip ──────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TOGGLE checklist item ────────────────────────────────────────────────────
router.patch('/:id/checklist/:itemId', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const item = trip.checklistItems.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Checklist item not found' });

    item.completed = !item.completed;
    await trip.save();

    const updated = trip.toJSON();
    res.json({ success: true, trip: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADD checklist item ───────────────────────────────────────────────────────
router.post('/:id/checklist', async (req, res) => {
  try {
    const { text, category } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    trip.checklistItems.push({ text, category: category || 'other' });
    await trip.save();

    res.json({ success: true, trip: trip.toJSON() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE checklist item ────────────────────────────────────────────────────
router.delete('/:id/checklist/:itemId', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    trip.checklistItems.pull({ _id: req.params.itemId });
    await trip.save();

    res.json({ success: true, trip: trip.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TOGGLE pin ───────────────────────────────────────────────────────────────
router.patch('/:id/pin', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    trip.isPinned = !trip.isPinned;
    await trip.save();
    res.json({ success: true, trip: trip.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── TOGGLE archive ───────────────────────────────────────────────────────────
router.patch('/:id/archive', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    trip.isArchived = !trip.isArchived;
    await trip.save();
    res.json({ success: true, trip: trip.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── UPDATE status ────────────────────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['planning', 'booked', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    ).lean({ virtuals: true });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── STATS ────────────────────────────────────────────────────────────────────
router.get('/meta/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const trips = await Trip.find({ user: userId, isArchived: false });

    const stats = {
      total: trips.length,
      planning: trips.filter(t => t.status === 'planning').length,
      booked: trips.filter(t => t.status === 'booked').length,
      ongoing: trips.filter(t => t.status === 'ongoing').length,
      completed: trips.filter(t => t.status === 'completed').length,
      totalMembers: trips.reduce((s, t) => s + t.members, 0),
      totalBudget: trips.reduce((s, t) => s + t.budget, 0),
      avgEcoScore: trips.length
        ? (trips.reduce((s, t) => s + (t.ecoScore || 3), 0) / trips.length).toFixed(1)
        : 0
    };

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper: default eco packing checklist
function getDefaultChecklist() {
  return [
    { text: 'Book eco-certified accommodation', category: 'booking', completed: false },
    { text: 'Research low-carbon transport options', category: 'booking', completed: false },
    { text: 'Pack reusable water bottle', category: 'packing', completed: false },
    { text: 'Pack reusable shopping bag', category: 'packing', completed: false },
    { text: 'Pack reef-safe sunscreen', category: 'packing', completed: false },
    { text: 'Download offline maps', category: 'other', completed: false },
    { text: 'Check visa requirements', category: 'documents', completed: false },
    { text: 'Travel insurance sorted', category: 'documents', completed: false },
    { text: 'Notify bank of travel', category: 'other', completed: false },
    { text: 'Research local eco tour operators', category: 'booking', completed: false }
  ];
}

module.exports = router;
