/* Мои слова — готовые наборы уровня A0–A1. Формат строки: en | ru | пример | перевод примера | эмодзи | запрос для фото | часть речи */
(function () {
  'use strict';
  const RAW = {
    travel: { name: 'Путешествия: аэропорт и отель', icon: '✈️', rows: `
airport | аэропорт | The airport is big. | Аэропорт большой. | 🛫 | airport terminal | сущ.
flight | рейс, полёт | My flight is at ten. | Мой рейс в десять. | ✈️ | airplane flight | сущ.
ticket | билет | I have a ticket. | У меня есть билет. | 🎫 | plane ticket | сущ.
passport | паспорт | Here is my passport. | Вот мой паспорт. | 🛂 | passport | сущ.
luggage | багаж | My luggage is heavy. | Мой багаж тяжёлый. | 🧳 | luggage suitcase | сущ.
gate | выход на посадку | Go to gate five. | Идите к выходу пять. | 🚪 | airport gate | сущ.
delay | задержка | There is a delay. | Есть задержка. | ⏳ | departure board delay | сущ.
hotel | отель | The hotel is near the sea. | Отель рядом с морем. | 🏨 | hotel building | сущ.
check in | заселиться, зарегистрироваться | We check in at two. | Мы заселяемся в два. | 🛎️ | hotel reception | фразовый глагол
check out | выселиться | I check out tomorrow. | Я выселяюсь завтра. | 🧳 | hotel checkout | фразовый глагол
reservation | бронь | I have a reservation. | У меня есть бронь. | 📅 | hotel booking | сущ.
room key | ключ от номера | Can I have my room key? | Можно мой ключ от номера? | 🔑 | hotel room key card | выражение
taxi | такси | I need a taxi. | Мне нужно такси. | 🚕 | taxi car | сущ.
map | карта | Do you have a map? | У вас есть карта? | 🗺️ | city map | сущ.
where is | где находится | Where is the toilet? | Где туалет? | 📍 | signpost | выражение
How much is it? | Сколько это стоит? | How much is it per night? | Сколько стоит за ночь? | 💰 | price tag | выражение
I would like | я бы хотел(а) | I would like a room, please. | Я бы хотела номер, пожалуйста. | 🙋 | hotel reception desk | выражение
left | налево; левый | Turn left here. | Поверните здесь налево. | ⬅️ | left arrow sign | наречие
right | направо; правый | The bank is on the right. | Банк справа. | ➡️ | right arrow sign | наречие
straight on | прямо | Go straight on. | Идите прямо. | ⬆️ | straight road | выражение` },
    rent: { name: 'Аренда жилья', icon: '🏠', rows: `
rent | снимать, арендовать; арендная плата | I want to rent a flat. | Я хочу снять квартиру. | 🔑 | apartment keys | глагол
flat | квартира (брит.) | The flat has two rooms. | В квартире две комнаты. | 🏢 | apartment interior | сущ.
apartment | квартира (амер.) | The apartment is small. | Квартира маленькая. | 🏢 | apartment building | сущ.
villa | вилла | We rent a villa. | Мы снимаем виллу. | 🏡 | villa with pool | сущ.
landlord | хозяин жилья | The landlord is kind. | Хозяин добрый. | 🧑‍💼 | landlord handing keys | сущ.
deposit | залог, депозит | The deposit is one month. | Залог — один месяц. | 💵 | money cash | сущ.
contract | договор | Please send me the contract. | Пожалуйста, пришлите мне договор. | 📝 | signing contract | сущ.
per month | в месяц | It is 500 dollars per month. | Это 500 долларов в месяц. | 🗓️ | calendar month | выражение
bills | счета (за свет, воду) | Are bills included? | Счета включены? | 🧾 | utility bills | сущ.
included | включено | Wi-Fi is included. | Wi-Fi включён. | ✅ | checklist | прил.
bedroom | спальня | There are two bedrooms. | Там две спальни. | 🛏️ | bedroom | сущ.
kitchen | кухня | The kitchen is new. | Кухня новая. | 🍳 | kitchen | сущ.
bathroom | ванная | The bathroom is clean. | Ванная чистая. | 🛁 | bathroom | сущ.
air conditioner | кондиционер | The air conditioner does not work. | Кондиционер не работает. | ❄️ | air conditioner | сущ.
broken | сломан(ный) | The shower is broken. | Душ сломан. | 🔧 | broken pipe repair | прил.
clean | чистый; убирать | Is the house clean? | Дом чистый? | 🧽 | cleaning house | прил.
available | свободный, доступный | Is the villa available in May? | Вилла свободна в мае? | 📅 | available sign | прил.
move in | въехать | Can I move in on Monday? | Могу я въехать в понедельник? | 📦 | moving boxes | фразовый глагол` },
    beach: { name: 'Пляж, вода и сёрфинг', icon: '🌊', rows: `
beach | пляж | We go to the beach. | Мы идём на пляж. | 🏖️ | tropical beach | сущ.
sea | море | The sea is warm. | Море тёплое. | 🌊 | sea | сущ.
wave | волна | The waves are big today. | Сегодня волны большие. | 🌊 | ocean wave | сущ.
sand | песок | The sand is hot. | Песок горячий. | 🏖️ | beach sand | сущ.
swim | плавать | I can swim. | Я умею плавать. | 🏊 | swimming in sea | глагол
surf | сёрфить, кататься на волнах | I want to learn to surf. | Я хочу научиться сёрфить. | 🏄 | surfer riding wave | глагол
board | доска | Take your board. | Возьми свою доску. | 🏄 | surfboard | сущ.
lesson | урок, занятие | The lesson starts at nine. | Урок начинается в девять. | 📘 | surf lesson | сущ.
wind | ветер | The wind is strong. | Ветер сильный. | 🌬️ | windy beach | сущ.
sunscreen | солнцезащитный крем | Don't forget sunscreen. | Не забудь солнцезащитный крем. | 🧴 | sunscreen bottle | сущ.
towel | полотенце | Can I have a towel? | Можно мне полотенце? | 🧺 | beach towel | сущ.
life jacket | спасательный жилет | Put on a life jacket. | Надень спасательный жилет. | 🦺 | life jacket | сущ.
safe | безопасный | Is it safe here? | Здесь безопасно? | ✅ | lifeguard tower | прил.
dangerous | опасный | The current is dangerous. | Течение опасное. | ⚠️ | danger sign beach | прил.
fall | падать | Don't worry if you fall. | Не волнуйся, если упадёшь. | 🤸 | surfer falling | глагол
stand up | встать | Stand up on the board. | Встань на доску. | 🧍 | surfer standing up | фразовый глагол
rent a board | взять доску в аренду | Where can I rent a board? | Где можно взять доску в аренду? | 🏄 | surfboard rental | выражение
low tide | отлив | It's low tide now. | Сейчас отлив. | 🌊 | low tide beach | выражение` },
    cafe: { name: 'Кафе и еда', icon: '☕', rows: `
menu | меню | Can I see the menu? | Можно посмотреть меню? | 📋 | restaurant menu | сущ.
order | заказывать; заказ | I want to order. | Я хочу заказать. | 📝 | waiter taking order | глагол
bill | счёт | Can I have the bill, please? | Можно счёт, пожалуйста? | 🧾 | restaurant bill | сущ.
water | вода | A bottle of water, please. | Бутылку воды, пожалуйста. | 💧 | glass of water | сущ.
coffee | кофе | I'd like a coffee. | Я бы хотела кофе. | ☕ | cup of coffee | сущ.
tea | чай | Green tea, please. | Зелёный чай, пожалуйста. | 🍵 | cup of tea | сущ.
breakfast | завтрак | Breakfast is at eight. | Завтрак в восемь. | 🥐 | breakfast table | сущ.
lunch | обед | Let's have lunch. | Давай пообедаем. | 🥗 | lunch plate | сущ.
dinner | ужин | Dinner is ready. | Ужин готов. | 🍝 | dinner table | сущ.
spicy | острый | Is it spicy? | Это острое? | 🌶️ | chili pepper | прил.
without | без | Without sugar, please. | Без сахара, пожалуйста. | 🚫 | sugar cubes | предлог
vegetarian | вегетарианский | Do you have vegetarian food? | У вас есть вегетарианская еда? | 🥦 | vegetables | прил.
delicious | очень вкусный | The soup is delicious. | Суп очень вкусный. | 😋 | soup bowl | прил.
table for two | столик на двоих | A table for two, please. | Столик на двоих, пожалуйста. | 🍽️ | restaurant table for two | выражение
take away | с собой | Coffee to take away. | Кофе с собой. | 🥡 | takeaway coffee | выражение
fruit | фрукты | I eat fruit every day. | Я ем фрукты каждый день. | 🍎 | tropical fruit | сущ.` },
    talk: { name: 'Общение: первые фразы', icon: '💬', rows: `
Hello! | Привет! Здравствуйте! | Hello! How are you? | Привет! Как дела? | 👋 | people greeting | выражение
How are you? | Как дела? | Hi! How are you? | Привет! Как дела? | 🙂 | friends talking | выражение
I'm fine, thanks. | Хорошо, спасибо. | I'm fine, thanks. And you? | Хорошо, спасибо. А ты? | 😊 | smiling woman | выражение
Nice to meet you. | Приятно познакомиться. | Hi, I'm Jane. Nice to meet you. | Привет, я Джейн. Приятно познакомиться. | 🤝 | handshake | выражение
My name is | меня зовут | My name is Jane. | Меня зовут Джейн. | 🏷️ | name tag | выражение
Where are you from? | Откуда ты? | Where are you from? I'm from Russia. | Откуда ты? Я из России. | 🌍 | world map | выражение
I don't understand. | Я не понимаю. | Sorry, I don't understand. | Извините, я не понимаю. | 🤷 | confused person | выражение
Can you repeat, please? | Повторите, пожалуйста. | Can you repeat, please? | Повторите, пожалуйста. | 🔁 | person listening | выражение
slowly | медленно | Please speak slowly. | Пожалуйста, говорите медленно. | 🐢 | turtle | наречие
Thank you! | Спасибо! | Thank you very much! | Большое спасибо! | 🙏 | thank you card | выражение
You're welcome. | Пожалуйста (в ответ на спасибо). | — Thank you! — You're welcome. | — Спасибо! — Пожалуйста. | 😊 | smiling people | выражение
Sorry | извините, простите | Sorry, I'm late. | Извините, я опоздала. | 🙇 | apology | выражение
Excuse me | извините (чтобы обратиться) | Excuse me, where is the bank? | Извините, где банк? | 🙋 | asking directions | выражение
help | помогать; помощь | Can you help me? | Вы можете мне помочь? | 🤝 | helping hand | глагол
friend | друг, подруга | She is my friend. | Она моя подруга. | 🧑‍🤝‍🧑 | friends | сущ.
See you! | Увидимся! | See you tomorrow! | Увидимся завтра! | 👋 | waving goodbye | выражение` },
    sport: { name: 'Спорт и тренировки', icon: '🏋️', rows: `
gym | спортзал | I go to the gym. | Я хожу в спортзал. | 🏋️ | gym | сущ.
train | тренироваться | I train three times a week. | Я тренируюсь три раза в неделю. | 💪 | workout training | глагол
coach | тренер | My coach is from Spain. | Мой тренер из Испании. | 🧑‍🏫 | sports coach | сущ.
run | бегать | I run in the morning. | Я бегаю по утрам. | 🏃 | running | глагол
stretch | растягиваться | Stretch after training. | Растягивайся после тренировки. | 🧘 | stretching | глагол
strong | сильный | She is very strong. | Она очень сильная. | 💪 | strong athlete | прил.
tired | уставший | I'm tired today. | Я сегодня устала. | 😴 | tired runner | прил.
balance | равновесие, баланс | Keep your balance. | Держи равновесие. | ⚖️ | balance board | сущ.
knees | колени | Bend your knees. | Согни колени. | 🦵 | bent knees squat | сущ.
legs | ноги | My legs hurt. | У меня болят ноги. | 🦵 | legs | сущ.
again | снова, ещё раз | Try again! | Попробуй ещё раз! | 🔁 | repeat | наречие
ready | готов(а) | Are you ready? | Ты готова? | ✅ | ready start | прил.
slow down | помедленнее | Slow down, please. | Помедленнее, пожалуйста. | 🐢 | slow sign | фразовый глагол
well done | молодец, отлично | Well done! Good job! | Молодец! Отличная работа! | 👏 | applause | выражение
water bottle | бутылка для воды | Take a water bottle. | Возьми бутылку воды. | 🧴 | sports water bottle | сущ.` },
    shop: { name: 'Магазин и деньги', icon: '🛍️', rows: `
shop | магазин | The shop is open. | Магазин открыт. | 🛍️ | small shop | сущ.
buy | покупать | I want to buy this. | Я хочу купить это. | 🛒 | shopping cart | глагол
price | цена | What is the price? | Какая цена? | 🏷️ | price tag | сущ.
cheap | дешёвый | This is cheap. | Это дёшево. | 💸 | cheap price sign | прил.
expensive | дорогой | It's too expensive. | Это слишком дорого. | 💎 | luxury jewelry | прил.
discount | скидка | Is there a discount? | Есть скидка? | 🏷️ | discount sale sign | сущ.
cash | наличные | Can I pay in cash? | Можно заплатить наличными? | 💵 | cash money | сущ.
card | карта (банковская) | Can I pay by card? | Можно оплатить картой? | 💳 | credit card payment | сущ.
size | размер | Do you have a bigger size? | У вас есть размер побольше? | 📏 | clothing size | сущ.
try on | примерить | Can I try it on? | Можно примерить? | 👗 | fitting room | фразовый глагол
open | открыт(о) | Is the pharmacy open? | Аптека открыта? | 🔓 | open sign | прил.
closed | закрыт(о) | The shop is closed on Sunday. | В воскресенье магазин закрыт. | 🔒 | closed sign | прил.
pharmacy | аптека | Where is a pharmacy? | Где аптека? | 💊 | pharmacy | сущ.
change | сдача | Keep the change. | Сдачи не надо. | 🪙 | coins | сущ.
receipt | чек | Can I have a receipt? | Можно чек? | 🧾 | receipt | сущ.` },
  };
  const SETS = Object.keys(RAW).map(id => {
    const s = RAW[id];
    const words = s.rows.trim().split('\n').map(line => {
      const [en, ru, example, exampleRu, emoji, imageQuery, pos] = line.split('|').map(x => x.trim());
      return { en, ru, example, exampleRu, emoji, imageQuery, pos };
    });
    return { id, name: s.name, icon: s.icon, words };
  });
  window.ReadySets = SETS;
})();
