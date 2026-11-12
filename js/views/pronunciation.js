import { icon } from '../icons.js';
import { store } from '../store.js';
import { t, es } from '../i18n.js';
import { esc, pageHead, repeatWidget, exercises, sayBtn, xpToast } from '../ui.js';
import { speak, stopSpeaking } from '../speech.js';
import { IPA, PAIRS, STRESS, CONNECTED, INTONATION, UK_US, TONGUE } from '../data/pronunciation.js';

const TABS = [['ipa', 'IPA chart'], ['pairs', 'Similar sounds'], ['stress', 'Word & sentence stress'], ['connected', 'Connected speech'], ['intonation', 'Intonation'], ['ukus', 'British vs American'], ['drills', 'Repeat drills']];

const cell = (x) => `<button class="ipa-cell" data-say="${esc(x.w)}" title="${esc(x.tip || '')}"><span class="sym">/${x.s}/</span><b>${esc(x.w)}</b>${x.ex ? `<div class="small muted">${esc(x.ex)}</div>` : ''}${x.tip ? `<div class="small" style="color:var(--coral);margin-top:4px">${esc(x.tip)}</div>` : ''}</button>`;

export function render([tab = 'ipa']) {
  const body = {
    ipa: () => `<p class="muted">Tap any symbol to hear an example word. The International Phonetic Alphabet (IPA) shows exactly how words sound — dictionaries use it, so it’s worth learning.</p>
      <h2>Vowels</h2><div class="ipa-grid">${IPA.vowels.map(cell).join('')}</div>
      <h2 class="section">Diphthongs</h2><div class="ipa-grid">${IPA.diphthongs.map(cell).join('')}</div>
      <h2 class="section">Consonants</h2><div class="ipa-grid">${IPA.consonants.map(cell).join('')}</div>`,
    pairs: () => `<p class="muted">Minimal pairs are words that differ in just one sound. These are the contrasts Spanish speakers find hardest.</p>
      <div class="grid g2" style="align-items:start"><div class="stack">${PAIRS.map((p, i) => `<div class="card"><h3>${esc(p.title)}</h3><p class="small muted">${esc(p.note)}</p>
        <div class="row">${p.pairs.map(([a, b]) => p.noBoth ? `<span class="tag mint">${esc(a)}</span><span class="tag coral">${esc(b)}</span>` : `<span class="row" style="gap:4px;padding:4px 8px;border:1px solid var(--line);border-radius:10px"><button class="btn sm ghost" data-say="${esc(a)}">${esc(a)}</button><span class="muted">·</span><button class="btn sm ghost" data-say="${esc(b)}">${esc(b)}</button></span>`).join('')}</div>
        ${p.noBoth ? '' : `<button class="btn sm" style="margin-top:10px" data-pairquiz="${i}">${icon('headphones')} Which one do you hear?</button>`}</div>`).join('')}</div>
        <div class="card" style="position:sticky;top:80px"><h3>Ear training</h3><div id="pairQuiz" class="muted small">Choose “Which one do you hear?” on any set to start a 5-question listening test.</div></div></div>`,
    stress: () => `<div class="grid g2" style="align-items:start"><div class="stack">
      <div class="card"><h2>Word stress</h2><p class="small">${esc(STRESS.word.intro)}</p><div class="vlist">${STRESS.word.items.map((x) => `<div class="vitem"><span style="flex:1"><b>${esc(x.w)}</b> <span class="ipa">${esc(x.ipa)}</span></span>${sayBtn(x.say)}</div>`).join('')}</div>
      <div class="callout" style="margin-top:12px">${esc(STRESS.word.rule)}</div></div>
      <div class="card"><h3>Quick check</h3>${exercises(STRESS.word.quiz, { skill: 'pronunciation' })}</div></div>
      <div class="stack"><div class="card"><h2>Sentence stress & rhythm</h2><p class="small">${esc(STRESS.sentence.intro)}</p>${STRESS.sentence.drills.map((d) => repeatWidget(d.charAt(0) + d.slice(1).toLowerCase().replace(/\bi\b/g, 'I').replace(/london/g, 'London'), { note: d })).join('')}</div>
      <div class="card"><h2>Stress changes meaning</h2><p class="small"><b>${esc(STRESS.sentence.shift.base)}</b> ${sayBtn(STRESS.sentence.shift.base)}</p><table class="t">${STRESS.sentence.shift.variants.map(([a, b]) => `<tr><td><b>${esc(a)}</b></td><td class="muted">→ ${esc(b)}</td></tr>`).join('')}</table></div></div></div>`,
    connected: () => `<p class="muted">Natural English is not a list of separate words. Sounds link, weaken and disappear. Understanding this is the key to understanding fast speech.</p>
      <div class="grid g2" style="align-items:start">${CONNECTED.map((c) => `<div class="card"><h3>${esc(c.title)}</h3><p class="small muted">${esc(c.intro)}</p><table class="t">${c.drills.map(([a, b]) => `<tr><td><b>${esc(a)}</b> ${sayBtn(a.split('→')[0].trim())}</td><td class="muted"><span class="ipa">${esc(b)}</span></td></tr>`).join('')}</table></div>`).join('')}</div>`,
    intonation: () => `<p class="muted">Intonation is the music of the sentence. It shows if you’re asking, sure, unsure, polite or finished.</p>
      <div class="grid g2" style="align-items:start">${INTONATION.map((x) => `<div class="card"><h3>${esc(x.title)}</h3>${x.ex.map((e) => `<div class="vitem" style="margin-top:6px"><span style="flex:1">${esc(e)}</span>${sayBtn(e.replace(/[↗↘]|\(.*?\)/g, '').trim())}</div>`).join('')}<p class="small muted" style="margin-top:8px">${esc(x.note)}</p></div>`).join('')}</div>
      <div class="callout warn small" style="margin-top:16px">Synthetic voices reproduce intonation only approximately. Use these as a guide and listen to real speakers in the Listening Lab.</div>`,
    ukus: () => `<p class="muted">Hear each word in a British and an American voice (if installed on your device).</p>
      <div class="card" style="overflow-x:auto"><table class="t"><thead><tr><th>Word</th><th>🇬🇧 British</th><th>🇺🇸 American</th><th>Difference</th></tr></thead><tbody>${UK_US.map(([w, uk, us, n]) => `<tr><td><b>${esc(w)}</b></td>
        <td><button class="btn sm ghost" data-say="${esc(w)}" data-accent="en-GB">${icon('speaker')}</button> <span class="ipa">${esc(uk)}</span></td>
        <td><button class="btn sm ghost" data-say="${esc(w)}" data-accent="en-US">${icon('speaker')}</button> <span class="ipa">${esc(us)}</span></td><td class="small muted">${esc(n)}</td></tr>`).join('')}</tbody></table></div>`,
    drills: () => `<p class="muted">Listen to the model, then repeat. Your speech is transcribed and compared word by word: green words were recognised, red ones need another try.</p>
      <div class="grid g2" style="align-items:start"><div><h2>Tongue twisters</h2>${TONGUE.map((x) => repeatWidget(x)).join('')}</div>
      <div><h2>Everyday sentences</h2>${['I’d like a glass of water, please.', 'Could you tell me where the station is?', 'I think it’s worth it.', 'We’ve been waiting for over an hour.', 'The weather’s been really weird this week.', 'Thirty-three thousand three hundred.'].map((x) => repeatWidget(x)).join('')}</div></div>
      <div class="callout small" style="margin-top:14px">Speech recognition checks that words are <b>understandable</b>, not your exact accent. A high match means a listener would understand you — which is the real goal.</div>`,
  }[tab] || (() => '');
  return {
    title: t('pronunciation'),
    html: `<div class="view">${pageHead('Sound clear & natural', t('pronunciation'), 'Sounds, stress, rhythm, linking and intonation — with audio examples and repeat-after-me drills.', 'Sonidos, acento, ritmo, enlace y entonación con audio y práctica.')}
    <div class="tabs">${TABS.map(([k, l]) => `<a href="#/pronunciation/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</div>${body()}</div>`,
    mount(root) {
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-pairquiz]'); if (!b) return;
        const set = PAIRS[+b.dataset.pairquiz]; const box = root.querySelector('#pairQuiz');
        let n = 0, score = 0;
        const ask = () => {
          if (n >= 5) { box.innerHTML = `<h3>${score}/5 correct</h3><p class="small muted">${score >= 4 ? 'Excellent ear!' : 'Keep practising — listen to each pair a few times.'}</p>`; if (score >= 4) { store.award('pronunciation', 10, true); xpToast(10); } return; }
          const [a, bb] = set.pairs[Math.floor(Math.random() * set.pairs.length)]; const target = Math.random() < 0.5 ? a : bb;
          box.innerHTML = `<div class="small muted">${set.title} · ${n + 1}/5</div><button class="btn dark" id="pqPlay" style="margin:10px 0">${icon('speaker')} Play</button><div class="opts">${[a, bb].map((w) => `<button class="opt" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div><div class="fb"></div>`;
          const play = () => { stopSpeaking(); speak(target, { rate: 0.85 }); };
          box.querySelector('#pqPlay').onclick = play; play();
          box.querySelectorAll('[data-w]').forEach((o) => (o.onclick = () => {
            const ok = o.dataset.w === target; if (ok) score++;
            o.classList.add(ok ? 'ok' : 'bad'); const fb = box.querySelector('.fb'); fb.className = 'fb show ' + (ok ? 'ok' : 'bad'); fb.textContent = ok ? t('correct') : `It was “${target}”.`;
            store.award('pronunciation', ok ? 2 : 0, ok); n++; setTimeout(ask, 1000);
          }));
        };
        ask();
      });
    },
  };
}
