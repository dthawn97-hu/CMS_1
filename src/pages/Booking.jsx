import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Download, Filter, Search, X } from 'lucide-react';
import { useDB, addDays, money } from '../store.jsx';
import { Btn, Title, Card, Tabs, toast } from '../ui.jsx';

/* Dữ liệu giả để xem giao diện — chưa nối kênh bán / PMS thật */
const TODAY = '2026-11-19';
const CH = { CTrip: { name: 'Trip.com', pkg: 'STD - TRIP', mail: 'guest.trip.com' }, BookingCom: { name: 'Booking.com', pkg: 'STD - BOOKING', mail: 'guest.booking.com' }, Agoda: { name: 'Agoda', pkg: 'STD - AGODA', mail: 'guest.agoda.com' } };
const RAW = [ // mã, kênh, khách, nhận, trả, trạng thái, số phòng, tổng, đặt lúc, đồng bộ
  ['CTP-1688902984982093', 'CTrip', 'Jenny Quach', '2026-12-30', '2027-01-05', 'Mới', 1, 11545794, '2026-11-19 06:57', 'Đã nhận'],
  ['CTP-1433816268429971', 'CTrip', 'AMMARA MIKHAYLA BINTI MOHD RAZALI', '2026-12-12', '2026-12-14', 'Đã huỷ', 2, 4618316, '2026-11-18 01:44', 'Đã nhận'],
  ['BDC-5699278455', 'BookingCom', 'Bendang Watisungla', '2026-12-26', '2026-12-29', 'Mới', 1, 6025039, '2026-11-17 19:41', 'Đã nhận'],
  ['CTP-1433816247023501', 'CTrip', 'Syakirah Aiah', '2026-12-29', '2027-01-02', 'Đã huỷ', 1, 6696560, '2026-11-17 16:13', 'Đã nhận'],
  ['CTP-1539369346372156', 'CTrip', 'Viktor Iakushenko', '2027-01-04', '2027-01-08', 'Mới', 1, 3966456, '2026-11-16 12:35', 'Đã nhận'],
  ['BDC-6505787823', 'BookingCom', 'Joan Stewart', '2026-11-17', '2026-11-18', 'Đã huỷ', 1, 805521, '2026-11-16 11:25', 'Đã nhận'],
  ['AGO-1798180984', 'Agoda', 'Lệ Nguyễn Thị', '2027-01-01', '2027-01-06', 'Mới', 2, 8325176, '2026-11-15 16:31', 'Đã nhận'],
  ['BDC-6393860481', 'BookingCom', 'Yiğit can Laz', '2026-11-14', '2026-11-15', 'Mới', 1, 805521, '2026-11-14 23:09', 'Đã nhận'],
  ['CTP-1433816189088919', 'CTrip', 'MUHAMMAD UMAR RAZIN BIN ABDULLAH', '2026-12-16', '2026-12-18', 'Đã sửa', 1, 1897256, '2026-11-14 10:54', 'Đã nhận'],
  ['BDC-5115692200', 'BookingCom', 'Rahul Vardiyani', '2027-01-22', '2027-01-24', 'Đã huỷ', 1, 2553710, '2026-11-13 16:04', 'Đã nhận'],
  ['BDC-6488725324', 'BookingCom', 'Yana Solyanik', '2026-12-27', '2026-12-30', 'Mới', 3, 9691128, '2026-11-13 15:53', 'Đã nhận'],
  ['CTP-1539369262653051', 'CTrip', 'IRINA kilina', '2026-12-30', '2027-01-08', 'Mới', 1, 14200000, '2026-11-13 13:10', 'Chưa nhận'],
];
const nightsOf = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const dmy = s => s.slice(0, 10).split('-').reverse().join('/'), dm = s => s.slice(5, 10).split('-').reverse().join('-');
const short = c => (c.length > 16 ? c.slice(0, 8) + '…' + c.slice(-4) : c);
const copy = t => { navigator.clipboard?.writeText(t); toast('Đã sao chép'); };
const STATUS = { 'Mới': 'bg-green-50 text-green-700', 'Đã huỷ': 'bg-red-50 text-red-600', 'Đã sửa': 'bg-amber-50 text-amber-700' };
const Stat = ({ s }) => <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS[s]}`}>{s}</span>;
const Chan = ({ c }) => <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium">{c}</span>;
const EMPTY = { dateType: 'ci', from: '', to: '', channels: [], status: '', sync: '', by: 'name', kw: '' };

export default function Booking() {
  const { db } = useDB(), [tab, setTab] = useState('list'), [q, setQ] = useState(''), [open, setOpen] = useState(false), [draft, setDraft] = useState(EMPTY), [f, setF] = useState(EMPTY), [sel, setSel] = useState(null);
  const rooms = db.rooms.map(r => r.ten_phong_vi), hotel = db.hotel.ten_khach_san || 'Khách sạn';
  const all = useMemo(() => RAW.map(([code, ch, guest, ci, co, status, n, total, at, sync], k) => {
    const nights = nightsOf(ci, co), per = total / n;
    return { code, ch, guest, ci, co, status, total, at, sync, nights, n, sysId: 'CX-' + (3581 + k * 977).toString(16).toUpperCase().padStart(4, '0') + 'CD' + (90 + k),
      rooms: Array.from({ length: n }, (_, i) => ({ hang: rooms[(k + i) % rooms.length] || 'Phòng', pkg: CH[ch].pkg, promo: 'Standard', adults: 2 + (i + k) % 3, kids: k % 2, infants: 0, price: per, nightly: Array.from({ length: nights }, () => per / nights) })) };
  }), [db.rooms]);
  const list = all.filter(b => {
    const d = f.dateType === 'ci' ? b.ci : f.dateType === 'co' ? b.co : b.at.slice(0, 10);
    const kw = (f.kw || q).toLowerCase(), hay = (q ? b.code : f.by === 'name' ? b.guest : b.code).toLowerCase();
    return (!f.from || d >= f.from) && (!f.to || d <= f.to) && (!f.channels.length || f.channels.includes(b.ch)) && (!f.status || b.status === f.status) && (!f.sync || b.sync === f.sync) && (!kw || hay.includes(kw));
  });
  const apply = () => { setF(draft); setOpen(false); }, reset = () => { setDraft(EMPTY); setF(EMPTY); };
  const quick = (a, b) => setDraft(d => ({ ...d, from: a, to: b }));
  const exportCsv = () => {
    const head = ['Mã booking', 'Tên khách', 'Kênh', 'Ngày đặt', 'Nhận phòng', 'Trả phòng', 'Số đêm', 'Số phòng', 'Trạng thái', 'Tổng đơn'];
    const rows = list.map(b => [b.code, b.guest, CH[b.ch].name, b.at, b.ci, b.co, b.nights, b.n, b.status, Math.round(b.total)]);
    const csv = '﻿' + [head, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'dat-phong.csv'; a.click(); toast(`Đã xuất ${rows.length} đơn`);
  };
  const lbl = 'text-[11px] font-semibold tracking-wide text-slate-400 uppercase mb-1.5';
  const chOn = [...new Set(all.map(b => b.ch))], chOther = db.channels.map(c => c.name).filter(n => !chOn.some(c => CH[c].name === n));
  return <>
    <Title t="Danh sách đặt phòng" sub="Quản lý danh sách khách đã đặt phòng từ tất cả các kênh bán." />
    <Tabs value={tab} onChange={setTab} items={[['list', 'Danh sách đặt phòng'], ['report', 'Báo cáo đặt phòng']]} />
    <Card className="p-5">
      <div className="relative flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field !pl-10" placeholder="Nhập mã đặt phòng OTA" value={q} onChange={e => setQ(e.target.value)} /></div>
        <Btn kind="ghost" onClick={() => { setDraft(f); setOpen(o => !o); }}><Filter className="w-4 h-4 inline mr-1.5 -mt-0.5" />Bộ lọc</Btn>
        <Btn kind="ghost" onClick={exportCsv}><Download className="w-4 h-4 inline mr-1.5 -mt-0.5" />Xuất Excel</Btn>
        {open && <div className="absolute z-30 left-0 top-full mt-2 w-[660px] bg-white border border-slate-200 rounded-xl shadow-2xl p-5">
          <div className={lbl}>Lọc theo ngày</div>
          <div className="flex items-center gap-2 mb-2"><select className="field pr-9 !w-44" value={draft.dateType} onChange={e => setDraft({ ...draft, dateType: e.target.value })}><option value="ci">Nhận phòng</option><option value="co">Trả phòng</option><option value="at">Ngày đặt</option></select>
            <input type="date" className="field" value={draft.from} onChange={e => setDraft({ ...draft, from: e.target.value })} /><span className="text-slate-400">→</span><input type="date" className="field" value={draft.to} min={draft.from} onChange={e => setDraft({ ...draft, to: e.target.value })} /></div>
          <div className="flex gap-2 mb-4">{[['Hôm nay', TODAY, TODAY], ['Ngày mai', addDays(TODAY, 1), addDays(TODAY, 1)], ['7 ngày tới', TODAY, addDays(TODAY, 6)], ['Tháng này', '2026-11-01', '2026-11-30']].map(([t, a, b]) => <button key={t} type="button" className="px-2.5 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:border-ink" onClick={() => quick(a, b)}>{t}</button>)}</div>
          <div className={lbl}>Kênh bán</div>
          <div className="border border-slate-200 rounded-lg p-3 mb-4 max-h-44 overflow-y-auto"><div className="text-[11px] text-slate-400 mb-1">KÊNH ĐÃ CÓ ĐƠN</div>
            <div className="grid grid-cols-2 gap-1 mb-2">{chOn.map(c => <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={draft.channels.includes(c)} onChange={e => setDraft({ ...draft, channels: e.target.checked ? [...draft.channels, c] : draft.channels.filter(x => x !== c) })} />{CH[c].name}</label>)}</div>
            <div className="text-[11px] text-slate-400 mb-1">KÊNH KHÁC</div><div className="grid grid-cols-2 gap-1 text-sm text-slate-500">{chOther.map(n => <label key={n} className="flex items-center gap-2"><input type="checkbox" className="rounded" disabled />{n}</label>)}</div></div>
          <div className="grid grid-cols-2 gap-3 mb-4"><div><div className={lbl}>Trạng thái đặt phòng</div><select className="field" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="">Tất cả trạng thái</option><option>Mới</option><option>Đã sửa</option><option>Đã huỷ</option></select></div>
            <div><div className={lbl}>Trạng thái đồng bộ</div><select className="field" value={draft.sync} onChange={e => setDraft({ ...draft, sync: e.target.value })}><option value="">Tất cả đồng bộ</option><option>Đã nhận</option><option>Chưa nhận</option></select></div></div>
          <div className={lbl}>Tìm kiếm theo</div>
          <div className="flex gap-2 mb-4"><select className="field pr-9 !w-44" value={draft.by} onChange={e => setDraft({ ...draft, by: e.target.value })}><option value="name">Tên khách</option><option value="code">Mã đặt phòng</option></select><input className="field" placeholder={draft.by === 'name' ? 'Tên khách' : 'Mã đặt phòng'} value={draft.kw} onChange={e => setDraft({ ...draft, kw: e.target.value })} /></div>
          <div className="flex justify-between items-center border-t pt-3"><button type="button" className="text-sm font-medium" onClick={reset}>Đặt lại</button><Btn onClick={apply}>Tìm kiếm</Btn></div></div>}
      </div>
      {tab === 'list' ? <div className="overflow-x-auto"><div className="min-w-[900px]">
        <div className="grid grid-cols-[1fr_210px_150px_110px_120px] gap-3 px-4 py-3 bg-slate-50 rounded-lg text-[11px] font-semibold tracking-wide text-slate-500"><span>KHÁCH</span><span>LƯU TRÚ</span><span className="text-right">TỔNG CỘNG</span><span>TRẠNG THÁI</span><span>ĐẶT LÚC</span></div>
        {list.length ? list.map(b => <div key={b.code} onClick={() => setSel(b)} className="grid grid-cols-[1fr_210px_150px_110px_120px] gap-3 px-4 py-3 border-b border-slate-100 items-center cursor-pointer hover:bg-slate-50">
          <div className="min-w-0"><div className="flex items-center gap-2"><b className="font-medium truncate">{b.guest}</b>{b.n > 1 && <span className="shrink-0 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{b.n} phòng</span>}</div>
            <div className="flex items-center gap-2 mt-1"><Chan c={b.ch === 'CTrip' ? 'CTrip' : b.ch} /><span className="text-xs text-slate-400 font-mono">{short(b.code)}</span></div></div>
          <div><div>{dm(b.ci)} → {dmy(b.co)}</div><div className="text-xs text-slate-400">{b.nights} đêm</div></div>
          <div className="text-right"><div className="font-semibold">{money(b.total)} ₫</div>{b.n > 1 && <div className="text-[11px] text-slate-400">tổng đơn</div>}</div>
          <div><Stat s={b.status} /></div><div className="text-sm"><div>{b.at.slice(11)}</div><div className="text-xs text-slate-400">{dmy(b.at)}</div></div></div>)
          : <p className="text-center text-slate-400 py-12">Không có đặt phòng phù hợp</p>}</div></div>
        : <div className="overflow-x-auto"><table className="w-full text-sm min-w-[1500px]"><thead><tr className="bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 text-left">{['MÃ KHÁCH SẠN', 'TÊN KHÁCH SẠN', 'MÃ BOOKING', 'TÊN KHÁCH', 'KÊNH OTA', 'NGÀY ĐẶT', 'NHẬN PHÒNG', 'TRẢ PHÒNG', 'STAYDATE', 'SỐ ĐÊM', 'ROOM', 'GÓI GIÁ', 'TỔNG CỘNG'].map(h => <th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>{list.map(b => <tr key={b.code} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSel(b)}>
            <td className="px-3 py-3 whitespace-nowrap">{hotel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'hotel'}</td><td className="px-3 whitespace-nowrap">{hotel}</td>
            <td className="px-3 whitespace-nowrap">{b.code} <Copy className="inline w-3.5 h-3.5 text-slate-400" /></td><td className="px-3 whitespace-nowrap">{b.guest.length > 24 ? b.guest.slice(0, 24) + '…' : b.guest}</td><td className="px-3"><Chan c={b.ch} /></td>
            <td className="px-3 whitespace-nowrap">{dmy(b.at)}<div className="text-xs text-slate-400">{b.at.slice(11)}</div></td><td className="px-3 whitespace-nowrap">{dmy(b.ci)}</td><td className="px-3 whitespace-nowrap">{dmy(b.co)}</td>
            <td className="px-3 whitespace-nowrap">{dm(b.ci)} → {dm(addDays(b.co, -1))}</td><td className="px-3 text-right">{b.nights}</td><td className="px-3 whitespace-nowrap">{b.rooms[0].hang}{b.n > 1 ? ` +${b.n - 1}` : ''}</td><td className="px-3 whitespace-nowrap">{b.rooms[0].pkg}</td><td className="px-3 text-right font-semibold whitespace-nowrap">{money(b.total)} ₫</td></tr>)}</tbody></table>
          {!list.length && <p className="text-center text-slate-400 py-12">Không có đặt phòng phù hợp</p>}</div>}
      <p className="text-xs text-slate-400 mt-3">{list.length} đơn · dữ liệu minh hoạ</p>
    </Card>
    {sel && <Detail b={sel} onClose={() => setSel(null)} />}
  </>;
}


const CARD = 'bg-white rounded-2xl border border-slate-200/80 shadow-sm';
const Row = ({ k, v, copyable }) => <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 py-2.5 border-b border-slate-100 last:border-0 text-sm"><span className="text-slate-500">{k}</span>
  <span className="font-medium text-ink break-words">{v}{copyable && <Copy className="inline w-3.5 h-3.5 ml-2 -mt-0.5 text-slate-300 hover:text-ink cursor-pointer transition-colors" onClick={() => copy(v)} />}</span></div>;
// Đóng/mở mượt: animate chiều cao bằng grid-rows
const Fold = ({ open, children }) => <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}><div className="overflow-hidden min-h-0"><div className={`transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>{children}</div></div></div>;
function Sec({ t, children, def }) {
  const [o, setO] = useState(!!def);
  return <section><button type="button" onClick={() => setO(!o)} className="w-full flex items-center gap-2.5 py-3.5 text-left group"><span className="w-1 h-4 rounded-full bg-sky-300" />
    <span className="flex-1 font-serif font-bold text-[13px] tracking-wide text-slate-700 uppercase group-hover:text-ink transition-colors">{t}</span><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${o ? 'rotate-180' : ''}`} /></button>
    <Fold open={o}><div className="pb-3">{children}</div></Fold></section>;
}
const Fact = ({ k, v }) => <div><div className="text-xs text-slate-400 mb-0.5">{k}</div><div className="font-medium text-ink">{v}</div></div>;
function Detail({ b, onClose }) {
  const [night, setNight] = useState({}), c = CH[b.ch], guests = b.rooms.reduce((a, r) => [a[0] + r.adults, a[1] + r.kids, a[2] + r.infants], [0, 0, 0]), gt = `${guests[0]} người lớn · ${guests[1]} trẻ em · ${guests[2]} em bé`;
  const pre = b.total / 1.0945, tax = b.total - pre, canceled = b.status === 'Đã huỷ', mail = 'tu***@' + c.mail;
  useEffect(() => { const h = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, []);
  return <><div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 anim-fade" onClick={onClose} />
    <div className="fixed right-0 top-0 bottom-0 w-[1200px] max-w-[94vw] bg-white z-50 flex flex-col shadow-2xl anim-slide">
      <div className="flex justify-between items-center px-7 py-4 border-b bg-white"><h2 className="font-serif text-xl font-bold">Chi tiết đặt phòng</h2><button type="button" onClick={onClose} className="w-9 h-9 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-ink"><X className="w-5 h-5" /></button></div>
      <div className="flex-1 overflow-y-auto p-7 bg-slate-50 scroll-smooth">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start">
          <div className="space-y-5 min-w-0">
            <div className={`${CARD} p-6`}>
              <div className="flex flex-wrap items-center gap-2.5"><b className="text-lg tracking-tight">{b.code}</b><button type="button" onClick={() => copy(b.code)} className="text-slate-300 hover:text-ink transition-colors"><Copy className="w-4 h-4" /></button><span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">{b.ch}</span><Stat s={b.status} /></div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5"><Fact k="Lưu trú" v={`${dmy(b.ci)} → ${dmy(b.co)}`} /><Fact k="Số đêm" v={b.nights} /><Fact k="Số phòng" v={b.n} /><Fact k="Ngày đặt" v={`${b.at.slice(11)}:59 ${dmy(b.at)}`} /><div className="col-span-2"><Fact k="Số khách" v={gt} /></div></div>
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3.5 flex items-end justify-between"><span className="text-sm text-slate-500">Tổng đơn</span><span className={`text-3xl font-bold tracking-tight ${canceled ? 'text-slate-300 line-through' : 'text-blue-600'}`}>{money(b.total)} ₫</span></div></div>
            <div className={`${CARD} px-6 divide-y divide-slate-100`}>
              <Sec def t="Khách"><Row k="Tên khách" v={b.guest} /><Row k="Điện thoại" v="+842****66(***)" /><Row k="Email" v={mail} /><Row k="Số lượng khách" v={gt} /><Row k="Quốc gia" v="N/A" /><Row k="Ngôn ngữ" v="en" /><Row k="Thành phố" v="N/A" /><Row k="Địa chỉ" v="N/A" /><Row k="Mã bưu chính" v="N/A" /><Row k="Giờ đến dự kiến" v="N/A" /><Row k="SĐT liên hệ (OTA)" v="+842****66(***)" /><Row k="Email liên hệ (OTA)" v={mail} /></Sec>
              <Sec def t="Ghi chú đặt phòng"><p className="text-sm leading-relaxed text-slate-700">Guests searching number for booking: 2AD 2CH (Age: 6,8); Quiet room; Smoke-free treatment required; Package; Diamond member 10% off; Please contact guest by system generated mail; preferred language: (English).</p></Sec>
              <Sec t="Lịch sử đặt phòng"><div className="rounded-lg bg-slate-50 px-3.5 py-2.5 flex justify-between text-sm"><span className="font-medium">{b.status}</span><span className="text-slate-400 text-sm">{b.at.slice(11)}:59 {dmy(b.at)}</span></div></Sec></div>
          </div>
          <div className="space-y-5 min-w-0">
            <div className={`${CARD} p-6`}>
              <div className="text-sm font-semibold tracking-wide text-slate-500 mb-3">PHÒNG ({b.n})</div>
              <div className="space-y-3">{b.rooms.map((r, i) => <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-[1.2fr_1.2fr_1.5fr_1fr] gap-3 px-4 py-2 bg-slate-50 text-sm text-slate-500"><span>Hạng phòng</span><span>Gói giá</span><span>Số khách</span><span className="text-right">Giá phòng</span></div>
                <div className="grid grid-cols-[1.2fr_1.2fr_1.5fr_1fr] gap-3 px-4 py-3.5 items-center text-sm"><span className="font-medium">{r.hang}</span>
                  <span><span className="inline-block px-2 py-0.5 rounded-md border border-green-200 bg-green-50 text-green-700 text-xs font-medium">{r.pkg}</span><div className="text-xs text-green-700/80 mt-1">Mã ưu đãi: {r.promo}</div></span>
                  <span className="text-slate-500">{r.adults} người lớn · {r.kids} trẻ em · {r.infants} em bé</span><span className="text-right font-semibold">{money(r.price)} ₫</span></div>
                <button type="button" className="w-full px-4 py-2 text-sm text-slate-500 hover:text-ink flex items-center gap-1 border-t border-slate-100 transition-colors" onClick={() => setNight(o => ({ ...o, [i]: !o[i] }))}><ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${night[i] ? 'rotate-180' : ''}`} />Giá từng đêm</button>
                <Fold open={!!night[i]}><div className="px-4 pb-3 grid grid-cols-2 gap-x-8 text-sm text-slate-600">{r.nightly.map((p, k) => <div key={k} className="flex justify-between py-1 border-b border-slate-100"><span>{dmy(addDays(b.ci, k))}</span><span className="font-medium">{money(p)} ₫</span></div>)}</div></Fold></div>)}</div>
              <div className="flex justify-between items-center rounded-xl bg-blue-50 px-4 py-3 mt-3 font-medium"><span>Cộng đơn</span><span className="text-blue-600 text-lg font-bold">{money(b.total)} ₫</span></div>
              <div className="flex justify-between text-sm mt-3 px-1"><span className="text-slate-500">Bữa ăn</span><span className="font-medium">Chỉ phòng, không gồm bữa ăn (Room only)</span></div>
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-500"><span>Giá trước thuế: <b className="text-ink font-medium">{money(pre)} ₫</b></span><span>Tổng sau thuế: <b className="text-ink font-medium">{money(b.total)} ₫</b></span><span>Thuế (đã gồm): <b className="text-ink font-medium">{money(tax * 0.24)} ₫</b></span><span>Thuế (đã gồm): <b className="text-ink font-medium">{money(tax * 0.76)} ₫</b></span></div></div>
            <div className={`${CARD} px-6 divide-y divide-slate-100`}>
              <Sec def t="Thanh toán"><Row k="Thu tiền" v="—" /><Row k="Phương thức thanh toán" v="Chuyển khoản ngân hàng" /><Row k="Tiền cọc / Bảo lãnh" v="N/A" /><Row k="Thẻ" v="Không có thông tin thẻ" /><Row k="Trả trước" v="Có" /><Row k="Giá trước thuế" v={money(pre) + ' ₫'} /><Row k="Tổng sau thuế" v={money(b.total) + ' ₫'} />
                <Row k="Thuế" v={<>Thuế (đã gồm): {money(tax * 0.24)} ₫<br />Thuế (đã gồm): {money(tax * 0.76)} ₫</>} /><Row k="Hoa hồng OTA" v="N/A" /><Row k="Thực nhận" v="N/A" /><div className="mt-3 rounded-lg bg-slate-50 py-3 text-center text-sm text-slate-400">Chưa có dữ liệu lịch sử thanh toán</div></Sec>
              <Sec t="Thông tin kỹ thuật"><Row k="Mã hệ thống" v={b.sysId} /><Row k="Mã đặt phòng" v={b.code} copyable /><Row k="Mã gốc kênh" v={b.code} copyable /><Row k="Mã OTA" v={b.code.replace(/^[A-Z]+-/, '')} copyable /><Row k="System ID" v={String(1795046278727 + b.code.length)} copyable /><Row k="Mã phiên bản" v="279cf557-563a-44df-b6ef-92cc32587d02" /><Row k="RUID" v="—" />
                <Row k="Đồng bộ PMS" v={<span className={`px-2.5 py-0.5 rounded-full text-xs ${b.sync === 'Đã nhận' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{b.sync}</span>} />
                <div className="text-sm text-slate-400 mt-3 mb-1.5">Phòng (theo kênh OTA)</div>{b.rooms.map((r, i) => <div key={i} className="rounded-lg bg-slate-50 px-3.5 mb-2"><Row k="Hạng phòng" v={r.hang} /><Row k="Mã hạng phòng (OTA)" v={String(612983591 + i)} /><Row k="Gói giá" v={r.pkg} /><Row k="Mã gói giá (OTA)" v={String(1480031910 + i)} /><Row k="Mã ưu đãi" v={r.promo} /><Row k="Bữa ăn" v="Chỉ phòng, không gồm bữa ăn (Room only)" /></div>)}</Sec></div>
          </div>
        </div>
      </div></div></>;
}
