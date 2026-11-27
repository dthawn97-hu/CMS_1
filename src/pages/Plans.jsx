import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Search, ChevronDown, ChevronRight, Sprout, Compass, Zap, Building2, Lock, ArrowRight, ArrowUp, ArrowLeft, Headset, TrendingUp, LayoutGrid, Wallet, Sparkles, Gift, Rocket, Crown, Link2, BedDouble, UtensilsCrossed, Package, ShoppingCart, Handshake, BarChart3, Globe, RefreshCw, ShieldCheck } from 'lucide-react';
import { Title, Card, Btn, Seg, toast } from '../ui.jsx';
import { money } from '../store.jsx';
import { usePlan } from '../planStore.js';

// ponytail: giá & tính năng là dữ liệu mẫu — thay bằng bảng giá thật khi chốt
export const PLANS = [
  { id: 'free', name: 'Miễn phí', tag: 'Dùng thử & cơ sở nhỏ', price: 0, note: 'Miễn phí trọn đời', cta: 'Dùng miễn phí ngay',
    perks: ['Sơ đồ phòng trực quan thời gian thực', 'Check-in, Check-out, Đặt cọc', 'Bàn giao ca & Thu chi tiền mặt', 'Quản lý buồng phòng, dọn phòng', '5 tài khoản để quản lý', 'Mobile App quản lý từ xa', 'Hỗ trợ tài liệu & video hướng dẫn'] },
  { id: 'pro', name: 'Cơ bản', tag: '1–2 sao & nghỉ giờ', price: 15000, note: '', cta: 'Đăng ký gói Cơ bản', diff: 'Vận hành khách sạn trọn vẹn (PMS): kho, F&B, tài chính, báo cáo. Bán phòng nhập tay hoặc trực tiếp, chưa kết nối OTA.', lack: ['Quản lý kênh OTA (Bellhop CMS)', 'Đồng bộ 2 chiều & chống Overbooking'],
    perks: ['Toàn bộ tính năng gói Miễn phí', 'Không giới hạn người dùng', 'Kho hàng hóa, F&B, minibar tại phòng', 'Chính sách giá giờ, đêm, ngày, tuần', 'Báo cáo doanh thu & ca trực chuyên sâu', 'Hỗ trợ Hotline & Zalo 24/7', 'Tài chính, Bàn giao ca, Phân tích'] },
  { id: 'max', name: 'Nâng cao', tag: '2–3 sao & đa kênh', price: 39000, note: '', cta: 'Chọn gói Nâng cao', hot: true, diff: 'Thêm bán phòng đa kênh (CMS): kết nối 50+ OTA, đồng bộ tồn phòng & giá tự động, chống trùng phòng.', lack: ['Booking Engine website & thanh toán online', 'Quản trị chuỗi nhiều chi nhánh'],
    perks: ['Toàn bộ tính năng gói Cơ bản', 'Quản lý kênh OTA (Bellhop CMS)', 'Kết nối 50+ OTA: Booking, Agoda, Traveloka...', 'Đồng bộ 2 chiều tự động trong 2s', 'Chống Overbooking (trùng phòng) 100%', 'Giá thông minh theo mùa', 'Chuyên viên đồng hành kết nối OTA'] },
  { id: 'ent', name: 'Cao cấp', tag: '3–5 sao & chuỗi', price: 55000, note: '', cta: 'Chọn gói Cao cấp',
    perks: ['Toàn bộ tính năng gói Nâng cao', 'Booking Engine website & Fanpage', 'Cổng thanh toán online (Bellhop Payment)', 'Đồng bộ kế toán MISA (Bellhop Finance)', 'Trợ lý AI Concierge phản hồi 24/7', 'Quản trị chuỗi nhiều chi nhánh', 'Đào tạo trực tiếp & SLA cam kết'] },
];
// Giá niêm yết là giá theo NĂM, tính theo phòng/tháng; trả theo tháng cao hơn để năm tiết kiệm 20%
export const MIN_ROOMS = 10, SAVE = 0.2, perRoom = (p, yearly) => !p.price ? 0 : yearly ? p.price : Math.round(p.price / (1 - SAVE) / 100) * 100;
const RoomsInput = ({ v, set, cls = '' }) => <label className={`inline-flex items-center gap-2 text-sm text-slate-600 ${cls}`}>Số phòng của cơ sở<input inputMode="numeric" className="field !w-20 !py-1.5 text-center" value={v} onChange={e => set(e.target.value.replace(/D/g, ''))} onBlur={() => set(String(Math.max(MIN_ROOMS, +v || 0)))} /></label>;
function Cost({ p, yearly, rooms, dk }) {
  const per = perRoom(p, yearly), mut = dk ? 'text-slate-200' : 'text-slate-600';
  return <><div className="flex items-end gap-1.5 flex-wrap"><span className="text-4xl max-md:text-3xl font-bold leading-none">{money(per)}</span><span className={`text-sm ${mut}`}>₫{p.price ? ' / phòng' : ''} / tháng</span></div>
    <div className="mt-2 text-sm font-medium text-emerald-600">{p.price ? (yearly ? 'Tiết kiệm 20% khi đóng cả năm' : 'Thanh toán theo tháng') : 'Miễn phí trọn đời'}</div>
    <div className={`text-xs mt-1 ${mut}`}>{p.price ? `Tối thiểu ${MIN_ROOMS} phòng / cơ sở` : 'Tối đa 5 tài khoản'}</div>
    {p.price > 0 && <div className={`text-xs mt-1 ${mut}`}>Tạm tính {rooms} phòng: <b>{money(per * rooms)} ₫</b> / tháng</div>}</>;
}
const MOB = { free: { chip: 'Cá nhân', I: Compass, cta: ArrowRight }, pro: { chip: 'Phổ biến', I: null, cta: Lock }, max: { chip: 'Phổ biến nhất', I: Zap, cta: ArrowUp }, ent: { chip: 'Tập đoàn', I: Building2, cta: Headset } };
const P = PLANS.map(p => p.id);
export const ACC = { free: { I: Gift, tile: 'bg-sky-50 text-sky-600', bar: 'bg-sky-400', chk: 'bg-sky-100 text-sky-700' }, pro: { I: Rocket, tile: 'bg-teal-50 text-teal-700', bar: 'bg-teal-500', chk: 'bg-teal-100 text-teal-700' }, max: { I: Crown, tile: 'bg-amber-400/20 text-amber-300', bar: 'bg-amber-400', chk: 'bg-amber-400/20 text-amber-300' }, ent: { I: Building2, tile: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500', chk: 'bg-violet-100 text-violet-700' } };
const FICON = { 'Quản lý kênh OTA (Bellhop CMS)': Link2, 'Kết nối 50+ OTA': Globe, 'Đồng bộ 2 chiều tự động trong 2s': RefreshCw, 'Chống Overbooking (trùng phòng) 100%': ShieldCheck, 'Giá thông minh theo mùa': TrendingUp, 'Chuyên viên đồng hành kết nối OTA': Headset, 'Booking Engine website & Fanpage': Globe, 'Cổng thanh toán online (Bellhop Payment)': Wallet };
const T = true, F = false;
// [tên, miễn phí, cơ bản, nâng cao, chuỗi]
const GROUPS = [
  ['PMS — Vận hành', [
    ['Sơ đồ phòng trực quan thời gian thực', T, T, T, T], ['Check-in, Check-out, Đặt cọc', T, T, T, T], ['Bàn giao ca & Thu chi tiền mặt', T, T, T, T], ['Quản lý buồng phòng, dọn phòng', T, T, T, T],
    ['Kho hàng hóa, F&B, minibar tại phòng', F, T, T, T], ['Chính sách giá giờ, đêm, ngày, tuần', F, T, T, T]]],
  ['Tài chính & Báo cáo', [
    ['Tài chính, Bàn giao ca, Phân tích', F, T, T, T], ['Báo cáo doanh thu & ca trực chuyên sâu', F, T, T, T], ['Đồng bộ kế toán MISA (Bellhop Finance)', F, F, F, T]]],
  ['CMS — Kênh bán OTA', [
    ['Quản lý kênh OTA (Bellhop CMS)', F, F, T, T], ['Kết nối 50+ OTA', F, F, T, T], ['Đồng bộ 2 chiều tự động trong 2s', F, F, T, T], ['Chống Overbooking (trùng phòng) 100%', F, F, T, T], ['Giá thông minh theo mùa', F, F, T, T], ['Chuyên viên đồng hành kết nối OTA', F, F, T, T]]],
  ['Bán trực tiếp & Chuỗi', [
    ['Booking Engine website & Fanpage', F, F, F, T], ['Cổng thanh toán online (Bellhop Payment)', F, F, F, T], ['Trợ lý AI Concierge phản hồi 24/7', F, F, F, T], ['Quản trị chuỗi nhiều chi nhánh', F, F, F, T]]],
  ['Ứng dụng & Hỗ trợ', [
    ['Mobile App quản lý từ xa', T, T, T, T], ['Hỗ trợ tài liệu & video hướng dẫn', T, T, T, T], ['Hỗ trợ Hotline & Zalo 24/7', F, T, T, T], ['Đào tạo trực tiếp & SLA cam kết', F, F, F, T]]],
];

const ROW = 'grid grid-cols-[1.3fr_repeat(4,1fr)] max-md:grid-cols-[1.5fr_repeat(4,1fr)] items-center px-6 max-md:px-3 max-md:gap-x-1';
const Cell = ({ v }) => v === T ? <Check className="w-[18px] h-[18px] mx-auto rounded-full bg-ink text-white p-[3px]" /> : v === F ? <X className="w-4 h-4 mx-auto text-slate-400" />
  : <span className="inline-block rounded border border-slate-300 bg-slate-50 px-3 py-1 max-md:px-1.5 max-md:py-0.5 max-md:text-[10px] max-md:leading-tight text-xs text-slate-700">{v}</span>;

const Val = ({ v }) => v === T ? <Check className="w-5 h-5 rounded-full bg-brand-dark text-white p-1" /> : v === F ? <X className="w-4 h-4 text-slate-400" /> : <span className="text-[12px] rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700 leading-tight text-center">{v}</span>;
function MobCompare({ onBack, cur }) {
  const [q, setQ] = useState(''), [mode, setMode] = useState('two'), [a, setA] = useState(cur), [b, setB] = useState('max'), [shut, setShut] = useState({});
  const ids = mode === 'two' ? [a, b] : P, nameOf = id => PLANS[P.indexOf(id)].name;
  const opts = P.map(id => <option key={id} value={id}>{nameOf(id)}{id === cur ? ' (Đang dùng)' : ''}</option>);
  return <div className="md:hidden">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-slate-700 mb-3"><ArrowLeft className="w-4 h-4" />Quay lại</button>
    <h1 className="font-serif text-2xl font-bold text-ink">So sánh các gói</h1><p className="text-sm text-slate-500 mt-1 mb-3">Chi tiết tính năng của từng gói dịch vụ PMS & CMS</p>
    <label className="relative block mb-3"><Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng (buồng phòng, kho, OTA…)" value={q} onChange={e => setQ(e.target.value)} /></label>
    <Card className="p-3 mb-3"><div className="text-[11px] font-semibold tracking-wide text-slate-500 mb-2">CHẾ ĐỘ SO SÁNH</div>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm">{[['two', 'So sánh 2 gói'], ['all', 'Toàn bộ 4 gói']].map(([k, l]) => <button key={k} type="button" onClick={() => setMode(k)} className={`rounded-lg py-2 ${mode === k ? 'bg-white text-ink font-semibold shadow-sm' : 'text-slate-500'}`}>{l}</button>)}</div>
      {mode === 'two' && <div className="grid grid-cols-2 gap-3 mt-3"><label><span className="lbl">Gói gốc</span><select className="field" value={a} onChange={e => setA(e.target.value)}>{opts}</select></label><label><span className="lbl">So với gói</span><select className="field" value={b} onChange={e => setB(e.target.value)}>{opts}</select></label></div>}</Card>
    <div className="space-y-3">{GROUPS.map(([g, rows]) => { const list = rows.filter(r => r[0].toLowerCase().includes(q.toLowerCase())); if (!list.length) return null;
      return <Card key={g} className="overflow-hidden"><button type="button" className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left" onClick={() => setShut(o => ({ ...o, [g]: !o[g] }))}><span><b className="font-serif text-ink">{g}</b><span className="ml-2 text-xs text-slate-400">{list.length} tính năng</span></span>{shut[g] ? <ChevronRight className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</button>
        {!shut[g] && list.map(([n, ...v]) => <div key={n} className="px-4 py-3 border-t border-slate-100"><div className="font-semibold text-[15px] text-ink mb-2">{n}</div>
          <div className={`grid gap-2 ${mode === 'two' ? 'grid-cols-2' : 'grid-cols-2'}`}>{ids.map(id => <div key={id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 min-w-0"><span className="text-[12px] text-slate-500 truncate">{nameOf(id)}</span><Val v={v[P.indexOf(id)]} /></div>)}</div></div>)}</Card>; })}</div></div>;
}
// Drawer xem chi tiết từng gói: bấm tab để lật qua lại, thấy ngay gói này thêm gì so với gói liền trước
function PlanDetail({ id, setId, yearly, rooms, pick, cur, onClose }) {
  const i = P.indexOf(id), p = PLANS[i], added = i ? GROUPS.flatMap(g => g[1]).filter(r => r[1 + i] === T && r[i] === F).map(r => r[0]) : [];
  return <div className="fixed inset-0 z-50 bg-black/60 anim-fade" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="absolute right-0 top-0 h-full drawer-w bg-white flex flex-col anim-slide">
    <div className="flex items-center justify-between px-6 py-4 border-b"><h3 className="font-semibold text-ink">Chi tiết gói dịch vụ</h3><button type="button" title="Đóng" onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button></div>
    <div className="flex border-b">{PLANS.map(x => <button key={x.id} type="button" onClick={() => setId(x.id)} className={`flex-1 py-3 text-sm border-b-2 ${x.id === id ? 'border-ink text-ink font-semibold' : 'border-transparent text-slate-500'}`}>{x.name}{x.id === cur && <span className="block text-[10px] text-green-700 font-medium">Đang dùng</span>}</button>)}</div>
    <div className="flex-1 overflow-y-auto px-6 max-md:px-4 py-5 space-y-5">
      <div><h2 className="font-serif text-2xl font-bold text-ink">{p.name}</h2><div className="text-sm text-slate-500">{p.tag}</div><div className="mt-3 text-ink"><Cost p={p} yearly={yearly} rooms={rooms} /></div></div>
      {i > 0 && <div className="rounded-xl bg-brand/10 border border-brand/30 p-4"><div className="text-sm font-semibold text-brand-dark mb-2">Thêm so với gói {PLANS[i - 1].name} ({added.length} tính năng)</div>{added.length ? <ul className="space-y-1.5 text-sm">{added.map(n => <li key={n} className="flex gap-2"><Check className="w-4 h-4 shrink-0 mt-0.5 text-brand-dark" />{n}</li>)}</ul> : <p className="text-sm text-slate-500">Không có tính năng mới.</p>}</div>}
      {GROUPS.map(([g, rows]) => <div key={g}><div className="font-serif font-bold text-ink mb-1.5">{g}</div><div className="rounded-xl border divide-y">{rows.map(([n, ...v]) => <div key={n} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"><span className={v[i] === F ? 'text-slate-400' : 'text-ink'}>{n}</span><Val v={v[i]} /></div>)}</div></div>)}</div>
    <div className="px-5 py-4 border-t">{p.id === cur ? <Btn kind="ghost" className="w-full" disabled>Gói hiện tại</Btn> : PLANS.indexOf(p) < PLANS.findIndex(x => x.id === cur) ? <Btn kind="ghost" className="w-full" disabled>Gói thấp hơn</Btn> : <Btn className="w-full" onClick={() => pick(p)}>{p.cta}</Btn>}</div></div></div>;
}
function MobPlans({ yearly, setYearly, rooms, roomsIn, setRoomsIn, pick, cur, onCompare, onDetail }) {
  const ci = PLANS.findIndex(p => p.id === cur), nx = PLANS.find(p => p.hot && PLANS.indexOf(p) > ci);
  return <div className="md:hidden">
    <h1 className="font-serif text-2xl font-bold text-ink">Gói dịch vụ</h1><p className="text-sm text-slate-500 mt-1 mb-3">Chọn gói phù hợp với quy mô khách sạn. Một gói dùng chung cho cả CMS và PMS.</p>
    {nx && <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-700 text-white p-4 mb-4"><div className="font-serif font-bold">Nâng cấp lên {nx.name} để mở khoá Bellhop CMS, kết nối 50+ OTA, đồng bộ 2 chiều, chống Overbooking…</div><button type="button" onClick={() => pick(nx)} className="mt-3 w-full h-11 rounded-xl bg-amber-400 text-navy-900 font-semibold inline-flex items-center justify-center gap-2">Nâng cấp ngay<ArrowUp className="w-4 h-4" /></button></div>}
    <RoomsInput v={roomsIn} set={setRoomsIn} cls="mb-3 w-full justify-between" />
    <Seg className="mb-4 w-full" value={yearly ? 'y' : 'm'} onChange={v => setYearly(v === 'y')} items={[['y', 'Theo năm'], ['m', 'Theo tháng']]} />
    <div className="space-y-4">{PLANS.map(p => { const m = MOB[p.id], on = p.id === cur, CI = m.cta, per = p.price ? '/tháng' : '';
      return <Card key={p.id} className={`relative p-5 ${p.hot ? 'border-brand shadow-lg' : ''}`}>
        {on && <span className="absolute top-0 right-0 rounded-bl-xl rounded-tr-xl bg-green-50 text-green-700 text-xs font-medium px-3 py-1">Đang dùng</span>}
        <div className="flex items-start justify-between gap-3"><div><span className={`inline-block rounded px-2 py-0.5 text-[11px] ${p.hot ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-500'}`}>{m.chip}</span>
          <h2 className="font-serif text-xl font-bold text-ink mt-2">{p.name}</h2><div className="text-sm text-slate-500">{p.tag}</div></div>{m.I && !on && <span className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center text-ink"><m.I className="w-4 h-4" /></span>}</div>
        <div className="mt-4 text-ink"><Cost p={p} yearly={yearly} rooms={rooms} /></div>
                <Btn className="mt-4 w-full inline-flex items-center justify-center gap-2" kind={on || !p.hot ? 'ghost' : undefined} disabled={on} onClick={() => pick(p)}>{on ? 'Gói hiện tại' : p.cta}<CI className="w-4 h-4" /></Btn><button type="button" className="mt-2 w-full text-sm font-medium text-brand-dark py-1.5" onClick={() => onDetail(p.id)}>Xem chi tiết gói</button>
        <div className="mt-4 text-[11px] font-semibold tracking-wide text-slate-500">{p.prev ? `MỌI TÍNH NĂNG CỦA ${p.prev.toUpperCase()}, CỘNG THÊM:` : 'TÍNH NĂNG BAO GỒM:'}</div>
        {p.diff && <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600"><b className="text-ink">Điểm khác biệt: </b>{p.diff}</div>}<ul className="mt-3 space-y-2.5 text-sm">{p.perks.map(x => <li key={x} className="flex gap-2.5"><Check className="w-5 h-5 shrink-0 rounded-full bg-brand/15 text-brand-dark p-1" />{x}</li>)}{p.lack?.map(x => <li key={x} className="flex gap-2.5 text-slate-400"><X className="w-5 h-5 shrink-0 rounded-full bg-slate-100 p-1" />Chưa gồm: {x}</li>)}</ul></Card>; })}</div>
    <button type="button" onClick={onCompare} className="mt-4 w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"><span><b className="text-ink">So sánh chi tiết 4 gói</b><span className="block text-xs text-slate-500 mt-0.5">Xem ma trận tính năng CMS, PMS, tài chính, quản trị…</span></span><ChevronRight className="w-5 h-5 text-slate-400 shrink-0" /></button>
    <p className="text-center text-xs text-slate-500 mt-4">Giá chưa gồm VAT. Số liệu trên là dữ liệu mẫu.</p></div>;
}
export default function Plans() {
  const [cmp, setCmp] = useState(false), [det, setDet] = useState(null), [yearly, setYearly] = useState(true), [roomsIn, setRoomsIn] = useState(String(MIN_ROOMS)), rooms = Math.max(MIN_ROOMS, +roomsIn || 0), [q, setQ] = useState(''), [shut, setShut] = useState({}), cur = usePlan(), nav = useNavigate();
  const curIdx = PLANS.findIndex(p => p.id === cur), curP = PLANS[curIdx], nextP = PLANS.find(p => p.hot && PLANS.indexOf(p) > curIdx) || PLANS[curIdx + 1], missing = nextP ? GROUPS.flatMap(g => g[1]).filter(r => r[1 + curIdx] === F && r[1 + PLANS.indexOf(nextP)] === T).map(r => r[0]) : [];
  const price = p => p.price === 0 ? '0 ₫' : money(perRoom(p, yearly)) + ' ₫';
  const pick = p => nav(`/plans/checkout/${p.id}?y=${yearly ? 1 : 0}&r=${rooms}`);
  return <>
    {cmp ? <MobCompare onBack={() => setCmp(false)} cur={cur} /> : <MobPlans yearly={yearly} setYearly={setYearly} rooms={rooms} roomsIn={roomsIn} setRoomsIn={setRoomsIn} pick={pick} cur={cur} onCompare={() => setCmp(true)} onDetail={setDet} />}
    <div className="max-md:hidden">
    <Title keep t="Gói dịch vụ" sub="Chọn gói phù hợp với quy mô khách sạn. Một gói dùng chung cho cả CMS và PMS." right={<div className="flex items-center gap-3"><RoomsInput v={roomsIn} set={setRoomsIn} /><span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Theo năm tiết kiệm 20%</span><Seg value={yearly ? 'y' : 'm'} onChange={v => setYearly(v === 'y')} items={[['y', 'Theo năm'], ['m', 'Theo tháng']]} /></div>} />
    {nextP && <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-[#0f5c6b] text-white p-7 mb-10 grid grid-cols-[1fr_auto] gap-8 items-center">
      <span className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-400/10" />
      <div className="relative"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold px-3 py-1"><Sparkles className="w-3.5 h-3.5" />Gợi ý dành cho bạn</span>
        <h2 className="font-serif text-2xl font-bold mt-3">Mở khoá thêm {missing.length} tính năng với gói {nextP.name}</h2><p className="text-sm text-slate-200 mt-1">Bạn đang dùng gói {curP.name}. Nâng cấp để kết nối 50+ OTA, đồng bộ 2 chiều và chống trùng phòng ngay trong một phần mềm.</p>
        <div className="mt-5 grid grid-cols-5 gap-3">{missing.slice(0, 10).map(n => { const FI = FICON[n] || Sparkles; return <div key={n} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm"><span className="w-8 h-8 shrink-0 rounded-lg bg-white/15 grid place-items-center text-amber-300"><FI className="w-4 h-4" /></span><span className="leading-tight">{n}</span></div>; })}</div></div>
      <div className="relative text-center px-4"><div className="text-sm text-slate-300">Chỉ từ</div><div className="text-4xl font-bold mt-1">{price(nextP)}</div><div className="text-sm text-slate-300">mỗi phòng / tháng</div>
        <button type="button" onClick={() => pick(nextP)} className="mt-4 h-12 px-7 rounded-xl bg-amber-400 text-navy-900 font-bold inline-flex items-center gap-2 shadow-lg hover:bg-amber-300">Nâng cấp ngay<ArrowUp className="w-4 h-4" /></button></div></div>}
    <div className="grid grid-cols-4 gap-5 items-stretch">{PLANS.map((p, i) => { const on = p.id === cur, up = i > curIdx, a = ACC[p.id], I = a.I, hot = p.hot;
      return <div key={p.id} className={`relative flex flex-col rounded-2xl border p-6 pt-7 transition ${hot ? 'bg-navy-900 text-white border-transparent shadow-2xl -translate-y-3' : 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1'} ${on ? 'ring-2 ring-brand' : ''}`}>
        <span className={`absolute inset-x-8 top-0 h-1 rounded-b-full ${a.bar}`} />
        {hot && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3.5 py-1 text-xs font-bold text-navy-900 shadow">★ Được chọn nhiều nhất</span>}
        <div className="flex items-center justify-between"><span className={`w-12 h-12 rounded-2xl grid place-items-center ${a.tile}`}><I className="w-6 h-6" /></span>{on && <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold">Đang dùng</span>}</div>
        <h2 className="font-serif text-2xl font-bold mt-4">{p.name}</h2><div className={`text-sm mt-0.5 ${hot ? 'text-slate-200' : 'text-slate-600'}`}>{p.tag}</div>
        <div className="mt-5"><Cost p={p} yearly={yearly} rooms={rooms} dk={hot} /></div>
        {on ? <button type="button" disabled className="mt-5 h-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold">Gói hiện tại</button>
          : up ? <button type="button" onClick={() => pick(p)} className={`mt-5 h-11 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 ${hot ? 'bg-amber-400 text-navy-900 shadow-lg' : 'bg-ink text-white'}`}>{p.cta}<ArrowUp className="w-4 h-4" /></button>
          : <button type="button" disabled className="mt-5 h-11 rounded-xl border border-slate-200 text-slate-500 font-semibold">Gói thấp hơn</button>}
        <div className={`mt-5 pt-5 border-t text-sm flex-1 ${hot ? 'border-white/15' : 'border-slate-200'}`}>{p.diff && <div className={`mb-4 rounded-lg px-3 py-2.5 text-xs leading-relaxed ${hot ? 'bg-white/10 text-slate-100' : 'bg-slate-50 text-slate-600'}`}><b className={hot ? 'text-amber-300' : 'text-ink'}>Điểm khác biệt: </b>{p.diff}</div>}{p.prev && <div className={`text-xs font-bold tracking-wide mb-3 ${hot ? 'text-amber-300' : 'text-slate-500'}`}>BAO GỒM {p.prev.toUpperCase()}, CỘNG THÊM</div>}
          <ul className="space-y-3">{p.perks.map((x, k) => <li key={x} className="flex items-start gap-3"><span className={`mt-0.5 w-[22px] h-[22px] shrink-0 rounded-md grid place-items-center ${a.chk}`}><Check className="w-3.5 h-3.5" strokeWidth={3} /></span><span className={k === 0 ? 'font-semibold' : ''}>{x}</span></li>)}{p.lack?.map(x => <li key={x} className={`flex items-start gap-3 ${hot ? 'text-slate-400' : 'text-slate-400'}`}><span className="mt-0.5 w-[22px] h-[22px] shrink-0 rounded-md grid place-items-center bg-slate-500/10"><X className="w-3.5 h-3.5" strokeWidth={3} /></span><span>Chưa gồm: {x}</span></li>)}</ul></div>
        <button type="button" onClick={() => setDet(p.id)} className={`mt-5 h-10 rounded-xl border text-sm font-semibold ${hot ? 'border-white/30 text-white hover:bg-white/10' : 'border-slate-200 text-ink hover:bg-slate-50'}`}>Xem chi tiết gói</button></div>; })}</div>
    <p className="text-center text-xs text-slate-500 mt-5">Giá chưa gồm VAT. Số liệu trên là dữ liệu mẫu.</p>

    <h2 className="font-serif text-4xl max-md:text-2xl font-bold text-ink text-center mt-16 max-md:mt-10 mb-8 max-md:mb-4">So sánh tính năng các gói</h2>
    <label className="md:hidden relative block mb-3"><Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng" value={q} onChange={e => setQ(e.target.value)} /></label>
    <div className="rounded-xl border border-slate-200 bg-white"><div className={`${ROW} py-4 border-b sticky top-14 z-20 bg-white`}>
      <label className="relative max-md:hidden"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng" value={q} onChange={e => setQ(e.target.value)} /></label><span className="md:hidden" />
      {PLANS.map(p => <div key={p.id} className={`text-center font-serif font-bold text-lg max-md:text-[12px] max-md:leading-tight text-ink ${p.hot ? 'bg-brand/10 py-1' : ''}`}>{p.name}{p.id === cur && <div className="text-xs font-sans font-medium text-green-700">Đang dùng</div>}{p.hot && <div className="text-xs font-sans font-semibold text-brand-dark">Phổ biến nhất</div>}</div>)}</div>
      {GROUPS.map(([g, rows]) => { const list = rows.filter(r => r[0].toLowerCase().includes(q.toLowerCase())); if (!list.length) return null;
        return <div key={g}><button type="button" className="w-full flex items-center justify-between px-6 max-md:px-3 py-5 max-md:py-4 border-b text-left" onClick={() => setShut(o => ({ ...o, [g]: !o[g] }))}>
          <span className="font-serif text-2xl max-md:text-lg font-bold text-ink">{g}</span>{shut[g] ? <ChevronRight className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</button>
          {!shut[g] && list.map(([n, ...v]) => <div key={n} className={`${ROW} py-3.5 border-b border-slate-100 text-sm`}>
            <span>{n}</span>{P.map((id, i) => <div key={id} className={`text-center ${PLANS[i].hot ? 'bg-brand/10 self-stretch flex items-center justify-center' : ''}`}>{i === curIdx && v[i] === F && v[PLANS.indexOf(nextP)] === T ? <Lock className="w-4 h-4 mx-auto text-amber-500" title="Nâng cấp để mở khoá" /> : <Cell v={v[i]} />}</div>)}</div>)}</div>; })}</div>
    </div>
    {det && <PlanDetail id={det} setId={setDet} yearly={yearly} rooms={rooms} pick={pick} cur={cur} onClose={() => setDet(null)} />}
  </>;
}
