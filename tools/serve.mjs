#!/usr/bin/env node
/* Serves the deck on this computer and the local network, with a phone remote.

   node tools/serve.mjs            then open http://localhost:8080 on the presenting laptop
   node tools/serve.mjs --port=9000

   The presenter view shows a QR code; scan it with a phone on the same Wi-Fi to change slides,
   pause the voice and black the screen. Only someone with that code's private link can send commands.
   No installs needed (Node 18 or newer). The deck still works without this, by opening index.html. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=+((process.argv.find(a=>a.startsWith('--port='))||'').split('=')[1]||8080);
const TOKEN=crypto.randomBytes(9).toString('base64url');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const lan=Object.values(os.networkInterfaces()).flat().find(n=>n&&n.family==='IPv4'&&!n.internal);
const HOST=lan?lan.address:'localhost';
const phoneUrl=`http://${HOST}:${PORT}/remote.html?t=${TOKEN}`;

const decks=new Set(), phones=new Set(); let lastState=null;
const isLocal=req=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
const sse=(res,set)=>{res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});res.write(':ok\n\n');set.add(res);res.on('close',()=>set.delete(res))};
const push=(set,obj)=>{const data='data: '+JSON.stringify(obj)+'\n\n';set.forEach(r=>r.write(data))};
const body=req=>new Promise(r=>{let b='';req.on('data',d=>{b+=d;if(b.length>2e5)req.destroy()});req.on('end',()=>{try{r(JSON.parse(b||'{}'))}catch(e){r({})}})});
setInterval(()=>{decks.forEach(r=>r.write(':\n\n'));phones.forEach(r=>r.write(':\n\n'))},20000);

http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://x');
  if(url.pathname.startsWith('/remote/')){
    if(url.pathname==='/remote/info'){
      if(!isLocal(req)){res.writeHead(403);return res.end()}
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({token:TOKEN,phoneUrl}));
    }
    if(url.searchParams.get('t')!==TOKEN){res.writeHead(403);return res.end()}
    if(url.pathname==='/remote/events'){
      const role=url.searchParams.get('role');
      if(role==='deck')return sse(res,decks);
      sse(res,phones); if(lastState)res.write('data: '+JSON.stringify(lastState)+'\n\n'); return;
    }
    if(req.method==='POST'&&url.pathname==='/remote/cmd'){const b=await body(req);if(typeof b.cmd==='string')push(decks,{cmd:b.cmd,arg:b.arg});res.writeHead(204);return res.end()}
    if(req.method==='POST'&&url.pathname==='/remote/state'){lastState=await body(req);push(phones,lastState);res.writeHead(204);return res.end()}
    res.writeHead(404);return res.end();
  }
  let p=decodeURIComponent(url.pathname); if(p.endsWith('/'))p+='index.html';
  const file=path.join(ROOT,path.normalize(p).replace(/^(\.\.[/\\])+/,''));
  if(!file.startsWith(ROOT+path.sep)||path.basename(file).startsWith('.')){res.writeHead(403);return res.end()}
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404);return res.end('Not found')}
    const range=req.headers.range, type=TYPES[path.extname(file).toLowerCase()]||'application/octet-stream';
    if(range){const m=range.match(/bytes=(\d*)-(\d*)/);const start=+(m[1]||0),end=m[2]?+m[2]:st.size-1;
      res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});return fs.createReadStream(file,{start,end}).pipe(res)}
    res.writeHead(200,{'Content-Type':type,'Content-Length':st.size,'Accept-Ranges':'bytes'});fs.createReadStream(file).pipe(res);
  });
}).listen(PORT,'0.0.0.0',()=>{
  console.log(`\n  One UNISA deck:  http://localhost:${PORT}\n  Phone remote:    ${phoneUrl}\n\n  Open the deck on this laptop, press Present, and scan the QR code in the presenter view.\n  Press Ctrl+C to stop.\n`);
});
