import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useCrud, useDB, fmChans } from '../store.jsx';
import { Btn, Title, Card, Tabs, Toggle, Table } from '../ui.jsx';

export default function Sync() {
  const { db } = useDB(), chs = useCrud('channels');
  const [tab, setTab] = useState('bh'), [cid, setCid] = useState(db.channels[0].id), ch = chs.get(cid);
  // Giá thông minh (S) chỉ hiện ở các kênh được gắn; giá gốc (B) hiện ở mọi kênh
  const mine = p => { const fs = db.formulas.filter(f => f.active && f.s === p.ten_chinh_sach_gia); return !fs.length || fs.some(f => fmChans(db, f).includes(cid)); };
  const pairs = db.policies.filter(mine).flatMap(p => db.rooms.map(r => [r, p]));
  const setMap = (k, v) => chs.patch(cid, { map: { ...ch.map, [k]: v } });
  return <>
    <Title t="Đồng bộ CMS — Kênh bán" sub={<>Cấu hình và liên kết kênh OTA thông qua CMS. <b className="text-ink">{db.channels.filter(c => c.active).length} kênh đang hoạt động</b></>} />
    <Tabs value={tab} onChange={setTab} items={[['bh', 'Ánh xạ Bellhop'], ['x', 'Ánh xạ']]} />
    <div className="flex gap-5">
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
