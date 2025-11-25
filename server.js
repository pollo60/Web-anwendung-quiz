// Minimaler Node/Express Backend-Server für Quiz-Fortschritt
// Start: npm install && npm start
// ENV: PORT (default 3000), SALT (optional)

const fs = require('fs');
const path = require('path');
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());
// Statisches Serving aller Dateien im Projektverzeichnis (index.html, questions.json, style.css, backend.js etc.)
// Danach kannst du einfach http://localhost:3000/ im Browser öffnen.
app.use(express.static(__dirname));

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'progress.json');
const SALT = process.env.SALT || 'local-dev-salt';

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({ users: {} }, null, 2));
  }
}

function loadStore() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch (e) {
    console.error('Fehler beim Lesen der Store-Datei:', e);
    return { users: {} };
  }
}

function saveStore(store) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Fehler beim Schreiben der Store-Datei:', e);
  }
}

function hashName(name) {
  return crypto.createHash('sha256').update(name + SALT).digest('hex');
}

function newProfile(nameHash) {
  return {
    uid: crypto.randomUUID(),
    nameHash,
    answered: [], // {questionId, correct, ts}
    stats: { xp: 0, level: 1, lifetimeXP: 0, lastSession: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Init / Login by name
app.post('/api/user/init', (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name required' });
  }
  const store = loadStore();
  const nameHash = hashName(String(name).trim().toLowerCase());
  let profile = Object.values(store.users).find(u => u.nameHash === nameHash);
  if (!profile) {
    profile = newProfile(nameHash);
    store.users[profile.uid] = profile;
    saveStore(store);
  }
  return res.json({ uid: profile.uid, progress: profile });
});

// Get full progress
app.get('/api/progress', (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'uid required' });
  const store = loadStore();
  const profile = store.users[uid];
  if (!profile) return res.status(404).json({ error: 'unknown uid' });
  return res.json(profile);
});

// Patch progress (partial)
app.patch('/api/progress', (req, res) => {
  const { uid, answeredUpdate, statsUpdate } = req.body || {};
  if (!uid) return res.status(400).json({ error: 'uid required' });
  const store = loadStore();
  const profile = store.users[uid];
  if (!profile) return res.status(404).json({ error: 'unknown uid' });

  if (Array.isArray(answeredUpdate)) {
    // Prevent unbounded growth: keep last 500
    profile.answered.push(...answeredUpdate.map(a => ({ ...a, ts: Date.now() })));
    if (profile.answered.length > 500) {
      profile.answered = profile.answered.slice(-500);
    }
  }
  if (statsUpdate && typeof statsUpdate === 'object') {
    // Only allow whitelisted fields
    const { xp, level, lifetimeXP } = statsUpdate;
    if (typeof xp === 'number') profile.stats.xp = xp;
    if (typeof level === 'number') profile.stats.level = level;
    if (typeof lifetimeXP === 'number') {
      // lifetimeXP muss monoton nicht kleiner werden
      profile.stats.lifetimeXP = Math.max(profile.stats.lifetimeXP, lifetimeXP);
    }
  }
  profile.stats.lastSession = new Date().toISOString();
  profile.updatedAt = new Date().toISOString();
  saveStore(store);
  return res.json(profile);
});

// Simple health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Quiz Backend läuft auf http://localhost:${PORT}`);
});
