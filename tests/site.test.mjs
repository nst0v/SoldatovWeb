import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {services,modules,site} from '../src/content.mjs';
const root=resolve('dist');
function walk(path){return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(path,e.name)):[resolve(path,e.name)]);}
const pages=walk(root).filter(p=>p.endsWith('.html'));
const read=p=>readFileSync(p,'utf8');
function ids(html){return [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);}
test('Nine service routes, ten stable modules, no unapproved prices',()=>{
 assert.equal(services.length,9);assert.equal(modules.length,10);
 assert.equal(new Set(services.map(s=>s.id)).size,9);
 assert.equal(new Set(services.map(s=>s.slug)).size,9);
 assert.equal(new Set(modules.map(s=>s[0])).size,10);
 for(const s of services){assert.ok(s.includes.length>=4);assert.ok(existsSync(resolve(root,'services',s.slug,'index.html')));assert.ok(s.priceFrom==null);}
});
for(const path of pages){
 const label=relative(root,path); const html=read(path);
 test(`${label}: document semantics and metadata`,()=>{
  assert.match(html,/<!doctype html>/i);assert.match(html,/<html lang="ru">/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal(new Set(ids(html)).size,ids(html).length,'Duplicate IDs');
  assert.match(html,/<meta name="description" content="[^"]{20,}"/);
  assert.match(html,/<main id="main">/);assert.match(html,/class="skip-link"/);
  assert.doesNotMatch(html,/placehold\.co|Soldatov\.dev|24\/7|href="#"|success.*тестовый/);
  if(!site.origin)assert.match(html,/name="robots" content="noindex, follow"/);
 });
 test(`${label}: all local resources, routes and anchors exist`,()=>{
  const documentURL='https://test.invalid/'+(label==='index.html'?'':label.replaceAll('\\','/'));
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
   const raw=match[1].replaceAll('&amp;','&');
   if(/^(https?:|mailto:|tel:|data:)/.test(raw))continue;
   const url=new URL(raw,documentURL);
   let target=resolve(root,'.'+decodeURIComponent(url.pathname));
   if(url.pathname.endsWith('/'))target=resolve(target,'index.html');
   assert.ok(existsSync(target),`${raw} -> ${target} missing`);
   if(url.hash){assert.ok(ids(read(target)).includes(decodeURIComponent(url.hash.slice(1))),`Anchor ${raw} missing`);}
  }
 });
 test(`${label}: contact mode is explicit, no fake submit`,()=>{
  assert.match(html,/id="contact-form"/);
  if(!site.formEndpoint){assert.match(html,/data-mode="email"/);assert.match(html,/Подготовить письмо/);assert.doesNotMatch(html,/type="submit"[^>]*>Отправить заявку/);}
  assert.match(html,/autocomplete="name"/);assert.match(html,/name="contact"[^>]*required/);
 });
}
test('Cube asset has actual alpha and no missing background resource',()=>{
 const asset=readFileSync(resolve(root,'assets/cubes.webp'));
 assert.equal(asset.toString('ascii',0,4),'RIFF');assert.equal(asset.toString('ascii',8,12),'WEBP');
 assert.ok(asset.includes(Buffer.from('ALPH')) || asset.includes(Buffer.from('VP8L')));
 assert.ok(asset.length<100000);
 const css=read(resolve(root,'styles.css'));
 assert.match(css,/prefers-reduced-motion/);assert.match(css,/:focus-visible/);
 assert.doesNotMatch(css,/width:\s*(seventy|fifty|sixty)/);
});
test('No external scripts, fonts, icon CDN or tracking on load',()=>{
 for(const path of pages){const html=read(path);assert.doesNotMatch(html,/<script[^>]+src="https?:/);assert.doesNotMatch(html,/cdnjs|fonts\.googleapis|googletagmanager|mc\.yandex/);}
});
test('Backend is disabled by default and never marks mock responses as delivery',()=>{
 const php=read(resolve(root,'api/contact.php'));
 assert.match(php,/FORM_ENABLED/);assert.match(php,/FORM_PRIVACY_READY/);assert.match(php,/\['ok'\].*=== true/);
 assert.doesNotMatch(php,/FILTER_SANITIZE_STRING|parse_mode|mock_response/);
});
