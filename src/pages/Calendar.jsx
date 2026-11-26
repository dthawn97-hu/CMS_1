import { Fragment, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronsRight, Pencil, Copy as CopyIcon, ClipboardPaste, Trash2, Check, Link2, Unlink, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDB, fmChans, DAYS, ymd, addDays, wd, num, money, availOf, basePrice, smartPrice, limitOf, isOpen, stdPolicy, dayOf, mutDay, eachDay } from '../store.jsx';
import { Btn, Card, H2, Tabs, Seg, MultiSelect, toast } from '../ui.jsx';

const today = ymd(new Date()), fmtD = d => d.split('-').reverse().join('/');
// "Hiển thị thêm": [key, label, type]; keys other than price/stop map to cal[room][day].l (same keys as the Hạn chế tab)
const EXTRAS = [['price', 'Giá bán'], ['stop', 'Ngừng bán', 'bool'], ['maxav', 'Giới hạn bán'], ['cta', 'Không nhận check-in', 'bool'], ['ctd', 'Không nhận check-out', 'bool'],
  ['minthr', 'Số đêm tối thiểu'], ['maxstay', 'Số đêm tối đa'], ['minarr', 'Tối thiểu theo ngày đến']];
const LBL = 'h-10 px-3 sticky left-0 z-10 whitespace-nowrap overflow-hidden text-ellipsis', TD = 'h-10 p-0 text-center align-middle';
const PAL = [{ bg: 'bg-mist-100', bar: 'border-ink', text: 'text-ink', dot: 'bg-ink/50' }]; // neutral navy/slate: policy = grey block, channels inside it // single accent: policy = tinted block, channels inside it
const useMob = () => { const [m, setM] = useState(() => matchMedia('(max-width:767px)').matches); useEffect(() => { const q = matchMedia('(max-width:767px)'), h = () => setM(q.matches); q.addEventListener('change', h); return () => q.removeEventListener('change', h); }, []); return m; };
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
  const { db, commit } = useDB(), nav = useNavigate(), mob = useMob(), c1 = mob ? 96 : 170, c2 = mob ? 150 : 240, dw = mob ? 90 : 100;
  useEffect(() => { document.documentElement.style.overflow = 'hidden'; return () => { document.documentElement.style.overflow = ''; }; }, []); // trang Bán phòng chỉ cuộn trong bảng
  const [quick, setQuick] = useState(null), [view, setView] = useState('channel'); // 'channel' = kênh → chính sách · 'policy' = chính sách → kênh
  const [from, setFrom] = useState(today), [to, setTo] = useState(addDays(today, 13)), [pch, setPch] = useState(() => db.channels[0]?.id), [pend, setPend] = useState({}), [shut, setShut] = useState({});
  const flip = k => setShut(o => ({ ...o, [k]: !o[k] })), Chev = ({ k, down }) => (!(down ?? !shut[k]) ? <ChevronRight className="inline w-3.5 h-3.5 -ml-1 mr-1" /> : <ChevronDown className="inline w-3.5 h-3.5 -ml-1 mr-1" />);
  const [rf, setRf] = useState(() => db.rooms.map(r => r.id)), [cf, setCf] = useState(() => db.channels.map(c => c.id)),
    [pf, setPf] = useState(() => db.policies.map(p => p.id)), [show, setShow] = useState(['price']), [fo, setFo] = useState(false);
  const span = Math.min(62, Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1)), days = Array.from({ length: span }, (_, i) => addDays(from, i)), std = stdPolicy(db);
  const shift = n => { setFrom(addDays(from, n * span)); setTo(addDays(to, n * span)); };
  const chOf = f => fmChans(db, f);
  const edit = (r, p, f, cid, lim) => nav('/bulk', { state: { rid: r.id, pid: p.id, cid, lim, tab: lim || f ? 'limit' : 'price' } }), EditBtn = ({ r, p, f, cid, lim, keep }) => <button type="button" title="Chỉnh sửa trong Cập nhật hàng loạt" className={`${keep ? '' : 'max-md:hidden '}ml-1.5 align-middle text-slate-400 hover:text-ink`} onClick={e => { e.stopPropagation(); edit(r, p, f, cid, lim); }}><Pencil className="inline w-3.5 h-3.5" /></button>;
  const rooms = db.rooms.filter(r => rf.includes(r.id)),
    groups = db.policies.filter(p => pf.includes(p.id)).map(p => { const f = db.formulas.find(x => x.active && x.s === p.ten_chinh_sach_gia);
      return { p, f, chans: (f ? chOf(f) : p.id === std?.id ? db.channels.map(c => c.id) : []).filter(id => (view === 'channel' ? cf.includes(id) : id === pch)) }; }).filter(g => (g.f || g.p.id === std?.id) && (view === 'channel' || g.chans.length));
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
      ? <span title="Giá Liên Kết — tự tính từ B, không chỉnh sửa" className={`block leading-10 cursor-default ${open ? '' : 'text-red-800'}`}>{money(smartPrice(db, f, r, d, cid, p.id))}</span>
      : <button type="button" title="Bấm để chỉnh sửa" onClick={() => setQuick({ r, p, cid, d })} className={`block w-full h-10 font-semibold hover:bg-white/70 hover:ring-1 hover:ring-inset hover:ring-ink/30 ${open ? '' : 'text-red-800'}`}>{money(basePrice(db, r, d, cid))}</button>)}</td>; });
  const extraTds = (r, p, cid, k, type) => days.map(d => {
    if (k === 'stop') { const key = `${r.id}|${d}|s|${p.id}@${cid}`, open = openOf(r, d, cid, p.id);
      return <td key={d} className={`${TD} ${tint(r, d)}`}><button type="button" title={open ? 'Đang mở bán — bấm để ngừng bán' : 'Đang ngừng bán — bấm để mở bán'} className="w-full h-10 grid place-items-center" onClick={() => setP(key, !open)}>
        {open ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}</button></td>; }
    const key = `${r.id}|${d}|l|${k}@${cid}@${p.id}`;
    return <td key={d} className={`${TD} ${tint(r, d)}`}>{type === 'bool'
      ? <input type="checkbox" className="rounded align-middle" checked={!!val(key, !!limitOf(db, r, d, k, cid, p.id))} onChange={e => setP(key, e.target.checked)} />
      : cell(key, limitOf(db, r, d, k, cid, p.id) ?? '', '', '—')}</td>; });
  const badge = f => <span className={`mr-1.5 px-1.5 rounded text-white text-[11px] ${f ? 'bg-slate-500' : 'bg-ink'}`} title={f ? 'Giá Liên Kết: tính từ B' : 'Giá gốc'}>{f ? 'S' : 'B'}</span>;
  const save = async () => {
    const keys = Object.keys(pend); if (!keys.length) return toast('Không có thay đổi');
    const cal = structuredClone(db.cal);
    keys.forEach(key => { const [r, d, k, x] = key.split('|'), c = mutDay(cal, r, d), v = pend[key];
      if (k === 'a') c.a = num(v); else if (k === 'p') c.p[x] = num(v); else if (k === 'l') c.l[x] = typeof v === 'boolean' ? v : num(v);
      else c.s[x] = !v; });
    await commit('cal', cal); setPend({}); toast(`Đã lưu ${keys.length} thay đổi`);
  };
  const ch = view === 'channel', lead = mob ? 88 : ch ? c1 + c2 : 340; // điện thoại: cột tên chỉ ~1/4 màn, nhường chỗ cho các ngày
  return <div className="h-[calc(100dvh-80px)] sm:h-[calc(100dvh-96px)] lg:h-[calc(100vh-125px)] flex flex-col min-w-0 max-w-full overflow-x-hidden">
    <div className="flex items-center gap-2 lg:gap-3 mb-3 flex-wrap"><Seg className="max-md:basis-full" value={view} onChange={setView} items={[["channel", "Theo kênh"], ["policy", "Theo chính sách giá"]]} /><span className="w-px h-6 bg-slate-200 mx-1 max-md:hidden" />
      <Btn kind="ghost" className="max-md:hidden" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Btn>
      <div className="flex items-center gap-2 max-md:flex-1 max-md:min-w-0 max-md:order-1 max-md:gap-0 max-md:border max-md:border-slate-200 max-md:bg-white max-md:rounded-lg max-md:px-1"><input type="date" onClick={e => mob && e.currentTarget.showPicker?.()} className="field !w-40 max-md:!w-auto max-md:flex-1 max-md:min-w-[84px] max-md:!px-1.5 max-md:!text-[13px] max-md:[&::-webkit-calendar-picker-indicator]:hidden max-md:!border-0 max-md:!bg-transparent max-md:!shadow-none !py-2" value={from} onChange={e => { if (!e.target.value) return; setFrom(e.target.value); if (to < e.target.value) setTo(addDays(e.target.value, 13)); }} />
      <span className="text-slate-400">→</span>
      <input type="date" onClick={e => mob && e.currentTarget.showPicker?.()} className="field !w-40 max-md:!w-auto max-md:flex-1 max-md:min-w-[84px] max-md:!px-1.5 max-md:!text-[13px] max-md:[&::-webkit-calendar-picker-indicator]:hidden max-md:!border-0 max-md:!bg-transparent max-md:!shadow-none !py-2" value={to} min={from} max={addDays(from, 61)} onChange={e => e.target.value && setTo(e.target.value)} /></div>
      <Btn kind="ghost" className="max-md:hidden" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Btn>
      <button type="button" className="font-medium max-md:hidden" onClick={() => { setFrom(today); setTo(addDays(today, 13)); }}>Hôm nay</button>
      <span className="text-slate-400 max-md:hidden">{to > addDays(from, 61) ? "tối đa 62 ngày" : ""}</span><div className="flex-1 max-md:hidden" />
      <Btn kind="ghost" className="max-md:order-2 max-md:!px-3" onClick={() => setPend({})}>Hoàn tác</Btn><Btn className="max-md:order-2 max-md:!px-4" onClick={save}><span className="md:hidden">Lưu</span><span className="max-md:hidden">Lưu thay đổi</span></Btn></div>
    <div className={`${''}grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-3`}>
      <MultiSelect inline className="min-w-0" label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} />
      {ch ? <MultiSelect inline className="min-w-0" label="Kênh bán" opts={db.channels.map(c => [c.id, c.name])} value={cf} onChange={setCf} />
        : <label className="flex items-center gap-2 text-sm"><span className="text-slate-500 whitespace-nowrap max-md:hidden">Kênh bán</span><select className="field !py-2 max-md:pr-8" value={pch} onChange={e => setPch(e.target.value)}>{db.channels.map(c => <option key={c.id} value={c.id}>{mob ? `Kênh bán: ${c.name}` : c.name}</option>)}</select></label>}
      <MultiSelect inline className="min-w-0" label="Chính sách giá" opts={db.policies.map(p => [p.id, p.ten_chinh_sach_gia])} value={pf} onChange={setPf} />
      <MultiSelect inline className="min-w-0" label="Hiển thị thêm" opts={EXTRAS.map(([k, l]) => [k, l])} value={show} onChange={setShow} /></div>
    <Card className="flex-1 min-h-0 flex flex-col overflow-hidden"><div className="overscroll-none overflow-auto flex-1 min-h-0"><table className="table-fixed border-collapse" style={{ width: lead + span * dw }}>
      <colgroup>{ch && !mob ? <><col style={{ width: c1 }} /><col style={{ width: c2 }} /></> : <col style={{ width: lead }} />}{days.map(d => <col key={d} style={{ width: dw }} />)}</colgroup>
      <thead><tr className="text-sm text-slate-500">
        <th colSpan={ch && !mob ? 2 : 1} className="h-14 px-3 text-left font-medium sticky left-0 top-0 z-40 bg-white">{ch ? 'KÊNH / CHỈ SỐ' : 'LOẠI PHÒNG / CHỈ SỐ'}</th>
        {days.map(d => <th key={d} title={d === today ? 'Hôm nay' : wd(d) > 4 ? 'Thứ 7, CN' : undefined} className={`font-medium sticky top-0 z-30 ${d === today ? 'bg-cyan-100 text-brand-dark' : wd(d) > 4 ? 'bg-amber-100 text-amber-700' : 'bg-white'}`}>{DAYS[wd(d)]}<div className={`text-base font-semibold ${wd(d) > 4 ? '' : 'text-ink'}`}>{+d.slice(8)}</div></th>)}</tr></thead>
      <tbody className="text-sm max-md:text-xs">{rooms.map(r => <Fragment key={r.id}>
        <tr className="md:hidden border-t-2 border-slate-300"><td className="px-1.5 py-0.5 sticky left-0 z-10 bg-slate-100 text-[10px] leading-tight font-semibold text-slate-600">{r.ten_phong_vi}</td>{days.map(d => <td key={d} className={`${TD} bg-slate-100 h-7 text-xs font-semibold ${sold(r, d) ? 'text-red-700' : 'text-ink'}`}>{availOf(db, r, d)}</td>)}</tr>
        <tr className="sticky top-[52px] z-20 border-t-2 border-slate-300 bg-white shadow-[0_1px_0_#cbd5e1] max-md:hidden"><td colSpan={ch && !mob ? 2 : 1} className={`${LBL} bg-white cursor-pointer select-none max-md:whitespace-normal max-md:px-1.5 max-md:text-[11px] max-md:leading-tight`} onClick={() => flip(ch ? 'c' + r.id : r.id)}><Chev k={r.id} down={ch ? !!shut['c' + r.id] : !shut[r.id]} /><b className="text-ink text-[15px] max-md:text-xs">{r.ten_phong_vi}</b> <span className="text-slate-500">· {r.so_luong_phong} phòng</span><button type="button" title="Cập nhật phòng trống hàng loạt" className="ml-1.5 align-middle text-slate-400 hover:text-ink max-md:hidden" onClick={e => { e.stopPropagation(); nav('/bulk', { state: { rid: r.id, tab: 'avail' } }); }}><Pencil className="inline w-3.5 h-3.5" /></button></td>
          {days.map(d => { const a = availOf(db, r, d), k = `${r.id}|${d}|a`; return <td key={d} title={sold(r, d) ? 'Hết phòng' : undefined} className={`${TD} `}>{cell(k, a, sold(r, d) ? 'text-red-700 font-bold' : 'font-semibold')}</td>; })}</tr>
        {(shut['c' + r.id] || mob) && ch && db.channels.filter(c => cf.includes(c.id)).map(c => { const gs = groups.filter(g => g.chans.includes(c.id)), rows = gs.length * (1 + extras.length);
          return gs.map(({ p, f }, gi) => <Fragment key={c.id + p.id}>
            <tr className={gi === 0 ? 'border-t border-slate-300' : 'border-t border-slate-100'}>
              {gi === 0 && !mob && <td rowSpan={rows} className="sticky left-0 z-10 bg-white align-top px-3 max-md:px-2 py-2 border-r border-slate-200"><div className="flex items-center gap-1.5"><b className="text-[15px] max-md:text-xs break-words text-slate-800">{c.name}</b><span title={c.connected ? 'Đã kết nối' : 'Chưa kết nối'} className="shrink-0 max-md:hidden">{c.connected ? <Link2 className="w-4 h-4 text-brand-dark" /> : <Unlink className="w-4 h-4 text-slate-300" />}</span></div></td>}
              <td onClick={() => mob && edit(r, p, f, c.id)} style={{ left: mob ? 0 : c1 - 1 }} className="h-10 px-3 sticky z-10 bg-white whitespace-nowrap max-md:whitespace-normal max-md:h-14 max-md:leading-[1.15] max-md:px-1.5 max-md:text-[11px] max-md:break-words overflow-hidden text-ellipsis border-r border-slate-100">{badge(f)}<span className={mob && gi === 0 ? 'font-bold text-ink' : 'font-medium'}>{mob && gi === 0 ? c.name : 'Giá bán'}</span><EditBtn r={r} p={p} f={f} cid={c.id} /><span className="text-slate-400 max-md:block max-md:text-[10px]"><span className="md:hidden">{p.ten_chinh_sach_gia}</span><span className="max-md:hidden"> · {p.ten_chinh_sach_gia}</span></span></td>
              {priceTds(r, p, f, c.id)}</tr>
            {extras.map(([k, label, type]) => <tr key={k} className="border-t border-slate-100"><td onClick={() => mob && edit(r, p, f, c.id, k)} style={{ left: mob ? 0 : c1 - 1 }} className="h-10 px-3 sticky z-10 bg-white text-slate-600 whitespace-nowrap max-md:whitespace-normal max-md:h-14 max-md:leading-[1.15] max-md:px-1.5 max-md:text-[11px] border-r border-slate-100">{label}<EditBtn r={r} p={p} f={f} cid={c.id} lim={k} /></td>{extraTds(r, p, c.id, k, type)}</tr>)}
          </Fragment>); })}
        {(!shut[r.id] || mob) && !ch && groups.map(({ p, f, chans }, gi) => { const c = PAL[gi % PAL.length]; return <Fragment key={p.id}>
          <tr className={`border-t border-slate-200 ${c.bg}`}><td className={`${LBL} ${c.bg} border-l-4 max-md:border-l-2 ${c.bar} ${c.text} font-bold cursor-pointer select-none`} onClick={() => flip(r.id + p.id)}><Chev k={r.id + p.id} /><span className="max-md:inline-block max-md:max-w-[78px] max-md:truncate max-md:align-bottom">{p.ten_chinh_sach_gia}</span> <span className={`ml-1.5 px-1.5 rounded text-white text-[11px] ${f ? 'bg-slate-500' : 'bg-ink'}`} title={f ? 'Giá Liên Kết: tính từ B' : 'Giá gốc'}>{f ? 'S' : 'B'}</span><EditBtn keep r={r} p={p} f={f} cid={pch} /></td>
            {days.map(d => <td key={d} />)}</tr>
          {!shut[r.id + p.id] && chans.map(cid => <Fragment key={cid}>
            <tr className="border-t border-slate-100"><td className={`${LBL} bg-white border-l-4 max-md:border-l-2 ${c.bar} pl-6`}><span className={`inline-block w-2 h-2 rounded-full mr-2 ${c.dot}`} /><b className="font-semibold text-slate-800">{db.channels.find(x => x.id === cid).name}</b></td>{priceTds(r, p, f, cid)}</tr>
            {extras.map(([k, label, type]) => <tr key={k} className="border-t border-slate-100"><td onClick={() => mob && edit(r, p, f, cid, k)} className={`${LBL} bg-white border-l-4 max-md:border-l-2 ${c.bar} pl-10 text-slate-500`}>└ {label}<EditBtn r={r} p={p} f={f} cid={cid} lim={k} /></td>{extraTds(r, p, cid, k, type)}</tr>)}
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
    del: (k, i) => { detach(k); set(k, rs => rs.filter((_, j) => j !== i)); },
    copyAll: k => setRR(prev => { const out = { ...prev }; keys.forEach(o => { if (o !== k) out[o] = copyRows(prev[k] ?? [newRow()]); }); return out; }),
    put: items => { setRR(prev => { const out = { ...prev }; items.forEach(([k, rows]) => { out[k] = copyRows(rows); }); return out; }); setDet(d => { const o = { ...d }; items.forEach(([k, , f]) => { if (f) o[k] = true; else delete o[k]; }); return o; }); } };
}
const LIMITS = [['stop', 'Ngừng bán', 1], ['cta', 'Không nhận check-in', 1], ['ctd', 'Không nhận check-out', 1], ['maxav', 'Giới hạn bán'], ['minthr', 'Số đêm tối thiểu'], ['maxstay', 'Số đêm tối đa'], ['minarr', 'Tối thiểu theo ngày đến']];

export function Bulk() {
  const { db, commit } = useDB(), go = useLocation().state, mob = useMob();
  const [tab, setTab] = useState(go?.tab || 'avail'), [sub, setSub] = useState('dow');
  const [rf, setRf] = useState(() => go?.rid ? [go.rid] : db.rooms.map(r => r.id)), [cf, setCf] = useState(() => go?.cid ? [go.cid] : db.channels.map(c => c.id)), [pf, setPf] = useState(() => go?.pid ? [go.pid] : db.policies.map(p => p.id));
  const [from, setFrom] = useState(today), [to, setTo] = useState(addDays(today, 29)), [pFrom, setPFrom] = useState(today), [pTo, setPTo] = useState(addDays(today, 364)), [dowR, setDowR] = useState({}), [shutG, setShutG] = useState({}), [limSel, setLimSel] = useState([go?.lim || 'stop']), [roomClip, setRoomClip] = useState(null);
  // Phòng trống: khoảng ngày dùng chung (đặt ở hạng phòng đầu tiên), số lượng riêng cho từng hạng phòng
  const [risk, setRisk] = useState(null), [agree, setAgree] = useState(false), [clip, setClip] = useState(null), [mode, setMode] = useState('config'), [shut, setShut] = useState({}), [ovF, setOvF] = useState(today), [ovT, setOvT] = useState(addDays(today, 8));
  const std = stdPolicy(db), ovN = Math.min(31, Math.max(1, Math.round((new Date(ovT) - new Date(ovF)) / 864e5) + 1)), ovDays = Array.from({ length: ovN }, (_, i) => addDays(ovF, i));
  const shiftOv = n => { setOvF(addDays(ovF, n * ovN)); setOvT(addDays(ovT, n * ovN)); };
  const chOf = f => fmChans(db, f);
  // B = giá gốc (gắn mọi kênh), S = giá liên kết (chỉ kênh của nó, tự tính nên không cập nhật giá hàng loạt)
  const groups = db.policies.map(p => { const f = db.formulas.find(x => x.active && x.s === p.ten_chinh_sach_gia); return { p, f, chans: f ? chOf(f) : p.id === std?.id ? db.channels.map(c => c.id) : [] }; }).filter(g => g.f || g.p.id === std?.id);
  const optG = groups, pfv = pf.filter(id => optG.some(g => g.p.id === id));
  const rooms = db.rooms.filter(r => rf.includes(r.id));
  const targets = rooms.flatMap(r => optG.filter(g => pfv.includes(g.p.id)).flatMap(g => g.chans.filter(c => cf.includes(c)).map(cid => ({ r, p: g.p, cid }))));
  const [F, T] = tab === 'price' ? [pFrom, pTo] : [from, to], nDays = F && T && T >= F ? Math.round((new Date(T) - new Date(F)) / 864e5) + 1 : 0;
  const needDates = tab === 'limit' || (tab === 'price' && sub === 'dow');
  const cntCh = new Set(targets.map(t => t.cid)).size, cntPo = new Set(targets.map(t => t.p.id)).size;
  const pms = r => r.so_luong_phong; // Phòng trống PMS: số phòng của hạng phòng, không bị cập nhật hàng loạt thay đổi
    // Giá S (liên kết) kế thừa giá B: các công thức có gói cơ sở C = chính sách giá này
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
  const sCell = t => <div className="field !py-2 text-right max-md:!text-center max-md:!px-1 bg-slate-50 text-slate-600 !border-slate-200 min-h-[38px]">{t || '—'}</div>;
  const sShow = (f, b) => b === '' || b == null ? '' : money(Math.round(calcS(f, +b)));
  const sBody = u => { const pkey = pk(u.k), bv = dowR[pkey] ?? [];
    return sub === 'dow'
      ? <div className="grid grid-cols-[repeat(7,1fr)_168px] gap-2 px-4 pb-3">{DAYS.map((d, w) => <label key={d}><span className={`block text-center text-xs font-medium rounded py-1 mb-1 ${wkHead(w)}`}>{d}</span>{sCell(sShow(u.f, bv[w]))}</label>)}<span /></div>
      : <div className="overflow-x-auto"><div className="md:min-w-[1180px]"><div className="max-md:hidden"><DayHead /></div>
          {B.get(pkey).map((rg, i) => <div key={i} className={`${GRID} items-center px-4 py-1.5 max-md:grid-cols-4 max-md:gap-1.5 max-md:py-3 [&_input]:!bg-slate-50 [&_input]:!border-slate-200 [&_input]:!text-slate-600 [&_input]:!opacity-100`}><div className="max-md:col-span-4"><DateIn r={rg} locked onF={() => {}} onT={() => {}} /></div>{rg.v.map((x, w) => <div key={w}><span className={`md:hidden block text-center text-[11px] font-medium rounded py-0.5 mb-1 ${wkHead(w)}`}>{DAYS[w]}</span>{sCell(activeWd(rg)[w] ? sShow(u.f, x) : '')}</div>)}<span className="max-md:hidden" /></div>)}<div className="h-2" /></div></div>; };
  // Giá năm: mỗi giá B / S là một dòng ngang: thông tin bên trái, 7 ô theo thứ bên phải (S là giá tính ra, không nhập)
  const DG = 'grid grid-cols-[380px_repeat(7,minmax(0,1fr))_168px] gap-2 items-center px-4 py-2.5 max-md:grid-cols-4 max-md:gap-1.5 max-md:px-3 max-md:py-3';
  const dowRow = (u, v) => { const bv = dowR[pk(u.k)] ?? [], c = cards.find(x => x.k === u.k); return <div key={u.k} className={`${unitBox(u)} ${DG}`}>
    <div className={`min-w-0 max-md:row-start-1 ${u.f ? 'max-md:col-span-4' : 'max-md:col-span-2'}`}><div className="flex flex-wrap items-center gap-2">{!u.f && toggle(c, kids(c))}
      <span className={`inline-grid place-items-center w-5 h-5 rounded text-[11px] font-bold ${u.f ? 'bg-slate-200 text-slate-600' : 'bg-ink text-white'}`}>{u.f ? 'S' : 'B'}</span><span className="font-medium">{u.name}</span>{chanBadge(u.chs)}</div>
      </div>
    {DAYS.map((d, w) => <div key={w}><span className={`md:hidden block text-center text-[11px] font-medium rounded py-0.5 mb-1 ${wkHead(w)}`}>{d}</span>{u.f ? sCell(sShow(u.f, bv[w])) : numIn(v[w] ?? '', nv => setDowR(o => ({ ...o, [u.k]: Object.assign(Array(7).fill(''), o[u.k], { [w]: nv }) })), '—', true, 'max-md:!text-center max-md:!px-1')}</div>)}
    {u.f ? <span className="max-md:hidden" /> : <div className="max-md:row-start-1 max-md:col-start-3 max-md:col-span-2 max-md:flex max-md:justify-end"><RowTools clip={clip} setClip={setClip} on={Array(7).fill(true)} vals={v} setVals={nv => setDowR(o => ({ ...o, [u.k]: nv }))} /></div>}</div>; };
  const ROOMHEAD = 'flex items-center px-4 py-2.5 bg-mist-200 rounded-t-xl', unitBox = u => `border-t ${u.f ? 'ml-4 border-l-4 border-l-slate-300 bg-slate-50/60' : 'border-slate-200'}`;
  // Cách hiển thị chung của giá B / S ở cả tab Giá và Hạn chế: [mũi tên] [B|S] tên · nhãn công thức · kênh · công thức
  const unitHead = (u, right) => { const c = cards.find(x => x.k === pk(u.k)); return <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">{!u.f && toggle(c, kids(c))}
    <span className={`inline-grid place-items-center w-5 h-5 rounded text-[11px] font-bold ${u.f ? 'bg-slate-200 text-slate-600' : 'bg-ink text-white'}`}>{u.f ? 'S' : 'B'}</span><span className="font-medium">{u.name}</span>
    {chanBadge(u.chs)}
    <div className="flex-1" />{right}</div>; };
  const roomsOf = () => rooms.filter(r => cards.some(c => c.r.id === r.id)), unitsOf = r => cards.filter(c => c.r.id === r.id).flatMap(limUnits).filter(u => !u.f || !shutG[pk(u.k)]);

  const apply = async agreed => {
    const cal = structuredClone(db.cal); let n = 0, ok = true;
    if (tab === 'avail') {
      for (const r of rooms) for (const rg of A.get(r.id)) { const v = rg.v.map(x => num(x) ?? (mode === 'all' ? pms(r) : null)); if (v.every(x => x === null)) continue;
        const cap = Math.floor(pms(r) * 1.5), big = v.find(x => x !== null && x > cap); if (big !== undefined) { toast(`${r.ten_phong_vi}: Bán (OTA) ${big} vượt mức tối đa ${cap} (1,5 lần số phòng ${pms(r)})`, true); return; }
        const over = v.find(x => x !== null && x > pms(r)); if (over !== undefined && agreed !== true) { setRisk({ room: r.ten_phong_vi, over, max: pms(r) }); return; }
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
    setRisk(null); setAgree(false); await commit('cal', cal); toast(`Đã cập nhật ${n} ô`);
  };
  const noTarget = tab !== 'avail' && !targets.length || tab === 'avail' && !rooms.length;
  const summary = tab === 'avail' ? `${rooms.length} hạng phòng` : `${rooms.length} phòng × ${cntCh} kênh × ${cntPo} chính sách = ${targets.length} ô` + (needDates ? ` · ${nDays} ngày` : '');
  return <>
    {risk && <div className="fixed inset-0 z-[70] grid place-items-center max-md:place-items-end bg-slate-900/40 anim-fade" onClick={() => { setRisk(null); setAgree(false); }}><div className="w-[480px] max-w-[92vw] max-md:!max-w-none max-md:!w-full bg-white rounded-2xl max-md:rounded-b-none shadow-2xl p-6 anim-pop" onClick={e => e.stopPropagation()}>
      <h3 className="font-serif text-lg font-bold text-ink">Cảnh báo rủi ro bán vượt phòng</h3>
      <p className="mt-2 text-slate-600">Số lượng bán bạn nhập cho <b>{risk.room}</b> ({risk.over}) lớn hơn số phòng hiện có ({risk.max}). Vui lòng lưu ý:</p>
      <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-600"><li>Bán vượt số phòng có thể dẫn đến <b>overbooking</b>: khách đã đặt nhưng không đủ phòng.</li><li>Phát sinh chi phí chuyển khách, bồi thường khách.</li><li>Có thể bị kênh bán phạt và ảnh hưởng uy tín khách sạn.</li><li>Bellhop không chịu trách nhiệm đối với mọi rủi ro, tổn thất hoặc khiếu nại phát sinh từ việc bán vượt số phòng này.</li></ul>
      <label className="mt-4 flex items-start gap-2.5 cursor-pointer font-medium text-ink"><input type="checkbox" className="mt-1 w-4 h-4 accent-[#0b2a4a]" checked={agree} onChange={e => setAgree(e.target.checked)} />Tôi đã đọc, hiểu rõ rủi ro và đồng ý tự chịu trách nhiệm.</label>
      <div className="mt-6 flex justify-end gap-2 max-md:[&>button]:flex-1"><Btn kind="ghost" onClick={() => { setRisk(null); setAgree(false); }}>Huỷ</Btn><Btn disabled={!agree} onClick={() => apply(true)}>Đồng ý cập nhật</Btn></div></div></div>}
    <Tabs value={tab} onChange={setTab} items={[['avail', 'Phòng trống'], ['price', 'Giá'], ['limit', 'Hạn chế']]} />
    {tab === 'avail' && <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-4"><MultiSelect label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} /></div>
      <Card className="mb-5">
        <div className="p-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-b"><span className="text-slate-500 max-md:order-1">Cấu hình bán</span>
          <div className="flex items-center gap-6 max-md:order-3 max-md:basis-full max-md:grid max-md:grid-cols-2 max-md:gap-2">{[['config', 'Bán theo cấu hình', 'Cấu hình'], ['all', 'Bán hết các phòng đang còn', 'Số phòng tồn']].map(([k, l, m]) => <label key={k} className={`inline-flex items-center gap-2 max-md:justify-center max-md:text-center max-md:rounded-lg max-md:border max-md:px-2 max-md:py-2.5 max-md:text-[13px] max-md:font-medium ${mode === k ? 'max-md:bg-ink max-md:text-white max-md:border-ink' : 'max-md:bg-white max-md:border-slate-200'}`}><input type="radio" className="max-md:sr-only" checked={mode === k} onChange={() => setMode(k)} /><span className="md:hidden">{m}</span><span className="max-md:hidden">{l}</span></label>)}</div>
          </div>
        <div className="p-4"><div className="flex items-center gap-2 mb-3">
          <Btn kind="ghost" className="!px-2.5 !py-1.5" onClick={() => shiftOv(-1)}><ChevronLeft className="w-4 h-4" /></Btn>
          <input type="date" className="field !w-44 max-md:!w-auto max-md:flex-1 max-md:min-w-0 max-md:!px-2 max-md:!text-[13px] !py-1.5" value={ovF} onChange={e => { if (!e.target.value) return; setOvF(e.target.value); if (ovT < e.target.value) setOvT(addDays(e.target.value, 8)); }} /><span className="text-slate-400">→</span>
          <input type="date" className="field !w-44 max-md:!w-auto max-md:flex-1 max-md:min-w-0 max-md:!px-2 max-md:!text-[13px] !py-1.5" value={ovT} min={ovF} max={addDays(ovF, 30)} onChange={e => e.target.value && setOvT(e.target.value)} />
          <Btn kind="ghost" className="!px-2.5 !py-1.5" onClick={() => shiftOv(1)}><ChevronRight className="w-4 h-4" /></Btn><span className="text-slate-400 ml-1 max-md:hidden">{ovN} ngày{ovT > addDays(ovF, 30) ? ' (tối đa 31)' : ''}</span></div>
          <div className="overflow-x-auto"><table className="w-full text-center text-sm table-fixed" style={{ minWidth: (mob ? 130 : 370) + ovN * (mob ? 56 : 64) }}><colgroup><col style={{ width: mob ? 130 : 220 }} />{!mob && <col style={{ width: 150 }} />}{ovDays.map(d => <col key={d} />)}</colgroup><tbody>
            <tr className="text-xs text-slate-500"><td className="sticky left-0 z-10 bg-white text-left font-semibold px-2">{mob && 'Hạng phòng'}</td>{!mob && <td style={{ left: 220 }} className="sticky z-10 bg-white" />}{ovDays.map(d => <td key={d} className={`py-1.5 ${wd(d) > 4 ? 'bg-amber-100 text-amber-700' : ''}`}>{DAYS[wd(d)]}<div className="text-base font-semibold text-ink">{+d.slice(8)}</div><div className="text-[11px] max-md:hidden">Tháng {+d.slice(5, 7)}</div></td>)}</tr>
            {rooms.map(r => [
              <tr key={r.id} className="border-t"><td rowSpan={2} className="sticky left-0 z-10 bg-white text-left py-2 pr-3 max-md:px-2 align-middle font-medium max-md:text-xs max-md:leading-snug">{r.ten_phong_vi} <span className="text-slate-400 font-normal max-md:block">({mob ? r.ma_hang_phong : `Mã: ${r.ma_hang_phong}`})</span></td>{!mob && <td style={{ left: 220 }} className="sticky z-10 bg-white border-r border-slate-100 text-left text-slate-600">Bán (OTA)</td>}
                {ovDays.map(d => { const a = availOf(db, r, d); return <td key={d} className={`h-9 ${a == 0 ? 'bg-red-100' : wd(d) > 4 ? 'bg-amber-50' : ''}`}><span className={`inline-block min-w-8 rounded px-2 py-0.5 font-semibold ${a == 0 ? 'text-red-700 bg-red-200' : 'bg-slate-100 max-md:bg-brand/15 max-md:text-brand-dark'}`}>{a}</span></td>; })}</tr>,
              <tr key={r.id + 'p'} className="border-t border-slate-100">{!mob && <td style={{ left: 220 }} className="sticky z-10 bg-white border-r border-slate-100 text-left text-slate-400">Phòng trống PMS</td>}{ovDays.map(d => <td key={d} className={`h-9 text-slate-400 ${wd(d) > 4 ? 'bg-amber-50' : ''}`}>{pms(r)}</td>)}</tr>])}
          </tbody></table></div><div className="md:hidden flex items-center gap-4 pt-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand/20" />Bán (OTA)</span><span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-200" />Phòng trống PMS</span></div></div></Card>
      {<div className="space-y-3">{rooms.map(r => <Card key={r.id}>
            <button type="button" className="w-full flex items-center flex-wrap gap-2 px-4 py-3 text-left" onClick={() => setShut(o => ({ ...o, [r.id]: !o[r.id] }))}>
              {shut[r.id] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}<b className="font-serif text-base">{r.ten_phong_vi}</b>
              <span className="text-xs rounded-full border px-2 py-0.5 text-slate-500">Phòng trống PMS tối đa {pms(r)}</span>
              {A.follows(r.id) && <span className="ml-auto max-md:ml-6 max-md:basis-full text-xs text-slate-400">Đang theo ngày của hạng phòng đầu tiên · sửa ngày để tách riêng</span>}</button>
            {!shut[r.id] && <div className="overflow-x-auto border-t"><div className="md:min-w-[1180px]"><div className="max-md:hidden"><DayHead /></div>
              {A.get(r.id).map((rg, i) => <div key={i} className={`${GRID} items-center px-4 py-1.5 max-md:grid-cols-7 max-md:gap-1.5 max-md:py-3`}>
                <span className="md:hidden col-span-7 row-start-1 text-xs text-slate-500">Khoảng ngày</span><div className="max-md:col-span-7 max-md:row-start-2"><DateIn r={rg} onF={f => A.setAt(r.id, i, x => fixF(x, f), true)} onT={t => A.setAt(r.id, i, x => setT(x, t), true)} /></div>
                <span className="md:hidden col-span-3 row-start-3 self-center text-xs text-slate-500 mt-2">Số lượng theo thứ</span>{rg.v.map((v, w) => <div key={w}><span className={`md:hidden block text-center text-[11px] font-medium rounded py-0.5 mb-1 ${wkHead(w)}`}>{DAYS[w]}</span>{numIn(v, nv => A.setAt(r.id, i, x => ({ ...x, v: x.v.map((y, z) => z === w ? nv : y) })), mode === 'all' ? String(pms(r)) : '—', false, 'max-md:!text-center max-md:!px-1', !activeWd(rg)[w])}</div>)}
                <div className="max-md:col-start-4 max-md:col-span-4 max-md:row-start-3 max-md:flex max-md:justify-end max-md:mt-2"><RowTools clip={clip} setClip={setClip} on={activeWd(rg)} vals={rg.v} setVals={v => A.setAt(r.id, i, x => ({ ...x, v }))} onDel={() => A.del(r.id, i)} /></div></div>)}
              <div className="px-4 py-3"><button type="button" className="border border-dashed border-slate-300 rounded-full px-3 py-1 text-xs text-slate-600 hover:border-ink hover:text-ink" onClick={() => A.add(r.id)}>+ Thêm khoảng ngày</button></div></div></div>}</Card>)}
          <div className="flex justify-end max-md:sticky max-md:bottom-0 max-md:z-20 max-md:-mx-3 max-md:px-3 max-md:py-3 max-md:bg-page/90 max-md:backdrop-blur"><Btn className="max-md:w-full" disabled={noTarget} onClick={apply}>Cập nhật</Btn></div></div>}</>}
    {tab === 'price' && <>
      <div className="flex items-center justify-between"><Seg className="max-md:w-full" value={sub} onChange={setSub} items={[['dow', 'Giá năm'], ['day', 'Giá ngày']]} /><span className="max-md:hidden"><Btn disabled={noTarget} onClick={apply}>Cập nhật</Btn></span></div>
      <div className="grid grid-cols-4 max-md:!grid-cols-3 gap-5 max-md:gap-2 my-4 items-end">
        <MultiSelect className="min-w-0" label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} />
        <MultiSelect className="min-w-0" label="Chính sách giá" opts={optG.map(g => [g.p.id, g.p.ten_chinh_sach_gia])} value={pfv} onChange={setPf} />
        <MultiSelect className="min-w-0" label="Kênh bán" opts={db.channels.map(c => [c.id, c.name])} value={cf} onChange={setCf} />
        {sub === 'dow' && <div className="max-md:col-span-3"><span className="lbl">Khoảng ngày áp dụng</span><div className="flex items-center gap-2">
          <input type="date" min={today} className="field max-md:min-w-0 max-md:!px-2 max-md:!text-[13px]" value={pFrom} onChange={e => { if (!e.target.value) return; setPFrom(e.target.value); if (pTo < e.target.value) setPTo(e.target.value); }} /><span className="text-slate-400">–</span>
          <input type="date" min={pFrom || today} className="field max-md:min-w-0 max-md:!px-2 max-md:!text-[13px]" value={pTo} onChange={e => e.target.value && setPTo(e.target.value)} /></div></div>}</div>
      <div className="flex items-center justify-between max-md:justify-end mb-3"><span className="text-xs text-slate-500 max-md:hidden">{sub === 'dow' ? 'Nhập giá B; giá liên kết (S) tự tính theo B và áp dụng cho các kênh được gắn' : 'Nhập giá B theo khoảng ngày; giá liên kết (S) tự tính theo B'}</span>
        <button type="button" className="text-xs font-medium text-brand" onClick={() => setShutG(cards.every(c => shutG[c.k]) ? {} : Object.fromEntries(cards.map(c => [c.k, true])))}>{cards.every(c => shutG[c.k]) ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}</button></div>
      <div className="space-y-3">{cards.length ? roomsOf().map(r => <Card key={r.id}>
        <div className={ROOMHEAD}><span className="font-serif font-bold text-ink">{r.ten_phong_vi}</span></div>
        {sub === 'dow' && <div className={`${DG} !py-1.5 bg-slate-50 text-xs font-semibold border-t border-slate-200 max-md:hidden`}><span className="text-slate-500">Chính sách giá</span>{DAYS.map((d, w) => <span key={d} className={`py-1 text-center rounded ${wkHead(w)}`}>{d}</span>)}<span /></div>}
        {unitsOf(r).map(u => { const c = cards.find(x => x.k === u.k), v = dowR[u.k] ?? Array(7).fill(''); if (sub === 'dow') return dowRow(u, v); return <div key={u.k} className={unitBox(u)}>
          {unitHead(u, !u.f && (sub === 'dow'
            ? null
            : <>{B.follows(u.k) && <span className="text-xs text-slate-400 mr-2 max-md:hidden">theo ngày của thẻ đầu tiên</span>}<button type="button" title="Copy các khoảng ngày và giá của thẻ này sang tất cả thẻ khác" className="h-7 px-2.5 rounded-md bg-ink text-white text-xs font-semibold hover:opacity-90 max-md:hidden" onClick={() => { B.copyAll(u.k); toast('Đã copy sang các thẻ khác'); }}>Copy</button></>))}
          {u.f && sBody(u)}
          {!u.f && (sub === 'dow'
            ? <div className="grid grid-cols-[repeat(7,1fr)_168px] gap-2 items-end px-4 pb-3">{DAYS.map((d, w) => <label key={d}><span className={`block text-center text-xs font-medium rounded py-1 mb-1 ${wkHead(w)}`}>{d}</span>{numIn(v[w] ?? '', nv => setDowR(o => ({ ...o, [u.k]: Object.assign(Array(7).fill(''), o[u.k], { [w]: nv }) })), '—', true)}</label>)}
              <RowTools clip={clip} setClip={setClip} on={Array(7).fill(true)} vals={v} setVals={nv => setDowR(o => ({ ...o, [u.k]: nv }))} /></div>
            : <div className="overflow-x-auto"><div className="md:min-w-[1180px]"><div className="max-md:hidden"><DayHead /></div>
              {B.get(u.k).map((rg, i) => <div key={i} className={`${GRID} items-center px-4 py-1.5 max-md:grid-cols-4 max-md:gap-1.5 max-md:py-3`}>
                <span className="md:hidden col-span-2 row-start-1 self-center text-xs text-slate-500">Khoảng ngày áp dụng</span><div className="max-md:col-span-4 max-md:row-start-2"><DateIn r={rg} onF={f => B.setAt(u.k, i, x => fixF(x, f), true)} onT={t => B.setAt(u.k, i, x => setT(x, t), true)} /></div>
                {rg.v.map((x, w) => <div key={w}><span className={`md:hidden block text-center text-[11px] font-medium rounded py-0.5 mb-1 ${wkHead(w)}`}>{DAYS[w]}</span>{numIn(x, nv => B.setAt(u.k, i, y => ({ ...y, v: y.v.map((z, q) => q === w ? nv : z) })), '—', true, 'max-md:!text-center max-md:!px-1', !activeWd(rg)[w])}</div>)}
                <div className="max-md:row-start-1 max-md:col-start-3 max-md:col-span-2 max-md:flex max-md:justify-end"><RowTools clip={clip} setClip={setClip} on={activeWd(rg)} vals={rg.v} setVals={nv => B.setAt(u.k, i, y => ({ ...y, v: nv }))} onDel={() => B.del(u.k, i)} /></div></div>)}
              <div className="px-4 py-3"><button type="button" className="border border-dashed border-slate-300 rounded-full px-3 py-1 text-xs text-slate-600 hover:border-ink hover:text-ink" onClick={() => B.add(u.k)}>+ Thêm khoảng ngày</button></div></div></div>)}</div>; })}</Card>)
        : <Card><p className="text-center text-slate-400 py-10">Chưa chọn chính sách giá nào.</p></Card>}</div>
      {sub === 'dow' && <p className="text-xs text-slate-400 mt-3 max-md:hidden">{summary}</p>}
      <div className="md:hidden sticky bottom-0 z-20 -mx-3 px-3 py-3 mt-3 bg-page/90 backdrop-blur"><Btn className="w-full" disabled={noTarget} onClick={apply}>Cập nhật</Btn></div></>}
    {tab === 'limit' && <>
      <div className="grid grid-cols-4 max-md:!grid-cols-3 gap-5 max-md:gap-2 mb-4 items-end">
        <MultiSelect className="min-w-0" label="Loại phòng" opts={roomOpts(db)} value={rf} onChange={setRf} />
        <MultiSelect className="min-w-0" label="Chính sách giá" opts={optG.map(g => [g.p.id, g.p.ten_chinh_sach_gia])} value={pfv} onChange={setPf} />
        <MultiSelect className="min-w-0" label="Hạn chế" opts={LIMITS.map(([k, l]) => [k, l])} value={limSel} onChange={setLimSel} />
        <div className="flex justify-end max-md:hidden"><Btn disabled={!allL.length || !limSel.length} onClick={apply}>Cập nhật</Btn></div></div>
      <div className="space-y-3">{cards.length && limSel.length ? roomsOf().map(r => <Card key={r.id}>
        <div className={ROOMHEAD}><span className="font-serif font-bold text-ink">{r.ten_phong_vi}</span><div className="flex-1" />
          {roomClip && roomClip.rid !== r.id && <button type="button" title={`Dán toàn bộ khoảng ngày và hạn chế đã copy từ ${roomClip.name} vào hạng phòng này`} className="h-7 px-2.5 mr-2 rounded-md border border-ink text-ink text-xs font-semibold hover:bg-white max-md:hidden" onClick={() => { const items = allL.filter(u => u.r.id === r.id).flatMap(u => { const m = roomClip.items.find(i => i[0] === sfx(u.k)); return m ? [[u.k, m[1], m[2]]] : []; }); if (!items.length) return toast('Hạng phòng này không có chính sách tương ứng để dán', true); C.put(items); toast(`Đã dán từ ${roomClip.name}`); }}>Dán từ {roomClip.name}</button>}
          <button type="button" title="Copy toàn bộ khoảng ngày và hạn chế của hạng phòng này (B và S) để dán vào một hạng phòng khác" className={`max-md:hidden h-7 px-2.5 rounded-md text-xs font-semibold ${roomClip?.rid === r.id ? 'bg-green-600 text-white' : 'bg-ink text-white hover:opacity-90'}`} onClick={() => { setRoomClip({ rid: r.id, name: r.ten_phong_vi, items: allL.filter(u => u.r.id === r.id).map(u => [sfx(u.k), C.get(u.k), !!C.det[u.k]]) }); toast(`Đã copy ${r.ten_phong_vi}`); }}>{roomClip?.rid === r.id ? '✓ Đã copy' : 'Copy tổng'}</button></div>
        {unitsOf(r).map(u => { const kid = !!u.f, setL = (i, lk, fn) => C.setAt(u.k, i, x => ({ ...x, l: { ...x.l, [lk]: fn(x.l?.[lk] ?? Array(7).fill('')) } })); return <div key={u.k} className={unitBox(u)}>
          {unitHead(u, kid && <span className="text-xs text-slate-400">{C.follows(u.k) ? 'Đang theo giá B' : 'Đã chỉnh riêng'}</span>)}
          <div className="overflow-x-auto"><div className="md:min-w-[1180px]">
            <div className="grid grid-cols-[340px_130px_repeat(7,minmax(0,1fr))_168px] gap-2 px-4 pt-1 text-xs font-medium max-md:hidden"><span className="py-1.5 text-slate-500">Khoảng ngày</span><span className="py-1.5 text-slate-500">Hạn chế</span>{DAYS.map((d, w) => <span key={d} className={`py-1.5 text-center rounded ${wkHead(w)}`}>{d}</span>)}<span /></div>
            {C.get(u.k).map((rg, i) => { const on = activeWd(rg); return <div key={i} className="border-t border-slate-100 first:border-0">
              {limSel.map((lk, li) => { const [, lab, chk] = LIMITS.find(x => x[0] === lk), vals = rg.l?.[lk] ?? Array(7).fill(''); return <div key={lk} className="grid grid-cols-[340px_130px_repeat(7,minmax(0,1fr))_168px] gap-2 items-center px-4 py-1.5 max-md:grid-cols-7 max-md:gap-1.5 max-md:px-3 max-md:py-2">
                {li === 0 ? <><span className="md:hidden col-span-7 row-start-1 text-xs text-slate-500">Khoảng ngày</span><div className="max-md:col-span-7 max-md:row-start-2"><DateIn r={rg} onF={f => C.setAt(u.k, i, x => fixF(x, f), true)} onT={t => C.setAt(u.k, i, x => setT(x, t), true)} /></div></> : <span className="max-md:hidden" />}
                <span className={`text-sm text-slate-700 truncate max-md:col-span-3 max-md:font-medium max-md:self-center ${li === 0 ? 'max-md:row-start-3' : 'max-md:row-start-1'}`} title={lab}>{lab}</span>
                {DAYS.map((_, w) => <div key={w} className={chk ? 'text-center' : ''}><span className={`md:hidden block text-center text-[11px] font-medium rounded py-0.5 mb-1 ${wkHead(w)}`}>{DAYS[w]}</span>{chk ? <input type="checkbox" className="rounded w-4 h-4 border-slate-400 enabled:shadow-sm disabled:bg-slate-200 disabled:border-slate-200 disabled:opacity-40" disabled={!on[w]} checked={!!vals[w]} onChange={e => setL(i, lk, a => Object.assign([...a], { [w]: e.target.checked }))} />
                  : numIn(vals[w], nv => setL(i, lk, a => Object.assign([...a], { [w]: nv })), '—', false, 'max-md:!text-center max-md:!px-1', !on[w])}</div>)}
                <div className={`max-md:col-start-4 max-md:col-span-4 max-md:flex max-md:justify-end ${li === 0 ? 'max-md:row-start-3' : 'max-md:row-start-1'}`}><RowTools clip={clip} setClip={setClip} on={on} vals={vals} setVals={v => setL(i, lk, () => v)} onDel={li === 0 ? () => C.del(u.k, i) : () => setL(i, lk, () => Array(7).fill(''))} /></div></div>; })}</div>; })}
            <div className="px-4 py-3"><button type="button" className="border border-dashed border-slate-300 rounded-full px-3 py-1 text-xs text-slate-600 hover:border-ink hover:text-ink" onClick={() => C.add(u.k)}>+ Thêm khoảng ngày</button></div></div></div></div>; })}</Card>)
        : <Card><p className="text-center text-slate-400 py-10">Chưa chọn chính sách giá hoặc hạn chế nào.</p></Card>}</div>
      <p className="text-xs text-slate-400 mt-3 max-md:hidden">Chỉ những ô bạn nhập hoặc tích mới được cập nhật; ô để trống giữ nguyên giá trị hiện có. Giá S theo B cho tới khi bạn chỉnh riêng.</p>
      <div className="md:hidden sticky bottom-0 z-20 -mx-3 px-3 py-3 mt-3 bg-page/90 backdrop-blur"><Btn className="w-full" disabled={!allL.length || !limSel.length} onClick={apply}>Cập nhật</Btn></div></>}
  </>;
}
