import json
from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'; res=[]
def ok(n,c,e=''): res.append(bool(c)); print(('✓ ' if c else '✗ ')+n+(' — '+str(e) if e!='' else ''))
CLOUD={}
def cloud_words():
    out={}
    for k,v in CLOUD.items():
        if k.startswith('b_'): out.update(json.loads(v))
        if k.startswith('w_'): out[k[2:]]=v
    return out
def cloud(source, op, args):
    if op=='setItem': CLOUD[args[0]]=args[1]; return True
    if op=='getItems': return {k: CLOUD.get(k,'') for k in args[0]}
    if op=='getKeys': return list(CLOUD.keys())
    if op=='removeItems':
        for k in args[0]: CLOUD.pop(k,None)
        return True
FAKE = """
(() => {
  const call = (op, args, cb) => window.__cloud(op, args).then(v => cb && cb(null, v), e => cb && cb(String(e)));
  const handlers = {};
  window.Telegram = { WebApp: {
    initData: 'query_id=TEST', initDataUnsafe: { user: { id: 1, first_name: 'Аня' } }, version: '8.0',
    isVersionAtLeast: v => parseFloat(v) <= 8.0, ready(){}, expand(){}, setHeaderColor(){}, setBackgroundColor(){}, setBottomBarColor(){},
    onEvent(e, f){ handlers[e] = f; }, BackButton: { visible:false, show(){ this.visible = true; }, hide(){ this.visible = false; }, onClick(f){ this.f = f; } },
    CloudStorage: { setItem:(k,v,cb)=>call('setItem',[k,v],cb), getItems:(k,cb)=>call('getItems',[k],cb), getKeys:(cb)=>call('getKeys',[],cb), removeItems:(k,cb)=>call('removeItems',[k],cb) },
  } };
})();
"""
with sync_playwright() as p:
    b=p.chromium.launch()
    def device(name):
        ctx=b.new_context(viewport={'width':375,'height':740}, is_mobile=True, has_touch=True)
        ctx.expose_binding('__cloud', cloud); ctx.add_init_script(FAKE)
        ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
        pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.errs=errs
        pg.goto(BASE); pg.wait_for_selector('h1'); pg.wait_for_timeout(600); return pg
    A=device('phone')
    ok('в Telegram имя берётся из аккаунта', 'Привет, Аня!' in A.inner_text('main'))
    A.evaluate("Prefs.loadDemo()"); A.wait_for_timeout(2500)
    ok('слова ушли в облако Telegram (пачками)', len(cloud_words())==12 and not any(k.startswith('w_') for k in CLOUD), len(cloud_words()))
    ok('размер записи слова в пределах 4096', max(len(v) for k,v in CLOUD.items())<=4096, max(len(v) for v in CLOUD.values()))
    # Занятие на телефоне
    A.evaluate("location.hash='today'"); A.wait_for_timeout(300)
    A.click('text=Начать «Мои 15 минут»'); A.wait_for_selector('.sbody')
    A.click('text=Понятно, дальше'); A.wait_for_selector('.opt')
    word=A.locator('.prompt .big').inner_text()
    ru=A.evaluate(f"[...App.S.words.values()].find(w=>w.en==={json.dumps(word)}).ru")
    A.locator('.opt', has_text=ru).first.click(); A.wait_for_timeout(300); A.click('.actions .btn.primary')
    ok('кнопка «Назад» Telegram показывается на внутренних экранах', A.evaluate("Telegram.WebApp.BackButton.visible"))
    idx_before=A.evaluate("JSON.parse(JSON.stringify(App.S.words.size))")
    # «Телефон выгрузил приложение» — перезагрузка посреди занятия
    A.wait_for_timeout(1800)
    A.reload(); A.wait_for_selector('.sbody', timeout=8000)
    ok('после перезапуска на экране занятия — оно восстановилось само', A.locator('.sbody').count()==1)
    pos=A.locator('.sbar .num').inner_text()
    ok('занятие продолжилось с того же места (не с начала)', not pos.startswith('1/'), pos)
    # если приложение открыли с главного экрана — предложение продолжить
    A.wait_for_timeout(500); A.evaluate("history.replaceState(null, '', '#today')")  # как iPhone: перезапуск с начального экрана
    A.reload(); A.wait_for_selector('h1'); A.wait_for_timeout(800)
    ok('на «Сегодня» предлагает продолжить незаконченное занятие', A.locator('text=Незаконченное занятие').count()==1)
    A.click('.banner .btn.primary:has-text("Продолжить")'); A.wait_for_selector('.sbody')
    A.evaluate("Train.abort(true)"); A.wait_for_timeout(2000)
    learned=A.evaluate("[...App.S.words.values()].filter(w=>w.srs.recog&&w.srs.recog.reps).map(w=>w.en)")
    A.evaluate("App.kvSet('grammar', { be: { done: true, best: 90, tries: 1, last: Date.now(), card: { reps: 1, lapses: 0, s: 3, d: 5, last: Date.now(), due: Date.now() + 3*864e5 } } })"); A.wait_for_timeout(2500)
    # Второе устройство (компьютер) того же аккаунта
    B=device('computer')
    B.wait_for_timeout(1500)
    nB=B.evaluate("App.S.words.size"); learnedB=B.evaluate("[...App.S.words.values()].filter(w=>w.srs.recog&&w.srs.recog.reps).map(w=>w.en)")
    ok('на втором устройстве те же слова', nB==12, nB)
    ok('и тот же прогресс повторений', sorted(learned)==sorted(learnedB), learnedB)
    gB=B.evaluate("App.kvGet('grammar')")
    ok('прогресс грамматики тоже синхронизирован', bool(gB) and gB.get('be',{}).get('best')==90, gB)
    # Изменение и удаление на компьютере → видно на телефоне
    wid=B.evaluate("[...App.S.words.values()].find(w=>w.en==='towel').id")
    B.evaluate(f"(async()=>{{ const w=App.S.words.get('{wid}'); w.comment='с компьютера'; await App.saveWord(w); }})()")
    did=B.evaluate("[...App.S.words.values()].find(w=>w.en==='wave').id")
    B.evaluate(f"(async()=>{{ App.S.words.delete('{did}'); await DB.del('words','{did}'); }})()"); B.wait_for_timeout(2500)
    print('   B debug:', B.evaluate('JSON.stringify(TG._debug())'))
    print('   статус B:', B.evaluate("TG.status"), B.evaluate("App.S.words.get('%s').comment" % wid))
    
    print('   статус A:', A.evaluate("TG.status"))
    A.evaluate("TG.sync({manual:true})"); A.wait_for_timeout(1500)
    print('   статус A после:', A.evaluate("TG.status"), A.evaluate(f"App.S.words.get('{wid}').comment"))
    ok('правка с компьютера пришла на телефон', A.evaluate(f"App.S.words.get('{wid}').comment")=='с компьютера')
    ok('удаление с компьютера пришло на телефон (и слово не вернулось)', A.evaluate(f"!App.S.words.has('{did}')") and did not in cloud_words())
    # Другой человек (подруга) — пустое облако, свой словарь
    for pg in (A,B): ok('нет ошибок на странице', not pg.errs, pg.errs)
    A.close(); B.close()
    saved=dict(CLOUD); CLOUD.clear()
    F=device('friend'); F.wait_for_timeout(800)
    ok('у подруги свой пустой словарь', F.evaluate("App.S.words.size")==0)
    CLOUD.clear(); CLOUD.update(saved)
    CLOUD.clear(); CLOUD.update(saved)
    ok('в облаке нет дублей и удалённых слов', len(cloud_words())==11, len(cloud_words()))
    # Перенос со старого формата (версия 1.2: по записи на слово)
    CLOUD.clear()
    import time
    for i in range(30):
        CLOUD['w_old%02d'%i]=json.dumps({'e':'old%d'%i,'r':'старое %d'%i,'ca':1700000000000+i,'ea':1700000000000+i,'g':[[2,0,5.1,4.2,1700000000000,1700500000000],0],'h':[2,0,0,'11']})
    M=device('migrate'); M.wait_for_timeout(2500)
    ok('перенос со старого формата: слова на месте с прогрессом', M.evaluate("App.S.words.size")==30 and M.evaluate("App.S.words.get('old05').srs.recog.reps")==2)
    ok('после переноса старых записей нет, всё в пачках', not any(k.startswith('w_') for k in CLOUD) and len(cloud_words())==30, sorted(CLOUD.keys())[:3])
    # Много слов: 3000 слов с длинными примерами
    big = M.evaluate('''(() => { const m = new Map(); const out = {}; for (let i = 0; i < 3000; i++) { const id = 'id' + i.toString(36) + 'xyz' + i;
        const w = App.newWord({ en: 'word number ' + i, ru: 'слово номер ' + i, example: 'This is a fairly long example sentence number ' + i + '.', exampleRu: 'Это довольно длинный пример номер ' + i + '.', collocation: 'some collocation', comment: 'мой комментарий к слову' });
        w.id = id; const b = TG.bucketOf(id); (out[b] = out[b] || new Map()).set(id, w); }
      let max = 0, fails = 0; Object.keys(out).forEach(b => { const s = TG.fitBucket(out[b]); if (!s) fails++; else max = Math.max(max, s.length); });
      return { buckets: Object.keys(out).length, max, fails }; })()''')
    ok('3000 слов: укладывается в лимиты облака Telegram (≤1024 записей, ≤4096 символов)', big['buckets']<=900 and big['fails']==0 and big['max']<=4096, big)
    CLOUD.clear(); CLOUD.update(saved)
    # Вне Telegram модуль молчит
    ctx=b.new_context(); pg=ctx.new_page(); pg.goto(BASE); pg.wait_for_selector('h1')
    ok('вне Telegram всё как раньше', pg.evaluate("TG.inTG===false && !document.querySelector('script[src*=telegram]')"))
    b.close()
print(f'Итог: {sum(res)} из {len(res)}')
