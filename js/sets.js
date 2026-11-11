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
  // Порядок: сначала самые нужные слова, потом общие темы, путешествия, глаголы; внутри группы — по уровню
  const GORDER = { basic: 0, general: 1, travel: 2, verbs: 3 };
  const LORDER = { A0: 0, A1: 1, A2: 2, B1: 3 };
  SETS.forEach((x, i) => { x._i = i; });
  SETS.sort((a, b) => GORDER[a.group] - GORDER[b.group] || LORDER[a.level] - LORDER[b.level] || a._i - b._i);
  SETS.forEach(x => { delete x._i; });
  window.ReadySets = SETS;
  window.ReadyLevels = ['A0', 'A1', 'A2', 'B1'];
  window.ReadyGroups = { basic: 'Основа: самые нужные слова', general: 'Общие темы', travel: 'Путешествия и жизнь у моря', verbs: 'Глаголы' };
})();
