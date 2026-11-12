import { icon } from '../icons.js';
import { store } from '../store.js';
import { t, es, pick } from '../i18n.js';
import { esc, pageHead, back, dialogue, versus, exercises, vocabList, doneBtn, sayBtn, tabs } from '../ui.js';
import { roleplay } from './roleplay.js';
import { EVERYDAY } from '../data/everyday.js';

export function render([id]) {
  if (id) return detail(id);
  return {
    title: t('everyday'),
    html: `<div class="view">${pageHead('Real-life English', t('everyday'), '20 situations you will actually face. Learn what people really say — not just what textbooks teach — and practise it out loud.', '20 situaciones reales: lo que la gente dice de verdad.')}
    <div class="grid auto">${EVERYDAY.map((e) => `<a class="card click" href="#/everyday/${e.id}">
      <div class="row between"><span class="ico ${['coral', 'blue', 'amber', 'mint', 'violet'][e.n % 5]}">${icon(e.icon)}</span><span class="row" style="gap:6px"><span class="tag">${e.level}</span>${store.isDone('ev-' + e.id) ? `<span class="tag mint">${icon('check')}</span>` : ''}</span></div>
      <h3 style="margin-top:12px">${e.n}. ${esc(e.title)}</h3>${es(e.es)}<p class="small muted" style="margin:0">${e.dialogue.length}-line dialogue · ${e.roleplay.length}-turn role-play</p></a>`).join('')}</div></div>`,
  };
}

function detail(id) {
  const e = EVERYDAY.find((x) => x.id === id);
  if (!e) return { title: '404', html: '<div class="empty">Not found</div>' };
  store.visit('ev-' + e.id, e.title, `#/everyday/${e.id}`);
  const i = EVERYDAY.indexOf(e), nx = EVERYDAY[i + 1];
  return {
    title: e.title,
    html: `<div class="view">${back('#/everyday', t('everyday'))}
    ${pageHead(`Situation ${e.n} · ${e.level}`, esc(e.title), esc(e.intro), e.introEs)}
    ${tabs([['learn', '1 · Learn'], ['dialogue', '2 · Dialogue'], ['practice', '3 · Practice'], ['speak', '4 · Speak']], 'learn')}
    <div data-pane="learn" class="grid g2" style="align-items:start">
      <div class="card"><h2>Vocabulary in context</h2>${vocabList(e.vocab)}</div>
      <div class="stack">
        <div class="card"><h2>Natural expressions</h2><div class="vlist">${e.expressions.map((x) => `<div class="vitem"><span style="flex:1">${esc(x)}</span>${sayBtn(x)}</div>`).join('')}</div></div>
        <div class="card"><h2>Textbook vs real life</h2><p class="small muted">Both columns can be correct — the right one sounds like a real person.</p>${versus(e.versus)}</div>
      </div>
    </div>
    <div data-pane="dialogue" hidden class="grid g2" style="align-items:start">
      <div class="card">${dialogue(e.dialogue)}</div>
      <div class="card"><h2>Did you understand?</h2>${exercises(e.quiz.filter((q) => q.type === 'mcq'), { skill: 'listening' })}</div>
    </div>
    <div data-pane="practice" hidden class="grid g2" style="align-items:start">
      <div class="card"><h2>Fill the gaps</h2>${exercises(e.quiz.filter((q) => q.type === 'gap'), { skill: 'grammar' })}</div>
      <div class="card"><h2>Build the sentence</h2>${exercises(e.build, { skill: 'grammar' })}</div>
    </div>
    <div data-pane="speak" hidden class="grid g2" style="align-items:start">
      <div>${roleplay(e.roleplay, { name: 'Partner', accent: store.state.settings.accent, intro: `Simulated conversation: ${e.title}` })}</div>
      <div class="card"><h3>How it works</h3><p class="small">Your partner speaks first. Answer out loud with the microphone (Chrome/Edge) or type. You’ll see if your answer fits the situation, plus tips on common mistakes.</p>
      <div class="callout small">These conversations are scripted, not AI-generated. They’re designed to make you produce the key language of this situation.</div>
      <div class="row between" style="margin-top:16px"><b>Done with this situation?</b>${doneBtn('ev-' + e.id, e.title, `#/everyday/${e.id}`, 'speaking', 25)}</div>
      ${nx ? `<a class="btn" style="margin-top:12px" href="#/everyday/${nx.id}">${t('next')}: ${esc(nx.title)} ${icon('arrowRight')}</a>` : ''}</div>
    </div></div>`,
  };
}
