# Грамматика A2–B1: 8 новых тем (have got, вопросительные слова, mine, too/enough, used to, who/which/that, второе условное, пассив)
exec(open('tests/e2e_grammar.py', encoding='utf-8').read().split('with sync_playwright()')[0])
NEW=['haveg','wh','mine','too','used','rel','if2','pass']
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':375,'height':740}, is_mobile=True, has_touch=True)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE+'#grammar'); pg.wait_for_selector('.tile.wide'); pg.evaluate(HELP)
    titles=pg.locator('.section-title').all_inner_texts()
    ok('в списке три уровня: A1, A2, B1', any('A1' in t for t in titles) and any('A2' in t for t in titles) and any('B1' in t for t in titles), titles)
    ok('все новые темы в списке', all(pg.evaluate("id => !!Grammar.LESSONS.find(l => l.id === id)", i) for i in NEW))
    last=pg.locator('.tile.wide').last.inner_text(); ok('последняя тема — пассив (B1)', 'Пассив' in last, last.split('\n')[0])
    pg.screenshot(path='/home/claude/tests/shots/40-grammar-b1.png', full_page=True)
    # ошибка в новом уроке — объяснение и повтор в конце
    pg.goto(BASE+'#gram-if2'); pg.wait_for_selector('.gram-theory'); pg.click('.savebar .btn'); k=0; n=0
    while pg.locator('.task').count() and k<20:
        fb=answer(pg, correct=(k!=2)); k+=1
        if k==3: ok('ошибка в «если бы»: объяснение', 'Правильно' in fb and len(fb)>20, fb.replace('\n',' | ')[:80])
    ok('ошибочное задание повторилось в конце', k==11, k)
    for lid in NEW:
        pg.goto(BASE+'#gram-'+lid); pg.wait_for_selector('.gram-theory')
        ok('«'+lid+'»: правило, таблица, примеры, частые ошибки', pg.locator('.gram-table').count()>=1 and pg.locator('.gram-ex').count()>=4 and pg.locator('.gram-mist .mist').count()==3)
        pg.click('.savebar .btn'); k=0
        while pg.locator('.task').count() and k<20: answer(pg, True); k+=1
        pg.wait_for_selector('.report'); ok('урок «'+lid+'» проходится на 100%', pg.locator('.report b').first.inner_text()=='100%')
    pg.goto(BASE+'#rules'); pg.wait_for_selector('.rule-item')
    ok('справочник: раздел «Уровень B1»', pg.locator('.section-title:has-text("Уровень B1")').count()==1)
    pg.fill('#rules-q','пассив'); pg.wait_for_timeout(200)
    ok('поиск «пассив» находит тему', pg.locator('.rule-item').count()==1)
    pg.set_viewport_size({'width':320,'height':640})
    for r in ['grammar','rules']+['gram-'+i for i in NEW]:
        pg.goto(BASE+'#'+r); pg.wait_for_timeout(250); sw=pg.evaluate('document.documentElement.scrollWidth'); ok('320px без прокрутки вбок: '+r, sw<=320, sw)
    ok('нет ошибок на странице', not errs, errs)
    b.close()
print(f'Итог: {sum(res)} из {len(res)}')
