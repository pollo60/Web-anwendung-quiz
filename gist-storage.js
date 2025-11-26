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

  function log(...args) { console.log('[gist]', ...args); }

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
      const listResponse = await fetch('https://api.github.com/gists', {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!listResponse.ok) throw new Error('Gist-Liste Fehler ' + listResponse.status);
      
      const gists = await listResponse.json();
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

      if (!createResponse.ok) throw new Error('Gist-Erstellung Fehler ' + createResponse.status);
      
      const newGist = await createResponse.json();
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
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) throw new Error('Gist-Laden Fehler ' + response.status);
      
      const gist = await response.json();
      const content = JSON.parse(gist.files['database.json'].content);
      
      if (content.users && content.users[userKey]) {
        log('Fortschritt geladen für:', name, '(Hash:', userKey + ')');
        return content.users[userKey];
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
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) throw new Error('Gist-Laden Fehler ' + response.status);
      
      const gist = await response.json();
      const content = JSON.parse(gist.files['database.json'].content);
      
      // User-Eintrag aktualisieren
      if (!content.users) content.users = {};
      content.users[userKey] = {
        name: name,
        ...progress,
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

      if (!updateResponse.ok) throw new Error('Gist-Update Fehler ' + updateResponse.status);
      
      log('Fortschritt gespeichert für:', name);
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

    const checkAndInit = () => {
      if (!window.STATE) {
        setTimeout(checkAndInit, 100);
        return;
      }

      const nameInput = document.getElementById('playerName');
      if (nameInput && nameInput.value.trim()) {
        log('Gespeicherter Name gefunden, lade Fortschritt...');
        initForUser(nameInput.value.trim());
      }

      // Bei Namenseingabe (blur)
      if (nameInput) {
        nameInput.addEventListener('blur', async () => {
          const name = nameInput.value.trim();
          if (name) {
            // Zuerst laden (falls Eintrag existiert)
            await initForUser(name);
            // Dann einen initialen Eintrag erstellen (falls noch nicht vorhanden)
            // Das stellt sicher, dass der Name im Gist registriert ist
            const existing = await loadProgress(name);
            if (!existing && window.STATE) {
              log('Neuer Benutzer, erstelle initialen Eintrag...');
              await saveProgress(name, {
                xp: window.STATE.xp || 0,
                level: window.STATE.level || 1,
                lifetimeXP: window.STATE.lifetimeXP || 0
              });
            }
          }
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
      return payload;
    } catch (e) {
      console.error('[gist] gistDebug Fehler:', e);
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

  window.clearSharedGistCache = function() {
    try { localStorage.removeItem('sharedGistId'); sharedGistId = null; console.log('[gist] sharedGistId cache gelöscht'); } catch (e) { console.warn(e); }
  };

})();
