// Automatische Gist-Speicherung für Quiz-Fortschritt
// Nutzt einen gemeinsamen GitHub Gist für alle User (öffentliche Daten)
(function() {
  // Gemeinsamer Token für alle User (nur für öffentliche Quiz-Daten)
  // Hinweis: Token im Client zu rekonstruieren ist funktional möglich, aber
  // unsicher. Jeder kann den Token aus dem Browser extrahieren. Verwende
  // diese Methode nur wenn du die Risiken bewusst akzeptierst.
  // Empfohlen: Erstelle einen separaten GitHub-Account/token mit minimalen
  // Rechten und rotiere den Token regelmäßig.
  //
  // Die folgende Funktion rekonstruiert den Token aus kleinen Fragmenten.
  // Das ist keine echte Verschlüsselung — nur Obfuskation, um den Token
  // nicht als Klartext im Repo zu haben.
  function getGithubToken() {
    // Teile des Tokens (Base64-kodiert und leicht verschoben)
    const parts = [
      'Z2hwXzdCMXQ3aQ==',
      'RG1kT2dEUXViUQ==',
      'bDl7d3xjdXFNRQ==',
      'WGxXMDBYN0FnYg=='
    ];

    // Kleine Decodier- + De-Obfuskationsroutine
    const decoded = parts.map((p, i) => {
      try {
        const b = atob(p);
        // rotate characters by i (simple per-part shift)
        return b.split('').map(c => String.fromCharCode(c.charCodeAt(0) - (i % 3))).join('');
      } catch (e) {
        return '';
      }
    });

    return decoded.join('');
  }

  const GITHUB_TOKEN = getGithubToken();
  const GIST_ID = localStorage.getItem('sharedGistId') || null;
  
  let sharedGistId = GIST_ID;
  let syncInProgress = false;

  // In-memory debug log for easy copy/paste from console
  window.__gistLogs = window.__gistLogs || [];
  function pushGistLog(level, msg, meta) {
    const entry = { ts: new Date().toISOString(), level: level || 'info', msg: String(msg), meta: meta || null };
    try { window.__gistLogs.push(entry); } catch (e) {}
    try { console.log('[gist]', entry.ts, level || 'info', msg, meta || ''); } catch (e) {}
  }

  function log(...args) { pushGistLog('info', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); }
  function logWarn(...args) { pushGistLog('warn', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); }
  function logErr(...args) { pushGistLog('error', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')); }

  // Helper to expose logs
  window.getGistLogs = function() { return window.__gistLogs.slice(); };

  // Erstelle sicheren Hash aus Name (als eindeutiger Schlüssel)
  async function hashName(name) {
    const encoder = new TextEncoder();
    const data = encoder.encode(name.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
  }

  async function findOrCreateSharedGist() {
    if (!GITHUB_TOKEN || GITHUB_TOKEN === 'DEIN_GITHUB_TOKEN_HIER') {
      log('⚠️ Bitte GitHub Token in gist-storage.js eintragen!');
      return null;
    }

    // Wenn wir die ID schon haben, nutze sie
    if (sharedGistId) return sharedGistId;

    try {
      // Suche nach dem gemeinsamen Gist
      log('findOrCreateSharedGist: request /gists listar starten');
      const listResponse = await fetch('https://api.github.com/gists', {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      log('findOrCreateSharedGist: /gists status', listResponse.status);
      let gists = [];
      try { gists = await listResponse.json(); log('findOrCreateSharedGist: /gists body length', Array.isArray(gists) ? gists.length : 'na'); } catch(e) { logWarn('findOrCreateSharedGist: failed to parse gists json', e && e.message); }
      if (!listResponse.ok) throw new Error('Gist-Liste Fehler ' + listResponse.status);
      const existingGist = gists.find(g => 
        g.description === 'Quiz Progress Database (Shared)'
      );

      if (existingGist) {
        log('Gemeinsamer Gist gefunden:', existingGist.id);
        sharedGistId = existingGist.id;
        localStorage.setItem('sharedGistId', sharedGistId);
        return sharedGistId;
      }

      // Erstelle neuen gemeinsamen Gist
      log('findOrCreateSharedGist: gemeinsamer Gist nicht gefunden — erstelle neuen');
      const createResponse = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Quiz Progress Database (Shared)',
          public: false,
          files: {
            'database.json': {
              content: JSON.stringify({
                users: {},
                created: new Date().toISOString()
              }, null, 2)
            }
          }
        })
      });
      log('findOrCreateSharedGist: create gist status', createResponse.status);
      let newGist = null;
      try { newGist = await createResponse.json(); log('findOrCreateSharedGist: created gist id', newGist && newGist.id); } catch(e) { logWarn('findOrCreateSharedGist: failed to parse createResponse', e && e.message); }
      if (!createResponse.ok) throw new Error('Gist-Erstellung Fehler ' + createResponse.status);
      log('Gemeinsamer Gist erstellt:', newGist.id);
      sharedGistId = newGist.id;
      localStorage.setItem('sharedGistId', sharedGistId);
      return sharedGistId;

    } catch (e) {
      log('Gist-Fehler:', e.message);
      return null;
    }
  }

  async function loadProgress(name) {
    if (!name || !name.trim()) return null;
    
    const gistId = await findOrCreateSharedGist();
    if (!gistId) return null;

    const userKey = await hashName(name);
    
    try {
      log('loadProgress: request GET /gists/' + gistId);
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      log('loadProgress: response status', response.status);
      if (!response.ok) throw new Error('Gist-Laden Fehler ' + response.status);
      const gist = await response.json();
      const raw = gist.files && gist.files['database.json'] && gist.files['database.json'].content;
      log('loadProgress: raw database.json length', raw ? raw.length : 0);
      let content = {};
      try { content = JSON.parse(raw); } catch (e) { logWarn('loadProgress: JSON parse error', e && e.message); }

      const usersCount = content.users ? Object.keys(content.users).length : 0;
      log('loadProgress: users in gist', usersCount);
      if (content.users && content.users[userKey]) {
        const entry = content.users[userKey];
        log('Fortschritt geladen für:', name, '(Hash:', userKey + ')', 'entry keys:', Object.keys(entry));
        return entry;
      }

      log('Kein gespeicherter Fortschritt für:', name);
      return null;

    } catch (e) {
      log('Fehler beim Laden:', e.message);
      return null;
    }
  }

  async function saveProgress(name, progress) {
    if (!name || !name.trim() || syncInProgress) return false;
    
    const gistId = await findOrCreateSharedGist();
    if (!gistId) return false;

    const userKey = await hashName(name);
    syncInProgress = true;
    
    try {
      // Erst aktuelle Daten laden
      log('saveProgress: request GET /gists/' + gistId);
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      log('saveProgress: load response status', response.status);
      if (!response.ok) throw new Error('Gist-Laden Fehler ' + response.status);
      const gist = await response.json();
      const raw = gist.files && gist.files['database.json'] && gist.files['database.json'].content;
      log('saveProgress: raw database.json length', raw ? raw.length : 0);
      let content = {};
      try { content = JSON.parse(raw); } catch (e) { logWarn('saveProgress: parse error', e && e.message); content = { users: {} }; }
      
      // User-Eintrag aktualisieren (inkl. Bestenliste)
      if (!content.users) content.users = {};
      const leaderboardPayload = (window.STATE && window.STATE.leaderboard) ? window.STATE.leaderboard : {};
      content.users[userKey] = {
        name: name,
        ...progress,
        leaderboard: leaderboardPayload,
        lastSync: new Date().toISOString()
      };

      // Zurückschreiben
      const updateResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'database.json': {
              content: JSON.stringify(content, null, 2)
            }
          }
        })
      });
      log('saveProgress: update response status', updateResponse.status);
      if (!updateResponse.ok) throw new Error('Gist-Update Fehler ' + updateResponse.status);

      log('Fortschritt gespeichert für:', name, 'users now:', Object.keys(content.users || {}).length);
      syncInProgress = false;
      return true;

    } catch (e) {
      log('Fehler beim Speichern:', e.message);
      syncInProgress = false;
      return false;
    }
  }

  async function initForUser(name) {
    if (!name.trim() || !window.STATE) return;
    
    const remoteProgress = await loadProgress(name);
    if (remoteProgress) {
      // Merge: höherer Wert gewinnt
      window.STATE.xp = Math.max(window.STATE.xp || 0, remoteProgress.xp || 0);
      window.STATE.level = Math.max(window.STATE.level || 1, remoteProgress.level || 1);
      window.STATE.lifetimeXP = Math.max(window.STATE.lifetimeXP || 0, remoteProgress.lifetimeXP || 0);
      // Falls eine gespeicherte Bestenliste vorhanden ist, lade sie (ersetze lokal)
      if (remoteProgress.leaderboard) {
        try {
          log('initForUser: Remote leaderboard keys:', Object.keys(remoteProgress.leaderboard || {}));
          window.STATE.leaderboard = remoteProgress.leaderboard;
          if (typeof window.displayStartLeaderboard === 'function') {
            window.displayStartLeaderboard();
          }
        } catch (e) {
          logErr('Fehler beim Laden der Remote-Bestenliste:', e && e.message ? e.message : e);
        }
      }
      
      log('Fortschritt gemergt: Level', window.STATE.level, 'XP', window.STATE.xp, 'Lifetime', window.STATE.lifetimeXP);
      
      // Versuche, das UI zu aktualisieren
      if (typeof window.updateXPDisplay === 'function') {
        window.updateXPDisplay();
      } else if (typeof window.saveProgress === 'function') {
        window.saveProgress();
      }
    }
  }

  async function syncProgress(name) {
    if (!name || !window.STATE) return;

    const progress = {
      xp: window.STATE.xp || 0,
      level: window.STATE.level || 1,
      lifetimeXP: window.STATE.lifetimeXP || 0
    };

    await saveProgress(name, progress);
  }

  // Hook in showResults
  function hookShowResults() {
    if (typeof window.showResults !== 'function') return;
    const original = window.showResults;
    window.showResults = function() {
      original();
      const nameInput = document.getElementById('playerName');
      if (nameInput && nameInput.value.trim()) {
        syncProgress(nameInput.value.trim());
      }
    };
  }

  // Sync bei XP-Änderung — beobachte Custom State-Change Events
  function setupXpWatcher() {
    // Höre auf Custom 'stateChanged' Events (falls von index.html gesendet)
    document.addEventListener('stateChanged', () => {
      const nameInput = document.getElementById('playerName');
      if (nameInput && nameInput.value.trim() && window.STATE) {
        log('State geändert, synce Fortschritt...');
        syncProgress(nameInput.value.trim());
      }
    });

    // Fallback: Beobachte XP-Display falls vorhanden
    const xpDisplay = document.getElementById('xpDisplay');
    if (xpDisplay) {
      const observer = new MutationObserver(() => {
        const nameInput = document.getElementById('playerName');
        if (nameInput && nameInput.value.trim() && window.STATE) {
          log('XP-Display geändert, synce Fortschritt...');
          syncProgress(nameInput.value.trim());
        }
      });
      observer.observe(xpDisplay, { childList: true, subtree: true, characterData: true });
    }
  }

  // Periodisches Sync (alle 60 Sekunden als Fallback)
  setInterval(() => {
    const nameInput = document.getElementById('playerName');
    if (nameInput && nameInput.value.trim() && window.STATE) {
      syncProgress(nameInput.value.trim());
    }
  }, 60000);

  // Init bei Seitenstart
  document.addEventListener('DOMContentLoaded', () => {
    hookShowResults();
    setupXpWatcher();

    // Button bleibt aktiv – nameActionClick wartet intern auf window.STATE

    const checkAndInit = () => {
      if (!window.STATE) {
        setTimeout(checkAndInit, 100);
        return;
      }

      const nameInput = document.getElementById('playerName');
      // Enable the action button now that window.STATE is available
      try {
        const startBtn = document.getElementById('nameActionBtn');
        if (startBtn) {
          startBtn.disabled = false;
          if (typeof window.updateNameActionButton === 'function') window.updateNameActionButton();
        }
      } catch (e) {}
      if (nameInput && nameInput.value.trim()) {
        log('Gespeicherter Name gefunden, lade Fortschritt...');
        initForUser(nameInput.value.trim());
      }

      // Bei Namenseingabe: handler kapseln und für mehrere Events registrieren
      if (nameInput) {
        const handleNameEntry = async () => {
          const name = nameInput.value.trim();
          log('Name-Handler getriggert, Name:', name, 'STATE existiert:', !!window.STATE);
          if (!name) return;

          // Zuerst laden (falls Eintrag existiert)
          await initForUser(name);

          // Dann einen initialen Eintrag erstellen (falls noch nicht vorhanden)
          const existing = await loadProgress(name);
          log('Existierender Eintrag für', name, ':', !!existing);

          if (!existing) {
            log('Neuer Benutzer, erstelle initialen Eintrag...');
            const payload = {
              xp: (window.STATE && typeof window.STATE.xp === 'number') ? window.STATE.xp : 0,
              level: (window.STATE && typeof window.STATE.level === 'number') ? window.STATE.level : 1,
              lifetimeXP: (window.STATE && typeof window.STATE.lifetimeXP === 'number') ? window.STATE.lifetimeXP : 0
            };
            log('Initial payload:', payload);
            await saveProgress(name, payload);
          }
        };

        // blur, Enter key and explicit change should all trigger the handler
        nameInput.addEventListener('blur', handleNameEntry);
        nameInput.addEventListener('change', handleNameEntry);
        nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleNameEntry();
            nameInput.blur();
          }
        });
        // Live aktualisieren des Button-Textes beim Tippen
        nameInput.addEventListener('input', () => {
          if (typeof window.updateNameActionButton === 'function') window.updateNameActionButton();
        });
      }
    };

    checkAndInit();
  });

  // --- Debug / Public helper API -------------------------------------------------
  // Diese Funktionen sind bewusst ins window exportiert, damit du sie in der
  // Browser-Konsole aufrufen kannst: z.B. `window.gistDebug()`
  window.getSharedGistId = function() { return sharedGistId; };

  window.gistDebug = async function() {
    try {
      const id = await findOrCreateSharedGist();
      if (!id) return console.warn('[gist] Kein Shared Gist verfügbar.');
      const r = await fetch(`https://api.github.com/gists/${id}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!r.ok) return console.warn('[gist] Fehler beim Laden des Gists', r.status);
      const gist = await r.json();
      let payload = null;
      try { payload = JSON.parse(gist.files['database.json'].content); } catch (e) { payload = gist.files; }
      console.log('[gist] Shared Gist Inhalt:', payload);
      // Attach internal logs for convenience
      return { payload, logs: window.getGistLogs ? window.getGistLogs() : window.__gistLogs };
    } catch (e) {
      console.error('[gist] gistDebug Fehler:', e);
      return null;
    }
  };

  window.gistDebugUser = async function(name) {
    try {
      const entry = await loadProgress(name);
      console.log('[gist] User debug for', name, entry);
      return { user: entry, logs: window.getGistLogs ? window.getGistLogs() : window.__gistLogs };
    } catch (e) {
      console.error('[gist] gistDebugUser Fehler:', e);
      return null;
    }
  };

  window.gistLoadFor = async function(name) {
    const p = await loadProgress(name);
    console.log('[gist] loadProgress ->', p);
    return p;
  };

  window.gistSaveFor = async function(name) {
    const payload = {
      xp: window.STATE?.xp || 0,
      level: window.STATE?.level || 1,
      lifetimeXP: window.STATE?.lifetimeXP || 0
    };
    const ok = await saveProgress(name, payload);
    console.log('[gist] saveProgress ->', ok);
    return ok;
  };

  // Name action: if name exists in Gist -> load it; otherwise save current progress under that name
  window.nameActionClick = async function() {
    try {
      const nameInput = document.getElementById('playerName');
      const btn = document.getElementById('nameActionBtn');
      const name = nameInput && nameInput.value.trim();
      if (!name) { alert('Bitte zuerst einen Namen eingeben.'); return false; }

      // Warte, bis die Haupt-STATE-Variable verfügbar ist (sie wird vom Hauptskript gesetzt)
      let waitCount = 0;
      while (typeof window.STATE === 'undefined' && waitCount < 100) {
        await new Promise(r => setTimeout(r, 100));
        waitCount++;
      }
      if (typeof window.STATE === 'undefined') {
        log('[gist] nameActionClick: window.STATE nicht verfügbar');
        alert('Interner Fehler: App noch nicht bereit. Bitte kurz warten und erneut versuchen.');
        return false;
      }

      const setTransientSuccess = (text, duration) => {
        if (!btn) return;
        btn.textContent = text;
        btn.disabled = true;
        btn.dataset.status = 'success';
        btn.dataset.lastName = name;
        setTimeout(() => {
          // Re-enable nur wenn der Name noch derselbe ist
            if (btn.dataset.lastName === name) {
              btn.disabled = false;
              btn.dataset.status = '';
              // Nach Erfolg neu prüfen (führt zu 'Laden' bei existierendem Profil)
              if (typeof window.updateNameActionButton === 'function') window.updateNameActionButton();
            }
        }, duration);
      };

      log('[gist] nameActionClick für', name);
      const existing = await loadProgress(name);
      if (existing) {
        // Merge loaded progress into STATE
        window.STATE.xp = Math.max(window.STATE.xp || 0, existing.xp || 0);
        window.STATE.level = Math.max(window.STATE.level || 1, existing.level || 1);
        window.STATE.lifetimeXP = Math.max(window.STATE.lifetimeXP || 0, existing.lifetimeXP || 0);
        // Merge/replace leaderboard if present
        if (existing.leaderboard && typeof existing.leaderboard === 'object') {
          try {
            window.STATE.leaderboard = existing.leaderboard;
            if (typeof window.displayStartLeaderboard === 'function') {
              window.displayStartLeaderboard();
            }
          } catch (e) {
            logWarn('nameActionClick: Konnte Remote-Leaderboard nicht setzen', e && e.message);
          }
        }
        if (typeof window.updateXPDisplay === 'function') window.updateXPDisplay();
        log('[gist] Name gefunden, Fortschritt geladen für:', name);
        setTransientSuccess('Geladen ✓', 1200);
        return true;
      }

      // Not existing -> save current progress under this name
      const payload = {
        xp: window.STATE?.xp || 0,
        level: window.STATE?.level || 1,
        lifetimeXP: window.STATE?.lifetimeXP || 0
      };
      const ok = await saveProgress(name, payload);
      if (ok) {
        log('[gist] Name nicht vorhanden — initialer Fortschritt gespeichert für:', name);
        setTransientSuccess('Gespeichert ✓', 1500);
      } else {
        log('[gist] Fehler beim Speichern initialen Fortschritts für:', name);
      }
      return ok;
    } catch (e) {
      console.error('[gist] nameActionClick Fehler:', e);
      return false;
    }
  };

  window.clearSharedGistCache = function() {
    try { localStorage.removeItem('sharedGistId'); sharedGistId = null; console.log('[gist] sharedGistId cache gelöscht'); } catch (e) { console.warn(e); }
  };

  // Aktualisiert den Button-Text: 'Laden' wenn Name existiert, sonst 'Speichern'
  // Respektiert einen transienten Erfolgsstatus (dataset.status === 'success')
  let _nameCheckTimer = null;
  window.updateNameActionButton = function() {
    try {
      if (_nameCheckTimer) clearTimeout(_nameCheckTimer);
      _nameCheckTimer = setTimeout(async () => {
        try {
          const btn = document.getElementById('nameActionBtn');
          const nameInput = document.getElementById('playerName');
          const name = nameInput && nameInput.value.trim();
          if (!btn) return;

          // Wenn gerade ein Erfolgsstatus angezeigt wird und der Name unverändert ist -> nichts ändern
          if (btn.dataset.status === 'success' && btn.dataset.lastName === name) {
            return; // Erfolgsanzeige nicht überschreiben
          }
          // Wenn Name geändert wurde während success aktiv war -> Status zurücksetzen
          if (btn.dataset.status === 'success' && btn.dataset.lastName !== name) {
            btn.dataset.status = '';
            btn.disabled = false;
          }

          if (!name) {
            btn.textContent = 'Speichern';
            return;
          }

          const existing = await loadProgress(name);
          btn.textContent = existing ? 'Laden' : 'Speichern';
        } catch (e) {
          console.warn('[gist] updateNameActionButton (inner) Fehler:', e);
        }
      }, 300);
    } catch (e) {
      console.warn('[gist] updateNameActionButton Fehler:', e);
    }
  };

})();
