// Pronunciation Studio content. IPA symbols use British RP as reference, with US notes where relevant.
export const IPA = {
  vowels: [
    { s: 'iː', w: 'sheep', ex: 'see, eat, key', tip: 'Long and tense. Smile slightly.' },
    { s: 'ɪ', w: 'ship', ex: 'sit, big, women', tip: 'Short and relaxed — not Spanish “i”.' },
    { s: 'ʊ', w: 'book', ex: 'good, put, could', tip: 'Short, lips loosely rounded.' },
    { s: 'uː', w: 'shoot', ex: 'food, blue, two', tip: 'Long, lips rounded.' },
    { s: 'e', w: 'bed', ex: 'red, said, friend', tip: 'Like Spanish “e”.' },
    { s: 'ə', w: 'teacher', ex: 'about, banana, the', tip: 'Schwa: the most common sound in English. Relaxed and weak.' },
    { s: 'ɜː', w: 'bird', ex: 'work, learn, her', tip: 'Long, central. No equivalent in Spanish.' },
    { s: 'ɔː', w: 'door', ex: 'walk, law, saw', tip: 'Long and rounded.' },
    { s: 'æ', w: 'cat', ex: 'man, black, have', tip: 'Open your mouth wide — between “a” and “e”.' },
    { s: 'ʌ', w: 'cup', ex: 'love, much, money', tip: 'Short, central “a”.' },
    { s: 'ɑː', w: 'car', ex: 'father, start, calm', tip: 'Long and open, back of the mouth.' },
    { s: 'ɒ', w: 'hot', ex: 'dog, want, what', tip: 'Short, rounded (UK). US uses /ɑː/.' },
  ],
  diphthongs: [
    { s: 'eɪ', w: 'day', ex: 'rain, they, great' }, { s: 'aɪ', w: 'my', ex: 'time, fly, buy' }, { s: 'ɔɪ', w: 'boy', ex: 'join, noise' },
    { s: 'əʊ', w: 'go', ex: 'home, know, though' }, { s: 'aʊ', w: 'now', ex: 'house, out, how' }, { s: 'ɪə', w: 'near', ex: 'here, beer' },
    { s: 'eə', w: 'hair', ex: 'where, care' }, { s: 'ʊə', w: 'tour', ex: 'pure, cure' },
  ],
  consonants: [
    { s: 'p', w: 'pen' }, { s: 'b', w: 'bad' }, { s: 't', w: 'tea' }, { s: 'd', w: 'did' }, { s: 'k', w: 'cat' }, { s: 'g', w: 'get' },
    { s: 'tʃ', w: 'chain' }, { s: 'dʒ', w: 'jam', tip: 'Not like Spanish “y”.' }, { s: 'f', w: 'fall' }, { s: 'v', w: 'van', tip: 'Top teeth on lower lip — different from /b/!' },
    { s: 'θ', w: 'thin', tip: 'Tongue between teeth, like Spanish “z” (Spain).' }, { s: 'ð', w: 'this', tip: 'Like θ but voiced. Like Spanish “d” in “cada”.' },
    { s: 's', w: 'see' }, { s: 'z', w: 'zoo', tip: 'Buzzing “s”.' }, { s: 'ʃ', w: 'shoe' }, { s: 'ʒ', w: 'vision' },
    { s: 'h', w: 'hat', tip: 'Just air — softer than Spanish “j”.' }, { s: 'm', w: 'man' }, { s: 'n', w: 'no' }, { s: 'ŋ', w: 'sing', tip: 'Don’t add a /g/ at the end.' },
    { s: 'l', w: 'leg' }, { s: 'r', w: 'red', tip: 'Don’t roll it. Tongue doesn’t touch the roof.' }, { s: 'j', w: 'yes' }, { s: 'w', w: 'wet' },
  ],
};

// Minimal pairs: the classic difficulties for Spanish speakers
export const PAIRS = [
  { title: '/iː/ vs /ɪ/', pairs: [['sheep', 'ship'], ['leave', 'live'], ['feel', 'fill'], ['beach', 'bitch'], ['sheet', 'shit'], ['seat', 'sit']], note: 'Careful with the last three — the short vowel changes the meaning a lot!' },
  { title: '/æ/ vs /ʌ/ vs /ɑː/', pairs: [['cat', 'cut'], ['bag', 'bug'], ['hat', 'hut'], ['cap', 'cup'], ['heart', 'hat']], note: '/æ/ is open and wide; /ʌ/ is short and central.' },
  { title: '/b/ vs /v/', pairs: [['berry', 'very'], ['ban', 'van'], ['best', 'vest'], ['boat', 'vote']], note: 'For /v/, bite your lower lip gently and vibrate.' },
  { title: '/s/ vs /θ/', pairs: [['sink', 'think'], ['sick', 'thick'], ['mouse', 'mouth'], ['sing', 'thing']], note: 'For /θ/, put the tip of your tongue between your teeth.' },
  { title: '/dʒ/ vs /j/', pairs: [['jet', 'yet'], ['jam', 'yam'], ['joke', 'yolk'], ['juice', 'use']], note: '/dʒ/ is like “ch” but voiced; /j/ is soft like “ll” in some accents.' },
  { title: '/uː/ vs /ʊ/', pairs: [['fool', 'full'], ['pool', 'pull'], ['Luke', 'look'], ['suit', 'soot']], note: '/ʊ/ is short and relaxed.' },
  { title: '/ɜː/ vs /ɔː/', pairs: [['work', 'walk'], ['bird', 'board'], ['firm', 'form'], ['shirt', 'short']], note: '/ɜː/ is central, lips relaxed; /ɔː/ is rounded.' },
  { title: 'Initial /s/ + consonant', pairs: [['Spain', 'ehSpain ✗'], ['school', 'ehschool ✗'], ['student', 'ehstudent ✗']], note: 'Don’t add an “e” before s+consonant: say “Spain”, not “Espain”.', noBoth: true },
];

export const STRESS = {
  word: {
    intro: 'Every English word with two or more syllables has one stressed syllable. Getting it wrong can make a word impossible to understand, even if every sound is correct.',
    items: [
      { w: 'PHOtograph', ipa: '/ˈfəʊtəɡrɑːf/', say: 'photograph' }, { w: 'phoTOgrapher', ipa: '/fəˈtɒɡrəfə/', say: 'photographer' }, { w: 'photoGRAPHic', ipa: '/ˌfəʊtəˈɡræfɪk/', say: 'photographic' },
      { w: 'COMFortable (= COMF-ta-ble)', ipa: '/ˈkʌmftəbl/', say: 'comfortable' }, { w: 'VEGetable (= VEG-ta-ble)', ipa: '/ˈvedʒtəbl/', say: 'vegetable' }, { w: 'deVELop', ipa: '/dɪˈveləp/', say: 'develop' },
      { w: 'hoTEL (not HOtel)', ipa: '/həʊˈtel/', say: 'hotel' }, { w: 'eVENT (not EVent)', ipa: '/ɪˈvent/', say: 'event' }, { w: 'CHOColate (= CHOC-late)', ipa: '/ˈtʃɒklət/', say: 'chocolate' },
    ],
    rule: 'Nouns/adjectives with two syllables are usually stressed on the first (TAble, HAPpy); verbs on the second (reLAX, beGIN). Some words change: a REcord (noun) / to reCORD (verb).',
    quiz: [
      { type: 'mcq', q: 'Where is the stress in “hotel”?', options: ['HO-tel', 'ho-TEL'], a: 1 },
      { type: 'mcq', q: 'Verb: “to ___ a song”', options: ['REcord', 'reCORD'], a: 1 },
      { type: 'mcq', q: 'How many syllables in “comfortable” (natural speech)?', options: ['4', '3'], a: 1 },
    ],
  },
  sentence: {
    intro: 'English is stress-timed: content words (nouns, main verbs, adjectives, adverbs) are stressed; function words (a, the, to, of, and, can…) are reduced. That gives English its rhythm.',
    drills: ['I WANT to GO to the BEACH.', 'WHAT do you THINK of it?', 'She’s GOT a NEW JOB in LONdon.', 'I’d LIKE a CUP of TEA, please.'],
    shift: { base: 'I didn’t say she stole the money.', variants: [['I didn’t say…', 'someone else said it'], ['…didn’t SAY…', 'I implied it'], ['…SHE stole…', 'someone else stole it'], ['…the MONEY.', 'she stole something else']] },
  },
};

export const CONNECTED = [
  { title: 'Linking (consonant → vowel)', intro: 'When a word ends in a consonant and the next begins with a vowel, they join.', drills: [['turn it off', 'tur-ni-toff'], ['an apple', 'a-napple'], ['check it out', 'che-ki-tout'], ['pick it up', 'pi-ki-tup']] },
  { title: 'Weak forms', intro: 'Function words are usually pronounced with schwa /ə/ in normal speech.', drills: [['a cup of tea', 'ə kʌp əv tiː'], ['I can swim', 'aɪ kən swɪm'], ['fish and chips', 'fɪʃ ən tʃɪps'], ['What do you want?', 'wɒdʒə wɒnt'], ['I was there', 'aɪ wəz ðeə']] },
  { title: 'Contractions & reductions', intro: 'In natural speech, many words merge or shorten.', drills: [['going to → gonna', 'I’m gonna call her.'], ['want to → wanna', 'Do you wanna come?'], ['did you → didja', 'Didja see that?'], ['let me → lemme', 'Lemme check.'], ['don’t know → dunno', 'I dunno.']] },
  { title: 'Elision (dropped sounds)', intro: 'Sounds like /t/ and /d/ often disappear between consonants.', drills: [['next day', 'nex day'], ['last night', 'las night'], ['handbag', 'hanbag'], ['I don’t know', 'I dono']] },
  { title: 'Intrusive /r/ /w/ /j/', intro: 'Speakers insert a tiny sound to link two vowels.', drills: [['go on', 'go-won'], ['I agree', 'I-yagree'], ['law and order (UK)', 'law-rand order']] },
];

export const INTONATION = [
  { title: 'Falling ↘ — statements & wh-questions', ex: ['I live in Madrid. ↘', 'Where do you work? ↘'], note: 'Falling at the end sounds confident and finished.' },
  { title: 'Rising ↗ — yes/no questions', ex: ['Are you ready? ↗', 'Is this your bag? ↗'], note: 'Rising invites an answer.' },
  { title: 'Fall-rise ↘↗ — politeness & reservation', ex: ['Well… ↘↗ maybe.', 'I like it, but… ↘↗'], note: 'Shows doubt, or that there’s more to say.' },
  { title: 'Question tags', ex: ['It’s cold, isn’t it? ↘ (you expect agreement)', 'You’re coming, aren’t you? ↗ (you’re checking)'], note: 'Falling = “I know”; rising = real question.' },
  { title: 'Lists', ex: ['I need eggs ↗, milk ↗, bread ↗ and butter ↘.'], note: 'Rise on each item, fall on the last.' },
];

export const UK_US = [
  ['water', '/ˈwɔːtə/', '/ˈwɑːt̬ɚ/ (“wadder”)', 'US flap T between vowels'],
  ['car', '/kɑː/', '/kɑːr/', 'US pronounces final R (rhotic)'],
  ['tomato', '/təˈmɑːtəʊ/', '/təˈmeɪt̬oʊ/', 'Different vowel'],
  ['schedule', '/ˈʃedjuːl/', '/ˈskedʒuːl/', 'Different first sound'],
  ['can’t', '/kɑːnt/', '/kænt/', 'UK long ɑː, US short æ'],
  ['hot', '/hɒt/', '/hɑːt/', 'US has no /ɒ/'],
  ['go', '/ɡəʊ/', '/ɡoʊ/', 'Different diphthong'],
  ['better', '/ˈbetə/', '/ˈbet̬ɚ/', 'Flap T + R'],
  ['advertisement', '/ədˈvɜːtɪsmənt/', '/ˌædvərˈtaɪzmənt/', 'Different stress'],
  ['garage', '/ˈɡærɑːʒ/', '/ɡəˈrɑːʒ/', 'Different stress'],
];

export const TONGUE = ['She sells seashells by the seashore.', 'Three thin thinkers thinking thick thoughtful thoughts.', 'Very well, very well, very well.', 'A big black bug bit a big black bear.', 'Red lorry, yellow lorry.', 'I thought a thought, but the thought I thought wasn’t the thought I thought I thought.'];
