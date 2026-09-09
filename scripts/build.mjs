import {mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {home, servicePage, notFound} from '../src/render.mjs';
import {services,site} from '../src/content.mjs';
const root=resolve(import.meta.dirname,'..');
process.chdir(root);
if (!/^\/(?!\/)[^?#]*\/$|^\/$/.test(process.env.PUBLIC_BASE_PATH || '/')) throw new Error('PUBLIC_BASE_PATH must start and end with /');
if (site.origin && !/^https:\/\/[^\s?#]+$/.test(site.origin)) throw new Error('SITE_ORIGIN must be an absolute HTTPS URL, optionally with a base path.');
if (Boolean(site.formEndpoint)!==Boolean(site.privacyUrl)) throw new Error('Set both FORM_ENDPOINT and PRIVACY_URL, or neither.');
if (site.formEndpoint && (!site.formEndpoint.startsWith('/') || site.formEndpoint.startsWith('//'))) throw new Error('FORM_ENDPOINT must be a same-origin absolute path.');
if (site.privacyUrl && !/^\/(?!\/)/.test(site.privacyUrl)) throw new Error('PRIVACY_URL must be a same-origin path.');
const dist=resolve(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
await cp(resolve(root,'public'),dist,{recursive:true});
await writeFile(resolve(dist,'index.html'),home());
for (const service of services) {
 const dir=resolve(dist,'services',service.slug); await mkdir(dir,{recursive:true});
 await writeFile(resolve(dir,'index.html'),servicePage(service));
}
await writeFile(resolve(dist,'404.html'),notFound());
await writeFile(resolve(dist,'.nojekyll'),'');
if(site.origin) {
 const origin=site.origin.replace(/\/$/,'');
 const locations=[origin+'/',...services.map(s=>`${origin}/services/${s.slug}/`)];
 await writeFile(resolve(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations.map(u=>`<url><loc>${u.replaceAll('&','&amp;')}</loc></url>`).join('')}</urlset>`);
 await writeFile(resolve(dist,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
} else await writeFile(resolve(dist,'robots.txt'),'User-agent: *\nDisallow: /\n');
console.log(`Built ${services.length+2} HTML pages. Contact: ${site.formEndpoint?'server':'explicit email draft'}. Indexing: ${site.origin?'enabled':'preview / noindex'}.`);
