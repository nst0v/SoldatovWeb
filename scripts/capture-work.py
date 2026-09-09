"""Capture only the owner's two public demo URLs. A failed fetch never becomes a fake case."""
import io, json, shutil
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CASES=[('amur','https://nst0v.github.io/amur-beauty/',['амур','amur']),('bezvmyatin','https://nst0v.github.io/bezvmyatin/',['вмятин','bezvmyatin'])]
report=[]
with sync_playwright() as p:
    opts={'headless':True}
    if shutil.which('chromium'): opts['executable_path']=shutil.which('chromium')
    browser=p.chromium.launch(**opts)
    for name,url,terms in CASES:
        page=browser.new_page(viewport={'width':1440,'height':960},device_scale_factor=1,reduced_motion='reduce')
        try:
            response=page.goto(url,wait_until='networkidle',timeout=45000)
            if response is None or response.status>=400: raise RuntimeError(f'HTTP {response.status if response else "none"}')
            text=page.locator('body').inner_text().lower()
            if not any(term in text for term in terms): raise RuntimeError('Expected project not found')
            page.add_style_tag(content='*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}')
            page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(800)
            image=Image.open(io.BytesIO(page.screenshot())).convert('RGB').resize((960,640),Image.Resampling.LANCZOS)
            target=ROOT/'public/assets'/f'{name}.webp';image.save(target,quality=83,method=6)
            report.append({'id':name,'url':url,'captured':True,'asset':str(target.relative_to(ROOT))})
        except Exception as error:
            report.append({'id':name,'url':url,'captured':False,'reason':str(error)[:300]})
        finally: page.close()
    browser.close()
(ROOT/'artifacts').mkdir(exist_ok=True)
(ROOT/'artifacts/portfolio-capture.json').write_text(json.dumps({'captured_at':datetime.now(timezone.utc).isoformat(),'projects':report},ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False))
