/* Bellhop Extranet CMS — vanilla JS + Tailwind. Data lives in server's data.json via PUT /api/<key>. */
let DB = {};
const S = {
  tab: {}, modal: null, edit: null,
  set(k, v) { stash(); this.tab[k] = v; render(); },
  get(k, d) { return this.tab[k] ?? d; },
  open(m, id = null) { this.modal = m; this.edit = id; render(); }
};

/* ---------- data layer ---------- */
const save = k => fetch('/api/' + k, { method: 'PUT', body: JSON.stringify(DB[k]) }).then(r => { if (!r.ok) throw 0; }).catch(() => toast('Lưu thất bại — kiểm tra server', true));
const uid = () => Math.random().toString(36).slice(2, 9);
const byId = (c, id) => DB[c].find(x => x.id === id);
const num = v => (v === '' || v == null || isNaN(+v)) ? null : +v;
const money = n => Math.round(n).toLocaleString('vi-VN');
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return ymd(d); };
const wd = s => (new Date(s + 'T00:00').getDay() + 6) % 7; // Mon=0
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const day = (r, d) => ((DB.cal[r] ||= {})[d] ||= { p: {}, s: {}, l: {} });
const stdPolicy = () => DB.policies.find(p => p.ma_chinh_sach_gia === 'Standard');
function basePrice(room, d) { const c = DB.cal[room.id]?.[d]; return c?.p?.[stdPolicy()?.id] ?? num(room.gia_ngay_thuong) ?? 0; }
function smartPrice(f, room, d) { // S = ((C + d1) * k + d2) / Π(1 - layer%)
  const den = String(f.layers || '').split(',').filter(x => x.trim()).reduce((a, l) => a * (1 - l / 100), 1);
  return (((basePrice(room, d) + (+f.d1 || 0)) * (+f.k || 1)) + (+f.d2 || 0)) / (den || 1);
}
function eachDay(from, to, fn) { if (!from || !to || to < from) return toast('Khoảng ngày không hợp lệ', true); for (let d = from, i = 0; d <= to && i < 800; d = addDays(d, 1), i++) fn(d, wd(d)); return true; }

/* ---------- ui helpers ---------- */
const ic = (n, c = 'w-4 h-4') => `<i data-lucide="${n}" class="${c}"></i>`;
const slug = s => s.replace(/<[^>]*>/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const btn = (t, cls = 'bg-ink text-white', extra = '') =>
  `<button ${/type=/.test(extra) ? '' : 'type="button"'} ${extra} class="${cls} rounded-lg px-4 py-2.5 font-semibold text-sm hover:opacity-90 whitespace-nowrap">${t}</button>`;
const ghost = (t, extra = '') => btn(t, 'bg-white border border-slate-200 text-slate-700', extra);
const title = (t, sub, right = '') => `<div class="flex justify-between items-start mb-6"><div><h1 class="font-serif text-3xl font-bold text-ink">${t}</h1><p class="text-slate-500 mt-1">${sub}</p></div>${right}</div>`;
const card = (inner, cls = '') => `<div class="bg-white border border-slate-200 rounded-xl ${cls}">${inner}</div>`;
const h2 = t => `<h3 class="font-serif font-bold text-ink text-base mb-3">${t}</h3>`;
const nm = (l, k) => `name="${k || slug(l)}"${/\*/.test(l) ? ' required' : ''}`;
const inp = (l, ph = '', v = '', type = 'text', cls = '', k) =>
  `<label class="block ${cls}"><span class="lbl">${l}</span><input type="${type}" ${nm(l, k)} class="field" placeholder="${ph}" value="${v}"></label>`;
const sel = (l, opts, cls = '', k) =>
  `<label class="block ${cls}">${l ? `<span class="lbl">${l}</span>` : ''}<select ${nm(l, k)} class="field pr-9">${opts.map(o => Array.isArray(o) ? `<option value="${o[0]}">${o[1]}</option>` : `<option>${o}</option>`).join('')}</select></label>`;
const area = (l, ph = '', rows = 3, k) => `<label class="block"><span class="lbl">${l}</span><textarea rows="${rows}" ${nm(l, k)} class="field" placeholder="${ph}"></textarea></label>`;
const toggle = (on = false, label = '', k, extra = '') => `<label class="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" ${k || label ? `name="${k || slug(label)}"` : ''} ${extra} ${on ? 'checked' : ''} class="peer sr-only"><span class="w-11 h-6 rounded-full bg-slate-300 peer-checked:bg-ink relative transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:after:translate-x-5"></span>${label}</label>`;
const chk = (l, on = false, k) => `<label class="inline-flex items-center gap-2"><input type="checkbox" name="${k || slug(l)}" ${on ? 'checked' : ''} class="rounded">${l}</label>`;
const radio = (name, l, on = false) => `<label class="inline-flex items-center gap-2"><input type="radio" name="${name}" value="${l}" ${on ? 'checked' : ''}>${l}</label>`;
const tabs = (key, items, def) => { const cur = S.get(key, def);
  return `<div class="inline-flex bg-slate-100 rounded-xl p-1 mb-5">${items.map(([id, t]) => `<button type="button" onclick="S.set('${key}','${id}')" class="px-4 py-2 rounded-lg ${cur === id ? 'bg-white text-ink font-semibold shadow-sm' : 'text-slate-500'}">${t}</button>`).join('')}</div>`; };
const badge = (t, c = 'green') => `<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-${c}-50 text-${c}-700 border border-${c}-200">${t}</span>`;
const table = (head, rows) => `<table class="w-full text-left"><thead><tr class="text-xs uppercase text-slate-500 border-b border-slate-200">${head.map(h => `<th class="px-4 py-3 font-semibold">${h}</th>`).join('')}</tr></thead>
  <tbody class="divide-y divide-slate-100">${rows.length ? rows.map(r => `<tr class="hover:bg-slate-50" data-s="${String(r.s ?? '').toLowerCase()}">${r.c.map(c => `<td class="px-4 py-3.5">${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${head.length}" class="text-center text-slate-400 py-12">Chưa có dữ liệu</td></tr>`}</tbody></table>`;
const row = (s, ...c) => ({ s, c });
const pager = (n, label) => `<div class="flex justify-between items-center mt-4 text-slate-500"><div class="flex items-center gap-2">${label} <select class="field !w-20 !py-1.5"><option>10</option></select></div><span>${n}</span><div class="flex gap-1">${ghost(ic('chevron-left'))}${ghost(ic('chevron-right'))}</div></div>`;
const footer = ok => `<div class="fixed bottom-0 left-[280px] right-0 bg-white border-t border-slate-200 px-8 py-3 flex justify-end gap-2 z-30">${ghost('Huỷ', 'onclick="history.back()"')}${btn(ok, 'bg-ink text-white', 'type="submit"')}</div><div class="h-16"></div>`;
const back = (t, href) => `<a href="${href}" class="inline-flex items-center gap-1 text-slate-700 mb-3">${ic('arrow-left')} ${t}</a>`;
const search = ph => `<div class="relative w-80"><input class="field pl-10" placeholder="${ph}" oninput="flt(this.value)">${ic('search', 'w-4 h-4 absolute left-3 top-3.5 text-slate-400')}</div>`;
const form = (attrs, inner) => `<form ${attrs} data-fill onsubmit="return submitForm(event)">${inner}</form>`;
const actions = (c, id, edit) => `<div class="flex gap-3 items-center text-slate-500"><button type="button" onclick="${edit}" title="Sửa">${ic('pencil')}</button><button type="button" onclick="del('${c}','${id}')" title="Xoá" class="text-red-500">${ic('trash-2')}</button></div>`;

function toast(t, err) { const e = document.createElement('div'); e.textContent = t;
  e.className = `fixed top-5 right-5 z-[60] px-4 py-3 rounded-lg shadow-lg text-white ${err ? 'bg-red-600' : 'bg-emerald-600'}`; document.body.append(e); setTimeout(() => e.remove(), 2200); }
const flt = q => document.querySelectorAll('tr[data-s]').forEach(r => r.hidden = !r.dataset.s.includes(q.toLowerCase()));

/* ---------- form <-> object ---------- */
function collect(f) { const o = {};
  f.querySelectorAll('[name]').forEach(e => { const k = e.name;
    if (e.type === 'checkbox') o[k] = e.checked; else if (e.type === 'radio') { if (e.checked) o[k] = e.value; }
    else o[k] = e.value; }); return o; }
function fill(f, d) { f.querySelectorAll('[name]').forEach(e => { if (!(e.name in d)) return; const v = d[e.name];
  if (e.type === 'checkbox') e.checked = !!v; else if (e.type === 'radio') e.checked = e.value === v; else e.value = v; }); }
function stash() { const f = document.querySelector('form[data-obj]'); if (f) Object.assign(DB[f.dataset.obj], collect(f)); }
async function submitForm(e) { e.preventDefault(); const f = e.target, v = collect(f), { obj, coll, id, back: to, modal } = f.dataset;
  if (obj) { Object.assign(DB[obj], v); await save(obj); return toast('Đã lưu thay đổi'), false; }
  if (id) Object.assign(byId(coll, id), v); else DB[coll].push({ id: uid(), ...v });
  await save(coll); toast(id ? 'Đã cập nhật' : 'Đã tạo mới');
  if (modal) { S.modal = S.edit = null; render(); } else location.hash = '#/' + to; return false; }
async function del(c, id) { if (!confirm('Xoá mục này?')) return; DB[c] = DB[c].filter(x => x.id !== id); await save(c); render(); }
async function tgl(c, id, k, v) { byId(c, id)[k] = v; await save(c); }

/* ---------- sidebar ---------- */
const NAV = [
  ['Lịch phòng', 'calendar-days', [['Bán phòng', '#/sales'], ['Cập nhật hàng loạt', '#/bulk']]],
  ['Đặt phòng', 'inbox', '#/booking'], ['Đồng bộ CMS', 'link', '#/sync'],
  ['Quản lý doanh thu', 'trending-up', [['Giá thông minh', '#/smart'], ['Định giá linh động', '#/dynamic']]],
  ['Cấu hình', 'settings', [['Thông tin tài khoản', '#/account'], ['Thông tin khách sạn', '#/hotel'], ['Cấu hình Phòng & Giá', '#/rooms'], ['Chính sách giá', '#/policies']]]
];
function nav(h) { const act = s => h === s || h.startsWith(s + '/'), a = DB.account || {};
  const ini = (a.ho_va_ten || 'NN').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  return `<div class="px-6 py-5 text-white text-2xl font-bold flex items-center gap-2">${ic('bell-ring', 'w-6 h-6')} bellhop</div>
  <div class="px-5 mt-2 text-[11px] tracking-widest text-slate-400">KHÁCH SẠN</div>
  <div class="mx-4 mt-2 mb-5 border border-white/20 rounded-lg px-4 py-2.5 text-white font-semibold flex justify-between gap-2"><span class="truncate">${DB.hotel?.ten_khach_san || '—'}</span>${ic('chevron-down')}</div>
  <div class="px-5 mb-2 text-[11px] tracking-widest text-slate-400">BELLHOP EXTRANET</div>
  <nav class="px-3 flex-1 space-y-1">${NAV.map(([t, i, x]) => { const kids = Array.isArray(x), on = kids ? x.some(k => act(k[1].slice(1))) : act(x.slice(1));
    return `<a href="${kids ? x[0][1] : x}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg ${on ? 'bg-navy-700 text-white' : 'hover:bg-navy-800'}">${ic(i, 'w-5 h-5')}<span class="flex-1">${t}</span>${kids ? ic(on ? 'chevron-down' : 'chevron-right') : ''}</a>
    ${kids && on ? `<div class="ml-6 border-l border-white/10 pl-3 space-y-0.5">${x.map(([n, hr]) => `<a href="${hr}" class="block px-3 py-2 rounded-lg ${act(hr.slice(1)) ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}">${n}</a>`).join('')}</div>` : ''}`; }).join('')}</nav>
  <div class="p-4 border-t border-white/10 flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-ink text-white grid place-items-center text-xs font-bold">${ini}</div>
  <div class="flex-1 leading-tight"><div class="text-white font-semibold">${a.ho_va_ten || ''}</div><div class="text-xs text-slate-400">Chủ khách sạn</div></div></div>`; }

/* ---------- pages ---------- */
const P = {};
const roomOpts = () => DB.rooms.map(r => [r.id, r.ten_phong_vi]);
const polOpts = () => DB.policies.map(p => [p.id, p.ten_chinh_sach_gia]);

/* Bán phòng: grid reads calendar; edits are batched until "Lưu thay đổi" */
P.sales = () => {
  const start = S.get('start', ymd(new Date())), days = Array.from({ length: 14 }, (_, i) => addDays(start, i)), rf = S.get('room', 'all'), today = ymd(new Date());
  const rooms = DB.rooms.filter(r => rf === 'all' || r.id === rf), fs = DB.formulas.filter(f => f.active), std = stdPolicy();
  const cellI = (key, v, cls = '') => `<input data-cell="${key}" data-o="${v}" type="number" value="${v}" class="w-24 text-center rounded border border-transparent hover:border-slate-300 focus:border-brand text-xs py-1 ${cls}">`;
  const body = rooms.map(r => {
    const rows = [`<tr class="border-t"><td class="px-4 py-3 sticky left-0 bg-white"><b class="text-brand">${r.ten_phong_vi}</b><div class="text-xs text-slate-500">${r.so_luong_phong} phòng</div></td>
      ${days.map(d => { const a = day(r.id, d).a ?? r.so_luong_phong; return `<td class="text-center">${cellI(`${r.id}|${d}|a`, a, a == 0 ? 'text-red-600 font-bold' : '')}</td>`; }).join('')}</tr>`,
      `<tr class="border-t border-slate-100"><td class="px-4 py-2 pl-8 sticky left-0 bg-white text-xs"><b class="font-medium">Standard</b> <span class="text-slate-400">· giá gốc</span></td>${days.map(d => `<td class="text-center">${cellI(`${r.id}|${d}|p|${std?.id}`, basePrice(r, d))}</td>`).join('')}</tr>`];
    fs.forEach(f => rows.push(`<tr class="border-t border-slate-100"><td class="px-4 py-2 pl-8 sticky left-0 bg-white text-xs"><b class="font-medium">${f.ten_nhan_dien}</b> <span class="text-slate-400">· ${f.s}</span> <span class="text-amber-600 font-bold">S</span></td>
      ${days.map(d => `<td class="text-center text-xs text-orange-600">${money(smartPrice(f, r, d))}</td>`).join('')}</tr>
      <tr class="border-t border-slate-100"><td class="px-4 py-1.5 pl-12 text-slate-500 text-xs sticky left-0 bg-white">└ Ngừng bán (✓ = mở)</td>
      ${days.map(d => { const open = !day(r.id, d).s[f.id]; return `<td class="text-center"><input type="checkbox" data-cell="${r.id}|${d}|s|${f.id}" data-o="${+open}" ${open ? 'checked' : ''} class="rounded text-emerald-600"></td>`; }).join('')}</tr>`));
    return rows.join(''); }).join('');
  return title('Bán phòng', 'Quản lý phòng trống và giá bán trên các kênh phân phối', btn('Cập nhật hàng loạt', 'bg-ink text-white', `onclick="location.hash='#/bulk'"`)) +
  `<div class="grid grid-cols-2 gap-5 mb-5 max-w-3xl"><label class="block"><span class="lbl">Loại phòng</span><select class="field" onchange="S.set('room',this.value)"><option value="all">Tất cả ${DB.rooms.length}</option>${roomOpts().map(([v, t]) => `<option value="${v}" ${v === rf ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
  <div class="flex items-center gap-3 mb-4">${ghost(ic('chevron-left'), `onclick="S.set('start',addDays('${start}',-14))"`)}<div class="field !w-56 !py-2.5">${start.split('-').reverse().join('/')} → ${days[13].split('-').reverse().join('/')}</div>${ghost(ic('chevron-right'), `onclick="S.set('start',addDays('${start}',14))"`)}
    <button class="font-medium" onclick="S.set('start','${today}')">Hôm nay</button><span class="text-slate-400">14 ngày</span><div class="flex-1"></div>${ghost('Hoàn tác', 'onclick="render()"')}${btn('Lưu thay đổi', 'bg-ink text-white', 'onclick="saveSales()"')}</div>
  ${card(`<div class="overflow-x-auto"><table class="w-full min-w-[1500px]"><thead><tr class="text-xs text-slate-500"><th class="px-4 py-3 text-left w-72 sticky left-0 bg-white">LOẠI PHÒNG / CHỈ SỐ</th>
    ${days.map(d => `<th class="py-2 font-medium ${d === today ? 'bg-sky-50' : ''}">${DAYS[wd(d)]}<div class="text-sm text-ink">${+d.slice(8)}</div></th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="flex flex-wrap gap-x-5 p-4 text-xs text-slate-500 border-t"><span>Hàng "S": giá thông minh tính tự động từ Giá thông minh</span><span>Ô đỏ: hết phòng</span><span>Sửa ô rồi bấm "Lưu thay đổi"</span></div>`)}`;
};
async function saveSales() { let n = 0;
  document.querySelectorAll('[data-cell]').forEach(e => { const cur = e.type === 'checkbox' ? +e.checked : e.value; if (String(cur) === e.dataset.o) return;
    const [r, d, k, x] = e.dataset.cell.split('|'), c = day(r, d); n++;
    if (k === 'a') c.a = num(cur); else if (k === 'p') c.p[x] = num(cur); else if (k === 's') { if (cur) delete c.s[x]; else c.s[x] = true; } });
  if (n) { await save('cal'); toast(`Đã lưu ${n} thay đổi`); } else toast('Không có thay đổi'); render(); }

/* Cập nhật hàng loạt: apply (from,to,weekday values) onto the calendar */
const rangeRow = () => `<div class="rr flex gap-2 items-center px-4 py-2 border-t"><input type="date" class="f field !w-40 !py-1.5"><input type="date" class="t field !w-40 !py-1.5">${DAYS.map((d, i) => `<input class="v field !py-1.5 text-right !w-24" placeholder="${d}" type="number">`).join('')}<button type="button" onclick="this.parentElement.remove()" class="text-red-500">${ic('x')}</button></div>`;
const rangeBox = () => `<div class="p-2 text-xs text-slate-500 flex gap-2 px-4"><span class="w-40">Từ ngày</span><span class="w-40">Đến ngày</span>${DAYS.map(d => `<span class="w-24 text-center">${d}</span>`).join('')}</div><div id="rr">${rangeRow()}</div><div class="p-4"><button type="button" class="border rounded-full px-3 py-1 text-xs" onclick="document.getElementById('rr').insertAdjacentHTML('beforeend',rangeRow());lucide.createIcons()">+ Thêm khoảng ngày</button></div>`;
function applyRows(fn) { let n = 0;
  document.querySelectorAll('#rr .rr').forEach(r => { const v = [...r.querySelectorAll('.v')].map(i => num(i.value)); if (v.every(x => x === null)) return;
    eachDay(r.querySelector('.f').value, r.querySelector('.t').value, (d, w) => { if (v[w] !== null) { fn(d, v[w]); n++; } }); });
  return n; }
async function bulkApply(kind) { const rid = document.querySelector('[name=room]').value, pid = document.querySelector('[name=policy]')?.value; let n = 0;
  if (kind === 'avail') n = applyRows((d, v) => day(rid, d).a = v);
  else if (kind === 'price') n = applyRows((d, v) => day(rid, d).p[pid] = v);
  else if (kind === 'pricedow') { const v = [...document.querySelectorAll('.pv')].map(i => num(i.value));
    eachDay(document.querySelector('[name=from]').value, document.querySelector('[name=to]').value, (d, w) => { if (v[w] !== null) { day(rid, d).p[pid] = v[w]; n++; } }); }
  else if (kind === 'limit') { const lim = {}; document.querySelectorAll('[data-lk]').forEach(i => (lim[i.dataset.lk] ||= [])[+i.dataset.wd] = i.type === 'checkbox' ? i.checked : num(i.value));
    eachDay(document.querySelector('[name=from]').value, document.querySelector('[name=to]').value, (d, w) => { const l = day(rid, d).l; for (const k in lim) l[k] = lim[k][w]; n++; }); }
  if (!n) return toast('Chưa nhập giá trị / khoảng ngày', true);
  await save('cal'); toast(`Đã cập nhật ${n} ngày`); }
P.bulk = () => {
  const t = S.get('bulk', 'avail'), start = S.get('start', ymd(new Date())), days = Array.from({ length: 9 }, (_, i) => addDays(start, i)), today = ymd(new Date());
  const rsel = sel('Loại phòng', roomOpts(), '', 'room'), psel = sel('Chính sách giá', polOpts(), '', 'policy');
  const dates = `<div class="flex gap-2 items-end">${inp('Khoảng ngày áp dụng', '', today, 'date', 'w-44', 'from')}${inp('&nbsp;', '', addDays(today, 365), 'date', 'w-44', 'to')}</div>`;
  const upd = k => `<div class="p-4 text-right">${btn('Cập nhật', 'bg-ink text-white', `onclick="bulkApply('${k}')"`)}</div>`;
  const body = {
    avail: card(`<div class="p-5"><div class="overflow-x-auto"><table class="w-full text-center"><tr class="text-xs text-slate-500"><td></td>${days.map(d => `<td class="py-2 ${wd(d) > 4 ? 'text-rose-500' : ''}">${DAYS[wd(d)]}<div class="text-base font-bold text-ink">${+d.slice(8)}</div>Th ${+d.slice(5, 7)}</td>`).join('')}</tr>
      ${DB.rooms.map(r => `<tr class="border-t"><td class="text-left py-2 pr-3">${r.ten_phong_vi} <span class="text-slate-400">(${r.ma_hang_phong})</span></td>${days.map(d => { const a = day(r.id, d).a ?? r.so_luong_phong; return `<td><span class="bg-slate-100 rounded px-2 ${a == 0 ? 'text-red-600' : ''}">${a}</span></td>`; }).join('')}</tr>`).join('')}</table></div></div>`) +
      `<div class="my-5 w-72">${rsel}</div>` + card(`<div class="p-4 font-serif font-bold border-b">Số phòng trống theo thứ</div>${rangeBox()}${upd('avail')}`),
    price: tabs('bulkp', [['dow', 'Giá theo thứ'], ['day', 'Giá ngày']], 'dow') + `<div class="grid grid-cols-3 gap-4 mb-5">${rsel}${psel}</div>` + (S.get('bulkp', 'dow') === 'dow' ?
      card(`<div class="p-4">${dates}</div><div class="px-4 pb-4 flex gap-2">${DAYS.map(d => `<label class="block"><span class="lbl">${d}</span><input type="number" class="pv field !w-28 text-right" placeholder="—"></label>`).join('')}</div>${upd('pricedow')}`) :
      card(`<div class="p-4 font-serif font-bold border-b">Giá theo khoảng ngày</div>${rangeBox()}${upd('price')}`)),
    limit: `<div class="grid grid-cols-3 gap-4 mb-5">${rsel}${dates}</div>` + card(`<div class="p-4"><table class="w-full"><tr class="text-slate-500 text-xs"><td></td>${DAYS.map(d => `<td class="text-center">${d}</td>`).join('')}</tr>
      ${[['stop', 'Ngừng bán', 1], ['cta', 'CTA (Đóng nhận khách)', 1], ['ctd', 'CTD (Đóng trả phòng)', 1], ['maxav', 'Max Availability'], ['maxstay', 'Max Stay'], ['minarr', 'Min Stay Arrival'], ['minthr', 'Min Stay Through'], ['maxadv', 'Max ngày đến']].map(([k, l, c]) =>
      `<tr class="border-t"><td class="py-2 w-48">${l}</td>${DAYS.map((_, i) => `<td class="px-1 text-center">${c ? `<input type="checkbox" class="rounded" data-lk="${k}" data-wd="${i}">` : `<input type="number" class="field !py-1.5 text-right" placeholder="—" data-lk="${k}" data-wd="${i}">`}</td>`).join('')}</tr>`).join('')}</table></div>${upd('limit')}`)
  };
  return title('Cập nhật hàng loạt', 'Cập nhật phòng trống, giá và hạn chế (bao gồm Max Availability) cùng lúc') + tabs('bulk', [['avail', 'Phòng trống'], ['price', 'Giá'], ['limit', 'Hạn chế']], 'avail') + body[t];
};

/* Đồng bộ CMS */
async function chSave(id, fn) { fn(byId('channels', id)); await save('channels'); render(); }
P.sync = () => {
  const t = S.get('sync', 'bh'), cid = S.get('ch', DB.channels[0].id), ch = byId('channels', cid);
  const pairs = DB.policies.flatMap(p => DB.rooms.map(r => [r, p]));
  const list = card(DB.channels.map(c => `<button type="button" onclick="S.set('ch','${c.id}')" class="w-full text-left flex gap-3 px-4 py-3 border-b last:border-0 ${c.id === cid ? 'bg-slate-50' : ''}">${ic('bell', 'w-4 h-4 mt-1 text-slate-400')}<div><b class="font-medium">${c.name}</b><div class="text-xs ${c.connected ? 'text-emerald-600' : 'text-slate-500'}">${c.connected ? 'Đã kết nối' : 'Chưa kết nối'}</div></div></button>`).join(''), 'w-72 shrink-0 self-start');
  const right = t === 'bh' ? `<div class="flex-1 space-y-4">${card(`<div class="p-4 flex items-center justify-between"><div class="flex items-center gap-3 font-semibold">${ch.name} ${toggle(ch.active, '', '', `onchange="chSave('${cid}',c=>c.active=this.checked)"`)}</div>
      <div class="flex gap-2 items-center">${btn(ch.connected ? 'Ngắt kết nối' : 'Kết nối', 'bg-ink text-white', `onclick="chSave('${cid}',c=>c.connected=!c.connected)"`)}<span class="border rounded-full px-3 py-1.5 text-xs">${ch.connected ? 'Đã kết nối' : 'Chưa kết nối'}</span></div></div>`)}
      ${card(`<div class="p-4 font-semibold border-b">Ánh xạ loại phòng & chính sách giá</div>${table(['Loại phòng', 'Chính sách giá', 'Trạng thái'], pairs.map(([r, p]) => { const k = r.id + '|' + p.id, on = ch.map[k] !== false;
        return row(r.ten_phong_vi, r.ten_phong_vi, p.ten_chinh_sach_gia, `<div class="flex items-center gap-3">${toggle(on, '', '', `onchange="chSave('${cid}',c=>c.map['${k}']=this.checked)"`)}<span class="text-xs text-slate-500">${on ? 'Đang liên kết OTA' : 'Không liên kết'}</span></div>`); }))}`)}</div>` :
    card(`<div class="p-4 border-b font-serif font-bold">Ánh xạ loại phòng & chính sách giá <span class="font-sans font-normal text-slate-500 text-xs ml-2">${ch.name}</span></div>
      ${table(['Loại phòng (Bellhop)', 'Chính sách giá (Bellhop)', 'Mã CMS', 'Trạng thái'], pairs.map(([r, p]) => row(r.ten_phong_vi, r.ten_phong_vi, p.ten_chinh_sach_gia, `<span class="font-mono text-xs text-slate-400">${r.ma_hang_phong}/${p.ma_chinh_sach_gia}</span>`, ch.map[r.id + '|' + p.id] !== false && ch.connected ? `<span class="bg-ink text-white rounded-full px-3 py-0.5 text-xs">Đã kết nối</span>` : `<span class="text-slate-400 text-xs">Chưa kết nối</span>`)))}`, 'flex-1');
  return title('Đồng bộ CMS — Kênh bán', `Cấu hình và liên kết kênh OTA thông qua CMS. <b class="text-ink">${DB.channels.filter(c => c.active).length} kênh đang hoạt động</b>`) + tabs('sync', [['bh', 'Ánh xạ Bellhop'], ['x', 'Ánh xạ']], 'sync' && 'bh') + `<div class="flex gap-5">${list}${right}</div>`;
};

/* Giá thông minh */
P.smart = () => {
  const e = S.edit && byId('formulas', S.edit), names = DB.policies.map(p => p.ten_chinh_sach_gia);
  return title('Giá thông minh', 'Cấu hình công thức BAR đẩy lên OTA: Booking.com, Agoda, Expedia…', btn('+ Thêm công thức', 'bg-ink text-white', `onclick="S.open('smart')"`)) +
    card(table(['STT', 'Tên / Nhãn', 'Gói cơ sở (C) → Gói thông minh (S)', 'Công thức', 'Trạng thái', 'Thao tác'], DB.formulas.map((f, i) =>
      row(f.ten_nhan_dien, i + 1, f.ten_nhan_dien, `${f.c} → ${f.s}`, `<code class="text-xs">((C${+f.d1 ? '+' + f.d1 : ''})×${f.k}${+f.d2 ? '+' + f.d2 : ''}) / ${String(f.layers).split(',').filter(Boolean).map(l => `(1-${l}%)`).join('×') || '1'}</code>`,
        toggle(f.active, '', '', `onchange="tgl('formulas','${f.id}','active',this.checked)"`), actions('formulas', f.id, `S.open('smart','${f.id}')`))))) +
    pager(`${DB.formulas.length} công thức · Trang 1/1`, 'Số công thức mỗi trang') +
    (S.modal === 'smart' ? `<div class="fixed inset-0 bg-black/60 z-40" onclick="S.open(null)"></div>
    ${form(`class="fixed right-0 top-0 bottom-0 w-[1000px] max-w-[85vw] bg-white z-50 flex flex-col" data-coll="formulas" data-id="${e?.id || ''}" data-modal="1"`,
    `<div class="flex justify-between items-center px-6 py-4 border-b"><h2 class="font-serif text-xl font-bold">Thiết lập công thức giá thông minh</h2><button type="button" onclick="S.open(null)" class="border rounded-lg p-1.5">${ic('x')}</button></div>
    <div class="p-6 space-y-4 flex-1 overflow-y-auto">${inp('Tên nhận diện *', 'VD: Booking.com +15%')}
    <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center"><div class="bg-slate-50 border rounded-xl p-4"><b>C · Chính sách giá cơ sở</b><div class="text-xs text-slate-500 mb-3">Giá gốc để tính</div>${sel('Chính sách giá', names, '', 'c')}</div>${ic('arrow-right')}
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4"><b class="text-amber-800">S · Chính sách giá thông minh</b><div class="text-xs text-amber-700 mb-3">Giá tính ra · bắt buộc</div>${sel('Chính sách giá *', names, '', 's')}</div></div>
    ${card(`<div class="p-4"><div class="font-semibold mb-3">S = ((C ± Δ1) × hệ số ± Δ2) / Π(1 − lớp phí%)</div><div class="grid grid-cols-3 gap-4">${inp('Δ1 (VND trước nhân)', '', '0', 'number', '', 'd1')}${inp('Hệ số nhân', '', '1', 'number', '', 'k').replace('<input', '<input step="any"')}${inp('Δ2 (VND sau nhân)', '', '0', 'number', '', 'd2')}</div>
      <div class="mt-4">${inp('Lớp phí mẫu số (%, cách nhau dấu phẩy — VD: 15,10)', '64,10', '', 'text', '', 'layers')}</div></div>`)}${chk('Kích hoạt công thức này', true, 'active')}</div>
    <div class="px-6 py-4 border-t flex justify-end gap-2">${ghost('Huỷ', 'onclick="S.open(null)"')}${btn(e ? 'Lưu công thức' : 'Tạo công thức', 'bg-ink text-white', 'type="submit"')}</div>`)}` : '');
};

/* Định giá linh động */
P.dynamic = () => { const t = S.get('dyn', 'cfg'), q = S.get('dq', 'all');
  const list = DB.dynamics.filter(d => q === 'all' || (q === 'on') === !!d.kich_hoat);
  return title('Định giá linh động', 'Tự động điều chỉnh giá bán theo công suất phòng, thời điểm đặt và ngày trong tuần.') + tabs('dyn', [['cfg', 'Cấu hình'], ['list', 'Giá linh động']], 'cfg') +
    (t === 'cfg' ? card(`<div class="p-6"><h3 class="font-serif font-bold mb-1">Phương thức thay đổi giá linh hoạt</h3><p class="text-slate-500 mb-3">Hệ thống tự động điều chỉnh giá phòng dựa trên số lượng phòng còn trống và thời điểm khách đặt phòng để tối ưu doanh thu.</p>
      <ul class="list-disc ml-5 space-y-1 mb-4"><li>Nhiều phòng trống → Có thể giảm giá để thu hút đặt phòng.</li><li>Ít phòng trống → Tăng giá để tối đa doanh thu.</li><li>Đặt sát ngày hoặc đặt sớm → Áp dụng mức giá theo quy tắc đã thiết lập.</li></ul>
      <div class="border-t pt-4 flex justify-between"><span>Đang hoạt động</span>${toggle(DB.dynCfg.active, '', '', `onchange="DB.dynCfg.active=this.checked;save('dynCfg')"`)}</div></div>`) :
    `<div class="flex items-center gap-3 mb-4">${search('Tìm theo tên mẫu giá...')}<div class="flex-1"></div><div class="inline-flex bg-white border rounded-xl p-1">${[['all', 'Tất cả'], ['on', 'Đang hoạt động'], ['off', 'Ngừng hoạt động']].map(([k, x]) => `<button type="button" onclick="S.set('dq','${k}')" class="px-4 py-1.5 rounded-lg ${q === k ? 'bg-ink text-white' : ''}">${x}</button>`).join('')}</div>
      ${btn('+ Thêm mới mẫu giá linh động', 'bg-ink text-white', `onclick="location.hash='#/dynamic/new'"`)}</div>
      ${card(table(['Tên mẫu', 'Gói giá (D)', 'Tiêu chí', 'Ngày áp dụng', 'Trạng thái', 'Thao tác'], list.map(d => row(d.ten_mau_gia_linh_dong, `<b>${d.ten_mau_gia_linh_dong}</b>`, d.goi || '—', d.tc || '—', `${d.from || ''} → ${d.to || ''}`,
        toggle(d.kich_hoat, '', '', `onchange="tgl('dynamics','${d.id}','kich_hoat',this.checked)"`), actions('dynamics', d.id, `location.hash='#/dynamic/edit/${d.id}'`)))))}`); };
P['dynamic/new'] = id => back('Quay lại', '#/dynamic') + title(id ? 'Sửa mẫu giá linh động' : 'Thêm mới mẫu giá linh động', 'Chọn gói giá và thiết lập quy tắc tự động điều chỉnh giá.') +
  form(`data-coll="dynamics" data-id="${id || ''}" data-back="dynamic"`, `<div class="space-y-4">${card(`<div class="p-5">${h2('Chọn gói giá linh động (D)')}${sel('', DB.policies.map(p => p.ten_chinh_sach_gia), 'w-96', 'goi')}</div>`)}
  ${card(`<div class="p-5 space-y-3">${h2('Thông tin mẫu giá')}${inp('Tên mẫu giá linh động *', 'Vd. Giá linh động cuối tuần')}${area('Mô tả', '', 4, 'mo_ta')}${toggle(true, 'Kích hoạt', 'kich_hoat')}</div>`)}
  ${card(`<div class="p-5">${h2('Công thức tính giá')}<div class="flex gap-8 items-center"><b class="font-medium">Tiêu chí</b>${radio('tc', 'Số lượng phòng trống', 1)}${radio('tc', 'Theo booking window')}<b class="font-medium ml-6">Đối tượng áp dụng</b>${radio('dt', 'Từng hạng phòng', 1)}${radio('dt', 'Toàn bộ khách sạn')}</div></div>`)}
  ${card(`<div class="p-5">${h2('Ngày áp dụng *')}<div class="flex items-center gap-2">${inp('', '', ymd(new Date()), 'date', '', 'from').replace('*', '')}–${inp('', '', ymd(new Date()), 'date', '', 'to')}</div></div>`)}
  ${card(`<div class="p-5">${h2('Áp dụng cho')}${sel('', roomOpts(), '', 'phong')}</div>`)}</div>` + footer(id ? 'Lưu' : 'Thêm giá linh động'));

/* Tài khoản & khách sạn (singleton forms) */
P.account = () => title('Thông tin tài khoản', 'Cập nhật thông tin cá nhân và mật khẩu') +
  `<div class="grid grid-cols-[1fr_420px] gap-6">${form('data-obj="account"', card(`<div class="p-6 grid grid-cols-2 gap-4"><div class="col-span-2">${h2('Thông tin cá nhân')}</div>${inp('Họ và tên *')}
    <div><span class="lbl">Giới tính</span><div class="flex gap-5 py-2.5">${radio('gioi_tinh', 'Nam')}${radio('gioi_tinh', 'Nữ')}</div></div>${inp('Email *', '', '', 'email')}${inp('Số điện thoại *')}
    <div class="col-span-2">${inp('Địa chỉ', 'Số nhà, đường, quận/huyện, tỉnh/thành')}</div><div class="col-span-2 text-right border-t pt-4">${btn('Lưu thay đổi', 'bg-ink text-white', 'type="submit"')}</div></div>`))}
  <div class="space-y-5">${card(`<div class="p-6">${h2('Thông tin tài khoản tóm tắt')}${[['Tên đăng nhập', DB.account.ho_va_ten], ['Email đăng nhập', DB.account.email], ['Vai trò', 'Chủ khách sạn']].map(([a, b]) => `<div class="border-b py-2"><div class="text-xs text-slate-500">${a}</div>${b || '—'}</div>`).join('')}</div>`)}</div></div>`;
P.hotel = () => { const t = S.get('hotel', 'gen'), sec = (n, i) => card(`<div class="p-6"><h3 class="font-serif font-bold uppercase text-xs tracking-wide mb-4 border-b pb-3">${n}</h3>${i}</div>`);
  const gen = `<div class="space-y-5">${card(`<div class="p-6 grid grid-cols-2 gap-x-6 gap-y-4"><div class="col-span-2">${h2('Thông tin khách sạn')}</div>
      ${inp('Tên khách sạn *')}${inp('Số điện thoại *')}${sel('Múi giờ *', ['Việt Nam (GMT+7)'])}${inp('Email liên hệ', '', '', 'email')}${inp('Website', 'https://hotel.com')}${inp('Trang đặt phòng', 'https://booking.hotel.com')}
      <div class="col-span-2">${area('Địa chỉ *', '', 3)}</div>${inp('Quận/Huyện')}${inp('Phường/Xã')}<div class="col-span-2">${area('Giới thiệu', 'Giới thiệu ngắn gọn về khách sạn, hiển thị trên các kênh OTA')}</div>
      <div class="col-span-2">${area('Thông tin quan trọng', 'Lưu ý khách cần biết trước khi đặt phòng')}</div>
      <div class="col-span-2"><span class="lbl">Tiện ích</span><div class="border rounded-lg p-4 grid grid-cols-2 gap-2">${['Lễ tân 24 giờ', 'Điều hòa không khí', 'Hồ bơi', 'Nhà hàng', 'Wifi miễn phí', 'Dịch vụ làm đẹp', 'Mặt tiền biển', 'Xe đưa đón sân bay (phụ thu)'].map(a => chk(a)).join('')}</div></div></div>`)}</div>`;
  const cfg = `<div class="space-y-5">${sec('1. Cấu hình email', `<div class="grid grid-cols-2 gap-4">${inp('Email khách sạn *', '', '', 'email')}${inp('Email nhận thông báo ĐP *', '', '', 'email')}${inp('Email CC thông báo ĐP')}${inp('Email BCC thông báo ĐP')}
      <div class="col-span-2 space-y-2">${chk('Cho phép hủy tự động booking không được xác nhận')}<br>${chk('Hủy tự động booking thanh toán thất bại')}</div></div>`)}
    ${sec('2. Ngôn ngữ', `<div class="grid grid-cols-2 gap-4">${sel('Ngôn ngữ hệ thống', ['Tiếng Việt', 'English'])}<div><span class="lbl">Ngôn ngữ email</span><div class="flex gap-5 py-2.5">${radio('ngon_ngu_email', 'Tiếng Việt', 1)}${radio('ngon_ngu_email', 'English')}</div></div></div>`)}
    ${sec('4. Quy định độ tuổi trẻ em', `<div class="grid grid-cols-2 gap-4">${sel('Độ tuổi em bé tối đa *', ['2 tuổi', '3 tuổi'])}${sel('Độ tuổi trẻ em tối đa *', ['12 tuổi', '14 tuổi'])}<div class="col-span-2">${area('Chính sách trẻ em', '', 4)}</div></div>`)}
    ${sec('5. Thông tin khác', `<div class="grid grid-cols-2 gap-4">${inp('Thời gian nhận phòng *', '', '14:00', 'time')}${inp('Thời gian trả phòng *', '', '12:00', 'time')}${inp('Năm xây dựng')}${inp('Tổng số tầng *', '', '', 'number')}${inp('Khoảng cách tới sân bay (km)')}${inp('Khoảng cách tới TT (km)')}</div>`)}</div>`;
  return title('Cấu hình khách sạn', t === 'gen' ? 'Thông tin hồ sơ, liên hệ và cài đặt vận hành khách sạn' : 'Thông số vận hành — ảnh hưởng đến giá, email thông báo, và chính sách') + tabs('hotel', [['gen', 'Thông tin chung'], ['cfg', 'Cấu hình khách sạn']], 'gen') +
    form('data-obj="hotel"', (t === 'gen' ? gen : cfg) + `<div class="text-right mt-5">${btn('Lưu thay đổi', 'bg-ink text-white', 'type="submit"')}</div>`); };

/* Phòng & Giá */
P.rooms = () => { const hide = S.get('hide', false), list = DB.rooms.filter(r => !hide || r.dang_hoat_dong);
  return title('Cấu hình Phòng & Giá', 'Danh sách các hạng phòng và cấu hình chi tiết. Mở bán và quản lý phòng trống theo ngày tại <b class="text-ink">Bán phòng</b>.', btn('+ Thêm hạng phòng', 'bg-ink text-white', `onclick="location.hash='#/rooms/new'"`)) +
  `<div class="flex justify-between items-center mb-4">${search('Tìm mã/tên hạng phòng...')}${toggle(hide, 'Ẩn hạng phòng ngừng hoạt động', '', `onchange="S.set('hide',this.checked)"`)}</div>` +
  card(table(['Hạng phòng', 'Giá thường', 'Khách', 'Số phòng', 'Trạng thái', 'Hành động'], list.map(r => row(r.ten_phong_vi + r.ma_hang_phong, `<b>${r.ten_phong_vi}</b><div class="text-xs text-slate-500">${r.ma_hang_phong}</div>`, `<b>${money(r.gia_ngay_thuong || 0)} đ</b>`,
    `${r.suc_chua_nguoi_lon || 0} NL · ${r.suc_chua_tre_em || 0} TE`, r.so_luong_phong, toggle(r.dang_hoat_dong, '', '', `onchange="tgl('rooms','${r.id}','dang_hoat_dong',this.checked)"`), actions('rooms', r.id, `location.hash='#/rooms/edit/${r.id}'`))))) + pager(`${list.length} hạng phòng · Trang 1/1`, 'Số hạng phòng mỗi trang'); };
P['rooms/new'] = id => back('Quay lại danh sách', '#/rooms') + title(id ? 'Sửa hạng phòng' : 'Thêm hạng phòng', 'Nhập thông tin hạng phòng.') +
  form(`data-coll="rooms" data-id="${id || ''}" data-back="rooms"`, card(`<div class="p-6 space-y-5">
    <div class="border rounded-xl p-5 space-y-4">${h2('Thông tin phòng')}<div class="grid grid-cols-2 gap-4">${inp('Tên phòng (VI) *', 'Phòng Deluxe Biển')}${inp('Tên phòng (EN)', 'Deluxe Sea View')}${inp('Mã hạng phòng *', 'DLX-SEA')}${sel('Hướng phòng', ['Hướng nội bộ (không view)', 'Hướng biển', 'Hướng thành phố'])}</div>${toggle(true, 'Đang hoạt động')}</div>
    <div class="border rounded-xl p-5 space-y-4">${h2('Sức chứa & giường')}<div class="grid grid-cols-2 gap-4">${inp('Tổng khách tối đa', '', '2', 'number')}${inp('Sức chứa người lớn *', '', '2', 'number')}${inp('Sức chứa trẻ em', '', '0', 'number')}${inp('Số lượng phòng *', '', '1', 'number')}${inp('Diện tích (m²)', 'Ví dụ: 28', '', 'number')}${sel('Loại giường chính', ['- Không -', 'Giường đôi', 'Giường đơn'])}</div></div>
    <div class="border rounded-xl p-5 space-y-4">${h2('Giá phòng (VND)')}<div class="grid grid-cols-3 gap-4">${inp('Giá ngày thường', '', '0', 'number')}${inp('Giá cuối tuần', '', '0', 'number')}${inp('Giá ngày lễ', '', '0', 'number')}</div></div>
    <div class="border rounded-xl p-5 space-y-4">${h2('Mô tả')}${area('Mô tả', 'Phòng rộng rãi với view biển tuyệt đẹp...', 5)}</div></div>`)) + footer(id ? 'Lưu hạng phòng' : 'Tạo hạng phòng');

/* Chính sách giá */
P.policies = () => { const q = S.get('pq', 'all'), list = DB.policies.filter(p => q === 'all' || (q === 'on') === !!p.kich_hoat);
  return title('Chính sách giá', 'Định nghĩa chính sách giá theo bữa ăn, thời gian áp dụng, đại lý và phân khúc thị trường; gắn cho từng hạng phòng.') +
  `<div class="flex items-center gap-3 mb-4">${search('Tìm mã/tên chính sách...')}<div class="inline-flex bg-white border rounded-xl p-1">${[['all', 'Tất cả'], ['on', 'Đang hoạt động'], ['off', 'Ngưng hoạt động']].map(([k, x]) => `<button type="button" onclick="S.set('pq','${k}')" class="px-4 py-1.5 rounded-lg ${q === k ? 'bg-ink text-white' : ''}">${x}</button>`).join('')}</div><div class="flex-1"></div>
  ${btn('+ Thêm mới chính sách giá', 'bg-ink text-white', `onclick="location.hash='#/policies/new'"`)}</div>` +
  card(table(['STT', 'Mã chính sách giá', 'Tên chính sách giá', 'Bữa ăn', 'Thời gian áp dụng', 'Trạng thái', 'Thao tác'], list.map((p, i) => row(p.ma_chinh_sach_gia + p.ten_chinh_sach_gia, i + 1, `<code class="text-xs">${p.ma_chinh_sach_gia}</code>`, `<b>${p.ten_chinh_sach_gia}</b>`, p.bua_an_bao_gom || '—', p.t || 'Luôn luôn',
    toggle(p.kich_hoat, '', '', `onchange="tgl('policies','${p.id}','kich_hoat',this.checked)"`), actions('policies', p.id, `location.hash='#/policies/edit/${p.id}'`))))) + pager(`${list.length} chính sách · Trang 1/1`, 'Số chính sách giá mỗi trang'); };
P['policies/new'] = id => `<div class="flex items-center gap-3 mb-5">${ghost(ic('arrow-left') + ' Quay lại', 'onclick="history.back()"')}<h1 class="font-serif text-3xl font-bold text-ink">${id ? 'Sửa' : 'Thêm mới'} chính sách giá</h1></div>` +
  form(`data-coll="policies" data-id="${id || ''}" data-back="policies"`, `<div class="space-y-5">${card(`<div class="p-6 space-y-4">${h2('Thông tin chính sách giá')}${inp('Tên chính sách giá *', 'VD: Giá BAR tiêu chuẩn')}${inp('Mô tả mặc định ngắn (tối đa 20 ký tự)', 'Tóm tắt hiển thị', '', 'text', '', 'mo_ta_ngan').replace('<input', '<input maxlength="20"')}${area('Mô tả chi tiết (hiển thị cho khách)', 'Mô tả chính sách giá...', 5, 'mo_ta')}</div>`)}
  ${card(`<div class="p-6 space-y-4">${h2('Thông tin chính sách giá chi tiết')}<div class="grid grid-cols-4 gap-4">${inp('Mã chính sách giá *', 'BAR-001')}${sel('Bữa ăn bao gồm', ['Không bao gồm', 'Bữa sáng', 'Nửa pension', 'Full pension'])}${inp('Thời hạn hủy', 'Ví dụ: Miễn phí hủy trước 24 giờ')}${inp('Đặt cọc (%)', '', '0', 'number')}</div>
    <div class="flex gap-6">${toggle(true, 'Kích hoạt')}${toggle(false, 'Đã bao gồm thuế')}</div></div>`)}
  ${card(`<div class="p-6 space-y-3">${h2('Ngày áp dụng')}<div class="flex gap-5">${radio('t', 'Luôn luôn', 1)}${radio('t', 'Trong khoảng')}</div></div>`)}
  ${card(`<div class="p-6">${h2('Gắn loại phòng')}<div class="grid grid-cols-2 gap-2">${DB.rooms.map(r => chk(r.ten_phong_vi, false, 'gan_' + r.id)).join('')}</div></div>`)}</div>` + footer(id ? 'Lưu chính sách' : 'Tạo chính sách giá'));

P.booking = () => title('Đặt phòng', 'Danh sách đặt phòng từ các kênh.') + card('<p class="text-center text-slate-400 py-16">Chưa có đặt phòng nào</p>');

/* ---------- router ---------- */
function render() {
  const h = (location.hash || '#/sales').slice(2), [a, b, c] = h.split('/'), key = b === 'edit' ? `${a}/new` : h, arg = b === 'edit' ? c : undefined;
  document.getElementById('nav').innerHTML = nav(h);
  try { document.getElementById('main').innerHTML = (P[key] || P.sales)(arg); }
  catch (e) { console.error(e); document.getElementById('main').innerHTML = `<p class="text-red-600">Lỗi hiển thị: ${e.message}</p>`; }
  document.querySelectorAll('form[data-fill]').forEach(f => { const { obj, coll, id } = f.dataset; fill(f, obj ? DB[obj] : id ? byId(coll, id) || {} : {}); });
  lucide.createIcons();
}
addEventListener('hashchange', () => { S.modal = S.edit = null; render(); scrollTo(0, 0); });
fetch('/api/db').then(r => r.json()).then(d => { DB = d; render(); })
  .catch(() => document.getElementById('main').innerHTML = '<p class="text-red-600">Không kết nối được server. Chạy: node server.js</p>');
