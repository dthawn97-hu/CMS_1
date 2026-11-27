import { useState } from 'react';
import { Check, Info, Pencil, Plus } from 'lucide-react';
import { useCrud } from '../store.jsx';
import { Btn, Card, Tabs, toast } from '../ui.jsx';
import { ROOMS } from './FrontDesk.jsx';

// ponytail: dữ liệu tầng/phòng và gói giá là mẫu trong state trang (chưa có backend) — nối API khi có

/* ---------- Đơn giá + Phòng và Gói bán của từng hạng phòng ---------- */
const PK = [['Giá ngày thường', 'gia_ngay_thuong'], ['Giá cuối tuần', 'gia_cuoi_tuan'], ['Giá ngày lễ', 'gia_ngay_le']];
const PriceBox = ({ r, rm }) => {
  const [d, setD] = useState(() => Object.fromEntries(PK.map(([, k]) => [k, r[k] || 0])));
  return <div className="rounded-xl border bg-white p-4 flex flex-wrap items-end gap-4">{PK.map(([l, k]) => <label key={k} className="block w-48 max-md:w-full"><span className="lbl">{l}</span>
    <div className="relative"><input type="number" min="0" className="field text-right !pr-14" value={d[k]} onChange={e => setD({ ...d, [k]: e.target.value })} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">VND</span></div></label>)}
    <Btn onClick={() => { rm.patch(r.id, Object.fromEntries(PK.map(([, k]) => [k, +d[k] || 0]))); toast('Đã lưu đơn giá'); }}>Lưu đơn giá</Btn></div>;
};
const PLANS = [[['STD', 'Mặc định'], ['ONL T7-CN'], ['OFF T2-T6', 'Tạm dừng'], ['Giá không chỉnh sửa']], [['OFF T2-T6'], ['Giá không chỉnh sửa', 'Tạm dừng']]];
const PlanBox = ({ r, i, m, setM }) => <div className="rounded-xl border bg-white overflow-hidden">
  <div className="grid grid-cols-2 border-b bg-slate-50/60 text-xs font-semibold tracking-wide text-slate-500"><div className="px-4 py-2.5">BELLHOP PMS</div><div className="px-4 py-2.5 border-l">BELLHOP CMS</div></div>
  <div className="grid grid-cols-2"><div className="px-4 py-2.5 font-semibold text-ink">{r.ten_phong_vi} <span className="font-normal text-slate-400 text-sm">({r.ma_hang_phong})</span></div><div className="px-4 py-2.5 border-l font-semibold text-ink flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />{r.ten_phong_vi}</div></div>
  {PLANS[i === 0 ? 0 : 1].map(([n, tag]) => { const k = r.ma_hang_phong + '|' + n; return <div key={n} className="grid grid-cols-2 border-t bg-slate-50/40">
    <div className="pl-8 pr-4 py-2.5 text-sm flex items-center">{n}{tag && <span className={`ml-2 px-2 py-0.5 rounded text-xs ${tag === 'Mặc định' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>{tag}</span>}</div>
    <div className="px-4 py-2 border-l flex items-center justify-between text-sm">{m[k] ? <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">{m[k]}</span> : <span className="text-slate-400 italic">Chưa ghép gói giá CMS</span>}
      <button type="button" title={m[k] ? 'Bỏ ghép' : 'Ghép gói giá CMS'} className="w-9 h-9 grid place-items-center rounded-lg border bg-white hover:bg-slate-50" onClick={() => setM({ ...m, [k]: m[k] ? '' : 'Base ' + new Date().toLocaleDateString('vi-VN') })}>{m[k] ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}</button></div></div>; })}</div>;

/* ---------- Tầng & Phòng ---------- */
const seed = code => Object.values(ROOMS.filter(r => r.type === code).reduce((a, r) => { const n = r.zone.replace('Tầng ', ''); (a[n] ??= { name: n, rooms: [] }).rooms.push(r.no); return a; }, {}));
const Floor = ({ f, onChange }) => {
  const [ed, setEd] = useState(f.name === '' ? 'name' : null), [v, setV] = useState('');
  const done = () => { const t = v.trim(); if (ed === 'name') onChange({ ...f, name: t || f.name || '?' }); else if (t && !f.rooms.includes(t)) onChange({ ...f, rooms: [...f.rooms, t] }); setEd(null); setV(''); };
  const inp = ph => <input autoFocus className="field !h-9 !py-1 !w-32" placeholder={ph} value={v} onChange={e => setV(e.target.value)} onBlur={done} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setV(''); setEd(null); } }} />;
  return <div className="rounded-xl border bg-white"><div className="flex items-center gap-2 px-4 py-2.5 border-b"><span className="font-semibold text-ink flex items-center gap-1.5">{ed === 'name' ? inp('Tên tầng') : <>{f.name}<button type="button" title="Đổi tên tầng" onClick={() => { setV(f.name); setEd('name'); }}><Pencil className="w-3.5 h-3.5 text-slate-400 hover:text-ink" /></button></>}</span><div className="flex-1" />
    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium">{f.rooms.length} phòng</span><button type="button" title="Thêm phòng" className="w-8 h-8 grid place-items-center rounded-lg border hover:bg-slate-50" onClick={() => { setV(''); setEd('room'); }}><Plus className="w-4 h-4" /></button></div>
    <div className="p-4 flex flex-wrap gap-2 items-center">{f.rooms.map(n => <button key={n} type="button" title="Bấm để xoá khỏi tầng" onClick={() => onChange({ ...f, rooms: f.rooms.filter(x => x !== n) })} className="px-4 py-2 rounded-lg border bg-slate-50 font-medium hover:bg-red-50 hover:border-red-200">{n}</button>)}{ed === 'room' && inp('Số phòng')}
      {!f.rooms.length && ed !== 'room' && <span className="text-sm text-slate-400">Chưa có phòng</span>}</div></div>;
};
export function FloorRooms() {
  const rm = useCrud('rooms'), [sel, setSel] = useState('all'), [tab, setTab] = useState('rooms'), [fl, setFl] = useState({}), [pm, setPm] = useState({ 'DLX|STD': 'Base 12/11/2026' }), get = c => fl[c] ?? seed(c), put = (c, a) => setFl({ ...fl, [c]: a }),
    total = rm.list.reduce((a, r) => a + (+r.so_luong_phong || 0), 0), rooms = tab === 'rooms', types = rm.list.filter(r => !rooms || sel === 'all' || r.id === sel);
  return <><div className="-mb-1"><Tabs items={[['rooms', 'Phòng/Giường'], ['price', 'Đơn giá'], ['plan', 'Phòng và Gói bán']]} value={tab} onChange={setTab} /></div><div className={`grid ${rooms ? 'grid-cols-[300px_1fr]' : 'grid-cols-1'} max-md:grid-cols-1 gap-5 items-start`}>{rooms && <Card className="p-2 max-h-[640px] overflow-y-auto">
    {[['all', 'Tất cả', total], ...rm.list.map(r => [r.id, r.ten_phong_vi, r.so_luong_phong])].map(([id, n, c]) => <button key={id} type="button" onClick={() => setSel(id)} className={`w-full flex items-center justify-between gap-2 px-3.5 py-3 rounded-lg text-left ${sel === id ? 'bg-brand/10 text-brand-dark font-semibold' : 'hover:bg-slate-50'}`}><span className="truncate">{n}</span><span className="min-w-6 px-1.5 h-6 grid place-items-center rounded-full bg-slate-100 text-xs text-slate-600">{c}</span></button>)}</Card>}
    <div className="min-w-0">{tab === 'plan' && <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 mb-5 text-sm text-blue-900 flex gap-3"><Info className="w-4 h-4 mt-0.5 shrink-0" /><ul className="list-disc pl-4 space-y-0.5"><li>Hạng phòng trên Bellhop PMS và Bellhop CMS dùng chung một nguồn dữ liệu.</li><li>Đặt phòng từ kênh OTA về sẽ tự khớp đúng hạng phòng.</li><li>Bấm dấu + ở từng gói giá để ghép gói giá giữa PMS và CMS.</li></ul></div>}<h3 className="font-semibold text-ink mb-3">{sel === 'all' || !rooms ? { rooms: 'Tất cả tầng và phòng', price: 'Đơn giá tất cả hạng phòng', plan: 'Phòng và Gói bán tất cả hạng phòng' }[tab] : types[0]?.ten_phong_vi}</h3>
      {types.map(r => { const c = r.ma_hang_phong, fs = get(c), left = Math.max(0, (+r.so_luong_phong || 0) - fs.reduce((a, f) => a + f.rooms.length, 0)); return <div key={r.id} className="mb-8"><div className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-2">{r.ten_phong_vi}</div>
        {tab === 'price' ? <PriceBox key={r.id + (r.gia_ngay_thuong ?? 0)} r={r} rm={rm} /> : tab === 'plan' ? <PlanBox r={r} i={rm.list.indexOf(r)} m={pm} setM={setPm} /> : <div className="space-y-3">{fs.map((f, i) => <Floor key={i + f.name} f={f} onChange={x => put(c, fs.map((y, j) => j === i ? x : y))} />)}
          {left > 0 && <div className="rounded-xl border bg-white px-4 py-2.5 flex items-center justify-between"><span className="font-semibold text-ink">Chưa xếp tầng</span><span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium">{left} phòng</span></div>}
          <button type="button" className="h-9 px-3.5 rounded-lg border bg-white text-sm font-medium hover:bg-slate-50 inline-flex items-center gap-1.5" onClick={() => put(c, [...fs, { name: '', rooms: [] }])}><Plus className="w-4 h-4" />Thêm tầng</button></div>}</div>; })}
      {!types.length && <p className="text-slate-400 text-sm">Chưa có hạng phòng nào</p>}</div></div></>;
}

