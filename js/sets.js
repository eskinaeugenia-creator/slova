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
  };
  const SETS = Object.keys(RAW).map(id => {
    const s = RAW[id];
    const words = s.rows.trim().split('\n').map(line => {
      const [en, ru, example, exampleRu, emoji, imageQuery, pos] = line.split('|').map(x => x.trim());
      return { en, ru, example, exampleRu, emoji, imageQuery, pos };
    });
    return { id, name: s.name, icon: s.icon, group: s.group || (id === 'irregular' ? 'verbs' : 'travel'), words };
  });
  // Порядок: сначала общие темы для всех, потом путешествия, потом глаголы
  const GORDER = { general: 0, travel: 1, verbs: 2 };
  SETS.sort((a, b) => GORDER[a.group] - GORDER[b.group]);
  window.ReadySets = SETS;
  window.ReadyGroups = { general: 'Общие темы', travel: 'Путешествия и жизнь у моря', verbs: 'Глаголы' };
})();
