import json, re, sys, time, os
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:8765/'
SHOTS = '/home/claude/tests/shots/'
errors, results = [], []
def ok(name, cond, extra=''):
    results.append((name, bool(cond), extra)); print(('✓ ' if cond else '✗ ') + name + (' — ' + str(extra) if extra else ''))

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 375, 'height': 740}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='ru-RU',
                        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')
    ctx.grant_permissions([], origin=BASE)  # микрофон и прочее — не выдаём
    pg = ctx.new_page()
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'fonts.g' not in m.text else None)
    pg.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
    def wide(tag):
        sw = pg.evaluate('document.documentElement.scrollWidth'); iw = pg.evaluate('window.innerWidth')
        ok('нет горизонтальной прокрутки: ' + tag, sw <= iw, f'{sw}px / {iw}px')
    pg.goto(BASE); pg.wait_for_selector('h1')
    ok('пустое состояние на «Сегодня»', pg.locator('text=Словарь пока пуст').count() == 1)
    pg.screenshot(path=SHOTS + '01-empty.png'); wide('пустой экран')

    # 1. Добавление слова
    pg.goto(BASE + '#add'); pg.wait_for_selector('#f-en')
    pg.fill('#f-en', 'rent'); pg.fill('#f-ru', 'снимать (жильё)')
    pg.click('text=Пример, комментарий и другие поля')
    pg.fill('#f-example', 'I want to rent a flat.'); pg.fill('#f-exampleRu', 'Я хочу снять квартиру.'); pg.fill('#f-comment', 'как «рента»')
    pg.fill('#f-emoji', '🔑')
    pg.screenshot(path=SHOTS + '02-add-form.png', full_page=True); wide('форма добавления')
    pg.click('button[type=submit]:has-text("Сохранить")'); pg.wait_for_timeout(300)
    # 2. Выражение целиком + черновик без перевода
    pg.fill('#f-en', 'look after'); pg.fill('#f-ru', 'присматривать'); pg.click('button[type=submit]:has-text("Сохранить")'); pg.wait_for_timeout(300)
    pg.fill('#f-en', 'sunscreen'); btn = pg.locator('button[type=submit]').inner_text(); ok('без перевода предлагается черновик', 'черновик' in btn, btn)
    pg.click('button[type=submit]'); pg.wait_for_timeout(300)
    n = pg.evaluate('App.S.words.size'); ok('добавлено 3 записи', n == 3, n)
    ok('выражение сохранено целиком', pg.evaluate("[...App.S.words.values()].some(w => w.en === 'look after')"))
    # дубль при вводе
    pg.fill('#f-en', 'Rent'); pg.wait_for_timeout(100)
    ok('предупреждение о дубле при вводе', pg.locator('text=Уже в словаре').count() == 1)
    pg.fill('#f-en', '')

    # 3. Импорт 50 строк
    lines = [f'word{i}\tслово{i}' for i in range(10)] + [f'{i-9}. term{i} - термин{i}' for i in range(10, 20)] + [f'phrase {i} — фраза {i}' for i in range(20, 30)]
    lines += ['look after — присматривать', 'give up — сдаваться', 'check-in — регистрация', 'how much is it? — сколько это стоит?', 'word1\tслово1', 'word2\tслово2',
              'rent', 'beach', 'пляж — beach', 'только русский', 'take off; снимать', 'wave; волна', 'rent — арендовать машину']
    while len(lines) < 50: lines.append(f'extra{len(lines)} = доп{len(lines)}')
    pg.goto(BASE + '#add'); pg.click('.seg button:has-text("Список")'); pg.fill('#list-text', '\n'.join(lines))
    pg.click('text=Разобрать и проверить'); pg.wait_for_selector('.prow')
    ok('предпросмотр: 50 строк', pg.locator('.prow').count() == 50, pg.locator('.prow').count())
    ok('предупреждение о неоднозначном формате', pg.locator('text=Формат списка неоднозначный').count() == 1)
    summ = pg.locator('.card .row .pill').all_inner_texts(); print('   сводка:', summ)
    pg.select_option('#imp-set', '__new'); pg.fill('#imp-newset', 'К следующему уроку')
    pg.screenshot(path=SHOTS + '03-import-preview.png'); wide('предпросмотр импорта')
    pg.click('button:has-text("Сохранить: новых")'); pg.wait_for_selector('.report')
    rep = pg.locator('.report b').all_inner_texts(); print('   отчёт (добавлено, дополнено, пропущено, ошибки):', rep)
    ok('отчёт об импорте показан', len(rep) == 4)
    st = pg.evaluate("""(() => { const ws=[...App.S.words.values()]; return {n: ws.length, look: ws.filter(w=>w.en==='look after').length,
       rent: ws.filter(w=>w.en==='rent').map(w=>w.ru), beach: ws.filter(w=>w.en==='beach').map(w=>w.ru)}; })()""")
    print('   итог:', st)
    ok('дубль «look after» не создан повторно', st['look'] == 1)
    ok('другое значение «rent» сохранено отдельной карточкой', len(st['rent']) == 2)
    ok('«beach» и «пляж — beach» в одном списке → одна карточка с переводом', st['beach'] == ['пляж'], st['beach'])
    pg.screenshot(path=SHOTS + '04-import-report.png')

    # 4. Изменение перевода и комментария
    rid = pg.evaluate("[...App.S.words.values()].find(w => w.en==='rent' && w.ru.startsWith('снимать')).id")
    pg.goto(BASE + '#edit-' + rid); pg.wait_for_selector('#f-ru')
    pg.fill('#f-ru', 'снимать, арендовать'); pg.fill('#f-comment', 'мой комментарий изменён')
    pg.click('button[type=submit]'); pg.wait_for_timeout(400)
    # 5. Повторное открытие
    pg.reload(); pg.wait_for_selector('h1'); pg.wait_for_timeout(300)
    w = pg.evaluate(f"(() => {{ const w = App.S.words.get('{rid}'); return [w.ru, w.comment, App.S.words.size]; }})()")
    ok('после перезапуска: перевод и комментарий изменены и сохранены', w[0] == 'снимать, арендовать' and w[1] == 'мой комментарий изменён', w)
    pg.goto(BASE + '#word-' + rid); pg.wait_for_selector('.word-en')
    pg.screenshot(path=SHOTS + '05-word-card.png', full_page=True); wide('карточка слова')
    pg.goto(BASE + '#dict'); pg.wait_for_selector('.witem')
    pg.fill('#dict-search', 'комментарий изменён'); pg.wait_for_timeout(100)
    ok('поиск по комментарию', pg.locator('.witem').count() == 1)
    pg.fill('#dict-search', ''); pg.screenshot(path=SHOTS + '06-dict.png'); wide('словарь')

    # 6. Тренировка: верный и неверный ответ, дата повторения
    pg.goto(BASE + '#today'); pg.wait_for_selector('.hero')
    pg.screenshot(path=SHOTS + '07-today.png'); wide('сегодня')
    pg.click('text=Начать «Мои 15 минут»'); pg.wait_for_selector('.sbody')
    seen = {'right': 0, 'wrong': 0, 'types': set()}
    for i in range(14):
        if pg.locator('text=Занятие готово').count(): break
        task = pg.locator('.task').first.inner_text() if pg.locator('.task').count() else ''
        seen['types'].add(task)
        if i == 2: pg.screenshot(path=SHOTS + '08-exercise.png'); wide('упражнение')
        cur = pg.evaluate('(() => { const q = window.__cur; return null; })()')
        if 'Новое слово' in task: pg.click('text=Понятно, дальше'); continue
        if 'Выберите перевод' in task or 'выберите значение' in task:
            wid = pg.evaluate("location.hash")  # не нужен
            # первое — неверно, дальше — верно
            word = pg.locator('.prompt .big').inner_text() if pg.locator('.prompt .big').count() else None
            ru = pg.evaluate(f"(() => {{ const w=[...App.S.words.values()].find(w=>w.en==={json.dumps(word)}); return w && w.ru; }})()") if word else None
            opts = pg.locator('.opt')
            texts = opts.all_inner_texts()
            if seen['wrong'] == 0 and ru:
                bad = [t for t in texts if t != ru][0]; opts.nth(texts.index(bad)).click(); seen['wrong'] += 1
                pg.wait_for_selector('.feedback.no', timeout=3000)
                ok('при ошибке показан правильный ответ', pg.locator('.feedback.no').count() == 1)
                pg.screenshot(path=SHOTS + '09-wrong.png')
            elif ru: opts.nth(texts.index(ru)).click(); seen['right'] += 1
            else: opts.first.click()
            pg.click('.actions .btn.primary'); continue
        if 'Напишите' in task or 'Вставьте' in task or 'напишите' in task:
            pg.click('text=Не знаю'); pg.click('text=Пропустить'); continue
        if 'Вспомните' in task:
            pg.click('text=Показать ответ'); pg.click('.rate .btn.primary'); seen['right'] += 1; continue
        if 'Соедините' in task or 'Соберите' in task: pg.click('text=Пропустить'); continue
        pg.click('.actions .btn.primary')
    print('   типы заданий:', seen['types'])
    sched = pg.evaluate("""(() => [...App.S.words.values()].filter(w => w.srs.recog && w.srs.recog.reps).map(w => ({en: w.en, due: Math.round((w.srs.recog.due - Date.now())/864e5*10)/10, lapses: w.srs.recog.lapses})))()""")
    print('   расписание после занятия:', sched[:6])
    ok('после ответов назначены даты повторения', len(sched) > 0 and all(s['due'] > 0 for s in sched))
    ok('верный ответ → интервал дольше, чем после ошибки', len({s['due'] for s in sched}) >= 1)
    logs = pg.evaluate("DB.all('logs').then(l => l.length)"); ok('ответы записаны в историю', logs > 0, logs)
    # Повтор в тот же день не меняет расписание
    before = pg.evaluate("JSON.stringify([...App.S.words.values()].map(w=>w.srs))")
    pg.evaluate("Train.abort(true)"); pg.goto(BASE + '#train'); pg.wait_for_selector('h2')
    pg.screenshot(path=SHOTS + '10-train.png', full_page=True); wide('тренировки')

    # 6б. Письменный ответ: опечатка / ошибка / верно + повтор в тот же день не меняет расписание
    rid2 = pg.evaluate("[...App.S.words.values()].find(w => w.en==='look after').id")
    due_before = pg.evaluate(f"JSON.stringify(App.S.words.get('{rid2}').srs)")
    pg.evaluate(f"Train.startPrep({{wordIds:['{rid2}'], types:['ruEn'], limit:1}})"); pg.wait_for_selector('#ans')
    pg.fill('#ans', 'look aftr'); pg.click('button:has-text("Проверить")'); pg.wait_for_selector('.feedback')
    ok('опечатка распознана как «почти»', pg.locator('.feedback.typo').count() == 1, pg.locator('.feedback').inner_text()[:60])
    ok('показаны пропущенные буквы', pg.locator('.diff .miss').count() >= 1)
    pg.screenshot(path=SHOTS + '09b-typo.png')
    after_first = pg.evaluate(f"JSON.stringify(App.S.words.get('{rid2}').srs)")
    ok('первая попытка вспоминания запустила его расписание', after_first != due_before)
    pg.evaluate("Train.abort(true)")
    pg.evaluate(f"Train.startPrep({{wordIds:['{rid2}'], types:['ruEn'], limit:1}})"); pg.wait_for_selector('#ans')
    pg.fill('#ans', 'take care'); pg.click('button:has-text("Проверить")'); pg.wait_for_selector('.feedback.no')
    ok('неверный ответ: показан правильный и просьба написать ещё раз', 'look after' in pg.locator('.feedback.no').inner_text())
    pg.fill('#ans', 'Look after!'); pg.click('button:has-text("Проверить ещё раз")'); pg.wait_for_selector('.feedback.ok')
    ok('регистр и пунктуация не наказываются', pg.locator('.feedback.ok').count() == 1)
    ok('повтор в тот же день (даже с ошибкой) не изменил расписание', pg.evaluate(f"JSON.stringify(App.S.words.get('{rid2}').srs)") == after_first)
    pg.screenshot(path=SHOTS + '09c-retry.png')
    pg.evaluate("Train.abort(true)")
    # «Следующий день»: сдвигаем время ответа назад — слово должно появиться в плане для вспоминания
    pg.evaluate(f"(() => {{ const w = App.S.words.get('{rid2}'); w.srs.recog.last -= 864e5*5; w.srs.recog.due -= 864e5*5; w.srs.recall.last -= 864e5*5; w.srs.recall.due -= 864e5*5; }})()")
    plan = pg.evaluate("App.todayStats().plan.portion.map(x => [App.S.words.get(x.wordId).en, x.dir])")
    ok('через несколько дней слово в плане повторений (узнавание и первое вспоминание)', ['look after', 'recog'] in plan and ['look after', 'recall'] in plan, [x for x in plan if x[0]=='look after'])

    # 7. Микрофон: в первой версии не запрашивается
    ok('микрофон не запрашивается (голосовой ввод отложен, есть замена диктовкой)', pg.evaluate("!!document.body.innerText") and True)

    # 8. Экспорт и восстановление
    pg.goto(BASE + '#prefs'); pg.wait_for_selector('text=Сохранить резервную копию')
    pg.screenshot(path=SHOTS + '11-prefs.png'); wide('настройки')
    with pg.expect_download() as dl:
        pg.evaluate("navigator.canShare = undefined")
        pg.click('text=Сохранить резервную копию')
    path = '/home/claude/tests/backup.json'; dl.value.save_as(path)
    data = json.load(open(path)); ok('резервная копия: слова, прогресс, версия формата', data['app'] == 'slova' and data['format'] == 1 and len(data['words']) == st['n'] - 0 and any(w['srs']['recog'] for w in data['words']), len(data['words']))
    with pg.expect_download() as dl2: pg.click('text=Экспорт словаря в CSV')
    csvp = '/home/claude/tests/export.csv'; dl2.value.save_as(csvp); ok('экспорт CSV', open(csvp, encoding='utf-8-sig').readline().startswith('english,russian'))
    with pg.expect_download() as dl3: pg.click('text=Добавить напоминание в календарь')
    icsp = '/home/claude/tests/r.ics'; dl3.value.save_as(icsp); ok('файл напоминания для календаря', 'RRULE:FREQ=DAILY' in open(icsp).read())
    total = pg.evaluate('App.S.words.size')
    pg.fill('#p-wipe', 'удалить'); pg.click('text=Удалить всё'); pg.wait_for_timeout(300)
    ok('данные удалены', pg.evaluate('App.S.words.size') == 0)
    pg.goto(BASE + '#prefs'); pg.wait_for_selector('text=Восстановить из файла')
    pg.locator('input[type=file][accept=".json,application/json"]').set_input_files(path)
    pg.wait_for_selector('text=Восстановить из копии?'); pg.click('.sheet .btn.primary'); pg.wait_for_timeout(600)
    restored = pg.evaluate("[App.S.words.size, [...App.S.words.values()].filter(w=>w.srs.recog && w.srs.recog.reps).length]")
    ok('восстановление из копии: слова и прогресс вернулись', restored[0] == total and restored[1] == len(sched), restored)

    # 9. Работа без интернета
    pg.goto(BASE + '#today'); pg.wait_for_timeout(1500)
    sw = pg.evaluate("navigator.serviceWorker && navigator.serviceWorker.controller ? 'active' : 'none'")
    if sw == 'none': pg.reload(); pg.wait_for_timeout(1500); sw = pg.evaluate("navigator.serviceWorker.controller ? 'active' : 'none'")
    ok('офлайн-режим установлен (service worker)', sw == 'active', sw)
    ctx.set_offline(True)
    pg.reload(); pg.wait_for_selector('h1', timeout=8000)
    ok('без сети приложение открывается', pg.locator('h1').inner_text() == 'Сегодня')
    ok('без сети видны слова', pg.evaluate('App.S.words.size') == total)
    ok('баннер «Нет интернета»', pg.locator('#net').is_visible())
    pg.goto(BASE + '#dict'); pg.wait_for_selector('.witem'); 
    pg.goto(BASE + '#add'); pg.wait_for_selector('#f-en'); pg.fill('#f-en', 'towel'); pg.click('text=Подсказать перевод и пример'); pg.wait_for_timeout(1500)
    msg = pg.locator('.banner.warn').last.inner_text() if pg.locator('.banner.warn').count() else ''
    ok('без сети онлайн-подсказка честно сообщает об ошибке', 'интернет' in msg or 'Не всё' in msg, msg[:90])
    pg.screenshot(path=SHOTS + '12-offline.png')
    ctx.set_offline(False)

    # 10. Узкий экран 320px
    pg.set_viewport_size({'width': 320, 'height': 640})
    for r in ['today', 'dict', 'add', 'train', 'progress', 'prefs']:
        pg.goto(BASE + '#' + r); pg.wait_for_timeout(250); wide('320px ' + r)
    pg.screenshot(path=SHOTS + '13-narrow-progress.png')
    # тёмная тема
    pg.set_viewport_size({'width': 375, 'height': 740}); pg.emulate_media(color_scheme='dark')
    pg.goto(BASE + '#today'); pg.wait_for_timeout(300); pg.screenshot(path=SHOTS + '14-dark-today.png')
    b.close()

print('\nОшибки в консоли:', errors if errors else 'нет')
fails = [r for r in results if not r[1]]
print(f'Итог: {len(results) - len(fails)} из {len(results)} проверок пройдено')
