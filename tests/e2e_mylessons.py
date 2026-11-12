# «Мои занятия»: загрузка пакета по ссылке/коду, темы-ссылки, мои ошибки, тренировка, слова → набор
import re
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
SH='/tmp/claude-0/-home-claude/de85335f-0f5d-5bd4-b2db-7618e4b0e2be/scratchpad/'
PACK='jane-a1-25e376d9'
import json as _j
NL=len(_j.load(open('packs/'+PACK+'.json', encoding='utf-8'))['lessons'])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.goto(BASE+'#train'); pg.wait_for_selector('.tiles-grid')
    ok('без занятий на «Тренировках» нет карточки', pg.locator('#my-entry').count()==0)
    # загрузка кодом из настроек
    pg.goto(BASE+'#prefs'); pg.wait_for_selector('#my-code'); pg.fill('#my-code', PACK); pg.locator('#my-prefs button[type=submit]').click()
    pg.wait_for_selector('.my-lesson')
    ok('занятия загружены ('+str(NL)+')', pg.locator('.my-lesson').count()==NL, pg.locator('.my-lesson').count())
    ok('сверху — темы, которые проходим', pg.locator('.topic-chips .topic-chip').count()>=6)
    ok('новые занятия помечены', pg.locator('.my-lesson .pill.due').count()==NL)
    pg.screenshot(path=SH+'mylessons.png', full_page=True)
    pg.goto(BASE+'#today'); pg.wait_for_selector('#my-banner', timeout=8000)
    ok('на «Сегодня» баннер о разборе занятия', pg.locator('#my-banner').count()==1)
    pg.goto(BASE+'#train'); pg.wait_for_selector('#my-entry')
    ok('на «Тренировках» карточка «Мои занятия», плиток по-прежнему 12', pg.locator('.tiles-grid > *').count()==12)
    pg.goto(BASE+'#mylesson-2026-11-05b'); pg.wait_for_selector('.my-topics')
    ok('темы занятия — ссылки на грамматику', pg.locator('.my-topics a[href="#gram-do"]').count()==1)
    ok('мои ошибки показаны', pg.locator('.gram-mist .mist').count()==4 and 'Мои ошибки' in pg.inner_text('.gram-mist'))
    pg.screenshot(path=SH+'mylesson.png', full_page=True)
    pg.click('#my-train'); pg.wait_for_selector('#rule-btn')
    ok('тренировка открылась', 'Занятие' in pg.inner_text('body'))
    # пройти все задания (сдаёмся: выбираем первый вариант / пустой ввод / собираем как попало)
    for i in range(80):
        if pg.locator('text=Ко всем темам').count() or pg.locator('text=К занятию').count(): break
        if pg.locator('.options .opt:not([disabled])').count(): pg.locator('.options .opt').first.click()
        elif pg.locator('.sbody input, main input.input').count() and pg.locator('button:has-text("Проверить")').count():
            pg.locator('main input').first.fill('x'); pg.locator('button:has-text("Проверить")').first.click()
        elif pg.locator('main .tiles .tile:not(.used)').count():
            for k in range(15):
                t=pg.locator('main .tiles .tile:not(.used)')
                if not t.count(): break
                t.first.click()
            if pg.locator('button:has-text("Проверить")').count(): pg.locator('button:has-text("Проверить")').first.click()
        if pg.locator('button:has-text("Дальше")').count(): pg.locator('button:has-text("Дальше")').first.click()
        pg.wait_for_timeout(80)
    ok('тренировка завершилась, кнопка «К занятию»', pg.locator('text=К занятию').count()==1)
    pg.click('text=К занятию'); pg.wait_for_selector('#my-words')
    pg.click('#my-words'); pg.wait_for_selector('.sbar', timeout=15000)
    n=pg.evaluate("[...App.S.words.values()].filter(w=>w.setIds.some(id=>App.setName(id).startsWith('Занятие 5 ноября: 9 to 5'))).length")
    ok('слова занятия добавлены в отдельный набор и пошло занятие', n==23, n)
    pg.goto(BASE+'#mylessons'); pg.wait_for_selector('.my-lesson')
    ok('после открытия занятие уже не «новое», видно % тренировки', pg.locator('.my-lesson[data-id="2026-11-05b"] .pill.due').count()==0 and 'тренировка' in pg.locator('.my-lesson[data-id="2026-11-05b"]').inner_text())
    r=pg.evaluate("(async()=>{ const d=await App.kvGet('myLessons'); d.lessons=d.lessons.slice(1); await App.kvSet('myLessons', d); const ch=await MyLessons.refresh(); const d2=await App.kvGet('myLessons'); return [ch, d2.lessons.length, d2.lessons.filter(l=>l.seen).length]; })()")
    ok('автообновление подтягивает новые занятия из пакета и не сбрасывает «просмотрено»', r[0] and r[1]==NL and r[2]>=1, r)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
