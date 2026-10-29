/* Мои слова — грамматика A1.
   Схема урока (по исследованиям обучения грамматике):
   1) короткое явное правило по-русски + сравнение с русским (explicit instruction — Norris & Ortega, 2000);
   2) сначала задания на понимание: смысл зависит от формы (structured input — VanPatten);
   3) потом выбор формы → написать самой → собрать фразу (от узнавания к производству);
   4) объяснение «почему» при ошибке, повтор ошибочных заданий в конце;
   5) короткое повторение темы через несколько дней (интервалы — FSRS, как у слов);
   6) где можно — примеры на ваших словах. Порядок тем — базовый список A1 (British Council / EAQUALS). */
(function () {
  'use strict';
  const C = window.Core;
  const { S, h, icon, toast, go, routes, screen, wordsArr, kvSet, kvGet } = window.App;
  const sayP = (t, o) => window.Extra ? Extra.sayP(t, o) : Promise.resolve();

  // ---------- Уроки ----------
  const L = [];
  const add = (o) => L.push(o);

  add({ id: 'be', title: 'am / is / are', sub: 'Я есть, он есть: глагол «быть»', icon: '🟢',
    theory: [
      { h: 'Главное отличие от русского', p: 'По-русски говорим «Я устала», «Море тёплое» — без глагола. По-английски глагол нужен всегда: I am tired, The sea is warm. Это слово «быть» в трёх формах.' },
      { h: 'Три формы', table: [['I', 'am', "I'm"], ['he / she / it', 'is', "she's"], ['you / we / they', 'are', "they're"]],
        ex: [['I am tired.', 'Я устала.'], ['She is my friend.', 'Она моя подруга.'], ['It is hot today.', 'Сегодня жарко.'], ['We are in Bali.', 'Мы на Бали.'], ['The waves are big.', 'Волны большие.']] },
      { h: 'Подсказка', p: 'Один предмет или человек → is (the sea is, my name is). Много → are (the waves are). С I — только am.' },
    ],
    items: [
      { t: 'choose', s: 'I ___ hungry.', ru: 'Я голодна.', o: ['am', 'is', 'are'], a: 'am', why: 'С I всегда am.' },
      { t: 'choose', s: 'She ___ my friend.', ru: 'Она моя подруга.', o: ['is', 'am', 'are'], a: 'is', why: 'She (она) → is.' },
      { t: 'choose', s: 'We ___ in Bali.', ru: 'Мы на Бали.', o: ['are', 'is', 'am'], a: 'are', why: 'We (мы) → are.' },
      { t: 'choose', s: 'It ___ hot today.', ru: 'Сегодня жарко.', o: ['is', 'are', 'am'], a: 'is', why: 'It → is.' },
      { t: 'choose', s: 'The sea ___ warm.', ru: 'Море тёплое.', o: ['is', 'are', 'am'], a: 'is', why: 'Море — одно → is.' },
      { t: 'choose', s: 'The waves ___ big.', ru: 'Волны большие.', o: ['are', 'is', 'am'], a: 'are', why: 'Waves — волн много (-s) → are.' },
      { t: 'choose', s: 'My name ___ Jane.', ru: 'Меня зовут Джейн.', o: ['is', 'am', 'are'], a: 'is', why: 'Name — одно → is. Дословно: «Моё имя есть Джейн».' },
      { t: 'choose', s: 'You ___ late.', ru: 'Ты опоздала.', o: ['are', 'is', 'am'], a: 'are', why: 'You → are (и «ты», и «вы»).' },
      { t: 'meaning', s: "They're ready.", ask: 'О ком речь?', o: ['о нескольких людях', 'об одном человеке'], a: 0, why: "They're = they are — они." },
      { t: 'meaning', s: "He's tired.", ask: 'Кто устал?', o: ['он', 'она', 'они'], a: 0, why: "He's = he is — он." },
      { t: 'meaning', s: 'The towels are wet.', ask: 'Сколько полотенец?', o: ['несколько', 'одно'], a: 0, why: 'Towels (с -s) и are → несколько.' },
      { t: 'type', s: 'I ___ from Russia.', ru: 'Я из России.', a: ['am'], why: 'С I — am.' },
      { t: 'type', s: 'They ___ at the beach.', ru: 'Они на пляже.', a: ['are'], why: 'They → are.' },
      { t: 'type', s: 'The room ___ clean.', ru: 'Номер чистый.', a: ['is'], why: 'Room — один → is.' },
      { t: 'build', ru: 'Я готова.', a: 'I am ready.', extra: 'is' },
      { t: 'build', ru: 'Море тёплое.', a: 'The sea is warm.', extra: 'are' },
      { t: 'build', ru: 'Мы друзья.', a: 'We are friends.', extra: 'is' },
    ] });

  add({ id: 'be2', title: "isn't / Are you…?", sub: '«Не» и вопросы с am / is / are', icon: '❓',
    theory: [
      { h: 'Отрицание', p: 'Ставим not после am / is / are. В речи — коротко.', table: [['I am not', "I'm not", ''], ['is not', "isn't", ''], ['are not', "aren't", '']],
        ex: [["I'm not hungry.", 'Я не голодна.'], ["It isn't expensive.", 'Это не дорого.'], ["We aren't tired.", 'Мы не устали.']] },
      { h: 'Вопрос — меняем местами', p: 'You are ready → Are you ready? Глагол встаёт в начало. Интонация вверх.',
        ex: [['Are you ready?', 'Ты готова?'], ['Is the room clean?', 'Номер чистый?'], ['Is it far?', 'Это далеко?']] },
      { h: 'Короткие ответы', p: 'Отвечаем тем же глаголом: Yes, I am. / No, it isn\'t. Просто «Yes» тоже можно, но так звучит естественнее.',
        ex: [['— Are you from Russia? — Yes, I am.', '— Ты из России? — Да.'], ["— Is it cold? — No, it isn't.", '— Холодно? — Нет.']] },
    ],
    items: [
      { t: 'meaning', s: 'Is the beach far?', ask: 'Это…', o: ['вопрос', 'утверждение'], a: 0, why: 'Is стоит в начале — это вопрос.' },
      { t: 'meaning', s: "The water isn't cold.", ask: 'Вода холодная?', o: ['нет', 'да'], a: 0, why: "Isn't = is not — «не»." },
      { t: 'meaning', s: 'Are they at home?', ask: 'Что спрашивают?', o: ['они дома?', 'он дома?'], a: 0, why: 'Are … they — про «они».' },
      { t: 'choose', s: '___ you ready?', ru: 'Ты готова?', o: ['Are', 'Is', 'Am'], a: 'Are', why: 'You → are; в вопросе are идёт в начало.' },
      { t: 'choose', s: '___ it expensive?', ru: 'Это дорого?', o: ['Is', 'Are', 'Am'], a: 'Is', why: 'It → is.' },
      { t: 'choose', s: 'I ___ hungry.', ru: 'Я не голодна.', o: ['am not', "isn't", 'not'], a: 'am not', why: "С I — am not (I'm not). «I isn't» не бывает." },
      { t: 'choose', s: 'We ___ tired.', ru: 'Мы не устали.', o: ["aren't", "isn't", 'not'], a: "aren't", why: "We → are → aren't." },
      { t: 'choose', s: 'She ___ at home.', ru: 'Её нет дома.', o: ["isn't", "aren't", 'not'], a: "isn't", why: "She → is → isn't." },
      { t: 'choose', s: '— Is the room clean? — Yes, it ___.', o: ['is', 'are', "isn't"], a: 'is', why: 'Короткий ответ тем же глаголом: Yes, it is.' },
      { t: 'choose', s: '— Are you from Russia? — Yes, I ___.', o: ['am', 'are', 'is'], a: 'am', why: 'Отвечаем о себе → I am.' },
      { t: 'type', s: '___ she your friend?', ru: 'Она твоя подруга?', a: ['Is'], why: 'She → is, в начало.' },
      { t: 'type', s: 'It ___ my phone.', ru: 'Это не мой телефон.', a: ["isn't", 'is not'], why: "It → is not = isn't." },
      { t: 'build', ru: 'Ты готова?', a: 'Are you ready?', extra: 'Is' },
      { t: 'build', ru: 'Это не дорого.', a: "It isn't expensive.", extra: "aren't" },
      { t: 'build', ru: 'Номер чистый?', a: 'Is the room clean?', extra: 'Are' },
    ] });

  add({ id: 'a', title: 'a / an и много: -s', sub: 'a towel, an apple, two towels', icon: '🔢',
    theory: [
      { h: 'a / an — «один, какой-то»', p: 'Перед одним предметом обычно ставят a: a towel, a car. По-русски такого слова нет — поэтому его легко забыть.',
        ex: [['I have a car.', 'У меня есть машина.'], ['She is a teacher.', 'Она учитель.']] },
      { h: 'an — перед гласным звуком', p: 'Если слово начинается с гласного звука, говорим an — так проще произнести: an apple, an umbrella, an hour (h не читается!).',
        ex: [['an apple', 'яблоко'], ['an hour', 'час']] },
      { h: 'Много — добавляем -s', p: 'one towel → two towels. После s, sh, ch, x → -es: bus → buses, beach → beaches. Запомнить: man → men, woman → women, child → children, person → people.',
        table: [['towel', 'towels', ''], ['beach', 'beaches', ''], ['child', 'children', ''], ['person', 'people', '']] },
    ],
    items: [
      { t: 'meaning', s: 'I see the waves.', ask: 'Сколько волн?', o: ['несколько', 'одна'], a: 0, why: 'Waves с -s → много.' },
      { t: 'meaning', s: 'She has a dog.', ask: 'Сколько собак?', o: ['одна', 'много'], a: 0, why: 'a dog → одна.' },
      { t: 'choose', s: 'I have ___ car.', ru: 'У меня есть машина.', o: ['a', 'an'], a: 'a', why: 'Car начинается с согласного звука → a.' },
      { t: 'choose', s: "It's ___ apple.", ru: 'Это яблоко.', o: ['an', 'a'], a: 'an', why: 'Apple начинается с гласного → an.' },
      { t: 'choose', s: 'I need ___ umbrella.', ru: 'Мне нужен зонт.', o: ['an', 'a'], a: 'an', why: 'Umbrella — гласный звук → an.' },
      { t: 'choose', s: 'It takes ___ hour.', ru: 'Это занимает час.', o: ['an', 'a'], a: 'an', why: 'В hour буква h не читается, звук гласный → an.' },
      { t: 'choose', s: 'two ___', ru: 'два полотенца', o: ['towels', 'towel'], a: 'towels', why: 'Много → -s.' },
      { t: 'choose', s: 'three ___', ru: 'три пляжа', o: ['beaches', 'beachs', 'beach'], a: 'beaches', why: 'После ch → -es.' },
      { t: 'choose', s: 'two ___', ru: 'двое детей', o: ['children', 'childs', 'child'], a: 'children', why: 'Исключение: child → children.' },
      { t: 'choose', s: 'many ___', ru: 'много людей', o: ['people', 'persons', 'peoples'], a: 'people', why: 'Люди — people.' },
      { t: 'type', s: 'I have two ___. (key)', ru: 'У меня два ключа.', a: ['keys'], why: 'key → keys.' },
      { t: 'type', s: 'I see three ___. (bus)', ru: 'Я вижу три автобуса.', a: ['buses'], why: 'После s → -es: buses.' },
      { t: 'build', ru: 'Это полотенце.', a: 'It is a towel.', extra: 'an' },
      { t: 'build', ru: 'У меня есть билет.', a: 'I have a ticket.', extra: 'an' },
    ] });

  add({ id: 'ps1', title: 'Present Simple: I work', sub: 'Что делаю обычно, регулярно', icon: '🔁',
    theory: [
      { h: 'Когда', p: 'Обычные, регулярные действия и факты: я работаю (вообще), мы плаваем каждый день, они живут на Бали.',
        ex: [['I work in a cafe.', 'Я работаю в кафе.'], ['We swim every day.', 'Мы плаваем каждый день.'], ['They live in Bali.', 'Они живут на Бали.']] },
      { h: 'Как', p: 'С I, you, we, they — глагол в начальной форме, без to и без изменений.' },
      { h: 'Частая ошибка', p: '«I am work» — неправильно. Либо am (I am tired — состояние), либо действие (I work). Вместе — нельзя.' },
      { h: 'Слова-подсказки', p: 'every day — каждый день, usually — обычно, often — часто, always — всегда, on Mondays — по понедельникам.' },
    ],
    items: [
      { t: 'meaning', s: 'We surf every day.', ask: 'Как часто?', o: ['каждый день', 'только сейчас'], a: 0, why: 'every day → регулярно → Present Simple.' },
      { t: 'meaning', s: 'I live in Moscow.', ask: 'Это…', o: ['постоянно, вообще', 'один раз, вчера'], a: 0, why: 'Present Simple — постоянное, обычное.' },
      { t: 'choose', s: 'I ___ in a cafe.', ru: 'Я работаю в кафе.', o: ['work', 'am work', 'works'], a: 'work', why: 'С I — просто work. «am work» — ошибка.' },
      { t: 'choose', s: 'We ___ every morning.', ru: 'Мы плаваем каждое утро.', o: ['swim', 'swims', 'are swim'], a: 'swim', why: 'We → swim без изменений.' },
      { t: 'choose', s: 'They ___ English.', ru: 'Они говорят по-английски.', o: ['speak', 'speaks', 'are speak'], a: 'speak', why: 'They → speak.' },
      { t: 'choose', s: 'I usually ___ coffee.', ru: 'Я обычно пью кофе.', o: ['drink', 'drinks', 'am drink'], a: 'drink', why: 'I → drink.' },
      { t: 'type', s: 'I ___ the beach. (like)', ru: 'Я люблю пляж.', a: ['like'], why: 'I → like.' },
      { t: 'type', s: 'You ___ fast. (speak)', ru: 'Ты говоришь быстро.', a: ['speak'], why: 'You → speak.' },
      { t: 'build', ru: 'Я живу на Бали.', a: 'I live in Bali.', extra: 'am' },
      { t: 'build', ru: 'Мы плаваем каждый день.', a: 'We swim every day.', extra: 'are' },
    ],
    gen: (verbs) => verbs.slice(0, 3).map(v => ({ t: 'choose', s: 'I ___ every day.', ru: v.en + ' — ' + v.ru, o: C.shuffle([v.en, s3(v.en), 'am ' + v.en]), a: v.en, why: 'С I — начальная форма без am.', mine: true })) });

  add({ id: 'ps2', title: 'Present Simple: she works', sub: 'He, she, it → глагол + s', icon: '➕',
    theory: [
      { h: 'Правило', p: 'Когда говорим про одного человека или предмет (he, she, it, my friend, the hotel), к глаголу добавляем -s.',
        ex: [['She works in a hotel.', 'Она работает в отеле.'], ['He swims every day.', 'Он плавает каждый день.'], ['It costs 10 dollars.', 'Это стоит 10 долларов.']] },
      { h: 'Как пишется', table: [['work', 'works', 'обычно +s'], ['watch, go, do', 'watches, goes, does', 'после s, sh, ch, x, o → +es'], ['study', 'studies', 'согласная + y → ies'], ['have', 'has', 'запомнить']] },
      { h: 'Сравните', p: 'I work — she works. We swim — he swims. Окончание -s слышно, поэтому его важно произносить.' },
    ],
    items: [
      { t: 'meaning', s: 'He swims every morning.', ask: 'Кто плавает?', o: ['один человек — он', 'несколько людей'], a: 0, why: 'He + swims (-s) → один.' },
      { t: 'meaning', s: 'The teacher speaks slowly.', ask: 'Сколько учителей?', o: ['один', 'несколько'], a: 0, why: 'speaks с -s → про одного.' },
      { t: 'choose', s: 'She ___ in a hotel.', ru: 'Она работает в отеле.', o: ['works', 'work', 'is work'], a: 'works', why: 'She → works (+s).' },
      { t: 'choose', s: 'He ___ every day.', ru: 'Он сёрфит каждый день.', o: ['surfs', 'surf', 'is surf'], a: 'surfs', why: 'He → surfs.' },
      { t: 'choose', s: 'It ___ 20 dollars.', ru: 'Это стоит 20 долларов.', o: ['costs', 'cost', 'is cost'], a: 'costs', why: 'It → costs.' },
      { t: 'choose', s: 'She ___ two dogs.', ru: 'У неё две собаки.', o: ['has', 'have', 'haves'], a: 'has', why: 'have → has (исключение).' },
      { t: 'choose', s: 'He ___ to the gym.', ru: 'Он ходит в спортзал.', o: ['goes', 'gos', 'go'], a: 'goes', why: 'go → goes (после o → +es).' },
      { t: 'type', s: 'She ___ TV. (watch)', ru: 'Она смотрит телевизор.', a: ['watches'], why: 'После ch → +es: watches.' },
      { t: 'type', s: 'He ___ English. (study)', ru: 'Он учит английский.', a: ['studies'], why: 'study → studies (y → ies).' },
      { t: 'type', s: 'My sister ___ in Moscow. (live)', ru: 'Моя сестра живёт в Москве.', a: ['lives'], why: 'My sister = she → lives.' },
      { t: 'build', ru: 'Она работает в кафе.', a: 'She works in a cafe.', extra: 'work' },
      { t: 'build', ru: 'Это стоит 10 долларов.', a: 'It costs 10 dollars.', extra: 'cost' },
    ],
    gen: (verbs) => verbs.slice(0, 3).map(v => ({ t: 'type', s: 'She ___ every day. (' + v.en + ')', ru: v.ru, a: [s3(v.en)], why: 'She → ' + s3(v.en) + '.', mine: true })) });

  add({ id: 'do', title: "do / does: вопросы и «не»", sub: "Do you…? She doesn't…", icon: '🙋',
    theory: [
      { h: 'Помощник do', p: 'В Present Simple «не» и вопросы строятся с помощником do (или does для he / she / it).',
        table: [['I / you / we / they', "don't swim", 'Do you swim?'], ['he / she / it', "doesn't swim", 'Does she swim?']] },
      { h: 'Важно', p: "После does и doesn't глагол без -s: -s «переходит» в does. She works → Does she work? She doesn't work.",
        ex: [["I don't understand.", 'Я не понимаю.'], ['Do you speak English?', 'Вы говорите по-английски?'], ['Does it have Wi-Fi?', 'Там есть Wi-Fi?'], ["She doesn't eat meat.", 'Она не ест мясо.']] },
      { h: 'Короткие ответы', p: "Yes, I do. / No, I don't. Yes, she does. / No, she doesn't." },
    ],
    items: [
      { t: 'meaning', s: 'Does the room have a balcony?', ask: 'Это…', o: ['вопрос', 'утверждение'], a: 0, why: 'Does в начале → вопрос.' },
      { t: 'meaning', s: "She doesn't speak English.", ask: 'Она говорит по-английски?', o: ['нет', 'да'], a: 0, why: "doesn't = does not — «не»." },
      { t: 'choose', s: 'I ___ like spicy food.', ru: 'Я не люблю острую еду.', o: ["don't", "doesn't", 'not'], a: "don't", why: "I → don't." },
      { t: 'choose', s: 'She ___ eat meat.', ru: 'Она не ест мясо.', o: ["doesn't", "don't", "isn't"], a: "doesn't", why: "She → doesn't." },
      { t: 'choose', s: '___ you speak English?', ru: 'Вы говорите по-английски?', o: ['Do', 'Does', 'Are'], a: 'Do', why: 'You → Do.' },
      { t: 'choose', s: '___ he work here?', ru: 'Он здесь работает?', o: ['Does', 'Do', 'Is'], a: 'Does', why: 'He → Does.' },
      { t: 'choose', s: 'Does she ___ coffee?', ru: 'Она пьёт кофе?', o: ['drink', 'drinks'], a: 'drink', why: 'После does — без -s.' },
      { t: 'choose', s: "He doesn't ___ in Bali.", ru: 'Он не живёт на Бали.', o: ['live', 'lives'], a: 'live', why: "После doesn't — без -s." },
      { t: 'choose', s: '— Do you surf? — Yes, I ___.', o: ['do', 'am', 'does'], a: 'do', why: 'На Do you…? отвечаем Yes, I do.' },
      { t: 'type', s: '___ you like the beach?', ru: 'Тебе нравится пляж?', a: ['Do'], why: 'You → Do.' },
      { t: 'type', s: 'He ___ smoke.', ru: 'Он не курит.', a: ["doesn't", 'does not'], why: "He → doesn't." },
      { t: 'build', ru: 'Ты говоришь по-английски?', a: 'Do you speak English?', extra: 'Are' },
      { t: 'build', ru: 'Я не понимаю.', a: "I don't understand.", extra: "doesn't" },
      { t: 'build', ru: 'Сколько это стоит?', a: 'How much does it cost?', extra: 'costs' },
    ],
    gen: (verbs) => verbs.slice(0, 2).map(v => ({ t: 'choose', s: "She doesn't ___.", ru: v.en + ' — ' + v.ru, o: C.shuffle([v.en, s3(v.en)]), a: v.en, why: "После doesn't — глагол без -s.", mine: true })) });

  add({ id: 'there', title: 'there is / there are', sub: 'Есть, имеется: про жильё и места', icon: '🏠',
    theory: [
      { h: 'Когда', p: 'Чтобы сказать «есть, имеется где-то»: в доме есть бассейн, рядом есть кафе. Очень нужно при аренде жилья!',
        table: [['один', 'There is a pool.', "There's a pool."], ['много', 'There are two bedrooms.', '']] },
      { h: 'Вопрос и «не»', p: 'Is there…? Are there…? There isn\'t… / There aren\'t any…',
        ex: [['Is there a pharmacy near here?', 'Здесь рядом есть аптека?'], ['Are there towels in the room?', 'В номере есть полотенца?'], ["There isn't hot water.", 'Нет горячей воды.']] },
      { h: 'Сравните с русским', p: 'По-русски главное — в конце («В номере есть кондиционер»). По-английски начинаем с There is: There is an air conditioner in the room.' },
    ],
    items: [
      { t: 'meaning', s: 'There are three cafes on the street.', ask: 'Сколько кафе?', o: ['несколько', 'одно'], a: 0, why: 'There are → много.' },
      { t: 'meaning', s: 'Is there a fridge?', ask: 'Что спрашивают?', o: ['есть ли холодильник', 'где холодильник'], a: 0, why: 'Is there…? — есть ли.' },
      { t: 'choose', s: '___ a pool near the villa.', ru: 'Рядом с виллой есть бассейн.', o: ['There is', 'There are'], a: 'There is', why: 'Pool — один → There is.' },
      { t: 'choose', s: '___ two bedrooms.', ru: 'Здесь две спальни.', o: ['There are', 'There is'], a: 'There are', why: 'Две → There are.' },
      { t: 'choose', s: '___ a pharmacy here?', ru: 'Здесь есть аптека?', o: ['Is there', 'Are there'], a: 'Is there', why: 'Одна аптека → Is there.' },
      { t: 'choose', s: '___ any towels?', ru: 'Есть полотенца?', o: ['Are there', 'Is there'], a: 'Are there', why: 'Towels — много → Are there.' },
      { t: 'choose', s: 'There ___ a lot of people.', ru: 'Там много людей.', o: ['are', 'is'], a: 'are', why: 'People — много → are.' },
      { t: 'type', s: 'There ___ a problem with the shower.', ru: 'Проблема с душем.', a: ['is'], why: 'Одна проблема → is.' },
      { t: 'type', s: 'There ___ two beds.', ru: 'Тут две кровати.', a: ['are'], why: 'Две → are.' },
      { t: 'build', ru: 'Здесь есть аптека?', a: 'Is there a pharmacy here?', extra: 'Are' },
      { t: 'build', ru: 'Там много людей.', a: 'There are many people.', extra: 'is' },
      { t: 'build', ru: 'В номере есть кондиционер.', a: 'There is an air conditioner in the room.', extra: 'are' },
    ] });

  add({ id: 'can', title: "can / can't", sub: 'Умею, могу, можно', icon: '💪',
    theory: [
      { h: 'Когда', p: 'can — «могу, умею, можно». Очень нужное слово: просить, спрашивать разрешения, говорить о навыках.',
        ex: [['I can swim.', 'Я умею плавать.'], ["I can't surf.", 'Я не умею сёрфить.'], ['Can I pay by card?', 'Можно оплатить картой?'], ['Can you help me?', 'Вы можете мне помочь?']] },
      { h: 'Проще некуда', p: 'Форма одна для всех: I can, she can, they can — без -s! После can глагол в начальной форме, без to: can swim (не «can to swim», не «can swims»).',
        table: [['+', 'She can swim.', ''], ['−', "She can't swim.", "can't = cannot"], ['?', 'Can she swim?', "Yes, she can. / No, she can't."]] },
      { h: 'Вежливая просьба', p: 'Can I…? — «Можно мне…?» Can you…? — «Не могли бы вы…?» Добавьте please — и это идеальная вежливая фраза.' },
    ],
    items: [
      { t: 'meaning', s: "She can't swim.", ask: 'Она умеет плавать?', o: ['нет', 'да'], a: 0, why: "can't = не может / не умеет." },
      { t: 'meaning', s: 'Can I have the bill, please?', ask: 'Что делает человек?', o: ['просит счёт', 'платит по счёту'], a: 0, why: 'Can I have…? — «Можно мне…?» — вежливая просьба.' },
      { t: 'choose', s: 'She ___ surf.', ru: 'Она умеет сёрфить.', o: ['can', 'cans', 'can to'], a: 'can', why: 'can одинаковый для всех, без -s и без to.' },
      { t: 'choose', s: 'I can ___ English.', ru: 'Я могу говорить по-английски.', o: ['speak', 'speaks', 'to speak'], a: 'speak', why: 'После can — начальная форма без to.' },
      { t: 'choose', s: '___ I pay by card?', ru: 'Можно оплатить картой?', o: ['Can', 'Do', 'Am'], a: 'Can', why: 'Просим разрешения: Can I…?' },
      { t: 'choose', s: 'He ___ drive. He has no licence.', ru: 'Он не умеет водить.', o: ["can't", "doesn't can", 'not can'], a: "can't", why: "Отрицание — can't. «doesn't can» не бывает." },
      { t: 'choose', s: '— Can you swim? — Yes, I ___.', o: ['can', 'do', 'am'], a: 'can', why: 'Отвечаем тем же словом: Yes, I can.' },
      { t: 'choose', s: '___ you help me, please?', ru: 'Вы можете мне помочь?', o: ['Can', 'Are', 'Does'], a: 'Can', why: 'Просьба: Can you…?' },
      { t: 'type', s: 'I ___ understand. Can you repeat?', ru: 'Я не понимаю. Повторите?', a: ["can't", 'cannot'], why: "«Не могу» — can't." },
      { t: 'type', s: '___ I open the window?', ru: 'Можно открыть окно?', a: ['Can'], why: 'Can I…? — можно мне?' },
      { t: 'build', ru: 'Можно мне воды?', a: 'Can I have some water?', extra: 'do' },
      { t: 'build', ru: 'Я не умею сёрфить.', a: "I can't surf.", extra: "don't" },
      { t: 'build', ru: 'Вы можете мне помочь?', a: 'Can you help me?', extra: 'to' },
    ],
    gen: (verbs) => verbs.slice(0, 2).map(v => ({ t: 'choose', s: 'She can ___.', ru: v.en + ' — ' + v.ru, o: C.shuffle([v.en, s3(v.en), 'to ' + v.en]), a: v.en, why: 'После can — начальная форма: без -s и без to.', mine: true })) });

  add({ id: 'was', title: 'was / were', sub: 'Был, была, были: прошлое от am / is / are', icon: '⏪',
    theory: [
      { h: 'Прошлое глагола «быть»', p: 'am и is в прошлом → was. are в прошлом → were. По-русски «Вчера было жарко» — по-английски тоже нужен глагол: It was hot yesterday.',
        table: [['I / he / she / it', 'was', 'I was tired.'], ['you / we / they', 'were', 'We were at the beach.']],
        ex: [['I was tired yesterday.', 'Вчера я была уставшая.'], ['The waves were big.', 'Волны были большие.'], ['It was a great day.', 'Это был отличный день.']] },
      { h: '«Не» и вопросы', p: "Как с am / is / are: wasn't, weren't. Вопрос — меняем местами: Was it…? Were you…?",
        ex: [["It wasn't expensive.", 'Это было не дорого.'], ['Were you at home?', 'Ты была дома?'], ['— Was it good? — Yes, it was.', '— Было хорошо? — Да.']] },
      { h: 'Слова-подсказки', p: 'yesterday — вчера, last week — на прошлой неделе, last year — в прошлом году, ago — назад (two days ago).' },
    ],
    items: [
      { t: 'meaning', s: 'I was in Bali.', ask: 'Когда?', o: ['в прошлом', 'сейчас'], a: 0, why: 'was — прошлое от am / is.' },
      { t: 'meaning', s: 'They were tired.', ask: 'О ком речь?', o: ['о нескольких людях', 'об одном человеке'], a: 0, why: 'were — для they / we / you.' },
      { t: 'choose', s: 'I ___ tired yesterday.', ru: 'Вчера я была уставшая.', o: ['was', 'were', 'am'], a: 'was', why: 'I в прошлом → was.' },
      { t: 'choose', s: 'We ___ at the beach.', ru: 'Мы были на пляже.', o: ['were', 'was', 'are'], a: 'were', why: 'We в прошлом → were.' },
      { t: 'choose', s: 'It ___ hot last week.', ru: 'На прошлой неделе было жарко.', o: ['was', 'were', 'is'], a: 'was', why: 'It + last week → was.' },
      { t: 'choose', s: 'The waves ___ big yesterday.', ru: 'Вчера волны были большие.', o: ['were', 'was', 'are'], a: 'were', why: 'Waves — много, прошлое → were.' },
      { t: 'choose', s: '___ you at home?', ru: 'Ты была дома?', o: ['Were', 'Was', 'Are'], a: 'Were', why: 'You → were (даже про одного человека).' },
      { t: 'choose', s: "It ___ expensive.", ru: 'Это было не дорого.', o: ["wasn't", "weren't", "isn't"], a: "wasn't", why: "It → wasn't." },
      { t: 'choose', s: '— Was it good? — Yes, it ___.', o: ['was', 'is', 'were'], a: 'was', why: 'Короткий ответ: Yes, it was.' },
      { t: 'type', s: 'She ___ my teacher.', ru: 'Она была моей учительницей.', a: ['was'], why: 'She → was.' },
      { t: 'type', s: 'They ___ at the party.', ru: 'Их не было на вечеринке.', a: ["weren't", 'were not'], why: "They → were not = weren't." },
      { t: 'build', ru: 'Вчера было жарко.', a: 'It was hot yesterday.', extra: 'were' },
      { t: 'build', ru: 'Мы были на пляже.', a: 'We were at the beach.', extra: 'was' },
      { t: 'build', ru: 'Ты была дома?', a: 'Were you at home?', extra: 'Was' },
    ] });

  add({ id: 'pron', title: 'my / your / his + \'s', sub: 'Чей? Мой, твой, его, её; телефон Анны', icon: '👤',
    theory: [
      { h: 'Чей?', p: 'По-русски часто говорим «свой». По-английски всегда говорим, чей именно: она любит свою собаку → She loves her dog.',
        table: [['I → my', 'мой', 'my phone'], ['you → your', 'твой, ваш', 'your name'], ['he → his', 'его', 'his towel'], ['she → her', 'её', 'her board'], ['we → our', 'наш', 'our villa'], ['they → their', 'их', 'their car']] },
      { h: "'s — чей-то по имени", p: "Anna's phone — телефон Анны. My friend's car — машина моего друга. Просто добавляем 's к тому, кому принадлежит.",
        ex: [["This is Anna's phone.", 'Это телефон Анны.'], ['What is your name?', 'Как тебя зовут?'], ['He forgot his towel.', 'Он забыл своё полотенце.']] },
    ],
    items: [
      { t: 'meaning', s: 'This is her board.', ask: 'Чья доска?', o: ['её', 'его'], a: 0, why: 'her — её, his — его.' },
      { t: 'meaning', s: "Jane's dog is small.", ask: 'Что это значит?', o: ['собака Джейн маленькая', 'Джейн маленькая'], a: 0, why: "Jane's — «принадлежит Джейн»." },
      { t: 'choose', s: 'This is ___ phone.', ru: 'Это мой телефон.', o: ['my', 'me', 'I'], a: 'my', why: 'Мой — my.' },
      { t: 'choose', s: 'She loves ___ dog.', ru: 'Она любит свою собаку.', o: ['her', 'his', 'she'], a: 'her', why: 'Собака принадлежит ей → her.' },
      { t: 'choose', s: 'He forgot ___ towel.', ru: 'Он забыл своё полотенце.', o: ['his', 'her', 'him'], a: 'his', why: 'Полотенце его → his.' },
      { t: 'choose', s: 'What is ___ name?', ru: 'Как тебя зовут?', o: ['your', 'you', 'yours'], a: 'your', why: 'Дословно: «Какое твоё имя?» → your.' },
      { t: 'choose', s: 'We love ___ villa.', ru: 'Нам нравится наша вилла.', o: ['our', 'we', 'us'], a: 'our', why: 'Наш — our.' },
      { t: 'choose', s: 'This is ___ car.', ru: 'Это машина Анны.', o: ["Anna's", 'Anna', 'Annas'], a: "Anna's", why: "Чья-то по имени → 's: Anna's." },
      { t: 'type', s: '___ name is Jane.', ru: 'Меня зовут Джейн.', a: ['My'], why: 'Дословно: «Моё имя — Джейн».' },
      { t: 'type', s: 'They like ___ teacher.', ru: 'Им нравится их учитель.', a: ['their'], why: 'Их — their.' },
      { t: 'build', ru: 'Это наш дом.', a: 'This is our house.', extra: 'we' },
      { t: 'build', ru: 'Как тебя зовут?', a: 'What is your name?', extra: 'you' },
      { t: 'build', ru: 'Это телефон моего друга.', a: "It is my friend's phone.", extra: 'me' },
    ] });

  add({ id: 'imp', title: "Turn left! Don't worry!", sub: 'Просьбы, инструкции и «давай»', icon: '👉',
    theory: [
      { h: 'Просьба или инструкция', p: 'Просто глагол в начале: Turn left. Wait here. Stand up! Так говорят инструкторы, таксисты, на ресепшене. Вежливо — добавьте please.',
        ex: [['Turn left at the bank.', 'Поверните налево у банка.'], ['Please wait here.', 'Подождите здесь, пожалуйста.'], ['Stand up on the board!', 'Вставай на доску!']] },
      { h: '«Не делай» и «давай»', p: "Не делай — Don't + глагол: Don't worry. Don't touch. Давай(те) — Let's + глагол: Let's go!",
        ex: [["Don't worry!", 'Не волнуйся!'], ["Don't swim here.", 'Здесь не плавайте.'], ["Let's go to the beach.", 'Пойдём на пляж.']] },
    ],
    items: [
      { t: 'meaning', s: "Don't swim here!", ask: 'Здесь можно плавать?', o: ['нет', 'да'], a: 0, why: "Don't + глагол — запрет." },
      { t: 'meaning', s: "Let's go to the beach.", ask: 'Это…', o: ['предложение пойти вместе', 'рассказ, что уже сходили'], a: 0, why: "Let's — «давай(те)»." },
      { t: 'choose', s: '___ left at the bank.', ru: 'Поверните налево у банка.', o: ['Turn', 'Turns', 'To turn'], a: 'Turn', why: 'Инструкция — глагол в начальной форме в начале фразы.' },
      { t: 'choose', s: '___ worry!', ru: 'Не волнуйся!', o: ["Don't", 'Not', "Doesn't"], a: "Don't", why: "«Не делай» — всегда Don't." },
      { t: 'choose', s: '___ go!', ru: 'Пойдём!', o: ["Let's", 'Lets', 'Let'], a: "Let's", why: "Давай — Let's (с апострофом)." },
      { t: 'choose', s: 'Please ___ here.', ru: 'Подождите здесь, пожалуйста.', o: ['wait', 'waits', 'waiting'], a: 'wait', why: 'Просьба — начальная форма: wait.' },
      { t: 'choose', s: "Don't ___ the board.", ru: 'Не трогай доску.', o: ['touch', 'touches', 'to touch'], a: 'touch', why: "После Don't — начальная форма." },
      { t: 'type', s: '___ up! Now paddle!', ru: 'Вставай! Теперь греби!', a: ['Stand'], why: 'Глагол в начале: Stand up!' },
      { t: 'type', s: '___ be late!', ru: 'Не опаздывай!', a: ["Don't", 'Do not'], why: "«Не» в просьбе — Don't." },
      { t: 'build', ru: 'Поверните направо.', a: 'Turn right.', extra: 'Turns' },
      { t: 'build', ru: 'Не волнуйся!', a: "Don't worry.", extra: 'Not' },
      { t: 'build', ru: 'Говорите медленно, пожалуйста.', a: 'Please speak slowly.', extra: 'speaks' },
      { t: 'build', ru: 'Давай пойдём на пляж.', a: "Let's go to the beach.", extra: 'Lets' },
    ] });

  add({ id: 'prep', title: 'in / on / at', sub: 'Где и когда: in Bali, on Monday, at 5', icon: '📍',
    theory: [
      { h: 'Место', table: [['in', 'внутри, в стране, городе, воде', 'in the room, in Bali, in the sea'], ['on', 'на поверхности', 'on the table, on the board, on the beach'], ['at', 'в точке, у, на месте', 'at home, at work, at the airport']],
        p: 'Внимание: по-русски «на Бали», а по-английски in Bali (остров, город, страна → in).' },
      { h: 'Время', table: [['at', 'точное время', 'at 5 o\'clock, at night'], ['on', 'дни и даты', 'on Monday, on May 5'], ['in', 'месяцы, годы, части дня', 'in May, in 2026, in the morning']],
        ex: [['See you at 5.', 'Увидимся в 5.'], ['The lesson is on Monday.', 'Урок в понедельник.'], ['I surf in the morning.', 'Я сёрфлю по утрам.']] },
    ],
    items: [
      { t: 'meaning', s: 'The keys are on the table.', ask: 'Где ключи?', o: ['на столе', 'в столе'], a: 0, why: 'on — на поверхности.' },
      { t: 'meaning', s: 'See you at 6.', ask: 'Когда встреча?', o: ['в 6 часов', 'через 6 дней'], a: 0, why: 'at + время — точное время.' },
      { t: 'choose', s: 'I live ___ Bali.', ru: 'Я живу на Бали.', o: ['in', 'on', 'at'], a: 'in', why: 'Остров, страна, город → in (хотя по-русски «на Бали»).' },
      { t: 'choose', s: 'The phone is ___ the table.', ru: 'Телефон на столе.', o: ['on', 'in', 'at'], a: 'on', why: 'На поверхности → on.' },
      { t: 'choose', s: 'She is ___ home.', ru: 'Она дома.', o: ['at', 'in', 'on'], a: 'at', why: 'at home — так говорят всегда.' },
      { t: 'choose', s: 'We swim ___ the sea.', ru: 'Мы плаваем в море.', o: ['in', 'on', 'at'], a: 'in', why: 'В воде → in.' },
      { t: 'choose', s: 'The lesson is ___ 9 o\'clock.', ru: 'Урок в 9 часов.', o: ['at', 'in', 'on'], a: 'at', why: 'Точное время → at.' },
      { t: 'choose', s: 'See you ___ Monday.', ru: 'Увидимся в понедельник.', o: ['on', 'in', 'at'], a: 'on', why: 'Дни недели → on.' },
      { t: 'choose', s: 'My birthday is ___ May.', ru: 'Мой день рождения в мае.', o: ['in', 'on', 'at'], a: 'in', why: 'Месяцы → in.' },
      { t: 'choose', s: 'I go to the gym ___ the morning.', ru: 'Я хожу в спортзал утром.', o: ['in', 'on', 'at'], a: 'in', why: 'in the morning / in the evening.' },
      { t: 'type', s: 'Meet me ___ the airport.', ru: 'Встреть меня в аэропорту.', a: ['at'], why: 'Место-точка (аэропорт, вокзал) → at.' },
      { t: 'type', s: 'I work ___ the evening.', ru: 'Я работаю вечером.', a: ['in'], why: 'in the evening.' },
      { t: 'build', ru: 'Я на работе.', a: 'I am at work.', extra: 'in' },
      { t: 'build', ru: 'Урок в понедельник.', a: 'The lesson is on Monday.', extra: 'in' },
      { t: 'build', ru: 'Увидимся в 5.', a: 'See you at 5.', extra: 'on' },
    ] });

  add({ id: 'cont', title: "Present Continuous: I'm working", sub: 'Что происходит прямо сейчас', icon: '▶️',
    theory: [
      { h: 'Сейчас, в этот момент', p: 'am / is / are + глагол с -ing. I am working — я (сейчас) работаю. Look! She is surfing!',
        ex: [["I'm waiting for a taxi.", 'Я жду такси.'], ['It is raining.', 'Идёт дождь.'], ['What are you doing?', 'Что ты делаешь?']] },
      { h: 'Сравните', p: 'I work every day — обычно (Present Simple). I am working now — прямо сейчас. Нужны обе части: и am / is / are, и -ing.' },
      { h: 'Как добавить -ing', table: [['work', 'working', 'обычно'], ['make', 'making', 'e на конце убираем'], ['swim, sit, run', 'swimming, sitting, running', 'короткие: удваиваем букву'], ['lie', 'lying', 'ie → y']] },
    ],
    items: [
      { t: 'meaning', s: 'She is swimming now.', ask: 'Когда?', o: ['прямо сейчас', 'каждый день'], a: 0, why: 'is + -ing → сейчас.' },
      { t: 'meaning', s: 'I work in a cafe.', ask: 'Это…', o: ['обычно, вообще', 'именно сейчас'], a: 0, why: 'Без am и -ing → Present Simple, обычное действие.' },
      { t: 'choose', s: 'I ___ now.', ru: 'Я сейчас работаю.', o: ['am working', 'working', 'work'], a: 'am working', why: 'Нужны обе части: am + working.' },
      { t: 'choose', s: 'They ___ in the sea.', ru: 'Они (сейчас) плавают в море.', o: ['are swimming', 'is swimming', 'swimming'], a: 'are swimming', why: 'They → are + swimming.' },
      { t: 'choose', s: 'She ___ a book.', ru: 'Она (сейчас) читает книгу.', o: ['is reading', 'are reading', 'reading'], a: 'is reading', why: 'She → is + reading.' },
      { t: 'choose', s: '___ you working?', ru: 'Ты (сейчас) работаешь?', o: ['Are', 'Do', 'Is'], a: 'Are', why: 'Вопрос: Are you + -ing?' },
      { t: 'choose', s: 'We ___ dinner now.', ru: 'Мы сейчас ужинаем.', o: ['are having', 'have', 'having'], a: 'are having', why: 'Сейчас → are having.' },
      { t: 'type', s: 'I am ___ breakfast. (make)', ru: 'Я готовлю завтрак.', a: ['making'], why: 'make → making: e убираем.' },
      { t: 'type', s: 'He is ___. (swim)', ru: 'Он плавает.', a: ['swimming'], why: 'swim → swimming: удваиваем m.' },
      { t: 'type', s: 'What are you ___? (do)', ru: 'Что ты делаешь?', a: ['doing'], why: 'do → doing.' },
      { t: 'build', ru: 'Я жду такси.', a: 'I am waiting for a taxi.', extra: 'wait' },
      { t: 'build', ru: 'Что ты делаешь?', a: 'What are you doing?', extra: 'do' },
      { t: 'build', ru: 'Идёт дождь.', a: 'It is raining.', extra: 'rains' },
    ],
    gen: (verbs) => verbs.slice(0, 2).map(v => ({ t: 'type', s: 'I am ___ now. (' + v.en + ')', ru: v.ru, a: [ing(v.en)], why: v.en + ' → ' + ing(v.en) + '.', mine: true })) });

  add({ id: 'past', title: 'Past Simple: worked, went', sub: 'Что было вчера, в прошлом', icon: '🕰️',
    theory: [
      { h: 'Когда', p: 'То, что было и закончилось: вчера, на прошлой неделе, в прошлом году. Форма одна для всех: I worked, she worked, they worked.' },
      { h: 'Правильные глаголы: +ed', table: [['work', 'worked', '+ed'], ['live', 'lived', 'на e → только d'], ['study', 'studied', 'согласная + y → ied'], ['stop', 'stopped', 'короткие: удваиваем букву']] },
      { h: 'Неправильные — 2-я форма', p: 'go → went, buy → bought, see → saw, swim → swam. Их тренирует раздел «Неправильные глаголы».',
        ex: [['I worked yesterday.', 'Вчера я работала.'], ['We went to the beach.', 'Мы ходили на пляж.'], ['She bought a new board.', 'Она купила новую доску.']] },
      { h: 'Слова-подсказки', p: 'yesterday — вчера, last week — на прошлой неделе, two days ago — два дня назад, in 2020.' },
    ],
    items: [
      { t: 'meaning', s: 'We swam in the sea.', ask: 'Когда?', o: ['в прошлом', 'сейчас'], a: 0, why: 'swam — прошедшая форма swim.' },
      { t: 'meaning', s: 'I visited my friend.', ask: 'Это…', o: ['уже было', 'будет завтра'], a: 0, why: '-ed → прошлое.' },
      { t: 'choose', s: 'Yesterday I ___ all day.', ru: 'Вчера я работала весь день.', o: ['worked', 'work', 'works'], a: 'worked', why: 'Прошлое: work → worked.' },
      { t: 'choose', s: 'She ___ in Moscow last year.', ru: 'В прошлом году она жила в Москве.', o: ['lived', 'liveed', 'lives'], a: 'lived', why: 'live заканчивается на e → добавляем только d.' },
      { t: 'choose', s: 'We ___ to Bali in May.', ru: 'Мы прилетели на Бали в мае.', o: ['flew', 'flied', 'fly'], a: 'flew', why: 'fly — неправильный: fly → flew.' },
      { t: 'choose', s: 'I ___ a new board.', ru: 'Я купила новую доску.', o: ['bought', 'buyed', 'buy'], a: 'bought', why: 'buy — неправильный: buy → bought.' },
      { t: 'choose', s: 'He ___ English last year.', ru: 'В прошлом году он учил английский.', o: ['studied', 'studyed', 'studies'], a: 'studied', why: 'study → studied (y → ied).' },
      { t: 'choose', s: 'They ___ a turtle.', ru: 'Они видели черепаху.', o: ['saw', 'seed', 'see'], a: 'saw', why: 'see — неправильный: see → saw.' },
      { t: 'choose', s: 'The taxi ___ near the hotel.', ru: 'Такси остановилось у отеля.', o: ['stopped', 'stoped', 'stops'], a: 'stopped', why: 'stop → stopped (удваиваем p).' },
      { t: 'type', s: 'I ___ to the gym yesterday. (go)', ru: 'Вчера я ходила в спортзал.', a: ['went'], why: 'go → went.' },
      { t: 'type', s: 'She ___ tennis. (play)', ru: 'Она играла в теннис.', a: ['played'], why: 'play → played.' },
      { t: 'type', s: 'We ___ fish for dinner. (eat)', ru: 'На ужин мы ели рыбу.', a: ['ate'], why: 'eat → ate.' },
      { t: 'build', ru: 'Вчера я плавала.', a: 'I swam yesterday.', extra: 'swim' },
      { t: 'build', ru: 'Мы смотрели фильм.', a: 'We watched a film.', extra: 'watch' },
      { t: 'build', ru: 'Она купила билет.', a: 'She bought a ticket.', extra: 'buyed' },
    ],
    gen: (verbs) => verbs.slice(0, 2).map(v => { const p = past(v.en); return { t: 'type', s: 'Yesterday I ___. (' + v.en + ')', ru: v.ru, a: p.split(' / '), why: v.en + ' → ' + p + '.', mine: true }; }) });

  add({ id: 'did', title: "did / didn't", sub: 'Вопросы и «не» в прошлом', icon: '↩️',
    theory: [
      { h: 'Помощник did', p: "Как do / does, только для прошлого — и одинаково для всех. Did you swim? I didn't swim.",
        table: [['?', 'Did you sleep well?', 'Yes, I did. / No, I didn\'t.'], ['−', "I didn't understand.", "didn't = did not"]] },
      { h: 'Главная ловушка', p: "После did и didn't — начальная форма глагола: Did you go? (не «Did you went?»). Прошедшее время уже «живёт» в did.",
        ex: [['Where did you go?', 'Куда ты ходила?'], ["We didn't buy tickets.", 'Мы не купили билеты.'], ['Did she call you?', 'Она тебе звонила?']] },
    ],
    items: [
      { t: 'meaning', s: 'Did you sleep well?', ask: 'Это вопрос…', o: ['о прошлом', 'о том, что сейчас'], a: 0, why: 'did → прошлое.' },
      { t: 'meaning', s: "I didn't buy a ticket.", ask: 'Билет купили?', o: ['нет', 'да'], a: 0, why: "didn't — «не» в прошлом." },
      { t: 'choose', s: '___ you sleep well?', ru: 'Ты хорошо спала?', o: ['Did', 'Do', 'Were'], a: 'Did', why: 'Вопрос о прошлом — Did.' },
      { t: 'choose', s: "I didn't ___ the answer.", ru: 'Я не знала ответа.', o: ['know', 'knew', 'knows'], a: 'know', why: "После didn't — начальная форма." },
      { t: 'choose', s: 'Did she ___ the keys?', ru: 'Она взяла ключи?', o: ['take', 'took', 'takes'], a: 'take', why: 'После did — начальная форма: take.' },
      { t: 'choose', s: 'We ___ go to the beach.', ru: 'Мы не ходили на пляж.', o: ["didn't", "don't", "wasn't"], a: "didn't", why: "Прошлое + «не» → didn't." },
      { t: 'choose', s: '— Did you like it? — Yes, I ___.', o: ['did', 'liked', 'was'], a: 'did', why: 'Короткий ответ: Yes, I did.' },
      { t: 'choose', s: 'Where ___ you go yesterday?', ru: 'Куда ты ходила вчера?', o: ['did', 'were', 'do'], a: 'did', why: 'Вопрос о прошлом с глаголом go → did.' },
      { t: 'type', s: '___ you see the sunset?', ru: 'Ты видела закат?', a: ['Did'], why: 'Вопрос о прошлом — Did.' },
      { t: 'type', s: 'He ___ call me.', ru: 'Он мне не позвонил.', a: ["didn't", 'did not'], why: "«Не» в прошлом — didn't." },
      { t: 'build', ru: 'Ты хорошо спала?', a: 'Did you sleep well?', extra: 'slept' },
      { t: 'build', ru: 'Я не поняла.', a: "I didn't understand.", extra: 'understood' },
      { t: 'build', ru: 'Куда вы ходили?', a: 'Where did you go?', extra: 'went' },
    ] });

  add({ id: 'some', title: 'some / any, how much / many', sub: 'Немного, нисколько, сколько?', icon: '🧺',
    theory: [
      { h: 'some и any', table: [['some', 'немного, несколько (+)', 'I have some water.'], ['any', 'в вопросах и с not', 'Do you have any towels? I don\'t have any cash.']],
        p: 'Просьба или предложение — some даже в вопросе: Can I have some water? Would you like some tea?' },
      { h: 'Сколько?', table: [['How many', 'штуки, можно посчитать', 'How many bedrooms?'], ['How much', 'нельзя посчитать и цена', 'How much water? How much is it?']],
        ex: [['How much is it?', 'Сколько это стоит?'], ['How many people?', 'Сколько человек?'], ['Would you like some tea?', 'Хотите чаю?']] },
    ],
    items: [
      { t: 'meaning', s: "I don't have any cash.", ask: 'Есть наличные?', o: ['нет', 'немного есть'], a: 0, why: "not … any — «нисколько»." },
      { t: 'meaning', s: 'How many bedrooms?', ask: 'Что спрашивают?', o: ['сколько спален', 'сколько стоит спальня'], a: 0, why: 'How many — сколько штук.' },
      { t: 'choose', s: 'I have ___ water.', ru: 'У меня есть немного воды.', o: ['some', 'any'], a: 'some', why: 'Утверждение → some.' },
      { t: 'choose', s: 'Do you have ___ towels?', ru: 'У вас есть полотенца?', o: ['any', 'some'], a: 'any', why: 'Вопрос → any.' },
      { t: 'choose', s: "We don't have ___ milk.", ru: 'У нас нет молока.', o: ['any', 'some'], a: 'any', why: 'С not → any.' },
      { t: 'choose', s: 'Can I have ___ coffee?', ru: 'Можно мне кофе?', o: ['some', 'any'], a: 'some', why: 'Просьба → some, даже в вопросе.' },
      { t: 'choose', s: '___ bedrooms are there?', ru: 'Сколько там спален?', o: ['How many', 'How much'], a: 'How many', why: 'Спальни считаются → How many.' },
      { t: 'choose', s: '___ is the room?', ru: 'Сколько стоит номер?', o: ['How much', 'How many'], a: 'How much', why: 'Цена → How much.' },
      { t: 'choose', s: '___ water do you drink?', ru: 'Сколько воды ты пьёшь?', o: ['How much', 'How many'], a: 'How much', why: 'Вода не считается штуками → How much.' },
      { t: 'type', s: "There aren't ___ chairs.", ru: 'Там нет стульев.', a: ['any'], why: 'С not → any.' },
      { t: 'type', s: 'How ___ people are in the group?', ru: 'Сколько человек в группе?', a: ['many'], why: 'Людей можно посчитать → many.' },
      { t: 'build', ru: 'Сколько это стоит?', a: 'How much is it?', extra: 'many' },
      { t: 'build', ru: 'Хотите чаю?', a: 'Would you like some tea?', extra: 'any' },
      { t: 'build', ru: 'У меня нет денег.', a: "I don't have any money.", extra: 'some' },
    ] });

  add({ id: 'going', title: 'going to: планы', sub: 'Я собираюсь, мы будем', icon: '🗓️',
    theory: [
      { h: 'Планы и намерения', p: "am / is / are + going to + глагол. I'm going to rent a villa — Я собираюсь снять виллу.",
        ex: [["I'm going to rent a flat.", 'Я собираюсь снять квартиру.'], ["We're going to learn English.", 'Мы будем учить английский.'], ['What are you going to do?', 'Что ты собираешься делать?']] },
      { h: 'Вопрос и «не»', p: "Как с am / is / are: Are you going to surf? I'm not going to swim. После to — начальная форма глагола." },
    ],
    items: [
      { t: 'meaning', s: "We're going to rent a car.", ask: 'Машину уже взяли?', o: ['нет, это план', 'да, уже взяли'], a: 0, why: 'going to — план на будущее.' },
      { t: 'meaning', s: "She isn't going to swim.", ask: 'Она будет плавать?', o: ['нет', 'да'], a: 0, why: "isn't going to — не собирается." },
      { t: 'choose', s: 'I ___ going to learn English.', ru: 'Я собираюсь учить английский.', o: ['am', 'is', 'are'], a: 'am', why: 'I → am going to.' },
      { t: 'choose', s: 'They are going ___ a villa.', ru: 'Они собираются снять виллу.', o: ['to rent', 'rent', 'renting'], a: 'to rent', why: 'going to + начальная форма.' },
      { t: 'choose', s: 'She ___ going to call you.', ru: 'Она собирается тебе позвонить.', o: ['is', 'are', 'am'], a: 'is', why: 'She → is going to.' },
      { t: 'choose', s: '___ you going to surf tomorrow?', ru: 'Ты завтра будешь сёрфить?', o: ['Are', 'Do', 'Will'], a: 'Are', why: 'Вопрос: Are you going to…?' },
      { t: 'choose', s: "We aren't going ___ the bus.", ru: 'Мы не поедем на автобусе.', o: ['to take', 'take', 'taking'], a: 'to take', why: 'going to + глагол.' },
      { t: 'type', s: "I'm going ___ visit my friend.", ru: 'Я собираюсь навестить подругу.', a: ['to'], why: 'going to — с to.' },
      { t: 'type', s: 'He ___ going to work today.', ru: 'Он не собирается сегодня работать.', a: ["isn't", 'is not'], why: "He → isn't going to." },
      { t: 'build', ru: 'Я собираюсь снять квартиру.', a: "I'm going to rent a flat.", extra: 'renting' },
      { t: 'build', ru: 'Что ты собираешься делать?', a: 'What are you going to do?', extra: 'doing' },
      { t: 'build', ru: 'Мы будем учить английский.', a: "We're going to learn English.", extra: 'is' },
    ],
    gen: (verbs) => verbs.slice(0, 2).map(v => ({ t: 'choose', s: "I'm going to ___ tomorrow.", ru: v.en + ' — ' + v.ru, o: C.shuffle([v.en, ing(v.en), s3(v.en)]), a: v.en, why: 'going to + начальная форма.', mine: true })) });

  add({ id: 'comp', title: 'cheaper, more expensive', sub: 'Сравнение: больше, дешевле, лучше', icon: '⚖️',
    theory: [
      { h: 'Как сравнивать', table: [['короткие: +er', 'cheap → cheaper', 'big → bigger, easy → easier'], ['длинные: more', 'more expensive', 'more beautiful'], ['запомнить', 'good → better', 'bad → worse']] },
      { h: '«Чем» — than', p: 'This villa is cheaper than that one — Эта вилла дешевле той. Не путайте than (чем) и then (потом).',
        ex: [['It is cheaper.', 'Это дешевле.'], ['I need a bigger room.', 'Мне нужна комната побольше.'], ['The villa is better than the hotel.', 'Вилла лучше отеля.']] },
    ],
    items: [
      { t: 'meaning', s: 'The villa is cheaper than the hotel.', ask: 'Что дешевле?', o: ['вилла', 'отель'], a: 0, why: 'cheaper than — дешевле, чем.' },
      { t: 'meaning', s: 'This board is bigger.', ask: 'Эта доска…', o: ['больше', 'меньше'], a: 0, why: 'bigger — больше.' },
      { t: 'choose', s: 'This room is ___ than that one.', ru: 'Эта комната больше той.', o: ['bigger', 'more big', 'biger'], a: 'bigger', why: 'Короткое слово → +er, big → bigger (удваиваем g).' },
      { t: 'choose', s: 'The villa is ___ than the hotel.', ru: 'Вилла дороже отеля.', o: ['more expensive', 'expensiver', 'expensive'], a: 'more expensive', why: 'Длинное слово → more expensive.' },
      { t: 'choose', s: 'Today the waves are ___.', ru: 'Сегодня волны лучше.', o: ['better', 'gooder', 'more good'], a: 'better', why: 'good → better (исключение).' },
      { t: 'choose', s: 'Bali is ___ than Moscow.', ru: 'На Бали теплее, чем в Москве.', o: ['warmer', 'more warm', 'warmmer'], a: 'warmer', why: 'warm → warmer.' },
      { t: 'choose', s: 'This lesson is ___.', ru: 'Этот урок легче.', o: ['easier', 'easyer', 'more easy'], a: 'easier', why: 'easy → easier (y → ier).' },
      { t: 'choose', s: 'My English is better ___ last year.', ru: 'Мой английский лучше, чем в прошлом году.', o: ['than', 'then', 'that'], a: 'than', why: '«Чем» — than.' },
      { t: 'type', s: 'The weather is ___ today. (bad)', ru: 'Сегодня погода хуже.', a: ['worse'], why: 'bad → worse (исключение).' },
      { t: 'type', s: 'This flat is ___. (cheap)', ru: 'Эта квартира дешевле.', a: ['cheaper'], why: 'cheap → cheaper.' },
      { t: 'build', ru: 'Это дешевле.', a: 'It is cheaper.', extra: 'more' },
      { t: 'build', ru: 'Мне нужна комната побольше.', a: 'I need a bigger room.', extra: 'more' },
      { t: 'build', ru: 'Вилла лучше отеля.', a: 'The villa is better than the hotel.', extra: 'then' },
    ] });

  // Порядок изучения (A1 → начало A2)
  const ORDER = ['be', 'be2', 'a', 'pron', 'ps1', 'ps2', 'do', 'imp', 'there', 'prep', 'can', 'cont', 'was', 'past', 'did', 'some', 'going', 'comp'];
  L.sort((x, y) => ORDER.indexOf(x.id) - ORDER.indexOf(y.id));
  const SOON = [];

  // ---------- Помощники ----------
  function s3(v) {
    if (v === 'have') return 'has'; if (v === 'be') return 'is';
    if (/(s|sh|ch|x|z|o)$/.test(v)) return v + 'es';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies';
    return v + 's';
  }
  const VOW = /[aeiou]/;
  // короткий глагол «согласная-гласная-согласная» → удвоение (stop → stopped, swim → swimming)
  function cvc(v) { return /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v); }
  function ing(v) {
    if (/ie$/.test(v)) return v.slice(0, -2) + 'ying';
    if (/[^e]e$/.test(v) && v !== 'be') return v.slice(0, -1) + 'ing';
    if (cvc(v)) return v + v.slice(-1) + 'ing';
    return v + 'ing';
  }
  function past(v) {
    const irr = C.irregular(v); if (irr) return irr.v2;
    if (/e$/.test(v)) return v + 'd';
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied';
    if (cvc(v)) return v + v.slice(-1) + 'ed';
    return v + 'ed';
  }
  function myVerbs() {
    return C.shuffle(wordsArr().filter(w => !w.archived && w.ru && /глагол/.test(w.pos || '') && /^(to )?[a-z]+$/i.test(C.clean(w.en)))
      .map(w => ({ en: C.clean(w.en).toLowerCase().replace(/^to /, ''), ru: w.ru.split(',')[0] }))
      .filter(v => !['be', 'can', 'must'].includes(v.en)));
  }
  let progress = {};
  async function loadProgress() { progress = (await kvGet('grammar')) || {}; return progress; }
  async function saveProgress() { await kvSet('grammar', progress); }
  function stateOf(id, now) {
    const p = progress[id];
    if (!p || !p.done) return p && p.tries ? 'started' : 'new';
    if (p.card && C.isDue(p.card, now)) return 'due';
    return 'done';
  }
  function dueLessons(now) { return L.filter(l => stateOf(l.id, now || Date.now()) === 'due'); }
  function merge(a, b) { // для синхронизации: берём более свежую запись по каждой теме
    const out = Object.assign({}, a || {});
    Object.keys(b || {}).forEach(k => { if (!out[k] || (b[k].last || 0) > (out[k].last || 0)) out[k] = b[k]; });
    return out;
  }

  // ---------- Экран списка тем ----------
  routes.grammar = async function () {
    await loadProgress();
    const main = screen({ title: 'Грамматика', back: 'train' });
    const now = Date.now();
    const doneN = L.filter(l => ['done', 'due'].includes(stateOf(l.id, now))).length;
    main.append(h('div', { class: 'card stack' },
      h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('h2', null, 'Уровень A1 → A2'), h('span', { class: 'small muted num' }, doneN + ' из ' + L.length + ' тем')),
      h('div', { class: 'meter' }, h('i', { style: { width: Math.round(doneN / L.length * 100) + '%' } })),
      h('details', null, h('summary', null, 'Как устроены уроки'), h('ol', { class: 'small', style: { margin: '8px 0 0', paddingLeft: '20px', display: 'grid', gap: '4px' } },
        h('li', null, 'Короткое правило по-русски и сравнение с русским — 1 минута.'),
        h('li', null, 'Сначала задания на понимание: по форме слова догадаться о смысле.'),
        h('li', null, 'Потом выбираете форму, пишете сами и собираете фразы — часто с вашими словами.'),
        h('li', null, 'При ошибке — объяснение «почему», а ошибку повторим в конце урока.'),
        h('li', null, 'Через несколько дней приложение предложит короткое повторение темы — так правило закрепляется.')))));
    L.forEach((l, i) => {
      const st = stateOf(l.id, now); const p = progress[l.id] || {};
      const pill = st === 'done' ? h('span', { class: 'pill solid' }, '✓ ' + p.best + '%') : st === 'due' ? h('span', { class: 'pill due' }, 'повторить') : st === 'started' ? h('span', { class: 'pill learning' }, 'начато') : h('span', { class: 'pill new' }, 'новая');
      main.append(h('button', { class: 'tile wide', onclick: () => go('gram-' + l.id) },
        h('span', { class: 'tile-ic' }, l.icon), h('span', { class: 'tile-t grow' }, h('b', null, (i + 1) + '. ' + l.title), h('small', null, l.sub)), pill));
    });
    if (SOON.length) main.append(h('div', { class: 'section-title' }, 'Скоро'));
    SOON.forEach(s => main.append(h('div', { class: 'tile wide soon', 'aria-disabled': 'true' }, h('span', { class: 'tile-ic' }, s.icon), h('span', { class: 'tile-t' }, h('b', null, s.title), h('small', null, 'появится позже')))));
  };

  // ---------- Теория ----------
  routes.gram = async function (id) {
    await loadProgress();
    const l = L.find(x => x.id === id); if (!l) return go('grammar');
    const main = screen({ title: l.title, back: 'grammar' });
    const p = progress[id];
    l.theory.forEach(t => {
      const card = h('div', { class: 'card stack gram-theory' }, h('h2', null, t.h));
      if (t.p) card.append(h('p', null, t.p));
      if (t.table) card.append(h('div', { class: 'gram-table' }, t.table.map(r => h('div', { class: 'gram-tr' }, r.map((c, k) => h('span', { lang: k < 2 ? 'en' : null, class: k === 1 ? 'em' : '' }, c))))));
      if (t.ex) card.append(h('div', { class: 'stack', style: { gap: '6px' } }, t.ex.map(([en, ru]) => h('button', { class: 'gram-ex', onclick: () => sayP(en) },
        h('span', { lang: 'en' }, en), h('small', null, ru), h('span', { class: 'gram-sp', 'aria-hidden': 'true' }, '🔊')))));
      main.append(card);
    });
    main.append(h('div', { class: 'savebar' }, h('button', { class: 'btn primary big block', onclick: () => practice(l, false) }, p && p.done ? 'Практика ещё раз' : 'Перейти к практике')));
  };

  // ---------- Практика ----------
  function buildQueue(l, review) {
    const items = l.items.slice();
    const order = { meaning: 0, choose: 1, type: 2, build: 3 };
    let q;
    if (review) q = C.shuffle(items).slice(0, 6);
    else {
      const byT = (t) => C.shuffle(items.filter(x => x.t === t));
      q = [].concat(byT('meaning').slice(0, 2), byT('choose').slice(0, 4), byT('type').slice(0, 2), byT('build').slice(0, 2));
    }
    if (l.gen) { const extra = l.gen(myVerbs()); if (extra.length) q.splice(Math.min(q.length, review ? 3 : 5), 0, extra[0]); }
    if (!review) q.sort((a, b) => order[a.t] - order[b.t]);
    return q.map(x => Object.assign({}, x));
  }
  function practice(l, review) {
    const queue = buildQueue(l, review);
    const total = queue.length;
    let i = 0, right = 0; const wrong = []; const started = Date.now();
    const sheetStyle = 'margin-top:auto';
    function step() {
      if (i >= queue.length) return finish();
      const it = queue[i];
      const main = screen({ title: review ? 'Повторение: ' + l.title : l.title, back: 'gram-' + l.id, nav: false });
      const done = Math.min(i, total);
      main.append(h('div', { class: 'meter' }, h('i', { style: { width: Math.round(done / total * 100) + '%' } })));
      if (it.again) main.append(h('div', { class: 'pill due', style: { justifySelf: 'start' } }, 'ещё раз — была ошибка'));
      if (it.mine) main.append(h('div', { class: 'pill new', style: { justifySelf: 'start' } }, 'на ваших словах'));
      const fb = h('div'); const actions = h('div', { class: 'actions', style: sheetStyle });
      const next = () => { i++; step(); };
      const result = (ok, shown) => {
        if (!it.again) { if (ok) right++; else { wrong.push(it); queue.push(Object.assign({}, it, { again: true })); } }
        fb.innerHTML = '';
        fb.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, h('div', { class: 'title' }, ok ? 'Верно!' : 'Правильно: ' + shown), it.why ? h('div', { class: 'small' }, it.why) : null));
        const full = it.t === 'build' ? it.a : it.s && it.t !== 'meaning' ? it.s.replace('___', Array.isArray(it.a) ? it.a[0] : it.a).replace(/\s*\([^)]*\)\s*$/, '') : it.s;
        if (full && /[a-z]/i.test(full)) sayP(full.replace(/^—\s*/, '').replace(/ — /g, '. '));
        actions.innerHTML = ''; const b = h('button', { class: 'btn primary big block', onclick: next }, 'Дальше'); actions.append(b); setTimeout(() => b.focus(), 30);
      };
      if (it.t === 'meaning') {
        main.append(h('div', { class: 'task' }, 'Прочитайте и ответьте'),
          h('div', { class: 'prompt' }, h('div', { class: 'mid', lang: 'en' }, it.s), h('button', { class: 'btn ghost sm', onclick: () => sayP(it.s) }, icon('speaker'), 'Послушать'), h('div', { class: 'small muted' }, it.ask)));
        const opts = h('div', { class: 'options' }); let locked = false;
        it.o.forEach((o, k) => opts.append(h('button', { class: 'opt', onclick: (e) => {
          if (locked) return; locked = true; const ok = k === it.a;
          [...opts.children].forEach((b, j) => { b.disabled = true; if (j === it.a) b.classList.add('right'); }); if (!ok) e.currentTarget.classList.add('wrong');
          result(ok, it.o[it.a]);
        } }, o)));
        main.append(opts, fb, actions);
      } else if (it.t === 'choose') {
        main.append(h('div', { class: 'task' }, 'Выберите, что вставить'),
          h('div', { class: 'prompt' }, h('div', { class: 'gap-sentence', lang: 'en' }, it.s.replace('___', '____')), it.ru ? h('div', { class: 'small muted' }, it.ru) : null));
        const opts = h('div', { class: 'options' }); let locked = false;
        (it.shuffled || (it.shuffled = C.shuffle(it.o))).forEach(o => opts.append(h('button', { class: 'opt', lang: 'en', onclick: (e) => {
          if (locked) return; locked = true; const ok = o === it.a;
          [...opts.children].forEach(b => { b.disabled = true; if (b.textContent === it.a) b.classList.add('right'); }); if (!ok) e.currentTarget.classList.add('wrong');
          result(ok, it.a);
        } }, o)));
        main.append(opts, fb, actions);
      } else if (it.t === 'type') {
        const inp = h('input', { class: 'input big', id: 'g-ans', autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', spellcheck: 'false', lang: 'en', placeholder: 'Напишите слово', 'aria-label': 'Ответ' });
        let locked = false;
        main.append(h('div', { class: 'task' }, 'Напишите пропущенное слово'),
          h('div', { class: 'prompt' }, h('div', { class: 'gap-sentence', lang: 'en' }, it.s.replace('___', '____')), it.ru ? h('div', { class: 'small muted' }, it.ru) : null),
          h('form', { class: 'stack', onsubmit: (e) => {
            e.preventDefault(); if (locked) return; if (!inp.value.trim()) return inp.focus();
            locked = true; inp.disabled = true;
            const r = C.checkAnswer(inp.value, it.a[0], it.a.slice(1));
            result(r.result === 'correct', it.a[0] + (r.result === 'typo' ? ' (проверьте написание)' : ''));
          } }, inp, fb, actions));
        actions.append(h('button', { class: 'btn primary big block', type: 'submit' }, 'Проверить'));
        setTimeout(() => inp.focus(), 60);
      } else if (it.t === 'build') {
        const words = it.a.replace(/[.?!]$/, '').split(' ');
        const tiles = C.shuffle(words.concat(it.extra ? [it.extra] : []).map((t, k) => ({ t, k })));
        const chosen = []; let locked = false;
        const line = h('div', { class: 'answer-line' }); const pool = h('div', { class: 'tiles' });
        const draw = () => {
          line.innerHTML = ''; pool.innerHTML = '';
          chosen.forEach((c, k) => line.append(h('button', { class: 'tile', onclick: () => { if (locked) return; chosen.splice(k, 1); draw(); } }, c.t)));
          tiles.forEach(c => pool.append(h('button', { class: 'tile' + (chosen.includes(c) ? ' used' : ''), onclick: () => { if (locked || chosen.includes(c)) return; chosen.push(c); draw(); } }, c.t)));
        };
        main.append(h('div', { class: 'task' }, 'Соберите фразу' + (it.extra ? ' (одно слово лишнее)' : '')),
          h('div', { class: 'prompt' }, h('div', { class: 'mid' }, it.ru)), line, pool, fb, actions);
        actions.append(h('button', { class: 'btn primary big block', onclick: () => {
          if (locked || !chosen.length) return;
          locked = true; const ok = C.norm(chosen.map(c => c.t).join(' ')) === C.norm(it.a);
          result(ok, it.a);
        } }, 'Проверить'));
        draw();
      }
    }
    async function finish() {
      const pct = Math.round(right / total * 100);
      const now = Date.now();
      const p = progress[l.id] || { tries: 0, best: 0 };
      p.tries = (p.tries || 0) + 1; p.last = now; p.lastScore = pct; p.best = Math.max(p.best || 0, pct);
      if (pct >= 70) p.done = true;
      if (p.done && (!p.card || !C.sameDay(p.card.last, now))) {
        // первое повторение новой темы — скоро (1–4 дня), дальше интервалы растут по FSRS
        const first = !p.card || !p.card.reps;
        const g = first ? (pct >= 90 ? 3 : 2) : (pct >= 90 ? 4 : pct >= 70 ? 3 : pct >= 50 ? 2 : 1);
        p.card = C.review(p.card, g, now, 0.9);
      }
      progress[l.id] = p; await saveProgress();
      try { await DB.put('sessions', { id: C.uid(), ts: started, mode: 'grammar', n: total, correct: right, durationSec: Math.round((now - started) / 1000) }); } catch (e) { /* не критично */ }
      const main = screen({ title: l.title, back: 'grammar' });
      const idx = L.indexOf(l); const nextL = L[idx + 1];
      main.append(h('div', { class: 'card stack' }, h('h1', null, pct >= 70 ? 'Тема пройдена' : 'Хорошее начало'),
        h('div', { class: 'report', style: { gridTemplateColumns: 'repeat(2, 1fr)' } }, h('div', null, h('b', null, pct + '%'), h('span', null, 'верно с первого раза')), h('div', null, h('b', null, total), h('span', null, 'заданий'))),
        h('p', { class: 'small' }, pct >= 70 ? 'Приложение предложит короткое повторение ' + C.inDays(p.card.due, now) + '.' : 'Чтобы тема засчиталась, нужно от 70%. Перечитайте правило и попробуйте ещё раз — это нормально.'),
        wrong.length ? h('details', null, h('summary', null, 'Ошибки (' + wrong.length + ')'), h('ul', { class: 'small', style: { margin: '8px 0 0', paddingLeft: '20px', display: 'grid', gap: '6px' } }, wrong.map(w => h('li', null, h('b', { lang: 'en' }, w.t === 'build' ? w.a : w.s.replace('___', Array.isArray(w.a) ? w.a[0] : (w.t === 'meaning' ? '' : w.a))), w.why ? ' — ' + w.why : '')))) : null,
        pct < 70 ? h('button', { class: 'btn primary block', onclick: () => go('gram-' + l.id) }, 'Перечитать правило') : null,
        h('button', { class: 'btn ' + (pct < 70 ? '' : 'primary') + ' block', onclick: () => practice(l, false) }, 'Ещё раз'),
        nextL && pct >= 70 ? h('button', { class: 'btn soft block', onclick: () => go('gram-' + nextL.id) }, 'Следующая тема: ' + nextL.title) : null,
        h('button', { class: 'btn ghost block', onclick: () => go('grammar') }, 'Ко всем темам')));
    }
    step();
  }
  routes.gramrev = async function (id) { await loadProgress(); const l = L.find(x => x.id === id); if (!l) return go('grammar'); practice(l, true); };

  window.Grammar = { LESSONS: L, loadProgress, dueLessons, merge, s3, ing, past, stateOf, get progress() { return progress; } };
  loadProgress();
})();
