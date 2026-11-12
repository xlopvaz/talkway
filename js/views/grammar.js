import { icon } from '../icons.js';
import { store } from '../store.js';
import { t } from '../i18n.js';
import { esc, pageHead, back, exercises, sayBtn, doneBtn } from '../ui.js';
import { GRAMMAR } from '../data/grammar.js';

export function render([id]) {
  if (id) return detail(id);
  const groups = [...new Set(GRAMMAR.map((g) => g.group))];
  return {
    title: t('grammar'),
    html: `<div class="view">${pageHead('Grammar you can use', t('grammar'), 'Short, visual explanations built around real situations — with the mistakes Spanish speakers actually make, and instant self-correcting practice.', 'Gramática clara, visual y aplicada a situaciones reales.')}
    ${groups.map((gr) => `<section class="section" style="margin-top:20px"><h2>${gr}</h2><div class="grid auto">${GRAMMAR.filter((g) => g.group === gr).map((g) => `<a class="card click" href="#/grammar/${g.id}">
      <div class="row between"><span class="ico violet">${icon('puzzle')}</span><span class="row" style="gap:6px"><span class="tag">${g.level}</span>${store.isDone('gr-' + g.id) ? `<span class="tag mint">${icon('check')}</span>` : ''}</span></div>
      <h3 style="margin-top:12px">${esc(g.title)}</h3><p class="small muted" style="margin:0">${esc(g.context.split('.')[0])}.</p></a>`).join('')}</div></section>`).join('')}</div>`,
  };
}

function detail(id) {
  const g = GRAMMAR.find((x) => x.id === id);
  if (!g) return { title: '404', html: '<div class="empty">Not found</div>' };
  store.visit('gr-' + g.id, `Grammar: ${g.title}`, `#/grammar/${g.id}`);
  const i = GRAMMAR.indexOf(g), nx = GRAMMAR[i + 1];
  return {
    title: g.title,
    html: `<div class="view">${back('#/grammar', t('grammar'))}${pageHead(`${g.group} · ${g.level}`, esc(g.title), esc(g.context))}
    <div class="grid g2" style="align-items:start">
      <div class="stack">
        <div class="card"><h2>The pattern</h2><div class="stack">${g.formula.map(([a, b]) => `<div class="row" style="flex-wrap:nowrap;align-items:stretch"><span class="tag blue" style="min-width:130px;justify-content:center;border-radius:10px">${esc(a)}</span><div class="vitem" style="flex:1"><span style="flex:1">${esc(b)}</span>${sayBtn(b.replace(/[↗↘]/g, ''))}</div></div>`).join('')}</div></div>
        <div class="card"><h2>In real life</h2><div class="vlist">${g.examples.map((x) => `<div class="vitem"><span style="flex:1">${esc(x)}</span>${sayBtn(x)}</div>`).join('')}</div></div>
        <div class="card"><h2>Common mistakes</h2><div class="vs"><div class="h">✗ Avoid</div><div class="h">✓ Say</div>${g.mistakes.map(([a, b]) => `<div style="text-decoration:line-through;text-decoration-color:var(--red)">${esc(a)}</div><div><b>${esc(b)}</b></div>`).join('')}</div></div>
      </div>
      <div class="stack">
        <div class="card"><h2>Check yourself</h2>${exercises(g.ex, { skill: 'grammar' })}</div>
        <div class="card tint-mint"><div class="row between"><b>Got it?</b>${doneBtn('gr-' + g.id, `Grammar: ${g.title}`, `#/grammar/${g.id}`, 'grammar', 15)}</div>
        ${nx ? `<a class="btn" style="margin-top:12px" href="#/grammar/${nx.id}">${t('next')}: ${esc(nx.title)} ${icon('arrowRight')}</a>` : ''}</div>
      </div>
    </div></div>`,
  };
}
