// Frontend-Integration für Remote-Persistenz (lokales Node/Express Backend)
// Erwartet Endpunkte aus server.js
(function() {
  const API_BASE = '';
  let remoteUID = null;
  let lastFlush = 0;
  let offlineQueue = loadOfflineQueue(); // gepufferte Snapshots bei Offline
  let pendingInitName = null; // Name merken, falls Init offline war

  function log(...args) { console.log('[remote]', ...args); }

  async function initRemoteProfile(name) {
    if (!name || !name.trim()) return;
    pendingInitName = name.trim();
    try {
      const r = await fetch(API_BASE + '/api/user/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!r.ok) throw new Error('Init failed ' + r.status);
      const data = await r.json();
      remoteUID = data.uid;
      mergeRemoteProgress(data.progress);
      log('Init OK uid=', remoteUID);
      // Nach erfolgreicher Initialisierung evtl. OfflineQueue flushen
      flushOfflineQueue();
    } catch (e) {
      log('Init Fehler:', e.message);
      // Offline / Fehler: Wird später bei online Event erneut versucht
    }
  }

  function mergeRemoteProgress(progress) {
    if (!progress || !window.STATE) return;
    // Server führt xp/level/lifetimeXP unter stats
    if (progress.stats) {
      // Monotone lifetimeXP sicherstellen
      if (typeof progress.stats.lifetimeXP === 'number') {
        window.STATE.lifetimeXP = Math.max(window.STATE.lifetimeXP || 0, progress.stats.lifetimeXP);
      }
      if (typeof progress.stats.xp === 'number') window.STATE.xp = progress.stats.xp;
      if (typeof progress.stats.level === 'number') window.STATE.level = progress.stats.level;
      if (typeof window.updateXPDisplay === 'function') window.updateXPDisplay();
    }
    // Keine visuelle Änderung nötig – stilles Mergen
  }

  function collectSnapshot() {
    if (!window.STATE) return null;
    return {
      answeredUpdate: [], // Optional: hier einzelne Antworten übertragen
      statsUpdate: {
        xp: window.STATE.xp,
        level: window.STATE.level,
        lifetimeXP: window.STATE.lifetimeXP
      }
    };
  }

  async function flushRemote(force = false) {
    if (!remoteUID) {
      // Falls UID noch fehlt, versuchen wir init erneut (z.B. nach Offline-Phase)
      if (pendingInitName) initRemoteProfile(pendingInitName);
      return;
    }
    const now = Date.now();
    if (!force && now - lastFlush < 5000) return; // nicht zu häufig
    lastFlush = now;
    const snapshot = collectSnapshot();
    if (!snapshot) return;
    try {
      const r = await fetch(API_BASE + '/api/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: remoteUID, ...snapshot })
      });
      if (!r.ok) throw new Error('Patch ' + r.status);
      const data = await r.json();
      mergeRemoteProgress(data); // server könnte lifetimeXP angehoben haben
      log('Fortschritt synchronisiert');
      // Erfolg: Offline Queue flushen falls vorhanden
      flushOfflineQueue();
      // Kein Badge mehr – stiller Erfolg
    } catch (e) {
      log('Sync Fehler:', e.message);
      // Fehler -> Snapshot in Offline-Warteschlange
      queueOfflineSnapshot(snapshot);
      // Still, ohne UI
    }
  }

  // ---------------- Offline Queue Handling ----------------
  function loadOfflineQueue() {
    try {
      const raw = localStorage.getItem('offlineQueue');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function saveOfflineQueue() {
    try { localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue)); } catch {}
  }

  function queueOfflineSnapshot(snapshot) {
    if (!snapshot) return;
    offlineQueue.push({ ts: Date.now(), snapshot });
    // Begrenzen auf letzte 50
    if (offlineQueue.length > 50) offlineQueue = offlineQueue.slice(-50);
    saveOfflineQueue();
    log('Snapshot offline gepuffert. Queue-Länge:', offlineQueue.length);
    // Still nach Offline-Pufferung
  }

  async function flushOfflineQueue() {
    if (!remoteUID || offlineQueue.length === 0) return;
    // Versuche nacheinander alle Snapshots zu senden
    const queueCopy = [...offlineQueue];
    for (const entry of queueCopy) {
      try {
        const r = await fetch(API_BASE + '/api/progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: remoteUID, ...entry.snapshot })
        });
        if (!r.ok) throw new Error('Queue Patch ' + r.status);
        const data = await r.json();
        mergeRemoteProgress(data);
        // Entfernen erfolgreich versendeter Einträge
        offlineQueue = offlineQueue.filter(e => e !== entry);
        saveOfflineQueue();
        log('Offline Snapshot übertragen, verbleibend:', offlineQueue.length);
      } catch (e) {
        log('Fehler beim Übertragen eines Offline-Snapshots:', e.message);
        // Abbrechen – später erneut versuchen
        break;
      }
    }
    // Nach Flush keine UI
  }

  window.addEventListener('online', () => {
    log('Browser ist online – versuche Flush.');
    // Erneute Initialisierung falls UID fehlt
    if (!remoteUID && pendingInitName) initRemoteProfile(pendingInitName);
    flushOfflineQueue();
    flushRemote(true);
    // Online Event – kein Badge mehr
  });

  window.addEventListener('offline', () => {
    log('Browser offline – Fortschritt wird gepuffert.');
    // Offline Event – kein Badge mehr
  });
  // Badge entfernt – keine Darstellung mehr

  function hookShowResults() {
    if (typeof window.showResults !== 'function') return;
    const original = window.showResults;
    window.showResults = function() {
      original();
      flushRemote(true); // nach Abschluss immer flush
    };
  }

  function attachNameListener() {
    const el = document.getElementById('playerName');
    if (!el) return;
    el.addEventListener('blur', () => {
      if (!remoteUID) initRemoteProfile(el.value.trim());
    });
  }

  // Periodisch sync (Fallback bei langen Sessions)
  setInterval(() => flushRemote(false), 15000);

  document.addEventListener('DOMContentLoaded', () => {
    attachNameListener();
    hookShowResults();
    // Falls Name schon vorausgefüllt ist
    const existing = document.getElementById('playerName');
    if (existing && existing.value.trim()) {
      initRemoteProfile(existing.value.trim());
    }
  });
})();
