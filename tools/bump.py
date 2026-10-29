#!/usr/bin/env python3
"""Выпустить новую версию: python3 tools/bump.py 1.9.5
Меняет версию в app.js, sw.js, version.json и ?v= у скриптов в index.html — чтобы телефоны сразу получили обновление."""
import re, sys, pathlib
v = sys.argv[1]; root = pathlib.Path(__file__).resolve().parent.parent
def edit(name, fn):
    p = root / name; p.write_text(fn(p.read_text(encoding='utf-8')), encoding='utf-8')
edit('js/app.js', lambda s: re.sub(r"APP_VERSION = '[^']+'", f"APP_VERSION = '{v}'", s))
edit('sw.js', lambda s: re.sub(r"slova-v[0-9.]+", f"slova-v{v}", s))
edit('index.html', lambda s: re.sub(r'\?v=[0-9.]+', f'?v={v}', s))
(root / 'version.json').write_text('{"v":"%s"}\n' % v, encoding='utf-8')
print('версия', v)
