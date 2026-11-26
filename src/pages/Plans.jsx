import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Search, ChevronDown, ChevronRight, Sprout, Compass, Zap, Building2, Lock, ArrowRight, ArrowUp, ArrowLeft, Headset, TrendingUp, LayoutGrid, Wallet, Sparkles, Gift, Rocket, Crown, Link2, BedDouble, UtensilsCrossed, Package, ShoppingCart, Handshake, BarChart3, Globe, RefreshCw, ShieldCheck } from 'lucide-react';
import { Title, Card, Btn, Seg, toast } from '../ui.jsx';
import { money } from '../store.jsx';

// ponytail: giá & tính năng là dữ liệu mẫu — thay bằng bảng giá thật khi chốt
export const PLANS = [
  { id: 'free', name: 'Miễn phí', tag: 'Dùng thử & cơ sở nhỏ', price: 0, note: 'Miễn phí trọn đời', cta: 'Dùng miễn phí ngay',
    perks: ['Sơ đồ phòng trực quan thời gian thực', 'Check-in, Check-out, Đặt cọc', 'Bàn giao ca & Thu chi tiền mặt', '5 tài khoản để quản lý', 'Mobile App quản lý từ xa', 'Hỗ trợ tài liệu & video hướng dẫn'] },
  { id: 'pro', name: 'Cơ bản', tag: '1–2 sao & nghỉ giờ', price: 990000, note: 'Mỗi tháng, thanh toán theo năm giảm 15%', cta: 'Đăng ký gói Cơ bản',
    perks: ['Toàn bộ tính năng gói Miễn phí', 'Quản lý buồng phòng, dọn phòng', 'Kho hàng hóa, F&B, minibar tại phòng', 'Chính sách giá giờ, đêm, ngày, tuần', 'Báo cáo doanh thu & ca trực chuyên sâu', 'Hỗ trợ Hotline & Zalo 24/7', 'Tài chính, Bàn giao ca, Phân tích'] },
  { id: 'max', name: 'Nâng cao', tag: '2–3 sao & đa kênh', price: 2490000, note: 'Mỗi tháng', cta: 'Chọn gói Nâng cao', hot: true,
    perks: ['Toàn bộ tính năng gói Cơ bản', 'Quản lý kênh OTA (Bellhop CMS)', 'Kết nối 50+ OTA: Booking, Agoda, Traveloka...', 'Đồng bộ 2 chiều tự động trong 2s', 'Chống Overbooking (trùng phòng) 100%', 'Giá thông minh theo mùa', 'Chuyên viên đồng hành kết nối OTA'] },
  { id: 'ent', name: 'Cao cấp', tag: '3–5 sao & chuỗi', price: null, note: 'Liên hệ để nhận báo giá', cta: 'Nhận tư vấn giải pháp',
    perks: ['Toàn bộ tính năng gói Nâng cao', 'Booking Engine website & Fanpage', 'Cổng thanh toán online (Bellhop Payment)', 'Đồng bộ kế toán MISA (Bellhop Finance)', 'Trợ lý AI Concierge phản hồi 24/7', 'Quản trị chuỗi nhiều chi nhánh', 'Đào tạo trực tiếp & SLA cam kết'] },
];
const MOB = { free: { chip: 'Cá nhân', I: Compass, cta: ArrowRight }, pro: { chip: 'Phổ biến', I: null, cta: Lock }, max: { chip: 'Phổ biến nhất', I: Zap, cta: ArrowUp }, ent: { chip: 'Tập đoàn', I: Building2, cta: Headset } };
const P = PLANS.map(p => p.id);
export const CUR = 'pro', ACC = { free: { I: Gift, tile: 'bg-sky-50 text-sky-600', bar: 'bg-sky-400', chk: 'bg-sky-100 text-sky-700' }, pro: { I: Rocket, tile: 'bg-teal-50 text-teal-700', bar: 'bg-teal-500', chk: 'bg-teal-100 text-teal-700' }, max: { I: Crown, tile: 'bg-amber-400/20 text-amber-300', bar: 'bg-amber-400', chk: 'bg-amber-400/20 text-amber-300' }, ent: { I: Building2, tile: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500', chk: 'bg-violet-100 text-violet-700' } };
const FICON = { 'Quản lý kênh OTA (Bellhop CMS)': Link2, 'Kết nối 50+ OTA': Globe, 'Đồng bộ 2 chiều tự động trong 2s': RefreshCw, 'Chống Overbooking (trùng phòng) 100%': ShieldCheck, 'Giá thông minh theo mùa': TrendingUp, 'Chuyên viên đồng hành kết nối OTA': Headset, 'Booking Engine website & Fanpage': Globe, 'Cổng thanh toán online (Bellhop Payment)': Wallet };
const T = true, F = false;
// [tên, miễn phí, cơ bản, nâng cao, chuỗi]
const GROUPS = [
  ['PMS — Vận hành', [
    ['Sơ đồ phòng trực quan thời gian thực', T, T, T, T], ['Check-in, Check-out, Đặt cọc', T, T, T, T], ['Bàn giao ca & Thu chi tiền mặt', T, T, T, T], ['Quản lý buồng phòng, dọn phòng', F, T, T, T],
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
function MobPlans({ yearly, setYearly, price, pick, cur, onCompare }) {
  const ci = PLANS.findIndex(p => p.id === cur), nx = PLANS.find(p => p.hot && PLANS.indexOf(p) > ci);
  return <div className="md:hidden">
    <h1 className="font-serif text-2xl font-bold text-ink">Gói dịch vụ</h1><p className="text-sm text-slate-500 mt-1 mb-3">Chọn gói phù hợp với quy mô khách sạn. Một gói dùng chung cho cả CMS và PMS.</p>
    {nx && <div className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-700 text-white p-4 mb-4"><div className="font-serif font-bold">Nâng cấp lên {nx.name} để mở khoá Bellhop CMS, kết nối 50+ OTA, đồng bộ 2 chiều, chống Overbooking…</div><button type="button" onClick={() => pick(nx)} className="mt-3 w-full h-11 rounded-xl bg-amber-400 text-navy-900 font-semibold inline-flex items-center justify-center gap-2">Nâng cấp ngay<ArrowUp className="w-4 h-4" /></button></div>}
    <Seg className="mb-4 w-full" value={yearly ? 'y' : 'm'} onChange={v => setYearly(v === 'y')} items={[['y', 'Theo năm'], ['m', 'Theo tháng']]} />
    <div className="space-y-4">{PLANS.map(p => { const m = MOB[p.id], on = p.id === cur, CI = m.cta, per = p.price ? '/tháng' : '';
      return <Card key={p.id} className={`relative p-5 ${p.hot ? 'border-brand shadow-lg' : ''}`}>
        {on && <span className="absolute top-0 right-0 rounded-bl-xl rounded-tr-xl bg-green-50 text-green-700 text-xs font-medium px-3 py-1">Đang dùng</span>}
        <div className="flex items-start justify-between gap-3"><div><span className={`inline-block rounded px-2 py-0.5 text-[11px] ${p.hot ? 'bg-brand-dark text-white' : 'bg-slate-100 text-slate-500'}`}>{m.chip}</span>
          <h2 className="font-serif text-xl font-bold text-ink mt-2">{p.name}</h2><div className="text-sm text-slate-500">{p.tag}</div></div>{m.I && !on && <span className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center text-ink"><m.I className="w-4 h-4" /></span>}</div>
        <div className={`mt-4 text-3xl font-bold ${p.hot ? 'text-brand-dark' : 'text-ink'}`}>{price(p)}<span className="text-sm font-normal text-slate-400"> {per}</span></div>
        <div className={`text-xs mt-1 ${p.id === 'pro' ? 'text-brand-dark' : 'text-slate-500'}`}>{p.id === 'pro' && !yearly ? 'Mỗi tháng, thanh toán theo tháng' : p.note}</div>
        <Btn className="mt-4 w-full inline-flex items-center justify-center gap-2" kind={on || !p.hot ? 'ghost' : undefined} disabled={on} onClick={() => pick(p)}>{on ? 'Gói hiện tại' : p.cta}<CI className="w-4 h-4" /></Btn>
        <div className="mt-4 text-[11px] font-semibold tracking-wide text-slate-500">{p.prev ? `MỌI TÍNH NĂNG CỦA ${p.prev.toUpperCase()}, CỘNG THÊM:` : 'TÍNH NĂNG BAO GỒM:'}</div>
        <ul className="mt-3 space-y-2.5 text-sm">{p.perks.map(x => <li key={x} className="flex gap-2.5"><Check className="w-5 h-5 shrink-0 rounded-full bg-brand/15 text-brand-dark p-1" />{x}</li>)}</ul></Card>; })}</div>
    <button type="button" onClick={onCompare} className="mt-4 w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"><span><b className="text-ink">So sánh chi tiết 4 gói</b><span className="block text-xs text-slate-500 mt-0.5">Xem ma trận tính năng CMS, PMS, tài chính, quản trị…</span></span><ChevronRight className="w-5 h-5 text-slate-400 shrink-0" /></button>
    <p className="text-center text-xs text-slate-500 mt-4">Giá chưa gồm VAT. Số liệu trên là dữ liệu mẫu.</p></div>;
}
export default function Plans() {
  const [cmp, setCmp] = useState(false), [yearly, setYearly] = useState(true), [q, setQ] = useState(''), [shut, setShut] = useState({}), cur = CUR, nav = useNavigate();
  const curIdx = PLANS.findIndex(p => p.id === cur), curP = PLANS[curIdx], nextP = PLANS.find(p => p.hot && PLANS.indexOf(p) > curIdx) || PLANS[curIdx + 1], missing = nextP ? GROUPS.flatMap(g => g[1]).filter(r => r[1 + curIdx] === F && r[1 + PLANS.indexOf(nextP)] === T).map(r => r[0]) : [];
  const price = p => p.price == null ? 'Liên hệ' : p.price === 0 ? '0 ₫' : money(Math.round(p.price * (p.id === 'pro' && !yearly ? 1.15 : 1))) + ' ₫';
  const pick = p => p.price == null ? toast('Bộ phận kinh doanh sẽ liên hệ bạn') : nav(`/plans/checkout/${p.id}?y=${yearly ? 1 : 0}`);
  return <>
    {cmp ? <MobCompare onBack={() => setCmp(false)} cur={cur} /> : <MobPlans yearly={yearly} setYearly={setYearly} price={price} pick={pick} cur={cur} onCompare={() => setCmp(true)} />}
    <div className="max-md:hidden">
    <Title keep t="Gói dịch vụ" sub="Chọn gói phù hợp với quy mô khách sạn. Một gói dùng chung cho cả CMS và PMS." right={<div className="flex items-center gap-3"><span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Theo năm tiết kiệm 15%</span><Seg value={yearly ? 'y' : 'm'} onChange={v => setYearly(v === 'y')} items={[['y', 'Theo năm'], ['m', 'Theo tháng']]} /></div>} />
    {nextP && <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-[#0f5c6b] text-white p-7 mb-10 grid grid-cols-[1fr_auto] gap-8 items-center">
      <span className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-400/10" />
      <div className="relative"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold px-3 py-1"><Sparkles className="w-3.5 h-3.5" />Gợi ý dành cho bạn</span>
        <h2 className="font-serif text-2xl font-bold mt-3">Mở khoá thêm {missing.length} tính năng với gói {nextP.name}</h2><p className="text-sm text-slate-200 mt-1">Bạn đang dùng gói {curP.name}. Nâng cấp để kết nối 50+ OTA, đồng bộ 2 chiều và chống trùng phòng ngay trong một phần mềm.</p>
        <div className="mt-5 grid grid-cols-5 gap-3">{missing.slice(0, 10).map(n => { const FI = FICON[n] || Sparkles; return <div key={n} className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm"><span className="w-8 h-8 shrink-0 rounded-lg bg-white/15 grid place-items-center text-amber-300"><FI className="w-4 h-4" /></span><span className="leading-tight">{n}</span></div>; })}</div></div>
      <div className="relative text-center px-4"><div className="text-sm text-slate-300">Chỉ từ</div><div className="text-4xl font-bold mt-1">{price(nextP)}</div><div className="text-sm text-slate-300">mỗi tháng</div>
        <button type="button" onClick={() => pick(nextP)} className="mt-4 h-12 px-7 rounded-xl bg-amber-400 text-navy-900 font-bold inline-flex items-center gap-2 shadow-lg hover:bg-amber-300">Nâng cấp ngay<ArrowUp className="w-4 h-4" /></button></div></div>}
    <div className="grid grid-cols-4 gap-5 items-stretch">{PLANS.map((p, i) => { const on = p.id === cur, up = i > curIdx, a = ACC[p.id], I = a.I, hot = p.hot;
      return <div key={p.id} className={`relative flex flex-col rounded-2xl border p-6 pt-7 transition ${hot ? 'bg-navy-900 text-white border-transparent shadow-2xl -translate-y-3' : 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1'} ${on ? 'ring-2 ring-brand' : ''}`}>
        <span className={`absolute inset-x-8 top-0 h-1 rounded-b-full ${a.bar}`} />
        {hot && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3.5 py-1 text-xs font-bold text-navy-900 shadow">★ Được chọn nhiều nhất</span>}
        <div className="flex items-center justify-between"><span className={`w-12 h-12 rounded-2xl grid place-items-center ${a.tile}`}><I className="w-6 h-6" /></span>{on && <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold">Đang dùng</span>}</div>
        <h2 className="font-serif text-2xl font-bold mt-4">{p.name}</h2><div className={`text-sm mt-0.5 ${hot ? 'text-slate-200' : 'text-slate-600'}`}>{p.tag}</div>
        <div className="mt-5 flex items-end gap-1.5"><span className="text-4xl font-bold leading-none">{price(p)}</span>{p.price ? <span className={`text-sm ${hot ? 'text-slate-200' : 'text-slate-600'}`}>/tháng</span> : null}</div>
        <div className={`mt-2 text-xs md:min-h-8 ${hot ? 'text-slate-200' : 'text-slate-600'}`}>{p.id === 'pro' && yearly && <span className="mr-1.5"><s className="text-slate-500">{money(Math.round(p.price * 1.15))} ₫</s> <b className="text-emerald-700">Tiết kiệm 15%</b> · </span>}{p.id === 'pro' && !yearly ? 'Mỗi tháng, thanh toán theo tháng' : p.note}</div>
        {on ? <button type="button" disabled className="mt-5 h-11 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold">Gói hiện tại</button>
          : up ? <button type="button" onClick={() => pick(p)} className={`mt-5 h-11 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 ${hot ? 'bg-amber-400 text-navy-900 shadow-lg' : 'bg-ink text-white'}`}>{p.cta}{p.price == null ? <Headset className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}</button>
          : <button type="button" disabled className="mt-5 h-11 rounded-xl border border-slate-200 text-slate-500 font-semibold">Gói thấp hơn</button>}
        <div className={`mt-5 pt-5 border-t text-sm flex-1 ${hot ? 'border-white/15' : 'border-slate-200'}`}>{p.prev && <div className={`text-xs font-bold tracking-wide mb-3 ${hot ? 'text-amber-300' : 'text-slate-500'}`}>BAO GỒM {p.prev.toUpperCase()}, CỘNG THÊM</div>}
          <ul className="space-y-3">{p.perks.map((x, k) => <li key={x} className="flex items-start gap-3"><span className={`mt-0.5 w-[22px] h-[22px] shrink-0 rounded-md grid place-items-center ${a.chk}`}><Check className="w-3.5 h-3.5" strokeWidth={3} /></span><span className={k === 0 ? 'font-semibold' : ''}>{x}</span></li>)}</ul></div></div>; })}</div>
    <div className="mt-10 grid grid-cols-3 gap-5">{[[TrendingUp, 'Tăng doanh thu', 'Giá thông minh tự điều chỉnh giá theo công suất phòng và thời điểm đặt: lấp đầy phòng trống, bán giá cao hơn ngày cao điểm.', 'from-emerald-400 to-teal-500'], [LayoutGrid, 'Vận hành trọn gói', 'Buồng phòng, F&B, Kho, Bán hàng & Marketing trong cùng một phần mềm, dữ liệu liền mạch với kênh bán OTA.', 'from-indigo-400 to-violet-500'], [Wallet, 'Kiểm soát dòng tiền', 'Tài chính, bàn giao ca, đối soát và báo cáo giúp chốt số chính xác mỗi ngày, hạn chế thất thoát.', 'from-amber-400 to-orange-500']].map(([I, t, d, g]) =>
      <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5 flex gap-4"><span className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${g} text-white grid place-items-center shadow`}><I className="w-6 h-6" /></span><div><div className="font-serif text-lg font-bold text-ink">{t}</div><p className="text-sm text-slate-600 mt-1">{d}</p></div></div>)}</div>
    <p className="text-center text-xs text-slate-500 mt-5">Giá chưa gồm VAT. Số liệu trên là dữ liệu mẫu.</p>

    <h2 className="font-serif text-4xl max-md:text-2xl font-bold text-ink text-center mt-16 max-md:mt-10 mb-8 max-md:mb-4">So sánh tính năng các gói</h2>
    <label className="md:hidden relative block mb-3"><Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng" value={q} onChange={e => setQ(e.target.value)} /></label>
    <div className="rounded-xl border border-slate-200 bg-white"><div className={`${ROW} py-4 border-b sticky top-14 z-20 bg-white`}>
      <label className="relative max-md:hidden"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng" value={q} onChange={e => setQ(e.target.value)} /></label><span className="md:hidden" />
      {PLANS.map(p => <div key={p.id} className={`text-center font-serif font-bold text-lg max-md:text-[12px] max-md:leading-tight text-ink ${p.hot ? 'bg-amber-50/70 py-1' : ''}`}>{p.name}{p.id === cur && <div className="text-xs font-sans font-medium text-green-700">Đang dùng</div>}{p.hot && <div className="text-xs font-sans font-semibold text-amber-700">Phổ biến nhất</div>}</div>)}</div>
      {GROUPS.map(([g, rows]) => { const list = rows.filter(r => r[0].toLowerCase().includes(q.toLowerCase())); if (!list.length) return null;
        return <div key={g}><button type="button" className="w-full flex items-center justify-between px-6 max-md:px-3 py-5 max-md:py-4 border-b text-left" onClick={() => setShut(o => ({ ...o, [g]: !o[g] }))}>
          <span className="font-serif text-2xl max-md:text-lg font-bold text-ink">{g}</span>{shut[g] ? <ChevronRight className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</button>
          {!shut[g] && list.map(([n, ...v]) => <div key={n} className={`${ROW} py-3.5 border-b border-slate-100 text-sm`}>
            <span>{n}</span>{P.map((id, i) => <div key={id} className={`text-center ${PLANS[i].hot ? 'bg-amber-50/70 self-stretch flex items-center justify-center' : ''}`}>{i === curIdx && v[i] === F && v[PLANS.indexOf(nextP)] === T ? <Lock className="w-4 h-4 mx-auto text-amber-500" title="Nâng cấp để mở khoá" /> : <Cell v={v[i]} />}</div>)}</div>)}</div>; })}</div>
    </div>
  </>;
}
