import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, CalendarCheck, ClipboardList, Hammer, Globe, Inbox, LayoutGrid, Package, TrendingUp, Wallet } from 'lucide-react';
import { addDays, money, useDB, ymd } from '../store.jsx';
import { debtOf, stockOf, useStock } from '../stockStore.js';
import { useFin } from '../finStore.js';
import { Title, Card } from '../ui.jsx';
import { RAW } from './Booking.jsx';

// ponytail: số liệu doanh thu/khách là số mẫu (PMS chưa có backend) — nối API báo cáo khi có PMS
const vnd = n => money(Math.round(n)) + 'đ', tr = n => money(Math.round(n)) + 'đ';
const TODAY = ymd(new Date()), rnd = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }, revOf = d => Math.round((0.6 + rnd(Date.parse(d) / 864e5) * 1.4) * 10) * 1e5;
const TILES = [
  [CalendarCheck, 'Nhận / trả phòng', 'Khách đến và khách đi hôm nay', '/pms/front-desk'], [LayoutGrid, 'Sơ đồ phòng', 'Xem phòng trống, phòng có khách, phòng bẩn', '/pms/so-do-phong'],
  [BedDouble, 'Buồng phòng', 'Phòng nào cần dọn', '/pms/buong-phong'], [TrendingUp, 'Bán phòng trên OTA', 'Chỉnh giá và số phòng bán', '/sales'],
  [Inbox, 'Đặt phòng từ OTA', 'Booking.com, Agoda, Trip.com…', '/booking'], [ClipboardList, 'Bàn giao ca', 'Chốt tiền và việc cho ca sau', '/pms/ban-giao-ca']];
const Tile = ([I, t, d, to]) => <Link key={to} to={to} className="group flex items-center gap-2 lg:gap-4 rounded-2xl border border-slate-200 bg-white p-2.5 lg:p-5 hover:border-brand hover:shadow-md transition">
  <span className="w-9 h-9 lg:w-14 lg:h-14 shrink-0 rounded-2xl bg-brand/10 text-brand-dark grid place-items-center group-hover:bg-brand group-hover:text-white transition"><I className="w-7 h-7" /></span>
  <span className="min-w-0"><span className="block truncate text-[13px] lg:text-lg font-semibold text-ink leading-snug">{t}</span><span className="hidden lg:block text-sm text-slate-500">{d}</span></span><ArrowRight className="hidden lg:block w-5 h-5 ml-auto text-slate-300 group-hover:text-brand-dark shrink-0" /></Link>;
const Kpi = ({ l, v, n }) => <Card className="p-4 lg:p-5"><div className="text-sm text-slate-500">{l}</div><div className="text-xl lg:text-3xl font-bold text-ink my-1 break-words">{v}</div><div className="text-xs text-slate-400">{n}</div></Card>;
const Alert = ({ I, n, label, hint, to, fmt, red }) => <Link to={to} className={`flex items-center gap-4 rounded-2xl border p-5 transition hover:shadow-md ${n ? (red ? 'bg-red-50 border-red-200 hover:border-red-400' : 'bg-white border-slate-200 hover:border-brand') : 'bg-white border-slate-200'}`}>
  <I className={`w-8 h-8 shrink-0 ${n ? (red ? 'text-red-600' : 'text-brand-dark') : 'text-slate-300'}`} strokeWidth={1.6} /><div className="min-w-0"><div className={`text-2xl font-bold ${n ? (red ? 'text-red-600' : 'text-ink') : 'text-slate-300'}`}>{fmt ? fmt(n) : n}</div><div className="text-sm text-slate-600">{label}</div><div className="text-xs text-slate-400">{n ? hint : 'Không có việc cần xử lý'}</div></div></Link>;
const H = ({ children, right }) => <div className="flex items-end justify-between mb-3"><h2 className="text-lg font-semibold text-ink">{children}</h2>{right}</div>;
const Bar = ({ l, v, max, sub }) => <div className="mb-3 last:mb-0"><div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink">{l}</span><span className="text-slate-600">{sub}</span></div><div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-brand-dark" style={{ width: `${Math.max(2, v / max * 100)}%` }} /></div></div>;

export default function Overview() {
  const { db } = useDB(), [s] = useStock(), [fin] = useFin(), name = db.account.ho_va_ten || '', date = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const newOta = RAW.filter(r => r[5] === 'Mới').length, offline = db.channels.filter(c => c.active && !c.connected).length,
    low = s.mats.filter(m => m.min > 0 && s.whs.reduce((a, w) => a + stockOf(s, w.id, m.id), 0) < m.min).length, debt = s.sups.reduce((a, x) => a + Math.max(0, debtOf(s, x.id).left), 0);
  const days = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6)).map(d => ({ d, v: revOf(d) })), maxD = Math.max(...days.map(x => x.v)), week = days.reduce((a, x) => a + x.v, 0), month = Array.from({ length: +TODAY.slice(8) }, (_, i) => revOf(TODAY.slice(0, 8) + String(i + 1).padStart(2, '0'))).reduce((a, b) => a + b, 0);
  const chan = [['Agoda', 0.654, '#e91e63'], ['Expedia', 0.237, '#fdc52b'], ['CTrip / Trip.com', 0.109, '#475569']].map(([l, p, c]) => [l, Math.round(month * p), c, p]), cg = chan.reduce((a, [, , c, p]) => { const f = a.at; a.at += p * 100; a.s.push(`${c} ${f}% ${a.at}%`); return a; }, { at: 0, s: [] }).s.join(','), direct = 18, ota = RAW.filter(r => r[5] !== 'Đã huỷ').length + 9;
  const cash = id => fin.base[id] + fin.vouchers.filter(v => v.fund === id).reduce((a, v) => a + (v.type === 'thu' ? v.amount : -v.amount), 0), dow = d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(d + 'T00:00').getDay()];
  const otaDebt = RAW.filter(r => r[5] !== 'Đã huỷ').reduce((a, r) => a + r[7], 0); // ponytail: tạm = tổng đặt phòng OTA chưa huỷ, tách phần OTA thu hộ khi có dữ liệu thanh toán
  const upcoming =RAW.filter(r => r[5] !== 'Đã huỷ').sort((a, b) => a[3].localeCompare(b[3])).slice(0, 3);
  return <>
    <Title keep t={`Xin chào${name ? ', ' + name : ''}!`} sub={`Hôm nay là ${date}.`} />
    <H>Tình hình kinh doanh</H>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-5"><Kpi l="Doanh thu hôm nay" v={tr(revOf(TODAY))} n="Tất cả phòng và dịch vụ" /><Kpi l="Doanh thu 7 ngày qua" v={tr(week)} n={`Trung bình ${tr(week / 7)} mỗi ngày`} /><Kpi l="Doanh thu tháng này" v={tr(month)} n={`Tính đến ngày ${+TODAY.slice(8)}`} /><Kpi l="Công suất phòng hôm nay" v="13%" n="8 / 64 phòng đang có khách · ADR 204.000đ · RevPAR 27.000đ" /></div>
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-5 mb-8">
      <Card className="p-4 lg:p-6"><div className="flex items-baseline justify-between mb-5"><h3 className="font-semibold text-ink">Doanh thu 7 ngày gần nhất</h3><span className="text-xs text-slate-400">Đơn vị: đồng</span></div>
        <div className="flex items-end gap-1.5 lg:gap-3 h-60">{days.map(x => <div key={x.d} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5" title={`${dow(x.d)} ${x.d.slice(8)}/${x.d.slice(5, 7)}: ${vnd(x.v)}`}><span className="text-xs max-md:text-[10px] font-semibold text-ink max-md:[writing-mode:vertical-rl] max-md:rotate-180">{money(x.v)}</span><div className={`w-full rounded-t-md ${x.d === TODAY ? 'bg-brand-dark' : 'bg-brand/40'}`} style={{ height: `${x.v / maxD * 100 * 0.78}%` }} /></div>)}</div>
        <div className="flex gap-1.5 lg:gap-3 mt-2">{days.map(x => <span key={x.d} className={`flex-1 text-center text-xs leading-tight ${x.d === TODAY ? 'font-semibold text-ink' : 'text-slate-500'}`}>{dow(x.d)}<br className="lg:hidden" /><span className="hidden lg:inline"> </span>{x.d.slice(8)}</span>)}</div></Card>
      <Card className="p-4 lg:p-6"><h3 className="font-semibold text-ink">Nguồn đặt phòng</h3><p className="text-sm text-slate-500 mb-4">MTD · tỉ lệ doanh thu theo kênh</p>
        <div className="mx-auto w-44 h-44 rounded-full grid place-items-center mb-5" style={{ background: `conic-gradient(${cg})` }}><div className="w-[60%] h-[60%] rounded-full bg-white" /></div>
        {chan.map(([l, v, c, p]) => <div key={l} className="flex items-center gap-3 py-1.5 text-sm" title={tr(v)}><span className="w-3 h-3 rounded-full" style={{ background: c }} /><span className="flex-1 text-ink">{l}</span><span className="font-mono text-slate-500">{(p * 100).toFixed(1)}%</span></div>)}
      </Card></div>
    <H>Tiền và công nợ</H>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8"><Kpi l="Tiền mặt trong quỹ" v={vnd(cash('cash'))} n="Theo sổ quỹ tiền mặt" /><Kpi l="Tiền gửi ngân hàng" v={vnd(cash('bank'))} n="Theo sổ quỹ tiền gửi" /><Kpi l="Còn nợ nhà cung cấp" v={vnd(debt)} n="Cần thanh toán" /><Kpi l="Công nợ từ OTA" v={vnd(otaDebt)} n="OTA thu hộ, chưa chuyển về khách sạn" /></div>
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-5 mb-8">
      <div><H>Cần chú ý</H><div className="grid grid-cols-2 gap-4">
        <Alert I={Inbox} n={newOta} label="Đặt phòng OTA mới" hint="Bấm để xem danh sách" to="/booking" /><Alert I={Globe} n={offline} label="Kênh OTA chưa kết nối" hint="Cần kết nối để nhận đặt phòng" to="/sync" />
        <Alert red I={Package} n={low} label="Hàng trong kho sắp hết" hint="Dưới mức tồn tối thiểu" to="/pms/quan-ly-kho/quan-ly-kho" /><Alert red I={Wallet} n={debt} label="Còn nợ nhà cung cấp" hint="Bấm để thanh toán" to="/pms/quan-ly-kho/quan-ly-mua-hang" fmt={v => v ? tr(v) : 0} /></div></div>
      <div><H right={<Link to="/booking" className="text-sm font-medium text-brand-dark">Xem tất cả</Link>}>Khách OTA sắp đến</H>
        <Card className="divide-y">{upcoming.map(r => <div key={r[0]} className="flex items-center gap-4 px-5 py-4"><span className="w-12 h-12 rounded-xl bg-brand/10 text-brand-dark grid place-items-center text-center leading-tight"><span><b className="block text-base">{r[3].slice(8)}</b><span className="text-[10px]">Th{+r[3].slice(5, 7)}</span></span></span>
          <div className="min-w-0 flex-1"><div className="font-semibold text-ink truncate">{r[2]}</div><div className="text-sm text-slate-500">{r[1] === 'CTrip' ? 'Trip.com' : r[1] === 'BookingCom' ? 'Booking.com' : r[1]} · {r[6]} phòng</div></div><b className="text-ink">{tr(r[7])}</b></div>)}
          {!upcoming.length && <p className="text-center text-slate-400 py-8">Chưa có khách sắp đến</p>}</Card></div></div>
    <H>Làm việc nhanh</H><div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">{TILES.map(Tile)}</div>
    <p className="text-xs text-slate-400 mt-6">Số liệu doanh thu và khách là dữ liệu mẫu, sẽ tự cập nhật khi nối với hệ thống đặt phòng thật.</p>
  </>;
}

export const Soon = ({ t, bare }) => <>{!bare && <Title keep t={t} sub="Tính năng đang phát triển" />}<Card className="py-20 text-center"><div className="w-14 h-14 mx-auto rounded-2xl bg-brand/10 text-brand-dark grid place-items-center"><Hammer className="w-6 h-6" /></div><div className="mt-4 font-semibold text-ink">{bare ? t : 'Sắp ra mắt'}</div><div className="text-sm text-slate-400 mt-1">Tính năng đang được phát triển</div></Card></>;
