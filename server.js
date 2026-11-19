// Zero-dependency server: static files + JSON-file store.  Run: node server.js
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080, DB_FILE = path.join(__dirname, 'data.json');
const DIST = path.join(__dirname, 'dist'), MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' };

const room = (ten, ma, gia, nl, sl) => ({ id: ma.toLowerCase(), ten_phong_vi: ten, ma_hang_phong: ma, gia_ngay_thuong: gia, suc_chua_nguoi_lon: nl, suc_chua_tre_em: 0, so_luong_phong: sl, dang_hoat_dong: true });
const pol = ma => ({ id: ma.toLowerCase(), ten_chinh_sach_gia: ma, ma_chinh_sach_gia: ma, bua_an_bao_gom: 'Không bao gồm', kich_hoat: true });
const fm = (id, n, s, layers) => ({ id, ten_nhan_dien: n, c: 'Standard', s, d1: 0, k: 1, d2: 0, layers, active: true });
const SEED = {
  rooms: [room('Phòng 2 giường - giường đôi', 'DOUBLE', 1000000, 2, 4), room('Phòng 2 giường đơn', 'TWIN', 1000000, 2, 18), room('Phòng 3 Người', 'TRIPLE', 1200000, 3, 2), room('Phòng Vip khu A', 'VIP', 2000000, 4, 3), room('Phòng 4 người', '4NGUOI', 1500000, 2, 1)],
  policies: ['Standard', 'Standard_Agoda', 'Standard_Booking', 'Standard_Expedia', 'Standard_Trip'].map(pol),
  formulas: [fm('f1', 'Booking', 'Standard_Booking', '64,10'), fm('f2', 'Agoda', 'Standard_Agoda', '67'), fm('f3', 'Expedia', 'Standard_Expedia', '67'), fm('f4', 'Trip', 'Standard_Trip', '67')],
  dynamics: [], dynCfg: { active: true },
  channels: ['Booking.com', 'Agoda', 'Expedia', 'Traveloka', 'Ctrip / Trip.com', 'Airbnb'].map((name, i) => ({ id: 'c' + i, name, connected: false, active: true, map: {} })),
  cal: {},
  account: { ho_va_ten: 'Ngan Nguyen', gioi_tinh: 'Nữ', email: 'ngannguyen@lifrooms.com', so_dien_thoai: '0901234567' },
  hotel: { ten_khach_san: 'NHÀ SÁNG TÁC KHU VỰC MIỀN NAM', so_dien_thoai: '0254 3816276', email_lien_he: 'dothuynstvt@gmail.com', dia_chi: '153 Thuỳ Vân, P. Vũng Tàu, TP. Hồ Chí Minh',
    email_khach_san: 'lytranvt89@gmail.com', email_nhan_thong_bao_dp: 'lytranvt89@gmail.com', thoi_gian_tra_phong: '12:00', tong_so_tang: '5' }
};

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
