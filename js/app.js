// Talkway — app shell, router and global behaviours.
import { icon } from './icons.js';
import { store } from './store.js';
import { t } from './i18n.js';
import { bindGlobal, xpToast, esc } from './ui.js';
import { stopSpeaking } from './speech.js';
import * as dashboard from './views/dashboard.js';
import * as levels from './views/levels.js';
import * as everyday from './views/everyday.js';
import * as speaking from './views/speaking.js';
import * as listening from './views/listening.js';
import * as vocabulary from './views/vocabulary.js';
import * as grammar from './views/grammar.js';
import * as pronunciation from './views/pronunciation.js';
import * as aviation from './views/aviation.js';
import * as settings from './views/settings.js';

const ROUTES = { dashboard, levels, everyday, speaking, listening, vocabulary, grammar, pronunciation, aviation, settings };
const NAV = [
  ['learn', [['dashboard', 'home'], ['levels', 'layers'], ['everyday', 'coffee']]],
  ['practice', [['speaking', 'mic'], ['listening', 'headphones'], ['vocabulary', 'cards'], ['grammar', 'puzzle'], ['pronunciation', 'wave']]],
  ['specialise', [['aviation', 'plane']]],
];

const $ = (s) => document.querySelector(s);
let cleanup = null;

function renderNav(active) {
  $('#nav').innerHTML = NAV.map(([g, items]) => `<div class="nav-group">${t(g)}</div>` + items.map(([k, ic]) =>
    `<a class="nav-link ${k === active ? 'active' : ''}" href="#/${k}">${icon(ic)}<span>${t(k)}</span>${k === 'aviation' ? '<span class="nav-badge">PRO</span>' : ''}</a>`).join('')).join('')
    + `<div class="nav-group"></div><a class="nav-link ${active === 'settings' ? 'active' : ''}" href="#/settings">${icon('settings')}<span>${t('settings')}</span></a>`;
  document.querySelectorAll('.lang-toggle button').forEach((b) => b.classList.toggle('on', b.dataset.lang === store.state.settings.lang));
  $('#themeBtn').innerHTML = icon(store.state.settings.theme === 'dark' ? 'sun' : 'moon');
}
function renderStats() {
  const today = store.day();
  $('#topStats').innerHTML = `<span class="pill" title="${t('streak')}">${icon('flame')}<span style="color:var(--coral)">${store.streakNow}</span></span>
    <span class="pill hide-sm" title="${t('goal')}">${icon('target')}${today.xp}/${store.state.settings.goalXp}</span>
    <span class="pill" title="XP">${icon('bolt')}<span style="color:var(--amber)">${store.state.xp}</span></span>`;
}

function route() {
  if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
  stopSpeaking();
  const parts = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('/').map(decodeURIComponent);
  const name = ROUTES[parts[0]] ? parts[0] : 'dashboard';
  const view = ROUTES[name].render(parts.slice(1));
  const main = $('#main');
  main.innerHTML = view.html;
  document.title = `${view.title} · Talkway`;
  $('#topTitle').textContent = view.title;
  renderNav(name);
  renderStats();
  if (view.mount) cleanup = view.mount(main) || null;
  $('#sidebar').classList.remove('open'); document.querySelector('.scrim')?.classList.remove('show');
  window.scrollTo({ top: 0 });
  main.focus({ preventScroll: true });
}

function init() {
  document.documentElement.setAttribute('data-theme', store.state.settings.theme);
  document.documentElement.lang = 'en';
  const scrim = document.createElement('div'); scrim.className = 'scrim'; document.body.appendChild(scrim);
  $('#menuBtn').innerHTML = icon('menu');
  $('#menuBtn').onclick = () => { $('#sidebar').classList.add('open'); scrim.classList.add('show'); };
  scrim.onclick = () => { $('#sidebar').classList.remove('open'); scrim.classList.remove('show'); };
  $('#themeBtn').onclick = () => {
    const th = store.state.settings.theme === 'dark' ? 'light' : 'dark';
    store.state.settings.theme = th; store.save(); document.documentElement.setAttribute('data-theme', th); renderNav(currentName());
  };
  document.querySelector('.lang-toggle').onclick = (e) => {
    const b = e.target.closest('[data-lang]'); if (!b) return;
    store.state.settings.lang = b.dataset.lang; store.save(); route();
  };
  window.addEventListener('hashchange', route);
  window.addEventListener('talkway:rerender', route);
  window.addEventListener('scroll', () => document.querySelector('.topbar').classList.toggle('scrolled', scrollY > 4), { passive: true });

  bindGlobal();
  // In-page tabs: <button data-tab="x"> shows <div data-pane="x">
  document.addEventListener('click', (e) => {
    const tb = e.target.closest('[data-tab]');
    if (tb) {
      const view = tb.closest('.view');
      tb.parentElement.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b === tb));
      view.querySelectorAll('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== tb.dataset.tab));
      stopSpeaking();
    }
    const done = e.target.closest('[data-complete]');
    if (done) {
      const d = done.dataset;
      const first = store.complete(d.complete, d.title, d.route, d.skill, +d.xp);
      if (first) xpToast(+d.xp);
      done.classList.remove('primary'); done.innerHTML = `${icon('check')} ${t('done')}`;
    }
  });
  store.on(renderStats);

  // Study time: counts while the tab is visible and the user interacted in the last 60 s.
  let lastActive = Date.now();
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((ev) => addEventListener(ev, () => (lastActive = Date.now()), { passive: true }));
  setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastActive < 60000) store.addTime(15); }, 15000);

  route();
}
const currentName = () => (location.hash.replace(/^#\/?/, '').split('/')[0] || 'dashboard');
init();
