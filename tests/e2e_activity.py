# Время занятий считается только при реальном использовании: свернули в Telegram / ушли из окна / долго без касаний — не считается
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
FAKE_TG = """
(() => {
  const H = {}, store = {};
  const cb = (f, v) => setTimeout(() => f && f(null, v), 0);
  window.__tgFire = e => (H[e] || []).forEach(f => f());
  window.Telegram = { WebApp: {
    initData: 'query_id=TEST', initDataUnsafe: { user: { id: 1, first_name: 'Аня' } }, version: '8.0', isActive: true,
    isVersionAtLeast: v => parseFloat(v) <= 8.0, ready(){}, expand(){}, setHeaderColor(){}, setBackgroundColor(){}, setBottomBarColor(){},
    onEvent(e, f){ (H[e] = H[e] || []).push(f); }, BackButton: { show(){}, hide(){}, onClick(){} },
    CloudStorage: { setItem:(k,v,f)=>{ store[k]=v; cb(f,true); }, getItems:(ks,f)=>{ const o={}; ks.forEach(k=>o[k]=store[k]||''); cb(f,o); }, getKeys:(f)=>cb(f,Object.keys(store)), removeItems:(ks,f)=>{ ks.forEach(k=>delete store[k]); cb(f,true); } },
  } };
})();
"""
def secs(pg): return pg.evaluate("App.kvGet('studyTime').then(t => (t||{})[App.dayKey(Date.now())] || 0)")
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':800}, is_mobile=True, has_touch=True)
    ctx.add_init_script(FAKE_TTS); ctx.add_init_script(FAKE_TG)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1'); pg.wait_for_timeout(500)
    pg.goto(BASE+'#listen'); pg.wait_for_timeout(400)
    pg.mouse.click(5, 300)
    ok('на учебном экране после касания — время идёт', pg.evaluate("App.isStudyingNow()"))
    pg.evaluate("__tgFire('deactivated')")
    ok('свернули мини-приложение в Telegram — не считается', not pg.evaluate("App.isStudyingNow()"))
    pg.evaluate("__tgFire('activated')"); pg.mouse.click(5, 300)
    ok('вернулись и коснулись — снова считается', pg.evaluate("App.isStudyingNow()"))
    pg.evaluate("window.dispatchEvent(new Event('blur'))")
    ok('ушли в другое окно — не считается', not pg.evaluate("App.isStudyingNow()"))
    pg.evaluate("window.dispatchEvent(new Event('focus'))")
    pg.evaluate("(() => { const n = Date.now; Date.now = () => n() + 130000; })()")
    ok('больше 2 минут без касаний — не считается', not pg.evaluate("App.isStudyingNow()"))
    pg.evaluate("speechSynthesis.speaking = true"); speaking = pg.evaluate("speechSynthesis.speaking")
    if speaking: ok('…но если идёт озвучка (слушаете книгу) — считается', pg.evaluate("App.isStudyingNow()"))
    pg.reload(); pg.wait_for_selector('main'); pg.wait_for_timeout(300)
    pg.goto(BASE+'#listen'); pg.mouse.click(5, 300)
    # реальный счёт: 11 с активности
    s0=secs(pg)
    for i in range(6): pg.mouse.click(5, 300); pg.wait_for_timeout(2000)
    pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); pg.evaluate("__tgFire('deactivated')"); pg.wait_for_timeout(300)
    s1=secs(pg)
    ok('активные ~12 с засчитаны и сохранены при сворачивании', s1-s0>=5, (s0,s1))
    pg.wait_for_timeout(11000)
    pg.evaluate("__tgFire('activated')"); pg.evaluate("__tgFire('deactivated')"); pg.wait_for_timeout(300)
    s2=secs(pg)
    ok('пока свёрнуто 11 с — время не прибавилось', s2==s1, (s1,s2))
    pg.goto(BASE+'#today'); pg.wait_for_timeout(11000); pg.evaluate("__tgFire('activated')"); pg.evaluate("__tgFire('deactivated')"); pg.wait_for_timeout(300)
    ok('на экране «Сегодня» (не занятие) время не идёт', secs(pg)==s2, (s2, secs(pg)))
    ok('нет ошибок на странице', not errs, errs)
    print(f'Итог: {sum(res)} из {len(res)}')
