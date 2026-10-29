# Обновление: при новой версии на сервере появляется кнопка «Обновить», данные сохраняются
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}); ctx.add_init_script(FAKE_TTS)
    newer={'on':False}
    ctx.route('**/version.json*', lambda r: r.fulfill(status=200, content_type='application/json', body='{"v":"9.9.9"}') if newer['on'] else r.continue_())
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1'); pg.wait_for_timeout(3500)
    ok('та же версия — баннера нет', pg.locator('#upd').count()==0)
    pg.evaluate("App.saveWord(App.newWord({en:'keepme',ru:'сохрани'}))")
    newer['on']=True; pg.reload(); pg.wait_for_selector('#upd', timeout=8000)
    ok('новая версия — баннер «Обновить»', '9.9.9' in pg.locator('#upd').inner_text())
    pg.click('#upd-go'); pg.wait_for_selector('h1'); pg.wait_for_timeout(500)
    ok('после обновления слова на месте', pg.evaluate("[...App.S.words.values()].some(w=>w.en==='keepme')"))
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
