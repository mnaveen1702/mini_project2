# ⚡ VILTR — Habit Domination System v2

A villain-themed, full-stack habit tracker. Professional SaaS quality.

═══════════════════════════════════════════════════
 HOW TO RUN (Windows PowerShell / CMD)
═══════════════════════════════════════════════════

STEP 1 — Start the Backend
──────────────────────────
Open PowerShell terminal #1:

  cd viltr\backend
  pip install -r requirements.txt
  python app.py

You should see:
  ⚡ VILTR Backend running on http://127.0.0.1:5000


STEP 2 — Start the Frontend
────────────────────────────
Open PowerShell terminal #2:

  cd viltr\frontend
  npm install
  npm run dev

You should see:
  ➜  Local:   http://localhost:3000/


STEP 3 — Open the app
──────────────────────
Go to: http://localhost:3000


═══════════════════════════════════════════════════
 PROJECT STRUCTURE
═══════════════════════════════════════════════════

viltr/
├── backend/
│   ├── app.py            ← Flask API (all endpoints)
│   ├── requirements.txt  ← flask, flask-cors
│   └── database.db       ← SQLite (auto-created on first run)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx               ← Root + routing + theme
│       ├── index.css             ← Global dark/light theme
│       ├── main.jsx
│       ├── api/
│       │   └── api.js            ← All API calls (axios)
│       ├── components/
│       │   ├── Navbar.jsx        ← Top navigation bar
│       │   ├── HabitGrid.jsx     ← Excel-style grid
│       │   ├── AnalyticsPanel.jsx← Charts + stats panel
│       │   ├── LevelBadge.jsx    ← Rank/XP system
│       │   ├── Leaderboard.jsx   ← Multi-user rankings
│       │   └── Toast.jsx         ← Notifications
│       └── pages/
│           ├── Login.jsx         ← Auth (login + register)
│           ├── Setup.jsx         ← Habit configuration
│           └── Dashboard.jsx     ← Main app

═══════════════════════════════════════════════════
 API ENDPOINTS
═══════════════════════════════════════════════════

POST   /register          Create account
POST   /login             Authenticate
GET    /habits?user_id=X  Get habits
POST   /habits            Create/reset habits
DELETE /habits/:id        Delete a habit
POST   /toggle            Toggle day complete
POST   /note              Save day note
GET    /stats             Leaderboard data

═══════════════════════════════════════════════════
 FEATURES
═══════════════════════════════════════════════════

✅ Register / Login with session persistence
✅ 12 preset habits + unlimited custom habits
✅ 7 / 14 / 21 / 30 / 60 / 90 day challenges
✅ Excel-style scrollable habit grid
✅ Color-coded habit cells (each habit has unique color)
✅ Click cell = complete (⚡ icon + animation)
✅ Right-click cell = add daily reflection note
✅ Delete individual habits
✅ Today's focus panel with daily progress
✅ Current streak + best streak tracking
✅ 7-level villain rank system (Civilian → Legend)
✅ XP system (10 XP per completed habit)
✅ 4-tab analytics: Today / Stats / Charts / Habits
✅ Weekly bar chart (last 7 days)
✅ Overall pie chart (completion split)
✅ Leaderboard (all users ranked by XP)
✅ Export progress as CSV report
✅ Dark / Light theme toggle (persists on reload)
✅ Toast notifications for every action
✅ Random villain motivational quotes
✅ No page scrolling (100vh dashboard)
✅ Auto-login on return visit

═══════════════════════════════════════════════════
 TECH STACK
═══════════════════════════════════════════════════

Frontend:  React 18 + Vite + Recharts + Axios
Backend:   Python Flask + Flask-CORS + SQLite
Fonts:     Bebas Neue + Space Mono + DM Sans

═══════════════════════════════════════════════════
 TROUBLESHOOTING
═══════════════════════════════════════════════════

"Cannot connect to server"
→ Make sure backend is running: python app.py
→ Check it says: Running on http://127.0.0.1:5000

"npm not found"
→ Install Node.js from https://nodejs.org

"pip not found"
→ Install Python from https://python.org

VILTR © 2025 — NO EXCUSES. ONLY EXECUTION.
