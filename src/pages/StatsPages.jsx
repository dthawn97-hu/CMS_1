import { useState } from 'react';
import { BedDouble, CalendarDays, CheckCircle2, Clock, LogIn, LogOut, MessageCircle, MessagesSquare, TrendingUp, TriangleAlert, UserPlus } from 'lucide-react';
import { money, ymd } from '../store.jsx';
import { Card, Title } from '../ui.jsx';

// ponytail: số liệu mẫu cố định (PMS chưa có backend) — nối API thống kê khi có PMS
const BAR = ['#0f7c8c', '#14213d', '#2bb3c6', '#64748b'];

/* Biểu đồ cột thuần CSS: không thêm thư viện */
function Bars({ data, h = 230, fmt = v => v, xLabel }) {
  const max = Math.max(...data.map(d => d.v), 1), raw = max / 4, p = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].find(m => m * p >= raw) * p, top = Math.ceil(max / step) * step, ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  return <div className="pt-3"><div className="flex gap-2"><div className="relative w-28 shrink-0 text-right text-[11px] text-slate-500" style={{ height: h }}>{ticks.map(t => <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${t / top * 100}%` }}>{fmt(t)}</span>)}</div>
    <div className="relative flex-1 border-l border-b border-slate-300" style={{ height: h }}>{ticks.slice(1).map(t => <i key={t} className="absolute inset-x-0 border-t border-dashed border-slate-200" style={{ bottom: `${t / top * 100}%` }} />)}
      <div className="absolute inset-0 flex items-end">{data.map((d, i) => <div key={i} className="flex-1 h-full flex items-end justify-center px-[8%]" title={`${d.l}: ${fmt(d.v)}`}><div className="w-full rounded-t transition-all" style={{ height: `${d.v / top * 100}%`, minHeight: d.v ? 2 : 0, background: d.c ?? BAR[i % BAR.length] }} /></div>)}</div></div></div>
    <div className="flex gap-2"><div className="w-14 shrink-0" /><div className="flex-1 flex">{data.map((d, i) => <span key={i} className="flex-1 text-center text-xs text-slate-600 pt-2">{d.l}</span>)}</div></div>{xLabel && <div className="text-center text-xs text-slate-400 mt-1">{xLabel}</div>}</div>;
}
const Kpi = ({ I, v, l }) => <Card className="p-5 max-md:p-3.5 flex items-center gap-4 max-md:gap-3"><I className="w-8 h-8 max-md:w-6 max-md:h-6 text-brand-dark shrink-0" strokeWidth={1.7} /><div className="min-w-0"><div className="text-2xl max-md:text-xl font-bold text-ink leading-tight">{v}</div><div className="text-xs text-slate-500">{l}</div></div></Card>;
const Panel = ({ t, children, empty }) => <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink mb-4">{t}</h3>{empty ? <p className="text-center text-sm text-slate-400 py-10">{empty}</p> : children}</Card>;
const Sec = ({ t, sub }) => <div className="mt-8 mb-4"><h2 className="text-lg font-semibold text-ink">{t}</h2><p className="text-sm text-slate-500">{sub}</p></div>;

/* ---------------- Thống kê chung ---------------- */
export function GeneralStats() {
  return <><Title keep t="Thống kê" sub="Tổng quan hoạt động và hiệu suất AI." />
    <div className="grid grid-cols-3 gap-5 mb-5"><Kpi I={MessageCircle} v="5" l="Tổng hội thoại" /><Kpi I={CheckCircle2} v="0%" l="Tự động giải quyết" /><Kpi I={MessagesSquare} v="8" l="Tổng tin nhắn" />
      <Kpi I={TriangleAlert} v="0" l="Đang chờ hỗ trợ" /><Kpi I={Clock} v="—" l="Thời gian phản hồi TB" /><Kpi I={UserPlus} v="0" l="Khách mới (7 ngày)" /></div>
    <div className="space-y-5"><Panel t="Tin nhắn theo ngày" empty="Chưa có dữ liệu trong 7 ngày qua." /><Panel t="Câu hỏi thường gặp nhất" empty="Chưa có dữ liệu." /></div>
    <Sec t="PMS — Vận hành khách sạn" sub="Công suất, doanh thu và nhịp đặt phòng." />
    <div className="grid grid-cols-5 gap-5 mb-5"><Kpi I={BedDouble} v="20%" l="Công suất phòng" /><Kpi I={TrendingUp} v="345.000đ" l="ADR (giá phòng TB)" /><Kpi I={TrendingUp} v="69.000đ" l="RevPAR" /><Kpi I={LogIn} v="1" l="Nhận phòng hôm nay" /><Kpi I={LogOut} v="0" l="Trả phòng hôm nay" /></div>
    <div className="grid grid-cols-2 max-md:!grid-cols-1 gap-5"><Panel t="Doanh thu theo kênh (30 ngày)"><Bars h={260} fmt={v => money(v) + ' đ'} data={[{ l: 'Trực tiếp', v: 69.5e6 }, { l: 'OTA khác', v: 5.2e6 }, { l: 'Walk-in', v: 0.4e6 }]} /></Panel>
      <Panel t="Nhịp đặt phòng (lead time, 90 ngày)"><Bars h={260} xLabel="Ngày trước" data={[[0, 117], [1, 5], [2, 2], [3, 2], [10, 1], [22, 1], [31, 1]].map(([l, v]) => ({ l, v, c: '#2bb3c6' }))} /></Panel></div></>;
}

/* ---------------- Thống kê vận hành ---------------- */
const Line = ({ l, v, u = 'phòng', badge }) => <div className="flex items-center justify-between py-2.5 border-b last:border-0 text-sm"><span className="text-slate-600">{l}</span>{badge ? <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-semibold">{v}</span> : <span><b className="text-ink">{v}</b> <span className="text-xs text-slate-500">{u}</span></span>}</div>;
const Grid3 = ({ l, a }) => <div className="grid grid-cols-[1fr_repeat(3,56px)] items-center py-2.5 border-b last:border-0 text-sm"><span className="text-slate-600">{l}</span>{a.map((x, i) => <b key={i} className="text-right text-ink">{x}</b>)}</div>;

export function OpsStats() {
  const [tab, setTab] = useState('s'), today = new Date(), [day, setDay] = useState(ymd(today)), [view, setView] = useState(false);
  const date = today.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const Stats = () => <div className="space-y-5"><div className="grid grid-cols-3 max-md:!grid-cols-1 gap-5">
    <Panel t="Công suất dự kiến"><Line l="Tổng số phòng sẵn sàng" v="64" /><Line l="Dự kiến phòng chiếm dụng" v="12" /><Line l="Công suất dự kiến (%)" v="19%" badge /></Panel>
    <Panel t="Khách dự kiến"><div className="grid grid-cols-[1fr_repeat(3,56px)] pb-1 text-[11px] text-slate-400"><span /><span className="text-right">Người lớn</span><span className="text-right">Trẻ em</span><span className="text-right">Tổng</span></div><Grid3 l="Dự kiến đến" a={[0, 0, 0]} /><Grid3 l="Tổng khách dự kiến" a={[0, 20, 20]} /></Panel>
    <Panel t="Đến / đi trong ngày"><Line l="Tổng dự kiến đến trong ngày" v="2" /><Line l="Tổng dự kiến đi trong ngày" v="1" /></Panel></div>
    <div className="grid grid-cols-3 max-md:!grid-cols-1 gap-5"><Panel t="Thống kê phòng"><Line l="Tổng số phòng" v="64" /><Line l="Phòng hỏng / bảo trì" v="0" /><Line l="Tổng số phòng sẵn sàng" v="64" /></Panel></div>
    <Card className="p-6 max-md:p-4"><div className="flex items-center gap-2 mb-3"><CalendarDays className="w-4 h-4 text-brand-dark" /><h3 className="font-semibold text-ink">Thống kê phòng trống (7 ngày)</h3></div>
      <div className="flex gap-2"><input type="date" className="field !w-44 max-md:!w-auto max-md:flex-1 min-w-0" value={day} onChange={e => e.target.value && setDay(e.target.value)} /><button type="button" className="px-4 rounded-lg border text-sm font-semibold hover:bg-slate-50" onClick={() => setView(true)}>Xem</button></div>
      {view ? <div className="mt-5 grid grid-cols-7 max-md:!grid-cols-[repeat(4,minmax(0,1fr))] gap-2 text-center text-sm">{Array.from({ length: 7 }, (_, i) => { const d = new Date(day + 'T00:00'); d.setDate(d.getDate() + i); return <div key={i} className="rounded-lg border p-3"><div className="text-xs text-slate-500">{d.toLocaleDateString('vi-VN', { weekday: 'short' })} {d.getDate()}/{d.getMonth() + 1}</div><div className="text-xl font-bold text-ink mt-1">{64 - [12, 14, 9, 20, 25, 18, 11][i]}</div><div className="text-[11px] text-slate-400">phòng trống</div></div>; })}</div>
        : <p className="text-center text-sm text-slate-400 py-8">Chưa có dữ liệu phòng</p>}</Card>
    <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink mb-3">Trạng thái buồng phòng (cảnh báo)</h3><div className="grid grid-cols-2 max-md:!grid-cols-1 gap-8 max-md:gap-0"><Line l="Bẩn do khách ở (occupied + dirty)" v="0" /><Line l="Phòng trống bẩn (vacant + dirty)" v="4" /></div></Card></div>;
  const Charts = () => <div className="grid grid-cols-2 max-md:!grid-cols-1 gap-5"><Panel t="Hoạt động trong ngày (phòng)"><Bars data={[{ l: 'Đã đến', v: 2, c: '#0f7c8c' }, { l: 'Dự kiến đến', v: 0 }, { l: 'Đã đi', v: 0 }, { l: 'Dự kiến đi', v: 1, c: '#2bb3c6' }]} /></Panel>
    <Panel t="Kho phòng"><Bars data={[{ l: 'Tổng phòng', v: 64, c: '#14213d' }, { l: 'Sẵn sàng', v: 64, c: '#0f7c8c' }, { l: 'Bảo trì', v: 0 }]} /></Panel>
    <Panel t="Khách trong khách sạn (người)"><Bars data={[['Đang ở', 20], ['Dự kiến đi', 1], ['Ở qua ngày', 1], ['Dự kiến đến', 0], ['Tổng dự kiến', 20]].map(([l, v]) => ({ l, v, c: '#14213d' }))} /></Panel>
    <Panel t="Buồng phòng cần xử lý"><Bars data={[{ l: 'Bẩn do khách ở', v: 0 }, { l: 'Phòng trống bẩn', v: 4, c: '#2bb3c6' }]} /></Panel></div>;
  return <><Title keep t="Thống kê vận hành" sub={date} />
    <div className="inline-flex max-md:flex bg-slate-100 rounded-xl p-1 mb-5">{[['s', 'Thống kê'], ['c', 'Biểu đồ thống kê']].map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm max-md:flex-1 max-md:px-2 ${tab === k ? 'bg-white text-ink font-semibold shadow-sm' : 'text-slate-500'}`}>{l}</button>)}</div>
    {tab === 's' ? <Stats /> : <Charts />}</>;
}
