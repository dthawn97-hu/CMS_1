import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useCrud, useDB, fmChans } from '../store.jsx';
import { Btn, Title, Card, Tabs, Toggle, Table } from '../ui.jsx';

export default function Sync() {
  const { db } = useDB(), chs = useCrud('channels');
  const [tab, setTab] = useState('bh'), [q, setQ] = useState(''), [cid, setCid] = useState(db.channels[0].id), ch = chs.get(cid);
  // Giá thông minh (S) chỉ hiện ở các kênh được gắn; giá gốc (B) hiện ở mọi kênh
  const mine = p => { const fs = db.formulas.filter(f => f.active && f.s === p.ten_chinh_sach_gia); return !fs.length || fs.some(f => fmChans(db, f).includes(cid)); };
  const pairs = db.policies.filter(mine).flatMap(p => db.rooms.map(r => [r, p]));
  const setMap = (k, v) => chs.patch(cid, { map: { ...ch.map, [k]: v } });
  const setAll = v => chs.patch(cid, { map: { ...ch.map, ...Object.fromEntries(pairs.map(([r, p]) => [r.id + '|' + p.id, v])) } });
  const isOn = (r, p) => ch.map[r.id + '|' + p.id] !== false, onN = pairs.filter(([r, p]) => isOn(r, p)).length;
  const shown = pairs.map((x, i) => [...x, i]).filter(([r, p]) => (r.ten_phong_vi + ' ' + p.ten_chinh_sach_gia).toLowerCase().includes(q.toLowerCase()));
  const TONE = ['bg-blue-900 text-white', 'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-700', 'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700'];
  const logo = (c, i, big) => <span className={`${big ? 'w-12 h-12 text-base' : 'w-10 h-10 text-xs'} shrink-0 rounded-xl grid place-items-center font-bold ${TONE[i % TONE.length]}`}>{c.name.slice(0, 2)}</span>;
  const mobile = <div className="md:hidden">
    <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold tracking-widest text-slate-500">KÊNH OTA KẾT NỐI</span><span className="text-xs font-medium text-brand-dark">{db.channels.length} Kênh</span></div>
    <div className="flex gap-3 overflow-x-auto -mx-3 px-3 pb-2">{db.channels.map((c, i) => <button key={c.id} type="button" onClick={() => setCid(c.id)} className={`shrink-0 w-44 flex items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left ${c.id === cid ? 'border-2 border-ink' : 'border border-slate-200'}`}>{logo(c, i)}
      <span className="min-w-0"><b className="block text-sm truncate">{c.name}</b><span className={`text-xs ${c.connected ? 'text-emerald-600' : 'text-slate-400'}`}>{c.connected ? '● Đã kết nối' : 'Chưa kết nối'}</span></span></button>)}</div>
    {tab === 'bh' ? <>
      <Card className="p-4 mt-2"><div className="flex items-center gap-3">{logo(ch, db.channels.findIndex(c => c.id === cid), true)}<div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><b className="text-lg">{ch.name}</b><span className={`px-2 py-0.5 rounded text-xs border ${ch.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{ch.active ? 'Hoạt động' : 'Tạm tắt'}</span></div><div className="text-sm text-slate-500">{ch.connected ? 'Đã kết nối' : 'Chưa kết nối'}</div></div><Toggle checked={ch.active} onChange={v => chs.patch(cid, { active: v })} /></div>
        <div className="border-t border-slate-100 mt-3 pt-3"><Btn className="w-full" onClick={() => chs.patch(cid, { connected: !ch.connected })}>{ch.connected ? 'Ngắt kết nối' : 'Kết nối'}</Btn></div></Card>
      <div className="flex items-start justify-between mt-5 mb-2 gap-3"><div><div className="font-bold text-ink">Ánh xạ loại phòng & chính sách giá</div><div className="text-xs text-slate-500">Đã kích hoạt <b className="text-ink">{onN}</b>/{pairs.length} loại phòng</div></div>
        <button type="button" onClick={() => setAll(onN < pairs.length)} className="shrink-0 px-3.5 py-1.5 rounded-lg border border-brand/30 bg-brand/10 text-brand-dark text-sm font-medium">{onN < pairs.length ? 'Tất cả' : 'Bỏ chọn'}</button></div>
      <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field !pl-10" placeholder="Tìm theo tên phòng, chính sách giá…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="space-y-3">{shown.map(([r, p, i]) => { const on = isOn(r, p), k = r.id + '|' + p.id; return <Card key={k} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="text-xs text-slate-400 mr-1.5">#{String(i + 1).padStart(2, '0')}</span><b>{r.ten_phong_vi}</b>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">Chính sách: <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{p.ten_chinh_sach_gia}</span></div></div>
        <div className="flex flex-col items-end gap-1.5 shrink-0"><Toggle checked={on} onChange={v => setMap(k, v)} /><span className={`text-xs ${on ? 'text-emerald-600' : 'text-slate-400'}`}>{on ? 'Đang liên kết OTA' : 'Không liên kết'}</span></div></div></Card>; })}
        {!shown.length && <p className="text-center text-slate-400 py-8">Không có kết quả</p>}</div></>
    : <div className="mt-3 space-y-3">{shown.map(([r, p]) => { const ok = isOn(r, p) && ch.connected; return <Card key={r.id + p.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><b>{r.ten_phong_vi}</b><div className="mt-1 text-sm text-slate-500">{p.ten_chinh_sach_gia}</div><div className="text-xs text-slate-400 mt-1">Mã CMS: {r.ma_hang_phong}/{p.ma_chinh_sach_gia}</div></div>
        {ok ? <span className="bg-ink text-white rounded-full px-3 py-0.5 text-xs shrink-0">Đã kết nối</span> : <span className="text-slate-400 text-xs shrink-0">Chưa kết nối</span>}</div></Card>; })}</div>}
  </div>;
  return <>
    <Title t="Đồng bộ CMS — Kênh bán" sub={<>Cấu hình và liên kết kênh OTA thông qua CMS. <b className="text-ink">{db.channels.filter(c => c.active).length} kênh đang hoạt động</b></>} />
    <Tabs value={tab} onChange={setTab} items={[['bh', 'Đồng bộ CMS'], ['x', 'Đồng bộ OTA']]} />
    {mobile}
    <div className="flex gap-5 max-md:hidden">
      <Card className="w-72 shrink-0 self-start">{db.channels.map(c => <button key={c.id} type="button" onClick={() => setCid(c.id)}
        className={`w-full text-left flex gap-3 px-4 py-3 border-b last:border-0 ${c.id === cid ? 'bg-slate-50' : ''}`}><Bell className="w-4 h-4 mt-1 text-slate-400" />
        <div><b className="font-medium">{c.name}</b><div className={`text-xs ${c.connected ? 'text-emerald-600' : 'text-slate-500'}`}>{c.connected ? 'Đã kết nối' : 'Chưa kết nối'}</div></div></button>)}</Card>
      {tab === 'bh' ? <div className="flex-1 space-y-4">
        <Card><div className="p-4 flex items-center justify-between"><div className="flex items-center gap-3 font-semibold">{ch.name} <Toggle checked={ch.active} onChange={v => chs.patch(cid, { active: v })} /></div>
          <div className="flex gap-2 items-center"><Btn onClick={() => chs.patch(cid, { connected: !ch.connected })}>{ch.connected ? 'Ngắt kết nối' : 'Kết nối'}</Btn>
            <span className="border rounded-full px-3 py-1.5 text-xs">{ch.connected ? 'Đã kết nối' : 'Chưa kết nối'}</span></div></div></Card>
        <Card><div className="p-4 font-semibold border-b">Ánh xạ loại phòng & chính sách giá</div>
          <Table head={['Loại phòng', 'Chính sách giá', 'Trạng thái']} rows={pairs.map(([r, p]) => { const k = r.id + '|' + p.id, on = ch.map[k] !== false;
            return { key: k, cells: [r.ten_phong_vi, p.ten_chinh_sach_gia, <div className="flex items-center gap-3"><Toggle checked={on} onChange={v => setMap(k, v)} /><span className="text-xs text-slate-500">{on ? 'Đang liên kết OTA' : 'Không liên kết'}</span></div>] }; })} /></Card></div>
      : <Card className="flex-1"><div className="p-4 border-b font-serif font-bold">Ánh xạ loại phòng & chính sách giá <span className="font-sans font-normal text-slate-500 text-xs ml-2">{ch.name}</span></div>
        <Table head={['Loại phòng (Bellhop)', 'Chính sách giá (Bellhop)', 'Mã CMS', 'Trạng thái']} rows={pairs.map(([r, p]) => ({ key: r.id + p.id, cells: [r.ten_phong_vi, p.ten_chinh_sach_gia,
          <span className="text-xs text-slate-400">{r.ma_hang_phong}/{p.ma_chinh_sach_gia}</span>,
          ch.map[r.id + '|' + p.id] !== false && ch.connected ? <span className="bg-ink text-white rounded-full px-3 py-0.5 text-xs">Đã kết nối</span> : <span className="text-slate-400 text-xs">Chưa kết nối</span>] }))} /></Card>}
    </div></>;
}
