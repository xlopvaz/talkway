// Speech layer: SpeechSynthesis (TTS), Web Speech API recognition (STT) and feedback providers.
import { store } from './store.js';

/* ---------------- Text-to-speech ---------------- */
let voices = [];
const loadVoices = () => { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; };
if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

export const ACCENTS = {
  'en-GB': 'British', 'en-US': 'American', 'en-AU': 'Australian', 'en-IE': 'Irish', 'en-IN': 'Indian', 'en-ZA': 'South African', 'en-CA': 'Canadian',
};
export const ttsAvailable = () => 'speechSynthesis' in window;

/** Voices for a locale, best-quality first */
export function voicesFor(locale) {
  const base = voices.filter((v) => v.lang.replace('_', '-').toLowerCase() === locale.toLowerCase());
  const score = (v) => (/natural|neural|premium|enhanced|google/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
  return base.sort((a, b) => score(b) - score(a));
}
export function availableAccents() {
  return Object.keys(ACCENTS).filter((l) => voicesFor(l).length);
}

/**
 * Speak text. opts: { accent, rate, voiceIndex (to vary speakers), onend, onboundary }
 * Returns a promise resolved when finished.
 */
export function speak(text, opts = {}) {
  if (!ttsAvailable()) return Promise.resolve();
  const accent = opts.accent || store.state.settings.accent;
  const u = new SpeechSynthesisUtterance(text);
  let list = voicesFor(accent);
  if (!list.length) list = voices.filter((v) => v.lang.startsWith('en'));
  if (list.length) {
    const v = list[(opts.voiceIndex || 0) % list.length];
    u.voice = v; u.lang = v.lang;
  } else u.lang = accent;
  u.rate = (opts.rate || store.state.settings.rate || 1) * 0.95;
  if (opts.pitch) u.pitch = opts.pitch;
  return new Promise((res) => {
    u.onend = () => { opts.onend && opts.onend(); res(); };
    u.onerror = () => res();
    if (opts.onboundary) u.onboundary = opts.onboundary;
    speechSynthesis.speak(u);
  });
}
export function stopSpeaking() { if (ttsAvailable()) speechSynthesis.cancel(); }

/** Speak a list of {text, speaker} lines, giving each speaker a different voice/pitch. */
export async function speakDialogue(lines, opts = {}) {
  stopSpeaking();
  const speakers = [...new Set(lines.map((l) => l.s))];
  for (let i = 0; i < lines.length; i++) {
    if (opts.cancelled && opts.cancelled()) break;
    const l = lines[i];
    const idx = speakers.indexOf(l.s);
    opts.onLine && opts.onLine(i);
    await speak(l.t, { accent: l.accent || opts.accent, rate: opts.rate, voiceIndex: idx, pitch: idx % 2 ? 1.08 : 0.95 });
    await new Promise((r) => setTimeout(r, 220));
  }
  opts.onLine && opts.onLine(-1);
}

/* ---------------- Speech recognition ---------------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const sttAvailable = () => !!SR;

/**
 * Start listening. Returns a controller { stop() }.
 * cb: { onInterim(text), onFinal({ transcript, confidence, durationSec, alternatives }), onError(msg), onEnd() }
 */
export function listen(cb = {}, { lang = 'en-US', continuous = false } = {}) {
  if (!SR) { cb.onError && cb.onError('unsupported'); return { stop() {} }; }
  const rec = new SR();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = continuous;
  rec.maxAlternatives = 3;
  const t0 = performance.now();
  let finalText = '', conf = [], alts = [];
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) { finalText += r[0].transcript + ' '; conf.push(r[0].confidence); alts = [...r].map((a) => a.transcript); }
      else interim += r[0].transcript;
    }
    cb.onInterim && cb.onInterim((finalText + interim).trim());
  };
  rec.onerror = (e) => cb.onError && cb.onError(e.error);
  rec.onend = () => {
    const transcript = finalText.trim();
    if (transcript) cb.onFinal && cb.onFinal({
      transcript, alternatives: alts,
      confidence: conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : null,
      durationSec: (performance.now() - t0) / 1000,
    });
    cb.onEnd && cb.onEnd();
  };
  try { rec.start(); } catch (e) { cb.onError && cb.onError(String(e)); }
  return { stop: () => { try { rec.stop(); } catch {} } };
}

/* ---------------- Recording your own voice (MediaRecorder) ---------------- */
export async function recordClip(maxMs = 15000) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  const done = new Promise((res) => {
    rec.onstop = () => { stream.getTracks().forEach((t) => t.stop()); res(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }))); };
  });
  rec.start();
  const timer = setTimeout(() => rec.state !== 'inactive' && rec.stop(), maxMs);
  return { stop: () => { clearTimeout(timer); rec.state !== 'inactive' && rec.stop(); }, done };
}

/* ---------------- Text helpers ---------------- */
export const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const CONTRACT = { "i'm": 'i am', "you're": 'you are', "it's": 'it is', "that's": 'that is', "don't": 'do not', "can't": 'cannot', "won't": 'will not', "i'd": 'i would', "i'll": 'i will', "we're": 'we are', "they're": 'they are', "isn't": 'is not', "doesn't": 'does not', "didn't": 'did not', "let's": 'let us', "what's": 'what is', "there's": 'there is', "i've": 'i have', "we'll": 'we will', "you'll": 'you will', "he's": 'he is', "she's": 'she is', "couldn't": 'could not', "wouldn't": 'would not', "shouldn't": 'should not', "aren't": 'are not', "haven't": 'have not', "wasn't": 'was not' };
const expand = (s) => norm(s).split(' ').flatMap((w) => (CONTRACT[w] || w).split(' ')).filter(Boolean);

/** Word-level alignment (LCS) between target and spoken. Returns tokens + accuracy. */
export function compareSentence(target, spoken) {
  const a = expand(target), b = expand(spoken);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { out.push({ w: a[i], k: 'hit' }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ w: a[i], k: 'miss' }); i++; }
    else { out.push({ w: b[j], k: 'extra' }); j++; }
  }
  while (i < a.length) out.push({ w: a[i++], k: 'miss' });
  while (j < b.length) out.push({ w: b[j++], k: 'extra' });
  const hits = out.filter((x) => x.k === 'hit').length;
  return { tokens: out, accuracy: a.length ? Math.round((hits / a.length) * 100) : 0, missed: out.filter((x) => x.k === 'miss').map((x) => x.w) };
}

/* ---------------- Feedback providers ----------------
   A provider implements: analyze({ transcript, durationSec, prompt }) → Promise<{ source, items:[{type:'good'|'tip'|'info', text}], score? }>
   - localProvider: transparent rule-based checks that run 100% in the browser (NO artificial intelligence).
   - remoteProvider: sends the transcript to YOUR OWN endpoint (e.g. a serverless function that calls an LLM).
     It is only used when an endpoint is configured in Settings. See README → "Connecting an AI feedback API". */

// Typical errors of Spanish speakers, detectable with patterns
const PATTERNS = [
  [/\bi have (\d+|twenty|thirty|forty|eighteen|nineteen) years\b/, 'Age uses “be”: say “I’m 25 (years old)”, not “I have 25 years”.'],
  [/\bi am agree\b|\bi'm agree\b/, '“Agree” is a verb: “I agree”, not “I am agree”.'],
  [/\bpeople is\b/, '“People” is plural: “people are”.'],
  [/\bdepends? of\b/, 'Use “depend on”: “It depends on the weather”.'],
  [/\bexplain me\b/, 'Say “explain to me” or “explain it to me”.'],
  [/\bmore (better|easier|bigger|cheaper|faster)\b/, 'Don’t double the comparative: “better”, not “more better”.'],
  [/\bsince (\d+|two|three|four|five|ten) (years|months|weeks|days)\b/, 'Duration uses “for”: “for three years”. Use “since” with a point in time (since 2020).'],
  [/\bmake a (photo|picture)\b/, 'We “take” a photo, not “make” one.'],
  [/\bdid(n't| not) (went|saw|came|ate|did|made|had|took|bought|knew)\b/, 'After “did/didn’t” use the base verb: “I didn’t go”.'],
  [/\b(he|she|it) don't\b/, 'Third person: “he/she/it doesn’t”.'],
  [/\b(he|she) (have|go|want|like|work|live)\b/, 'Third person singular needs -s: “she works”, “he has”.'],
  [/\binformations\b|\badvices\b|\bfurnitures\b|\bluggages\b/, 'Uncountable noun: “information / advice / furniture / luggage” (no -s).'],
  [/\bi am (living|working) here since\b/, 'Use present perfect: “I’ve been living here since…”.'],
  [/\bassist to\b/, 'False friend: “attend a meeting”, not “assist to a meeting”.'],
  [/\bactually\b.*\b(now|currently)\b/, 'Careful: “actually” means “in fact”, not “currently” (actualmente).'],
  [/\bin the (morning|afternoon) of (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/, 'More natural: “on Monday morning”.'],
  [/\bthe (life|nature|love) is\b/, 'General ideas usually take no article: “Life is…”, “Nature is…”.'],
  [/\bi am (\w+) since\b/, 'With “since/for” use present perfect: “I’ve been… since…”.'],
  [/\bwhat means\b/, 'Question word order: “What does … mean?”'],
  [/\bdiscuss about\b/, '“Discuss” has no preposition: “discuss the plan”.'],
];
const FILLERS = ['um', 'uh', 'er', 'erm', 'eh', 'like', 'you know', 'so so'];

export const localProvider = {
  name: 'Talkway rule-based checks',
  async analyze({ transcript, durationSec, prompt = {} }) {
    const items = [], n = norm(transcript), words = n.split(' ').filter(Boolean);
    const wc = words.length;
    const min = prompt.minWords || 12;
    if (wc >= min * 2) items.push({ type: 'good', text: `Great length: ${wc} words. You kept talking — that is fluency in action.` });
    else if (wc >= min) items.push({ type: 'good', text: `${wc} words — a solid answer. To extend it, add an example or a personal detail.` });
    else items.push({ type: 'tip', text: `Only ${wc} words. Try to reach ${min}+: answer, give a reason (“because…”), then add an example (“For example…”).` });

    if (durationSec && wc > 3) {
      const wpm = Math.round(wc / (durationSec / 60));
      items.push({ type: 'info', text: `Speaking pace ≈ ${wpm} words/min (natural conversation is roughly 110–160).` });
    }
    const fillerCount = FILLERS.reduce((acc, f) => acc + (n.match(new RegExp(`\\b${f}\\b`, 'g')) || []).length, 0);
    if (fillerCount >= 3) items.push({ type: 'tip', text: `You used ${fillerCount} fillers (um, like…). Replace some with natural pauses or “Let me think…”.` });

    const rep = {}; words.filter((w) => w.length > 3).forEach((w) => (rep[w] = (rep[w] || 0) + 1));
    const top = Object.entries(rep).filter(([w, c]) => c >= 4 && !['that', 'this', 'with', 'have', 'they', 'because', 'really'].includes(w));
    if (top.length) items.push({ type: 'tip', text: `You repeated “${top[0][0]}” ${top[0][1]} times. Try a synonym to sound more varied.` });

    PATTERNS.forEach(([re, msg]) => { if (re.test(n)) items.push({ type: 'tip', text: msg }); });

    if (prompt.useful && prompt.useful.length) {
      const used = prompt.useful.filter((p) => n.includes(norm(p)));
      if (used.length) items.push({ type: 'good', text: `Nice! You used target language: “${used.join('”, “')}”.` });
      else items.push({ type: 'tip', text: `Try including one of these: “${prompt.useful.slice(0, 3).join('”, “')}”.` });
    }
    const connectors = ['because', 'but', 'so', 'although', 'however', 'actually', 'for example', 'also', 'then', 'anyway', 'to be honest', 'on the other hand'];
    const usedC = connectors.filter((c) => new RegExp(`\\b${c}\\b`).test(n));
    if (usedC.length >= 2) items.push({ type: 'good', text: `Good linking words: ${usedC.slice(0, 4).join(', ')}.` });
    else if (usedC.length === 1 && wc > 8) items.push({ type: 'tip', text: `You linked ideas with “${usedC[0]}”. Add one more connector (but, so, for example, actually) to sound more fluent.` });
    else if (wc > 8) items.push({ type: 'tip', text: 'Connect your ideas with “because”, “but”, “so”, “for example”.' });
    return { source: this.name, items };
  },
};

export const remoteProvider = {
  name: 'AI feedback (your endpoint)',
  async analyze(payload) {
    const url = store.state.settings.apiEndpoint;
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, level: store.state.profile.level }) });
    if (!r.ok) throw new Error('Endpoint error ' + r.status);
    const data = await r.json(); // expected: { items:[{type,text}], correctedVersion? }
    return { source: this.name, ...data };
  },
};

export async function getFeedback(payload) {
  const local = await localProvider.analyze(payload);
  if (store.state.settings.apiEndpoint) {
    try { const remote = await remoteProvider.analyze(payload); return { ...remote, items: [...(remote.items || []), ...local.items], source: remote.source + ' + ' + local.source }; }
    catch (e) { local.items.unshift({ type: 'info', text: 'Your AI endpoint could not be reached; showing rule-based checks only.' }); }
  }
  return local;
}
