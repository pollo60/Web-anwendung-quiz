# 📝 Anleitung: Neue Fragen hinzufügen# 📝 Anleitung: Neue Fragen hinzufügen# 📝 Anleitung: Neue Fragen hinzufügen



## 🎯 Überblick



Die Fragen für das Quiz sind jetzt in einer separaten **`questions.json`**-Datei gespeichert. Diese Datei enthält alle unique Fragen mit ihren Tags.## 🎯 Überblick## 🎯 Das neue Tag-System



---



## 🏷️ Tag-System - ÜbersichtDie Fragen für das Quiz sind jetzt in einer separaten **`questions.json`**-Datei gespeichert. Diese Datei enthält alle 99 unique Fragen mit ihren Tags.Seit der Optimierung existiert **jede Frage nur noch einmal** in der Code-Basis. Tags steuern, in welchen Level-Modi die Frage erscheint.



Jede Frage hat ein `tags`-Array, das bestimmt, in welchen Levels sie erscheint:



| Tag | Ursprüngliches Array | Bedeutung | Erscheint in Level |## 📁 Dateistruktur### Verfügbare Tags

|-----|---------------------|-----------|---------------------|

| `uebung` | baseQuestions | Übungsfragen | "Übung" und "Vorlesung (gemischt)" |

| `neue-vorlesung` | neueVorlesungQuestions | Fragen aus neuen Vorlesungen | "Vorlesung (gemischt)" |

| `vl-offiziell` | vorlesungQuestions | Offizielle Vorlesungsfragen | "VL offiziell" und "Vorlesung (gemischt)" |```| Tag | Beschreibung | Erscheint in... |

| `offiziell` | ofizielleQuestions | Offizielle Prüfungsfragen | "Offizielle Fragen" und "Vorlesung (gemischt)" |

**Eine Frage kann mehrere Tags haben!** Beispiel: `"tags": ["uebung", "offiziell"]`

### 📅 Wochen-Tags (optional)

Zusätzlich zu den Level-Tags kannst du Fragen mit Wochen-Tags versehen, um sie mit den "Nur X. Woche"-Modifikatoren zu filtern:

| Tag | Bedeutung | Verwendung |
|-----|-----------|------------|
| `woche3` | Woche 3 Fragen | Fragen aus 2. Übungsblatt + offizielles Quiz Woche 4 |
| `woche4` | Woche 4 Fragen | Fragen aus 3. Übungsblatt (zukünftig) |
| `woche5` | Woche 5 Fragen | Fragen aus 4. Übungsblatt (zukünftig) |

**Beispiel mit Wochen-Tag:** `"tags": ["uebung", "offiziell", "woche3"]`

**Hinweis:** Wochen-Tags können mit anderen Modifikatoren kombiniert werden (z.B. "Nur 3. Woche" + Timer-Modus).

---

Web-anwendung-quiz/|-----|--------------|-----------------|

**Eine Frage kann mehrere Tags haben!** Beispiel: `"tags": ["uebung", "offiziell"]`

├── index.html          (Haupt-Quiz-Anwendung - 1,816 Zeilen)| `uebung` | Übungsfragen | Level "Übung" und "Vorlesung (gemischt)" |

---

├── style.css           (Alle Styles - 1,320 Zeilen)| `neue-vorlesung` | Neue Vorlesungsfragen | Level "Vorlesung (gemischt)" |

## 📁 Dateistruktur

├── questions.json      (Alle Fragen mit Tags - 1,925 Zeilen)| `vl-offiziell` | Offizielle VL-Fragen | Level "VL offiziell" und "Vorlesung (gemischt)" |

```

Web-anwendung-quiz/└── FRAGEN_HINZUFUEGEN.md (Diese Anleitung)| `offiziell` | Offizielle Fragen | Level "Offizielle Fragen" und "Vorlesung (gemischt)" |

├── index.html          (Haupt-Quiz-Anwendung - 1,816 Zeilen)

├── style.css           (Alle Styles - 1,320 Zeilen)```

├── questions.json      (Alle Fragen mit Tags - 1,925 Zeilen)

└── FRAGEN_HINZUFUEGEN.md (Diese Anleitung)**Wichtig:** Tags werden **automatisch zugewiesen** basierend darauf, in welches Array du die Frage einfügst!

```

## 🏷️ Tag-System

---

---

## ✏️ Neue Frage hinzufügen

Jede Frage hat ein `tags`-Array, das bestimmt, in welchen Levels sie erscheint:

### Schritt 1: questions.json öffnen

## ✅ Empfohlenes Format für neue Fragen

Öffne die Datei `questions.json` in einem Text-Editor.

| Tag | Beschreibung | Erscheint in Level |

### Schritt 2: Frage am Ende des Arrays einfügen

|-----|--------------|---------------------|### Einfaches Format (für Copilot)

Die Datei ist ein JSON-Array. Füge deine neue Frage **vor der schließenden eckigen Klammer** `]` ein.

| `uebung` | Übungsfragen | "Übung" und "Vorlesung (gemischt)" |

**Wichtig:** Vergiss nicht das Komma nach der vorherigen Frage!

| `neue-vorlesung` | Neue Vorlesungsfragen | "Vorlesung (gemischt)" |```

### Schritt 3: Frage im richtigen Format definieren

| `vl-offiziell` | Offizielle VL-Fragen | "VL offiziell" und "Vorlesung (gemischt)" |Frage: "Was macht die Annotation @SpringBootApplication?"

---

| `offiziell` | Offizielle Fragen | "Offizielle Fragen" und "Vorlesung (gemischt)" |Typ: multiple

## 📋 Frage-Formate

Schwierigkeit: 1 (easy) / 2 (medium) / 3 (hard) / 4 (expert)

### 1. Multiple Choice (eine richtige Antwort)

**Eine Frage kann mehrere Tags haben!** Beispiel: `"tags": ["uebung", "offiziell"]`Optionen:

```json

{  - Sie definiert eine REST-API

  "difficulty": 2,

  "type": "multiple",---  - Sie markiert die Main-Klasse einer Anwendung ✓

  "question": "Was ist die Funktion der Annotation @Autowired?",

  "options": [  - Sie erstellt ein Logging-Template

    "Sie gibt an, dass eine Methode als Spring Bean registriert werden soll",

    "Sie markiert die Main-Methode des Programms",## ✏️ Neue Frage hinzufügen  - Sie deaktiviert die automatische Konfiguration

    "Sie erstellt eine neue Bean im Spring Container",

    "Sie injiziert eine Bean in eine andere Klasse und stellt diese zur Verfügung"Erklärung: @SpringBootApplication kennzeichnet die Hauptanwendung und kombiniert @Configuration, @EnableAutoConfiguration und @ComponentScan.

  ],

  "correct": 3,### Schritt 1: questions.json öffnenArrays: uebung, neue-vorlesung, offiziell (NICHT vl-offiziell)

  "explanation": "@Autowired injiziert eine Bean in eine andere Klasse und stellt sie dort zur Verfügung.",

  "xp": 20,```

  "tags": ["uebung", "neue-vorlesung", "vl-offiziell", "offiziell"]

}Öffne die Datei `questions.json` in einem Text-Editor.

```

### Vollständiges JSON-Format (zum Copy-Paste)

**Wichtig:**

- `correct` ist **0-basiert** (0 = erste Option, 1 = zweite, usw.)### Schritt 2: Frage am Ende des Arrays einfügen

- `difficulty`: 1 (leicht), 2 (mittel), 3 (schwer), 4 (expert)

- `xp`: Erfahrungspunkte (10-50)```javascript

- `tags`: Array von Tags

Die Datei ist ein JSON-Array. Füge deine neue Frage **vor der schließenden eckigen Klammer** `]` ein.{

### 2. Checkbox (mehrere richtige Antworten)

    difficulty: 2,  // 1=easy, 2=medium, 3=hard, 4=expert

```json

{**Wichtig:** Vergiss nicht das Komma nach der vorherigen Frage!    type: "multiple",  // "multiple", "checkbox", "sort", "matching"

  "difficulty": 2,

  "type": "checkbox",    question: "Was macht die Annotation @SpringBootApplication?",

  "question": "Welche HTTP-Methoden gehören zu Version 1.1?",

  "options": [### Schritt 3: Frage im richtigen Format definieren    options: [

    "GET",

    "HEAD",        "Sie definiert eine REST-API",

    "POST",

    "PUT",## 📋 Frage-Formate        "Sie markiert die Main-Klasse einer Anwendung",

    "DELETE",

    "CONNECT",        "Sie erstellt ein Logging-Template",

    "OPTIONS",

    "TRACE",### 1. Multiple Choice (eine richtige Antwort)        "Sie deaktiviert die automatische Konfiguration"

    "PATCH"

  ],    ],

  "correct": [0, 1, 2, 3, 4, 5, 6, 7, 8],

  "explanation": "Alle diese Methoden gehören zu HTTP/1.1.",```json    correct: 1,  // Index der richtigen Antwort (0-basiert)

  "xp": 20,

  "tags": ["vl-offiziell"]{    explanation: "@SpringBootApplication kennzeichnet die Hauptanwendung und kombiniert @Configuration, @EnableAutoConfiguration und @ComponentScan.",

}

```  "difficulty": 2,    xp: 20  // 10 * difficulty ist Standard



**Wichtig:**  "type": "multiple",}

- `correct` ist ein **Array von Indizes** (0-basiert)

- Alle markierten Optionen müssen korrekt sein  "question": "Was ist die Funktion der Annotation @Autowired?",// Füge diese Frage zu: baseQuestions, neueVorlesungQuestions, ofizielleQuestions



### 3. Textfrage (Freitext mit Schlüsselwörtern)  "options": [```



```json    "Sie gibt an, dass eine Methode als Spring Bean registriert werden soll",

{

  "difficulty": 2,    "Sie markiert die Main-Methode des Programms",---

  "type": "text",

  "question": "Was ist eine Web-Anwendung? (Geben Sie die Definition ein)",    "Sie erstellt eine neue Bean im Spring Container",

  "correct": ["web-anwendung", "client-server", "webbrowser", "web-technologien"],

  "explanation": "Eine Web-Anwendung ist eine auf Web-Technologien basierende Client-Server-Anwendung.",    "Sie injiziert eine Bean in eine andere Klasse und stellt diese zur Verfügung"## 📋 Fragetypen

  "xp": 10,

  "tags": ["vl-offiziell"]  ],

}

```  "correct": 3,### 1. Multiple Choice (`type: "multiple"`)



**Wichtig:**  "explanation": "@Autowired injiziert eine Bean in eine andere Klasse und stellt sie dort zur Verfügung.",- **Nur eine** richtige Antwort

- `correct` ist ein **Array von Schlüsselwörtern**

- Groß-/Kleinschreibung wird ignoriert  "xp": 20,- `correct`: Zahl (Index der richtigen Option, 0-basiert)

- Antwort muss alle Schlüsselwörter enthalten

  "tags": ["uebung", "neue-vorlesung", "vl-offiziell", "offiziell"]- Optionen werden **automatisch gemischt**

---

}

## 💡 Best Practices

```### 2. Checkbox (`type: "checkbox"`)

### Tags richtig wählen

- **Mehrere** richtige Antworten möglich

1. **Nur Übungsfragen** → `["uebung"]`

2. **Nur Vorlesungsfragen** → `["vl-offiziell"]`**Wichtig:**- `correct`: Array von Zahlen, z.B. `[0, 2, 4]`

3. **Nur neue Vorlesungsfragen** → `["neue-vorlesung"]`

4. **Nur offizielle Fragen** → `["offiziell"]`- `correct` ist **0-basiert** (0 = erste Option, 1 = zweite, usw.)- Hinweis "(Mehrfachauswahl)" wird automatisch ergänzt

5. **Überall nutzen** → `["uebung", "neue-vorlesung", "vl-offiziell", "offiziell"]`

- `difficulty`: 1 (leicht), 2 (mittel), 3 (schwer), 4 (expert)

### Difficulty-Level

- `xp`: Erfahrungspunkte (10-50)```javascript

- **1 (Easy)**: Grundlegende Konzepte, Definitionen

- **2 (Medium)**: Anwendungswissen, einfache Code-Snippets- `tags`: Array von Tags{

- **3 (Hard)**: Komplexe Zusammenhänge, Debugging

- **4 (Expert)**: Fortgeschrittene Themen, Best Practices    difficulty: 2,



### XP-Vergabe### 2. Checkbox (mehrere richtige Antworten)    type: "checkbox",



- **10 XP**: Einfache Fragen (difficulty 1)    question: "Welche HTTP-Methoden sind 'safe' (sicher)?",

- **15 XP**: Mittelschwere Fragen (difficulty 2)

- **20 XP**: Schwere Fragen (difficulty 3)```json    options: ["GET", "POST", "HEAD", "PUT", "OPTIONS"],

- **25-50 XP**: Expert-Fragen (difficulty 4)

{    correct: [0, 2, 4],  // GET, HEAD, OPTIONS

---

  "difficulty": 2,    explanation: "Safe HTTP-Methoden: GET, HEAD, OPTIONS ändern keine Serverdaten.",

## ⚠️ Häufige Fehler

  "type": "checkbox",    xp: 25

### 1. Vergessenes Komma

  "question": "Welche HTTP-Methoden gehören zu Version 1.1?",}

```json

// ❌ FALSCH - Komma fehlt nach vorheriger Frage  "options": [```

  },

  {    "GET",

    "difficulty": 1,

```    "HEAD",### 3. Sortieren (`type: "sort"`)



```json    "POST",- Spieler muss Elemente in richtige Reihenfolge bringen

// ✅ RICHTIG - Komma nach vorheriger Frage

  },    "PUT",- `items`: Array der unsortierten Elemente

  {

    "difficulty": 1,    "DELETE",- `correct`: Array in der richtigen Reihenfolge

```

    "CONNECT",

### 2. Falsche `correct`-Indexierung

    "OPTIONS",```javascript

```json

// ❌ FALSCH - correct ist 1-basiert (würde 2. Option nehmen)    "TRACE",{

"options": ["A", "B", "C"],

"correct": 1,  // Wählt "B" statt "A"    "PATCH"    difficulty: 3,

```

  ],    type: "sort",

```json

// ✅ RICHTIG - correct ist 0-basiert  "correct": [0, 1, 2, 3, 4, 5, 6, 7, 8],    question: "Sortiere die HTTP-Versionen chronologisch:",

"options": ["A", "B", "C"],

"correct": 0,  // Wählt "A"  "explanation": "Alle diese Methoden gehören zu HTTP/1.1.",    items: ["HTTP/3", "HTTP/1.0", "HTTP/2", "HTTP/1.1"],

```

  "xp": 20,    correct: ["HTTP/1.0", "HTTP/1.1", "HTTP/2", "HTTP/3"],

### 3. Fehlende Tags

  "tags": ["vl-offiziell"]    explanation: "HTTP-Versionen: 1.0 (1996) → 1.1 (1997) → 2 (2015) → 3 (2022).",

```json

// ❌ FALSCH - Tags fehlen}    xp: 30

{

  "question": "Was ist Spring Boot?",```}

  ...

}```

```

**Wichtig:**

```json

// ✅ RICHTIG - Tags angegeben- `correct` ist ein **Array von Indizes** (0-basiert)### 4. Zuordnen (`type: "matching"`)

{

  "question": "Was ist Spring Boot?",- Alle markierten Optionen müssen korrekt sein- Linke und rechte Begriffe zuordnen

  ...

  "tags": ["uebung"]- `pairs`: Array von Objekten mit `left` und `right`

}

```### 3. Textfrage (Freitext mit Schlüsselwörtern)



---```javascript



## 🧪 JSON validieren```json{



Nach dem Hinzufügen einer Frage:{    difficulty: 2,



1. **Syntax prüfen:** Nutze einen JSON-Validator (z.B. [jsonlint.com](https://jsonlint.com/))  "difficulty": 2,    type: "matching",

2. **Datei testen:** Öffne `index.html` in einem Browser (über HTTP-Server!)

3. **Konsole prüfen:** Sieh nach, ob "✅ Loaded XX questions" erscheint  "type": "text",    question: "Ordne Log-Level den Beschreibungen zu",



---  "question": "Was ist eine Web-Anwendung? (Geben Sie die Definition ein)",    pairs: [



## 🚀 Schnellanleitung für Copilot  "correct": ["web-anwendung", "client-server", "webbrowser", "web-technologien"],        { left: "ERROR", right: "Kritische Fehler" },



Sag einfach:  "explanation": "Eine Web-Anwendung ist eine auf Web-Technologien basierende Client-Server-Anwendung.",        { left: "WARN", right: "Potenzielle Probleme" },



> "Füge eine neue Multiple-Choice-Frage zu questions.json hinzu:    "xp": 10,        { left: "INFO", right: "Wichtige Ereignisse" },

> Frage: 'Was macht @SpringBootApplication?'  

> Optionen: A, B, C, D (C ist korrekt)    "tags": ["vl-offiziell"]        { left: "DEBUG", right: "Entwickler-Details" }

> Tags: uebung, neue-vorlesung  

> Difficulty: 2"}    ],



Copilot wird die Frage automatisch im richtigen Format in `questions.json` einfügen! 🎉```    explanation: "ERROR = kritisch, WARN = Warnung, INFO = Information, DEBUG = Details.",



---    xp: 25



## 📊 Aktuelle Statistik**Wichtig:**}



**Stand:** 100 unique Fragen in `questions.json`- `correct` ist ein **Array von Schlüsselwörtern**```



**Verteilung nach Tags:**- Groß-/Kleinschreibung wird ignoriert

- Die meisten Fragen haben mehrere Tags für maximale Wiederverwendung

- Tag-System eliminiert ~67 Duplikate aus dem alten System- Antwort muss alle Schlüsselwörter enthalten---




---## 🎯 Wo Fragen einfügen?



## 💡 Best Practices### Option 1: Nach Array-Namen + Tags (EMPFOHLEN)



### Tags richtig wählen**Einfach sagen:**

```

1. **Übungsfragen** → `["uebung"]`Füge diese Frage zu folgenden Arrays hinzu:

2. **Vorlesungsfragen** → `["vl-offiziell"]` oder `["neue-vorlesung"]`- baseQuestions (Tag: uebung)

3. **Offizielle Fragen** → `["offiziell"]`- neueVorlesungQuestions (Tag: neue-vorlesung)

4. **Überall nutzen** → `["uebung", "neue-vorlesung", "vl-offiziell", "offiziell"]`- ofizielleQuestions (Tag: offiziell)



### Difficulty-LevelNICHT zu: vorlesungQuestions (Tag: vl-offiziell)

```

- **1 (Easy)**: Grundlegende Konzepte, Definitionen

- **2 (Medium)**: Anwendungswissen, einfache Code-SnippetsDas System weist **automatisch** die richtigen Tags zu basierend auf dem Array!

- **3 (Hard)**: Komplexe Zusammenhänge, Debugging

- **4 (Expert)**: Fortgeschrittene Themen, Best Practices### Option 2: Nach Level-Namen (auch OK)



### XP-Vergabe```

Füge diese Frage zu allen Levels außer "VL offiziell" hinzu

- **10 XP**: Einfache Fragen (difficulty 1)```

- **15 XP**: Mittelschwere Fragen (difficulty 2)

- **20 XP**: Schwere Fragen (difficulty 3)Copilot kennt die Zuordnung:

- **25-50 XP**: Expert-Fragen (difficulty 4)- "Übung" → `baseQuestions`

- "VL offiziell" → `vorlesungQuestions`

---- "Vorlesung (gemischt)" → ALLE Arrays (dedupliziert)

- "Offizielle Fragen" → `ofizielleQuestions`

## 🧪 JSON validieren

---

Nach dem Hinzufügen einer Frage:

## 🔧 Wo im Code einfügen?

1. **Syntax prüfen:** Nutze einen JSON-Validator (z.B. [jsonlint.com](https://jsonlint.com/))

2. **Datei testen:** Öffne `index.html` in einem Browser### Die 4 Fragen-Arrays

3. **Konsole prüfen:** Sieh nach, ob "✅ Loaded XX questions" erscheint

```javascript

---const baseQuestions = [        // Zeile ~1803

    // ... hier Übungsfragen einfügen

## 🚀 Schnellanleitung für Copilot];



Sag einfach:const neueVorlesungQuestions = [ // Zeile ~2775

    // ... hier neue VL-Fragen einfügen

> "Füge eine neue Multiple-Choice-Frage zu questions.json hinzu:  ];

> Frage: 'Was macht @SpringBootApplication?'  

> Optionen: A, B, C, D (C ist korrekt)  const vorlesungQuestions = [    // Zeile ~1549

> Tags: uebung, neue-vorlesung      // ... hier VL-offiziell Fragen einfügen

> Difficulty: 2"];



Copilot wird die Frage automatisch im richtigen Format in `questions.json` einfügen! 🎉const ofizielleQuestions = [    // Zeile ~3342

    // ... hier offizielle Fragen einfügen
];
```

**Tipp:** Am besten **am Ende** des jeweiligen Arrays einfügen (vor der schließenden `]`).

---

## 💡 Best Practices

### ✅ DO

- **Kurze, präzise Fragen** formulieren
- **Eindeutige Antworten** – keine Interpretationsspielräume
- **Erklärungen** immer mitliefern (auch bei einfachen Fragen)
- **XP** an Schwierigkeit anpassen (10/20/30/40)
- **Arrays** explizit nennen wo die Frage rein soll
- **Duplikate vermeiden** – vor dem Hinzufügen prüfen ob Frage schon existiert

### ❌ DON'T

- Keine **mehrdeutigen** Formulierungen
- Keine **veralteten** Informationen
- Nicht **zu viele** Optionen (max. 6 bei multiple choice)
- Keine **Trick-Fragen** ohne pädagogischen Wert
- **Tags nicht manuell** setzen – das macht das System!

---

## 📊 Schwierigkeitsgrade

| Level | Difficulty | XP | Beschreibung |
|-------|------------|----|--------------| 
| Easy | 1 | 10 | Grundlagen, Definition, Fakten |
| Medium | 2 | 20 | Anwendung, Zusammenhänge verstehen |
| Hard | 3 | 30 | Analyse, komplexe Konzepte |
| Expert | 4 | 40 | Synthese, Best Practices, Edge Cases |

---

## 🚀 Beispiel-Prompt für Copilot

```
Füge folgende Frage hinzu:

Frage: "Der Eintrag in der pom.xml-Datei <groupId>edu.fra.uas</groupId> nennt man auch …"
Typ: multiple
Schwierigkeit: 2 (medium)
Optionen:
  - Gruppenkennung (package) ✓
  - Annotation
  - Keines der oben genannten
  - Projektversion
Erklärung: Die groupId ist die Gruppenkennung (package), die organisationsweite, 
           eindeutige Identifikation für Maven-Projekte.

Füge zu: baseQuestions, neueVorlesungQuestions, ofizielleQuestions
NICHT zu: vorlesungQuestions
```

Copilot wird die Frage **nur einmal** zum System hinzufügen und die richtigen Tags automatisch vergeben!

---

## 🔍 Frage korrigieren

**Alt (langsam):** Musste an 4 Stellen geändert werden ❌

**Neu (schnell):** Ändere in **einem** der Arrays → System dedupliziert automatisch ✅

```
Korrigiere die Frage "Eine Bean wird durch den Spring Container..."
Die richtige Antwort ist: Falsch (Index 1, nicht 0)
Neue Erklärung: "Falsch. Spring erstellt beim Start automatisch..."
```

Das System findet die Frage automatisch und aktualisiert alle Vorkommen!

---

## 🎉 Zusammenfassung

1. **Format wählen:** Einfach-Text oder JSON
2. **Schwierigkeit festlegen:** 1–4
3. **Typ wählen:** multiple/checkbox/sort/matching
4. **Arrays nennen:** Explizit sagen wo die Frage rein soll
5. **Copilot arbeiten lassen:** Er fügt es **einmal** ein, Tags werden auto-generiert

**Das war's!** Das neue System kümmert sich um den Rest. 🚀
