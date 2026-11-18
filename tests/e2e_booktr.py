# Свой перевод абзацев Oz и Alice: первая глава каждой книги переводится без интернета
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True)
    ctx.add_init_script(FAKE_TTS)
    called=[]
    def block(r): called.append(r.request.url); r.fulfill(status=500, body='')
    ctx.route('https://api.mymemory.translated.net/**', block)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.goto(BASE+'#books'); pg.wait_for_selector('.tile.wide')
    # все абзацы глав 1 (Oz: части 1–2, Alice: части 1–3) — с переводом
    miss=pg.evaluate("""() => { const r=[]; for (const [id,n] of [['oz',2],['alice',3]]) { const b=BOOKS.find(x=>x.id===id);
      b.chapters.slice(0,n).forEach((c,ci)=>c.p.forEach((x,i)=>{ if(!x[1]||!/[а-яё]/i.test(x[1])) r.push(id+ci+':'+i); })); } return r; }""")
    ok('у всех абзацев первой главы Oz и Alice есть свой перевод', not miss, miss)
    ctx.set_offline(True)
    pg.goto(BASE+'#read-oz-0'); pg.wait_for_selector('.rw')
    pg.locator('.rp').first.locator('button', has_text='Перевод').click()
    tr=pg.locator('.rp').first.locator('.rp-tr')
    ok('Oz, часть 1: перевод абзаца без сети', tr.is_visible() and 'Дороти жила' in tr.inner_text())
    pg.goto(BASE+'#read-alice-2'); pg.wait_for_selector('.rw')
    last=pg.locator('.rp').last; last.locator('button', has_text='Перевод').click()
    ok('Alice, часть 3: перевод последнего абзаца без сети', 'пирожок' in last.locator('.rp-tr').inner_text())
    ok('сервис перевода не вызывался', not called, called)
    ctx.set_offline(False)
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
