# talkway. — Think, understand and speak English

**Talkway** is an interactive platform to learn real-life English: speaking, listening, vocabulary, grammar in context, pronunciation, and a specialised **Cabin Crew Academy** for future cabin crew (TCP), pilots and aviation professionals.

It is a 100% static site (HTML + CSS + vanilla JavaScript ES modules). No build step and no server: it runs as-is on **GitHub Pages**.

## Brand

| | |
|---|---|
| Name | **talkway.** — *talk* + *way* (and *runway*): the road to speaking |
| Logo | Lowercase wordmark in Bricolage Grotesque, coral full stop, rounded-square mark with a take-off curve |
| Palette | Signal Coral `#F2643D` · Altitude Blue `#2F5BEA` · Runway Mint `#13A57B` · Beacon Amber `#E9A21F` · Ink `#171A26` · Paper `#F7F5F0` |
| Type | Bricolage Grotesque (display) + Instrument Sans (body) |

## Sections

- **My Learning (dashboard)**: level, overall progress, daily XP goal, study time, streak, 7-day activity, recent lessons, personalised recommendations, next activity, and stats for the 5 skills.
- **English Levels (A1–C2)**: 30 progressive units with can-do goals, key language, grammar, speaking task, exercises, and links to listening and everyday situations.
- **Everyday English**: 20 real-life situations, each with vocabulary, natural expressions, a *textbook vs real life* comparison, a dialogue with audio, comprehension, gap-fill, sentence building and a spoken role-play.
- **Speaking Lab**: open questions, quick-fire (15 s), characters with different accents, picture description, storytelling, debates and improvisation, plus playback of your own voice.
- **Listening Lab**: 12 activities (conversations, fast speech, meetings, airport announcements, voicemail, interviews, podcast, lecture) in British, American, Australian and Irish English, at 0.6×–1.2×, with questions, gap-fill, transcript and expressions.
- **Vocabulary Builder**: 14 decks (140+ items) with flashcards, audio, IPA, examples, synonyms/antonyms, phrasal verbs, idioms and collocations, using **spaced repetition (SM-2)**.
- **Grammar in Context**: 17 topics covering tenses, modals, conditionals, passive, reported speech, relative clauses, prepositions, articles, phrasal verbs, questions and word order, with common mistakes and self-correcting exercises.
- **Pronunciation Studio**: IPA chart, minimal pairs with an ear test, word and sentence stress, connected speech, weak forms, intonation, UK vs US, and repeat-after-me drills.
- **Cabin Crew Academy**: aviation vocabulary (9 categories), cabin crew communication (9 modules with role-plays), safety & emergency English, interview simulator (Ryanair, Vueling, easyJet, Wizz Air…), PA announcements, and pilot radiotelephony basics.

## Speech technology (honest by design)

- **Audio** uses the browser's `SpeechSynthesis` API. The available accents depend on the voices installed on each device.
- **Speech recognition** uses the Web Speech API (`SpeechRecognition`), which works in **Chrome and Edge** (desktop and Android). Every speaking activity has a "type instead" fallback.
- **Feedback is rule-based, not AI**: word-by-word matching for drills; length, pace, fillers, repetition, linking words, target expressions, and 20 patterns of typical Spanish-speaker errors for open answers. The interface states this clearly.
- **Role-plays and characters** are scripted conversations.

### Connecting an AI feedback API (optional)

`js/speech.js` defines a provider interface (`localProvider`, `remoteProvider`). To add AI feedback, deploy a serverless function (Cloudflare Workers, Netlify Functions, Vercel…) and paste its URL in **Settings → AI feedback**.

```
POST { transcript, durationSec, prompt: { q, useful, minWords }, level }
→    { items: [{ type: "good" | "tip" | "info", text }], correctedVersion?: "..." }
```

⚠️ Never put an API key in this repository: GitHub Pages is public. Keep keys inside the function.

## Publish on GitHub Pages

1. Create a repository on GitHub (e.g. `talkway`).
2. Upload the **contents** of this folder to the root of the repository (`index.html` must sit at the top level):
   ```bash
   git init && git add . && git commit -m "Talkway v1"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/talkway.git
   git push -u origin main
   ```
   (Or use **Add file → Upload files** on github.com and drag in everything.)
3. Go to **Settings → Pages → Build and deployment → Source: Deploy from a branch**, then choose `main` / `/ (root)` → **Save**.
4. After about a minute the site is live at `https://YOUR-USER.github.io/talkway/`.

The `.nojekyll` file stops GitHub from processing the site with Jekyll. Routing uses `#/hash`, so no 404 configuration is needed.

## Local development

ES modules need a server (they won't run from `file://`):

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Structure

```
index.html            App shell
css/styles.css        Design system (light/dark, responsive)
js/app.js             Router, navigation, global events, study timer
js/store.js           Progress in localStorage + spaced repetition (SM-2)
js/speech.js          TTS, speech recognition, recording, feedback providers
js/ui.js              Components: exercises, dialogues, speaking widgets
js/i18n.js            EN / ES interface
js/views/*.js         One file per section
js/data/*.js          All learning content (easy to extend)
```

### Adding content

All content lives in `js/data/`. For example, to add a new Everyday English situation, add an object to `EVERYDAY` in `js/data/everyday.js` following the same structure. It appears automatically in the list, the dashboard and the role-plays.

## Data & privacy

Progress is saved only in the user's browser (`localStorage`) and can be exported or imported as JSON from Settings. There are no accounts, cookies or analytics. A backend can be added later by replacing `store.save()` with a sync adapter.

---
Aviation content is for language practice. Procedures, commands and announcements vary by operator: always follow your airline's Operations Manual and official training.
