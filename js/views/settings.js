import { icon } from '../icons.js';
import { store } from '../store.js';
import { t } from '../i18n.js';
import { esc, pageHead, toast } from '../ui.js';
import { LEVELS } from '../data/levels.js';
import { ACCENTS, availableAccents, speak, sttAvailable, ttsAvailable } from '../speech.js';

export function render() {
  const s = store.state, p = s.profile, st = s.settings;
  const avail = availableAccents();
  const sel = (id, opts, val) => `<select class="field" id="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  return {
    title: t('settings'),
    html: `<div class="view">${pageHead('Preferences', t('settings'), 'Your progress is stored locally in this browser. Nothing is sent to any server unless you connect your own AI endpoint below.')}
    <div class="grid g2" style="align-items:start">
      <div class="card stack"><h2>Profile & goals</h2>
        <label><div class="small muted">Name</div><input class="field" id="sName" value="${esc(p.name)}"></label>
        <label><div class="small muted">Current level</div>${sel('sLevel', LEVELS.map((l) => [l.code, `${l.code} — ${l.name}`]), p.level)}</label>
        <label><div class="small muted">Main goal</div>${sel('sTrack', [['general', 'Everyday fluency'], ['aviation', 'Cabin crew / aviation'], ['work', 'English for work']], p.track)}</label>
        <label><div class="small muted">Daily goal</div>${sel('sGoal', [[20, 'Casual · 20 XP'], [50, 'Regular · 50 XP'], [100, 'Serious · 100 XP'], [150, 'Intense · 150 XP']], st.goalXp)}</label>
      </div>
      <div class="card stack"><h2>Voice & audio</h2>
        <div class="row small">${ttsAvailable() ? `<span class="tag mint">${icon('check')} Text-to-speech</span>` : '<span class="tag coral">No text-to-speech</span>'}${sttAvailable() ? `<span class="tag mint">${icon('check')} Speech recognition</span>` : '<span class="tag coral">No speech recognition (use Chrome/Edge)</span>'}</div>
        <label><div class="small muted">Preferred accent for audio</div>${sel('sAccent', Object.entries(ACCENTS).map(([k, v]) => [k, `${v}${avail.includes(k) ? '' : ' (voice not installed)'}`]), st.accent)}</label>
        <label><div class="small muted">Default speed</div>${sel('sRate', [[0.7, 'Slow · 0.7×'], [0.85, 'Relaxed · 0.85×'], [1, 'Natural · 1×'], [1.15, 'Fast · 1.15×']], st.rate)}</label>
        <button class="btn sm" id="sTest">${icon('speaker')} Test voice</button>
        <label><div class="small muted">Interface language</div>${sel('sLang', [['en', 'English'], ['es', 'English + Spanish help (ES)']], st.lang)}</label>
      </div>
      <div class="card stack"><h2>AI feedback (optional)</h2>
        <p class="small">Talkway’s built-in speaking feedback is rule-based and runs in your browser. To add AI-powered correction, deploy a small serverless function (e.g. Cloudflare Workers, Netlify, Vercel) that receives the transcript and returns feedback, then paste its URL here.</p>
        <label><div class="small muted">Endpoint URL (POST, JSON)</div><input class="field" id="sApi" value="${esc(st.apiEndpoint || '')}" placeholder="https://your-worker.example.com/feedback"></label>
        <details class="small"><summary>Expected request / response</summary><pre style="white-space:pre-wrap;background:var(--surface-2);padding:10px;border-radius:8px">POST { transcript, durationSec, prompt: { q, useful, minWords }, level }
→ { items: [{ type: "good"|"tip"|"info", text }], correctedVersion?: "..." }</pre>
        Never put an API key in this website: GitHub Pages is public. Keep keys inside your serverless function.</details>
      </div>
      <div class="card stack"><h2>Your data</h2>
        <div class="row"><button class="btn sm" id="sExport">Export progress (.json)</button><label class="btn sm">Import<input type="file" id="sImport" accept="application/json" hidden></label></div>
        <button class="btn sm" id="sReset" style="color:var(--red)">${icon('refresh')} Reset all progress</button>
      </div>
    </div>
    <div class="row" style="margin-top:18px"><button class="btn primary" id="sSave">${icon('check')} Save settings</button></div></div>`,
    mount(root) {
      const $ = (id) => root.querySelector('#' + id);
      $('sTest').onclick = () => speak('Hi there! This is how I sound. Shall we practise?', { accent: $('sAccent').value, rate: +$('sRate').value });
      $('sSave').onclick = () => {
        Object.assign(p, { name: $('sName').value.trim(), level: $('sLevel').value, track: $('sTrack').value, onboarded: true });
        Object.assign(st, { goalXp: +$('sGoal').value, accent: $('sAccent').value, rate: +$('sRate').value, lang: $('sLang').value, apiEndpoint: $('sApi').value.trim() });
        store.save(); toast(`${icon('check')} Saved`); window.dispatchEvent(new Event('talkway:rerender'));
      };
      $('sExport').onclick = () => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' }));
        a.download = `talkway-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      };
      $('sImport').onchange = async (e) => {
        try { const data = JSON.parse(await e.target.files[0].text()); if (!data.v) throw 0; store.state = data; store.save(); toast('Progress imported'); window.dispatchEvent(new Event('talkway:rerender')); }
        catch { toast('That file is not a Talkway export'); }
      };
      $('sReset').onclick = () => { if (confirm('Delete all progress on this device?')) { store.reset(); location.hash = '#/dashboard'; window.dispatchEvent(new Event('talkway:rerender')); } };
    },
  };
}
