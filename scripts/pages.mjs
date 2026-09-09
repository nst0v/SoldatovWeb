// Update only the generated, noindex GitHub Pages snapshot. Never copy PHP or secrets.
import {readdir, readFile, writeFile, mkdir, copyFile, rm} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
const root = resolve(import.meta.dirname, '..');
process.chdir(root);
process.env.SITE_ORIGIN = '';
process.env.FORM_ENDPOINT = '';
process.env.PRIVACY_URL = '';
process.env.PUBLIC_BASE_PATH = '/SoldatovWeb/';
await import('./build.mjs');
const allowed = name => /^(?:index\.html|404\.html|styles\.css|app\.js|robots\.txt|\.nojekyll|assets\/[A-Za-z0-9._-]+|services\/[a-z0-9-]+\/index\.html)$/.test(name);
async function list(dir, prefix = '') {
 const found = [];
 for (const entry of await readdir(dir, {withFileTypes:true})) {
  const name = prefix + entry.name;
  if (entry.isDirectory()) found.push(...await list(resolve(dir, entry.name), name + '/'));
  else if (entry.isFile() && allowed(name)) found.push(name);
 }
 return found;
}
const files = (await list(resolve(root,'dist'))).sort();
let previous = [];
try { previous = JSON.parse(await readFile('.pages-manifest.json','utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
if (!Array.isArray(previous) || !previous.every(allowed)) throw new Error('Invalid generated-file manifest');
for (const name of previous) if (!files.includes(name)) await rm(resolve(root, name), {force:true});
for (const name of files) {
 const destination = resolve(root, name);
 await mkdir(dirname(destination), {recursive:true});
 await copyFile(resolve(root,'dist',name),destination);
}
await writeFile('.pages-manifest.json', JSON.stringify(files,null,2)+'\n');
console.log(`Updated ${files.length} static GitHub Pages files; noindex, no server form, no PHP.`);
