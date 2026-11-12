import { icon } from '../icons.js';
import { store } from '../store.js';
import { t, es } from '../i18n.js';
import { esc, pageHead, back, speakPrompt, sayBtn } from '../ui.js';
import { roleplay } from './roleplay.js';
import { sttAvailable } from '../speech.js';
import { OPEN_Q, QUICK, STORY, DEBATES, IMPROV, PICTURES, CHARACTERS } from '../data/speaking.js';
import { EVERYDAY } from '../data/everyday.js';

const TABS = [['questions', 'Open questions'], ['quick', 'Quick-fire'], ['characters', 'Characters'], ['pictures', 'Describe a picture'], ['stories', 'Tell a story'], ['debates', 'Debates'], ['improv', 'Improvise']];

// Simple original illustrations for picture description
const SCENES = {
  beach: `<svg viewBox="0 0 400 240" role="img" aria-label="Beach scene"><rect width="400" height="240" fill="#BFE3F5"/><circle cx="330" cy="50" r="26" fill="#F9C74F"/><rect y="120" width="400" height="50" fill="#3D7BFF"/><path d="M0 125q50-8 100 0t100 0 100 0 100 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><rect y="165" width="400" height="75" fill="#F4D9A6"/><path d="M250 120l20-48 2 48z" fill="#fff"/><path d="M242 120h40l-6 8h-28z" fill="#1E2A44"/><path d="M90 175l40-50" stroke="#555" stroke-width="3"/><path d="M60 140q70-60 140 0z" fill="#F2643D"/><circle cx="95" cy="190" r="9" fill="#8B5E3C"/><rect x="86" y="198" width="18" height="20" rx="6" fill="#2F5BEA"/><circle cx="135" cy="192" r="9" fill="#E0A97E"/><rect x="126" y="200" width="18" height="18" rx="6" fill="#13A57B"/><rect x="70" y="214" width="90" height="10" rx="3" fill="#fff" opacity=".8"/><circle cx="300" cy="205" r="12" fill="#F2643D"/><path d="M288 205h24M300 193v24" stroke="#fff" stroke-width="3"/></svg>`,
  cafe: `<svg viewBox="0 0 400 240" role="img" aria-label="Café scene"><rect width="400" height="240" fill="#F3E9DC"/><rect y="170" width="400" height="70" fill="#C9A67A"/><rect x="20" y="40" width="150" height="90" rx="6" fill="#BFE3F5" stroke="#8B5E3C" stroke-width="6"/><path d="M95 40v90M20 85h150" stroke="#8B5E3C" stroke-width="4"/><rect x="210" y="110" width="170" height="60" fill="#6B4A2F"/><rect x="230" y="70" width="40" height="40" rx="4" fill="#555"/><circle cx="315" cy="78" r="12" fill="#E0A97E"/><rect x="302" y="90" width="26" height="28" rx="8" fill="#1E2A44"/><rect x="300" y="98" width="30" height="12" fill="#F2643D"/><rect x="60" y="160" width="100" height="8" fill="#6B4A2F"/><rect x="105" y="168" width="8" height="45" fill="#6B4A2F"/><circle cx="75" cy="130" r="11" fill="#8B5E3C"/><rect x="63" y="141" width="24" height="22" rx="7" fill="#13A57B"/><rect x="95" y="145" width="34" height="15" rx="2" fill="#333"/><rect x="97" y="134" width="30" height="13" fill="#9ad"/><rect x="140" y="150" width="12" height="10" rx="2" fill="#fff"/><path d="M144 146q2-6 0-10M148 146q2-6 0-10" stroke="#999" stroke-width="1.5" fill="none"/><text x="250" y="60" font-family="sans-serif" font-size="14" fill="#6B4A2F" font-weight="bold">COFFEE</text></svg>`,
  airport: `<svg viewBox="0 0 400 240" role="img" aria-label="Airport gate scene"><rect width="400" height="240" fill="#E3EAFE"/><rect x="20" y="20" width="360" height="110" rx="6" fill="#BFE3F5" stroke="#9aa" stroke-width="4"/><path d="M140 20v110M260 20v110" stroke="#9aa" stroke-width="4"/><path d="M280 90l70-28 6 6-50 30z" fill="#fff"/><path d="M300 82l-10-14 6-2 18 12z" fill="#fff"/><rect y="170" width="400" height="70" fill="#C8CCD8"/><rect x="40" y="140" width="80" height="34" rx="3" fill="#1E2A44"/><text x="48" y="156" font-family="monospace" font-size="10" fill="#F9C74F">BA427 EDI</text><text x="48" y="168" font-family="monospace" font-size="10" fill="#F2643D">DELAYED</text><rect x="160" y="170" width="200" height="12" rx="4" fill="#2F5BEA"/><rect x="170" y="182" width="6" height="18" fill="#555"/><rect x="345" y="182" width="6" height="18" fill="#555"/><circle cx="200" cy="150" r="9" fill="#E0A97E"/><rect x="190" y="159" width="20" height="16" rx="6" fill="#F2643D"/><circle cx="250" cy="150" r="9" fill="#8B5E3C"/><rect x="240" y="159" width="20" height="16" rx="6" fill="#13A57B"/><circle cx="80" cy="190" r="9" fill="#E0A97E"/><rect x="70" y="199" width="20" height="26" rx="6" fill="#7A5AF8"/><rect x="95" y="205" width="16" height="22" rx="3" fill="#F9C74F"/></svg>`,
};

export function render([tab = 'questions', arg]) {
  if (tab === 'chat') return chat(arg);
  const body = {
    questions: () => {
      const lvl = store.state.profile.level;
      const qs = [...OPEN_Q].sort((a, b) => (a.level === lvl ? -1 : 0) - (b.level === lvl ? -1 : 0));
      return `<p class="muted">Answer out loud. Don’t translate — say what you can, then add one more idea. Questions at your level (${lvl}) come first.</p>
        <div class="stack">${qs.map((q) => `<div><span class="tag" style="margin-bottom:6px">${q.level}</span>${speakPrompt(q, { seconds: q.seconds })}</div>`).join('')}</div>`;
    },
    quick: () => `<div class="grid g2" style="align-items:start"><div id="quickBox"></div>
      <div class="card"><h3>Why quick-fire?</h3><p class="small">When you have only 15 seconds, there’s no time to translate. That pressure trains your brain to <b>think directly in English</b>.</p>
      <ul class="small"><li>Answer in 1–3 sentences.</li><li>Imperfect is fine — keep going.</li><li>Use “Hmm, let me think…” instead of silence.</li></ul>${es('Con solo 15 segundos no hay tiempo de traducir: así entrenas a pensar en inglés.')}</div></div>`,
    characters: () => `<p class="muted">Practise with recurring characters from different English-speaking countries. Each one speaks with their own accent (when your device has that voice installed).</p>
      <div class="grid auto">${CHARACTERS.map((c) => { const sc = EVERYDAY.find((e) => e.id === c.scenario);
        return `<a class="card click" href="#/speaking/chat/${c.id}"><div class="row"><div class="avatar" style="width:48px;height:48px;font-size:1rem;background:var(--${c.color}-soft);color:var(--${c.color})">${c.name[0]}</div><div><h3 style="margin:0">${c.name}</h3><div class="small muted">${esc(c.from)}</div></div></div>
        <p class="small" style="margin-top:10px"><b>${esc(c.role)}</b> · ${esc(sc.title)}</p></a>`; }).join('')}</div>
      <div class="callout small" style="margin-top:16px">Characters follow scripted conversations — they are not an AI chatbot. The app is built so a real conversational AI can be connected later (see Settings → AI feedback).</div>`,
    pictures: () => `<div class="stack">${PICTURES.map((p) => `<div class="grid g2" style="align-items:start"><div class="card" style="padding:10px">${SCENES[p.id]}</div>
      ${speakPrompt({ q: `Describe the picture: ${p.title}. What can you see? What do you think is happening?`, useful: p.useful, model: p.model, minWords: 30 }, { seconds: 60 })}</div>`).join('')}</div>`,
    stories: () => `<p class="muted">Narration builds fluency with past tenses and connectors. Try to speak for the full time.</p><div class="stack">${STORY.map((s) => speakPrompt(s, { seconds: s.seconds })).join('')}</div>`,
    debates: () => `<div class="stack">${DEBATES.map((d) => `<div class="card"><h3>${esc(d.q)} ${sayBtn(d.q)}</h3>
      <div class="grid g2" style="margin:10px 0"><div class="callout"><b>For</b><ul class="small" style="margin:6px 0 0;padding-left:18px">${d.for.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="callout coral"><b>Against</b><ul class="small" style="margin:6px 0 0;padding-left:18px">${d.against.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
      ${speakPrompt({ q: 'Choose a side and argue for 60 seconds. Then argue the opposite!', useful: d.useful, minWords: 50 }, { seconds: 60 })}</div>`).join('')}</div>`,
    improv: () => `<div class="grid g2" style="align-items:start"><div id="improvBox"></div><div class="card"><h3>Unexpected situations</h3><p class="small">Real life doesn’t follow a script. You get a random situation and 45 seconds to deal with it. Imagine the other person and talk to them directly.</p><button class="btn" id="improvNew">${icon('refresh')} New situation</button></div></div>`,
  }[tab] || (() => '');
  return {
    title: t('speaking'),
    html: `<div class="view">${pageHead('Speak without translating', t('speaking'), 'Lose the fear of speaking. Answer out loud, hear yourself, and get instant feedback on length, pace, linking words and typical mistakes.', 'Pierde el miedo a hablar: responde en voz alta y recibe feedback inmediato.')}
    ${!sttAvailable() ? `<div class="callout warn" style="margin-bottom:16px">${t('noSpeech')}</div>` : ''}
    <div class="tabs">${TABS.map(([k, l]) => `<a href="#/speaking/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</div>
    ${body()}
    <details class="tx" style="margin-top:24px"><summary>How is my speaking evaluated?</summary><div class="small" style="margin-top:8px">
      <p>Speech is converted to text by your browser’s speech recognition (Web Speech API). Talkway then runs <b>transparent, rule-based checks</b>: answer length, speaking pace, filler words, repetition, linking words, target expressions, and 20 patterns of typical Spanish-speaker errors (e.g. “I have 25 years”, “people is”, “depend of”).</p>
      <p style="margin:0">It is <b>not</b> an AI assessment. For advanced feedback (grammar correction, naturalness rewrites), you can connect your own AI endpoint in <a href="#/settings">Settings</a>.</p></div></details></div>`,
    mount(root) {
      if (tab === 'quick') {
        let i = Math.floor(Math.random() * QUICK.length);
        const box = root.querySelector('#quickBox');
        const show = () => { box.innerHTML = `${speakPrompt({ q: QUICK[i % QUICK.length], minWords: 8 }, { seconds: 15 })}<div class="row" style="margin-top:10px"><button class="btn primary" id="qNext">${t('next')} question ${icon('arrowRight')}</button><span class="small muted">${(i % QUICK.length) + 1} / ${QUICK.length}</span></div>`;
          box.querySelector('#qNext').onclick = () => { i++; show(); }; };
        show();
      }
      if (tab === 'improv') {
        const box = root.querySelector('#improvBox');
        const show = () => { const s = IMPROV[Math.floor(Math.random() * IMPROV.length)]; box.innerHTML = speakPrompt({ q: s, minWords: 30, useful: ['Excuse me', 'I’m afraid', 'Would it be possible', 'I understand, but'] }, { seconds: 45 }); };
        show(); root.querySelector('#improvNew').onclick = show;
      }
    },
  };
}

function chat(id) {
  const c = CHARACTERS.find((x) => x.id === id);
  if (!c) return { title: '404', html: '<div class="empty">Character not found</div>' };
  const sc = EVERYDAY.find((e) => e.id === c.scenario);
  return {
    title: `${c.name} · ${t('speaking')}`,
    html: `<div class="view">${back('#/speaking/characters', 'Characters')}
    ${pageHead(`${c.from} · ${c.role}`, `Talk to ${c.name}`, `Scenario: ${sc.title}. ${sc.intro}`)}
    <div class="grid g2" style="align-items:start">${roleplay(sc.roleplay, { name: c.name, accent: c.accent, intro: `${c.role} from ${c.from}` })}
    <div class="card"><h3>Useful language</h3><div class="vlist">${sc.expressions.map((x) => `<div class="vitem"><span style="flex:1">${esc(x)}</span>${sayBtn(x, c.accent)}</div>`).join('')}</div>
    <a class="btn sm" style="margin-top:12px" href="#/everyday/${sc.id}">Study this situation first ${icon('arrowRight')}</a></div></div></div>`,
  };
}
