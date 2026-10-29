# «Хочу ещё»: после дневной нормы — ещё новые слова и закрепление сегодняшних
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
SH='/tmp/claude-0/-home-claude/de85335f-0f5d-5bd4-b2db-7618e4b0e2be/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.goto(BASE+'#set-family'); pg.wait_for_selector('text=Добавить в словарь'); pg.click('text=Добавить в словарь'); pg.wait_for_timeout(600)
    pg.evaluate("""(async () => { App.S.settings.name='Jane'; await App.saveSettings(); const ws=[...App.S.words.values()].slice(0,7); const now=Date.now(); ws.forEach(w => { w.srs.recog = Core.review(null, 3, now-60000); w.firstSeen = now-60000; }); for (const w of ws) await App.saveWord(w,{quiet:true}); })()""")
    pg.goto(BASE+'#today'); pg.wait_for_selector('.hero')
    ok('план выполнен — есть «Ещё новых слов»', pg.locator('#more-new').count()==1, pg.locator('.hero').inner_text()[:200])
    ok('есть «Закрепить сегодняшние (7)»', pg.locator('#more-today:has-text("(7)")').count()==1)
    pg.screenshot(path=SH+'today-more.png')
    pg.click('#more-new'); pg.wait_for_selector('.sbar')
    q=pg.evaluate("JSON.parse(localStorage.getItem('x')||'null')")
    n=pg.locator('.sbar .num').inner_text()
    ok('занятие «Ещё 5 новых слов» началось', n.startswith('1/'), n)
    # пройти до конца быстро
    for i in range(60):
        if pg.locator('text=Занятие готово').count(): break
        for sel in ['button:has-text("Запомнила")','button:has-text("Понятно")','button:has-text("Дальше")','text=Не знаю','button:has-text("Не помню")','button:has-text("Помню")']:
            if pg.locator(sel).count():
                try: pg.locator(sel).first.click(timeout=1000)
                except Exception: pass
                break
        else:
            if pg.locator('.pairs .opt').count(): pg.evaluate("Train.abort(true)"); break
            btn=pg.locator('.actions .btn.primary')
            if btn.count(): btn.first.click()
        pg.wait_for_timeout(120)
    intro=pg.evaluate("(() => { const sod=Core.startOfDay(Date.now()); return [...App.S.words.values()].filter(w=>w.srs.recog&&w.srs.recog.reps&&w.firstSeen>=sod).length; })()")
    ok('новых слов сегодня стало больше 7', intro>7, intro)
    pg.goto(BASE+'#today'); pg.wait_for_selector('.hero')
    pg.click('#more-today'); pg.wait_for_selector('.sbar')
    ok('«Закрепить сегодняшние» запускает тренировку', pg.locator('.sbody .task').count()>=0 and pg.locator('.sbar').count()==1)
    # учить конкретный набор из словаря
    pg.goto(BASE+'#set-cafe'); pg.wait_for_selector('text=Добавить в словарь'); pg.click('text=Добавить в словарь'); pg.wait_for_selector('#learn-set')
    ok('после добавления набора — кнопка «Учить набор»', 'новых' in pg.locator('#learn-set').inner_text(), pg.locator('#learn-set').inner_text())
    pg.screenshot(path=SH+'learn-set.png')
    pg.click('#learn-set'); pg.wait_for_selector('.sbar')
    first=pg.evaluate("(() => { const s=JSON.parse(JSON.stringify(window.__x||null)); return document.querySelector('.sbody').innerText.slice(0,80); })()")
    ids=pg.evaluate("App.kvGet('session').then(s=>s.queue.filter(q=>q.type==='intro').map(q=>App.S.words.get(q.wordId)).map(w=>App.setName(w.setIds[w.setIds.length-1])))")
    ok('в занятии новые слова именно этого набора', len(ids)>0 and all('Кафе' in x or 'кафе' in x.lower() for x in ids), ids)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
