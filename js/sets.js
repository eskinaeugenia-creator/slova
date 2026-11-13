/* Мои слова — готовые наборы с метками уровня A0 / A1 / A2 / B1. Формат строки: en | ru | пример | перевод примера | эмодзи | запрос для фото | часть речи */
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
    irregular: { name: 'Неправильные глаголы', icon: '🔁', rows: `
be | быть | I was tired yesterday. | Вчера я была уставшая. | 🙂 | person smiling | глагол
have | иметь | I had breakfast at eight. | Я позавтракала в восемь. | 🍽️ | breakfast table | глагол
do | делать | I did my homework. | Я сделала домашнее задание. | ✅ | homework notebook | глагол
go | идти, ехать | We went to the beach. | Мы ходили на пляж. | 🚶 | walking to beach | глагол
get | получать | I got a message. | Я получила сообщение. | 📩 | phone message | глагол
make | делать, создавать | She made coffee. | Она сделала кофе. | ☕ | making coffee | глагол
say | сказать | He said hello. | Он сказал «привет». | 💬 | people talking | глагол
see | видеть | I saw a turtle. | Я видела черепаху. | 👀 | sea turtle | глагол
come | приходить | They came at six. | Они пришли в шесть. | 👋 | friends arriving | глагол
take | брать | I took a taxi. | Я взяла такси. | 🚕 | taxi | глагол
give | давать | He gave me the keys. | Он дал мне ключи. | 🔑 | giving keys | глагол
know | знать | I knew the answer. | Я знала ответ. | 💡 | light bulb idea | глагол
think | думать | I thought about you. | Я думала о тебе. | 🤔 | thinking person | глагол
eat | есть | We ate fish. | Мы ели рыбу. | 🐟 | grilled fish | глагол
drink | пить | I drank water. | Я пила воду. | 💧 | drinking water | глагол
buy | покупать | I bought a new board. | Я купила новую доску. | 🛒 | surfboard shop | глагол
pay | платить | I paid by card. | Я заплатила картой. | 💳 | card payment | глагол
find | находить | I found my phone. | Я нашла свой телефон. | 📱 | phone on table | глагол
leave | уходить, оставлять | We left at nine. | Мы ушли в девять. | 🚪 | leaving door | глагол
meet | встречать | I met a friend. | Я встретила подругу. | 🤝 | friends meeting | глагол
sleep | спать | I slept well. | Я хорошо спала. | 😴 | sleeping | глагол
swim | плавать | We swam in the sea. | Мы плавали в море. | 🏊 | swimming sea | глагол
ride | кататься | I rode a scooter. | Я каталась на скутере. | 🛵 | scooter ride | глагол
fly | летать | We flew to Bali. | Мы прилетели на Бали. | ✈️ | airplane | глагол
write | писать | I wrote a message. | Я написала сообщение. | ✍️ | writing | глагол
read | читать | I read a book. | Я прочитала книгу. | 📖 | reading book | глагол
speak | говорить | We spoke English. | Мы говорили по-английски. | 🗣️ | conversation | глагол
tell | рассказывать | She told me a story. | Она рассказала мне историю. | 💬 | telling story | глагол
feel | чувствовать | I felt happy. | Я чувствовала себя счастливой. | 😊 | happy woman | глагол
sit | сидеть | We sat on the beach. | Мы сидели на пляже. | 🏖️ | sitting on beach | глагол
begin | начинать | The lesson began at ten. | Урок начался в десять. | ⏰ | clock | глагол
forget | забывать | I forgot my towel. | Я забыла полотенце. | 🤦 | forgot | глагол
understand | понимать | I understood everything. | Я всё поняла. | 💡 | understanding | глагол
wake up | просыпаться | I woke up early. | Я проснулась рано. | ⏰ | alarm clock morning | фразовый глагол
fall | падать | I fell off the board. | Я упала с доски. | 🌊 | surfer wipeout | глагол` },
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
    family: { name: 'Семья', icon: '👨‍👩‍👧', group: 'general', rows: `
family | семья | I love my family. | Я люблю свою семью. | 👨‍👩‍👧 | family together | сущ.
mother | мама, мать | My mother is a doctor. | Моя мама — врач. | 👩 | mother and child | сущ.
father | папа, отец | My father lives in Moscow. | Мой папа живёт в Москве. | 👨 | father and son | сущ.
parents | родители | My parents are retired. | Мои родители на пенсии. | 👪 | parents | сущ.
sister | сестра | I have one sister. | У меня одна сестра. | 👭 | two sisters | сущ.
brother | брат | My brother is older than me. | Мой брат старше меня. | 👬 | brothers | сущ.
husband | муж | Her husband is very kind. | Её муж очень добрый. | 🤵 | husband | сущ.
wife | жена | His wife is a teacher. | Его жена — учительница. | 👰 | wife | сущ.
son | сын | Their son is five. | Их сыну пять. | 👦 | little boy | сущ.
daughter | дочь | She has a daughter. | У неё есть дочь. | 👧 | little girl | сущ.
child | ребёнок (много — children) | They have two children. | У них двое детей. | 🧒 | children playing | сущ.
grandmother | бабушка | My grandmother cooks very well. | Моя бабушка очень хорошо готовит. | 👵 | grandmother | сущ.
grandfather | дедушка | My grandfather likes fishing. | Мой дедушка любит рыбалку. | 👴 | grandfather | сущ.
aunt | тётя | My aunt lives in Sochi. | Моя тётя живёт в Сочи. | 👩 | aunt | сущ.
uncle | дядя | My uncle has a big dog. | У моего дяди большая собака. | 👨 | uncle | сущ.
cousin | двоюродный брат, сестра | My cousin is my best friend. | Моя двоюродная сестра — моя лучшая подруга. | 🧑 | cousins | сущ.
married | женат, замужем | Are you married? | Вы замужем? | 💍 | wedding rings | прил.
boyfriend | парень (мой) | Her boyfriend is from Italy. | Её парень из Италии. | ❤️ | couple | сущ.` },
    work: { name: 'Работа и профессии', icon: '💼', group: 'general', rows: `
work | работа; работать | I work every day. | Я работаю каждый день. | 💼 | office work | глагол
job | работа, должность | I like my job. | Мне нравится моя работа. | 🧑‍💼 | job interview | сущ.
office | офис | The office is in the city centre. | Офис в центре города. | 🏢 | office | сущ.
boss | начальник | My boss is very busy. | Мой начальник очень занят. | 👔 | boss | сущ.
colleague | коллега | My colleagues are friendly. | Мои коллеги дружелюбные. | 🤝 | colleagues | сущ.
meeting | встреча, совещание | The meeting is at ten. | Совещание в десять. | 📅 | business meeting | сущ.
salary | зарплата | The salary is good. | Зарплата хорошая. | 💵 | salary money | сущ.
busy | занятой | I'm busy today. | Я сегодня занята. | ⏳ | busy person | прил.
free | свободный | Are you free tomorrow? | Ты завтра свободна? | 🕊️ | free time | прил.
client | клиент | We have a new client. | У нас новый клиент. | 🙋 | client | сущ.
business | бизнес, дело | I have my own business. | У меня свой бизнес. | 📈 | small business | сущ.
manager | менеджер, управляющий | She is a manager. | Она менеджер. | 🧑‍💼 | manager | сущ.
doctor | врач | I need a doctor. | Мне нужен врач. | 🩺 | doctor | сущ.
teacher | учитель | My teacher is from London. | Мой учитель из Лондона. | 🧑‍🏫 | teacher | сущ.
driver | водитель | The driver is waiting. | Водитель ждёт. | 🚕 | driver | сущ.
instructor | инструктор | I am a surf instructor. | Я инструктор по сёрфингу. | 🏄 | surf instructor | сущ.
email | электронное письмо | I'll send you an email. | Я отправлю тебе письмо. | 📧 | email | сущ.
day off | выходной | Tomorrow is my day off. | Завтра у меня выходной. | 🏖️ | day off | выражение` },
    home: { name: 'Дом и быт', icon: '🏡', group: 'general', rows: `
house | дом | We live in a small house. | Мы живём в маленьком доме. | 🏠 | house | сущ.
room | комната | My room is big. | Моя комната большая. | 🚪 | room | сущ.
bed | кровать | The bed is comfortable. | Кровать удобная. | 🛏️ | bed | сущ.
table | стол | Put it on the table. | Положи на стол. | 🍽️ | table | сущ.
chair | стул | Take a chair. | Возьми стул. | 🪑 | chair | сущ.
window | окно | Open the window, please. | Открой окно, пожалуйста. | 🪟 | window | сущ.
door | дверь | Close the door. | Закрой дверь. | 🚪 | door | сущ.
fridge | холодильник | The milk is in the fridge. | Молоко в холодильнике. | 🧊 | fridge | сущ.
washing machine | стиральная машина | Is there a washing machine? | Есть стиральная машина? | 🧺 | washing machine | сущ.
light | свет | Turn off the light. | Выключи свет. | 💡 | light bulb | сущ.
cook | готовить | I cook dinner every day. | Я готовлю ужин каждый день. | 👩‍🍳 | cooking | глагол
clean | убирать; чистый | I clean the house on Sunday. | Я убираю дом в воскресенье. | 🧽 | cleaning | глагол
wash | мыть, стирать | Wash your hands. | Помой руки. | 🧼 | washing hands | глагол
sleep | спать | I sleep eight hours. | Я сплю восемь часов. | 😴 | sleeping | глагол
wake up | просыпаться | I wake up at seven. | Я просыпаюсь в семь. | ⏰ | alarm clock | фразовый глагол
neighbour | сосед | My neighbour is very noisy. | Мой сосед очень шумный. | 🏘️ | neighbours | сущ.
garden | сад | We have a small garden. | У нас маленький сад. | 🌷 | garden | сущ.` },
    time: { name: 'Время, дни и погода', icon: '🗓️', group: 'general', rows: `
today | сегодня | Today is Monday. | Сегодня понедельник. | 📅 | calendar today | наречие
tomorrow | завтра | See you tomorrow. | Увидимся завтра. | ➡️ | calendar | наречие
yesterday | вчера | It was hot yesterday. | Вчера было жарко. | ⬅️ | calendar | наречие
morning | утро | I run in the morning. | Я бегаю утром. | 🌅 | sunrise morning | сущ.
evening | вечер | Good evening! | Добрый вечер! | 🌇 | evening sunset | сущ.
week | неделя | I work five days a week. | Я работаю пять дней в неделю. | 🗓️ | weekly calendar | сущ.
weekend | выходные | What are you doing at the weekend? | Что ты делаешь на выходных? | 🎉 | weekend | сущ.
Monday | понедельник | The lesson is on Monday. | Урок в понедельник. | 📅 | Monday | сущ.
Friday | пятница | I'm free on Friday. | В пятницу я свободна. | 📅 | Friday | сущ.
month | месяц | I'm here for a month. | Я здесь на месяц. | 🗓️ | month calendar | сущ.
year | год | Happy New Year! | С Новым годом! | 🎆 | new year | сущ.
What time is it? | Который час? | Excuse me, what time is it? | Извините, который час? | 🕐 | clock | выражение
weather | погода | The weather is nice today. | Сегодня хорошая погода. | 🌤️ | weather | сущ.
sunny | солнечный | It's sunny and hot. | Солнечно и жарко. | ☀️ | sunny day | прил.
rain | дождь | It's raining again. | Опять идёт дождь. | 🌧️ | rain | сущ.
cold | холодный; холодно | It's cold in Moscow. | В Москве холодно. | 🥶 | snow cold | прил.
hot | жаркий; горячий | It's very hot today. | Сегодня очень жарко. | 🥵 | hot sun | прил.
summer | лето | I love summer. | Я люблю лето. | 🌞 | summer | сущ.
winter | зима | Winter in Russia is long. | Зима в России долгая. | ❄️ | winter snow | сущ.` },
    body: { name: 'Тело и здоровье', icon: '🩺', group: 'general', rows: `
head | голова | I have a headache. | У меня болит голова. | 🤕 | head | сущ.
hand | рука (кисть) | Give me your hand. | Дай мне руку. | ✋ | hand | сущ.
arm | рука (вся) | My arm hurts. | У меня болит рука. | 💪 | arm | сущ.
leg | нога | He broke his leg. | Он сломал ногу. | 🦵 | leg | сущ.
back | спина | My back hurts after surfing. | После сёрфинга болит спина. | 🧍 | back | сущ.
eyes | глаза | She has blue eyes. | У неё голубые глаза. | 👀 | eyes | сущ.
stomach | живот, желудок | I have a stomach ache. | У меня болит живот. | 🤢 | stomach | сущ.
hurt | болеть, ушибить | It hurts here. | Болит здесь. | 🤕 | injury | глагол
sick | больной; тошнит | I feel sick. | Мне плохо. | 🤒 | sick person | прил.
fever | температура, жар | She has a fever. | У неё температура. | 🌡️ | thermometer | сущ.
medicine | лекарство | Do you have medicine for a cold? | У вас есть лекарство от простуды? | 💊 | medicine | сущ.
pharmacy | аптека | Where is the nearest pharmacy? | Где ближайшая аптека? | 🏥 | pharmacy | сущ.
tired | уставший | I'm very tired. | Я очень устала. | 😴 | tired | прил.
healthy | здоровый | I want to be healthy. | Я хочу быть здоровой. | 🥗 | healthy food | прил.
I need a doctor. | Мне нужен врач. | Please help, I need a doctor. | Помогите, мне нужен врач. | 🩺 | doctor | выражение
allergy | аллергия | I have an allergy to nuts. | У меня аллергия на орехи. | 🥜 | allergy | сущ.` },
    city: { name: 'Город и транспорт', icon: '🏙️', group: 'general', rows: `
city | город | Moscow is a big city. | Москва — большой город. | 🏙️ | city | сущ.
street | улица | I live on this street. | Я живу на этой улице. | 🛣️ | street | сущ.
centre | центр | Is the hotel in the centre? | Отель в центре? | 📍 | city centre | сущ.
bus | автобус | I take the bus to work. | Я езжу на работу на автобусе. | 🚌 | bus | сущ.
train | поезд | The train is late. | Поезд опаздывает. | 🚆 | train | сущ.
station | станция, вокзал | Where is the station? | Где вокзал? | 🚉 | train station | сущ.
car | машина | I drive a car. | Я вожу машину. | 🚗 | car | сущ.
bike | велосипед; байк | Let's rent a bike. | Давай возьмём велосипед. | 🚲 | bicycle | сущ.
ticket | билет | One ticket, please. | Один билет, пожалуйста. | 🎫 | ticket | сущ.
bank | банк | The bank is closed. | Банк закрыт. | 🏦 | bank | сущ.
supermarket | супермаркет | Is there a supermarket near here? | Здесь рядом есть супермаркет? | 🛒 | supermarket | сущ.
park | парк | We walk in the park. | Мы гуляем в парке. | 🌳 | park | сущ.
near | рядом, близко | The beach is near. | Пляж рядом. | 📍 | near | наречие
far | далеко | Is it far from here? | Это далеко отсюда? | 🔭 | far | наречие
traffic | пробки, движение | The traffic is terrible. | Ужасные пробки. | 🚦 | traffic jam | сущ.
walk | идти пешком, гулять | Let's walk. | Давай пройдёмся пешком. | 🚶 | walking | глагол` },
    clothes: { name: 'Одежда и цвета', icon: '👕', group: 'general', rows: `
clothes | одежда | I need new clothes. | Мне нужна новая одежда. | 👚 | clothes | сущ.
T-shirt | футболка | This T-shirt is too small. | Эта футболка слишком маленькая. | 👕 | t-shirt | сущ.
dress | платье | I like your dress. | Мне нравится твоё платье. | 👗 | dress | сущ.
shoes | обувь, туфли | Take off your shoes. | Сними обувь. | 👟 | shoes | сущ.
jacket | куртка | Take a jacket, it's cold. | Возьми куртку, холодно. | 🧥 | jacket | сущ.
trousers | брюки | These trousers are too long. | Эти брюки слишком длинные. | 👖 | trousers | сущ.
hat | шляпа, шапка | Wear a hat in the sun. | Носи шляпу на солнце. | 👒 | hat | сущ.
wear | носить (одежду) | I usually wear jeans. | Я обычно ношу джинсы. | 👗 | wearing clothes | глагол
size | размер | What size are you? | Какой у вас размер? | 📏 | size | сущ.
black | чёрный | I love black. | Я люблю чёрный. | ⚫ | black | прил.
white | белый | A white dress. | Белое платье. | ⚪ | white | прил.
red | красный | A red car. | Красная машина. | 🔴 | red | прил.
blue | синий, голубой | The sea is blue. | Море синее. | 🔵 | blue | прил.
green | зелёный | Green tea, please. | Зелёный чай, пожалуйста. | 🟢 | green | прил.
yellow | жёлтый | A yellow taxi. | Жёлтое такси. | 🟡 | yellow | прил.` },
    feelings: { name: 'Чувства и характер', icon: '😊', group: 'general', rows: `
happy | счастливый, радостный | I'm so happy! | Я так счастлива! | 😊 | happy | прил.
sad | грустный | Why are you sad? | Почему ты грустная? | 😢 | sad | прил.
angry | злой, сердитый | Don't be angry. | Не злись. | 😠 | angry | прил.
afraid | испуганный; боюсь | I'm afraid of sharks. | Я боюсь акул. | 😨 | afraid | прил.
bored | скучающий; мне скучно | I'm bored. | Мне скучно. | 🥱 | bored | прил.
excited | в восторге, взволнован | I'm excited about the trip! | Я в восторге от поездки! | 🤩 | excited | прил.
nervous | нервный, волнуюсь | I'm nervous before the lesson. | Я волнуюсь перед уроком. | 😬 | nervous | прил.
kind | добрый | She is very kind. | Она очень добрая. | 🤗 | kind | прил.
friendly | дружелюбный | People here are friendly. | Люди здесь дружелюбные. | 🙂 | friendly | прил.
funny | смешной | He is so funny. | Он такой смешной. | 😂 | funny | прил.
lazy | ленивый | I'm lazy on Sundays. | По воскресеньям я ленивая. | 🦥 | lazy | прил.
like | нравиться | I like this place. | Мне нравится это место. | 👍 | like | глагол
love | любить | I love the sea. | Я люблю море. | ❤️ | love | глагол
hate | ненавидеть | I hate cold weather. | Ненавижу холодную погоду. | 👎 | hate | глагол
I miss you. | Я скучаю по тебе. | I miss you so much. | Я так по тебе скучаю. | 💌 | missing someone | выражение` },
    hobby: { name: 'Хобби и свободное время', icon: '🎨', group: 'general', rows: `
free time | свободное время | What do you do in your free time? | Что ты делаешь в свободное время? | ⏳ | free time | выражение
hobby | хобби, увлечение | My hobby is photography. | Моё хобби — фотография. | 🎨 | hobby | сущ.
music | музыка | I listen to music every day. | Я слушаю музыку каждый день. | 🎵 | music | сущ.
film | фильм | Let's watch a film. | Давай посмотрим фильм. | 🎬 | film cinema | сущ.
book | книга | This book is interesting. | Эта книга интересная. | 📖 | book | сущ.
travel | путешествовать | I love to travel. | Я люблю путешествовать. | ✈️ | travel | глагол
dance | танцевать | Can you dance? | Ты умеешь танцевать? | 💃 | dance | глагол
sing | петь | She sings very well. | Она очень хорошо поёт. | 🎤 | singing | глагол
draw | рисовать | My daughter likes to draw. | Моя дочь любит рисовать. | ✏️ | drawing | глагол
take photos | фотографировать | I take photos of the sunset. | Я фотографирую закат. | 📷 | taking photos | выражение
play | играть | We play tennis on Saturday. | По субботам мы играем в теннис. | 🎾 | play | глагол
game | игра | It's a fun game. | Это весёлая игра. | 🎲 | board game | сущ.
party | вечеринка | There is a party tonight. | Сегодня вечеринка. | 🎉 | party | сущ.
relax | отдыхать, расслабиться | I want to relax. | Я хочу отдохнуть. | 😌 | relax | глагол
go out | выходить (развлечься) | Let's go out tonight. | Давай сегодня куда-нибудь сходим. | 🌃 | night out | фразовый глагол` },
    verbs1: { name: 'Глаголы каждого дня — 1', icon: '🏃', group: 'basic', level: 'A0', rows: `
be | быть | I am at home. | Я дома. | 🙂 | person at home | глагол
have | иметь, «у меня есть» | I have a cat. | У меня есть кошка. | 🤲 | holding cat | глагол
do | делать | What do you do? | Чем ты занимаешься? | ✅ | doing homework | глагол
go | идти, ехать | I go to work by bus. | Я езжу на работу на автобусе. | 🚶 | walking street | глагол
come | приходить | Come here, please. | Иди сюда, пожалуйста. | 👋 | waving come here | глагол
want | хотеть | I want some water. | Я хочу воды. | 🙋 | glass of water | глагол
like | нравиться, любить | I like coffee. | Я люблю кофе. | 👍 | cup of coffee | глагол
need | нуждаться, «мне нужно» | I need help. | Мне нужна помощь. | 🆘 | asking for help | глагол
know | знать | I know this word. | Я знаю это слово. | 💡 | light bulb | глагол
think | думать | I think you are right. | Я думаю, ты прав. | 🤔 | thinking person | глагол
see | видеть | I see the sea. | Я вижу море. | 👀 | sea view | глагол
look | смотреть (на) | Look at this photo! | Посмотри на это фото! | 🔍 | looking at photo | глагол
watch | смотреть (фильм, ТВ) | We watch TV in the evening. | Вечером мы смотрим телевизор. | 📺 | watching tv | глагол
listen | слушать | Listen to me, please. | Послушай меня, пожалуйста. | 🎧 | listening headphones | глагол
hear | слышать | I can't hear you. | Я тебя не слышу. | 👂 | ear listening | глагол
say | сказать, говорить (что-то) | Say it again, please. | Скажи это ещё раз, пожалуйста. | 💬 | speech bubble | глагол
speak | говорить (на языке) | Do you speak English? | Вы говорите по-английски? | 🗣️ | people speaking | глагол
talk | разговаривать | We talk every day. | Мы разговариваем каждый день. | 💭 | friends talking | глагол
ask | спрашивать, просить | Can I ask a question? | Можно задать вопрос? | ❓ | raising hand question | глагол
answer | отвечать | Answer the phone, please. | Ответь на звонок, пожалуйста. | 📞 | answering phone | глагол
eat | есть (кушать) | We eat at seven. | Мы едим в семь. | 🍽️ | family eating dinner | глагол
drink | пить | I drink tea every morning. | Я пью чай каждое утро. | 🍵 | drinking tea | глагол
sleep | спать | The baby is sleeping. | Малыш спит. | 😴 | sleeping baby | глагол
live | жить | I live in Moscow. | Я живу в Москве. | 🏠 | house | глагол
work | работать | She works in a bank. | Она работает в банке. | 💼 | working office | глагол` },
    verbs2: { name: 'Глаголы каждого дня — 2', icon: '🙌', group: 'basic', level: 'A1', rows: `
make | делать, готовить, создавать | I make breakfast. | Я готовлю завтрак. | 🥞 | making breakfast | глагол
take | брать | Take an umbrella. | Возьми зонт. | ☂️ | umbrella | глагол
give | давать | Give me the pen, please. | Дай мне ручку, пожалуйста. | 🤲 | giving pen | глагол
get | получать | I get a lot of emails. | Я получаю много писем. | 📩 | email inbox | глагол
put | класть, ставить | Put the bag here. | Поставь сумку сюда. | 👜 | bag on floor | глагол
open | открывать | Open the door, please. | Открой дверь, пожалуйста. | 🚪 | opening door | глагол
close | закрывать | Close the window. | Закрой окно. | 🪟 | closed window | глагол
start | начинать(ся) | The film starts at eight. | Фильм начинается в восемь. | ▶️ | start button | глагол
finish | заканчивать | I finish work at six. | Я заканчиваю работу в шесть. | 🏁 | finish line | глагол
try | пробовать, стараться | Try this cake! | Попробуй этот торт! | 🍰 | piece of cake | глагол
learn | учить, узнавать | I learn English every day. | Я учу английский каждый день. | 📚 | learning english | глагол
study | учиться, заниматься | My son studies at school. | Мой сын учится в школе. | 🎒 | school student | глагол
read | читать | I read before bed. | Я читаю перед сном. | 📖 | reading in bed | глагол
write | писать | Write your name here. | Напишите здесь своё имя. | ✍️ | writing name | глагол
buy | покупать | I buy bread every day. | Я покупаю хлеб каждый день. | 🛒 | buying bread | глагол
pay | платить | Can I pay by card? | Можно оплатить картой? | 💳 | card payment | глагол
call | звонить; звать | Call me tonight. | Позвони мне вечером. | 📱 | phone call | глагол
wait | ждать | Wait for me! | Подожди меня! | ⏳ | waiting | глагол
walk | ходить пешком, гулять | I walk to work. | Я хожу на работу пешком. | 🚶 | walking | глагол
run | бегать | Children run in the park. | Дети бегают в парке. | 🏃 | children running park | глагол
sit | сидеть | Sit down, please. | Садитесь, пожалуйста. | 🪑 | sitting on chair | глагол
stand | стоять | Don't stand there! | Не стой там! | 🧍 | person standing | глагол
play | играть | The kids play football. | Дети играют в футбол. | ⚽ | kids football | глагол
love | любить | I love my family. | Я люблю свою семью. | ❤️ | family hug | глагол
understand | понимать | I understand you. | Я тебя понимаю. | 💡 | understanding | глагол` },
    opposites: { name: 'Наоборот: big — small', icon: '↔️', group: 'basic', level: 'A0', rows: `
big | большой | It's a big house. | Это большой дом. | 🐘 | big elephant | прил.
small | маленький | I have a small dog. | У меня маленькая собака. | 🐭 | small mouse | прил.
hot | горячий, жаркий | The tea is hot. | Чай горячий. | 🔥 | hot tea steam | прил.
cold | холодный | The water is cold. | Вода холодная. | 🧊 | ice cubes | прил.
old | старый | This car is old. | Эта машина старая. | 🚙 | old car | прил.
new | новый | I have a new phone. | У меня новый телефон. | ✨ | new phone | прил.
young | молодой | My teacher is young. | Мой учитель молодой. | 🧑 | young man | прил.
good | хороший | It's a good idea. | Это хорошая идея. | 👍 | thumbs up | прил.
bad | плохой | The weather is bad today. | Сегодня плохая погода. | 👎 | bad weather | прил.
long | длинный | Her hair is long. | У неё длинные волосы. | 📏 | long hair | прил.
short | короткий; невысокий | This film is short. | Этот фильм короткий. | ✂️ | short haircut | прил.
tall | высокий (о человеке, дереве) | My brother is tall. | Мой брат высокий. | 🦒 | giraffe | прил.
fast | быстрый; быстро | This train is fast. | Этот поезд быстрый. | 🚄 | fast train | прил.
slow | медленный | The bus is slow. | Автобус медленный. | 🐌 | snail | прил.
easy | лёгкий, простой | This test is easy. | Этот тест лёгкий. | 😌 | easy test | прил.
difficult | трудный | English is not difficult! | Английский не трудный! | 🧗 | climbing mountain | прил.
full | полный | The bus is full. | Автобус полный. | 🥛 | full glass | прил.
empty | пустой | The fridge is empty. | Холодильник пустой. | 🫙 | empty jar | прил.
noisy | шумный | The street is noisy. | Улица шумная. | 📢 | noisy street | прил.
quiet | тихий | The park is quiet. | В парке тихо. | 🤫 | quiet park | прил.` },
    questions: { name: 'Вопросы: what, who, where', icon: '❓', group: 'basic', level: 'A0', rows: `
what | что; какой | What is your name? | Как тебя зовут? | ❓ | question mark | вопр. слово
who | кто | Who is that man? | Кто тот мужчина? | 🧑 | man portrait | вопр. слово
where | где; куда | Where do you live? | Где ты живёшь? | 📍 | map pin | вопр. слово
when | когда | When is your birthday? | Когда у тебя день рождения? | 📅 | calendar | вопр. слово
why | почему, зачем | Why are you sad? | Почему ты грустишь? | 🤔 | thinking face | вопр. слово
how | как | How do you say it in English? | Как это сказать по-английски? | 🙋 | person asking | вопр. слово
which | который, какой (из) | Which bus goes to the beach? | Какой автобус идёт к пляжу? | 🚌 | bus stop | вопр. слово
whose | чей | Whose phone is this? | Чей это телефон? | 📱 | phone on table | вопр. слово
how much | сколько (стоит; о том, что не считают) | How much is this bag? | Сколько стоит эта сумка? | 💰 | price tag | выражение
how many | сколько (штук) | How many children do you have? | Сколько у тебя детей? | 🔢 | counting | выражение
how old | сколько лет | How old are you? | Сколько тебе лет? | 🎂 | birthday cake | выражение
how long | как долго, сколько времени | How long is the flight? | Сколько длится полёт? | ⏳ | hourglass | выражение
how often | как часто | How often do you go to the gym? | Как часто ты ходишь в спортзал? | 🔁 | calendar repeat | выражение
how far | как далеко | How far is the station? | Далеко ли до вокзала? | 🗺️ | road distance | выражение
what time | во сколько, который час | What time does the shop open? | Во сколько открывается магазин? | 🕐 | clock | выражение
what kind of | какой (какого типа) | What kind of music do you like? | Какую музыку ты любишь? | 🎵 | music | выражение` },
    food: { name: 'Продукты и кухня', icon: '🍞', group: 'basic', level: 'A0', rows: `
bread | хлеб | I buy bread every morning. | Я покупаю хлеб каждое утро. | 🍞 | bread loaf | сущ.
milk | молоко | Do you want some milk? | Хочешь молока? | 🥛 | glass of milk | сущ.
egg | яйцо | I eat two eggs for breakfast. | На завтрак я ем два яйца. | 🥚 | eggs | сущ.
cheese | сыр | I love cheese. | Я обожаю сыр. | 🧀 | cheese | сущ.
butter | сливочное масло | Bread and butter, please. | Хлеб с маслом, пожалуйста. | 🧈 | butter | сущ.
meat | мясо | I don't eat meat. | Я не ем мясо. | 🥩 | raw meat | сущ.
chicken | курица | We have chicken for dinner. | На ужин у нас курица. | 🍗 | roast chicken | сущ.
fish | рыба | The fish is fresh. | Рыба свежая. | 🐟 | fresh fish | сущ.
rice | рис | Rice with vegetables, please. | Рис с овощами, пожалуйста. | 🍚 | bowl of rice | сущ.
vegetables | овощи | Eat your vegetables! | Ешь овощи! | 🥕 | vegetables | сущ.
apple | яблоко | This apple is sweet. | Это яблоко сладкое. | 🍎 | red apple | сущ.
potato | картофель, картошка | I like fried potatoes. | Я люблю жареную картошку. | 🥔 | potatoes | сущ.
sugar | сахар | No sugar, thank you. | Без сахара, спасибо. | 🍬 | sugar | сущ.
salt | соль | Can you pass the salt? | Передай, пожалуйста, соль. | 🧂 | salt shaker | сущ.
knife | нож | The knife is sharp. | Нож острый. | 🔪 | kitchen knife | сущ.
fork | вилка | I need a fork. | Мне нужна вилка. | 🍴 | fork | сущ.
spoon | ложка | Eat your soup with a spoon. | Ешь суп ложкой. | 🥄 | spoon | сущ.
plate | тарелка | Put the plate on the table. | Поставь тарелку на стол. | 🍽️ | plate | сущ.
cup | чашка | A cup of tea, please. | Чашку чая, пожалуйста. | ☕ | cup | сущ.
pan | сковорода | The pan is hot. | Сковорода горячая. | 🍳 | frying pan | сущ.` },
    animals: { name: 'Животные', icon: '🐾', group: 'basic', level: 'A0', rows: `
dog | собака | My dog is very friendly. | Моя собака очень дружелюбная. | 🐕 | dog | сущ.
cat | кошка, кот | The cat is sleeping. | Кошка спит. | 🐈 | cat sleeping | сущ.
bird | птица | A bird is singing. | Поёт птица. | 🐦 | bird | сущ.
horse | лошадь | She rides a horse. | Она катается на лошади. | 🐎 | horse | сущ.
cow | корова | The cow gives milk. | Корова даёт молоко. | 🐄 | cow | сущ.
pig | свинья | The pig is pink. | Свинья розовая. | 🐖 | pig | сущ.
sheep | овца (много — тоже sheep) | There are many sheep on the farm. | На ферме много овец. | 🐑 | sheep | сущ.
duck | утка | The ducks swim in the lake. | Утки плавают в озере. | 🦆 | duck | сущ.
mouse | мышь (много — mice) | A little mouse lives here. | Здесь живёт маленькая мышка. | 🐭 | mouse animal | сущ.
rabbit | кролик | The rabbit eats a carrot. | Кролик ест морковку. | 🐇 | rabbit | сущ.
bear | медведь | There are bears in the forest. | В лесу есть медведи. | 🐻 | bear | сущ.
wolf | волк | The wolf is hungry. | Волк голодный. | 🐺 | wolf | сущ.
fox | лиса | The fox is red. | Лиса рыжая. | 🦊 | fox | сущ.
monkey | обезьяна | Monkeys love bananas. | Обезьяны любят бананы. | 🐒 | monkey | сущ.
elephant | слон | The elephant is very big. | Слон очень большой. | 🐘 | elephant | сущ.
lion | лев | The lion is the king of animals. | Лев — царь зверей. | 🦁 | lion | сущ.
snake | змея | Be careful, a snake! | Осторожно, змея! | 🐍 | snake | сущ.
turtle | черепаха | The turtle is slow. | Черепаха медленная. | 🐢 | turtle | сущ.
dolphin | дельфин | We saw dolphins in the sea. | Мы видели дельфинов в море. | 🐬 | dolphin | сущ.
pet | домашний питомец | Do you have a pet? | У тебя есть питомец? | 🐾 | pet | сущ.` },
    nature: { name: 'Погода и природа', icon: '🌦️', group: 'basic', level: 'A1', rows: `
sun | солнце | The sun is very bright. | Солнце очень яркое. | ☀️ | sun sky | сущ.
cloud | облако, туча | There are no clouds today. | Сегодня нет облаков. | ☁️ | clouds | сущ.
cloudy | облачный, пасмурно | It's cloudy this morning. | Сегодня утром пасмурно. | 🌥️ | cloudy sky | прил.
snow | снег; идёт снег | It often snows in winter. | Зимой часто идёт снег. | ❄️ | snow | сущ.
windy | ветреный; ветрено | It's windy at the beach. | На пляже ветрено. | 🌬️ | windy day | прил.
warm | тёплый; тепло | It's warm today. | Сегодня тепло. | 🌡️ | warm sunny day | прил.
storm | гроза, шторм | There is a storm tonight. | Сегодня ночью гроза. | ⛈️ | storm | сущ.
umbrella | зонт | Take an umbrella, it's raining. | Возьми зонт, идёт дождь. | ☂️ | umbrella rain | сущ.
sky | небо | The sky is blue. | Небо голубое. | 🌌 | blue sky | сущ.
tree | дерево | There is a big tree in our garden. | В нашем саду большое дерево. | 🌳 | tree | сущ.
flower | цветок | These flowers are beautiful. | Эти цветы красивые. | 🌸 | flowers | сущ.
forest | лес | We walk in the forest. | Мы гуляем в лесу. | 🌲 | forest | сущ.
mountain | гора | The mountains are very high. | Горы очень высокие. | ⛰️ | mountains | сущ.
river | река | The river is wide. | Река широкая. | 🏞️ | river | сущ.
lake | озеро | We swim in the lake. | Мы купаемся в озере. | 💧 | lake | сущ.
island | остров | Bali is an island. | Бали — это остров. | 🏝️ | tropical island | сущ.
spring | весна | Spring is my favourite season. | Весна — моё любимое время года. | 🌷 | spring flowers | сущ.
autumn | осень | The leaves are yellow in autumn. | Осенью листья жёлтые. | 🍂 | autumn leaves | сущ.
season | время года, сезон | What season is it now? | Какое сейчас время года? | 🔄 | four seasons | сущ.
temperature | температура | The temperature is 30 degrees. | Температура 30 градусов. | 🌡️ | thermometer | сущ.` },
    places: { name: 'Предлоги места: in, on, under…', icon: '📦', group: 'basic', level: 'A0', rows: `
in | в (внутри) | The keys are in my bag. | Ключи в моей сумке. | 👜 | keys in bag | предлог
on | на (на поверхности) | The book is on the table. | Книга на столе. | 📖 | book on table | предлог
under | под | The cat is under the bed. | Кошка под кроватью. | 🐈 | cat under bed | предлог
next to | рядом с | The bank is next to the shop. | Банк рядом с магазином. | 🏦 | buildings side by side | предлог
behind | за, позади | The garden is behind the house. | Сад за домом. | 🏡 | garden behind house | предлог
in front of | перед | The taxi is in front of the hotel. | Такси перед отелем. | 🚕 | taxi hotel entrance | предлог
between | между | The café is between the bank and the park. | Кафе между банком и парком. | ↔️ | between two | предлог
above | над (выше) | There is a lamp above the table. | Над столом висит лампа. | 💡 | lamp above table | предлог
opposite | напротив | The pharmacy is opposite the station. | Аптека напротив вокзала. | 🔄 | street opposite | предлог
at | у, в (в каком-то месте) | I'm at home. | Я дома. | 🏠 | at home | предлог
inside | внутри | It's warm inside. | Внутри тепло. | 🏠 | cozy room inside | наречие
outside | снаружи, на улице | The children play outside. | Дети играют на улице. | 🌳 | children playing outside | наречие
on the left | слева | The door is on the left. | Дверь слева. | ⬅️ | left arrow | выражение
on the right | справа | The shop is on the right. | Магазин справа. | ➡️ | right arrow | выражение
into | в (движение внутрь) | Put the milk into the fridge. | Поставь молоко в холодильник. | 📥 | putting into fridge | предлог
out of | из (движение наружу) | Take the phone out of your bag. | Достань телефон из сумки. | 📤 | taking out of bag | предлог
over | над, через | The bird flies over the house. | Птица летит над домом. | 🐦 | bird flying over house | предлог
around | вокруг | We walk around the lake. | Мы гуляем вокруг озера. | 🔄 | walking around lake | предлог` },
    // ===== Следующий шаг: A2 =====
    transport: { name: 'Транспорт и дорога', icon: '🚌', group: 'next', level: 'A2', rows: `
bus stop | автобусная остановка | The bus stop is near my house. | Остановка рядом с моим домом. | 🚏 | bus stop | выражение
timetable | расписание | Check the bus timetable. | Посмотри расписание автобусов. | 🗒️ | bus timetable | сущ.
platform | платформа | The train leaves from platform two. | Поезд отходит со второй платформы. | 🚉 | train platform | сущ.
single ticket | билет в одну сторону | A single ticket to Oxford, please. | Билет в одну сторону до Оксфорда, пожалуйста. | 🎟️ | train ticket | выражение
return ticket | билет туда и обратно | A return ticket is cheaper. | Билет туда и обратно дешевле. | 🔁 | return ticket | выражение
get on | садиться (в автобус, поезд) | Get on the bus here. | Садись в автобус здесь. | 🚌 | getting on bus | фразовый глагол
get off | выходить (из автобуса, поезда) | Get off at the next stop. | Выходи на следующей остановке. | 🚶 | getting off bus | фразовый глагол
miss | опоздать на (автобус, поезд) | I missed the last train. | Я опоздала на последний поезд. | 🏃 | running for train | глагол
traffic jam | пробка | We were in a traffic jam for an hour. | Мы стояли в пробке час. | 🚗 | traffic jam | выражение
rush hour | час пик | Don't drive in rush hour. | Не езди в час пик. | ⏰ | rush hour traffic | выражение
driving licence | водительские права | Do you have a driving licence? | У тебя есть права? | 🪪 | driving licence card | выражение
petrol station | заправка | Stop at the petrol station. | Остановись на заправке. | ⛽ | petrol station | выражение
crossroads | перекрёсток | Turn right at the crossroads. | На перекрёстке поверни направо. | ✖️ | crossroads | сущ.
traffic lights | светофор | Stop at the traffic lights. | Остановись на светофоре. | 🚦 | traffic lights | выражение
park | парковаться | Where can I park? | Где можно припарковаться? | 🅿️ | parking lot | глагол
seat belt | ремень безопасности | Fasten your seat belt. | Пристегни ремень безопасности. | 💺 | seat belt | выражение
helmet | шлем | Always wear a helmet on a bike. | На мотобайке всегда надевай шлем. | ⛑️ | motorbike helmet | сущ.
journey | поездка, путь | The journey takes two hours. | Дорога занимает два часа. | 🛣️ | road trip | сущ.` },
    tech: { name: 'Техника и телефон', icon: '📱', group: 'next', level: 'A2', rows: `
charger | зарядка | I forgot my charger. | Я забыла зарядку. | 🔌 | phone charger | сущ.
battery | батарея, аккумулятор | My battery is low. | У меня садится батарея. | 🔋 | low battery | сущ.
charge | заряжать | Can I charge my phone here? | Можно здесь зарядить телефон? | ⚡ | charging phone | глагол
screen | экран | The screen is broken. | Экран разбит. | 📱 | cracked phone screen | сущ.
turn on | включать | Turn on the light, please. | Включи свет, пожалуйста. | 💡 | turning on switch | фразовый глагол
turn off | выключать | Turn off your phone in the cinema. | Выключи телефон в кино. | 📴 | phone off | фразовый глагол
download | скачать | Download the app. | Скачай приложение. | ⬇️ | download | глагол
update | обновление; обновлять | My phone needs an update. | Телефону нужно обновление. | 🔄 | software update | сущ.
password | пароль | I forgot my password. | Я забыла пароль. | 🔒 | password login | сущ.
headphones | наушники | I listen to podcasts in headphones. | Я слушаю подкасты в наушниках. | 🎧 | headphones | сущ.
laptop | ноутбук | I work on my laptop. | Я работаю на ноутбуке. | 💻 | laptop | сущ.
keyboard | клавиатура | The keyboard is in English. | Клавиатура на английском. | ⌨️ | keyboard | сущ.
signal | сигнал, связь | There is no signal here. | Здесь нет связи. | 📶 | phone signal | сущ.
call back | перезвонить | I'll call you back later. | Я перезвоню тебе позже. | 📞 | phone call | фразовый глагол
voice message | голосовое сообщение | She sent me a voice message. | Она прислала мне голосовое. | 🎙️ | voice message | выражение
plug in | подключить, воткнуть в розетку | Plug in the kettle. | Включи чайник в розетку. | 🔌 | plugging in | фразовый глагол
it doesn't work | не работает | My camera doesn't work. | У меня не работает камера. | 🛠️ | broken device | выражение` },
    online: { name: 'Интернет и соцсети', icon: '🌐', group: 'next', level: 'A2', rows: `
post | публикация, пост; публиковать | I liked your post. | Мне понравился твой пост. | 📝 | social media post | сущ.
share | делиться, поделиться | Share the link with me. | Поделись со мной ссылкой. | 🔗 | sharing link | глагол
link | ссылка | Send me the link. | Пришли мне ссылку. | 🔗 | hyperlink | сущ.
follow | подписаться на | I follow her on Instagram. | Я подписана на неё в Инстаграме. | ➕ | follow button | глагол
follower | подписчик | He has many followers. | У него много подписчиков. | 👥 | followers | сущ.
comment | комментарий; комментировать | Leave a comment below. | Оставьте комментарий ниже. | 💬 | comment | сущ.
search | искать (в интернете) | Search for it on Google. | Поищи это в Гугле. | 🔍 | search bar | глагол
website | сайт | The website is in English. | Сайт на английском. | 🖥️ | website | сущ.
account | аккаунт, учётная запись | Create a new account. | Создай новый аккаунт. | 👤 | user account | сущ.
log in | войти (в аккаунт) | I can't log in. | Я не могу войти. | 🔑 | login screen | фразовый глагол
log out | выйти (из аккаунта) | Don't forget to log out. | Не забудь выйти из аккаунта. | 🚪 | logout | фразовый глагол
online | в сети, онлайн | Are you online now? | Ты сейчас в сети? | 🟢 | online status | наречие
upload | загрузить (на сайт) | I uploaded the photos. | Я загрузила фотографии. | ⬆️ | uploading | глагол
message | сообщение; писать сообщение | Message me when you are free. | Напиши мне, когда освободишься. | ✉️ | chat message | сущ.
block | заблокировать | She blocked him. | Она его заблокировала. | 🚫 | block user | глагол
fake | фальшивый, фейк | This news is fake. | Это фейковая новость. | 🎭 | fake news | прил.
Wi-Fi password | пароль от Wi-Fi | What's the Wi-Fi password? | Какой пароль от Wi-Fi? | 📶 | wifi sign | выражение` },
    doctor: { name: 'Врач и аптека', icon: '💊', group: 'next', level: 'A2', rows: `
appointment | запись (к врачу), встреча | I have an appointment at ten. | Я записана на десять. | 📅 | doctor appointment | сущ.
pharmacy | аптека | Is there a pharmacy near here? | Здесь есть аптека рядом? | ⚕️ | pharmacy | сущ.
prescription | рецепт (врача) | You need a prescription. | Вам нужен рецепт. | 📝 | prescription | сущ.
pill | таблетка | Take one pill after dinner. | Принимай одну таблетку после ужина. | 💊 | pills | сущ.
symptom | симптом | What are your symptoms? | Какие у вас симптомы? | 🩺 | doctor | сущ.
fever | температура, жар | She has a fever. | У неё температура. | 🌡️ | thermometer | сущ.
cough | кашель; кашлять | I have a bad cough. | У меня сильный кашель. | 😷 | coughing | сущ.
sore throat | больное горло | I've got a sore throat. | У меня болит горло. | 🗣️ | sore throat | выражение
headache | головная боль | I have a headache. | У меня болит голова. | 🤕 | headache | сущ.
allergic to | аллергия на | I'm allergic to nuts. | У меня аллергия на орехи. | 🥜 | allergy | выражение
hurt | болеть, причинять боль | My back hurts. | У меня болит спина. | 🤕 | back pain | глагол
injection | укол | The nurse gave me an injection. | Медсестра сделала мне укол. | 💉 | injection | сущ.
insurance | страховка | Do you have travel insurance? | У вас есть страховка для путешествий? | 📄 | insurance | сущ.
get better | выздоравливать | I hope you get better soon. | Надеюсь, ты скоро поправишься. | 🌱 | recovery | фразовый глагол
twice a day | два раза в день | Take it twice a day. | Принимай это два раза в день. | 2️⃣ | medicine schedule | выражение
How do you feel? | Как вы себя чувствуете? | How do you feel today? | Как ты себя чувствуешь сегодня? | 🙂 | doctor talking | выражение
I feel sick | меня тошнит, мне плохо | I feel sick after the boat. | Мне плохо после лодки. | 🤢 | seasick | выражение` },
    tripproblems: { name: 'Проблемы в поездке', icon: '🧳', group: 'next', level: 'A2', rows: `
delayed | задержан (рейс) | Our flight is delayed. | Наш рейс задержали. | ⏳ | departure board delayed | прил.
cancelled | отменён | The train is cancelled. | Поезд отменили. | ❌ | cancelled flight | прил.
lost | потерянный; потерялся | I'm lost. | Я заблудилась. | 🧭 | lost tourist map | прил.
lose | терять | I lost my wallet. | Я потеряла кошелёк. | 👛 | lost wallet | глагол
stolen | украден | My bag was stolen. | У меня украли сумку. | 🦹 | stolen bag | прил.
refund | возврат денег | Can I get a refund? | Можно вернуть деньги? | 💸 | refund | сущ.
complain | жаловаться | I want to complain about the room. | Я хочу пожаловаться на номер. | 😠 | complaint | глагол
connection | пересадка; связь | I missed my connection. | Я опоздала на пересадку. | 🔀 | connecting flight | сущ.
lost luggage | потерянный багаж | Where is the lost luggage office? | Где офис потерянного багажа? | 🧳 | baggage claim | выражение
embassy | посольство | Call the embassy. | Позвоните в посольство. | 🏛️ | embassy | сущ.
police station | полицейский участок | Where is the police station? | Где полицейский участок? | 🚓 | police station | выражение
emergency | экстренный случай | It's an emergency! | Это экстренный случай! | 🚨 | emergency | сущ.
help | помощь; помогать | Can you help me, please? | Вы можете мне помочь, пожалуйста? | 🆘 | help | глагол
wrong | неправильный, не тот | This is the wrong room. | Это не тот номер. | ❗ | wrong way | прил.
overbooked | перебронирован | The hotel is overbooked. | В отеле нет мест — перебронирование. | 🏨 | hotel reception | прил.
compensation | компенсация | We want compensation. | Мы хотим компенсацию. | 💰 | compensation money | сущ.
What should I do? | Что мне делать? | I lost my passport. What should I do? | Я потеряла паспорт. Что мне делать? | 🤷 | confused traveler | выражение` },
    bank: { name: 'Банк и деньги', icon: '🏦', group: 'next', level: 'A2', rows: `
bank account | банковский счёт | I want to open a bank account. | Я хочу открыть счёт в банке. | 🏦 | bank | выражение
card | карта (банковская) | Can I pay by card? | Можно оплатить картой? | 💳 | credit card | сущ.
cash | наличные | I only have cash. | У меня только наличные. | 💵 | cash money | сущ.
cash machine | банкомат | Is there a cash machine here? | Здесь есть банкомат? | 🏧 | atm machine | выражение
withdraw | снять (деньги) | I need to withdraw some money. | Мне нужно снять деньги. | 🏧 | withdrawing cash | глагол
exchange | обменять | Where can I exchange dollars? | Где можно обменять доллары? | 💱 | currency exchange | глагол
exchange rate | курс валют | What is the exchange rate today? | Какой сегодня курс? | 📈 | exchange rate board | выражение
fee | комиссия, плата | Is there a fee? | Есть комиссия? | 🧾 | bank fee | сущ.
transfer | перевод; переводить | I'll make a transfer tomorrow. | Я сделаю перевод завтра. | 🔁 | bank transfer | сущ.
save | копить, откладывать | I save money for a trip. | Я коплю на поездку. | 🐷 | piggy bank | глагол
spend | тратить | We spend a lot on food. | Мы много тратим на еду. | 🛍️ | shopping bags | глагол
borrow | брать в долг | Can I borrow ten dollars? | Можно занять у тебя десять долларов? | 🤲 | borrowing money | глагол
lend | давать в долг | I can lend you some money. | Я могу дать тебе денег в долг. | 🤝 | lending money | глагол
afford | позволить себе (по деньгам) | I can't afford a new car. | Я не могу позволить себе новую машину. | 🚗 | expensive car | глагол
receipt | чек | Can I have a receipt, please? | Можно чек, пожалуйста? | 🧾 | receipt | сущ.
change | сдача | Keep the change. | Сдачи не надо. | 🪙 | coins | сущ.
PIN | пин-код | Enter your PIN. | Введите пин-код. | 🔢 | card pin pad | сущ.` },
    character2: { name: 'Эмоции и характер — 2', icon: '🎭', group: 'next', level: 'A2', rows: `
proud | гордый, горжусь | I'm proud of you. | Я горжусь тобой. | 🦁 | proud | прил.
embarrassed | смущён, неловко | I was so embarrassed! | Мне было так неловко! | 😳 | embarrassed face | прил.
jealous | ревнивый, завидующий | He is jealous of his brother. | Он завидует брату. | 😒 | jealous | прил.
nervous | нервный, волнуюсь | I'm nervous before the exam. | Я волнуюсь перед экзаменом. | 😬 | nervous | прил.
relaxed | расслабленный, спокойный | I feel relaxed on the beach. | На пляже я расслаблена. | 😌 | relaxing hammock | прил.
disappointed | разочарован | I'm disappointed with the hotel. | Я разочарована отелем. | 😞 | disappointed | прил.
surprised | удивлён | She was surprised to see me. | Она удивилась, увидев меня. | 😮 | surprised face | прил.
confident | уверенный | Be confident when you speak. | Говори уверенно. | 😎 | confident woman | прил.
shy | застенчивый | My son is a bit shy. | Мой сын немного застенчивый. | 🙈 | shy child | прил.
patient | терпеливый | A good teacher is patient. | Хороший учитель терпеливый. | 🧘 | patient teacher | прил.
honest | честный | Thank you for being honest. | Спасибо за честность. | 🤝 | handshake | прил.
lazy | ленивый | I'm lazy on Sundays. | По воскресеньям я ленивая. | 🦥 | sloth | прил.
hard-working | трудолюбивый | She is very hard-working. | Она очень трудолюбивая. | 💪 | hard working | прил.
generous | щедрый | My grandma is generous. | Моя бабушка щедрая. | 🎁 | gift | прил.
selfish | эгоистичный | Don't be selfish. | Не будь эгоистом. | 🙅 | selfish | прил.
moody | с переменчивым настроением | He is moody in the morning. | По утрам у него скачет настроение. | 🌦️ | moody person | прил.
easy-going | лёгкий в общении, спокойный | My husband is easy-going. | Мой муж спокойный и лёгкий человек. | 😊 | relaxed friends | прил.` },
    phrasal1: { name: 'Фразовые глаголы — 1', icon: '🧩', group: 'next', level: 'A2', rows: `
get up | вставать (с кровати) | I get up at seven. | Я встаю в семь. | ⏰ | alarm clock morning | фразовый глагол
wake up | просыпаться | I wake up before the alarm. | Я просыпаюсь до будильника. | 🥱 | waking up | фразовый глагол
look for | искать | I'm looking for my keys. | Я ищу ключи. | 🔍 | looking for keys | фразовый глагол
look after | присматривать, заботиться | Can you look after my cat? | Можешь присмотреть за моей кошкой? | 🐈 | pet sitter | фразовый глагол
put on | надевать | Put on your jacket. | Надень куртку. | 🧥 | putting on jacket | фразовый глагол
take off | снимать (одежду); взлетать | Take off your shoes, please. | Сними обувь, пожалуйста. | 👟 | taking off shoes | фразовый глагол
sit down | садиться | Please sit down. | Садитесь, пожалуйста. | 🪑 | sitting down | фразовый глагол
stand up | вставать (на ноги) | Stand up, please. | Встаньте, пожалуйста. | 🧍 | standing up | фразовый глагол
go out | выходить (из дома), гулять | We go out on Fridays. | По пятницам мы ходим куда-нибудь. | 🌃 | night out | фразовый глагол
come back | возвращаться | When do you come back? | Когда ты вернёшься? | ↩️ | coming home | фразовый глагол
give up | бросить (привычку), сдаться | Don't give up! | Не сдавайся! | 🏳️ | giving up | фразовый глагол
find out | узнать, выяснить | I want to find out the price. | Я хочу узнать цену. | 💡 | finding out | фразовый глагол
fill in | заполнить (анкету) | Fill in this form, please. | Заполните эту форму, пожалуйста. | 📝 | filling form | фразовый глагол
pick up | забрать (кого-то); поднять | I pick up my son at three. | Я забираю сына в три. | 🚗 | picking up child | фразовый глагол
throw away | выбросить | Throw away the old bread. | Выброси старый хлеб. | 🗑️ | trash bin | фразовый глагол
try on | примерить | Can I try on this dress? | Можно примерить это платье? | 👗 | fitting room | фразовый глагол
hurry up | поторопиться | Hurry up, we're late! | Поторопись, мы опаздываем! | 🏃 | hurry | фразовый глагол
slow down | замедлиться | Slow down, please. | Помедленнее, пожалуйста. | 🐢 | slow down sign | фразовый глагол` },
    // ===== Следующий шаг: B1 =====
    phrasal2: { name: 'Фразовые глаголы — 2', icon: '🧠', group: 'next', level: 'B1', rows: `
get on with | ладить с | I get on well with my boss. | Я хорошо лажу с начальником. | 🤝 | colleagues smiling | фразовый глагол
look forward to | ждать с нетерпением | I'm looking forward to the trip. | Я с нетерпением жду поездки. | 🤩 | excited traveler | фразовый глагол
run out of | закончиться (о запасах) | We've run out of milk. | У нас закончилось молоко. | 🥛 | empty milk carton | фразовый глагол
put off | откладывать (на потом) | Don't put off your homework. | Не откладывай домашку. | 🐌 | procrastination | фразовый глагол
carry on | продолжать | Carry on, I'm listening. | Продолжай, я слушаю. | ▶️ | continue | фразовый глагол
set up | основать, настроить | She set up her own business. | Она открыла свой бизнес. | 🏗️ | startup office | фразовый глагол
work out | тренироваться; разобраться | I work out three times a week. | Я тренируюсь три раза в неделю. | 🏋️ | gym workout | фразовый глагол
turn down | отклонить; убавить | He turned down the job offer. | Он отказался от предложения о работе. | 👎 | declining offer | фразовый глагол
bring up | воспитывать; поднимать тему | She brought up three children. | Она вырастила троих детей. | 👪 | family children | фразовый глагол
come up with | придумать | We came up with a great idea. | Мы придумали отличную идею. | 💡 | idea lightbulb | фразовый глагол
take up | начать заниматься (хобби) | I took up surfing last year. | В прошлом году я начала заниматься сёрфингом. | 🏄 | surfing beginner | фразовый глагол
deal with | справляться, иметь дело с | I can deal with it. | Я могу с этим справиться. | 🛠️ | solving problem | фразовый глагол
get over | пережить, прийти в себя | It took me a month to get over the flu. | Мне понадобился месяц, чтобы оправиться от гриппа. | 🌈 | recovery | фразовый глагол
show off | хвастаться | Stop showing off! | Хватит хвастаться! | 🦚 | peacock | фразовый глагол
end up | в итоге оказаться | We ended up in a small café. | В итоге мы оказались в маленьком кафе. | 📍 | small cafe | фразовый глагол
figure out | разобраться, понять | I can't figure out this app. | Не могу разобраться в этом приложении. | 🧩 | puzzle | фразовый глагол
let down | подвести | Don't let me down. | Не подведи меня. | 😔 | disappointed friend | фразовый глагол
catch up | наверстать; догнать | Let's meet and catch up. | Давай встретимся и поболтаем обо всём. | ☕ | friends coffee | фразовый глагол` },
    makedo: { name: 'make, do, take, have', icon: '🔧', group: 'next', level: 'B1', rows: `
make a mistake | сделать ошибку | Everyone makes mistakes. | Все ошибаются. | ❌ | mistake | выражение
make a decision | принять решение | I need to make a decision. | Мне нужно принять решение. | ⚖️ | decision | выражение
make money | зарабатывать деньги | He makes money online. | Он зарабатывает в интернете. | 💰 | making money | выражение
make friends | заводить друзей | It's easy to make friends here. | Здесь легко заводить друзей. | 🧑‍🤝‍🧑 | making friends | выражение
make a plan | составить план | Let's make a plan for the weekend. | Давай составим план на выходные. | 🗺️ | planning | выражение
do homework | делать домашку | I do my homework in the evening. | Я делаю домашку вечером. | 📚 | homework | выражение
do the shopping | ходить за покупками | I do the shopping on Saturday. | Я хожу за покупками в субботу. | 🛒 | grocery shopping | выражение
do exercise | делать упражнения, заниматься спортом | Do some exercise every day. | Занимайся спортом каждый день. | 🤸 | exercise | выражение
do your best | постараться изо всех сил | Just do your best. | Просто постарайся как можешь. | 🌟 | best effort | выражение
do a favour | сделать одолжение | Can you do me a favour? | Можешь сделать мне одолжение? | 🙏 | favor | выражение
take a photo | сфотографировать | Can you take a photo of us? | Можете нас сфотографировать? | 📸 | taking photo | выражение
take a break | сделать перерыв | Let's take a break. | Давай сделаем перерыв. | ☕ | coffee break | выражение
take a risk | рискнуть | Sometimes you have to take a risk. | Иногда нужно рискнуть. | 🎲 | risk | выражение
take part in | участвовать в | I took part in a surf contest. | Я участвовала в соревновании по сёрфингу. | 🏅 | competition | выражение
have a look | взглянуть | Can I have a look? | Можно взглянуть? | 👀 | looking | выражение
have fun | веселиться | Have fun at the party! | Повеселись на вечеринке! | 🎉 | party | выражение
have a rest | отдохнуть | You need to have a rest. | Тебе нужно отдохнуть. | 🛋️ | resting sofa | выражение
have a chat | поболтать | We had a chat after class. | Мы поболтали после урока. | 💬 | chatting friends | выражение` },
    linkers: { name: 'Слова-связки', icon: '🔗', group: 'next', level: 'B1', rows: `
however | однако | It was cold. However, we went swimming. | Было холодно. Однако мы пошли купаться. | ↔️ | contrast | наречие
although | хотя | Although it rained, we had fun. | Хотя шёл дождь, нам было весело. | 🌧️ | rain fun | союз
so that | чтобы | I study English so that I can travel. | Я учу английский, чтобы путешествовать. | 🎯 | goal | союз
because of | из-за | We stayed home because of the rain. | Мы остались дома из-за дождя. | 🌧️ | rainy window | предлог
in order to | для того чтобы | He works hard in order to save money. | Он много работает, чтобы копить деньги. | 🎯 | target | выражение
as well | тоже, также | I like tea as well. | Я тоже люблю чай. | ➕ | plus | наречие
instead of | вместо | Let's walk instead of taking a taxi. | Давай пройдёмся вместо такси. | 🔄 | walking street | предлог
unless | если не | I'll come unless it rains. | Я приду, если не будет дождя. | ❔ | question | союз
while | пока, в то время как | I listen to podcasts while I cook. | Я слушаю подкасты, пока готовлю. | ⏱️ | cooking | союз
as soon as | как только | Call me as soon as you arrive. | Позвони, как только приедешь. | 📞 | phone call | союз
in the end | в конце концов | In the end, we found the hotel. | В конце концов мы нашли отель. | 🏁 | finish | выражение
anyway | в любом случае, ну ладно | Anyway, let's go. | Ну ладно, пойдём. | 🤷 | shrug | наречие
actually | на самом деле | Actually, I'm from Moscow. | Вообще-то я из Москвы. | ☝️ | point | наречие
for example | например | I like fruit, for example mango. | Я люблю фрукты, например манго. | 🥭 | mango | выражение
on the other hand | с другой стороны | On the other hand, it's cheap. | С другой стороны, это дёшево. | 🤲 | two hands | выражение
first of all | прежде всего | First of all, thank you. | Прежде всего — спасибо. | 1️⃣ | first | выражение
finally | наконец, в итоге | Finally, we got home. | Наконец мы добрались домой. | 🏠 | home | наречие` },
    opinion: { name: 'Мнение и спор', icon: '🗣️', group: 'next', level: 'B1', rows: `
I think | я думаю | I think it's a good idea. | Я думаю, это хорошая идея. | 💭 | thinking | выражение
In my opinion | по-моему | In my opinion, the film is too long. | По-моему, фильм слишком длинный. | 🧐 | opinion | выражение
I agree | я согласна | I agree with you. | Я с тобой согласна. | 👍 | agree | выражение
I disagree | я не согласна | Sorry, I disagree. | Извини, я не согласна. | 👎 | disagree | выражение
I doubt it | сомневаюсь | Will he come? — I doubt it. | Он придёт? — Сомневаюсь. | 🤨 | doubt | выражение
That's true | это правда | That's true, but it's expensive. | Это правда, но это дорого. | ✅ | true | выражение
I'm not sure | я не уверена | I'm not sure about that. | Я не уверена насчёт этого. | 🤔 | unsure | выражение
It depends | зависит от обстоятельств | Is it safe? — It depends. | Это безопасно? — Смотря как. | ⚖️ | balance scale | выражение
point | довод, мысль | That's a good point. | Это хороший довод. | 📌 | point | сущ.
argue | спорить | They always argue about money. | Они всегда спорят о деньгах. | 😤 | arguing couple | глагол
convince | убедить | You convinced me. | Ты меня убедила. | 🤝 | handshake | глагол
prefer | предпочитать | I prefer tea to coffee. | Я предпочитаю чай кофе. | ☕ | tea | глагол
advantage | преимущество | One advantage is the price. | Одно преимущество — цена. | ➕ | plus sign | сущ.
disadvantage | недостаток | The main disadvantage is the noise. | Главный недостаток — шум. | ➖ | minus sign | сущ.
Exactly! | Точно! Именно! | Exactly! That's what I mean. | Именно! Это я и имею в виду. | 🎯 | target | выражение
What do you mean? | Что ты имеешь в виду? | What do you mean by "soon"? | Что ты имеешь в виду под «скоро»? | ❓ | question | выражение
To be honest | честно говоря | To be honest, I don't like it. | Честно говоря, мне не нравится. | 🙊 | confession | выражение` },
    career: { name: 'Работа и карьера', icon: '📈', group: 'next', level: 'B1', rows: `
job interview | собеседование | I have a job interview tomorrow. | Завтра у меня собеседование. | 🤝 | job interview | выражение
salary | зарплата | The salary is good. | Зарплата хорошая. | 💵 | salary | сущ.
deadline | срок сдачи, дедлайн | The deadline is Friday. | Срок — пятница. | ⏰ | deadline calendar | сущ.
apply for | подать заявку на | I applied for a new job. | Я подала заявку на новую работу. | 📨 | job application | фразовый глагол
CV | резюме | Send us your CV. | Пришлите нам резюме. | 📄 | resume cv | сущ.
experience | опыт | Do you have any experience? | У вас есть опыт? | 🧳 | work experience | сущ.
skills | навыки | What are your skills? | Какие у вас навыки? | 🛠️ | skills | сущ.
colleague | коллега | My colleagues are friendly. | Мои коллеги дружелюбные. | 👥 | colleagues | сущ.
manager | руководитель | Talk to your manager. | Поговори со своим руководителем. | 🧑‍💼 | manager | сущ.
meeting | встреча, совещание | The meeting starts at nine. | Совещание начинается в девять. | 📊 | business meeting | сущ.
promotion | повышение | She got a promotion. | Её повысили. | 🚀 | promotion | сущ.
quit | уволиться, бросить | He quit his job last month. | Он уволился в прошлом месяце. | 🚪 | quitting job | глагол
be fired | быть уволенным | He was fired for being late. | Его уволили за опоздания. | 🔥 | fired | выражение
part-time | неполный день | I work part-time. | Я работаю неполный день. | 🕐 | part time | прил.
full-time | полный день | It's a full-time job. | Это работа на полный день. | 🕘 | full time office | прил.
freelance | фриланс, на себя | I work freelance from home. | Я работаю на фрилансе из дома. | 🏝️ | remote work laptop beach | прил.
work from home | работать из дома | On Mondays I work from home. | По понедельникам я работаю из дома. | 🏠 | home office | выражение
responsible for | отвечать за | I'm responsible for marketing. | Я отвечаю за маркетинг. | 📋 | checklist | выражение` },
    eco: { name: 'Природа и экология', icon: '🌍', group: 'next', level: 'B1', rows: `
environment | окружающая среда | We must protect the environment. | Мы должны защищать окружающую среду. | 🌍 | nature environment | сущ.
pollution | загрязнение | Air pollution is a big problem. | Загрязнение воздуха — большая проблема. | 🏭 | air pollution | сущ.
plastic | пластик | There is a lot of plastic on the beach. | На пляже много пластика. | 🥤 | plastic waste beach | сущ.
recycle | перерабатывать | We recycle bottles and paper. | Мы сдаём бутылки и бумагу в переработку. | ♻️ | recycling | глагол
waste | отходы; тратить впустую | Don't waste water. | Не трать воду зря. | 🗑️ | waste | сущ.
rubbish | мусор | Take the rubbish out. | Вынеси мусор. | 🚮 | rubbish bin | сущ.
climate change | изменение климата | Climate change affects everyone. | Изменение климата касается всех. | 🌡️ | climate change | выражение
global warming | глобальное потепление | Global warming melts the ice. | Глобальное потепление растапливает лёд. | 🧊 | melting ice | выражение
energy | энергия | Solar energy is clean. | Солнечная энергия чистая. | ⚡ | solar panels | сущ.
save energy | экономить энергию | Turn off the light to save energy. | Выключай свет, чтобы экономить энергию. | 💡 | light bulb | выражение
endangered | вымирающий, под угрозой | Sea turtles are endangered. | Морские черепахи под угрозой исчезновения. | 🐢 | sea turtle | прил.
species | вид (животных, растений) | Many species live in the forest. | В лесу живёт много видов. | 🦋 | wildlife species | сущ.
forest | лес | The forest is on fire. | Лес горит. | 🌲 | forest | сущ.
ocean | океан | The ocean is full of life. | Океан полон жизни. | 🌊 | ocean | сущ.
protect | защищать | Volunteers protect the beach. | Волонтёры защищают пляж. | 🛡️ | beach cleanup volunteers | глагол
reusable | многоразовый | I use a reusable bottle. | Я пользуюсь многоразовой бутылкой. | 🍶 | reusable bottle | прил.
natural disaster | стихийное бедствие | A flood is a natural disaster. | Наводнение — стихийное бедствие. | 🌪️ | natural disaster | выражение` },
  };
  // Уровень старых наборов (у новых — поле level прямо в описании)
  const LEVEL = { talk: 'A0', family: 'A0', clothes: 'A0', cafe: 'A0', time: 'A0', home: 'A1', body: 'A1', city: 'A1', feelings: 'A1', hobby: 'A1', work: 'A1',
    shop: 'A1', travel: 'A1', beach: 'A1', sport: 'A1', irregular: 'A1', rent: 'A2' };
  const SETS = Object.keys(RAW).map(id => {
    const s = RAW[id];
    const words = s.rows.trim().split('\n').map(line => {
      const [en, ru, example, exampleRu, emoji, imageQuery, pos] = line.split('|').map(x => x.trim());
      return { en, ru, example, exampleRu, emoji, imageQuery, pos };
    });
    return { id, name: s.name, icon: s.icon, level: s.level || LEVEL[id] || 'A1', group: s.group || (id === 'irregular' ? 'verbs' : 'travel'), words };
  });
  // Порядок: сначала самые нужные слова, потом общие темы, путешествия, следующий шаг (A2–B1), глаголы; внутри группы — по уровню
  const GORDER = { basic: 0, general: 1, travel: 2, next: 3, verbs: 4 };
  const LORDER = { A0: 0, A1: 1, A2: 2, B1: 3 };
  SETS.forEach((x, i) => { x._i = i; });
  SETS.sort((a, b) => GORDER[a.group] - GORDER[b.group] || LORDER[a.level] - LORDER[b.level] || a._i - b._i);
  SETS.forEach(x => { delete x._i; });
  window.ReadySets = SETS;
  window.ReadyLevels = ['A0', 'A1', 'A2', 'B1'];
  window.ReadyGroups = { basic: 'Основа: самые нужные слова', general: 'Общие темы', travel: 'Путешествия и жизнь у моря', next: 'Следующий шаг: A2 и B1', verbs: 'Глаголы' };
})();
