import { useMemo, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { addDays, ymd } from '../store.jsx';
import { Btn, Card, Title, toast } from '../ui.jsx';
import { Filters, Lbl, Modal, RangeFields, Table, dmy, useRange } from './FinanceFunds.jsx';
import { TPL, TRIG } from './SalesPages.jsx';

// ponytail: lịch sử gửi mẫu (chưa nối SMTP/PMS thật) — nối API gửi email khi có backend
const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7) / 9973, pick = (a, s) => a[Math.floor(hash(s) * a.length)];
const NAMES = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng Nam', 'Phạm Thu Hà', 'Park Ji-min', 'Emma Wilson', 'Yan Xiao', 'Võ Quốc Bảo'], SENDERS = ['staging.smoketest@bellhop.app', 'kj6u3zguvpgw5hkt@ethereal.email'];
const ST = { 'Đã gửi': 'bg-brand/10 text-brand-dark', 'Đã mở': 'bg-ink text-white', 'Thất bại': 'bg-red-50 text-red-600', 'Chờ gửi': 'bg-slate-100 text-slate-600' };
const ROWS = Array.from({ length: 3 }, (_, i) => { const t = pick(TRIG, 't' + i), name = pick(NAMES, 'n' + i), st = pick(['Đã gửi', 'Đã gửi', 'Đã mở', 'Đã mở', 'Thất bại', 'Chờ gửi'], 's' + i), d = addDays(ymd(new Date()), -Math.floor(i / 2));
  return { id: i, date: d, time: `${String(8 + Math.floor(hash('h' + i) * 12)).padStart(2, '0')}:${String(Math.floor(hash('m' + i) * 60)).padStart(2, '0')}`, trig: t[0], name, to: `${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z]+/g, '.')}@gmail.com`, sender: pick(SENDERS, 'e' + i), st, err: st === 'Thất bại' ? 'Máy chủ nhận từ chối: hộp thư không tồn tại (550)' : '' }; });
const SAMPLE = r => ({ Guest_Name: r.name, Hotel_Name: 'Khách sạn Bellhop', Hotel_Phone: '0901 234 567', Hotel_Address: '12 Nguyễn Huệ, Q1', Hotel_Email: 'info@bellhop.vn', Checkin_Date: dmy(r.date), Checkout_Date: dmy(addDays(r.date, 2)), Room_Type: 'Superior' });
const fill = (s, r) => s.replace(/\[([A-Za-z_]+)\]/g, (m, k) => SAMPLE(r)[k] ?? m);

export default function EmailHistory() {
  const [rows, setRows] = useState(ROWS), r = useRange(), [trig, setTrig] = useState(''), [st, setSt] = useState(''), [q, setQ] = useState(''), [ap, setAp] = useState({ from: addDays(ymd(new Date()), -30), to: ymd(new Date()), trig: '', st: '', q: '' }), [view, setView] = useState(null);
  const list = useMemo(() => rows.filter(x => x.date >= ap.from && x.date <= ap.to && (!ap.trig || x.trig === ap.trig) && (!ap.st || x.st === ap.st) && (x.name + x.to).toLowerCase().includes(ap.q.toLowerCase())).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), [rows, ap]);
  const cnt = s => list.filter(x => x.st === s).length, label = k => TRIG.find(t => t[0] === k)[1], resend = x => { setRows(rows.map(y => y.id === x.id ? { ...y, st: 'Đã gửi', err: '' } : y)); setView(null); toast('Đã gửi lại email'); };
  return <><Title keep t="Lịch sử gửi email" sub="Theo dõi các email chiến dịch đã gửi đến khách và trạng thái của từng email." />
    <div className="grid grid-cols-4 gap-5 mb-5">{[['Tổng email', list.length], ['Đã gửi / đã mở', cnt('Đã gửi') + cnt('Đã mở')], ['Thất bại', cnt('Thất bại')], ['Chờ gửi', cnt('Chờ gửi')]].map(([l, v]) => <Card key={l} className="p-5 max-md:p-4"><div className="text-xs text-slate-500">{l}</div><div className="text-2xl font-bold text-ink mt-1">{v}</div></Card>)}</div>
    <Filters><RangeFields r={r} /><Lbl l="Chiến dịch" className="w-40 shrink-0 max-md:flex-1 max-md:!w-auto min-w-0"><select className="field" value={trig} onChange={e => setTrig(e.target.value)}><option value="">Tất cả</option>{TRIG.map(t => <option key={t[0]} value={t[0]}>{t[1]}</option>)}</select></Lbl>
      <Lbl l="Trạng thái" className="w-40 shrink-0 max-md:flex-1 max-md:!w-auto min-w-0"><select className="field" value={st} onChange={e => setSt(e.target.value)}><option value="">Tất cả</option>{Object.keys(ST).map(s => <option key={s}>{s}</option>)}</select></Lbl>
      <Lbl l="Tìm kiếm" className="flex-1 min-w-[180px] max-md:basis-full"><input className="field" placeholder="Tên hoặc email khách..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && setAp({ from: r.from, to: r.to, trig, st, q })} /></Lbl><Btn onClick={() => setAp({ from: r.from, to: r.to, trig, st, q })}>Lọc</Btn></Filters>
    <Table onRow={i => setView(list[i])} cols={['Thời gian', 'Chiến dịch', 'Người nhận', 'Tài khoản gửi', 'Trạng thái', 'Thao tác']} right={[5]} empty="Không có email nào trong kỳ này"
      rows={list.map(x => [<span className="whitespace-nowrap">{dmy(x.date)} {x.time}</span>, label(x.trig), <div><b>{x.name}</b><div className="text-xs text-slate-400">{x.to}</div></div>, <span className="text-slate-500 text-xs">{x.sender}</span>,
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ST[x.st]}`}>{x.st}</span>, <div className="flex justify-end gap-4"><button type="button" className="text-brand-dark font-medium" onClick={() => setView(x)}>Xem</button>{x.st === 'Thất bại' && <button type="button" title="Gửi lại" className="text-slate-500 hover:text-ink" onClick={() => resend(x)}><RotateCw className="w-4 h-4" /></button>}</div>])} />
    {view && <Modal title={fill(TPL[view.trig][0], view)} onClose={() => setView(null)}><dl className="grid grid-cols-[110px_1fr] gap-y-1.5 text-sm mb-4"><dt className="text-slate-500">Đến</dt><dd>{view.name} &lt;{view.to}&gt;</dd><dt className="text-slate-500">Từ</dt><dd>{view.sender}</dd><dt className="text-slate-500">Thời gian</dt><dd>{dmy(view.date)} {view.time}</dd><dt className="text-slate-500">Trạng thái</dt><dd>{view.st}</dd></dl>
      {view.err && <p className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 mb-4">Lý do thất bại: {view.err}</p>}
      <div className="rounded-lg border bg-slate-50 p-4 text-sm leading-6 max-h-[300px] overflow-auto" dangerouslySetInnerHTML={{ __html: fill(TPL[view.trig][1], view) }} />
      <div className="flex justify-end gap-2 mt-5"><Btn kind="ghost" onClick={() => setView(null)}>Đóng</Btn>{view.st === 'Thất bại' && <Btn onClick={() => resend(view)}>Gửi lại</Btn>}</div></Modal>}</>;
}
