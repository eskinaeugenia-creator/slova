# Повтор после ошибки в письменном задании: опечатка не засчитывается, точный ответ — засчитывается
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}); ctx.add_init_script(FAKE_TTS)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.evaluate("(async()=>{ const w=App.newWord({en:'umbrella',ru:'зонт'}); w.srs.recog=Core.review(null,3,Date.now()-86400000*2); await App.saveWord(w); Train.startPrep({wordIds:[w.id], types:['ruEn']}); })()")
    pg.wait_for_selector('.sbody input')
    inp=pg.locator('.sbody input').first
    inp.fill('banana'); inp.press('Enter'); pg.wait_for_selector('.feedback.no')
    ok('неверный ответ — показ ошибки', pg.locator('.feedback.no').count()==1)
    inp.fill('umbrela'); inp.press('Enter'); pg.wait_for_timeout(300)
    ok('повтор с опечаткой НЕ засчитан', pg.locator('text=Теперь верно').count()==0 and pg.locator('text=Почти! Исправьте').count()==1)
    inp.fill('umbrella'); inp.press('Enter'); pg.wait_for_timeout(300)
    ok('точный повтор засчитан', pg.locator('text=Теперь верно').count()==1)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
