# Серия дней подряд на «Сегодня»: текущая и лучшая, без давления; перерыв не трогает слова
import os
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
SH=os.environ.get('SHOTS', '/tmp/')
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.goto(BASE+'#set-family'); pg.wait_for_selector('text=Добавить в словарь'); pg.click('text=Добавить в словарь'); pg.wait_for_timeout(600)
    pg.goto(BASE+'#today'); pg.wait_for_selector('#streak')
    ok('серия на «Сегодня» есть и начинается с нуля', pg.locator('#streak-cur').inner_text()=='0 дней', pg.locator('#streak').inner_text())
    def setdays(js):
        pg.evaluate("""(async () => {
          const key = ts => { const d=new Date(ts); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); };
          const day=86400000, now=Date.now(), t={}; """+js+"""
          await App.kvSet('studyTime', t);
        })()"""); pg.reload(); pg.wait_for_selector('#streak')
    # вчера, позавчера и 3 дня назад; раньше — серия из 5 дней; день < 1 мин не считается
    setdays("for (const i of [1,2,3,10,11,12,13,14]) t[key(now-i*day)]=300; t[key(now-4*day)]=30;")
    txt=pg.locator('#streak').inner_text()
    ok('текущая серия 3 дня (сегодня ещё не занимались)', pg.locator('#streak-cur').inner_text()=='3 дня', txt)
    ok('лучшая серия 5 дней', pg.locator('#streak-best').inner_text()=='5 дней', txt)
    ok('мягкая подсказка без давления', 'ничего страшного' in txt and 'не трогает ваши слова' in txt, txt)
    pg.locator('#streak').scroll_into_view_if_needed(); pg.screenshot(path=SH+'streak.png')
    # перерыв: серия 0, лучшая сохраняется, слова на месте
    setdays("for (const i of [5,6,7]) t[key(now-i*day)]=300;")
    txt=pg.locator('#streak').inner_text()
    ok('после перерыва серия 0, лучшая 3', pg.locator('#streak-cur').inner_text()=='0 дней' and pg.locator('#streak-best').inner_text()=='3 дня', txt)
    ok('после перерыва — «перерывы это нормально»', 'Перерывы — это нормально' in txt, txt)
    nw=pg.evaluate("(async()=>(await DB.all('words')).length)()")
    ok('слова не пропали', nw>0, nw)
    # сегодня занимались и это лучшая серия
    setdays("for (const i of [0,1,2,3]) t[key(now-i*day)]=300;")
    txt=pg.locator('#streak').inner_text()
    ok('сегодня засчитано: 4 дня, лучшая', pg.locator('#streak-cur').inner_text()=='4 дня' and 'лучшая серия' in txt.lower() and 'Это ваша лучшая серия' in txt, txt)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
