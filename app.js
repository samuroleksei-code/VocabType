/* ===================================================================
   VocabType — App Logic
   Logically separated: State → Data → UI → Typing → Timer → Stats → Init
   =================================================================== */

// ========================= STATE =========================
const state = {
  mode: 'learning',        // learning | test | reverse | mixed
  currentSet: null,        // current word set object
  words: [],               // working copy of words array
  originalTotal: 0,        // total number of words (before mistakes added)
  wordIndex: 0,
  currentDirection: 'normal', // normal | reversed (for mixed mode)
  learningPhase: 1,          // 1 = type source (EN), 2 = type target (RU)

  // Typing
  typed: '',
  currentTarget: '',       // the string displayed as target
  requiredTarget: '',      // the string user actually MUST type to advance
  currentDisplay: '',      // the string displayed as prompt
  hadErrorThisWord: false,

  // Mistakes
  mistakes: [],            // words the user got wrong (to re-queue)
  uniqueMistakeWords: [],  // unique mistake words for results

  // Stats
  correctChars: 0,
  totalChars: 0,
  wordsCompleted: 0,
  streak: 0,
  bestStreak: 0,
  startTime: null,

  // Shuffle
  shuffle: false,

  // UI
  focused: false,
  finished: false,
  testWaiting: false,      // true = waiting for "click to start" in test mode
  ttsEnabled: false,       // Auto text-to-speech in learning mode

  // Test mode timer
  wordTimerId: null,       // interval ID for the word countdown
  wordStartTime: null,     // when the current word started
  wordTimeLimit: 15,       // seconds (visual countdown, no auto-skip)
  hintLevel: 0,            // 0 = no hint, 1 = first hint (5s), 2 = more hint (8s)
  hintShown: '',           // the current hint text being displayed

  // Data
  history: [],             // past session results
  srsData: {}              // spaced repetition data
};

// ========================= DOM REFS =========================
const $ = (id) => document.getElementById(id);

const dom = {
  modeTabs: $('modeTabs'),
  langSelect: $('langSelect'),
  themeSelect: $('themeSelect'),
  shuffleToggle: $('shuffleToggle'),
  statsBar: $('statsBar'),
  typingArea: $('typingArea'),
  wordHint: $('wordHint'),
  wordDisplay: $('wordDisplay'),
  audioBtn: $('audioBtn'),
  caret: $('caret'),
  typingInput: $('typingInput'),
  resultsOverlay: $('resultsOverlay'),
  timerBar: $('timerBar'),
  timerFill: $('timerFill'),
  timerText: $('timerText'),
  wordHintText: $('wordHintText'),
  testStartOverlay: $('testStartOverlay'),
  // Stat values
  statProgress: $('statProgress').querySelector('.stat-value'),
  statAccuracy: $('statAccuracy').querySelector('.stat-value'),
  statWpm: $('statWpm').querySelector('.stat-value'),
  statStreak: $('statStreak').querySelector('.stat-value'),
  // Result values
  resWords: $('resWords'),
  resAccuracy: $('resAccuracy'),
  resWpm: $('resWpm'),
  resStreak: $('resStreak'),
  resMistakes: $('resMistakes'),
  resMistakesList: $('resultsMistakesList'),
  btnRestart: $('btnRestart'),
  
  // New features UI
  ttsToggle: $('ttsToggle'),
  btnHistory: $('btnHistory'),
  historyOverlay: $('historyOverlay'),
  historyList: $('historyList'),
  btnCloseHistory: $('btnCloseHistory')
};

// ========================= DATA =========================
const INLINE_WORD_DATA = {
  "sets": [
    {
      "id": "en-ru",
      "name": "English → Russian",
      "themes": [
        {
          "id": "theme-1",
          "name": "Тема 1: Базовые глаголы действия",
          "words": [
            { "source": "be", "target": "быть" },
            { "source": "have", "target": "иметь" },
            { "source": "do", "target": "делать" },
            { "source": "say", "target": "сказать" },
            { "source": "go", "target": "идти" },
            { "source": "get", "target": "получать" },
            { "source": "make", "target": "делать (создавать)" },
            { "source": "know", "target": "знать" },
            { "source": "think", "target": "думать" },
            { "source": "take", "target": "брать" },
            { "source": "see", "target": "видеть" },
            { "source": "come", "target": "приходить" },
            { "source": "want", "target": "хотеть" },
            { "source": "look", "target": "смотреть" },
            { "source": "use", "target": "использовать" },
            { "source": "find", "target": "находить" },
            { "source": "give", "target": "давать" },
            { "source": "tell", "target": "рассказывать" },
            { "source": "work", "target": "работать" },
            { "source": "call", "target": "звонить, называть" },
            { "source": "try", "target": "пытаться, пробовать" },
            { "source": "ask", "target": "спрашивать" },
            { "source": "need", "target": "нуждаться" },
            { "source": "feel", "target": "чувствовать" },
            { "source": "become", "target": "становиться" },
            { "source": "leave", "target": "покидать, оставлять" },
            { "source": "put", "target": "класть" },
            { "source": "mean", "target": "значить" },
            { "source": "keep", "target": "хранить, держать" },
            { "source": "let", "target": "позволять" },
            { "source": "begin", "target": "начинать" },
            { "source": "seem", "target": "казаться" },
            { "source": "help", "target": "помогать" },
            { "source": "talk", "target": "разговаривать" },
            { "source": "turn", "target": "поворачивать" },
            { "source": "start", "target": "начинать" },
            { "source": "show", "target": "показывать" },
            { "source": "hear", "target": "слышать" },
            { "source": "play", "target": "играть" },
            { "source": "run", "target": "бежать" },
            { "source": "move", "target": "двигаться" },
            { "source": "like", "target": "нравиться" },
            { "source": "live", "target": "жить" },
            { "source": "believe", "target": "верить" },
            { "source": "hold", "target": "держать" },
            { "source": "bring", "target": "приносить" },
            { "source": "happen", "target": "случаться" },
            { "source": "write", "target": "писать" },
            { "source": "provide", "target": "предоставлять" },
            { "source": "sit", "target": "сидеть" },
            { "source": "stand", "target": "стоять" },
            { "source": "lose", "target": "терять" },
            { "source": "pay", "target": "платить" },
            { "source": "meet", "target": "встречать" },
            { "source": "include", "target": "включать" },
            { "source": "continue", "target": "продолжать" },
            { "source": "set", "target": "устанавливать" },
            { "source": "learn", "target": "учить(ся)" },
            { "source": "change", "target": "менять" },
            { "source": "lead", "target": "вести за собой" },
            { "source": "understand", "target": "понимать" },
            { "source": "watch", "target": "смотреть (наблюдать)" },
            { "source": "follow", "target": "следовать" },
            { "source": "stop", "target": "останавливаться" },
            { "source": "create", "target": "создавать" },
            { "source": "speak", "target": "говорить" },
            { "source": "read", "target": "читать" },
            { "source": "allow", "target": "разрешать" },
            { "source": "add", "target": "добавлять" },
            { "source": "spend", "target": "тратить (время, деньги)" },
            { "source": "grow", "target": "расти" },
            { "source": "open", "target": "открывать" },
            { "source": "walk", "target": "гулять, ходить пешком" },
            { "source": "win", "target": "побеждать" },
            { "source": "offer", "target": "предлагать" },
            { "source": "remember", "target": "помнить" },
            { "source": "love", "target": "любить" },
            { "source": "consider", "target": "рассматривать, считать" },
            { "source": "appear", "target": "появляться" },
            { "source": "buy", "target": "покупать" },
            { "source": "wait", "target": "ждать" },
            { "source": "serve", "target": "служить, обслуживать" },
            { "source": "die", "target": "умирать" },
            { "source": "send", "target": "отправлять" },
            { "source": "expect", "target": "ожидать" },
            { "source": "build", "target": "строить" },
            { "source": "stay", "target": "оставаться" },
            { "source": "fall", "target": "падать" },
            { "source": "cut", "target": "резать" },
            { "source": "reach", "target": "достигать" },
            { "source": "kill", "target": "убивать" },
            { "source": "remain", "target": "оставаться (в состоянии)" },
            { "source": "suggest", "target": "предлагать (идею), советовать" },
            { "source": "raise", "target": "поднимать" },
            { "source": "pass", "target": "проходить, передавать" },
            { "source": "sell", "target": "продавать" },
            { "source": "require", "target": "требовать" },
            { "source": "report", "target": "сообщать" },
            { "source": "decide", "target": "решать" },
            { "source": "pull", "target": "тянуть" }
          ]
        },
        {
          "id": "theme-2",
          "name": "Тема 2: Время и даты",
          "words": [
            { "source": "time", "target": "время" },
            { "source": "day", "target": "день" },
            { "source": "week", "target": "неделя" },
            { "source": "month", "target": "месяц" },
            { "source": "year", "target": "год" },
            { "source": "second", "target": "секунда" },
            { "source": "minute", "target": "минута" },
            { "source": "hour", "target": "час" },
            { "source": "today", "target": "сегодня" },
            { "source": "yesterday", "target": "вчера" },
            { "source": "tomorrow", "target": "завтра" },
            { "source": "tonight", "target": "сегодня вечером" },
            { "source": "morning", "target": "утро" },
            { "source": "afternoon", "target": "день (после полудня)" },
            { "source": "evening", "target": "вечер" },
            { "source": "night", "target": "ночь" },
            { "source": "midnight", "target": "полночь" },
            { "source": "noon", "target": "полдень" },
            { "source": "dawn", "target": "рассвет" },
            { "source": "dusk", "target": "сумерки" },
            { "source": "Monday", "target": "понедельник" },
            { "source": "Tuesday", "target": "вторник" },
            { "source": "Wednesday", "target": "среда" },
            { "source": "Thursday", "target": "четверг" },
            { "source": "Friday", "target": "пятница" },
            { "source": "Saturday", "target": "суббота" },
            { "source": "Sunday", "target": "воскресенье" },
            { "source": "weekend", "target": "выходные" },
            { "source": "January", "target": "январь" },
            { "source": "February", "target": "февраль" },
            { "source": "March", "target": "март" },
            { "source": "April", "target": "апрель" },
            { "source": "May", "target": "май" },
            { "source": "June", "target": "июнь" },
            { "source": "July", "target": "июль" },
            { "source": "August", "target": "август" },
            { "source": "September", "target": "сентябрь" },
            { "source": "October", "target": "октябрь" },
            { "source": "November", "target": "ноябрь" },
            { "source": "December", "target": "декабрь" },
            { "source": "season", "target": "сезон, время года" },
            { "source": "spring", "target": "весна" },
            { "source": "summer", "target": "лето" },
            { "source": "autumn (fall)", "target": "осень" },
            { "source": "winter", "target": "зима" },
            { "source": "now", "target": "сейчас" },
            { "source": "then", "target": "тогда, затем" },
            { "source": "before", "target": "до, перед" },
            { "source": "after", "target": "после" },
            { "source": "soon", "target": "скоро" },
            { "source": "late", "target": "поздно, опоздавший" },
            { "source": "early", "target": "рано, ранний" },
            { "source": "always", "target": "всегда" },
            { "source": "never", "target": "никогда" },
            { "source": "sometimes", "target": "иногда" },
            { "source": "often", "target": "часто" },
            { "source": "usually", "target": "обычно" },
            { "source": "rarely", "target": "редко" },
            { "source": "already", "target": "уже" },
            { "source": "yet", "target": "еще (в отрицаниях и вопросах)" },
            { "source": "still", "target": "всё ещё" },
            { "source": "just", "target": "только что" },
            { "source": "again", "target": "снова" },
            { "source": "ago", "target": "тому назад" },
            { "source": "past", "target": "прошлое" },
            { "source": "present", "target": "настоящее" },
            { "source": "future", "target": "будущее" },
            { "source": "date", "target": "дата" },
            { "source": "calendar", "target": "календарь" },
            { "source": "clock", "target": "часы (настенные/настольные)" },
            { "source": "watch", "target": "часы (наручные)" },
            { "source": "alarm", "target": "будильник" },
            { "source": "moment", "target": "момент, миг" },
            { "source": "period", "target": "период" },
            { "source": "century", "target": "век, столетие" },
            { "source": "decade", "target": "десятилетие" },
            { "source": "millennium", "target": "тысячелетие" },
            { "source": "era", "target": "эра, эпоха" },
            { "source": "age", "target": "возраст, эпоха" },
            { "source": "schedule", "target": "расписание, график" },
            { "source": "delay", "target": "задержка" },
            { "source": "deadline", "target": "крайний срок" },
            { "source": "temporary", "target": "временный" },
            { "source": "permanent", "target": "постоянный" },
            { "source": "daily", "target": "ежедневный, ежедневно" },
            { "source": "weekly", "target": "еженедельный, еженедельно" },
            { "source": "monthly", "target": "ежемесячный" },
            { "source": "yearly (annual)", "target": "ежегодный" },
            { "source": "recently", "target": "недавно" },
            { "source": "lately", "target": "в последнее время" },
            { "source": "suddenly", "target": "вдруг, внезапно" },
            { "source": "immediately", "target": "немедленно" },
            { "source": "eventually", "target": "в конце концов" },
            { "source": "meanwhile", "target": "тем временем" },
            { "source": "forever", "target": "навсегда" },
            { "source": "once", "target": "однажды, один раз" },
            { "source": "twice", "target": "дважды" },
            { "source": "next", "target": "следующий" },
            { "source": "last", "target": "прошлый, последний" },
            { "source": "during", "target": "в течение, во время" }
          ]
        },
        {
          "id": "theme-3",
          "name": "Тема 3: Местоимения, предлоги и союзы",
          "words": [
            { "source": "I", "target": "я" },
            { "source": "you", "target": "ты, вы" },
            { "source": "he", "target": "он" },
            { "source": "she", "target": "она" },
            { "source": "it", "target": "оно, это" },
            { "source": "we", "target": "мы" },
            { "source": "they", "target": "они" },
            { "source": "me", "target": "мне, меня" },
            { "source": "him", "target": "его, ему" },
            { "source": "her", "target": "ее, ей" },
            { "source": "us", "target": "нас, нам" },
            { "source": "them", "target": "их, им" },
            { "source": "my", "target": "мой" },
            { "source": "your", "target": "твой, ваш" },
            { "source": "his", "target": "его (принадлежность)" },
            { "source": "its", "target": "его, ее (для неодушевленных)" },
            { "source": "our", "target": "наш" },
            { "source": "their", "target": "их (принадлежность)" },
            { "source": "mine", "target": "мой (абсолютная форма)" },
            { "source": "yours", "target": "твой, ваш (абсолютная форма)" },
            { "source": "ours", "target": "наш (абсолютная форма)" },
            { "source": "theirs", "target": "их (абсолютная форма)" },
            { "source": "this", "target": "этот, эта, это" },
            { "source": "that", "target": "тот, та, то" },
            { "source": "these", "target": "эти" },
            { "source": "those", "target": "те" },
            { "source": "who", "target": "кто" },
            { "source": "whom", "target": "кого, кому" },
            { "source": "whose", "target": "чей" },
            { "source": "what", "target": "что, какой" },
            { "source": "which", "target": "который" },
            { "source": "someone (somebody)", "target": "кто-то" },
            { "source": "anyone (anybody)", "target": "кто-нибудь, любой" },
            { "source": "no one (nobody)", "target": "никто" },
            { "source": "everyone (everybody)", "target": "все, каждый" },
            { "source": "something", "target": "что-то" },
            { "source": "anything", "target": "что-нибудь, всё что угодно" },
            { "source": "nothing", "target": "ничего" },
            { "source": "everything", "target": "всё" },
            { "source": "all", "target": "все, всё" },
            { "source": "some", "target": "несколько, немного" },
            { "source": "any", "target": "любой, какой-нибудь" },
            { "source": "many", "target": "много (для исчисляемых)" },
            { "source": "much", "target": "много (для неисчисляемых)" },
            { "source": "few", "target": "мало (для исчисляемых)" },
            { "source": "little", "target": "мало (для неисчисляемых)" },
            { "source": "other", "target": "другой" },
            { "source": "another", "target": "еще один, другой" },
            { "source": "each", "target": "каждый (по отдельности)" },
            { "source": "every", "target": "каждый (обобщенно)" },
            { "source": "both", "target": "оба" },
            { "source": "either", "target": "любой (из двух)" },
            { "source": "neither", "target": "ни один (из двух)" },
            { "source": "such", "target": "такой" },
            { "source": "same", "target": "тот же самый" },
            { "source": "in", "target": "в" },
            { "source": "on", "target": "на" },
            { "source": "at", "target": "у, в, на (точка)" },
            { "source": "to", "target": "к, в (направление)" },
            { "source": "for", "target": "для, в течение" },
            { "source": "of", "target": "из, от (принадлежность)" },
            { "source": "with", "target": "с" },
            { "source": "without", "target": "без" },
            { "source": "about", "target": "о, около" },
            { "source": "against", "target": "против" },
            { "source": "between", "target": "между (двумя)" },
            { "source": "among", "target": "среди (многих)" },
            { "source": "into", "target": "внутрь" },
            { "source": "through", "target": "через, сквозь" },
            { "source": "over", "target": "над, поверх" },
            { "source": "under", "target": "под" },
            { "source": "above", "target": "выше, над" },
            { "source": "below", "target": "ниже, под" },
            { "source": "from", "target": "из, от" },
            { "source": "by", "target": "у, около, посредством" },
            { "source": "as", "target": "как, в качестве" },
            { "source": "across", "target": "через, поперек" },
            { "source": "along", "target": "вдоль" },
            { "source": "behind", "target": "позади" },
            { "source": "beyond", "target": "за, по ту сторону" },
            { "source": "near", "target": "рядом, около" },
            { "source": "up", "target": "вверх" },
            { "source": "down", "target": "вниз" },
            { "source": "around", "target": "вокруг" },
            { "source": "and", "target": "и, а" },
            { "source": "but", "target": "но" },
            { "source": "or", "target": "или" },
            { "source": "so", "target": "так, поэтому" },
            { "source": "if", "target": "если" },
            { "source": "because", "target": "потому что" },
            { "source": "although (though)", "target": "хотя" },
            { "source": "while", "target": "пока, в то время как" },
            { "source": "unless", "target": "пока не, если не" },
            { "source": "since", "target": "с тех пор как, так как" },
            { "source": "until (till)", "target": "до тех пор пока" },
            { "source": "whether", "target": "ли" },
            { "source": "than", "target": "чем" },
            { "source": "however", "target": "однако" },
            { "source": "therefore", "target": "поэтому, следовательно" },
            { "source": "also (too)", "target": "также, тоже" }
          ]
        }
      ]
    },
    {
      "id": "en-de",
      "name": "English → Deutsch",
      "themes": [
        {
          "id": "default",
          "name": "Default Words",
          "words": [
            { "source": "apple", "target": "Apfel" },
            { "source": "house", "target": "Haus" },
            { "source": "water", "target": "Wasser" },
            { "source": "book", "target": "Buch" },
            { "source": "cat", "target": "Katze" },
            { "source": "dog", "target": "Hund" },
            { "source": "sun", "target": "Sonne" },
            { "source": "moon", "target": "Mond" },
            { "source": "tree", "target": "Baum" },
            { "source": "flower", "target": "Blume" },
            { "source": "friend", "target": "Freund" },
            { "source": "time", "target": "Zeit" },
            { "source": "world", "target": "Welt" },
            { "source": "love", "target": "Liebe" },
            { "source": "child", "target": "Kind" },
            { "source": "city", "target": "Stadt" },
            { "source": "rain", "target": "Regen" },
            { "source": "snow", "target": "Schnee" },
            { "source": "bread", "target": "Brot" },
            { "source": "milk", "target": "Milch" },
            { "source": "table", "target": "Tisch" },
            { "source": "window", "target": "Fenster" },
            { "source": "door", "target": "Tür" },
            { "source": "sky", "target": "Himmel" },
            { "source": "star", "target": "Stern" }
          ]
        }
      ]
    }
  ]
};

let wordSets = [];

async function loadWords() {
  // Using inline word data globally to avoid desync with words.json
  wordSets = INLINE_WORD_DATA.sets;
  populateLanguageSelect();

  if (!state.currentLangId) {
    state.currentLangId = wordSets[0].id;
  }
  dom.langSelect.value = state.currentLangId;

  populateThemes(state.currentLangId);
}

function populateLanguageSelect() {
  dom.langSelect.innerHTML = '';
  wordSets.forEach(set => {
    const opt = document.createElement('option');
    opt.value = set.id;
    opt.textContent = set.name;
    dom.langSelect.appendChild(opt);
  });
}

function populateThemes(langId) {
  const set = wordSets.find(s => s.id === langId) || wordSets[0];
  dom.themeSelect.innerHTML = '';
  set.themes.forEach(theme => {
    const opt = document.createElement('option');
    opt.value = theme.id;
    opt.textContent = theme.name;
    dom.themeSelect.appendChild(opt);
  });

  if (!state.currentThemeId || !set.themes.find(t => t.id === state.currentThemeId)) {
    state.currentThemeId = set.themes[0].id;
  }
  dom.themeSelect.value = state.currentThemeId;

  selectSet(langId, state.currentThemeId);
}

function selectSet(langId, themeId) {
  state.currentLangId = langId;
  state.currentThemeId = themeId;
  const set = wordSets.find(s => s.id === langId) || wordSets[0];
  state.currentSet = set.themes.find(t => t.id === themeId) || set.themes[0];
  resetGame();
}

// ========================= GAME LOGIC =========================
function resetGame() {
  // Clear any running word timer
  clearWordTimer();

  // Copy words
  state.words = state.currentSet.words.map(w => ({ ...w }));
  state.originalTotal = state.words.length;

  if (state.mode === 'spaced') {
    // Spaced mode acts as a review queue: ONLY pull words we've made mistakes on (wrongCount > 0)
    // and that haven't graduated yet (box < 3)
    const priorityGroups = { 1: [], 2: [] };
    
    state.currentSet.words.forEach(w => {
      const key = w.source + '|' + w.target;
      const srsInfo = state.srsData[key];
      if (srsInfo && srsInfo.wrongCount > 0 && srsInfo.box < 3) {
        priorityGroups[srsInfo.box].push(w);
      }
    });
    
    if (state.shuffle) {
      shuffleArray(priorityGroups[1]);
      shuffleArray(priorityGroups[2]);
    }
    
    state.words = [...priorityGroups[1], ...priorityGroups[2]];
    
    // Fallback word if there are no mistakes to review
    if (state.words.length === 0) {
      state.words = [{ source: 'no mistakes to review', target: 'нет ошибок для повторения' }];
    }
    
    state.originalTotal = state.words.length;
  } else if (state.shuffle) {
    shuffleArray(state.words);
  }

  state.wordIndex = 0;
  state.typed = '';
  state.hadErrorThisWord = false;
  state.learningPhase = 1;
  state.mistakes = [];
  state.uniqueMistakeWords = [];
  state.correctChars = 0;
  state.totalChars = 0;
  state.wordsCompleted = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.startTime = null;
  state.finished = false;
  state.hintLevel = 0;
  state.hintShown = '';
  state.testWaiting = false;

  // Hide results
  dom.resultsOverlay.classList.remove('visible');

  // Test mode: show "click to start" instead of starting immediately
  if (state.mode === 'test') {
    state.testWaiting = true;
    showTestStartOverlay();
    updateStatsUI();
    dom.typingInput.value = '';
    return;
  }

  hideTestStartOverlay();

  // Show first word
  setupCurrentWord();
  updateStatsUI();
  dom.typingInput.value = '';
  dom.typingInput.focus();
}

function startTest() {
  state.testWaiting = false;
  hideTestStartOverlay();
  setupCurrentWord();
  updateStatsUI();
  dom.typingInput.value = '';
  dom.typingInput.focus();
}

function showTestStartOverlay() {
  if (dom.testStartOverlay) dom.testStartOverlay.classList.add('visible');
  dom.wordDisplay.innerHTML = '';
  dom.wordHint.textContent = '';
  dom.audioBtn.classList.add('hide');
  hideTimerBar();
  hideWordHintText();
}

function hideTestStartOverlay() {
  if (dom.testStartOverlay) dom.testStartOverlay.classList.remove('visible');
}

function setupCurrentWord() {
  // Clear previous word timer
  clearWordTimer();
  state.hintLevel = 0;
  state.hintShown = '';
  hideWordHintText();

  if (state.wordIndex >= state.words.length) {
    finishGame();
    return;
  }

  const word = state.words[state.wordIndex];
  state.typed = '';
  state.hadErrorThisWord = false;

  // --- Learning mode: two-phase per word ---
  if (state.mode === 'learning') {
    hideTimerBar();
    if (state.learningPhase === 1) {
      // Phase 1: show both, user types the English word
      state.currentTarget = word.source;
      state.requiredTarget = cleanTarget(word.source);
      state.currentDisplay = word.source + ' — ' + word.target;
      dom.wordHint.textContent = 'type the english word';
    } else {
      // Phase 2: show both, user types the translation
      state.currentTarget = word.target;
      state.requiredTarget = cleanTarget(word.target);
      state.currentDisplay = word.source + ' — ' + word.target;
      dom.wordHint.textContent = 'now type the translation';
    }
    renderWord();

    dom.audioBtn.classList.remove('hide');
    if (state.ttsEnabled) {
      const isRussian = /[а-яА-ЯёЁ]/.test(state.currentTarget);
      speakWord(state.currentTarget, isRussian);
    }
    return;
  }

  // --- Other modes ---
  // Determine direction
  if (state.mode === 'spaced') {
    state.currentDirection = Math.random() < 0.5 ? 'ru-to-en' : 'en-to-ru';
  } else if (state.mode === 'test') {
    state.currentDirection = 'ru-to-en'; // User translates RU -> EN
  } else if (state.mode === 'reverse') {
    state.currentDirection = 'en-to-ru'; // User translates EN -> RU
  }

  if (state.currentDirection === 'ru-to-en') {
    state.currentDisplay = word.target; // Show RU
    state.currentTarget = word.source;  // Show EN
    state.requiredTarget = cleanTarget(word.source); // Type EN required
    dom.wordHint.innerHTML = 'type the english translation';
  } else if (state.currentDirection === 'en-to-ru') {
    state.currentDisplay = word.source; // Show EN
    state.currentTarget = word.target;  // Show RU
    state.requiredTarget = cleanTarget(word.target); // Type RU required
    dom.wordHint.innerHTML = 'type the translation';
  }

  // Show SRS badge in spaced mode
  if (state.mode === 'spaced') {
    const key = word.source + '|' + word.target;
    const box = (state.srsData[key] && state.srsData[key].box) || 1;
    dom.wordHint.innerHTML += `<span class="srs-badge srs-box-${box}">box ${box}</span>`;
  }

  // Audio button is only needed in learning mode
  if (state.mode === 'learning') {
    dom.audioBtn.classList.remove('hide');
  } else {
    dom.audioBtn.classList.add('hide');
  }

  renderWord();

  // Start timer for test mode
  if (state.mode === 'test') {
    startWordTimer();
  } else {
    hideTimerBar();
  }
}

function cleanTarget(str) {
  if (!str) return '';
  // 1. Remove anything in parentheses: "делать (создавать)" -> "делать "
  let cleaned = str.replace(/\s*\(.*?\)\s*/g, ' ');
  // 2. Take only the first part before a comma: "звонить, называть" -> "звонить"
  cleaned = cleaned.split(',')[0];
  // 3. Trim extra spaces
  return cleaned.trim();
}

// ========================= TYPING ENGINE =========================
function renderWord() {
  const target = state.currentTarget;
  const typed = state.typed;
  const required = state.requiredTarget;
  let html = '';

  const isBlindMode = (state.mode === 'test' || state.mode === 'reverse' || state.mode === 'mixed');

  for (let i = 0; i < target.length; i++) {
    let cls = '';
    
    if (i < typed.length) {
      cls = typed[i] === target[i] ? 'correct' : 'wrong';
    } else if (i === typed.length) {
      cls = 'current';
    } else if (i >= required.length) {
      cls = 'optional'; // visual cue for optional part
    }

    let charToShow = target[i];

    if (isBlindMode) {
      if (i < required.length) {
        if (i < typed.length) {
          charToShow = typed[i]; // Show user's typo
        } else if (i === typed.length) {
          charToShow = ' '; // Empty space for caret
        } else {
          continue; // Hide un-typed required letters
        }
      } else {
        // Optional parts remain visible even in blind mode
        // as they provide hint context (e.g., "(создавать)")
      }
    }

    // Escape HTML
    const char = charToShow === ' ' ? '&nbsp;' : escapeHtml(charToShow);
    html += `<span class="letter ${cls}">${char}</span>`;
  }

  // If user typed extra characters beyond target
  for (let i = target.length; i < typed.length; i++) {
    const char = typed[i] === ' ' ? '&nbsp;' : escapeHtml(typed[i]);
    html += `<span class="letter wrong">${char}</span>`;
  }

  // Show the display text above if mode is not just the target
  if (state.mode === 'learning' || state.mode === 'reverse' || state.mode === 'mixed' || state.mode === 'test') {
    // If display is different from target, show it as a prompt above
    if (state.currentDisplay !== state.currentTarget) {
      dom.wordHint.textContent = state.currentDisplay;
    }
  }

  dom.wordDisplay.innerHTML = html;
  dom.wordDisplay.appendChild(dom.caret); // keep caret inside to follow CSS animations

  // Update caret position after DOM renders
  requestAnimationFrame(updateCaretPosition);
}

function updateCaretPosition() {
  if (state.finished || !state.focused) {
    dom.caret.classList.add('hidden');
    return;
  }

  const currentLetter = dom.wordDisplay.querySelector('.letter.current');
  const parentRect = dom.wordDisplay.getBoundingClientRect();

  if (currentLetter) {
    const rect = currentLetter.getBoundingClientRect();
    const x = rect.left - parentRect.left - 2;
    const y = rect.top - parentRect.top + (rect.height * 0.1);

    dom.caret.style.transform = `translate(${x}px, ${y}px)`;
    dom.caret.style.height = `${rect.height * 0.8}px`;
    dom.caret.classList.remove('hidden');

    // Restart animation for immediate visibility
    dom.caret.style.animation = 'none';
    void dom.caret.offsetWidth;
    dom.caret.style.animation = null;
  } else {
    // End of word or no letters
    const letters = dom.wordDisplay.querySelectorAll('.letter');
    if (letters.length > 0) {
      const lastLetter = letters[letters.length - 1];
      const rect = lastLetter.getBoundingClientRect();
      const x = rect.right - parentRect.left + 2;
      const y = rect.top - parentRect.top + (rect.height * 0.1);

      dom.caret.style.transform = `translate(${x}px, ${y}px)`;
      dom.caret.style.height = `${rect.height * 0.8}px`;
      dom.caret.classList.remove('hidden');

      dom.caret.style.animation = 'none';
      void dom.caret.offsetWidth;
      dom.caret.style.animation = null;
    } else {
      dom.caret.classList.add('hidden');
    }
  }
}

function handleInput() {
  // Block input while waiting for test to start
  if (state.testWaiting) {
    dom.typingInput.value = '';
    return;
  }

  let val = dom.typingInput.value;

  // Auto-convert layout based on target word script
  const target = state.currentTarget;
  const required = state.requiredTarget;
  val = autoConvertLayout(val, target);
  dom.typingInput.value = val;

  state.typed = val;

  // Start stats timer on first keypress
  if (!state.startTime && val.length > 0) {
    state.startTime = Date.now();
  }

  // Count chars
  if (val.length > state.totalChars) {
    const newChars = val.length - state.totalChars + (state.totalChars === 0 ? 0 : 0);
  }

  // Real-time rendering
  renderWord();

  // Check for errors this word (skip strict error tracking in test mode — timer handles it)
  if (state.mode !== 'test') {
    for (let i = 0; i < val.length && i < target.length; i++) {
      if (val[i] !== target[i]) {
        state.hadErrorThisWord = true;
        break;
      }
    }
  }

  // Auto-advance if they typed exactly the required portion, OR the full string
  if (val === required || val === target) {
    wordCompleted(false);
    return;
  }

  if (state.mode !== 'test' && val.length > target.length) {
    state.hadErrorThisWord = true;
  }

  updateStatsUI();
}

function wordCompleted(skipped) {
  // Clear timer when word is completed
  clearWordTimer();

  const word = state.words[state.wordIndex];

  // Track characters
  if (!skipped) {
    state.correctChars += state.requiredTarget.length;
    state.totalChars += state.typed.length;
  }

  // Learning mode: handle two-phase flow
  if (state.mode === 'learning' && state.learningPhase === 1 && !skipped) {
    // Phase 1 done → transition to phase 2 (type the translation)
    state.learningPhase = 2;
    dom.wordDisplay.classList.add('fade-out');
    dom.audioBtn.classList.add('hide');
    setTimeout(() => {
      dom.typingInput.value = '';
      state.typed = '';
      dom.wordDisplay.classList.remove('fade-out');
      dom.wordDisplay.classList.add('entering');
      setupCurrentWord();
      updateStatsUI();
      setTimeout(() => dom.wordDisplay.classList.remove('entering'), 200);
    }, 120);
    return;
  }

  // Reset learning phase for next word
  state.learningPhase = 1;

  // Handle mistakes
  const neededHint = (state.mode === 'test' && state.hintLevel > 0);
  if (state.hadErrorThisWord || skipped || neededHint) {
    state.mistakes.push({ ...word });
    // Track unique mistakes
    const key = word.source + '|' + word.target;
    if (!state.uniqueMistakeWords.find(m => (m.source + '|' + m.target) === key)) {
      state.uniqueMistakeWords.push({ ...word });
    }
    state.streak = 0;
    if (state.mode === 'test' || state.mode === 'spaced') {
      saveSRSData(key, false);
    }
  } else {
    state.streak++;
    if (state.streak > state.bestStreak) {
      state.bestStreak = state.streak;
    }
    const key = word.source + '|' + word.target;
    if (state.mode === 'test' || state.mode === 'spaced') {
      saveSRSData(key, true);
    }
    
    // Streak pop animation
    dom.statStreak.classList.remove('streak-pop');
    void dom.statStreak.offsetWidth; // force reflow
    dom.statStreak.classList.add('streak-pop');
  }

  state.wordsCompleted++;
  state.wordIndex++;

  // Re-queue mistakes at the end when all original words are done
  if (state.wordIndex >= state.words.length && state.mistakes.length > 0) {
    state.words.push(...state.mistakes);
    state.mistakes = [];
  }

  // Transition to next word
  dom.wordDisplay.classList.add('fade-out');
  dom.audioBtn.classList.add('hide');
  setTimeout(() => {
    dom.typingInput.value = '';
    state.typed = '';
    dom.wordDisplay.classList.remove('fade-out');
    dom.wordDisplay.classList.add('entering');
    setupCurrentWord();
    updateStatsUI();
    setTimeout(() => dom.wordDisplay.classList.remove('entering'), 200);
  }, 120);
}

function skipWord() {
  if (state.finished) return;
  state.hadErrorThisWord = true;
  state.totalChars += state.typed.length || 1;
  wordCompleted(true);
}

// ========================= STATS =========================
function updateStatsUI() {
  // Progress
  const total = state.words.length;
  dom.statProgress.textContent = `${state.wordIndex}/${total}`;

  // Accuracy
  const accuracy = state.totalChars > 0
    ? Math.round((state.correctChars / state.totalChars) * 100)
    : 100;
  dom.statAccuracy.textContent = accuracy + '%';

  // WPM (correct chars only)
  let wpm = 0;
  if (state.startTime) {
    const minutes = (Date.now() - state.startTime) / 60000;
    if (minutes > 0) {
      wpm = Math.round((state.correctChars / 5) / minutes);
    }
  }
  dom.statWpm.textContent = wpm;

  // Streak
  dom.statStreak.textContent = state.streak + ' 🔥';
}

function finishGame() {
  state.finished = true;

  const elapsed = state.startTime
    ? Math.round((Date.now() - state.startTime) / 1000)
    : 0;
  const accuracy = state.totalChars > 0
    ? Math.round((state.correctChars / state.totalChars) * 100)
    : 100;
  const minutes = elapsed / 60;
  const wpm = minutes > 0 ? Math.round((state.correctChars / 5) / minutes) : 0;

  // Populate results
  dom.resWords.textContent = state.wordsCompleted;
  dom.resAccuracy.textContent = accuracy + '%';
  dom.resWpm.textContent = wpm;
  dom.resStreak.textContent = state.bestStreak;
  dom.resMistakes.textContent = state.uniqueMistakeWords.length;

  saveSessionResult(minutes, accuracy, wpm);

  // Mistakes list
  if (state.uniqueMistakeWords.length > 0) {
    let html = '<h3>words to review</h3>';
    state.uniqueMistakeWords.forEach(w => {
      html += `<span class="mistake-word">${escapeHtml(w.source)} — ${escapeHtml(w.target)}</span>`;
    });
    dom.resMistakesList.innerHTML = html;
    dom.resMistakesList.style.display = '';
  } else {
    dom.resMistakesList.innerHTML = '';
    dom.resMistakesList.style.display = 'none';
  }

  dom.resultsOverlay.classList.add('visible');
}

// ========================= UI EVENT HANDLERS =========================
function initEventListeners() {
  // Mode tabs
  dom.modeTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.mode-tab');
    if (!tab) return;
    dom.modeTabs.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.mode = tab.dataset.mode;
    resetGame();
  });

  // Language select
  dom.langSelect.addEventListener('change', () => {
    state.currentLangId = dom.langSelect.value;
    saveSettings();
    populateThemes(state.currentLangId);
  });

  // Theme select
  dom.themeSelect.addEventListener('change', () => {
    state.currentThemeId = dom.themeSelect.value;
    saveSettings();
    selectSet(state.currentLangId, state.currentThemeId);
  });

  // Shuffle toggle
  dom.shuffleToggle.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    dom.shuffleToggle.classList.toggle('active', state.shuffle);
    dom.shuffleToggle.textContent = state.shuffle ? 'on' : 'off';
    saveSettings();
    resetGame();
  });

  // TTS toggle
  if (dom.ttsToggle) {
    dom.ttsToggle.addEventListener('click', () => {
      state.ttsEnabled = !state.ttsEnabled;
      dom.ttsToggle.classList.toggle('active', state.ttsEnabled);
      dom.ttsToggle.textContent = state.ttsEnabled ? 'on' : 'off';
      saveSettings();
    });
  }

  // History buttons
  if (dom.btnHistory) {
    dom.btnHistory.addEventListener('click', showHistoryModal);
  }
  if (dom.btnCloseHistory) {
    dom.btnCloseHistory.addEventListener('click', () => {
      dom.historyOverlay.classList.remove('visible');
    });
  }

  // Audio button
  if (dom.audioBtn) {
    dom.audioBtn.addEventListener('click', () => {
      const textToSpeak = state.mode === 'learning' ? state.currentTarget : state.currentDisplay;
      const isRussian = /[а-яА-ЯёЁ]/.test(textToSpeak);
      speakWord(textToSpeak, isRussian);
    });
  }

  // Typing input
  dom.typingInput.addEventListener('input', handleInput);

  // Keyboard shortcuts
  dom.typingInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      skipWord();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      resetGame();
    }
  });

  // Focus management — click anywhere on typing area to focus
  dom.typingArea.addEventListener('click', () => {
    if (state.testWaiting) {
      startTest();
      return;
    }
    dom.typingInput.focus();
  });

  // Test start overlay click
  if (dom.testStartOverlay) {
    dom.testStartOverlay.addEventListener('click', () => {
      if (state.testWaiting) startTest();
    });
  }

  // Global key listener — any key focuses input
  document.addEventListener('keydown', (e) => {
    if (state.finished) return;
    // Don't capture if user is in select or button
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
    if (e.key === 'Tab') {
      e.preventDefault();
      resetGame();
      return;
    }
    // Start test on any keypress
    if (state.testWaiting) {
      startTest();
      return;
    }
    if (document.activeElement !== dom.typingInput) {
      dom.typingInput.focus();
    }
  });

  // Focus/blur tracking for visual feedback
  dom.typingInput.addEventListener('focus', () => {
    state.focused = true;
    dom.typingArea.classList.add('focused');
  });
  dom.typingInput.addEventListener('blur', () => {
    state.focused = false;
    dom.typingArea.classList.remove('focused');
  });

  // Restart button
  dom.btnRestart.addEventListener('click', () => {
    resetGame();
  });

  // Close results on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.finished) {
      resetGame();
    }
  });

  // Track window resize to re-position caret
  window.addEventListener('resize', () => {
    requestAnimationFrame(updateCaretPosition);
  });
}

// ========================= TEST MODE TIMER & HINTS =========================
function startWordTimer() {
  state.wordStartTime = Date.now();
  state.hintLevel = 0;
  state.hintShown = '';
  showTimerBar();
  updateTimerDisplay(state.wordTimeLimit);

  state.wordTimerId = setInterval(() => {
    const elapsed = (Date.now() - state.wordStartTime) / 1000;
    const remaining = Math.max(0, state.wordTimeLimit - elapsed);

    updateTimerDisplay(remaining);

    // Hint at 5 seconds
    if (elapsed >= 5 && state.hintLevel === 0) {
      state.hintLevel = 1;
      showHint(1);
    }

    // Stronger hint at 8 seconds
    if (elapsed >= 8 && state.hintLevel === 1) {
      state.hintLevel = 2;
      showHint(2);
    }

    // Timer expired — just stop the countdown (no auto-skip)
    if (remaining <= 0) {
      clearInterval(state.wordTimerId);
      state.wordTimerId = null;
      // Keep timer bar visible at 0 to show time is up
    }
  }, 50);
}

function clearWordTimer() {
  if (state.wordTimerId) {
    clearInterval(state.wordTimerId);
    state.wordTimerId = null;
  }
  state.wordStartTime = null;
  hideTimerBar();
}

function showHint(level) {
  const target = state.requiredTarget;
  if (!target) return;

  let hint = '';
  if (level === 1) {
    // Show first 1-2 letters
    const revealCount = Math.max(1, Math.ceil(target.length * 0.25));
    hint = target.substring(0, revealCount) + '…';
  } else if (level === 2) {
    // Show first half of the word
    const revealCount = Math.ceil(target.length * 0.6);
    hint = target.substring(0, revealCount) + '…';
  }

  state.hintShown = hint;
  showWordHintText('💡 ' + hint);
}

function showTimerBar() {
  if (dom.timerBar) dom.timerBar.classList.add('visible');
}

function hideTimerBar() {
  if (dom.timerBar) dom.timerBar.classList.remove('visible');
  if (dom.timerFill) {
    dom.timerFill.style.width = '100%';
    dom.timerFill.classList.remove('warning', 'danger');
  }
}

function updateTimerDisplay(remaining) {
  if (!dom.timerFill || !dom.timerText) return;

  const pct = (remaining / state.wordTimeLimit) * 100;
  dom.timerFill.style.width = pct + '%';
  dom.timerText.textContent = remaining.toFixed(1) + 's';

  // Color transitions
  dom.timerFill.classList.toggle('warning', remaining <= 5 && remaining > 2);
  dom.timerFill.classList.toggle('danger', remaining <= 2);
}

function showWordHintText(text) {
  if (!dom.wordHintText) return;
  dom.wordHintText.textContent = text;
  dom.wordHintText.classList.add('visible');
}

function hideWordHintText() {
  if (!dom.wordHintText) return;
  dom.wordHintText.textContent = '';
  dom.wordHintText.classList.remove('visible');
}

// ========================= STORAGE & HISTORY =========================
function saveSettings() {
  const settings = {
    shuffle: state.shuffle,
    langId: state.currentLangId,
    themeId: state.currentThemeId,
    ttsEnabled: state.ttsEnabled
  };
  localStorage.setItem('vocabtype_settings', JSON.stringify(settings));
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('vocabtype_settings'));
    if (saved) {
      if (saved.shuffle !== undefined) state.shuffle = saved.shuffle;
      if (saved.langId) state.currentLangId = saved.langId;
      if (saved.themeId) state.currentThemeId = saved.themeId;
      if (saved.ttsEnabled !== undefined) state.ttsEnabled = saved.ttsEnabled;
      
      dom.shuffleToggle.classList.toggle('active', state.shuffle);
      dom.shuffleToggle.textContent = state.shuffle ? 'on' : 'off';
      
      dom.ttsToggle.classList.toggle('active', state.ttsEnabled);
      dom.ttsToggle.textContent = state.ttsEnabled ? 'on' : 'off';
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
}

function loadSRSData() {
  try {
    const saved = JSON.parse(localStorage.getItem('vocabtype_srs'));
    if (saved) {
      state.srsData = saved;
    }
  } catch (e) {
    console.error('Failed to load SRS data', e);
  }
}

function saveSRSData(wordKey, isCorrect) {
  if (!state.srsData[wordKey]) {
    state.srsData[wordKey] = { box: 1, lastSeen: Date.now(), correctCount: 0, wrongCount: 0 };
  }
  
  const record = state.srsData[wordKey];
  record.lastSeen = Date.now();
  
  if (isCorrect) {
    record.correctCount++;
    if (record.box < 3) record.box++;
  } else {
    record.wrongCount++;
    record.box = 1; // reset to box 1 on mistake
  }
  
  localStorage.setItem('vocabtype_srs', JSON.stringify(state.srsData));
}

function saveSessionResult(minutes, accuracy, wpm) {
  try {
    const history = JSON.parse(localStorage.getItem('vocabtype_history')) || [];
    
    // Create new session record
    const record = {
      date: new Date().toISOString(),
      mode: state.mode,
      words: state.wordsCompleted,
      accuracy: accuracy,
      wpm: wpm,
      bestStreak: state.bestStreak,
      mistakes: state.uniqueMistakeWords.length
    };
    
    history.unshift(record);
    
    // Keep only last 20
    if (history.length > 20) {
      history.length = 20;
    }
    
    localStorage.setItem('vocabtype_history', JSON.stringify(history));
    state.history = history;
  } catch (e) {
    console.error('Failed to save session history', e);
  }
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem('vocabtype_history'));
    if (saved) {
      state.history = saved;
    }
  } catch (e) {
    console.error('Failed to load history', e);
  }
}

function showHistoryModal() {
  loadHistory();
  const list = dom.historyList;
  list.innerHTML = '';
  
  if (!state.history || state.history.length === 0) {
    list.innerHTML = '<div style="color: var(--text-sub); text-align: center; padding: 2rem;">No session history yet</div>';
  } else {
    state.history.forEach(session => {
      const date = new Date(session.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      const item = document.createElement('div');
      item.className = 'history-item';
      
      item.innerHTML = `
        <div class="history-date">${date}</div>
        <div class="history-mode">${session.mode}</div>
        <div class="history-stat">
          <span>words</span>
          ${session.words}
        </div>
        <div class="history-stat">
          <span>acc / wpm</span>
          ${session.accuracy}% / ${session.wpm}
        </div>
      `;
      list.appendChild(item);
    });
  }
  
  dom.historyOverlay.classList.add('visible');
}

// ========================= TEXT-TO-SPEECH =========================
function speakWord(text, isRussian) {
  if (!window.speechSynthesis) return;
  
  // Cut off translations in parentheses to avoid reading hints
  const cleanText = text.replace(/\s*\(.*?\)\s*/g, '');
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = isRussian ? 'ru-RU' : 'en-US';
  utterance.rate = 0.9; // slightly slower for clarity
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// ========================= UTILITIES =========================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const enToRuMap = {
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ',
  'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э',
  'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю', '/': '.', '`': 'ё',
  'Q': 'Й', 'W': 'Ц', 'E': 'У', 'R': 'К', 'T': 'Е', 'Y': 'Н', 'U': 'Г', 'I': 'Ш', 'O': 'Щ', 'P': 'З', '{': 'Х', '}': 'Ъ',
  'A': 'Ф', 'S': 'Ы', 'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р', 'J': 'О', 'K': 'Л', 'L': 'Д', ':': 'Ж', '"': 'Э',
  'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М', 'B': 'И', 'N': 'Т', 'M': 'Ь', '<': 'Б', '>': 'Ю', '?': ',', '~': 'Ё'
};

const ruToEnMap = {};
for (const [en, ru] of Object.entries(enToRuMap)) {
  ruToEnMap[ru] = en;
}

function autoConvertLayout(val, target) {
  const isTargetCyrillic = /[а-яА-ЯёЁ]/.test(target);
  const isTargetLatin = /[a-zA-Z]/.test(target);

  let converted = '';
  for (let i = 0; i < val.length; i++) {
    const char = val[i];
    if (isTargetCyrillic && enToRuMap[char]) {
      converted += enToRuMap[char];
    } else if (isTargetLatin && ruToEnMap[char]) {
      converted += ruToEnMap[char];
    } else {
      converted += char;
    }
  }
  return converted;
}

// ========================= INIT =========================
async function init() {
  loadSettings();
  loadSRSData();
  await loadWords();
  initEventListeners();
  dom.typingInput.focus();

  // If browser natively focused the input before listener was attached
  if (document.activeElement === dom.typingInput) {
    state.focused = true;
    dom.typingArea.classList.add('focused');
    requestAnimationFrame(updateCaretPosition);
  }
}

// Start the app
init();
