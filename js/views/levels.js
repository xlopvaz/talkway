import { icon } from '../icons.js';
import { store } from '../store.js';
import { t, es, pick } from '../i18n.js';
import { esc, pageHead, back, exercises, speakPrompt, vocabList, doneBtn } from '../ui.js';
import { LEVELS } from '../data/levels.js';
import { GRAMMAR } from '../data/grammar.js';
import { EVERYDAY } from '../data/everyday.js';
import { LISTENING } from '../data/listening.js';

const C = { mint: 'mint', blue: 'blue', amber: 'amber', violet: 'violet', coral: 'coral' };

export function render([code, unitId]) {
  if (code && unitId) return unit(code, unitId);
  if (code) return level(code);
  return {
    title: t('levels'),
    html: `<div class="view">${pageHead('CEFR · MCER', t('levels'), 'Six levels, each with a coherent path: can-do goals, progressive units, vocabulary, grammar, listening, speaking and practice.', 'Seis niveles con un itinerario coherente.')}
    <div class="grid g3">${LEVELS.map((l) => {
      const done = l.units.filter((u) => store.isDone(u.id)).length, pct = Math.round((done / l.units.length) * 100);
      const mine = l.code === store.state.profile.level;
      return `<a class="card click level-card" href="#/levels/${l.code}">
        <div class="row between"><span class="level-code" style="color:var(--${C[l.color]})">${l.code}</span>${mine ? '<span class="tag coral">Your level</span>' : `<span class="tag">${l.hours}</span>`}</div>
        <h3 style="margin-top:8px">${l.name}</h3><p class="small muted">${esc(pick(l.summary, l.summaryEs))}</p>
        <div class="row between small"><span>${l.units.length} units</span><span class="muted">${done}/${l.units.length}</span></div>
        <div class="bar ${l.color === 'coral' ? '' : l.color}" style="margin-top:6px"><i style="width:${Math.max(2, pct)}%"></i></div></a>`;
    }).join('')}</div></div>`,
  };
}

function level(code) {
  const l = LEVELS.find((x) => x.code === code);
  if (!l) return { title: '404', html: '<div class="empty">Level not found.</div>' };
  return {
    title: `${l.code} ${l.name}`,
    html: `<div class="view">${back('#/levels', t('levels'))}${pageHead(`Level ${l.code} · ${l.hours} guided learning`, `${l.code} — ${l.name}`, l.summary, l.summaryEs)}
    <div class="grid g2" style="align-items:start">
      <div>${l.units.map((u, i) => `<a class="unit ${store.isDone(u.id) ? 'done' : ''}" href="#/levels/${l.code}/${u.id}" style="color:inherit">
        <div class="unit-n">${store.isDone(u.id) ? icon('check') : i + 1}</div>
        <div style="flex:1"><h3 style="margin:0">${esc(u.title)}</h3><div class="small muted">${u.goals.map(esc).join(' · ')}</div>
        <div class="row" style="margin-top:8px;gap:6px">${u.grammar ? '<span class="tag blue">Grammar</span>' : ''}<span class="tag amber">Vocabulary</span>${u.listening ? '<span class="tag">Listening</span>' : ''}<span class="tag coral">Speaking</span><span class="tag mint">Practice</span></div></div>${icon('arrowRight', 'muted')}</a>`).join('')}</div>
      <div class="card"><h2>By the end of ${l.code} you can…</h2><ul class="fb-list">${l.cando.map((c) => `<li class="good">${icon('check')}<span>${esc(c)}</span></li>`).join('')}</ul>
      <div class="callout" style="margin-top:14px">Level descriptions follow the Common European Framework of Reference (CEFR). Hours are typical guided-learning estimates.</div>
      <button class="btn sm" style="margin-top:12px" data-setlevel="${l.code}">${icon('target')} Set ${l.code} as my level</button></div>
    </div></div>`,
    mount(root) {
      const b = root.querySelector('[data-setlevel]');
      b.onclick = () => { store.state.profile.level = l.code; store.save(); b.textContent = `✓ ${l.code} is now your level`; };
    },
  };
}

function unit(code, id) {
  const l = LEVELS.find((x) => x.code === code), u = l && l.units.find((x) => x.id === id);
  if (!u) return { title: '404', html: '<div class="empty">Unit not found.</div>' };
  const g = GRAMMAR.find((x) => x.id === u.grammar), ev = EVERYDAY.find((x) => x.id === u.everyday), li = LISTENING.find((x) => x.id === u.listening);
  const idx = l.units.indexOf(u), nextU = l.units[idx + 1];
  store.visit(u.id, `${l.code} · ${u.title}`, `#/levels/${code}/${id}`);
  return {
    title: `${l.code} · ${u.title}`,
    html: `<div class="view">${back(`#/levels/${code}`, `${l.code} ${l.name}`)}
    ${pageHead(`${l.code} · Unit ${idx + 1}`, esc(u.title), `Goals: ${u.goals.map(esc).join(' · ')}`)}
    <div class="grid g2" style="align-items:start">
      <div class="stack">
        <div class="card"><div class="row" style="margin-bottom:10px"><span class="ico amber">${icon('cards')}</span><h2 style="margin:0">Key language</h2></div>${vocabList(u.vocab)}</div>
        ${g ? `<div class="card"><div class="row" style="margin-bottom:10px"><span class="ico violet">${icon('puzzle')}</span><h2 style="margin:0">Grammar: ${esc(g.title)}</h2></div>
          <p class="small">${esc(g.context)}</p><table class="t">${g.formula.slice(0, 4).map(([a, b]) => `<tr><th style="width:34%">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table>
          <a class="btn sm" style="margin-top:10px" href="#/grammar/${g.id}">Full explanation & practice ${icon('arrowRight')}</a></div>` : ''}
        <div class="card"><div class="row" style="margin-bottom:10px"><span class="ico mint">${icon('check')}</span><h2 style="margin:0">Practice</h2></div>${exercises(u.ex, { skill: 'grammar' })}</div>
      </div>
      <div class="stack">
        <div><div class="row" style="margin-bottom:10px"><span class="ico coral">${icon('mic')}</span><h2 style="margin:0">Speaking task</h2></div>${speakPrompt(u.speak, { seconds: u.speak.seconds })}</div>
        ${ev || li ? `<div class="card"><h3>Keep going</h3><div class="stack">
          ${ev ? `<a class="row" href="#/everyday/${ev.id}" style="color:inherit;flex-wrap:nowrap"><span class="ico coral">${icon('coffee')}</span><span style="flex:1"><b>Everyday English: ${esc(ev.title)}</b><div class="small muted">Dialogue, natural expressions, role-play</div></span>${icon('arrowRight')}</a>` : ''}
          ${li ? `<a class="row" href="#/listening/${li.id}" style="color:inherit;flex-wrap:nowrap"><span class="ico blue">${icon('headphones')}</span><span style="flex:1"><b>Listening: ${esc(li.title)}</b><div class="small muted">${esc(li.desc)}</div></span>${icon('arrowRight')}</a>` : ''}
        </div></div>` : ''}
        <div class="card tint-mint"><div class="row between"><div><b>Finished this unit?</b><div class="small muted">+30 XP the first time</div></div>${doneBtn(u.id, `${l.code} · ${u.title}`, `#/levels/${code}/${id}`, 'grammar', 30)}</div>
        ${nextU ? `<a class="btn" style="margin-top:12px" href="#/levels/${code}/${nextU.id}">${t('next')}: ${esc(nextU.title)} ${icon('arrowRight')}</a>` : ''}</div>
      </div>
    </div></div>`,
  };
}
