from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import json
import os

app = Flask(__name__)
CORS(app, origins="*")

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')


@app.route("/")
def home():
    return "Backend working da 🔥"

if __name__ == "__main__":
    app.run()
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        days TEXT NOT NULL DEFAULT '[]',
        notes TEXT NOT NULL DEFAULT '[]',
        duration INTEGER DEFAULT 30,
        color TEXT DEFAULT '#f43f5e',
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    conn.commit()
    conn.close()

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

# ── AUTH ──────────────────────────────────────────────────────────────────────

@app.route('/register', methods=['POST'])
def register():
    d = request.get_json()
    username = (d.get('username') or '').strip()
    password = (d.get('password') or '').strip()
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    if len(password) < 4:
        return jsonify({'error': 'Password must be at least 4 characters'}), 400
    conn = get_db()
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hash_pw(password)))
        conn.commit()
        user = conn.execute('SELECT id, username FROM users WHERE username=?', (username,)).fetchone()
        return jsonify({'id': user['id'], 'username': user['username']}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already taken'}), 409
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    d = request.get_json()
    username = (d.get('username') or '').strip()
    password = (d.get('password') or '').strip()
    conn = get_db()
    user = conn.execute('SELECT id, username FROM users WHERE username=? AND password=?',
                        (username, hash_pw(password))).fetchone()
    conn.close()
    if user:
        return jsonify({'id': user['id'], 'username': user['username']}), 200
    return jsonify({'error': 'Invalid username or password'}), 401

# ── HABITS ────────────────────────────────────────────────────────────────────

@app.route('/habits', methods=['GET'])
def get_habits():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400
    conn = get_db()
    rows = conn.execute('SELECT * FROM habits WHERE user_id=?', (user_id,)).fetchall()
    conn.close()
    return jsonify([{
        'id': r['id'], 'name': r['name'],
        'days': json.loads(r['days']),
        'notes': json.loads(r['notes']),
        'duration': r['duration'],
        'color': r['color'],
    } for r in rows])

@app.route('/habits', methods=['POST'])
def create_habits():
    d = request.get_json()
    user_id = d.get('user_id')
    habits  = d.get('habits', [])
    duration = int(d.get('duration', 30))
    if not user_id or not habits:
        return jsonify({'error': 'user_id and habits required'}), 400

    COLORS = ['#f43f5e','#38bdf8','#f59e0b','#10b981','#a855f7','#fb923c','#22d3ee','#e879f9']
    conn = get_db()
    conn.execute('DELETE FROM habits WHERE user_id=?', (user_id,))
    created = []
    for i, name in enumerate(habits):
        days  = json.dumps([False] * duration)
        notes = json.dumps([''] * duration)
        color = COLORS[i % len(COLORS)]
        cur = conn.execute(
            'INSERT INTO habits (user_id, name, days, notes, duration, color) VALUES (?,?,?,?,?,?)',
            (user_id, name, days, notes, duration, color)
        )
        created.append({'id': cur.lastrowid, 'name': name,
                        'days': [False]*duration, 'notes': ['']*duration,
                        'duration': duration, 'color': color})
    conn.commit()
    conn.close()
    return jsonify(created), 201

@app.route('/habits/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    conn = get_db()
    conn.execute('DELETE FROM habits WHERE id=?', (habit_id,))
    conn.commit()
    conn.close()
    return jsonify({'deleted': habit_id})

# ── TOGGLE ────────────────────────────────────────────────────────────────────

@app.route('/toggle', methods=['POST'])
def toggle():
    d = request.get_json()
    habit_id  = d.get('habit_id')
    day_index = d.get('day_index')
    if habit_id is None or day_index is None:
        return jsonify({'error': 'habit_id and day_index required'}), 400
    conn = get_db()
    row = conn.execute('SELECT * FROM habits WHERE id=?', (habit_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Habit not found'}), 404
    days = json.loads(row['days'])
    if 0 <= day_index < len(days):
        days[day_index] = not days[day_index]
        conn.execute('UPDATE habits SET days=? WHERE id=?', (json.dumps(days), habit_id))
        conn.commit()
    conn.close()
    return jsonify({'days': days})

# ── NOTE ──────────────────────────────────────────────────────────────────────

@app.route('/note', methods=['POST'])
def save_note():
    d = request.get_json()
    habit_id  = d.get('habit_id')
    day_index = d.get('day_index')
    note      = d.get('note', '')
    if habit_id is None or day_index is None:
        return jsonify({'error': 'habit_id and day_index required'}), 400
    conn = get_db()
    row = conn.execute('SELECT notes FROM habits WHERE id=?', (habit_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Not found'}), 404
    notes = json.loads(row['notes'])
    if 0 <= day_index < len(notes):
        notes[day_index] = note
        conn.execute('UPDATE habits SET notes=? WHERE id=?', (json.dumps(notes), habit_id))
        conn.commit()
    conn.close()
    return jsonify({'notes': notes})

# ── STATS (leaderboard data per user) ─────────────────────────────────────────

@app.route('/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    users = conn.execute('SELECT id, username FROM users').fetchall()
    result = []
    for u in users:
        habits = conn.execute('SELECT days FROM habits WHERE user_id=?', (u['id'],)).fetchall()
        completed = sum(
            json.loads(h['days']).count(True) for h in habits
        )
        result.append({'username': u['username'], 'xp': completed * 10, 'completed': completed})
    conn.close()
    result.sort(key=lambda x: x['xp'], reverse=True)
    return jsonify(result)

if __name__ == '__main__':
    init_db()
    print("⚡ VILTR Backend running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
