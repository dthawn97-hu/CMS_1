import { useState } from 'react';
import { BedDouble, Download, MessageSquare, Play, RefreshCw, Send, TrendingUp } from 'lucide-react';
import { addDays, money, ymd } from '../store.jsx';
import { Btn, Card, SheetTabs, Title, toast } from '../ui.jsx';
import { Underline } from './FinanceFunds.jsx';

// ponytail: số liệu mẫu giả lập (PMS chưa có backend) — nối API doanh thu/công suất khi có PMS
const today = ymd(new Date()), dmy = s => s.split('-').reverse().join('/');
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7) / 9973;
const Kpi = ({ I, v, l }) => <Card className="p-5 max-md:p-3.5 flex items-center gap-4 max-md:gap-3"><I className="w-8 h-8 max-md:w-6 max-md:h-6 text-brand-dark shrink-0" strokeWidth={1.7} /><div className="min-w-0"><div className="text-2xl max-md:text-xl font-bold text-ink leading-tight">{v}</div><div className="text-xs text-slate-500">{l}</div></div></Card>;
const Dt = ({ l, v, set, min }) => <label className="block max-md:flex-1 min-w-0"><span className="block text-xs text-slate-500 mb-1">{l}</span><input type="date" className="field !w-44 max-md:!w-full" value={v} min={min} onChange={e => e.target.value && set(e.target.value)} /></label>;

/* ---------------- Doanh thu ---------------- */
const revOf = d => Math.round((0.15 + hash(d) * 1.9 + (d >= '2026-11-08' ? 1.2 + Math.sin((+d.slice(8) - 8) / 2.2) * 0.8 : 0)) * 1e6 / 1e5) * 1e5; // doanh thu ngày giả lập
const occOf = i => i === 0 ? 16 : i < 8 ? [14, 14, 14, 14, 14, 14, 3][i - 1] : Math.max(0, Math.round(hash('o' + i) * 5 - 2));
const HEAT = [[30, '#a7f0d2'], [60, '#fde68a'], [80, '#fdba74'], [101, '#f87171']], heat = p => HEAT.find(([m]) => p < m)[1];
const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function Area({ pts }) {
  const W = 1000, H = 260, max = Math.max(...pts.map(p => p.v), 1), raw = max / 4, p10 = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].find(m => m * p10 >= raw) * p10, top = Math.ceil(max / step) * step,
    X = i => pts.length < 2 ? W / 2 : i / (pts.length - 1) * W, Y = v => H - v / top * H, ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const line = pts.map((p, i) => i ? ` C ${(X(i - 1) + X(i)) / 2} ${Y(pts[i - 1].v)}, ${(X(i - 1) + X(i)) / 2} ${Y(p.v)}, ${X(i)} ${Y(p.v)}` : `M ${X(0)} ${Y(p.v)}`).join(''), lbl = v => money(v), every = Math.ceil(pts.length / (window.matchMedia('(max-width:767px)').matches ? 5 : 31));
  return <div><div className="flex gap-2"><div className="relative w-20 shrink-0 text-right text-[11px] text-slate-500" style={{ height: H }}>{ticks.map(t => <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${t / top * 100}%` }}>{lbl(t)}</span>)}</div>
    <div className="relative flex-1" style={{ height: H }}>{ticks.slice(1).map(t => <i key={t} className="absolute inset-x-0 border-t border-dashed border-slate-200" style={{ bottom: `${t / top * 100}%` }} />)}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible"><path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill="#e5e7eb" opacity=".6" /><path d={line} fill="none" stroke="#14213d" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg></div></div>
    <div className="flex gap-2"><div className="w-12 shrink-0" /><div className="flex-1 flex justify-between text-[11px] text-slate-500 pt-2">{pts.map((p, i) => <span key={p.d} className={i % every ? 'invisible' : ''}>{p.d.slice(5)}</span>)}</div></div></div>;
}

const ANSWERS = [[/công suất|tăng giá/i, 'Công suất 7 ngày tới đang thấp (khoảng 14%), chưa nên tăng giá. Nên giữ giá và cân nhắc khuyến mãi sớm cho tuần tới để kéo nhu cầu.'], [/adr|tháng trước/i, 'ADR tháng này khoảng 345.000đ. Số liệu tháng trước chưa đủ để so sánh, bạn nên xem thêm tab Báo cáo khi có dữ liệu.'], [/deluxe|cuối tuần/i, 'Cuối tuần này công suất còn thấp, gợi ý giữ giá Deluxe ở mức hiện tại và chỉ tăng khi công suất vượt 60%.']];
const SUGG = ['Tuần tới công suất bao nhiêu? Có nên tăng giá không?', 'So sánh ADR tháng này vs tháng trước', 'Gợi ý giá cuối tuần cho phòng Deluxe'];

export function Revenue() {
  const [from, setFrom] = useState(addDays(today, -29)), [to, setTo] = useState(today), [rng, setRng] = useState([from, to]), [msgs, setMsgs] = useState([]), [q, setQ] = useState('');
  const n = Math.min(62, Math.max(1, Math.round((new Date(rng[1]) - new Date(rng[0])) / 864e5) + 1)), pts = Array.from({ length: n }, (_, i) => { const d = addDays(rng[0], i); return { d, v: revOf(d) }; }), total = pts.reduce((a, p) => a + p.v, 0);
  const first = new Date(today + 'T00:00').getDay(), cells = [...Array(first).fill(null), ...Array.from({ length: 60 }, (_, i) => ({ i, d: addDays(today, i) }))];
  const ask = t => { if (!t.trim()) return; setMsgs(m => [...m, { me: true, t }, { t: ANSWERS.find(([r]) => r.test(t))?.[1] ?? 'TheBell chưa kết nối dữ liệu thật nên chưa trả lời được câu này. Bạn thử một trong các câu gợi ý nhé.' }]); setQ(''); };
  return <><Title keep t="Công cụ tối ưu doanh thu" sub="Lịch nhu cầu + tư vấn giá liên kết." />
    <div className="grid grid-cols-3 gap-5 mb-5"><Kpi I={BedDouble} v="20%" l="Công suất hôm nay" /><Kpi I={TrendingUp} v="345.000đ" l="ADR (giá TB/đêm)" /><Kpi I={TrendingUp} v="69.000đ" l="RevPAR" /></div>
    <Card className="p-6 max-md:p-4 mb-5"><div className="flex items-end justify-between mb-4 max-md:flex-col max-md:items-stretch max-md:gap-3"><div><h3 className="font-semibold text-ink">Doanh thu theo ngày</h3><p className="text-xs text-slate-500">Tổng kỳ đã chọn: <b className="text-ink">{(total / 1e6).toFixed(1)}M đ</b></p></div>
      <div className="flex items-end gap-3 max-md:gap-2"><Dt l="Từ ngày" v={from} set={v => { setFrom(v); if (to < v) setTo(v); }} /><Dt l="Đến ngày" v={to} min={from} set={setTo} /><Btn onClick={() => { if (new Date(to) - new Date(from) > 61 * 864e5) toast('Chỉ xem tối đa 62 ngày', true); setRng([from, to]); }}>Xem</Btn></div></div><Area pts={pts} /></Card>
    <div className="grid grid-cols-[1fr_380px] max-md:!grid-cols-1 gap-5 items-start">
      <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink">Lịch nhu cầu — 60 ngày tới</h3><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 mb-4">{[['<30%', 0], ['30-60%', 1], ['60-80%', 2], ['>80%', 3]].map(([l, i]) => <span key={l} className="inline-flex items-center gap-1.5"><i className="w-3 h-3 rounded-full" style={{ background: HEAT[i][1] }} />{l}</span>)}</div>
        <div className="grid grid-cols-7 gap-1.5 text-center">{DOW.map(d => <div key={d} className="text-xs font-medium text-slate-500 pb-1">{d}</div>)}
          {cells.map((c, k) => c ? <div key={k} title={`${dmy(c.d)}: công suất ${occOf(c.i)}%`} className={`rounded-md py-1 text-[11px] leading-tight ${c.i === 0 ? 'ring-2 ring-ink' : ''}`} style={{ background: heat(occOf(c.i)) }}>
            <b className="text-xs">{+c.d.slice(8)}</b>{(c.d.endsWith('-01') || c.i === 0 && false) && <div className="text-[9px] opacity-70">T{+c.d.slice(5, 7)}</div>}<div>{occOf(c.i)}%</div></div> : <div key={k} />)}</div></Card>
      <Card className="p-5 max-md:p-4 flex flex-col h-[560px] max-md:h-[480px]"><h3 className="font-semibold text-ink flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4 text-brand-dark" />TheBell — Tư vấn doanh thu</h3>
        <div className="flex-1 overflow-auto space-y-2">{msgs.length ? msgs.map((m, i) => <div key={i} className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${m.me ? 'ml-auto bg-ink text-white' : 'bg-slate-100 text-slate-700'}`}>{m.t}</div>)
          : <><p className="text-center text-xs text-slate-500 my-3">Hỏi TheBell về chiến lược giá:</p>{SUGG.map(s => <button key={s} type="button" onClick={() => ask(s)} className="block w-full text-left text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-2.5 mb-2">{s}</button>)}</>}</div>
        <form className="flex gap-2 pt-3 border-t mt-3" onSubmit={e => { e.preventDefault(); ask(q); }}><input className="field" placeholder="Hỏi về doanh thu, giá phòng..." value={q} onChange={e => setQ(e.target.value)} /><button className="w-10 h-10 shrink-0 rounded-full bg-ink text-white grid place-items-center" title="Gửi"><Send className="w-4 h-4" /></button></form></Card></div></>;
}

/* ---------------- Báo cáo vận hành ---------------- */
const compact = n => money(n) + 'đ';
const EINV = [[65, '2026-11-17', 1100000], [64, '2026-11-12', 520000], [63, '2026-11-12', 520000]]
  .map(([n, d, v]) => ({ no: `1C26TBH/${String(n).padStart(7, '0')}`, who: '', total: v, vat: 0, prov: '', st: 'Đã phát hành', d }));
const Box = ({ t, sub, right, children }) => <Card className="overflow-hidden"><div className="flex items-start justify-between gap-3 px-6 max-md:px-4 py-4 border-b"><div><h3 className="font-semibold text-ink">{t}</h3><p className="text-xs text-slate-500">{sub}</p></div>{right}</div><div className="p-6 max-md:p-4">{children}</div></Card>;
const Empty = ({ children }) => <p className="text-center text-sm text-slate-400 py-10">{children}</p>;

const TABS = [['a', 'Kiểm toán đêm'], ['o', 'OC14 (Công an)'], ['e', 'Hoá đơn điện tử'], ['d', 'Công nợ OTA']];
export function Reports() {
  const [tab, setTab] = useState('a'), [day, setDay] = useState(today), [audits, setAudits] = useState([]), [f, setF] = useState(addDays(today, -30)), [t, setT] = useState(today), [ap, setAp] = useState([f, t]), [st, setSt] = useState(''), [ast, setAst] = useState('');
  const run = () => { if (audits.some(a => a.d === day)) return toast('Ngày kinh doanh này đã được kiểm toán', true); setAudits([{ d: day, noshow: Math.floor(hash(day) * 3), rev: revOf(day), at: new Date().toLocaleTimeString('vi-VN', { hour12: false }) }, ...audits]); toast('Đã chạy kiểm toán đêm'); };
  const einv = EINV.filter(r => r.d >= ap[0] && r.d <= ap[1] && (!ast || r.st === ast));
  const Filter = ({ children }) => <div className="flex items-end gap-3 max-md:gap-2 max-md:flex-wrap mb-5">{children}<Dt l="Từ ngày" v={f} set={v => { setF(v); if (t < v) setT(v); }} /><Dt l="Đến ngày" v={t} min={f} set={setT} /><Btn onClick={() => { setAp([f, t]); setAst(st); }}>Lọc</Btn></div>;
  return <><Title keep t="Báo cáo vận hành" sub="Kiểm toán đêm, OC14, hoá đơn điện tử và công nợ OTA." />
    <div className="max-md:hidden"><Underline items={TABS} value={tab} onChange={setTab} /></div><SheetTabs items={TABS} value={tab} onChange={setTab} />
    {tab === 'a' && <Box t="Kiểm toán đêm (Night Audit)" sub="Đóng ngày kinh doanh: đánh dấu no-show, ghi nhận doanh thu ngày." right={<button type="button" title="Làm mới" className="w-9 h-9 grid place-items-center rounded-lg border hover:bg-slate-50" onClick={() => toast('Đã làm mới')}><RefreshCw className="w-4 h-4" /></button>}>
      <div className="flex items-end gap-3 max-md:gap-2 mb-5"><Dt l="Ngày kinh doanh" v={day} set={setDay} /><Btn onClick={run}><Play className="w-4 h-4 mr-1.5 inline" />Chạy kiểm toán</Btn></div>
      {audits.length ? <><div className="md:hidden space-y-2">{audits.map(a => <div key={a.d} className="rounded-xl border p-3 text-sm"><div className="flex justify-between"><b>{dmy(a.d)}</b><b>{money(a.rev)}đ</b></div><div className="text-xs text-slate-500 mt-1">No-show: {a.noshow} · Chạy lúc {a.at}</div></div>)}</div><div className="max-md:hidden"><table className="w-full text-sm"><thead><tr className="border-b text-xs text-slate-500">{['Ngày kinh doanh', 'No-show', 'Doanh thu ngày', 'Chạy lúc'].map((h, i) => <th key={h} className={`py-2 font-semibold ${i === 2 ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{audits.map(a => <tr key={a.d} className="border-b last:border-0"><td className="py-3">{dmy(a.d)}</td><td>{a.noshow}</td><td className="text-right font-semibold">{money(a.rev)}đ</td><td className="text-slate-500">{a.at}</td></tr>)}</tbody></table></div></> : <Empty>Chưa có kiểm toán nào.</Empty>}</Box>}
    {tab === 'o' && <Box t="OC14 — Khai báo người nước ngoài" sub="Danh sách khách nước ngoài lưu trú trong kỳ."><Filter><Btn kind="ghost" className="max-md:order-last max-md:basis-full" disabled><Download className="w-4 h-4 mr-1.5 inline" />Xuất CSV</Btn></Filter><Empty>Không có khách nước ngoài trong kỳ này.</Empty></Box>}
    {tab === 'e' && <Box t="Hoá đơn điện tử" sub="Danh sách hoá đơn điện tử và trạng thái nhà cung cấp.">
      <Filter><label className="block max-md:basis-full"><span className="block text-xs text-slate-500 mb-1">Trạng thái</span><select className="field !w-40 max-md:!w-full" value={st} onChange={e => setSt(e.target.value)}><option value="">Tất cả</option><option>Đã phát hành</option><option>Chờ phát hành</option><option>Đã huỷ</option></select></label></Filter>
      <div className="md:hidden space-y-2">{einv.map(r => <div key={r.no} className="rounded-xl border p-3 text-sm"><div className="flex justify-between gap-2"><b className="break-all">{r.no}</b><b>{compact(r.total)}</b></div><div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500"><span>{dmy(r.d)} · VAT {r.vat}%</span><span className="px-2 py-0.5 rounded-full bg-navy-700/10 text-ink font-medium">{r.st}</span></div></div>)}</div>
      <div className="max-md:hidden"><table className="w-full text-sm"><thead><tr className="bg-slate-50 text-xs text-slate-500">{['Số HĐ', 'Khách / Công ty', 'Tổng tiền', 'VAT', 'Nhà CC', 'Trạng thái', 'Ngày'].map((h, i) => <th key={h} className={`px-4 py-3 font-semibold ${i === 2 || i === 3 ? 'text-right' : i > 3 ? 'text-center' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{einv.map(r => <tr key={r.no} className="border-b last:border-0"><td className="px-4 py-3.5">{r.no}</td><td className="px-4 text-slate-400">{r.who || '—'}</td><td className="px-4 text-right font-semibold">{compact(r.total)}</td><td className="px-4 text-right text-slate-500">{r.vat}%</td><td className="px-4 text-center text-slate-400">{r.prov || '—'}</td>
          <td className="px-4 text-center"><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-700/10 text-ink">{r.st}</span></td><td className="px-4 text-center text-slate-400">{dmy(r.d)}</td></tr>)}</tbody></table></div>{!einv.length && <Empty>Không có hoá đơn trong kỳ này.</Empty>}</Box>}
    {tab === 'd' && <Box t="Công nợ OTA" sub="Tổng hợp hoa hồng và công nợ theo kênh đặt phòng."><Filter /><Empty>Không có công nợ OTA trong kỳ này.</Empty></Box>}</>;
}
