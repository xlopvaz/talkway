// Local-first progress store (localStorage). No account or server needed.
// Designed so a backend sync adapter can be plugged in later (see README → Architecture).
const KEY = 'talkway.v1';
export const SKILLS = ['speaking', 'listening', 'vocabulary', 'grammar', 'pronunciation'];

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

function fresh() {
  return {
    v: 1,
    settings: {
      lang: 'en',
      theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      goalXp: 50,
      goalMin: 15,
      accent: 'en-GB',
      rate: 1,
    },
    profile: { name: '', level: 'A2', track: 'general', onboarded: false },
    xp: 0,
    streak: { count: 0, best: 0, last: null },
    days: {},           // { 'YYYY-MM-DD': { xp, sec } }
    skills: Object.fromEntries(SKILLS.map((s) => [s, { xp: 0, tries: 0, ok: 0 }])),
    completed: {},      // { lessonId: isoDate }
    recent: [],         // [{ id, title, route, at }]
    srs: {},            // { wordKey: { ef, int, due, reps, lapses, seen } }
  };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw) return fresh();
    const base = fresh();
    return { ...base, ...raw, settings: { ...base.settings, ...raw.settings }, profile: { ...base.profile, ...raw.profile },
      skills: { ...base.skills, ...raw.skills } };
  } catch { return fresh(); }
}

const listeners = new Set();
export const store = {
  state: load(),
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch {}
    listeners.forEach((fn) => fn(this.state));
  },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  reset() { this.state = fresh(); this.save(); },

  day(d = today()) { return (this.state.days[d] ||= { xp: 0, sec: 0 }); },

  /** Register any learning activity; keeps the streak honest (one per calendar day). */
  touch() {
    const s = this.state.streak, d = today();
    if (s.last === d) return;
    s.count = s.last && dayDiff(s.last, d) === 1 ? s.count + 1 : 1;
    s.best = Math.max(s.best, s.count);
    s.last = d;
  },
  /** Award XP to a skill. ok=true/false tracks accuracy. */
  award(skill, xp, ok = true) {
    this.touch();
    this.state.xp += xp;
    this.day().xp += xp;
    const sk = this.state.skills[skill];
    if (sk) { sk.xp += xp; sk.tries += 1; if (ok) sk.ok += 1; }
    this.save();
    return xp;
  },
  addTime(sec) { this.day().sec += sec; this.save(); },
  complete(id, title, route, skill = 'grammar', xp = 20) {
    const first = !this.state.completed[id];
    this.state.completed[id] = today();
    this.visit(id, title, route);
    if (first) this.award(skill, xp); else this.save();
    return first;
  },
  visit(id, title, route) {
    this.state.recent = [{ id, title, route, at: Date.now() }, ...this.state.recent.filter((r) => r.id !== id)].slice(0, 8);
    this.save();
  },
  isDone(id) { return !!this.state.completed[id]; },

  // streak display is 0 if the user missed yesterday
  get streakNow() {
    const s = this.state.streak;
    if (!s.last) return 0;
    return dayDiff(s.last, today()) <= 1 ? s.count : 0;
  },
  last7() {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const k = dt.toLocaleDateString('en-CA');
      out.push({ k, label: dt.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2), ...(this.state.days[k] || { xp: 0, sec: 0 }), today: i === 0 });
    }
    return out;
  },
};

/* ---------- Spaced repetition (SM-2 variant) ----------
   grade: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy */
export const srs = {
  get(key) { return store.state.srs[key]; },
  isDue(key) { const c = store.state.srs[key]; return !c || c.due <= Date.now(); },
  grade(key, g) {
    const c = store.state.srs[key] || { ef: 2.5, int: 0, reps: 0, lapses: 0, due: 0 };
    const q = [1, 3, 4, 5][g];
    c.ef = Math.max(1.3, c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    if (g === 0) { c.reps = 0; c.lapses += 1; c.int = 0; }
    else {
      c.reps += 1;
      if (c.reps === 1) c.int = g === 3 ? 3 : 1;
      else if (c.reps === 2) c.int = g === 1 ? 3 : 6;
      else c.int = Math.round(c.int * c.ef * (g === 1 ? 0.8 : g === 3 ? 1.3 : 1));
    }
    // "Again" comes back in 1 minute (same session); others in days
    c.due = Date.now() + (g === 0 ? 60_000 : c.int * 86400000);
    c.seen = Date.now();
    store.state.srs[key] = c;
    store.award('vocabulary', g === 0 ? 2 : 5, g > 0);
    return c;
  },
  /** Human label for the next interval if graded g */
  preview(key, g) {
    const c = store.state.srs[key] || { ef: 2.5, int: 0, reps: 0 };
    if (g === 0) return '1 min';
    const reps = c.reps + 1;
    let d = reps === 1 ? (g === 3 ? 3 : 1) : reps === 2 ? (g === 1 ? 3 : 6) : Math.round(c.int * c.ef * (g === 1 ? 0.8 : g === 3 ? 1.3 : 1));
    return d >= 30 ? `${Math.round(d / 30)} mo` : `${d} d`;
  },
  stats(keys) {
    let fresh = 0, due = 0, learned = 0;
    keys.forEach((k) => { const c = store.state.srs[k]; if (!c) fresh++; else if (c.due <= Date.now()) due++; else learned++; });
    return { fresh, due, learned };
  },
};
