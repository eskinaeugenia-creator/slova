import json, base64, io
from PIL import Image
from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'; res=[]
def ok(n,c,e=''): res.append(c); print(('✓ ' if c else '✗ ')+n+(' — '+str(e) if e!='' else ''))
def png(color):
    b=io.BytesIO(); Image.new('RGB',(600,400),color).save(b,'PNG'); return b.getvalue()
IMG={'a':png((30,120,200)),'b':png((220,160,40)),'c':png((40,180,90))}
queries=[]
def commons(route):
    u=route.request.url; queries.append(u)
    import urllib.parse as up; q=up.parse_qs(up.urlparse(u).query)['gsrsearch'][0]
    pages={str(i):{'index':i+1,'title':f'File:{q} {k}.jpg','imageinfo':[{'thumburl':f'https://upload.wikimedia.org/t/{k}.png','descriptionurl':f'https://commons.wikimedia.org/wiki/File:{k}','mime':'image/jpeg',
      'extmetadata':{'ObjectName':{'value':f'{q} photo {k}'},'Artist':{'value':'<a href="#">Jane Doe</a>'},'LicenseShortName':{'value':'CC BY-SA 4.0'}}}]} for i,k in enumerate('abc')}
    route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*'}, body=json.dumps({'query':{'pages':pages}}))
def upload(route):
    k=route.request.url.rsplit('/',1)[1][0]
    route.fulfill(status=200, content_type='image/png', headers={'Access-Control-Allow-Origin':'*'}, body=IMG[k])
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':375,'height':740}, is_mobile=True, has_touch=True)
    ctx.route('https://commons.wikimedia.org/**', commons); ctx.route('https://upload.wikimedia.org/**', upload)
    ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    ok('спрашивает имя при первом запуске', pg.locator('text=Как к вам обращаться?').count()==1)
    pg.fill('#ask-name','Женя'); pg.click('text=Готово'); pg.wait_for_selector('text=Привет, Женя!')
    ok('имя сохранено, приветствие без чужого имени', True)
    pg.goto(BASE+'#add'); pg.wait_for_selector('#f-en'); pg.fill('#f-en','beach'); pg.fill('#f-ru','пляж'); pg.click('button[type=submit]')
    pg.wait_for_function("[...App.S.words.values()].some(w => w.en==='beach' && w.image)", timeout=8000)
    w=pg.evaluate("(() => { const w=[...App.S.words.values()].find(w=>w.en==='beach'); return {emoji:w.emoji, img:w.image.slice(0,22), credit:w.imageCredit, auto:w.auto, id:w.id}; })()")
    ok('эмодзи подобран сразу (без сети)', w['emoji']=='🏖️', w['emoji'])
    ok('фото подобралось само после сохранения', w['img'].startswith('data:image/jpeg'), w['img'])
    ok('сохранены автор и лицензия', w['credit']['license']=='CC BY-SA 4.0' and w['credit']['creator']=='Jane Doe', w['credit'])
    pg.goto(BASE+'#word-'+w['id']); pg.wait_for_selector('.wcard .pic img')
    ok('в карточке пометка «подобрана автоматически — проверьте»', pg.locator('text=подобрана автоматически').count()==1)
    first=pg.evaluate(f"App.S.words.get('{w['id']}').image")
    pg.click('text=Другая картинка'); pg.wait_for_timeout(800)
    second=pg.evaluate(f"App.S.words.get('{w['id']}').image")
    ok('«Другая картинка» меняет фото', first!=second)
    pg.screenshot(path='/home/claude/tests/shots/15-auto-image.png', full_page=True)
    pg.click('text=Убрать'); pg.wait_for_timeout(300)
    ok('«Убрать» удаляет картинку и больше не подбирает', pg.evaluate(f"(() => {{ const w=App.S.words.get('{w['id']}'); return !w.image && w.imgTried; }})()"))
    # Импорт из Claude с запросом картинки
    pg.goto(BASE+'#add'); pg.click('.seg button:has-text("Из Claude")')
    ans=json.dumps([{'en':'rent','ru':'снимать','image':'apartment keys'},{'en':'towel','ru':'полотенце'},{'en':'deposit','ru':'залог','image':'money handshake'},{'en':'quiet','ru':'тихий'}])
    pg.fill('#claude-answer','```json\n'+ans+'\n```'); pg.click('text=Проверить и импортировать'); pg.wait_for_selector('.prow')
    pg.click('button:has-text("Сохранить: новых")'); pg.wait_for_selector('.report')
    pg.wait_for_function("[...App.S.words.values()].filter(w => w.image).length >= 4", timeout=12000)
    ok('после импорта картинки подобрались в фоне для всех слов', True)
    used=[q for q in queries if 'apartment' in q]
    ok('для абстрактного «rent» искалось по запросу из Claude «apartment keys»', len(used)>0)
    # Своё фото не перезаписывается
    rid=pg.evaluate("[...App.S.words.values()].find(w=>w.en==='rent').id")
    pg.evaluate(f"(async () => {{ const w=App.S.words.get('{rid}'); w.image='data:image/png;base64,MINE'; w.auto={{}}; await App.saveWord(w); Pics.enqueue(['{rid}']); }})()"); pg.wait_for_timeout(800)
    ok('своё фото не заменяется автоподбором', pg.evaluate(f"App.S.words.get('{rid}').image")=='data:image/png;base64,MINE')
    # Без сети — ждёт, потом продолжает
    ctx.set_offline(True)
    pg.evaluate("location.hash='today'"); pg.wait_for_timeout(200); pg.evaluate("App.S.ui.addMode='one'; location.hash='add'"); pg.wait_for_selector('#f-en'); pg.fill('#f-en','sea'); pg.fill('#f-ru','море'); pg.click('button[type=submit]'); pg.wait_for_timeout(800)
    sid=pg.evaluate("[...App.S.words.values()].find(w=>w.en==='sea').id")
    ok('без сети слово сохраняется с эмодзи, фото ждёт', pg.evaluate(f"(() => {{ const w=App.S.words.get('{sid}'); return !w.image && !w.imgTried && w.emoji==='🌊'; }})()"))
    ctx.set_offline(False); pg.evaluate("window.dispatchEvent(new Event('online'))")
    pg.wait_for_function(f"!!App.S.words.get('{sid}').image", timeout=10000)
    ok('после появления сети фото подобралось само', True)
    # Выключенная настройка
    pg.evaluate("App.S.settings.autoImages=false; location.hash='today'"); pg.wait_for_timeout(200); pg.evaluate("location.hash='add'"); pg.wait_for_selector('#f-en'); pg.fill('#f-en','island'); pg.fill('#f-ru','остров'); pg.click('button[type=submit]'); pg.wait_for_timeout(800)
    ok('если автоподбор выключен — фото не ищется', pg.evaluate("!([...App.S.words.values()].find(w=>w.en==='island').image)"))
    ok('нет ошибок на странице', not errs, errs)
    b.close()
print(f'Итог: {sum(res)} из {len(res)}')
