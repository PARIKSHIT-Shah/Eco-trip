const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  days: {
    type: Number,
    required: [true, 'Number of days is required'],
    min: [1, 'Must be at least 1 day'],
    max: [365, 'Cannot exceed 365 days']
  },
  members: {
    type: Number,
    required: [true, 'Number of members is required'],
    min: [1, 'Must have at least 1 member']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  departureDate: {
    type: Date
  },
  accommodation: {
    type: String,
    default: ''
  },
  preferences: [{
    type: String
  }],
  notes: {
    type: String,
    default: '',
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  itinerary: {
    type: String,
    default: ''
  },
  ecoScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  // Todo-list style fields
  status: {
    type: String,
    enum: ['planning', 'booked', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  checklistItems: [{
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['packing', 'booking', 'documents', 'health', 'other'],
      default: 'other'
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
}, { timestamps: true });

// Virtual: checklist completion percentage
tripSchema.virtual('checklistProgress').get(function () {
  if (!this.checklistItems.length) return 0;
  const done = this.checklistItems.filter(i => i.completed).length;
  return Math.round((done / this.checklistItems.length) * 100);
});

tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);
