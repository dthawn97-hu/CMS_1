// Zero-dependency server: static files + JSON-file store.  Run: node server.js
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080, DB_FILE = path.join(__dirname, 'data.json');
const DIST = path.join(__dirname, 'dist'), MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' };

import { SEED } from './seed.js';

if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(SEED, null, 1));
const read = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const write = db => { fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db, null, 1)); fs.renameSync(DB_FILE + '.tmp', DB_FILE); }; // atomic

http.createServer((req, res) => {
  const url = req.url.split('?')[0], send = (c, body, type = 'application/json') => { res.writeHead(c, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(body); };
  if (req.method === 'GET' && !url.startsWith('/api/')) { // static from dist/, SPA fallback to index.html
    const f = path.join(DIST, path.normalize(url === '/' ? 'index.html' : url));
    const ok = f.startsWith(DIST + path.sep) && fs.existsSync(f) && fs.statSync(f).isFile(), file = ok ? f : path.join(DIST, 'index.html');
    if (!fs.existsSync(file)) return send(503, 'Chưa build: chạy "npm run build" hoặc "npm run dev"', 'text/plain');
    return send(200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
  }
  if (url === '/api/db' && req.method === 'GET') return send(200, JSON.stringify(read()));
  const m = url.match(/^\/api\/(\w+)$/);
  if (m && req.method === 'PUT' && m[1] in SEED) {
    let b = ''; req.on('data', c => { b += c; if (b.length > 5e6) req.destroy(); });
    return req.on('end', () => { try { const db = read(); db[m[1]] = JSON.parse(b); write(db); send(200, '{"ok":true}'); } catch (e) { send(400, JSON.stringify({ error: e.message })); } });
  }
  send(404, '{"error":"not found"}');
}).listen(PORT, () => console.log(`Bellhop CMS: http://localhost:${PORT}`));
