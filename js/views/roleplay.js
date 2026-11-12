// Scripted role-play engine: the character speaks (TTS), you answer by voice (STT) or text.
// Responses are checked against expected key language for the turn — transparent, rule-based, not AI.
import { icon } from '../icons.js';
import { store } from '../store.js';
import { t } from '../i18n.js';
import { esc, xpToast } from '../ui.js';
import { speak, stopSpeaking, listen, sttAvailable, norm, getFeedback } from '../speech.js';

const RP = new Map();
let n = 0, bound = false, rec = null;

export function roleplay(turns, { accent = 'en-GB', name = 'Partner', intro = '', skill = 'speaking' } = {}) {
  const id = 'rp' + ++n;
  RP.set(id, { turns, accent, name, skill, i: -1, score: 0 });
  bind();
  return `<div class="card flat" data-rp="${id}">
    <div class="row between"><div><b>${esc(name)}</b> <span class="tag">${esc(accent)}</span><div class="small muted">${esc(intro || 'Scripted role-play · answer out loud or type')}</div></div>
    <button class="btn sm primary" data-rp-start>${icon('play')} ${t('start')}</button></div>
    <div class="chat" data-rp-chat style="margin-top:14px"></div>
    <div data-rp-controls hidden style="margin-top:12px">
      <div class="small muted" data-rp-hint></div>
      <div class="row" style="margin-top:8px">
        <button class="btn primary" data-rp-mic>${icon('mic')} Answer</button>
        <input class="field" data-rp-text placeholder="…or type your answer and press Enter" style="flex:1;min-width:200px">
        <button class="btn sm ghost" data-rp-repeat>${icon('refresh')} Hear again</button>
      </div>
    </div></div>`;
}

function npcLine(box, s, text) {
  box.insertAdjacentHTML('beforeend', `<div class="line"><div class="avatar">${esc(s.name.slice(0, 2))}</div><div class="bubble"><span class="who">${esc(s.name)}</span>${esc(text)}</div></div>`);
  box.scrollTop = box.scrollHeight;
}
function userLine(box, text, note) {
  box.insertAdjacentHTML('beforeend', `<div class="line b"><div class="avatar">You</div><div class="bubble"><span class="who">You</span>${esc(text)}${note || ''}</div></div>`);
  box.scrollTop = box.scrollHeight;
}

function next(root, s) {
  s.i++;
  const box = root.querySelector('[data-rp-chat]'), ctr = root.querySelector('[data-rp-controls]');
  if (s.i >= s.turns.length) {
    ctr.hidden = true;
    const xp = store.award(s.skill, 10 + s.score * 3, true); xpToast(xp);
    box.insertAdjacentHTML('beforeend', `<div class="callout" style="margin-top:6px">${icon('trophy')} <b>Conversation complete!</b> You used the target language in ${s.score}/${s.turns.length} turns. <button class="btn sm" data-rp-start style="margin-left:6px">${icon('refresh')} Again</button></div>`);
    return;
  }
  const turn = s.turns[s.i];
  npcLine(box, s, turn.npc);
  root.querySelector('[data-rp-hint]').innerHTML = `${icon('sparkle')} <b>Your turn:</b> ${esc(turn.hint)}`;
  ctr.hidden = false;
  if (!/^\(/.test(turn.npc)) speak(turn.npc, { accent: s.accent });
}

async function answer(root, s, text, durationSec) {
  const turn = s.turns[s.i];
  const nt = norm(text);
  const hit = (turn.expect || []).some((k) => nt.includes(norm(k)));
  if (hit) s.score++;
  const fb = await getFeedback({ transcript: text, durationSec, prompt: { minWords: 5 } });
  const tips = fb.items.filter((i) => i.type === 'tip' && !/words\. Try|Connect your ideas/.test(i.text)).slice(0, 2);
  const note = `<div class="small" style="margin-top:4px;color:${hit ? 'var(--mint)' : 'var(--ink-3)'}">${hit ? '✓ Good — that fits the situation.' : `Tip: ${esc(turn.hint)} (e.g. “${esc(turn.expect[0])}…”)`}</div>${tips.map((x) => `<div class="small" style="color:var(--amber)">• ${esc(x.text)}</div>`).join('')}`;
  userLine(root.querySelector('[data-rp-chat]'), text, note);
  setTimeout(() => next(root, s), 900);
}

function bind() {
  if (bound) return; bound = true;
  document.addEventListener('click', (e) => {
    const root = e.target.closest('[data-rp]'); if (!root) return;
    const s = RP.get(root.dataset.rp); const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-rp-start')) { stopSpeaking(); s.i = -1; s.score = 0; root.querySelector('[data-rp-chat]').innerHTML = ''; next(root, s); }
    if (b.hasAttribute('data-rp-repeat')) { stopSpeaking(); speak(s.turns[s.i].npc, { accent: s.accent }); }
    if (b.hasAttribute('data-rp-mic')) {
      if (!sttAvailable()) { root.querySelector('[data-rp-hint]').innerHTML = `<span style="color:var(--amber)">${t('noSpeech')}</span>`; root.querySelector('[data-rp-text]').focus(); return; }
      if (rec) { rec.stop(); return; }
      stopSpeaking();
      b.classList.add('rec'); b.innerHTML = `${icon('stop')} ${t('listening_')}`;
      rec = listen({
        onFinal: ({ transcript, durationSec }) => answer(root, s, transcript, durationSec),
        onError: (err) => { root.querySelector('[data-rp-hint]').innerHTML = `<span style="color:var(--red)">Mic: ${esc(err)}</span>`; },
        onEnd: () => { rec = null; b.classList.remove('rec'); b.innerHTML = `${icon('mic')} Answer`; },
      }, { lang: s.accent });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.matches('[data-rp-text]')) return;
    const root = e.target.closest('[data-rp]'), s = RP.get(root.dataset.rp), v = e.target.value.trim();
    if (v && s.i >= 0 && s.i < s.turns.length) { e.target.value = ''; answer(root, s, v, null); }
  });
}
