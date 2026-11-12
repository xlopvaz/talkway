import { icon } from '../icons.js';
import { store } from '../store.js';
import { t, es } from '../i18n.js';
import { esc, pageHead, back, dialogue, exercises, vocabList, speakPrompt, repeatWidget, sayBtn, doneBtn, tabs } from '../ui.js';
import { roleplay } from './roleplay.js';
import { AV_VOCAB, AV_COMMS, PA_SCRIPTS, AV_SAFETY, RT, AIRLINES, AV_INTERVIEW } from '../data/aviation.js';

const MODULES = [
  { id: 'vocab', t: '1 · Aviation Vocabulary', d: 'Aircraft parts, cabin & emergency equipment, airport operations, terminology.', i: 'book', c: 'blue', n: AV_VOCAB.reduce((a, x) => a + x.words.length, 0) + ' terms' },
  { id: 'comms', t: '2 · Cabin Crew Communication', d: 'Greeting, boarding, instructions, service, complaints, difficult passengers, colleagues.', i: 'chat', c: 'coral', n: AV_COMMS.length + ' modules' },
  { id: 'safety', t: '3 · Safety & Emergency English', d: 'Evacuation commands, turbulence, medical emergencies, fire and smoke, first aid.', i: 'shield', c: 'amber', n: AV_SAFETY.length + ' topics' },
  { id: 'interview', t: '4 · Cabin Crew Interviews', d: 'Simulated interviews for Ryanair, Vueling, easyJet, Wizz Air and more.', i: 'briefcase', c: 'violet', n: AV_INTERVIEW.length + ' questions' },
  { id: 'pa', t: '5 · PA Announcements', d: 'Practise real in-flight announcements and get a word-by-word match.', i: 'speaker', c: 'mint', n: PA_SCRIPTS.length + ' scripts' },
  { id: 'radio', t: '6 · Pilot Radiotelephony Basics', d: 'ICAO alphabet, numbers and standard phraseology.', i: 'plane', c: 'blue', n: 'ICAO' },
];
const disclaimer = `<div class="callout warn small" style="margin-top:20px">${icon('alert')} Training content for language practice. Exact procedures, commands and announcements vary by operator and regulator — always follow your airline’s Operations Manual and official training.</div>`;

export function render([mod, sub]) {
  const v = { vocab, comms, safety, interview, pa, radio }[mod];
  if (v) return v(sub);
  const done = MODULES.filter((m) => store.isDone('av-' + m.id)).length;
  return {
    title: t('aviation'),
    html: `<div class="view">
    <section class="card ink hero-main" style="margin-top:12px">
      <div class="eyebrow" style="color:var(--coral)">Aviation English · Talkway Academy</div>
      <h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">Cabin Crew Academy</h1>
      <p class="muted" style="max-width:620px">Professional English for future cabin crew (TCP), pilots and aviation staff — from boarding and service to emergencies and airline interviews.</p>${es('Inglés aeronáutico profesional para futuros TCP, pilotos y personal del sector.')}
      <div class="row" style="margin-top:16px;position:relative;z-index:1"><a class="btn primary" href="#/aviation/interview">${icon('briefcase')} Practise an interview</a><span class="small muted">${done}/${MODULES.length} modules completed</span></div>
    </section>
    <div class="grid g3 section" style="margin-top:18px">${MODULES.map((m) => `<a class="card click" href="#/aviation/${m.id}">
      <div class="row between"><span class="ico ${m.c}">${icon(m.i)}</span><span class="row" style="gap:6px"><span class="tag">${m.n}</span>${store.isDone('av-' + m.id) ? `<span class="tag mint">${icon('check')}</span>` : ''}</span></div>
      <h3 style="margin-top:12px">${m.t}</h3><p class="small muted" style="margin:0">${m.d}</p></a>`).join('')}</div>
    ${disclaimer}</div>`,
  };
}
const shell = (id, title, lede, inner) => ({ title, html: `<div class="view">${back('#/aviation', 'Cabin Crew Academy')}${pageHead('Cabin Crew Academy', title, lede)}${inner}
  <div class="card tint-mint row between" style="margin-top:20px"><b>Module complete?</b>${doneBtn('av-' + id, `Aviation: ${title}`, `#/aviation/${id}`, 'speaking', 30)}</div>${disclaimer}</div>` });

function vocab(sub) {
  const cat = AV_VOCAB.find((c) => c.id === sub) || AV_VOCAB[0];
  store.visit('av-vocab', 'Aviation vocabulary', '#/aviation/vocab');
  return shell('vocab', 'Aviation Vocabulary', 'Tap the speaker to hear each term. Review them with flashcards in the Vocabulary Builder → Aviation deck.',
    `<div class="tabs">${AV_VOCAB.map((c) => `<a href="#/aviation/vocab/${c.id}" class="${c === cat ? 'on' : ''}">${c.title}</a>`).join('')}</div>
    <div class="grid g2" style="align-items:start"><div class="card"><h2>${esc(cat.title)}</h2>${vocabList(cat.words)}</div>
    <div class="card"><h3>Quick check</h3>${exercises(cat.words.slice(0, 4).map((w, i, arr) => ({ type: 'mcq', q: `What does “${w.w}” mean?`, options: [w.d, ...AV_VOCAB.flatMap((c) => c.words).filter((x) => x.w !== w.w).sort(() => 0.5 - Math.random()).slice(0, 2).map((x) => x.d)].sort(() => 0.5 - Math.random()), a: -1, _ans: w.d })).map((q) => ({ ...q, a: q.options.indexOf(q._ans) })), { skill: 'vocabulary' })}
    <a class="btn sm" href="#/vocabulary/aviation/study" style="margin-top:12px">${icon('cards')} Aviation flashcards</a></div></div>`);
}

function comms(sub) {
  const m = AV_COMMS.find((c) => c.id === sub) || AV_COMMS[0];
  store.visit('av-comms', 'Cabin crew communication', '#/aviation/comms');
  return shell('comms', 'Cabin Crew Communication', 'Polite, clear and confident — the voice of the airline.',
    `<div class="tabs">${AV_COMMS.map((c) => `<a href="#/aviation/comms/${c.id}" class="${c === m ? 'on' : ''}">${c.title}</a>`).join('')}</div>
    <div class="grid g2" style="align-items:start"><div class="stack">
      <div class="card"><h2>${esc(m.title)}</h2><div class="callout" style="margin-bottom:12px">${icon('sparkle')} ${esc(m.tip)}</div>${m.phrases.map((p) => repeatWidget(p, { accent: 'en-GB' })).join('')}</div></div>
      <div class="stack">${m.dialogue.length ? `<div class="card"><h3>Model dialogue</h3>${dialogue(m.dialogue, { accent: 'en-GB' })}</div>` : ''}
      ${m.roleplay.length ? roleplay(m.roleplay, { name: 'Passenger', accent: 'en-US', intro: 'You are the cabin crew member' }) : `<div class="card"><p>Practise full announcements in <a href="#/aviation/pa">PA Announcements</a>.</p></div>`}</div></div>`);
}

function safety(sub) {
  const s = AV_SAFETY.find((c) => c.id === sub) || AV_SAFETY[0];
  store.visit('av-safety', 'Safety & emergency English', '#/aviation/safety');
  return shell('safety', 'Safety & Emergency English', 'When it matters most, language must be instant, loud and clear.',
    `<div class="tabs">${AV_SAFETY.map((c) => `<a href="#/aviation/safety/${c.id}" class="${c === s ? 'on' : ''}">${c.title}</a>`).join('')}</div>
    <div class="grid g2" style="align-items:start"><div class="card"><h2>${esc(s.title)}</h2>${s.intro ? `<p class="small">${esc(s.intro)}</p>` : ''}
      ${s.items ? `<table class="t">${s.items.map(([a, b]) => `<tr><th style="width:36%">${esc(a)}</th><td>${esc(b)} ${sayBtn(b)}</td></tr>`).join('')}</table>` : ''}
      ${s.commands ? s.commands.map((c) => repeatWidget(c, { note: 'Shout it: short, loud, positive.' })).join('') : ''}</div>
      <div class="stack">${s.ex ? `<div class="card"><h3>Check</h3>${exercises(s.ex, { skill: 'vocabulary' })}</div>` : ''}
      ${s.roleplay ? roleplay(s.roleplay, { name: 'Passenger', accent: 'en-GB', intro: 'Medical emergency simulation' }) : ''}
      ${s.items && !s.roleplay && !s.ex ? `<div class="card"><h3>Practise out loud</h3>${s.items.slice(0, 3).map(([, b]) => repeatWidget(b)).join('')}</div>` : ''}</div></div>`);
}

function pa() {
  store.visit('av-pa', 'PA announcements', '#/aviation/pa');
  return shell('pa', 'PA Announcements', 'Listen to the model, then read the announcement aloud. Aim for a calm, warm pace with clear pauses at commas.',
    `<div class="grid g2" style="align-items:start">${PA_SCRIPTS.map((p) => `<div class="card"><h3>${esc(p.title)}</h3>${repeatWidget(p.text, { accent: 'en-GB' })}</div>`).join('')}</div>`);
}

function interview() {
  store.visit('av-interview', 'Cabin crew interview', '#/aviation/interview');
  return shell('interview', 'Cabin Crew Interviews', 'Answer each question out loud against the clock, then compare with a model answer. Use STAR for experience questions.',
    `<div class="card" style="margin-bottom:16px"><h3>Choose the airline you’re preparing for</h3><div class="row" id="airlines">${AIRLINES.map((a, i) => `<button class="btn sm ${i === 0 ? 'dark' : ''}" data-al="${i}">${esc(a.name)}</button>`).join('')}</div>
    <div class="callout small" id="alNote" style="margin-top:12px">${esc(AIRLINES[0].note)}</div>
    <p class="small muted" style="margin:10px 0 0">Assessment days typically include a group exercise, an English test and a personal interview. Check each airline’s careers page for its current process and requirements.</p></div>
    <div class="stack">${AV_INTERVIEW.map((q, i) => `<div><div class="row" style="margin-bottom:6px"><span class="tag violet">Q${i + 1}</span><span class="small muted">${esc(q.tip)}</span></div>${speakPrompt(q, { seconds: q.seconds || 60 })}</div>`).join('')}</div>`);
}

function radio() {
  store.visit('av-radio', 'Radiotelephony basics', '#/aviation/radio');
  const r = shell('radio', 'Pilot Radiotelephony Basics', RT.note,
    `<div class="grid g2" style="align-items:start"><div class="card"><h2>ICAO spelling alphabet</h2><div class="ipa-grid">${RT.alphabet.map(([l, w]) => `<button class="ipa-cell" data-say="${w}"><span class="sym">${l}</span><b>${w}</b></button>`).join('')}</div></div>
    <div class="stack"><div class="card"><h2>Spell it like a pilot</h2><p class="small">Type a name, booking code or registration and hear it spelt.</p><div class="row"><input class="field" id="spIn" placeholder="e.g. EC-MXV or García" style="flex:1"><button class="btn primary" id="spGo">${icon('speaker')} Spell</button></div><div id="spOut" class="transcript" style="margin-top:10px">—</div></div>
    <div class="card"><h2>Numbers</h2><table class="t">${RT.numbers.map(([a, b]) => `<tr><td><b>${a}</b></td><td>${b} ${sayBtn(b)}</td></tr>`).join('')}</table></div>
    <div class="card"><h2>Standard words</h2><table class="t">${RT.phrases.map(([a, b]) => `<tr><td><b>${a}</b> ${sayBtn(a)}</td><td class="small">${esc(b)}</td></tr>`).join('')}</table></div></div></div>`);
  r.mount = (root) => {
    const go = () => {
      const map = Object.fromEntries(RT.alphabet.map(([l, w]) => [l, w]));
      const nums = { 0: 'zero', 1: 'one', 2: 'two', 3: 'tree', 4: 'four', 5: 'fife', 6: 'six', 7: 'seven', 8: 'eight', 9: 'niner' };
      const out = [...root.querySelector('#spIn').value.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()].map((c) => map[c] || nums[c] || (c === '-' ? 'dash' : null)).filter(Boolean);
      root.querySelector('#spOut').textContent = out.join(' · ') || '—';
      import('../speech.js').then((s) => s.speak(out.join(', '), { rate: 0.85 }));
    };
    root.querySelector('#spGo').onclick = go;
    root.querySelector('#spIn').onkeydown = (e) => e.key === 'Enter' && go();
  };
  return r;
}

// airline picker (interview)
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-al]'); if (!b) return;
  document.querySelectorAll('[data-al]').forEach((x) => x.classList.toggle('dark', x === b));
  document.getElementById('alNote').textContent = AIRLINES[+b.dataset.al].note;
});
