# Общий счётчик «Всего занимались»: минуты и дни за всё время, история не обрезается
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
SH='/tmp/claude-0/-home-claude/de85335f-0f5d-5bd4-b2db-7618e4b0e2be/scratchpad/'
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(FAKE_TTS)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    pg.goto(BASE+'#set-family'); pg.wait_for_selector('text=Добавить в словарь'); pg.click('text=Добавить в словарь'); pg.wait_for_timeout(600)
    pg.goto(BASE+'#today'); pg.wait_for_selector('#totals')
    ok('карточка «Всего занимались» на «Сегодня»', 'Всего занимались' in pg.locator('#totals').inner_text())
    # история: 100 дней назад (за пределами старых 60 дней) + занятие словами 2 дня назад + сегодня
    pg.evaluate("""(async () => {
      const key = ts => { const d=new Date(ts); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); };
      const day=86400000, now=Date.now(), t={};
      for (let i=0;i<70;i++) t[key(now-(i+30)*day)] = 120;   // 70 дней по 2 мин
      t[key(now-100*day)] = 30;                              // меньше минуты — день не засчитан
      await App.kvSet('studyTime', t);
      await DB.put('sessions', { id:'s1', ts: now-2*day, mode:'daily', n:10, correct:9, durationSec: 600 });
    })()""")
    pg.reload(); pg.wait_for_selector('#totals')
    m=pg.locator('#total-min').inner_text(); d=pg.locator('#total-days').inner_text()
    ok('минуты: 70×2 + 10 + 0,5 ≈ 2 ч 31 мин', m=='2 ч 31 мин', m)
    ok('дни: 71 (день < 1 мин не считается)', d=='71', d)
    ok('следующая цель показана', 'Следующая цель' in pg.locator('#totals').inner_text(), pg.locator('#totals').inner_text())
    pg.locator('#totals').scroll_into_view_if_needed(); pg.screenshot(path=SH+'totals.png')
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
