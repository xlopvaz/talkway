import { icon } from '../icons.js';
import { store, srs } from '../store.js';
import { t, es, lang } from '../i18n.js';
import { esc, pageHead, back, sayBtn, tabs } from '../ui.js';
import { speak } from '../speech.js';
import { DECKS, wordKey } from '../data/vocabulary.js';

const keys = (d) => d.words.map((w) => wordKey(d.id, w.w));

export function render([deckId, mode]) {
  if (deckId === 'review') return session(DECKS.flatMap((d) => d.words.map((w) => ({ ...w, deck: d.id }))), 'All decks', '#/vocabulary', true);
  if (deckId) {
    const d = DECKS.find((x) => x.id === deckId);
    if (!d) return { title: '404', html: '<div class="empty">Deck not found</div>' };
    if (mode === 'study') return session(d.words.map((w) => ({ ...w, deck: d.id })), d.title, `#/vocabulary/${d.id}`);
    return browse(d);
  }
  const all = srs.stats(DECKS.flatMap(keys));
  return {
    title: t('vocabulary'),
    html: `<div class="view">${pageHead('Words in context', t('vocabulary'), 'Flashcards with audio, real examples, synonyms and antonyms — scheduled by a spaced repetition system so you review each word right before you’d forget it.', 'Tarjetas con repetición espaciada: repasas justo antes de olvidar.')}
    <div class="card ink row between" style="margin-bottom:20px"><div><div class="eyebrow" style="color:var(--coral)">Spaced repetition</div><h2 style="color:var(--bg);margin:0">${all.due} due · ${all.learned} learning · ${all.fresh} new</h2></div>
    <a class="btn primary" href="#/vocabulary/review">${icon('refresh')} ${all.due ? `${t('review')} ${all.due} due` : 'Study new words'}</a></div>
    <div class="grid auto">${DECKS.map((d) => { const s = srs.stats(keys(d)); const pct = Math.round(((d.words.length - s.fresh) / d.words.length) * 100);
      return `<a class="card click" href="#/vocabulary/${d.id}"><div class="row between"><span class="ico ${d.color}">${icon(d.icon)}</span>${s.due ? `<span class="tag coral">${s.due} ${t('due')}</span>` : ''}</div>
      <h3 style="margin-top:12px">${esc(d.title)}</h3><div class="small muted">${d.words.length} words · ${s.fresh} ${t('newWords')}</div><div class="bar amber" style="margin-top:8px"><i style="width:${Math.max(2, pct)}%"></i></div></a>`; }).join('')}</div></div>`,
  };
}

function browse(d) {
  return {
    title: d.title,
    html: `<div class="view">${back('#/vocabulary', t('vocabulary'))}${pageHead('Deck', esc(d.title), `${d.words.length} words and expressions.`)}
    <div class="row" style="margin-bottom:16px"><a class="btn primary" href="#/vocabulary/${d.id}/study">${icon('cards')} Study with flashcards</a></div>
    <div class="card" style="overflow-x:auto"><table class="t"><thead><tr><th>Word</th><th>Meaning & example</th><th>Synonyms / antonyms</th><th>ES</th><th>Status</th></tr></thead><tbody>
    ${d.words.map((w) => { const c = srs.get(wordKey(d.id, w.w)); const st = !c ? '<span class="tag">new</span>' : c.due <= Date.now() ? '<span class="tag coral">due</span>' : `<span class="tag mint">${Math.max(1, Math.round((c.due - Date.now()) / 86400000))} d</span>`;
      return `<tr><td><b>${esc(w.w)}</b> ${sayBtn(w.w)}${w.ipa ? `<div class="ipa small muted">${esc(w.ipa)}</div>` : ''}</td><td>${esc(w.d)}<div class="small"><i>${esc(w.ex || '')}</i> ${w.ex ? sayBtn(w.ex) : ''}</div></td>
      <td class="small">${w.syn ? `≈ ${w.syn.map(esc).join(', ')}` : ''}${w.ant ? `<br>≠ ${w.ant.map(esc).join(', ')}` : ''}</td><td class="small muted">${esc(w.es || '')}</td><td>${st}</td></tr>`; }).join('')}
    </tbody></table></div></div>`,
  };
}

function session(words, title, backHref, dueFirst) {
  const now = Date.now();
  const due = words.filter((w) => { const c = srs.get(wordKey(w.deck, w.w)); return c && c.due <= now; });
  const fresh = words.filter((w) => !srs.get(wordKey(w.deck, w.w))).slice(0, 10);
  let queue = [...due, ...fresh];
  const total = queue.length;
  let flipped = false, doneN = 0;
  const card = () => queue[0];
  const view = () => {
    const w = card();
    if (!w) return `<div class="card empty"><div class="ico mint" style="margin:0 auto 10px">${icon('trophy')}</div><h2>All done for now!</h2><p>Come back later — your next reviews are scheduled automatically.</p><a class="btn" href="${backHref}">${t('back')}</a></div>`;
    const k = wordKey(w.deck, w.w);
    return `<div class="row between small muted" style="max-width:520px;margin:0 auto 10px"><span>${doneN} / ${total} reviewed</span><span>${queue.length} left</span></div>
    <div class="bar amber" style="max-width:520px;margin:0 auto 14px"><i style="width:${total ? (doneN / total) * 100 : 0}%"></i></div>
    <div class="flash-wrap"><div class="flash ${flipped ? 'flipped' : ''}" id="fc" tabindex="0" aria-label="Flashcard, press space to flip">
      <div class="front"><div class="small muted">${srs.get(k) ? 'Review' : 'New word'}</div><div class="word">${esc(w.w)}</div>${w.ipa ? `<div class="ipa muted">${esc(w.ipa)}</div>` : ''}
        <button class="btn sm" style="margin-top:14px" data-say="${esc(w.w)}">${icon('speaker')} Listen</button><div class="small muted" style="margin-top:16px">Do you know it? Tap to flip</div></div>
      <div class="back"><div class="word" style="font-size:1.5rem">${esc(w.w)}</div><p style="margin:8px 0">${esc(w.d)}</p>
        ${w.ex ? `<p class="small" style="opacity:.85"><i>“${esc(w.ex)}”</i></p>` : ''}${w.syn ? `<div class="small" style="opacity:.75">≈ ${w.syn.map(esc).join(', ')}${w.ant ? ` · ≠ ${w.ant.map(esc).join(', ')}` : ''}</div>` : ''}
        ${w.es ? `<div class="small" style="margin-top:8px;color:var(--coral)">ES · ${esc(w.es)}</div>` : ''}</div>
    </div></div>
    <div class="srs-btns ${flipped ? '' : 'hidden'}">${['Again', 'Hard', 'Good', 'Easy'].map((l, g) => `<button class="btn ${g === 2 ? 'primary' : ''}" data-g="${g}">${l}<small>${srs.preview(k, g)}</small></button>`).join('')}</div>
    <div class="small muted" style="text-align:center;margin-top:10px">Keyboard: <span class="kbd">Space</span> flip · <span class="kbd">1–4</span> grade</div>`;
  };
  return {
    title: `${title} · flashcards`,
    html: `<div class="view">${back(backHref)}${pageHead('Spaced repetition', `${esc(title)}: flashcards`, dueFirst ? 'Due cards first, then up to 10 new words.' : 'Up to 10 new words per session, plus anything due.')}<div id="fcBox">${view()}</div></div>`,
    mount(root) {
      const box = root.querySelector('#fcBox');
      const redraw = () => { box.innerHTML = view(); };
      const flip = () => { if (!card()) return; flipped = !flipped; const el = box.querySelector('#fc'); el.classList.toggle('flipped', flipped); box.querySelector('.srs-btns').classList.toggle('hidden', !flipped); if (flipped) speak(card().w); };
      const grade = (g) => {
        const w = card(); if (!w || !flipped) return;
        srs.grade(wordKey(w.deck, w.w), g); store.save();
        queue.shift(); if (g === 0) queue.splice(Math.min(3, queue.length), 0, w); else doneN++;
        flipped = false; redraw();
      };
      box.addEventListener('click', (e) => {
        if (e.target.closest('[data-say]')) return;
        const g = e.target.closest('[data-g]'); if (g) return grade(+g.dataset.g);
        if (e.target.closest('#fc')) flip();
      });
      const key = (e) => { if (!document.body.contains(box)) return; if (e.code === 'Space' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); flip(); } if (['1', '2', '3', '4'].includes(e.key)) grade(+e.key - 1); };
      document.addEventListener('keydown', key);
      return () => document.removeEventListener('keydown', key);
    },
  };
}
