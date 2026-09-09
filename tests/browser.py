"""Offline DOM checks by default; BROWSER_HTTP=1 checks served pages in CI.
No real messages are sent. Network success/failure states are explicitly mocked.
"""
import base64, json, os, re, shutil, subprocess, time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'; OUT=ROOT/'artifacts'; OUT.mkdir(exist_ok=True)
HTTP=os.getenv('BROWSER_HTTP')=='1'
BASE='http://127.0.0.1:8080'
checks=[]
server=None

def ok(name): checks.append({'name':name,'passed':True})
def load(page,path='index.html'):
    if HTTP:
        page.goto(BASE+'/'+('' if path=='index.html' else path),wait_until='networkidle')
    else:
        html=(DIST/path).read_text()
        css=(DIST/'styles.css').read_text()
        sprite=base64.b64encode((DIST/'assets/cubes.webp').read_bytes()).decode()
        css=css.replace("url('assets/cubes.webp')",f"url('data:image/webp;base64,{sprite}')")
        html=re.sub(r'<link rel="stylesheet"[^>]*>',lambda m:'<style>'+css+'</style>',html)
        html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
        html=re.sub(r'<link rel="icon"[^>]*>','',html)
        def embed(m):
            file=DIST/'assets'/m.group(1)
            return 'src="data:image/webp;base64,'+base64.b64encode(file.read_bytes()).decode()+'"'
        html=re.sub(r'src="(?:\./|../../)assets/([^"/]+\.webp)"',embed,html)
        page.set_content(html,wait_until='load')
        if page.evaluate('typeof window.__saytmskLoaded')!='boolean':
            page.add_script_tag(content='{'+(DIST/'app.js').read_text()+'}\nwindow.__saytmskLoaded=true;')
        else:
            page.add_script_tag(content='{'+(DIST/'app.js').read_text()+'}')
    page.wait_for_timeout(40)

def layout(page,width,label):
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'),f'{label}: overflow at {width}'
    assert page.locator('h1').count()==1
    # Real portfolio images load lazily; bring each into view before testing decoding.
    for image in page.locator('img').all():
        image.scroll_into_view_if_needed()
        page.wait_for_function('(e)=>e.complete && e.naturalWidth>0', arg=image.element_handle(), timeout=10000)
        assert image.evaluate('(e)=>e.complete && e.naturalWidth>0'),f'{label}: image failed'
    page.evaluate('window.scrollTo(0,0)')
    ok(f'{label} / {width}px: layout, images and h1')

try:
    if HTTP:
        server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        time.sleep(1)
    with sync_playwright() as pw:
        executable=os.getenv('CHROMIUM_PATH') or shutil.which('chromium')
        opts={'headless':True}
        if executable: opts.update(executable_path=executable,args=['--no-sandbox'])
        browser=pw.chromium.launch(**opts)
        errors=[]
        for width in [320,360,390,430,620,768,820,821,1024,1280,1440,1920]:
            page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
            page.on('pageerror',lambda e:errors.append(str(e)))
            load(page);layout(page,width,'home')
            if width in [390,1440]:
                page.screenshot(path=str(OUT/f'home-{width}.png'),full_page=True)
                page.screenshot(path=str(OUT/f'first-screen-{width}.png'))
            is_mobile=width<=820
            if is_mobile:
                page.locator('.menu-toggle').click()
                assert page.locator('.menu-toggle').get_attribute('aria-expanded')=='true'
            trigger=page.locator('.nav-trigger').first
            trigger.click();assert trigger.get_attribute('aria-expanded')=='true'
            assert page.locator('#nav-development').is_visible()
            assert page.locator('#nav-development a').count()==6
            page.keyboard.press('Tab'); assert page.evaluate('document.activeElement.closest("#nav-development")!==null')
            page.keyboard.press('Escape');assert trigger.get_attribute('aria-expanded')=='false'
            assert trigger.evaluate('(e)=>document.activeElement===e')
            if is_mobile:
                page.keyboard.press('Escape');assert page.locator('.menu-toggle').get_attribute('aria-expanded')=='false'
            ok(f'Navigation / {width}px: disclosure, keyboard, Escape')
            detail=page.locator('#faq details').first
            detail.locator('summary').focus();page.keyboard.press('Enter');assert detail.get_attribute('open') is not None
            page.keyboard.press('Enter');assert detail.get_attribute('open') is None
            ok(f'FAQ / {width}px: native keyboard disclosure')
            page.close()
        for service in sorted((DIST/'services').iterdir()):
            for width in [390,1440]:
                page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
                page.on('pageerror',lambda e:errors.append(str(e)))
                load(page,f'services/{service.name}/index.html');layout(page,width,service.name)
                assert page.locator('#service').input_value()!=''
                if service.name=='lending' and width==390: page.screenshot(path=str(OUT/'service-mobile.png'),full_page=True)
                page.close()
        page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
        page.on('pageerror',lambda e:errors.append(str(e)));load(page)
        page.locator('#contact').fill('   ')
        page.locator('#contact-form [type="submit"]').click()
        assert page.locator('.email-draft').count()==0
        page.locator('#contact').fill('test@example.invalid')
        page.locator('#message').fill('<script>alert(1)</script> Проверка текста — не отправлять')
        page.locator('#service').select_option('integrations')
        page.locator('#contact-form [type="submit"]').click()
        assert 'ещё не отправлено' in page.locator('.form-status').inner_text()
        assert page.locator('.email-draft').count()==1
        draft=page.locator('.email-draft textarea').input_value()
        assert 'Интеграции' in draft and '<script>alert(1)</script>' in draft
        assert page.locator('.email-draft a').get_attribute('href').startswith('mailto:soldatovprice@gmail.com?')
        page.locator('#contact-form [type="submit"]').click()
        assert page.locator('.email-draft').count()==1
        page.screenshot(path=str(OUT/'contact-draft-mobile.png'),full_page=False)
        ok('Email draft: validation, safe text, service, truthful state, no duplicate panel')
        # Mock HTTP transport only: verifies the UI, not live delivery.
        page.evaluate('''() => {document.querySelector('#contact-form').dataset.mode='server';document.querySelector('#contact-form').dataset.endpoint='/api/contact.php';window.fetch=async()=>new Response(JSON.stringify({success:false}),{status:503,headers:{'Content-Type':'application/json'}})}''')
        page.locator('#contact-form [type="submit"]').click()
        expect(page.locator('.form-status')).to_have_attribute('data-error','true')
        assert page.locator('#contact').input_value()=='test@example.invalid'
        assert page.locator('#contact-form [type="submit"]').is_enabled()
        page.evaluate("window.fetch=async()=>new Response(JSON.stringify({success:true}),{status:200,headers:{'Content-Type':'application/json'}})")
        page.locator('#contact-form [type="submit"]').click()
        expect(page.locator('.form-status')).to_contain_text('Запрос отправлен')
        assert page.locator('#contact').input_value()==''
        ok('Mocked server form: failure preserves input; success requires success=true')
        page.close()
        ctx=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
        page=ctx.new_page()
        if HTTP: page.goto(BASE,wait_until='networkidle')
        else:
            html=(DIST/'index.html').read_text();html=re.sub(r'<link rel="stylesheet"[^>]*>','',html);page.set_content(html)
        assert page.locator('.no-js-nav').is_visible()
        assert page.locator('h1').inner_text()
        page.locator('#faq summary').first.click();assert page.locator('#faq details').first.get_attribute('open') is not None
        ok('No JavaScript: content, fallback navigation, contacts and FAQ available')
        ctx.close()
        assert not errors,errors
        ok('No JavaScript runtime errors across tested routes and widths')
        browser.close()
    (OUT/'browser-report.json').write_text(json.dumps({'mode':'http' if HTTP else 'offline in-memory rendering','checks':checks,'errors':errors,'live_delivery_tested':False},ensure_ascii=False,indent=2))
    print(f'PASS: {len(checks)} browser checks; mode={"http" if HTTP else "offline"}. No live messages sent.')
finally:
    if server: server.terminate();server.wait(timeout=5)
