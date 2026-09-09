import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT || 8080);
http.createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if (/\.(php|env)$/i.test(pathname) || pathname.split('/').some(p=>p.startsWith('.'))) {res.writeHead(404);res.end('Not found');return;}
  let path=resolve(root,'.'+pathname);
  if (path!==root && !path.startsWith(root+sep)) {res.writeHead(403);res.end('Forbidden');return;}
  if((await stat(path)).isDirectory()) path=resolve(path,'index.html');
  const data=await readFile(path);
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(resolve(root,'404.html')));}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}`));
