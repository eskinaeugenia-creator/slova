# Диалоги: список, фильтр по темам, два голоса, слово, фразы в словарь, вопросы, ролевая игра
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
SH='/tmp/claude-0/-home-claude/de85335f-0f5d-5bd4-b2db-7618e4b0e2be/scratchpad/'
TTS2 = FAKE_TTS.replace("{name:'Milena',lang:'ru-RU',localService:true,voiceURI:'m'}", "{name:'Daniel',lang:'en-US',localService:true,voiceURI:'d'},{name:'Milena',lang:'ru-RU',localService:true,voiceURI:'m'}").replace("window.__spoken.push([u.lang,u.text])", "window.__spoken.push([u.lang,u.text,u.voice&&u.voice.name,u.pitch])")
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(TTS2)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE+'#train'); pg.wait_for_selector('.tile')
    ok('плитка «Диалоги»', pg.locator('.tile:has-text("Диалоги")').count()==1)
    pg.click('.tile:has-text("Диалоги")'); pg.wait_for_selector('.tile.wide')
    n=pg.locator('.tile.wide').count()
    ok('17 диалогов на 5 уровнях', n==17 and pg.locator('.section-title').count()==5, n)
    pg.screenshot(path=SH+'dlg-list.png')
    pg.click('.chip:has-text("Кафе")'); pg.wait_for_timeout(200)
    ok('фильтр по теме «Кафе»', pg.locator('.tile.wide').count()==2)
    pg.click('.chip:has-text("Все")'); pg.wait_for_timeout(200)
    pg.click('.tile.wide:has-text("Hi, I\'m Anna")'); pg.wait_for_selector('.bubble')
    ok('реплики пузырями двух собеседников', pg.locator('.bubble.a').count()==5 and pg.locator('.bubble.b').count()==4)
    pg.evaluate("window.__spoken=[]"); pg.click('#dlg-play'); pg.wait_for_timeout(2500)
    sp=pg.evaluate('window.__spoken')
    voices=set(s[2] for s in sp)
    ok('два разных голоса', len(voices)>=2, voices)
    pg.click('#dlg-play') if pg.locator('#dlg-play:has-text("Стоп")').count() else None
    pg.locator('.rw', has_text='Nice').first.click(); pg.wait_for_selector('.sheet')
    ok('нажатие на слово в диалоге', 'приятный' in pg.locator('.sheet').inner_text()); pg.locator('.sheet .icon-btn').click()
    pg.click('#dlg-keys-all'); pg.wait_for_timeout(400)
    w=pg.evaluate("[...App.S.words.values()].filter(w=>App.setName(w.setIds[0])==='Из диалогов').map(w=>[w.en,w.ru,w.example])")
    ok('4 фразы в словаре с примером из диалога', len(w)==4 and any(x[2] for x in w), w[:2])
    nq=pg.locator('.options').count()
    for i in range(nq): pg.locator('.options').nth(i).locator('.opt').first.click()
    ok('вопросы отвечаются', pg.locator('.opt.right').count()==nq)
    pg.screenshot(path=SH+'dlg-view.png', full_page=False)
    pg.click('#dlg-role'); pg.wait_for_selector('.sbar')
    me_right=0; steps=0
    while steps<30:
        steps+=1
        if pg.locator('h1:has-text("Роль сыграна")').count(): break
        if pg.locator('#role-check').count():
            if steps==2: pg.screenshot(path=SH+'dlg-role.png')
            ru=pg.locator('.prompt .mid').inner_text()
            en=pg.evaluate(f"window.DIALOGS.find(d=>d.id==='meet1').lines.find(l=>l[2]==={ru!r})[1]")
            for wd in en.rstrip('.?!').split(' '):
                pg.locator('.tiles .tile:not(.used)', has_text=wd).first.click()
            pass
            pg.click('#role-check'); me_right+=1
        pg.wait_for_selector('#role-next'); pg.click('#role-next'); pg.wait_for_timeout(100)
    ok('ролевая игра доходит до конца', pg.locator('h1:has-text("Роль сыграна")').count()==1)
    ok('все свои реплики верно — 100%', '100%' in pg.locator('.card').inner_text(), pg.locator('.card').inner_text()[:120])
    pg.click('text=К диалогам'); pg.wait_for_selector('.tile.wide')
    ok('отметка с процентом в списке', pg.locator('.tile.wide:has-text("Anna") >> text=100%').count()==1)
    # длинная реплика — выбор из вариантов
    pg.goto(BASE+'#drole-work5'); pg.wait_for_selector('.sbar')
    pg.click('#role-next'); pg.wait_for_selector('.options')
    ok('длинная реплика — выбор варианта', pg.locator('.options .opt').count()==3)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
