import { useState } from 'react';
import { ChevronDown, ChevronRight, CloudUpload, Handshake, Plus, Printer, X } from 'lucide-react';
import { money, useDB } from '../store.jsx';
import { Btn, Card, ask, toast } from '../ui.jsx';
import { Underline } from './FinanceFunds.jsx';

// ponytail: dữ liệu ca mẫu, chỉ nằm trong state của trang (PMS chưa có backend) — nối API khi có PMS
const OPENED = '06/11/2026 03:39', OPENING = 500000, STAFF = ['Smoke Test Admin', 'Lễ tân A', 'Lễ tân B'];
const P = (no, room, guest, pid, text, amount, method, time, type = 'thu', by = '') => ({ no, room, guest, pid, text, amount, method, time, type, by });
const PAY = [
  P('F-8AB9C1E9', '203', 'Yan Xiao', '8e4b11a4', 'Thanh toán tiền mặt', 770000, 'Tiền mặt', '06/11/26 12:15'),
  P('F-CK-0003', '204', 'Lê Văn C', 'a19f33e0', 'Chuyển khoản đặt cọc', 200000, 'Chuyển khoản NH', '12/11/26 15:02'),
  P('PC-0001', '—', 'Nhà cung cấp vật tư', 'c0ffee01', 'Chi mua vật tư buồng phòng', 300000, 'Tiền mặt', '13/11/26 10:00', 'chi', 'Smoke Test Admin')];
const sum = (l, f = () => true) => l.filter(f).reduce((a, p) => a + p.amount, 0), N = n => money(n), Row = ({ children, cls = '' }) => <div className={`flex items-center justify-between ${cls}`}>{children}</div>;

function Handover() {
  const { db } = useDB(), cash = t => sum(PAY, p => p.type === t && p.method === 'Tiền mặt'), bank = t => sum(PAY, p => p.type === t && p.method !== 'Tiền mặt'),
    thu = cash('thu') + bank('thu'), chi = cash('chi') + bank('chi'), now = OPENING + cash('thu') - cash('chi');
  const [real, setReal] = useState(String(now)), [next, setNext] = useState(''), [mgr, setMgr] = useState(String(now)), [tasks, setTasks] = useState([]), [t, setT] = useState(''), [urgent, setUrgent] = useState(false), [to, setTo] = useState(db.account.ho_va_ten || STAFF[0]), [note, setNote] = useState(''), [done, setDone] = useState(false);
  const diff = now - (+real || 0), handed = (+next || 0) + (+mgr || 0), gap = handed - (+real || 0), staff = [...new Set([db.account.ho_va_ten, ...STAFF].filter(Boolean))];
  const L = ({ n, l, v, big, sub, blue }) => <Row cls={`${big ? 'bg-slate-100 rounded-lg px-2.5 py-3 -mx-2.5 font-semibold' : sub ? 'pl-5 text-xs py-2.5' : 'py-3'} ${blue ? 'text-brand-dark' : ''}`}><span className={blue || big ? 'font-semibold' : ''}>{n} {l}</span><span className={blue || big ? 'font-semibold' : ''}>{N(v)}</span></Row>;
  const In = ({ n, l, v, set, dis }) => <Row cls="py-2 max-md:flex-col max-md:items-stretch max-md:gap-1.5"><span>{n} {l}</span><input disabled={dis} inputMode="numeric" className="field !w-40 max-md:!w-full text-right" value={v ? N(+v) : ''} onChange={e => set(e.target.value.replace(/\D/g, ''))} /></Row>;
  const submit = async () => { if (gap !== 0) return toast('Tổng bàn giao (7 + 8) phải bằng tiền thực tế trong két', true); if (await ask(`Bàn giao ca cho ${to}?`, { title: 'Xác nhận bàn giao', ok: 'Bàn giao' })) { setDone(true); toast('Đã bàn giao ca'); } };
  return <div className="grid grid-cols-2 max-md:!grid-cols-1 gap-5 items-start">
    <Card className="p-6 max-md:p-4 text-sm"><h3 className="font-semibold text-ink mb-3">Bàn giao tiền mặt (VND)</h3>
      <L n="1." l="Đầu ca" v={OPENING} /><L n="2." l="Tổng thu" v={thu} blue /><L sub n="2.1 " l="Tiền mặt" v={cash('thu')} blue /><L sub n="2.2 " l="Chuyển khoản" v={bank('thu')} blue />
      <L n="3." l="Tổng chi" v={chi} blue /><L sub n="3.1 " l="Tiền mặt" v={cash('chi')} blue /><L sub n="3.2 " l="Chuyển khoản" v={bank('chi')} blue />
      <div className="my-1"><L big n="4." l="Số tiền hiện tại" v={now} /></div><L n="5." l="Chênh lệch với két" v={diff} />
      <In n="6." l="Thực tế trong két" v={real} set={setReal} dis={done} /><In n="7." l="Bàn giao cho ca sau" v={next} set={setNext} dis={done} /><In n="8." l="Bàn giao cho quản lý" v={mgr} set={setMgr} dis={done} />
      {gap !== 0 && <p className="text-right text-amber-700 mt-2">Tổng bàn giao (7 + 8) đang khác tiền thực tế trong két: chênh {N(Math.abs(gap))} đ</p>}
      <p className="text-xs text-slate-400 mt-5">* Chú thích: 2 = 2.1 + 2.2 · 3 = 3.1 + 3.2 · 4 = 1 + 2.1 − 3.1 · 5 = 4 − 6 · 6 = 7 + 8</p></Card>
    <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink mb-3">Công việc bàn giao</h3>
      <div className="flex items-start gap-3 max-md:flex-wrap"><textarea rows={1} className="field flex-1 max-md:basis-full" placeholder="Nội dung việc..." value={t} onChange={e => setT(e.target.value)} /><label className="flex items-center gap-1.5 pt-3 max-md:pt-0 max-md:h-11 text-sm"><input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} />Gấp</label>
        <Btn kind="ghost" className="max-md:flex-1" disabled={!t.trim() || done} onClick={() => { setTasks([...tasks, { t: t.trim(), urgent }]); setT(''); setUrgent(false); }}><Plus className="w-4 h-4 mr-1 inline" />Thêm việc</Btn></div>
      <div className="my-4 space-y-2">{tasks.map((k, i) => <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"><span className="flex-1">{k.t}</span>{k.urgent && <span className="text-[11px] px-2 rounded-full bg-red-50 text-red-600">Gấp</span>}
        <button type="button" title="Xoá" disabled={done} onClick={() => setTasks(tasks.filter((_, j) => j !== i))}><X className="w-4 h-4 text-slate-400" /></button></div>)}{!tasks.length && <p className="text-sm text-slate-400">Chưa có việc bàn giao.</p>}</div>
      <label className="block mb-4"><span className="block font-semibold text-ink mb-1.5">Người nhận</span><select className="field" disabled={done} value={to} onChange={e => setTo(e.target.value)}>{staff.map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="block mb-4"><span className="block font-semibold text-ink mb-1.5">Ghi chú</span><textarea rows={3} className="field" disabled={done} placeholder="Ghi chú bàn giao ca..." value={note} onChange={e => setNote(e.target.value)} /></label>
      <Btn className="max-md:w-full" disabled={done} onClick={submit}><Handshake className="w-4 h-4 mr-2 inline" />{done ? 'Đã bàn giao' : 'Bàn giao'}</Btn></Card></div>;
}

function Payments() {
  const [who, setWho] = useState(''), [meth, setMeth] = useState(''), [open, setOpen] = useState({ thu: true, chi: true }), rows = PAY.filter(p => (!who || (p.by || '—') === who) && (!meth || p.method === meth)), by = [...new Set(PAY.map(p => p.by || '—'))], methods = [...new Set(PAY.map(p => p.method))];
  const t = k => sum(rows, p => p.type === k), net = l => sum(l, p => p.type === 'thu') - sum(l, p => p.type === 'chi');
  const Sec = ({ k, title }) => { const l = rows.filter(p => p.type === k); return <Card className="mb-5 overflow-hidden"><button type="button" className="w-full flex items-center gap-2 px-5 py-4 text-left" onClick={() => setOpen({ ...open, [k]: !open[k] })}>
    {open[k] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}<b>{title}</b><span className="text-slate-500 text-sm ml-2">Tổng: {N(t(k))} VND</span><span className="ml-auto text-sm text-slate-400">{l.length} giao dịch</span></button>
    {open[k] && <div className="md:hidden border-t divide-y">{l.map((p, i) => <div key={i} className="px-4 py-3 text-sm"><div className="flex items-start justify-between gap-3"><b className="text-ink break-all">{p.no}</b><b className={`whitespace-nowrap ${k === 'thu' ? 'text-emerald-700' : 'text-red-700'}`}>{N(p.amount)} VND</b></div>
      <div className="mt-1 text-slate-600 break-words">{p.room !== '—' ? `Phòng ${p.room} · ` : ''}{p.guest}</div><div className="text-slate-500 break-words">{p.text}</div>
      <div className="mt-2 flex items-center justify-between gap-2"><span className="px-2 py-0.5 rounded text-xs bg-brand/10 text-brand-dark">{p.method}</span><span className="text-xs text-slate-400">{p.time}</span></div></div>)}{!l.length && <p className="text-center text-slate-400 py-6">Không có giao dịch</p>}</div>}
    {open[k] && <div className="overflow-x-auto max-md:hidden"><table className="w-full text-sm"><thead><tr className="border-t border-b text-xs text-slate-500">{['#Phiếu', 'Tên phòng', 'Tên khách', '#Thanh toán', 'Nội dung', 'Số tiền', 'Hình thức TT', 'Thời gian'].map((h, i) => <th key={h} className={`px-5 py-2.5 font-semibold ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
      <tbody>{l.map((p, i) => <tr key={i} className="border-b last:border-0"><td className="px-5 py-3">{p.no}</td><td className="px-5 font-semibold">{p.room}</td><td className="px-5">{p.guest}</td><td className="px-5 text-xs text-slate-400">{p.pid}</td><td className="px-5 max-w-[360px] truncate" title={p.text}>{p.text}</td>
        <td className={`px-5 text-right font-semibold whitespace-nowrap ${k === 'thu' ? 'text-emerald-700' : 'text-red-700'}`}>{N(p.amount)} VND</td><td className="px-5"><span className="px-2 py-0.5 rounded text-xs bg-brand/10 text-brand-dark whitespace-nowrap">{p.method}</span></td><td className="px-5 text-xs text-slate-400 whitespace-nowrap">{p.time}</td></tr>)}
        {!l.length && <tr><td colSpan={8} className="text-center text-slate-400 py-8">Không có giao dịch</td></tr>}</tbody></table></div>}</Card>; };
  const Sm = ({ title, rows: r }) => <Card className="p-5"><h3 className="font-semibold text-ink mb-3">{title}</h3>{r.map(([a, ...v], i) => <div key={i} className={`flex justify-between gap-4 py-2 text-sm border-b last:border-0 ${i === r.length - 1 ? 'font-semibold' : ''}`}><span className="flex-1">{a}</span>{v.map((x, j) => <span key={j} className={`text-right w-24 ${v.length === 3 ? ['text-emerald-700', 'text-red-700', ''][j] : ''}`}>{x}</span>)}</div>)}</Card>;
  const people = by.map(w => { const l = rows.filter(p => (p.by || '—') === w); return [w, N(sum(l, p => p.type === 'thu')), N(sum(l, p => p.type === 'chi')), N(net(l))]; }), tot = ['Tổng', N(t('thu')), N(t('chi')), N(net(rows))];
  return <><Card className="px-5 py-4 mb-5 flex items-center gap-3 max-md:flex-col max-md:items-stretch max-md:gap-2 max-md:px-4"><b className="mr-auto">Ca #2</b>
    <select className="field !w-48 max-md:!w-full" value={who} onChange={e => setWho(e.target.value)}><option value="">Nhân viên: Tất cả</option>{by.map(w => <option key={w} value={w}>Nhân viên: {w}</option>)}</select>
    <select className="field !w-52 max-md:!w-full" value={meth} onChange={e => setMeth(e.target.value)}><option value="">Hình thức TT: Tất cả</option>{methods.map(m => <option key={m} value={m}>Hình thức TT: {m}</option>)}</select><select disabled className="field !w-36 max-md:!w-full"><option>Phân hệ: PMS</option></select></Card>
    <div className="grid grid-cols-3 max-md:!grid-cols-1 gap-5 mb-5"><Sm title="Theo người thu" rows={[...people, tot]} />
      <Sm title="Theo phương thức" rows={[...methods.map(m => [m, N(net(rows.filter(p => p.method === m)))]), ['Tổng', N(net(rows))]]} /><Sm title="Theo tiền tệ" rows={[['VND', N(net(rows))], ['Tổng', N(net(rows))]]} /></div>
    <Sec k="thu" title="Khoản thu" /><Sec k="chi" title="Khoản chi" /></>;
}

export default function Shift() {
  const [tab, setTab] = useState('h');
  return <><div className="flex items-start justify-between max-md:flex-col"><div className="flex-1 max-md:w-full"><Underline items={[['h', 'Bàn giao'], ['p', 'Thanh toán trong ca']]} value={tab} onChange={setTab} /></div>
    <div className="flex items-center gap-3 pt-1 pl-6 max-md:pl-0 max-md:pt-0 max-md:mb-4 max-md:w-full max-md:justify-between text-sm text-slate-600 shrink-0"><span><span className="max-md:hidden">Thời gian mở ca</span><span className="md:hidden">Mở ca</span>: {OPENED}</span>
      <button type="button" title="Lưu nháp" className="w-9 h-9 grid place-items-center rounded-lg border bg-white hover:bg-slate-50" onClick={() => toast('Đã lưu nháp ca')}><CloudUpload className="w-4 h-4" /></button>
      <button type="button" title="In" className="w-9 h-9 grid place-items-center rounded-lg border bg-white hover:bg-slate-50" onClick={() => window.print()}><Printer className="w-4 h-4" /></button></div></div>
    {tab === 'h' ? <Handover /> : <Payments />}</>;
}
