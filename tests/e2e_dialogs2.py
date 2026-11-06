# Ещё диалоги: 2–3 на каждую тему, новые темы (аренда, спорт, банк), уровни ровно, словарик покрывает все слова
import re
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE+'#dialogs'); pg.wait_for_selector('.tile.wide')
    st=pg.evaluate("""(() => {
      const byT={}, byL={}; DIALOGS.forEach(d=>{ byT[d.topic]=(byT[d.topic]||0)+1; byL[d.lvl]=(byL[d.lvl]||0)+1; });
      const bad=DIALOGS.filter(d=>!DIALOG_TOPICS[d.topic] || !d.who[d.role] || d.keys.length<3 || d.q.length<2 || d.q.length>3
        || d.q.some(q=>!(q[2]>=0 && q[2]<q[1].length)) || d.lines.some(l=>!d.who[l[0]] || !l[1] || !l[2])).map(d=>d.id);
      const ids=new Set(DIALOGS.map(d=>d.id));
      const miss=[]; DIALOGS.forEach(d=>d.lines.forEach(l=>(l[1].match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)||[]).forEach(w=>{ if(!Books.lookup(w).ru) miss.push(d.id+':'+w); })));
      return {byT, byL, bad, uniq: ids.size===DIALOGS.length, miss, topics: Object.keys(DIALOG_TOPICS).length};
    })()""")
    ok('11 тем, в каждой 2–3 диалога', st['topics']==11 and all(2<=v<=3 for v in st['byT'].values()) and len(st['byT'])==11, st['byT'])
    ok('уровни 1–5 поровну (по 6)', all(st['byL'].get(str(l), st['byL'].get(l))==6 for l in range(1,6)), st['byL'])
    ok('у каждого диалога реплики с переводом, 3+ фразы, 2–3 вопроса', not st['bad'], st['bad'])
    ok('id диалогов не повторяются', st['uniq'])
    ok('каждое слово в репликах переводится по нажатию', not st['miss'], st['miss'][:10])
    for name in ['Аренда жилья','Спорт и фитнес','Банк и деньги']:
        pg.click(f'.chip:has-text("{name}")'); pg.wait_for_timeout(150)
        ok(f'фильтр «{name}» — 2 диалога', pg.locator('.tile.wide').count()==2)
    pg.click('.chip:has-text("Все")'); pg.wait_for_timeout(150)
    # новый диалог открывается, слово переводится
    pg.click('.tile.wide:has-text("Changing money")'); pg.wait_for_selector('.bubble')
    pg.locator('.rw', has_text=re.compile('^currency$')).first.click(); pg.wait_for_selector('.sheet')
    ok('слово «currency» — «валюта»', 'валюта' in pg.locator('.sheet').inner_text()); pg.locator('.sheet .icon-btn').click()
    # ролевая игра в длинном диалоге доходит до конца (плитки и выбор вариантов)
    pg.goto(BASE+'#drole-bank5'); pg.wait_for_selector('.sbar')
    steps=0
    while steps<40 and not pg.locator('h1:has-text("Роль сыграна")').count():
        steps+=1
        if pg.locator('#role-check').count():
            pg.locator('.tiles .tile:not(.used)').first.click(); pg.click('#role-check')
        elif pg.locator('.options .opt').count():
            pg.locator('.options .opt').first.click()
        pg.wait_for_selector('#role-next'); pg.click('#role-next'); pg.wait_for_timeout(80)
    ok('ролевая игра «A charge I didn\'t make» доходит до конца', pg.locator('h1:has-text("Роль сыграна")').count()==1)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
