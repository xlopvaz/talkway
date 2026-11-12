import { icon } from '../icons.js';
import { store, SKILLS, srs } from '../store.js';
import { t, es } from '../i18n.js';
import { esc } from '../ui.js';
import { LEVELS } from '../data/levels.js';
import { EVERYDAY } from '../data/everyday.js';
import { DECKS, wordKey } from '../data/vocabulary.js';

const SKILL_META = {
  speaking: { label: 'Speaking', icon: 'mic', c: 'coral', route: '#/speaking' },
  listening: { label: 'Listening', icon: 'headphones', c: 'blue', route: '#/listening' },
  vocabulary: { label: 'Vocabulary', icon: 'cards', c: 'amber', route: '#/vocabulary' },
  grammar: { label: 'Grammar', icon: 'puzzle', c: 'violet', route: '#/grammar' },
  pronunciation: { label: 'Pronunciation', icon: 'wave', c: 'mint', route: '#/pronunciation' },
};
const fmtMin = (sec) => (sec < 3600 ? `${Math.round(sec / 60)} min` : `${(sec / 3600).toFixed(1)} h`);

export function nextUnit() {
  const lv = LEVELS.find((l) => l.code === store.state.profile.level) || LEVELS[0];
  const u = lv.units.find((x) => !store.isDone(x.id));
  if (u) return { lv, u };
  const i = LEVELS.indexOf(lv);
  const nl = LEVELS[i + 1];
  return nl ? { lv: nl, u: nl.units[0] } : { lv, u: lv.units[0] };
}

function onboarding() {
  const p = store.state.profile;
  return `<div class="card tint-coral" id="onboard">
    <div class="eyebrow">Welcome to Talkway</div><h2>Let’s set up your learning path</h2>
    <p class="muted">It takes 20 seconds. Everything is stored privately in this browser.</p>${es('Tus datos se guardan solo en este navegador.')}
    <div class="grid g3" style="margin-top:10px">
      <label><div class="small muted">Your name</div><input class="field" id="obName" value="${esc(p.name)}" placeholder="e.g. Xoel"></label>
      <label><div class="small muted">Your level (approx.)</div><select class="field" id="obLevel">${LEVELS.map((l) => `<option value="${l.code}" ${l.code === p.level ? 'selected' : ''}>${l.code} — ${l.name}</option>`).join('')}</select></label>
      <label><div class="small muted">Main goal</div><select class="field" id="obTrack"><option value="general">Everyday fluency</option><option value="aviation">Become cabin crew / aviation</option><option value="work">English for work</option></select></label>
    </div>
    <div class="row" style="margin-top:14px"><button class="btn primary" id="obGo">${icon('arrowRight')} Start learning</button><span class="small muted">Not sure about your level? A2 is a safe start — you can change it any time in Settings.</span></div>
  </div>`;
}

export function render() {
  const s = store.state, p = s.profile;
  const today = store.day();
  const goalPct = Math.min(100, Math.round((today.xp / s.settings.goalXp) * 100));
  const totalUnits = LEVELS.reduce((a, l) => a + l.units.length, 0) + EVERYDAY.length;
  const doneUnits = Object.keys(s.completed).length;
  const overall = Math.round((doneUnits / totalUnits) * 100);
  const totalSec = Object.values(s.days).reduce((a, d) => a + (d.sec || 0), 0);
  const allKeys = DECKS.flatMap((d) => d.words.map((w) => wordKey(d.id, w.w)));
  const vs = srs.stats(allKeys);
  const { lv, u } = nextUnit();
  const maxXp = Math.max(50, ...SKILLS.map((k) => s.skills[k].xp));
  const weakest = [...SKILLS].sort((a, b) => s.skills[a].xp - s.skills[b].xp)[0];
  const curLevel = LEVELS.find((l) => l.code === p.level);
  const lvDone = curLevel.units.filter((x) => store.isDone(x.id)).length;

  const recs = [];
  if (vs.due > 0) recs.push({ t: `Review ${vs.due} vocabulary card${vs.due > 1 ? 's' : ''}`, d: 'Spaced repetition: they’re due today.', r: '#/vocabulary/review', i: 'cards', c: 'amber' });
  recs.push({ t: `Boost your ${SKILL_META[weakest].label.toLowerCase()}`, d: 'This is your least-practised skill so far.', r: SKILL_META[weakest].route, i: SKILL_META[weakest].icon, c: SKILL_META[weakest].c });
  if (p.track === 'aviation') recs.push({ t: 'Cabin Crew interview practice', d: 'Answer real interview questions out loud.', r: '#/aviation/interview', i: 'plane', c: 'blue' });
  const ev = EVERYDAY.find((e) => !store.isDone('ev-' + e.id));
  if (ev) recs.push({ t: `Everyday English: ${ev.title}`, d: 'Real conversations, natural expressions.', r: `#/everyday/${ev.id}`, i: 'coffee', c: 'coral' });
  recs.push({ t: 'Quick-fire speaking', d: '20 rapid questions — answer without translating.', r: '#/speaking/quick', i: 'bolt', c: 'mint' });

  const week = store.last7();
  return {
    title: t('dashboard'),
    html: `<div class="view">
    <header class="page-head"><div class="eyebrow">${t('dashboard')}</div>
      <h1>${p.name ? `Hi ${esc(p.name)}, ready to talk?` : 'Ready to talk?'}</h1>
      <p class="lede">Think in English. Understand it. Speak it — a little every day.</p>${es('Piensa en inglés, entiéndelo y háblalo: un poco cada día.')}</header>
    ${!p.onboarded ? onboarding() + '<div style="height:16px"></div>' : ''}
    <section class="hero">
      <div class="card ink hero-main">
        <div class="eyebrow" style="color:var(--coral)">Next activity · ${lv.code} ${esc(lv.name)}</div>
        <h1 style="font-size:1.9rem">${esc(u.title)}</h1>
        <p class="muted">${u.goals.map(esc).join(' · ')}</p>
        <div class="row" style="margin-top:18px;position:relative;z-index:1"><a class="btn primary" href="#/levels/${lv.code}/${u.id}">${icon('play')} ${t('continue')}</a>
        <a class="btn" style="background:transparent;color:var(--bg);border-color:color-mix(in srgb,var(--bg) 30%,transparent)" href="#/levels/${lv.code}">View path</a></div>
      </div>
      <div class="card">
        <div class="row" style="gap:18px;align-items:center;flex-wrap:nowrap">
          <div class="ring" style="--p:${goalPct}"><div><b>${today.xp}</b><span class="small muted">/ ${s.settings.goalXp} XP</span></div></div>
          <div><div class="small muted">${t('goal')}</div><h3 style="margin:2px 0 6px">${goalPct >= 100 ? 'Goal reached! 🎉' : `${s.settings.goalXp - today.xp} XP to go`}</h3>
          <div class="small muted">${icon('clock', 'i')} ${fmtMin(today.sec)} studied today</div></div>
        </div>
        <div class="week" style="margin-top:18px">${week.map((d) => `<span class="${d.xp > 0 ? 'on' : ''} ${d.today ? 'today' : ''}" title="${d.k}: ${d.xp} XP"><i></i>${d.label}</span>`).join('')}</div>
      </div>
    </section>

    <section class="grid g4 section" style="margin-top:16px">
      <div class="card"><div class="ico coral">${icon('flame')}</div><div class="stat-num" style="margin-top:12px">${store.streakNow}</div><div class="small muted">${t('streak')} · best ${s.streak.best}</div></div>
      <div class="card"><div class="ico amber">${icon('bolt')}</div><div class="stat-num" style="margin-top:12px">${s.xp}</div><div class="small muted">total XP</div></div>
      <div class="card"><div class="ico blue">${icon('layers')}</div><div class="stat-num" style="margin-top:12px">${p.level}</div><div class="small muted">${esc(curLevel.name)} · ${lvDone}/${curLevel.units.length} units</div></div>
      <div class="card"><div class="ico mint">${icon('clock')}</div><div class="stat-num" style="margin-top:12px">${fmtMin(totalSec)}</div><div class="small muted">total study time</div></div>
    </section>

    <section class="grid g2 section" style="margin-top:16px">
      <div class="card">
        <div class="section-title"><h2>Skills</h2><span class="small muted">XP · accuracy</span></div>
        <div class="stack">${SKILLS.map((k) => { const m = SKILL_META[k], v = s.skills[k]; const acc = v.tries ? Math.round((v.ok / v.tries) * 100) : null;
          return `<a href="${m.route}" style="color:inherit;display:block"><div class="row between small"><span class="row" style="gap:8px"><span class="ico ${m.c}" style="width:28px;height:28px;border-radius:8px">${icon(m.icon)}</span><b>${m.label}</b></span><span class="muted">${v.xp} XP${acc != null ? ` · ${acc}%` : ''}</span></div>
          <div class="bar ${m.c === 'coral' ? '' : m.c}" style="margin-top:6px"><i style="width:${Math.max(3, (v.xp / maxXp) * 100)}%"></i></div></a>`; }).join('')}</div>
        <div style="margin-top:18px"><div class="row between small"><b>Overall progress</b><span class="muted">${doneUnits}/${totalUnits} lessons · ${overall}%</span></div><div class="bar" style="margin-top:6px"><i style="width:${Math.max(2, overall)}%"></i></div></div>
      </div>
      <div class="card">
        <div class="section-title"><h2>Recommended for you</h2></div>
        <div class="stack">${recs.slice(0, 4).map((r) => `<a class="row" style="color:inherit;flex-wrap:nowrap" href="${r.r}"><span class="ico ${r.c}">${icon(r.i)}</span><span style="flex:1"><b>${esc(r.t)}</b><div class="small muted">${esc(r.d)}</div></span>${icon('arrowRight', 'muted')}</a>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="section-title"><h2>Recent lessons</h2></div>
      ${s.recent.length ? `<div class="grid auto">${s.recent.slice(0, 6).map((r) => `<a class="card click" href="${r.route}"><div class="row between"><span class="tag ${store.isDone(r.id) ? 'mint' : ''}">${store.isDone(r.id) ? t('done') : 'In progress'}</span><span class="small muted">${new Date(r.at).toLocaleDateString()}</span></div><h3 style="margin-top:10px">${esc(r.title)}</h3></a>`).join('')}</div>`
        : `<div class="card empty">No lessons yet — start with your <a href="#/levels/${lv.code}/${u.id}">next activity</a> or jump into <a href="#/everyday">Everyday English</a>.</div>`}
    </section>
    </div>`,
    mount(root) {
      const go = root.querySelector('#obGo');
      if (go) go.onclick = () => {
        Object.assign(store.state.profile, { name: root.querySelector('#obName').value.trim(), level: root.querySelector('#obLevel').value, track: root.querySelector('#obTrack').value, onboarded: true });
        store.save(); location.hash = '#/dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange'));
      };
    },
  };
}
