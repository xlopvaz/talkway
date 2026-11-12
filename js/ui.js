// Reusable UI components: exercises, dialogues, speaking widgets, toasts.
import { icon } from './icons.js';
import { store } from './store.js';
import { t, es } from './i18n.js';
import { speak, speakDialogue, stopSpeaking, listen, sttAvailable, compareSentence, getFeedback, recordClip, norm } from './speech.js';

export const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const REG = new Map();
let uid = 0;
const reg = (data) => { const id = 'x' + ++uid; REG.set(id, data); return id; };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function toast(html, cls = '') {
  const z = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + cls; el.innerHTML = html;
  z.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2200);
}
export const xpToast = (n) => toast(`${icon('bolt')} <span>+<b>${n} XP</b></span>`, 'xp');

/** Small speaker button that reads `text` aloud */
export const sayBtn = (text, accent) => `<button class="say" data-say="${esc(text)}"${accent ? ` data-accent="${accent}"` : ''} aria-label="Listen" title="Listen">${icon('speaker')}</button>`;

/* ---------- Dialogue ---------- */
export function dialogue(lines, { accent } = {}) {
  const id = reg({ lines, accent });
  const speakers = [...new Set(lines.map((l) => l.s))];
  return `<div class="stack">
    <div class="row"><button class="btn sm dark" data-dlg-play="${id}">${icon('play')} Play dialogue</button>
    <button class="btn sm ghost" data-dlg-stop>${icon('stop')} Stop</button></div>
    <div class="dialogue" id="d-${id}">
    ${lines.map((l, i) => `<div class="line ${speakers.indexOf(l.s) % 2 ? 'b' : ''}" data-i="${i}">
      <div class="avatar">${esc(l.s.slice(0, 2))}</div>
      <div class="bubble"><span class="who">${esc(l.s)}</span>${esc(l.t)}${sayBtn(l.t, l.accent || accent)}${es(l.es)}</div></div>`).join('')}
    </div></div>`;
}

/* ---------- Textbook vs real English ---------- */
export function versus(pairs) {
  return `<div class="vs"><div class="h">Textbook English</div><div class="h">What people actually say</div>
  ${pairs.map(([a, b]) => `<div>${esc(a)}</div><div><b>${esc(b)}</b> ${sayBtn(b)}</div>`).join('')}</div>`;
}

/* ---------- Exercises ----------
   mcq:   { type:'mcq', q, options:[...], a:index, why }
   gap:   { type:'gap', text:'I ___ coffee.', a:'drink|have', why }
   build: { type:'build', a:'Could I have the bill please', es }
*/
export function exercises(list, ctx = {}) {
  if (!list || !list.length) return '';
  return list.map((ex, n) => {
    const id = reg({ ...ex, ctx });
    if (ex.type === 'mcq') {
      return `<div class="q" data-ex="${id}"><div class="q-prompt">${n + 1}. ${esc(ex.q)}</div>
        <div class="opts">${ex.options.map((o, i) => `<button class="opt" data-opt="${i}">${esc(o)}</button>`).join('')}</div><div class="fb"></div></div>`;
    }
    if (ex.type === 'gap') {
      const parts = ex.text.split('___');
      return `<div class="q" data-ex="${id}"><div class="q-prompt">${n + 1}. ${parts.map((p, i) => esc(p) + (i < parts.length - 1 ? `<input class="gap-input" aria-label="answer" autocomplete="off" spellcheck="false">` : '')).join('')}</div>
        ${ex.hint ? `<div class="small muted">Hint: ${esc(ex.hint)}</div>` : ''}
        <div class="row" style="margin-top:8px"><button class="btn sm" data-gap-check>${t('check')}</button><button class="btn sm ghost" data-gap-show>Show answer</button></div><div class="fb"></div></div>`;
    }
    if (ex.type === 'build') {
      const words = ex.a.split(' ');
      let pool = shuffle(words); if (pool.join(' ') === ex.a && words.length > 2) pool = shuffle(words);
      return `<div class="q" data-ex="${id}"><div class="q-prompt">${n + 1}. Build the sentence${ex.es ? '' : ''}</div>${ex.es ? `<div class="small muted" style="margin-bottom:8px">“${esc(ex.es)}”</div>` : ''}
        <div class="builder-target" data-target></div><div class="builder-pool" data-pool>${pool.map((w) => `<button class="chip">${esc(w)}</button>`).join('')}</div>
        <div class="row"><button class="btn sm" data-build-check>${t('check')}</button><button class="btn sm ghost" data-build-reset>${t('reset')}</button></div><div class="fb"></div></div>`;
    }
    return '';
  }).join('');
}

function showFb(q, ok, msg) {
  const fb = q.querySelector('.fb');
  fb.className = 'fb show ' + (ok ? 'ok' : 'bad');
  fb.innerHTML = msg;
}
function scoreEx(q, data, ok) {
  if (q.dataset.scored) return;
  if (ok) { q.dataset.scored = 1; const xp = store.award(data.ctx.skill || 'grammar', 5, true); xpToast(xp); }
  else store.award(data.ctx.skill || 'grammar', 0, false);
}

/* ---------- Speaking widgets ---------- */
/** Repeat-after-me: model audio → user speaks → word-by-word comparison */
export function repeatWidget(target, { accent, note } = {}) {
  const id = reg({ target, accent });
  return `<div class="q" data-repeat="${id}">
    <div class="row between"><div><b style="font-size:1.05rem">${esc(target)}</b>${note ? `<div class="small muted">${esc(note)}</div>` : ''}</div>
    <div class="row"><button class="btn sm" data-say="${esc(target)}"${accent ? ` data-accent="${accent}"` : ''}>${icon('speaker')} Model</button>
    <button class="btn sm" data-say="${esc(target)}" data-rate="0.6"${accent ? ` data-accent="${accent}"` : ''}>Slow</button>
    <button class="btn sm primary" data-rep-mic>${icon('mic')} Repeat</button></div></div>
    <div class="rep-out" hidden style="margin-top:12px"></div></div>`;
}

/** Open speaking prompt with mic, transcript, playback of own voice and feedback */
export function speakPrompt(p, { skill = 'speaking', seconds } = {}) {
  const id = reg({ ...p, skill });
  return `<div class="card flat" data-speak="${id}">
    <div class="row between" style="align-items:flex-start"><div style="flex:1;min-width:220px">
      <div class="q-prompt" style="font-size:1.08rem">${esc(p.q)} ${sayBtn(p.q)}</div>${es(p.es)}
      ${p.useful ? `<div class="row small" style="margin-top:6px"><span class="muted">Useful:</span>${p.useful.map((u) => `<span class="tag blue">${esc(u)}</span>`).join('')}</div>` : ''}
    </div>${seconds ? `<div class="timer" data-timer>${seconds}</div>` : ''}</div>
    <div class="mic-stage"><button class="mic-big" data-sp-mic aria-label="${t('speakNow')}">${icon('mic')}</button>
      <div class="small muted" style="margin-top:10px" data-sp-status>${sttAvailable() ? t('speakNow') : t('noSpeech')}</div></div>
    <div class="transcript" data-sp-tx hidden></div>
    <details style="margin-top:10px"><summary class="small muted">${t('typeInstead')}</summary>
      <textarea class="field" data-sp-type style="margin-top:8px" placeholder="Type what you would say…"></textarea>
      <button class="btn sm" data-sp-typed style="margin-top:6px">Get feedback</button></details>
    <div class="row" style="margin-top:10px" data-sp-actions hidden>
      <button class="btn sm" data-sp-play hidden>${icon('play')} Hear yourself</button>
      ${p.model ? `<button class="btn sm" data-sp-model>${icon('sparkle')} Model answer</button>` : ''}
    </div>
    <div data-sp-model-out hidden class="callout" style="margin-top:10px"></div>
    <div data-sp-fb style="margin-top:12px"></div></div>`;
}

function renderFeedback(box, fb) {
  box.innerHTML = `<div class="small muted" style="margin-bottom:6px">Feedback · ${esc(fb.source)}</div>
  ${fb.correctedVersion ? `<div class="callout" style="margin-bottom:8px"><b>More natural:</b> ${esc(fb.correctedVersion)}</div>` : ''}
  <ul class="fb-list">${fb.items.map((i) => `<li class="${i.type}">${icon(i.type === 'good' ? 'check' : i.type === 'tip' ? 'sparkle' : 'clock')}<span>${esc(i.text)}</span></li>`).join('')}</ul>`;
}

/* ---------- Global delegated handlers (bound once) ---------- */
let activeRec = null;
export function bindGlobal() {
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('button, [data-say]');
    if (!el) return;

    if (el.dataset.say !== undefined && el.dataset.say) {
      stopSpeaking(); speak(el.dataset.say, { accent: el.dataset.accent, rate: el.dataset.rate ? +el.dataset.rate : undefined }); return;
    }
    if (el.dataset.dlgPlay) {
      const d = REG.get(el.dataset.dlgPlay), box = document.getElementById('d-' + el.dataset.dlgPlay);
      speakDialogue(d.lines, { accent: d.accent, onLine: (i) => box.querySelectorAll('.line').forEach((l, k) => (l.style.opacity = i < 0 || k === i ? 1 : 0.4)) });
      return;
    }
    if (el.hasAttribute('data-dlg-stop')) { stopSpeaking(); document.querySelectorAll('.line').forEach((l) => (l.style.opacity = 1)); return; }

    // MCQ
    const q = el.closest('[data-ex]');
    if (q && el.dataset.opt !== undefined) {
      const data = REG.get(q.dataset.ex), i = +el.dataset.opt, ok = i === data.a;
      if (q.dataset.locked) return;
      el.classList.add(ok ? 'ok' : 'bad');
      if (ok) { q.dataset.locked = 1; q.querySelectorAll('.opt').forEach((o) => (o.disabled = true)); }
      showFb(q, ok, (ok ? `<b>${t('correct')}</b> ` : `${t('tryAgain')} `) + (ok && data.why ? esc(data.why) : ''));
      scoreEx(q, data, ok); return;
    }
    // GAP
    if (q && (el.hasAttribute('data-gap-check') || el.hasAttribute('data-gap-show'))) {
      const data = REG.get(q.dataset.ex);
      const answers = String(data.a).split('||'); // multiple gaps separated by ||
      const inputs = [...q.querySelectorAll('.gap-input')];
      if (el.hasAttribute('data-gap-show')) { inputs.forEach((inp, k) => (inp.value = answers[k].split('|')[0])); showFb(q, true, data.why ? esc(data.why) : ''); q.dataset.scored = 1; return; }
      let all = true;
      inputs.forEach((inp, k) => {
        const ok = answers[k].split('|').some((a) => norm(a) === norm(inp.value));
        inp.classList.toggle('ok', ok); inp.classList.toggle('bad', !ok); all = all && ok;
      });
      showFb(q, all, all ? `<b>${t('correct')}</b> ${esc(data.why || '')}` : t('tryAgain'));
      scoreEx(q, data, all); return;
    }
    // BUILDER
    if (q && el.classList.contains('chip')) {
      const target = q.querySelector('[data-target]'), pool = q.querySelector('[data-pool]');
      (el.parentElement === pool ? target : pool).appendChild(el); return;
    }
    if (q && el.hasAttribute('data-build-reset')) {
      const pool = q.querySelector('[data-pool]'); q.querySelectorAll('[data-target] .chip').forEach((c) => pool.appendChild(c)); return;
    }
    if (q && el.hasAttribute('data-build-check')) {
      const data = REG.get(q.dataset.ex);
      const got = [...q.querySelectorAll('[data-target] .chip')].map((c) => c.textContent).join(' ');
      const ok = norm(got) === norm(data.a);
      showFb(q, ok, ok ? `<b>${t('correct')}</b> ${esc(data.a)} ${sayBtn(data.a)}` : t('tryAgain'));
      scoreEx(q, data, ok); return;
    }

    // REPEAT AFTER ME
    const rp = el.closest('[data-repeat]');
    if (rp && el.hasAttribute('data-rep-mic')) {
      const data = REG.get(rp.dataset.repeat), out = rp.querySelector('.rep-out');
      out.hidden = false;
      if (!sttAvailable()) { out.innerHTML = `<div class="callout warn small">${t('noSpeech')}</div>`; return; }
      if (activeRec) { activeRec.stop(); return; }
      el.classList.add('rec'); el.innerHTML = `${icon('stop')} ${t('listening_')}`;
      out.innerHTML = `<div class="transcript muted">…</div>`;
      activeRec = listen({
        onInterim: (txt) => (out.innerHTML = `<div class="transcript">${esc(txt)}</div>`),
        onFinal: ({ transcript, confidence }) => {
          const r = compareSentence(data.target, transcript);
          const good = r.accuracy >= 85;
          out.innerHTML = `<div class="transcript diff">${r.tokens.map((x) => `<span class="${x.k}">${esc(x.w)}</span>`).join(' ')}</div>
          <div class="row" style="margin-top:8px"><span class="tag ${good ? 'mint' : r.accuracy >= 60 ? 'amber' : 'coral'}">Match ${r.accuracy}%</span>
          ${confidence != null ? `<span class="tag">Recogniser confidence ${Math.round(confidence * 100)}%</span>` : ''}
          ${r.missed.length ? `<span class="small muted">Practise: ${r.missed.map((w) => `<b>${esc(w)}</b> ${sayBtn(w)}`).join(' ')}</span>` : `<span class="small" style="color:var(--mint)">${icon('check')} Every word was recognised.</span>`}</div>
          <div class="small muted" style="margin-top:6px">Green = recognised, red = not recognised (say it again more clearly), grey = extra words.</div>`;
          store.award('pronunciation', good ? 8 : 3, good); if (good) xpToast(8);
        },
        onError: (err) => (out.innerHTML = `<div class="callout warn small">Microphone error: ${esc(err)}. Check browser permissions.</div>`),
        onEnd: () => { activeRec = null; el.classList.remove('rec'); el.innerHTML = `${icon('mic')} Repeat`; },
      }, { lang: data.accent || 'en-US' });
      return;
    }

    // OPEN SPEAKING
    const sp = el.closest('[data-speak]');
    if (sp) {
      const data = REG.get(sp.dataset.speak);
      const txBox = sp.querySelector('[data-sp-tx]'), fbBox = sp.querySelector('[data-sp-fb]'), status = sp.querySelector('[data-sp-status]');
      const actions = sp.querySelector('[data-sp-actions]');
      const finish = async (transcript, durationSec) => {
        txBox.hidden = false; txBox.innerHTML = `<div class="small muted">${t('yourAnswer')}</div>${esc(transcript)}`;
        actions.hidden = false;
        fbBox.innerHTML = '<div class="small muted">Analysing…</div>';
        const fb = await getFeedback({ transcript, durationSec, prompt: data });
        renderFeedback(fbBox, fb);
        const xp = store.award(data.skill, 10, true); xpToast(xp);
      };
      if (el.hasAttribute('data-sp-mic')) {
        if (!sttAvailable()) { status.textContent = t('noSpeech'); sp.querySelector('details').open = true; return; }
        if (activeRec) { activeRec.stop(); return; }
        el.classList.add('rec'); status.textContent = t('listening_') + ' (tap again to stop)';
        let clip = null;
        try { clip = await recordClip(120000); } catch { /* no recording permission; STT may still work */ }
        const timerEl = sp.querySelector('[data-timer]'); let left = data.seconds || 0, tick;
        if (timerEl && data.seconds) tick = setInterval(() => { left--; timerEl.textContent = Math.max(0, left); if (left <= 0) activeRec && activeRec.stop(); }, 1000);
        activeRec = listen({
          onInterim: (txt) => { txBox.hidden = false; txBox.textContent = txt; },
          onFinal: ({ transcript, durationSec }) => finish(transcript, durationSec),
          onError: (err) => { status.textContent = err === 'no-speech' ? 'No speech detected — try again.' : 'Microphone error: ' + err; },
          onEnd: async () => {
            activeRec = null; el.classList.remove('rec'); status.textContent = t('speakNow'); clearInterval(tick);
            if (clip) { clip.stop(); const url = await clip.done; const pb = sp.querySelector('[data-sp-play]'); pb.hidden = false; pb.dataset.url = url; }
          },
        }, { lang: 'en-US', continuous: true });
        return;
      }
      if (el.hasAttribute('data-sp-typed')) { const v = sp.querySelector('[data-sp-type]').value.trim(); if (v) finish(v, null); return; }
      if (el.hasAttribute('data-sp-play')) { new Audio(el.dataset.url).play(); return; }
      if (el.hasAttribute('data-sp-model')) {
        const box = sp.querySelector('[data-sp-model-out]'); box.hidden = !box.hidden;
        box.innerHTML = `<b>Model answer</b> ${sayBtn(data.model)}<br>${esc(data.model)}`; return;
      }
    }
  });
  // Enter key checks gap answers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('gap-input')) e.target.closest('.q').querySelector('[data-gap-check]').click();
  });
}

/* ---------- Layout helpers ---------- */
export const pageHead = (eyebrow, title, lede, esLede) => `<header class="page-head"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}${es(esLede)}</header>`;
export const back = (href, label) => `<a class="back-link" href="${href}">${icon('arrowLeft')} ${label || t('back')}</a>`;
export const tabs = (items, active, attr = 'data-tab') => `<div class="tabs" role="tablist">${items.map(([k, label]) => `<button role="tab" ${attr}="${k}" class="${k === active ? 'on' : ''}">${label}</button>`).join('')}</div>`;
export const vocabList = (items) => `<div class="vlist">${items.map((v) => `<div class="vitem"><div style="flex:1"><b>${esc(v.w)}</b> ${v.ipa ? `<span class="ipa">${esc(v.ipa)}</span>` : ''} ${sayBtn(v.w)}<div class="small muted">${esc(v.d || '')}</div>${v.ex ? `<div class="small"><i>${esc(v.ex)}</i></div>` : ''}${es(v.es)}</div></div>`).join('')}</div>`;
export const doneBtn = (id, title, route, skill, xp = 20) =>
  `<button class="btn ${store.isDone(id) ? '' : 'primary'}" data-complete="${id}" data-title="${esc(title)}" data-route="${route}" data-skill="${skill}" data-xp="${xp}">${icon('check')} ${store.isDone(id) ? t('done') : t('markDone')}</button>`;
