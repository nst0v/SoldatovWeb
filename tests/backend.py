"""CLI requests exercise guards only, never send to Telegram."""
import json, os, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
API=ROOT/'public/api/contact.php'
fixtures=[
 ('method',{'REQUEST_METHOD':'GET'}, {}, {},405),
 ('disabled',{'REQUEST_METHOD':'POST'}, {}, {},503),
 ('large',{'REQUEST_METHOD':'POST','CONTENT_LENGTH':20000}, {}, {},413),
 ('origin',{'REQUEST_METHOD':'POST','HTTP_ORIGIN':'https://other.invalid'}, {}, {'FORM_ENABLED':'1','FORM_PRIVACY_READY':'1','FORM_ORIGIN':'https://site.invalid'},403),
]
env={'FORM_ENABLED':'1','FORM_PRIVACY_READY':'1','FORM_ORIGIN':'https://site.invalid'}
server={'REQUEST_METHOD':'POST','HTTP_ORIGIN':'https://site.invalid'}
valid={'name':'Тест','contact':'test@example.invalid','service':'landing','message':'Проверка','consent':'1','website':''}
for label,change in [('consent',{'consent':''}),('honeypot',{'website':'spam'}),('array',{'contact':[]}),('long',{'message':'я'*3001}),('unknown-service',{'service':'unknown'}),('empty-contact',{'contact':' '}),('short-contact',{'contact':'ab'}),('newline-contact',{'contact':'test\nnext'})]:
 fixtures.append((label,server,{**valid,**change},env,422))
fixtures.append(('no-credentials',server,valid,env,503))
for label,server,post,extra,expected in fixtures:
 php=f"$_SERVER=json_decode({json.dumps(json.dumps(server))},true);$_POST=json_decode({json.dumps(json.dumps(post))},true);register_shutdown_function(function(){{fwrite(STDERR,(string)http_response_code());}});require {json.dumps(str(API))};"
 clean={**os.environ, 'FORM_ENABLED':'0','FORM_PRIVACY_READY':'0','FORM_ORIGIN':'','TELEGRAM_BOT_TOKEN':'','TELEGRAM_CHAT_ID':'',**extra}
 result=subprocess.run(['php','-r',php],env=clean,capture_output=True,text=True,timeout=4,check=True)
 assert result.stderr==str(expected),(label,result.stderr,result.stdout)
 assert json.loads(result.stdout)['success'] is False
print(f'PASS: {len(fixtures)} PHP guard tests. No external delivery attempted.')
