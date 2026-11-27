import { useState } from 'react';
import { CheckCircle2, Wrench, XCircle } from 'lucide-react';
import { Btn, Card, Tabs, Title, ask, toast } from '../ui.jsx';
import { Lbl, Modal, dmy } from './FinanceFunds.jsx';
import { addBlock, decide, requestDelete, updBlock, useMaint } from '../maintStore.js';

const ms = s => new Date(s).getTime(), p2 = n => String(n).padStart(2, '0'), fmt = t => { const x = new Date(t); return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}T${p2(x.getHours())}:${p2(x.getMinutes())}`; };
export const fdt = s => `${s.slice(11, 16)} ${dmy(s.slice(0, 10))}`;

// Tạo / sửa lịch bảo trì của 1 phòng theo khoảng thời gian. init: { id } để sửa, hoặc { room, from, to } để tạo
export function MaintModal({ init, rooms, bks, onClose }) {
  const { blocks } = useMaint(), cur = init.id ? blocks.find(b => b.id === init.id) : null, now = Date.now();
  const [f, setF] = useState(() => cur ? { room: cur.room, from: cur.from, to: cur.to, reason: cur.reason } : { room: init.room || rooms[0], from: init.from ? fmt(init.from) : fmt(now), to: init.to ? fmt(init.to) : fmt(now + 864e5), reason: '' }),
    [del, setDel] = useState(false), [why, setWhy] = useState(''), lock = !!cur?.del, set = p => setF(o => ({ ...o, ...p }));
  const a = ms(f.from), b = ms(f.to), shift = h => set({ to: fmt(b + h * 36e5) });
  const clash = bks.find(k => k.room === f.room && !['Đã trả phòng', 'No-show'].includes(k.st) && ms(`${k.arrD}T${k.arrT}`) < b && ms(`${k.depD}T${k.depT}`) > a),
    dup = blocks.find(k => k.room === f.room && k.id !== cur?.id && ms(k.from) < b && ms(k.to) > a),
    err = !(b > a) ? 'Thời gian kết thúc phải sau thời gian bắt đầu' : clash ? `Trùng đơn ${clash.code} (${clash.guest}) trong phòng ${f.room}` : dup ? `Trùng lịch bảo trì khác của phòng ${f.room} (${fdt(dup.from)} – ${fdt(dup.to)})` : '';
  const save = () => { if (err) return toast(err, true); if (!f.reason.trim()) return toast('Nhập lý do / nội dung sửa chữa', true);
    cur ? updBlock(cur.id, { ...f, reason: f.reason.trim() }) : addBlock({ ...f, reason: f.reason.trim() }); toast(cur ? 'Đã cập nhật lịch bảo trì' : `Đã đặt bảo trì phòng ${f.room}`); onClose(); };
  const send = () => { if (!why.trim()) return toast('Nhập lý do xóa để quản lý xem xét', true); requestDelete(cur.id, why.trim()); toast('Đã gửi yêu cầu xóa, chờ quản lý duyệt'); onClose(); };
  const chip = (l, fn) => <button type="button" disabled={lock} onClick={fn} className="px-3 h-8 rounded-full border text-xs font-medium hover:bg-slate-50 disabled:opacity-40">{l}</button>;
  return <Modal title={cur ? `Lịch bảo trì phòng ${cur.room}` : 'Đặt bảo trì phòng'} w={560} onClose={onClose}>
    {lock && <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-2.5">Đang chờ quản lý duyệt xóa — tạm thời không sửa được lịch này.</div>}
    <div className="space-y-4">
      <Lbl l="Phòng"><select className="field" disabled={!!cur || lock} value={f.room} onChange={e => set({ room: e.target.value })}>{rooms.map(r => <option key={r}>{r}</option>)}</select></Lbl>
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4"><Lbl l="Bắt đầu"><input type="datetime-local" className="field" disabled={lock} value={f.from} onChange={e => e.target.value && set({ from: e.target.value })} /></Lbl>
        <Lbl l="Kết thúc dự kiến"><input type="datetime-local" className="field" disabled={lock} value={f.to} min={f.from} onChange={e => e.target.value && set({ to: e.target.value })} /></Lbl></div>
      {cur && <div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-slate-500">Đổi nhanh:</span>{chip('Rút ngắn 2 giờ', () => shift(-2))}{chip('Kéo dài 2 giờ', () => shift(2))}{chip('Kéo dài 1 ngày', () => shift(24))}{chip('Kết thúc ngay', () => set({ to: fmt(Math.max(now, a + 6e4)) }))}</div>}
      <Lbl l="Lý do / nội dung sửa chữa"><textarea rows={3} className="field" disabled={lock} placeholder="VD: Sửa điều hòa, thay ga giường..." value={f.reason} onChange={e => set({ reason: e.target.value })} /></Lbl>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {del && <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-2"><div className="text-sm font-semibold text-red-700">Xóa cần quản lý xác nhận</div><textarea rows={2} className="field" autoFocus placeholder="Lý do xóa lịch bảo trì..." value={why} onChange={e => setWhy(e.target.value)} /><div className="flex gap-2 justify-end"><Btn kind="ghost" onClick={() => setDel(false)}>Thôi</Btn><Btn onClick={send}>Gửi yêu cầu xóa</Btn></div></div>}</div>
    <div className="flex items-center gap-2 mt-6 pt-4 border-t">{cur && !lock && !del && <button type="button" className="h-10 px-4 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50" onClick={() => setDel(true)}>Xóa</button>}<div className="flex-1" />
      <button type="button" className="h-10 px-5 rounded-lg border font-semibold hover:bg-slate-50" onClick={onClose}>{lock ? 'Đóng' : 'Huỷ'}</button>{!lock && <button type="button" className="h-10 px-6 rounded-lg bg-ink text-white font-semibold" onClick={save}>Lưu</button>}</div></Modal>;
}

// Màn quản lý duyệt các yêu cầu xóa lịch bảo trì do lễ tân gửi
export default function Approvals() {
  const { reqs } = useMaint(), [tab, setTab] = useState('wait'), wait = reqs.filter(r => r.status === 'Chờ duyệt'), rows = tab === 'wait' ? wait : reqs.filter(r => r.status !== 'Chờ duyệt');
  const act = async (r, ok) => { if (!(await ask(ok ? `Duyệt xóa lịch bảo trì phòng ${r.room}? Phòng sẽ mở bán lại trong khoảng thời gian này.` : `Từ chối yêu cầu xóa của phòng ${r.room}? Lịch bảo trì được giữ nguyên.`, { title: ok ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu', ok: ok ? 'Duyệt xóa' : 'Từ chối', danger: ok }))) return; decide(r.id, ok); toast(ok ? 'Đã duyệt, lịch bảo trì đã được xóa' : 'Đã từ chối yêu cầu'); };
  return <><Title keep t="Duyệt yêu cầu" sub="Quản lý xác nhận các yêu cầu xóa do lễ tân gửi lên (lịch bảo trì phòng)." />
    <Tabs value={tab} onChange={setTab} items={[['wait', `Chờ duyệt (${wait.length})`], ['done', 'Đã xử lý']]} />
    <div className="space-y-3">{rows.map(r => <Card key={r.id} className="p-5 max-md:p-4"><div className="flex items-start gap-4 max-md:flex-col">
      <span className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 grid place-items-center text-slate-500"><Wrench className="w-5 h-5" /></span>
      <div className="flex-1 min-w-0 space-y-1 text-sm"><div className="flex items-center gap-2 flex-wrap"><b className="text-ink text-base">Xóa lịch bảo trì · Phòng {r.room}</b><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'Chờ duyệt' ? 'bg-amber-50 text-amber-700' : r.status === 'Đã duyệt' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span></div>
        <div className="text-slate-500">{fdt(r.from)} → {fdt(r.to)} · {r.why}</div><div><span className="text-slate-500">Lý do xóa: </span><b className="text-ink">{r.reason}</b></div><div className="text-xs text-slate-400">{r.by} gửi lúc {r.at}{r.at2 && ` · ${r.by2} ${r.status === 'Đã duyệt' ? 'duyệt' : 'từ chối'} lúc ${r.at2}`}</div></div>
      {r.status === 'Chờ duyệt' && <div className="flex gap-2 max-md:w-full max-md:[&>button]:flex-1"><Btn kind="ghost" onClick={() => act(r, false)}><XCircle className="w-4 h-4 mr-1.5 inline" />Từ chối</Btn><Btn onClick={() => act(r, true)}><CheckCircle2 className="w-4 h-4 mr-1.5 inline" />Duyệt xóa</Btn></div>}</div></Card>)}
      {!rows.length && <Card className="py-14 text-center text-slate-400">{tab === 'wait' ? 'Không có yêu cầu nào đang chờ duyệt' : 'Chưa có yêu cầu nào được xử lý'}</Card>}</div></>;
}
