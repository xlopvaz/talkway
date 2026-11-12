// UI strings. The interface is English-first; Spanish is an optional helper layer.
// When language = 'es', the UI chrome switches to Spanish and translation hints appear under content.
import { store } from './store.js';

const S = {
  en: {
    learn: 'Learn', practice: 'Practice', specialise: 'Specialise',
    dashboard: 'My Learning', levels: 'English Levels', everyday: 'Everyday English', speaking: 'Speaking Lab',
    listening: 'Listening Lab', vocabulary: 'Vocabulary Builder', grammar: 'Grammar in Context',
    pronunciation: 'Pronunciation Studio', aviation: 'Cabin Crew Academy', settings: 'Settings',
    streak: 'day streak', xp: 'XP', today: 'Today', goal: 'Daily goal', minutes: 'min',
    continue: 'Continue', start: 'Start', check: 'Check', next: 'Next', reset: 'Reset', listen: 'Listen',
    showTranscript: 'Show transcript', correct: 'Correct!', tryAgain: 'Not quite — try again.',
    back: 'Back', due: 'due', review: 'Review', newWords: 'new', done: 'Completed', markDone: 'Mark lesson complete',
    speakNow: 'Tap and speak', listening_: 'Listening…', yourAnswer: 'What you said',
    noSpeech: 'Speech recognition is not available in this browser. Use Chrome or Edge on desktop/Android, or type your answer below.',
    typeInstead: 'Type your answer instead',
  },
  es: {
    learn: 'Aprender', practice: 'Practicar', specialise: 'Especialización',
    dashboard: 'Mi aprendizaje', levels: 'Niveles de inglés', everyday: 'Inglés cotidiano', speaking: 'Laboratorio de Speaking',
    listening: 'Laboratorio de Listening', vocabulary: 'Vocabulario', grammar: 'Gramática en contexto',
    pronunciation: 'Estudio de pronunciación', aviation: 'Academia Cabin Crew', settings: 'Ajustes',
    streak: 'días de racha', xp: 'XP', today: 'Hoy', goal: 'Objetivo diario', minutes: 'min',
    continue: 'Continuar', start: 'Empezar', check: 'Comprobar', next: 'Siguiente', reset: 'Reiniciar', listen: 'Escuchar',
    showTranscript: 'Ver transcripción', correct: '¡Correcto!', tryAgain: 'Casi — inténtalo otra vez.',
    back: 'Volver', due: 'pendientes', review: 'Repasar', newWords: 'nuevas', done: 'Completada', markDone: 'Marcar lección como completada',
    speakNow: 'Pulsa y habla', listening_: 'Escuchando…', yourAnswer: 'Lo que has dicho',
    noSpeech: 'El reconocimiento de voz no está disponible en este navegador. Usa Chrome o Edge (ordenador/Android) o escribe tu respuesta abajo.',
    typeInstead: 'Escribe tu respuesta',
  },
};
export const lang = () => store.state.settings.lang;
export const t = (k) => (S[lang()] && S[lang()][k]) || S.en[k] || k;
/** Optional Spanish helper line, only rendered when ES is on */
export const es = (text) => (text && lang() === 'es' ? `<div class="tr">${text}</div>` : '');
/** Pick EN/ES variant of a bilingual pair */
export const pick = (en, esText) => (lang() === 'es' && esText ? esText : en);
