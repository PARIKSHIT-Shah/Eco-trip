# 🌿 EcoTrip — Sustainable Travel Planner (MERN Stack)

A beautiful, full-stack MERN application for planning eco-friendly trips with AI-generated itineraries, todo-style trip checklists, and a clean dashboard.

---

## 📁 Project Structure

```
ecotrip/
├── backend/                  # Express + MongoDB API
│   ├── models/
│   │   ├── User.js           # User model (bcrypt password hashing)
│   │   └── Trip.js           # Trip model with checklist sub-documents
│   ├── routes/
│   │   ├── auth.js           # Register, Login, /me
│   │   └── trips.js          # Full CRUD + checklist + status endpoints
│   ├── middleware/
│   │   └── auth.js           # JWT protect middleware
│   ├── server.js             # Express entry point
│   ├── .env.example          # Environment variables template
│   └── package.json
│
└── frontend/                 # React app
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   ├── AuthContext.js  # Global auth state + JWT
        │   └── TripContext.js  # Global trip state + API calls
        ├── components/
        │   ├── Navbar.js       # Sticky nav with user menu
        │   ├── TripCard.js     # Trip card with status, progress, actions
        │   └── TripFormModal.js # New trip form + AI itinerary generation
        ├── pages/
        │   ├── AuthPage.js     # Login / Register
        │   ├── Dashboard.js    # Main dashboard with stats + trip grid
        │   └── TripDetail.js   # Todo checklist + itinerary + trip info
        ├── App.js
        ├── index.js
        ├── index.css
        └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- An [Anthropic API key](https://console.anthropic.com)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecotrip
JWT_SECRET=some_long_random_string_change_this
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

Start the server:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at: `http://localhost:3000`

> The `"proxy": "http://localhost:5000"` in `frontend/package.json` forwards all `/api/*` calls to the backend automatically during development.

---

## 🌟 Features

### Dashboard
- **Personalized greeting** with time-of-day awareness
- **Plan a New Trip** button (top center) opens the trip form
- **Stats bar** — Total trips, Planning, Completed, Travellers, Avg Eco Score
- **Filter & Search** — by status, destination search, sort order
- **Archive toggle** — view archived trips separately

### Trip Planning Form
- Destination, departure date, number of days, group size, budget (₹)
- Accommodation preference (eco-lodge, homestay, tented camp, etc.)
- Multi-select interest chips (Hiking, Wildlife, Wellness, Cycling, etc.)
- Special notes
- **AI Itinerary Generation** — streams a full eco itinerary via Anthropic API

### Trip Cards (Todo-style)
- Color-coded headers by status (planning/booked/ongoing/completed/cancelled)
- **Checklist progress bar** — shows % complete
- Eco score dots (1–5 leaves)
- Quick status change dropdown
- Pin / Archive / Delete actions
- Click to open full detail page

### Trip Detail Page
Three tabs:
1. **✅ Checklist** — Todo list with categories (Packing, Booking, Documents, Health, Other)
   - Toggle items complete/incomplete
   - Add custom items with category
   - Delete items
   - Filter by category
   - Overall progress bar
2. **📋 Itinerary** — Full AI-generated itinerary
3. **ℹ️ Info** — All trip details, preferences, notes

### Auth
- Register / Login with JWT
- Protected routes
- Persistent session via localStorage token

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, get JWT |
| GET | `/api/auth/me` | Get current user |

### Trips (all require `Authorization: Bearer <token>`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/trips` | Get all trips (filterable) |
| GET | `/api/trips/:id` | Get single trip |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| PATCH | `/api/trips/:id/checklist/:itemId` | Toggle checklist item |
| POST | `/api/trips/:id/checklist` | Add checklist item |
| DELETE | `/api/trips/:id/checklist/:itemId` | Remove checklist item |
| PATCH | `/api/trips/:id/status` | Update trip status |
| PATCH | `/api/trips/:id/pin` | Toggle pin |
| PATCH | `/api/trips/:id/archive` | Toggle archive |
| GET | `/api/trips/meta/stats` | Get dashboard stats |

---

## 🌱 Eco Score Logic

Eco score (1–5) is calculated at trip creation based on:
- Number of eco interests selected (3+ = +1)
- Eco-certified accommodation choice (+1)
- Base score: 3

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| State | React Context API |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| AI | Anthropic Claude (streaming) |
| Styling | Custom CSS (no UI library) |

---

## 📦 Production Deployment

1. Build the frontend: `cd frontend && npm run build`
2. Serve `frontend/build` as static files from Express (add `app.use(express.static('build'))`)
3. Set `NODE_ENV=production` and use a real MongoDB Atlas URI
4. Deploy to Railway, Render, or any Node.js host

---

## 🤝 Contributing

Pull requests welcome! Areas to expand:
- Google Maps integration for route planning
- Carbon footprint calculator
- Trip sharing / collaboration
- Photo uploads per trip
- Export itinerary as PDF

---

*Travel lighter. Explore deeper. Leave only footprints. 🌍*
