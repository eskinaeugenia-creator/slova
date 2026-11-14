# «Повтори за мной»: кнопка 🎙 в диалогах и книгах, запись своего голоса и прослушивание рядом с образцом
import os
exec(open('tests/e2e_extra.py', encoding='utf-8').read().split('with sync_playwright()')[0])
SH=os.environ.get('SHOTS', '/home/claude/tests/shots/')
# Поддельный микрофон и MediaRecorder: в тестовом браузере нет звуковой карты
FAKE_MIC = """
(() => { window.__mic = { opened: 0, stopped: 0, played: 0 };
  const track = () => ({ stop(){ window.__mic.stopped++; } });
  const md = navigator.mediaDevices || {};
  md.getUserMedia = async () => { window.__mic.opened++; return { getTracks: () => [track()] }; };
  try { Object.defineProperty(navigator, 'mediaDevices', { value: md, configurable: true }); } catch (e) {}
  class R { constructor(s, o){ this.stream=s; this.mimeType=(o&&o.mimeType)||'audio/webm'; this.state='inactive'; }
    static isTypeSupported(t){ return t.indexOf('webm')>=0; }
    start(){ this.state='recording'; }
    stop(){ this.state='inactive'; setTimeout(() => { this.ondataavailable && this.ondataavailable({ data: new Blob(['x'], { type: 'audio/webm' }) }); this.onstop && this.onstop(); }, 20); } }
  window.MediaRecorder = R;
  HTMLMediaElement.prototype.play = function(){ window.__mic.played++; return Promise.resolve(); };
  HTMLMediaElement.prototype.pause = function(){};
})();"""
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':375,'height':740}, is_mobile=True, has_touch=True)
    ctx.add_init_script(FAKE_TTS); ctx.add_init_script(FAKE_MIC)
    ctx.route('https://commons.wikimedia.org/**', lambda r: r.fulfill(status=500, body='')); ctx.route('https://api.openverse.org/**', lambda r: r.fulfill(status=500, body=''))
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_selector('h1')
    # Диалог
    pg.goto(BASE+'#dialog-meet1'); pg.wait_for_selector('.bubble.rp')
    n_lines=pg.locator('.bubble.rp').count()
    ok('у каждой реплики диалога есть 🎙', pg.locator('.bubble.rp .rep-btn').count()==n_lines and n_lines>0, n_lines)
    pg.locator('.bubble.rp .rep-btn').nth(1).click(); pg.wait_for_selector('#rep-rec')
    ok('окно «Повтори за мной» с фразой и переводом', "I'm Anna" in pg.locator('.sheet').inner_text() and 'Приятно познакомиться' in pg.locator('.sheet').inner_text())
    ok('честно: без оценки произношения', 'Оценки произношения здесь нет' in pg.locator('.sheet').inner_text())
    ok('до записи «Мой голос» неактивна', pg.locator('#rep-mine').is_disabled())
    pg.evaluate("window.__spoken=[]"); pg.click('#rep-sample'); pg.wait_for_timeout(200)
    ok('«Образец» озвучивает реплику', any("I'm Anna" in t for _, t in pg.evaluate("window.__spoken")), pg.evaluate("window.__spoken"))
    pg.click('#rep-rec'); pg.wait_for_selector('#rep-rec:has-text("Стоп")')
    ok('идёт запись, микрофон открыт', pg.evaluate("window.__mic.opened")==1 and 'Идёт запись' in pg.locator('#rep-status').inner_text())
    pg.screenshot(path=SH+'repeat-rec.png')
    pg.click('#rep-rec'); pg.wait_for_selector('#rep-rec:has-text("ещё раз")')
    ok('после «Стоп» микрофон выключен', pg.evaluate("window.__mic.stopped")==1)
    ok('запись сразу проигрывается, кнопки сравнения активны', pg.evaluate("window.__mic.played")>=1 and not pg.locator('#rep-mine').is_disabled() and not pg.locator('#rep-both').is_disabled())
    pg.screenshot(path=SH+'repeat-done.png')
    pl=pg.evaluate("window.__mic.played"); pg.evaluate("window.__spoken=[]")
    pg.click('#rep-both'); pg.wait_for_timeout(400)
    ok('«Образец, потом я»: сначала голос, затем запись', len(pg.evaluate("window.__spoken"))>=1 and pg.evaluate("window.__mic.played")==pl+1)
    pg.click('.sheet [aria-label="Закрыть"]'); pg.wait_for_timeout(200)
    ok('окно закрывается', pg.locator('#rep-rec').count()==0)
    # Книга
    pg.goto(BASE+'#read-hen-0'); pg.wait_for_selector('.reader .rp')
    ok('у абзацев книги есть 🎙', pg.locator('.reader .rp .rep-btn').count()==pg.locator('.reader .rp').count())
    pg.locator('.reader .rp .rep-btn').first.click(); pg.wait_for_selector('#rep-rec')
    pg.evaluate("window.__spoken=[]"); pg.click('#rep-slow'); pg.wait_for_timeout(500)
    ok('в книге «Медленно» читает абзац', len(pg.evaluate("window.__spoken"))>=1)
    pg.click('.sheet [aria-label="Закрыть"]')
    # Микрофон запрещён — сообщение, кнопки пропадают
    pg.evaluate("void (navigator.mediaDevices.getUserMedia = async () => { const e = new Error('no'); e.name='NotAllowedError'; throw e; })")
    pg.locator('.reader .rp .rep-btn').first.click(); pg.wait_for_selector('#rep-rec'); pg.click('#rep-rec'); pg.wait_for_timeout(200)
    ok('запрет микрофона — понятное сообщение', 'Нет доступа к микрофону' in pg.locator('#rep-status').inner_text())
    pg.click('.sheet [aria-label="Закрыть"]')
    pg.goto(BASE+'#dialog-cafe1'); pg.wait_for_selector('.bubble.rp')
    ok('после запрета кнопка 🎙 скрыта', pg.locator('.rep-btn').count()==0)
    ok('нет горизонтальной прокрутки', pg.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    ok('нет ошибок на странице', not errs, errs)
    # Записи нет — кнопки нет
    ctx2=b.new_context(viewport={'width':375,'height':740}); ctx2.add_init_script(FAKE_TTS); ctx2.add_init_script("delete window.MediaRecorder; window.MediaRecorder=undefined;")
    pg2=ctx2.new_page(); pg2.goto(BASE+'#dialog-meet1'); pg2.wait_for_selector('.bubble.rp')
    ok('без поддержки записи кнопка 🎙 скрыта', pg2.locator('.rep-btn').count()==0)
    print(f'Итог: {sum(res)} из {len(res)}')
