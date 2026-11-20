import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsRight, Copy as CopyIcon, ClipboardPaste, Trash2, Check, Link2, Unlink, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDB, fmChans, DAYS, ymd, addDays, wd, num, money, availOf, basePrice, smartPrice, limitOf, isOpen, stdPolicy, dayOf, mutDay, eachDay } from '../store.jsx';
import { Btn, Card, H2, Tabs, Seg, MultiSelect, toast } from '../ui.jsx';

const today = ymd(new Date()), fmtD = d => d.split('-').reverse().join('/');
// "Hiển thị thêm": [key, label, type]; keys other than price/stop map to cal[room][day].l (same keys as the Hạn chế tab)
const EXTRAS = [['price', 'Giá bán'], ['stop', 'Ngừng bán', 'bool'], ['maxav', 'Giới hạn bán'], ['cta', 'Không nhận check-in', 'bool'], ['ctd', 'Không nhận check-out', 'bool'],
  ['minthr', 'Số đêm tối thiểu'], ['maxstay', 'Số đêm tối đa'], ['minarr', 'Tối thiểu theo ngày đến']];
const LBL = 'h-10 px-3 sticky left-0 z-10 whitespace-nowrap overflow-hidden text-ellipsis', TD = 'h-10 p-0 text-center align-middle';
const PAL = [{ bg: 'bg-mist-100', bar: 'border-ink', text: 'text-ink', dot: 'bg-ink/50' }]; // neutral navy/slate: policy = grey block, channels inside it // single accent: policy = tinted block, channels inside it
const roomOpts = db => db.rooms.map(r => [r.id, r.ten_phong_vi]);

/* Modal "Cập nhật nhanh": chỉnh một ô giá B (hoặc chỉ số của nó) cho cả khoảng ngày. Giá S không mở được vì tự tính. */
function QuickEdit({ ctx, onClose }) {
  const { db, commit } = useDB(), { r, p, cid, d } = ctx, ch = db.channels.find(c => c.id === cid), pair = `${p.id}@${cid}`;
  const init = k => k === 'price' ? String(basePrice(db, r, d, cid)) : k === 'stop' ? (isOpen(db, r, d, cid, p.id) ? 'open' : 'stop')
    : ['cta', 'ctd'].includes(k) ? (limitOf(db, r, d, k, cid, p.id) ? 'on' : 'off') : String(limitOf(db, r, d, k, cid, p.id) ?? '');
  const [kind, setKind] = useState('price'), [v, setV] = useState(init('price')), [from, setFrom] = useState(d), [to, setTo] = useState(d);
  const type = kind === 'price' ? 'money' : kind === 'stop' ? 'stop' : ['cta', 'ctd'].includes(kind) ? 'flag' : 'num';
  const run = async del => {
    if (!del && type !== 'stop' && type !== 'flag' && num(v) === null) return toast('Nhập giá trị', true);
    const cal = structuredClone(db.cal), lk = `${kind}@${cid}@${p.id}`; let n = 0;
    const ok = eachDay(from, to, dd => { const c = mutDay(cal, r.id, dd); n++;
      if (kind === 'price') del ? delete c.p[pair] : c.p[pair] = num(v);
      else if (kind === 'stop') del ? delete c.s[pair] : c.s[pair] = v === 'stop';
      else if (type === 'flag') del ? delete c.l[lk] : c.l[lk] = v === 'on';
      else del ? delete c.l[lk] : c.l[lk] = num(v); });
    if (!ok) return; await commit('cal', cal); toast(`${del ? 'Đã xoá thiết lập' : 'Đã cập nhật'} ${n} ngày`); onClose();
  };
  const Row = ({ l, children }) => <div className="grid grid-cols-[120px_1fr] items-center gap-3 py-1.5"><span className="font-semibold text-slate-700">{l}</span>{children}</div>;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 anim-fade" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden anim-pop">
      <div className="px-5 py-3.5 bg-slate-100 font-serif font-bold text-ink text-base">Cập nhật nhanh</div>
      <div className="px-5 py-3">
        <Row l="Kênh bán"><span>{ch.name}</span></Row><Row l="Loại phòng"><span>{r.ten_phong_vi}</span></Row><Row l="Chính sách giá"><span>{p.ten_chinh_sach_gia} <b className="px-1.5 rounded text-white text-[10px] bg-ink">B</b></span></Row>
        <Row l="Loại cập nhật"><select className="field" value={kind} onChange={e => { setKind(e.target.value); setV(init(e.target.value)); }}>{EXTRAS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Row>
        <Row l="Khoảng ngày"><div className="flex items-center gap-2"><input type="date" min={today} className="field" value={from} onChange={e => { setFrom(e.target.value); if (to < e.target.value) setTo(e.target.value); }} />–<input type="date" className="field" value={to} min={from || today} onChange={e => setTo(e.target.value)} /></div></Row>
        <Row l={kind === 'price' ? 'Giá' : 'Giá trị'}>
          {type === 'stop' ? <div className="flex gap-5">{[['open', 'Mở bán'], ['stop', 'Ngừng bán']].map(([k, l]) => <label key={k} className="inline-flex items-center gap-2"><input type="radio" checked={v === k} onChange={() => setV(k)} />{l}</label>)}</div>
            : type === 'flag' ? <div className="flex gap-5">{[['off', 'Cho phép'], ['on', 'Không cho phép']].map(([k, l]) => <label key={k} className="inline-flex items-center gap-2"><input type="radio" checked={v === k} onChange={() => setV(k)} />{l}</label>)}</div>
            : <div className="relative"><input autoFocus inputMode="numeric" className="field pr-12" value={v === '' ? '' : type === 'money' ? money(+v) : v} onChange={e => setV(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && run(false)} />{type === 'money' && <span className="absolute right-3 top-3 text-xs text-slate-400">VND</span>}</div>}</Row>
      </div>
      <div className="px-5 py-3.5 flex gap-2 bg-white border-t"><Btn kind="ghost" className="flex-1" onClick={onClose}>Huỷ bỏ</Btn><Btn kind="ghost" className="flex-1" onClick={() => run(true)}>Xoá thiết lập</Btn><Btn className="flex-1" onClick={() => run(false)}>Cập nhật</Btn></div>
    </div></div>;
}

/* ---------- Bán phòng ---------- */
export function Sales() {
  const { db, commit } = useDB(), nav = useNavigate();
  useEffect(() => { document.documentElement.style.overflow = 'hidden'; return () => { document.documentElement.style.overflow = ''; }; }, []); // trang Bán phòng chỉ cuộn trong bảng
  const [quick, setQuick] = useState(null), [view, setView] = useState('channel'); // 'channel' = kênh → chính sách · 'policy' = chính sách → kênh
  const [from, setFrom] = useState(today), [to, setTo] = useState(addDays(today, 13)), [pend, setPend] = useState({}), [shut, setShut] = useState({});
  const flip = k => setShut(o => ({ ...o, [k]: !o[k] })), Chev = ({ k }) => (shut[k] ? <ChevronRight className="inline w-3.5 h-3.5 -ml-1 mr-1" /> : <ChevronDown className="inline w-3.5 h-3.5 -ml-1 mr-1" />);
  const [rf, setRf] = useState(() => db.rooms.map(r => r.id)), [cf, setCf] = useState(() => db.channels.map(c => c.id)),
    [pf, setPf] = useState(() => db.policies.map(p => p.id)), [show, setShow] = useState(['price']);
  const span = Math.min(62, Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1)), days = Array.from({ length: span }, (_, i) => addDays(from, i)), std = stdPolicy(db);
  const shift = n => { setFrom(addDays(from, n * span)); setTo(addDays(to, n * span)); };
  const chOf = f => fmChans(db, f);
  const rooms = db.rooms.filter(r => rf.includes(r.id)),
    groups = db.policies.filter(p => pf.includes(p.id)).map(p => { const f = db.formulas.find(x => x.active && x.s === p.ten_chinh_sach_gia);
      return { p, f, chans: (f ? chOf(f) : p.id === std?.id ? db.channels.map(c => c.id) : []).filter(id => cf.includes(id)) }; }).filter(g => g.f || g.p.id === std?.id);
  const extras = EXTRAS.filter(([k]) => k !== 'price' && show.includes(k));
  const val = (key, orig) => pend[key] ?? orig, setP = (key, v) => setPend(p => ({ ...p, [key]: v }));
  const wk = d => (wd(d) > 4 ? 'bg-amber-50' : '');
  const sold = (r, d) => +val(`${r.id}|${d}|a`, availOf(db, r, d)) === 0, tint = (r, d) => (sold(r, d) ? 'bg-red-100' : wk(d)); // red = no rooms left
  // plain functions (not components) so inputs keep focus while typing
  const cell = (k, orig, cls = '', ph = '') => { const v = val(k, orig); return <input inputMode="numeric" placeholder={ph} value={v === '' || v == null ? '' : money(+v)} onChange={e => setP(k, e.target.value.replace(/\D/g, ''))}
    className={`block w-full h-10 !p-0 text-center text-sm !border-0 !rounded-none bg-transparent text-sm !shadow-none hover:bg-white/70 focus:bg-white focus:!ring-1 focus:!ring-brand ${cls}`} />; };
  const openOf = (r, d, cid, pid) => val(`${r.id}|${d}|s|${pid}@${cid}`, isOpen(db, r, d, cid, pid));
  const priceTds = (r, p, f, cid) => days.map(d => { const open = openOf(r, d, cid, p.id);
    return <td key={d} title={open ? undefined : 'Ngừng bán'} className={`${TD} font-semibold ${open ? tint(r, d) : 'bg-red-200'}`}>{show.includes('price') && (f
      ? <span title="Giá thông minh — tự tính từ B, không chỉnh sửa" className={`block leading-10 cursor-default ${open ? '' : 'text-red-800'}`}>{money(smartPrice(db, f, r, d, cid, p.id))}</span>
      : <button type="button" title="Bấm để chỉnh sửa" onClick={() => setQuick({ r, p, cid, d })} className={`block w-full h-10 font-semibold hover:bg-white/70 hover:ring-1 hover:ring-inset hover:ring-ink/30 ${open ? '' : 'text-red-800'}`}>{money(basePrice(db, r, d, cid))}</button>)}</td>; });
  const extraTds = (r, p, cid, k, type) => days.map(d => {
    if (k === 'stop') { const key = `${r.id}|${d}|s|${p.id}@${cid}`, open = openOf(r, d, cid, p.id);
      return <td key={d} className={`${TD} ${tint(r, d)}`}><button type="button" title={open ? 'Đang mở bán — bấm để ngừng bán' : 'Đang ngừng bán — bấm để mở bán'} className="w-full h-10 grid place-items-center" onClick={() => setP(key, !open)}>
        {open ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}</button></td>; }
    const key = `${r.id}|${d}|l|${k}@${cid}@${p.id}`;
    return <td key={d} className={`${TD} ${tint(r, d)}`}>{type === 'bool'
      ? <input type="checkbox" className="rounded align-middle" checked={!!val(key, !!limitOf(db, r, d, k, cid, p.id))} onChange={e => setP(key, e.target.checked)} />
      : cell(key, limitOf(db, r, d, k, cid, p.id) ?? '', '', '—')}</td>; });
  const badge = f => <span className={`mr-1.5 px-1.5 rounded text-white text-[11px] ${f ? 'bg-slate-500' : 'bg-ink'}`} title={f ? 'Giá thông minh: tính từ B' : 'Giá gốc'}>{f ? 'S' : 'B'}</span>;
  const save = async () => {
    const keys = Object.keys(pend); if (!keys.length) return toast('Không có thay đổi');
    const cal = structuredClone(db.cal);
    keys.forEach(key => { const [r, d, k, x] = key.split('|'), c = mutDay(cal, r, d), v = pend[key];
      if (k === 'a') c.a = num(v); else if (k === 'p') c.p[x] = num(v); else if (k === 'l') c.l[x] = typeof v === 'boolean' ? v : num(v);
      else c.s[x] = !v; });
    await commit('cal', cal); setPend({}); toast(`Đã lưu ${keys.length} thay đổi`);
  };
  const ch = view === 'channel', lead = ch ? 410 : 340;
  return <div className="h-[calc(100vh-125px)] flex flex-col">
    <div className="flex items-center gap-3 mb-3 flex-wrap"><Seg value={view} onChange={setView} items={[["channel", "Theo kênh"], ["policy", "Theo chính sách giá"]]} /><span className="w-px h-6 bg-slate-200 mx-1" />
      <Btn kind="ghost" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Btn>
      <input type="date" className="field !w-40 !py-2" value={from} onChange={e => { if (!e.target.value) return; setFrom(e.target.value); if (to < e.target.value) setTo(addDays(e.target.value, 13)); }} />
      <span className="text-slate-400">→</span>
      <input type="date" className="field !w-40 !py-2" value={to} min={from} max={addDays(from, 61)} onChange={e => e.target.value && setTo(e.target.value)} />
      <Btn kind="ghost" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Btn>
      <button type="button" className="font-medium" onClick={() => { setFrom(today); setTo(addDays(today, 13)); }}>Hôm nay</button>
      <span className="text-slate-400">{to > addDays(from, 61) ? "tối đa 62 ngày" : ""}</span><div className="flex-1" />
      <Btn kind="ghost" onClick={() => setPend({})}>Hoàn tác</Btn><Btn onClick={save}>Lưu thay đổi</Btn></div>
    <div className="grid grid-cols-4 gap-3 mb-3">
      <MultiSelect inline label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} />
      <MultiSelect inline label="Kênh bán" opts={db.channels.map(c => [c.id, c.name])} value={cf} onChange={setCf} />
      <MultiSelect inline label="Chính sách giá" opts={db.policies.map(p => [p.id, p.ten_chinh_sach_gia])} value={pf} onChange={setPf} />
      <MultiSelect inline label="Hiển thị thêm" opts={EXTRAS.map(([k, l]) => [k, l])} value={show} onChange={setShow} /></div>
    <Card className="flex-1 min-h-0 flex flex-col"><div className="overflow-auto flex-1 min-h-0"><table className="table-fixed border-collapse" style={{ width: lead + span * 100 }}>
      <colgroup>{ch ? <><col style={{ width: 170 }} /><col style={{ width: 240 }} /></> : <col style={{ width: 340 }} />}{days.map(d => <col key={d} style={{ width: 100 }} />)}</colgroup>
      <thead><tr className="text-sm text-slate-500">
        <th colSpan={ch ? 2 : 1} className="h-14 px-3 text-left font-medium sticky left-0 top-0 z-40 bg-white">{ch ? 'KÊNH / CHỈ SỐ' : 'LOẠI PHÒNG / CHỈ SỐ'}</th>
        {days.map(d => <th key={d} title={d === today ? 'Hôm nay' : wd(d) > 4 ? 'Thứ 7, CN' : undefined} className={`font-medium sticky top-0 z-30 ${d === today ? 'bg-cyan-100 text-brand-dark' : wd(d) > 4 ? 'bg-amber-100 text-amber-700' : 'bg-white'}`}>{DAYS[wd(d)]}<div className={`text-base font-semibold ${wd(d) > 4 ? '' : 'text-ink'}`}>{+d.slice(8)}</div></th>)}</tr></thead>
      <tbody className="text-sm">{rooms.map(r => <Fragment key={r.id}>
        <tr className="sticky top-[52px] z-20 border-t-2 border-slate-300 bg-white shadow-[0_1px_0_#cbd5e1]"><td colSpan={ch ? 2 : 1} className={`${LBL} bg-white cursor-pointer select-none`} onClick={() => flip(r.id)}><Chev k={r.id} /><b className="text-ink text-[15px]">{r.ten_phong_vi}</b> <span className="text-slate-500">· {r.so_luong_phong} phòng</span></td>
          {days.map(d => { const a = availOf(db, r, d), k = `${r.id}|${d}|a`; return <td key={d} title={sold(r, d) ? 'Hết phòng' : undefined} className={`${TD} `}>{cell(k, a, sold(r, d) ? 'text-red-700 font-bold' : 'font-semibold')}</td>; })}</tr>
        {!shut[r.id] && ch && db.channels.filter(c => cf.includes(c.id)).map(c => { const gs = groups.filter(g => g.chans.includes(c.id)), rows = gs.length * (1 + extras.length);
          return gs.map(({ p, f }, gi) => <Fragment key={c.id + p.id}>
            <tr className={gi === 0 ? 'border-t border-slate-300' : 'border-t border-slate-100'}>
              {gi === 0 && <td rowSpan={rows} className="sticky left-0 z-10 bg-white align-top px-3 py-2 border-r border-slate-200"><div className="flex items-center gap-1.5"><b className="text-[15px] text-slate-800">{c.name}</b><span title={c.connected ? 'Đã kết nối' : 'Chưa kết nối'} className="shrink-0">{c.connected ? <Link2 className="w-4 h-4 text-brand-dark" /> : <Unlink className="w-4 h-4 text-slate-300" />}</span></div></td>}
              <td style={{ left: 169 }} className="h-10 px-3 sticky z-10 bg-white whitespace-nowrap overflow-hidden text-ellipsis border-r border-slate-100">{badge(f)}<span className="font-medium">Giá bán</span> <span className="text-slate-400">· {p.ten_chinh_sach_gia}</span></td>
              {priceTds(r, p, f, c.id)}</tr>
            {extras.map(([k, label, type]) => <tr key={k} className="border-t border-slate-100"><td style={{ left: 169 }} className="h-10 px-3 sticky z-10 bg-white text-slate-600 whitespace-nowrap border-r border-slate-100">{label}</td>{extraTds(r, p, c.id, k, type)}</tr>)}
          </Fragment>); })}
        {!shut[r.id] && !ch && groups.map(({ p, f, chans }, gi) => { const c = PAL[gi % PAL.length]; return <Fragment key={p.id}>
          <tr className={`border-t border-slate-200 ${c.bg}`}><td className={`${LBL} ${c.bg} border-l-4 ${c.bar} ${c.text} font-bold cursor-pointer select-none`} onClick={() => flip(r.id + p.id)}><Chev k={r.id + p.id} />{p.ten_chinh_sach_gia} <span className={`ml-1.5 px-1.5 rounded text-white text-[11px] ${f ? 'bg-slate-500' : 'bg-ink'}`} title={f ? 'Giá thông minh: tính từ B' : 'Giá gốc'}>{f ? 'S' : 'B'}</span></td>
            {days.map(d => <td key={d} />)}</tr>
          {!shut[r.id + p.id] && chans.map(cid => <Fragment key={cid}>
            <tr className="border-t border-slate-100"><td className={`${LBL} bg-white border-l-4 ${c.bar} pl-6`}><span className={`inline-block w-2 h-2 rounded-full mr-2 ${c.dot}`} /><b className="font-semibold text-slate-800">{db.channels.find(x => x.id === cid).name}</b></td>{priceTds(r, p, f, cid)}</tr>
            {extras.map(([k, label, type]) => <tr key={k} className="border-t border-slate-100"><td className={`${LBL} bg-white border-l-4 ${c.bar} pl-10 text-slate-500`}>└ {label}</td>{extraTds(r, p, cid, k, type)}</tr>)}
          </Fragment>)}
        </Fragment>; })}
      </Fragment>)}</tbody></table></div></Card>
    {quick && <QuickEdit ctx={quick} onClose={() => setQuick(null)} />}
  </div>;
}

/* ---------- Cập nhật hàng loạt ---------- */
const newRow = () => ({ f: today, t: addDays(today, 6), v: Array(7).fill('') }); // mặc định 7 ngày để đủ 7 thứ nhập được
// Một khoảng tối thiểu 1 ngày; chỉ các thứ nằm trong khoảng mới nhập được, các thứ còn lại xám
const spanOf = r => (r.f && r.t && r.t >= r.f ? Math.round((new Date(r.t) - new Date(r.f)) / 864e5) + 1 : 1);
const activeWd = r => { if (!r.f) return Array(7).fill(true); const on = Array(7).fill(false); for (let i = 0; i < Math.min(7, spanOf(r)); i++) on[wd(addDays(r.f, i))] = true; return on; };
const maskV = r => { const on = activeWd(r), m = a => a.map((y, w) => on[w] ? y : ''); return { ...r, v: m(r.v), ...(r.l && { l: Object.fromEntries(Object.entries(r.l).map(([k, a]) => [k, m(a)])) }) }; };
// Khoảng mới nối tiếp khoảng ngay phía trên: bắt đầu sau ngày cuối của nó, dài bằng nó
const nextRange = last => { if (!last?.f) return { f: today, t: today }; const f = addDays(last.t || last.f, 1); return { f, t: addDays(f, spanOf(last) - 1) }; };
const wkHead = i => (i > 4 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500');
const numIn = (v, set, ph, fmt, extra = '', dis = false) => <input inputMode="numeric" disabled={dis} placeholder={dis ? '' : ph} className={`field !py-2 text-right enabled:border-slate-300 enabled:shadow-sm disabled:bg-slate-200 disabled:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed ${extra}`} value={v === '' ? '' : fmt ? money(+v) : v} onChange={e => set(e.target.value.replace(/\D/g, ''))} />;
const GRID = 'grid grid-cols-[340px_repeat(7,1fr)_168px] gap-2';
const DayHead = () => <div className={`${GRID} px-4 pt-3 text-xs font-medium`}><span className="py-1.5 text-slate-500">Khoảng ngày</span>
  {DAYS.map((d, i) => <span key={d} className={`py-1.5 text-center rounded ${wkHead(i)}`}>{d}</span>)}<span /></div>;
const DateIn = ({ r, onF, onT, locked }) => <div className="flex items-center gap-1.5">
  <input type="date" disabled={locked} min={today} className="field !py-2 min-w-0 flex-1 disabled:bg-slate-50 disabled:text-slate-500" value={r.f} onChange={e => onF(e.target.value)} />
  <span className="text-slate-400">~</span>
  <input type="date" disabled={locked} min={r.f || today} className="field !py-2 min-w-0 flex-1 disabled:bg-slate-50 disabled:text-slate-500" value={r.t} onChange={e => onT(e.target.value)} /></div>;
const IconBtn = ({ danger, children, ...p }) => <button type="button" {...p} className={`w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 ${danger ? 'hover:text-red-500' : 'hover:text-ink'} disabled:opacity-30 disabled:pointer-events-none`}>{children}</button>;
// Sao chép / dán 7 giá trị theo thứ của một dòng, xoá dòng (onDel bỏ trống = không xoá được)
// Copy: lấy giá trị của ô đầu tiên có số trong hàng, điền cho cả 7 thứ
const fillRow = (vals, on) => { const x = vals.find((v, w) => on[w] && v !== '' && v != null); return x === undefined ? null : on.map(a => (a ? x : '')); };
const RowTools = ({ clip, setClip, vals, setVals, onDel, on }) => <div className="flex items-center">
  <button type="button" title="Copy ngang: điền giá trị của ô đầu tiên có số cho tất cả các thứ còn lại trong hàng" className="h-7 pl-2 pr-2.5 mr-1 inline-flex items-center gap-1 rounded-md bg-ink text-white text-xs font-semibold hover:opacity-90" onClick={() => { const nv = fillRow(vals, on); if (!nv) return toast('Hàng chưa có giá trị để copy', true); setVals(nv); }}><ChevronsRight className="w-3.5 h-3.5" />Copy</button>
  <IconBtn title="Sao chép dòng để dán" onClick={() => { setClip([...vals]); toast('Đã sao chép'); }}><CopyIcon className="w-4 h-4" /></IconBtn>
  <IconBtn title={clip ? 'Dán vào dòng' : 'Chưa có gì để dán'} disabled={!clip} onClick={() => setVals(clip.map((x, w) => (on[w] ? x : '')))}><ClipboardPaste className="w-4 h-4" /></IconBtn>
  {onDel ? <IconBtn danger title="Xoá dòng" onClick={onDel}><Trash2 className="w-4 h-4" /></IconBtn> : <span className="w-8" />}</div>;
// ngày kết thúc luôn >= ngày bắt đầu; không chọn quá khứ
const fixF = (x, f) => maskV({ ...x, f, t: x.t && x.t >= f ? x.t : f });
const setT = (x, t) => maskV({ ...x, t });

// Mỗi mục (khoá k) có các dòng ngày riêng. Mục đầu tiên (master) là gốc: các mục còn lại tự theo ngày/số dòng của nó
// cho tới khi bị sửa ngày / thêm / xoá dòng riêng (khi đó tách ra). Giá trị luôn riêng từng mục.
// master: khoá gốc (chuỗi) hoặc hàm k => khoá gốc của k (k là gốc khi trả về chính nó). full = mục theo gốc cả giá trị, không chỉ ngày.
function useDateRows(master, keys, full) {
  const [rr, setRR] = useState({}), [det, setDet] = useState({}), par = typeof master === 'function' ? master : () => master;
  const get = k => rr[k] ?? [newRow()], kidsOf = k => keys.filter(o => o !== k && par(o) === k);
  const copyRows = rows => rows.map(r => maskV({ ...r, v: [...r.v], ...(r.l && { l: structuredClone(r.l) }) }));
  const set = (k, fn) => setRR(prev => { const next = fn(prev[k] ?? [newRow()]), out = { ...prev, [k]: next };
    if (par(k) === k) kidsOf(k).forEach(o => { if (!det[o]) { const old = prev[o] ?? [newRow()]; out[o] = full ? copyRows(next) : next.map((row, i) => maskV({ ...(old[i] ?? newRow()), f: row.f, t: row.t })); } });
    return out; });
  const detach = k => par(k) !== k && setDet(d => ({ ...d, [k]: true }));
  return { det, get, follows: k => par(k) !== k && !det[k],
    setAt: (k, i, patch, dates) => { if (dates || full) detach(k); set(k, rs => rs.map((x, j) => j === i ? (typeof patch === 'function' ? patch(x) : { ...x, ...patch }) : x)); },
    add: k => { detach(k); set(k, rs => [...rs, { ...newRow(), ...nextRange(rs[rs.length - 1]) }]); },
    del: (k, i) => { detach(k); set(k, rs => rs.length > 1 ? rs.filter((_, j) => j !== i) : [newRow()]); },
    copyAll: k => setRR(prev => { const out = { ...prev }; keys.forEach(o => { if (o !== k) out[o] = copyRows(prev[k] ?? [newRow()]); }); return out; }),
    put: items => { setRR(prev => { const out = { ...prev }; items.forEach(([k, rows]) => { out[k] = copyRows(rows); }); return out; }); setDet(d => { const o = { ...d }; items.forEach(([k, , f]) => { if (f) o[k] = true; else delete o[k]; }); return o; }); } };
}
const LIMITS = [['stop', 'Ngừng bán', 1], ['cta', 'Không nhận check-in', 1], ['ctd', 'Không nhận check-out', 1], ['maxav', 'Giới hạn bán'], ['minthr', 'Số đêm tối thiểu'], ['maxstay', 'Số đêm tối đa'], ['minarr', 'Tối thiểu theo ngày đến']];

export function Bulk() {
  const { db, commit } = useDB();
  const [tab, setTab] = useState('avail'), [sub, setSub] = useState('dow');
  const [rf, setRf] = useState(() => db.rooms.map(r => r.id)), [cf, setCf] = useState(() => db.channels.map(c => c.id)), [pf, setPf] = useState(() => db.policies.map(p => p.id));
  const [from, setFrom] = useState(today), [to, setTo] = useState(addDays(today, 29)), [pFrom, setPFrom] = useState(today), [pTo, setPTo] = useState(addDays(today, 364)), [dowR, setDowR] = useState({}), [shutG, setShutG] = useState({}), [limSel, setLimSel] = useState(['stop']), [roomClip, setRoomClip] = useState(null);
  // Phòng trống: khoảng ngày dùng chung (đặt ở hạng phòng đầu tiên), số lượng riêng cho từng hạng phòng
  const [clip, setClip] = useState(null), [mode, setMode] = useState('config'), [shut, setShut] = useState({}), [ovF, setOvF] = useState(today), [ovT, setOvT] = useState(addDays(today, 8));
  const std = stdPolicy(db), ovN = Math.min(31, Math.max(1, Math.round((new Date(ovT) - new Date(ovF)) / 864e5) + 1)), ovDays = Array.from({ length: ovN }, (_, i) => addDays(ovF, i));
  const shiftOv = n => { setOvF(addDays(ovF, n * ovN)); setOvT(addDays(ovT, n * ovN)); };
  const chOf = f => fmChans(db, f);
  // B = giá gốc (gắn mọi kênh), S = giá thông minh (chỉ kênh của nó, tự tính nên không cập nhật giá hàng loạt)
  const groups = db.policies.map(p => { const f = db.formulas.find(x => x.active && x.s === p.ten_chinh_sach_gia); return { p, f, chans: f ? chOf(f) : p.id === std?.id ? db.channels.map(c => c.id) : [] }; }).filter(g => g.f || g.p.id === std?.id);
  const optG = groups, pfv = pf.filter(id => optG.some(g => g.p.id === id));
  const rooms = db.rooms.filter(r => rf.includes(r.id));
  const targets = rooms.flatMap(r => optG.filter(g => pfv.includes(g.p.id)).flatMap(g => g.chans.filter(c => cf.includes(c)).map(cid => ({ r, p: g.p, cid }))));
  const [F, T] = tab === 'price' ? [pFrom, pTo] : [from, to], nDays = F && T && T >= F ? Math.round((new Date(T) - new Date(F)) / 864e5) + 1 : 0;
  const needDates = tab === 'limit' || (tab === 'price' && sub === 'dow');
  const cntCh = new Set(targets.map(t => t.cid)).size, cntPo = new Set(targets.map(t => t.p.id)).size;
  const pms = r => r.so_luong_phong; // Phòng trống PMS: số phòng của hạng phòng, không bị cập nhật hàng loạt thay đổi
    // Giá S (thông minh) kế thừa giá B: các công thức có gói cơ sở C = chính sách giá này
  const kidsOf = g => db.formulas.filter(f => f.active && f.c === g.p.ten_chinh_sach_gia && pfv.includes(db.policies.find(p => p.ten_chinh_sach_gia === f.s)?.id)), kids = c => kidsOf(c.g);
  const fText = f => { let b = `Giá ${f.c}`; if (+f.d1) b = `(${b} + ${f.d1})`; if (+f.k && +f.k !== 1) b += ` × ${f.k}`; if (+f.d2) b += ` + ${f.d2}`; const l = String(f.layers || '').split(',').filter(x => x.trim()); return `= ${b}${l.length ? ` / (1 − ${l.map(x => x + '%').join(' − ')})` : ''}`; };
  const toggle = (c, ks) => ks.length ? <button type="button" title={shutG[c.k] ? 'Mở giá S' : 'Đóng giá S'} className="w-6 h-6 shrink-0 grid place-items-center rounded hover:bg-slate-200 text-slate-500" onClick={() => setShutG(o => ({ ...o, [c.k]: !o[c.k] }))}>{shutG[c.k] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button> : <span className="w-6 shrink-0" />;
  const A = useDateRows(db.rooms[0]?.id, db.rooms.map(r => r.id));
  // Giá ngày: mỗi (hạng phòng × chính sách giá) một thẻ; thẻ đầu tiên là gốc
  const cards = rooms.flatMap(r => optG.filter(g => !g.f && (pfv.includes(g.p.id) || kidsOf(g).length)).map(g => ({ r, g, k: r.id + '|' + g.p.id, chs: g.chans.filter(c => cf.includes(c)) })));
  const B = useDateRows(cards[0]?.k, cards.map(c => c.k));
  // Hạn chế: mỗi thẻ B kèm các giá S kế thừa; S nhận theo B (ngày + giá trị) cho tới khi được chỉnh riêng
  const limUnits = c => [{ k: c.k, r: c.r, p: c.g.p, chs: c.chs, name: c.g.p.ten_chinh_sach_gia }, ...kids(c).map(f => ({ k: c.k + '|' + f.id, r: c.r, f, p: db.policies.find(x => x.ten_chinh_sach_gia === f.s), chs: chOf(f).filter(id => cf.includes(id)), name: f.s }))];
  const pk = k => k.split('|').slice(0, 2).join('|'), sfx = k => k.split('|').slice(1).join('|'), allL = cards.flatMap(limUnits), C = useDateRows(k => k.split('|').slice(0, 2).join('|'), allL.map(u => u.k), true);
  // Kênh gắn: 1 kênh hiện tên, nhiều kênh gộp thành "N kênh" bấm xổ danh sách (tối đa ~70 kênh, không trải ngang)
  const chanBadge = ids => { const names = ids.map(id => db.channels.find(x => x.id === id)?.name).filter(Boolean); if (names.length <= 1) return <span className="rounded border border-slate-200 bg-white text-[11px] px-1.5 py-0.5 text-slate-600">{names[0] || 'Chưa gắn kênh'}</span>;
    return <details className="relative"><summary className="list-none cursor-pointer select-none rounded-full border border-slate-200 bg-white text-[11px] px-2.5 py-0.5 text-slate-600 hover:border-ink">{names.length} kênh ▾</summary>
      <div className="absolute z-40 mt-1 w-56 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl p-1.5 text-xs text-slate-700">{names.map(n => <div key={n} className="px-2 py-1 rounded hover:bg-slate-50">{n}</div>)}</div></details>; };
  // Giá S tính ra từ giá B đang nhập: ((B + Δ1) × k + Δ2) / Π(1 − lớp phí%)
  const calcS = (f, b) => { const den = String(f.layers || '').split(',').filter(x => x.trim()).reduce((a, l) => a * (1 - l / 100), 1); return (((b + (+f.d1 || 0)) * (+f.k || 1)) + (+f.d2 || 0)) / (den || 1); };
  const sCell = t => <div className="field !py-2 text-right bg-slate-50 text-slate-600 !border-slate-200 min-h-[38px]">{t || '—'}</div>;
  const sShow = (f, b) => b === '' || b == null ? '' : money(Math.round(calcS(f, +b)));
  const sBody = u => { const pkey = pk(u.k), bv = dowR[pkey] ?? [];
    return sub === 'dow'
      ? <div className="grid grid-cols-[repeat(7,1fr)_168px] gap-2 px-4 pb-3">{DAYS.map((d, w) => <label key={d}><span className={`block text-center text-xs font-medium rounded py-1 mb-1 ${wkHead(w)}`}>{d}</span>{sCell(sShow(u.f, bv[w]))}</label>)}<span /></div>
      : <div className="overflow-x-auto"><div className="min-w-[1180px]"><DayHead />
          {B.get(pkey).map((rg, i) => <div key={i} className={`${GRID} items-center px-4 py-1.5 [&_input]:!bg-slate-50 [&_input]:!border-slate-200 [&_input]:!text-slate-600 [&_input]:!opacity-100`}><DateIn r={rg} locked onF={() => {}} onT={() => {}} />{rg.v.map((x, w) => <div key={w}>{sCell(activeWd(rg)[w] ? sShow(u.f, x) : '')}</div>)}<span /></div>)}<div className="h-2" /></div></div>; };
  // Giá năm: mỗi giá B / S là một dòng ngang: thông tin bên trái, 7 ô theo thứ bên phải (S là giá tính ra, không nhập)
  const DG = 'grid grid-cols-[380px_repeat(7,minmax(0,1fr))_168px] gap-2 items-center px-4 py-2.5';
  const dowRow = (u, v) => { const bv = dowR[pk(u.k)] ?? [], c = cards.find(x => x.k === u.k); return <div key={u.k} className={`${unitBox(u)} ${DG}`}>
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2">{!u.f && toggle(c, kids(c))}
      <span className={`inline-grid place-items-center w-5 h-5 rounded text-[11px] font-bold ${u.f ? 'bg-slate-200 text-slate-600' : 'bg-ink text-white'}`}>{u.f ? 'S' : 'B'}</span><span className="font-medium">{u.name}</span>{chanBadge(u.chs)}</div>
      {u.f && <div className="text-xs text-slate-500 mt-1">{fText(u.f)}</div>}</div>
    {DAYS.map((_, w) => <div key={w}>{u.f ? sCell(sShow(u.f, bv[w])) : numIn(v[w] ?? '', nv => setDowR(o => ({ ...o, [u.k]: Object.assign(Array(7).fill(''), o[u.k], { [w]: nv }) })), '—', true)}</div>)}
    {u.f ? <span /> : <RowTools clip={clip} setClip={setClip} on={Array(7).fill(true)} vals={v} setVals={nv => setDowR(o => ({ ...o, [u.k]: nv }))} />}</div>; };
  const ROOMHEAD = 'flex items-center px-4 py-2.5 bg-mist-200 rounded-t-xl', unitBox = u => `border-t ${u.f ? 'ml-4 border-l-4 border-l-slate-300 bg-slate-50/60' : 'border-slate-200'}`;
  // Cách hiển thị chung của giá B / S ở cả tab Giá và Hạn chế: [mũi tên] [B|S] tên · nhãn công thức · kênh · công thức
  const unitHead = (u, right) => { const c = cards.find(x => x.k === pk(u.k)); return <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">{!u.f && toggle(c, kids(c))}
    <span className={`inline-grid place-items-center w-5 h-5 rounded text-[11px] font-bold ${u.f ? 'bg-slate-200 text-slate-600' : 'bg-ink text-white'}`}>{u.f ? 'S' : 'B'}</span><span className="font-medium">{u.name}</span>
    {chanBadge(u.chs)}
    {u.f && <span className="text-xs text-slate-500">{fText(u.f)}</span>}<div className="flex-1" />{right}</div>; };
  const roomsOf = () => rooms.filter(r => cards.some(c => c.r.id === r.id)), unitsOf = r => cards.filter(c => c.r.id === r.id).flatMap(limUnits).filter(u => !u.f || !shutG[pk(u.k)]);

  const apply = async () => {
    const cal = structuredClone(db.cal); let n = 0, ok = true;
    if (tab === 'avail' && mode === 'all') {
      const f0 = ovF < today ? today : ovF; if (f0 > ovT) return toast('Khoảng ngày đã qua, không cập nhật được', true);
      ok = eachDay(f0, ovT, d => rooms.forEach(r => { mutDay(cal, r.id, d).a = pms(r); n++; }));
    } else if (tab === 'avail') {
      for (const r of rooms) for (const rg of A.get(r.id)) { const v = rg.v.map(num); if (v.every(x => x === null)) continue;
        const over = v.find(x => x !== null && x > pms(r)); if (over !== undefined) { toast(`${r.ten_phong_vi}: Bán (OTA) ${over} vượt Phòng trống PMS (${pms(r)})`, true); return; }
        ok = eachDay(rg.f, rg.t, (d, w) => { if (v[w] !== null) { mutDay(cal, r.id, d).a = v[w]; n++; } }); if (!ok) return; }
    } else if (tab === 'price') {
      const put = (c, d, v) => c.chs.forEach(cid => { mutDay(cal, c.r.id, d).p[`${c.g.p.id}@${cid}`] = v; n++; });
      for (const c of cards) {
        if (sub === 'day') { for (const rg of B.get(c.k)) { const v = rg.v.map(num); if (v.every(x => x === null)) continue; ok = eachDay(rg.f, rg.t, (d, w) => v[w] !== null && put(c, d, v[w])) && ok; } }
        else { const v = (dowR[c.k] ?? []).map(num); if (v.every(x => x == null)) continue; ok = eachDay(pFrom, pTo, (d, w) => v[w] != null && put(c, d, v[w])) && ok; } }
    } else {
      for (const u of allL) for (const rg of C.get(u.k)) for (const lk of limSel) { const arr = rg.l?.[lk] ?? []; if (!arr.some(x => x !== '' && x != null)) continue;
        ok = eachDay(rg.f, rg.t, (d, w) => { const x = arr[w]; if (x === '' || x == null) return; u.chs.forEach(cid => { const c = mutDay(cal, u.r.id, d);
          if (lk === 'stop') c.s[`${u.p.id}@${cid}`] = !!x; else c.l[`${lk}@${cid}@${u.p.id}`] = typeof x === 'boolean' ? x : num(x); n++; }); }) && ok; }
    }
    if (!ok) return;
    if (!n) return toast('Chưa nhập giá trị nào để cập nhật', true);
    await commit('cal', cal); toast(`Đã cập nhật ${n} ô`);
  };
  const noTarget = tab !== 'avail' && !targets.length || tab === 'avail' && !rooms.length;
  const summary = tab === 'avail' ? `${rooms.length} hạng phòng` : `${rooms.length} phòng × ${cntCh} kênh × ${cntPo} chính sách = ${targets.length} ô` + (needDates ? ` · ${nDays} ngày` : '');
  return <>
    <Tabs value={tab} onChange={setTab} items={[['avail', 'Phòng trống'], ['price', 'Giá'], ['limit', 'Hạn chế']]} />
    {tab === 'avail' && <>
      <div className="grid grid-cols-4 gap-5 mb-4"><MultiSelect label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} /></div>
      <Card className="mb-5">
        <div className="p-4 flex items-center gap-6 border-b"><span className="text-slate-500">Cấu hình bán</span>
          {[['all', 'Bán hết các phòng đang còn'], ['config', 'Bán theo cấu hình']].map(([k, l]) => <label key={k} className="inline-flex items-center gap-2"><input type="radio" checked={mode === k} onChange={() => setMode(k)} />{l}</label>)}
          <div className="flex-1" />{mode === 'all' ? <Btn onClick={apply}>Đồng bộ</Btn> : <Btn onClick={() => toast('Chưa kết nối PMS nên chưa đồng bộ được phòng trống', true)}>Đồng bộ từ PMS</Btn>}</div>
        <div className="p-4"><div className="flex items-center gap-2 mb-3">
          <Btn kind="ghost" className="!px-2.5 !py-1.5" onClick={() => shiftOv(-1)}><ChevronLeft className="w-4 h-4" /></Btn>
          <input type="date" className="field !w-44 !py-1.5" value={ovF} onChange={e => { if (!e.target.value) return; setOvF(e.target.value); if (ovT < e.target.value) setOvT(addDays(e.target.value, 8)); }} /><span className="text-slate-400">→</span>
          <input type="date" className="field !w-44 !py-1.5" value={ovT} min={ovF} max={addDays(ovF, 30)} onChange={e => e.target.value && setOvT(e.target.value)} />
          <Btn kind="ghost" className="!px-2.5 !py-1.5" onClick={() => shiftOv(1)}><ChevronRight className="w-4 h-4" /></Btn><span className="text-slate-400 ml-1">{ovN} ngày{ovT > addDays(ovF, 30) ? ' (tối đa 31)' : ''}</span></div>
          <div className="overflow-x-auto"><table className="w-full text-center text-sm table-fixed" style={{ minWidth: 370 + ovN * 64 }}><colgroup><col style={{ width: 220 }} /><col style={{ width: 150 }} />{ovDays.map(d => <col key={d} />)}</colgroup><tbody>
            <tr className="text-xs text-slate-500"><td className="sticky left-0 z-10 bg-white" /><td style={{ left: 220 }} className="sticky z-10 bg-white" />{ovDays.map(d => <td key={d} className={`py-1.5 ${wd(d) > 4 ? 'bg-amber-100 text-amber-700' : ''}`}>{DAYS[wd(d)]}<div className="text-base font-semibold text-ink">{+d.slice(8)}</div><div className="text-[11px]">Tháng {+d.slice(5, 7)}</div></td>)}</tr>
            {rooms.map(r => [
              <tr key={r.id} className="border-t"><td rowSpan={2} className="sticky left-0 z-10 bg-white text-left py-2 pr-3 align-middle font-medium">{r.ten_phong_vi} <span className="text-slate-400 font-normal">(Mã: {r.ma_hang_phong})</span></td><td style={{ left: 220 }} className="sticky z-10 bg-white border-r border-slate-100 text-left text-slate-600">Bán (OTA)</td>
                {ovDays.map(d => { const a = availOf(db, r, d); return <td key={d} className={`h-9 ${a == 0 ? 'bg-red-100' : wd(d) > 4 ? 'bg-amber-50' : ''}`}><span className={`inline-block min-w-8 rounded px-2 py-0.5 font-semibold ${a == 0 ? 'text-red-700 bg-red-200' : 'bg-slate-100'}`}>{a}</span></td>; })}</tr>,
              <tr key={r.id + 'p'} className="border-t border-slate-100"><td style={{ left: 220 }} className="sticky z-10 bg-white border-r border-slate-100 text-left text-slate-400">Phòng trống PMS</td>{ovDays.map(d => <td key={d} className={`h-9 text-slate-400 ${wd(d) > 4 ? 'bg-amber-50' : ''}`}>{pms(r)}</td>)}</tr>])}
          </tbody></table></div></div></Card>
      {mode === 'all' ? null
        : <div className="space-y-3">{rooms.map(r => <Card key={r.id}>
            <button type="button" className="w-full flex items-center gap-2 px-4 py-3 text-left" onClick={() => setShut(o => ({ ...o, [r.id]: !o[r.id] }))}>
              {shut[r.id] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}<b className="font-serif text-base">{r.ten_phong_vi}</b>
              <span className="text-xs rounded-full border px-2 py-0.5 text-slate-500">Phòng trống PMS tối đa {pms(r)}</span>
              {A.follows(r.id) && <span className="ml-auto text-xs text-slate-400">Đang theo ngày của hạng phòng đầu tiên · sửa ngày để tách riêng</span>}</button>
            {!shut[r.id] && <div className="overflow-x-auto border-t"><div className="min-w-[1180px]"><DayHead />
              {A.get(r.id).map((rg, i) => <div key={i} className={`${GRID} items-center px-4 py-1.5`}>
                <DateIn r={rg} onF={f => A.setAt(r.id, i, x => fixF(x, f), true)} onT={t => A.setAt(r.id, i, x => setT(x, t), true)} />
                {rg.v.map((v, w) => <div key={w}>{numIn(v, nv => A.setAt(r.id, i, x => ({ ...x, v: x.v.map((y, z) => z === w ? nv : y) })), '—', false, '', !activeWd(rg)[w])}</div>)}
                <RowTools clip={clip} setClip={setClip} on={activeWd(rg)} vals={rg.v} setVals={v => A.setAt(r.id, i, x => ({ ...x, v }))} onDel={() => A.del(r.id, i)} /></div>)}
              <div className="px-4 py-3"><button type="button" className="border border-dashed border-slate-300 rounded-full px-3 py-1 text-xs text-slate-600 hover:border-ink hover:text-ink" onClick={() => A.add(r.id)}>+ Thêm khoảng ngày</button></div></div></div>}</Card>)}
          <div className="flex justify-end"><Btn disabled={noTarget} onClick={apply}>Cập nhật</Btn></div></div>}</>}
    {tab === 'price' && <>
      <div className="flex items-center justify-between"><Seg value={sub} onChange={setSub} items={[['dow', 'Giá năm'], ['day', 'Giá ngày']]} /><Btn disabled={noTarget} onClick={apply}>Cập nhật</Btn></div>
      <div className="grid grid-cols-4 gap-5 my-4 items-end">
        <MultiSelect label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} />
        <MultiSelect label="Chính sách giá" opts={optG.map(g => [g.p.id, g.p.ten_chinh_sach_gia])} value={pfv} onChange={setPf} />
        <MultiSelect label="Kênh bán" opts={db.channels.map(c => [c.id, c.name])} value={cf} onChange={setCf} />
        {sub === 'dow' && <div><span className="lbl">Khoảng ngày áp dụng</span><div className="flex items-center gap-2">
          <input type="date" min={today} className="field" value={pFrom} onChange={e => { if (!e.target.value) return; setPFrom(e.target.value); if (pTo < e.target.value) setPTo(e.target.value); }} /><span className="text-slate-400">–</span>
          <input type="date" min={pFrom || today} className="field" value={pTo} onChange={e => e.target.value && setPTo(e.target.value)} /></div></div>}</div>
      <div className="flex items-center justify-between mb-3"><span className="text-xs text-slate-500">{sub === 'dow' ? 'Nhập giá B; giá thông minh (S) tự tính theo B và áp dụng cho các kênh được gắn' : 'Nhập giá B theo khoảng ngày; giá thông minh (S) tự tính theo B'}</span>
        <button type="button" className="text-xs font-medium text-brand" onClick={() => setShutG(cards.every(c => shutG[c.k]) ? {} : Object.fromEntries(cards.map(c => [c.k, true])))}>{cards.every(c => shutG[c.k]) ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}</button></div>
      <div className="space-y-3">{cards.length ? roomsOf().map(r => <Card key={r.id}>
        <div className={ROOMHEAD}><span className="font-serif font-bold text-ink">{r.ten_phong_vi}</span></div>
        {sub === 'dow' && <div className={`${DG} !py-1.5 bg-slate-50 text-xs font-semibold border-t border-slate-200`}><span className="text-slate-500">Chính sách giá</span>{DAYS.map((d, w) => <span key={d} className={`py-1 text-center rounded ${wkHead(w)}`}>{d}</span>)}<span /></div>}
        {unitsOf(r).map(u => { const c = cards.find(x => x.k === u.k), v = dowR[u.k] ?? Array(7).fill(''); if (sub === 'dow') return dowRow(u, v); return <div key={u.k} className={unitBox(u)}>
          {unitHead(u, !u.f && (sub === 'dow'
            ? null
            : <>{B.follows(u.k) && <span className="text-xs text-slate-400 mr-2">theo ngày của thẻ đầu tiên</span>}<button type="button" title="Copy các khoảng ngày và giá của thẻ này sang tất cả thẻ khác" className="h-7 px-2.5 rounded-md bg-ink text-white text-xs font-semibold hover:opacity-90" onClick={() => { B.copyAll(u.k); toast('Đã copy sang các thẻ khác'); }}>Copy</button></>))}
          {u.f && sBody(u)}
          {!u.f && (sub === 'dow'
            ? <div className="grid grid-cols-[repeat(7,1fr)_168px] gap-2 items-end px-4 pb-3">{DAYS.map((d, w) => <label key={d}><span className={`block text-center text-xs font-medium rounded py-1 mb-1 ${wkHead(w)}`}>{d}</span>{numIn(v[w] ?? '', nv => setDowR(o => ({ ...o, [u.k]: Object.assign(Array(7).fill(''), o[u.k], { [w]: nv }) })), '—', true)}</label>)}
              <RowTools clip={clip} setClip={setClip} on={Array(7).fill(true)} vals={v} setVals={nv => setDowR(o => ({ ...o, [u.k]: nv }))} /></div>
            : <div className="overflow-x-auto"><div className="min-w-[1180px]"><DayHead />
              {B.get(u.k).map((rg, i) => <div key={i} className={`${GRID} items-center px-4 py-1.5`}>
                <DateIn r={rg} onF={f => B.setAt(u.k, i, x => fixF(x, f), true)} onT={t => B.setAt(u.k, i, x => setT(x, t), true)} />
                {rg.v.map((x, w) => <div key={w}>{numIn(x, nv => B.setAt(u.k, i, y => ({ ...y, v: y.v.map((z, q) => q === w ? nv : z) })), '—', true, '', !activeWd(rg)[w])}</div>)}
                <RowTools clip={clip} setClip={setClip} on={activeWd(rg)} vals={rg.v} setVals={nv => B.setAt(u.k, i, y => ({ ...y, v: nv }))} onDel={() => B.del(u.k, i)} /></div>)}
              <div className="px-4 py-3"><button type="button" className="border border-dashed border-slate-300 rounded-full px-3 py-1 text-xs text-slate-600 hover:border-ink hover:text-ink" onClick={() => B.add(u.k)}>+ Thêm khoảng ngày</button></div></div></div>)}</div>; })}</Card>)
        : <Card><p className="text-center text-slate-400 py-10">Chưa chọn chính sách giá nào.</p></Card>}</div>
      {sub === 'dow' && <p className="text-xs text-slate-400 mt-3">{summary}</p>}</>}
    {tab === 'limit' && <>
      <div className="grid grid-cols-4 gap-5 mb-4 items-end">
        <MultiSelect label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} />
        <MultiSelect label="Chính sách giá" opts={optG.map(g => [g.p.id, g.p.ten_chinh_sach_gia])} value={pfv} onChange={setPf} />
        <MultiSelect label="Hạn chế" opts={LIMITS.map(([k, l]) => [k, l])} value={limSel} onChange={setLimSel} />
        <div className="flex justify-end"><Btn disabled={!allL.length || !limSel.length} onClick={apply}>Cập nhật</Btn></div></div>
      <div className="space-y-3">{cards.length && limSel.length ? roomsOf().map(r => <Card key={r.id}>
        <div className={ROOMHEAD}><span className="font-serif font-bold text-ink">{r.ten_phong_vi}</span><div className="flex-1" />
          {roomClip && roomClip.rid !== r.id && <button type="button" title={`Dán toàn bộ khoảng ngày và hạn chế đã copy từ ${roomClip.name} vào hạng phòng này`} className="h-7 px-2.5 mr-2 rounded-md border border-ink text-ink text-xs font-semibold hover:bg-white" onClick={() => { const items = allL.filter(u => u.r.id === r.id).flatMap(u => { const m = roomClip.items.find(i => i[0] === sfx(u.k)); return m ? [[u.k, m[1], m[2]]] : []; }); if (!items.length) return toast('Hạng phòng này không có chính sách tương ứng để dán', true); C.put(items); toast(`Đã dán từ ${roomClip.name}`); }}>Dán từ {roomClip.name}</button>}
          <button type="button" title="Copy toàn bộ khoảng ngày và hạn chế của hạng phòng này (B và S) để dán vào một hạng phòng khác" className={`h-7 px-2.5 rounded-md text-xs font-semibold ${roomClip?.rid === r.id ? 'bg-green-600 text-white' : 'bg-ink text-white hover:opacity-90'}`} onClick={() => { setRoomClip({ rid: r.id, name: r.ten_phong_vi, items: allL.filter(u => u.r.id === r.id).map(u => [sfx(u.k), C.get(u.k), !!C.det[u.k]]) }); toast(`Đã copy ${r.ten_phong_vi}`); }}>{roomClip?.rid === r.id ? '✓ Đã copy' : 'Copy tổng'}</button></div>
        {unitsOf(r).map(u => { const kid = !!u.f, setL = (i, lk, fn) => C.setAt(u.k, i, x => ({ ...x, l: { ...x.l, [lk]: fn(x.l?.[lk] ?? Array(7).fill('')) } })); return <div key={u.k} className={unitBox(u)}>
          {unitHead(u, kid && <span className="text-xs text-slate-400">{C.follows(u.k) ? 'Đang theo giá B' : 'Đã chỉnh riêng'}</span>)}
          <div className="overflow-x-auto"><div className="min-w-[1180px]">
            <div className="grid grid-cols-[340px_130px_repeat(7,minmax(0,1fr))_168px] gap-2 px-4 pt-1 text-xs font-medium"><span className="py-1.5 text-slate-500">Khoảng ngày</span><span className="py-1.5 text-slate-500">Hạn chế</span>{DAYS.map((d, w) => <span key={d} className={`py-1.5 text-center rounded ${wkHead(w)}`}>{d}</span>)}<span /></div>
            {C.get(u.k).map((rg, i) => { const on = activeWd(rg); return <div key={i} className="border-t border-slate-100 first:border-0">
              {limSel.map((lk, li) => { const [, lab, chk] = LIMITS.find(x => x[0] === lk), vals = rg.l?.[lk] ?? Array(7).fill(''); return <div key={lk} className="grid grid-cols-[340px_130px_repeat(7,minmax(0,1fr))_168px] gap-2 items-center px-4 py-1.5">
                {li === 0 ? <DateIn r={rg} onF={f => C.setAt(u.k, i, x => fixF(x, f), true)} onT={t => C.setAt(u.k, i, x => setT(x, t), true)} /> : <span />}
                <span className="text-sm text-slate-700 truncate" title={lab}>{lab}</span>
                {DAYS.map((_, w) => <div key={w} className={chk ? 'text-center' : ''}>{chk ? <input type="checkbox" className="rounded w-4 h-4 border-slate-400 enabled:shadow-sm disabled:bg-slate-200 disabled:border-slate-200 disabled:opacity-40" disabled={!on[w]} checked={!!vals[w]} onChange={e => setL(i, lk, a => Object.assign([...a], { [w]: e.target.checked }))} />
                  : numIn(vals[w], nv => setL(i, lk, a => Object.assign([...a], { [w]: nv })), '—', false, '', !on[w])}</div>)}
                <RowTools clip={clip} setClip={setClip} on={on} vals={vals} setVals={v => setL(i, lk, () => v)} onDel={li === 0 ? () => C.del(u.k, i) : undefined} /></div>; })}</div>; })}
            <div className="px-4 py-3"><button type="button" className="border border-dashed border-slate-300 rounded-full px-3 py-1 text-xs text-slate-600 hover:border-ink hover:text-ink" onClick={() => C.add(u.k)}>+ Thêm khoảng ngày</button></div></div></div></div>; })}</Card>)
        : <Card><p className="text-center text-slate-400 py-10">Chưa chọn chính sách giá hoặc hạn chế nào.</p></Card>}</div>
      <p className="text-xs text-slate-400 mt-3">Chỉ những ô bạn nhập hoặc tích mới được cập nhật; ô để trống giữ nguyên giá trị hiện có. Giá S theo B cho tới khi bạn chỉnh riêng.</p></>}
  </>;
}
