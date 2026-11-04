# Карточка-фраза (4+ слов): вспоминание — собрать её из плиток по переводу; результат идёт в расписание
import re
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}); ctx.add_init_script(FAKE_TTS)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.evaluate("""(async()=>{ const t=Date.now()-86400000*40; const w=App.newWord({en:'I wake up early in the morning',ru:'Я просыпаюсь рано утром'});
      w.srs.recog=Core.review(null,3,t); w.srs.recall=Core.review(null,3,t); await App.saveWord(w); window.__id=w.id; Train.startDaily(); })()""")
    pg.wait_for_selector('.sbody')
    for i in range(6):
        if pg.locator('text=Соберите предложение из слов').count(): break
        if pg.locator('text=Занятие готово').count(): break
        btn=pg.locator('.sbody button:has-text("Показать ответ"), .sbody button:has-text("Вспомнила"), .sbody button:has-text("Дальше")')
        if btn.count(): btn.first.click()
        else:
            o=pg.locator('.sbody .opt')
            if o.count(): o.first.click(); pg.wait_for_timeout(200); n=pg.locator('button:has-text("Дальше")'); n.count() and n.first.click()
        pg.wait_for_timeout(300)
    ok('для фразы — задание «Соберите предложение»', pg.locator('text=Соберите предложение из слов').count()==1)
    ok('подсказка — перевод фразы', pg.locator('text=Я просыпаюсь рано утром').count()>=1)
    before=pg.evaluate("App.S.words.get(window.__id).srs.recall.reps")
    for wd in 'I wake up early in the morning'.split():
        pg.locator('.tiles .tile:not(.used)', has_text=re.compile('^'+wd+'$')).first.click()
    pg.click('button:has-text("Проверить")'); pg.wait_for_selector('text=Верно!')
    after=pg.evaluate("App.S.words.get(window.__id).srs.recall.reps")
    ok('верная сборка засчитана в расписание повторений', after==before+1, (before, after))
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
