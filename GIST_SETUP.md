# GitHub Gist Setup für Quiz-Persistenz

## Schnellstart (3 Schritte)

### 1. GitHub Personal Access Token erstellen

Gehe zu: https://github.com/settings/tokens/new

**Einstellungen:**
- Note: `Quiz Progress Storage`
- Expiration: `No expiration` (oder nach Wunsch)
- Scopes: **Nur `gist`** anhaken (create, update, delete)

Klicke auf "Generate token" und **kopiere den Token** (wird nur einmal angezeigt!)

### 2. Token im Quiz eingeben

Öffne `index.html` im Browser und öffne die Console (F12):

```javascript
setGitHubToken('ghp_DEIN_TOKEN_HIER')
```

Drücke Enter → Seite lädt neu.

### 3. Fertig!

- Namen eingeben + Häkchen setzen
- Quiz spielen
- Browser schließen (auch Private Mode)
- Neu öffnen → Fortschritt wird von Gist geladen! ✨

---

## Wie es funktioniert

- **Pro User ein privater Gist** (basierend auf Name-Hash)
- **Automatisches Sync** alle 30 Sekunden + nach jedem Quiz
- **Merge-Logik**: Höherer Wert (XP/Level) gewinnt
- **Privacy**: Name wird gehasht, nur du siehst deinen Gist

## Troubleshooting

**"Kein GitHub Token gesetzt"** in Console?
→ Führe `setGitHubToken('...')` aus (siehe Schritt 2)

**Token vergessen?**
→ Erstelle neuen Token (Schritt 1) und führe Schritt 2 erneut aus

**Funktioniert nicht in Private Mode?**
→ Token muss in jedem Private Window neu gesetzt werden (Browser-Sicherheit)
→ Alternativ: Token direkt in `gist-storage.js` Zeile 7 hardcoden (nicht empfohlen für öffentliche Repos!)

---

## Alternative: Token hardcoden (nur für private Nutzung!)

In `gist-storage.js` Zeile 7 ändern:

```javascript
const GITHUB_TOKEN = 'ghp_DEIN_TOKEN_HIER';  // Direkter Token
```

⚠️ **ACHTUNG**: Committe diese Datei nicht zu GitHub wenn Token drin steht!

