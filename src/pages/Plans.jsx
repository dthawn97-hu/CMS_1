import { useState } from 'react';
import { Check, X, Search, ChevronDown, ChevronRight, Sprout, Compass, Zap, Building2, Lock, ArrowRight, ArrowUp, ArrowLeft, Headset } from 'lucide-react';
import { Title, Card, Btn, Seg, toast } from '../ui.jsx';
import { money } from '../store.jsx';

// ponytail: giá & tính năng là dữ liệu mẫu — thay bằng bảng giá thật khi chốt
const PLANS = [
  { id: 'free', name: 'Dùng thử', tag: 'Trải nghiệm Bellhop', price: 0, note: 'Miễn phí 30 ngày', cta: 'Dùng thử',
    perks: ['1 khách sạn, tối đa 20 phòng', 'Lịch phòng & Bán phòng', 'Kết nối 2 kênh OTA', 'Đặt phòng OTA', 'Hỗ trợ qua email'] },
  { id: 'pro', name: 'Cơ bản', tag: 'Cho khách sạn vừa và nhỏ', price: 990000, note: 'Mỗi tháng, thanh toán theo năm giảm 15%', cta: 'Chọn gói Cơ bản', prev: 'Dùng thử',
    perks: ['Tối đa 60 phòng', 'Kết nối 6 kênh OTA', 'Cập nhật hàng loạt', 'PMS: Front desk, Sơ đồ phòng, Đặt phòng', 'Phân quyền 5 người dùng'] },
  { id: 'max', name: 'Nâng cao', tag: 'Cho vận hành cả ngày', price: 2490000, note: 'Mỗi tháng', cta: 'Chọn gói Nâng cao', prev: 'Cơ bản', hot: true,
    perks: ['Không giới hạn số phòng', 'Kết nối không giới hạn kênh OTA', 'Giá thông minh & Định giá linh động', 'PMS đầy đủ: Buồng phòng, F&B, Kho', 'Tài chính, Bàn giao ca, Phân tích'] },
  { id: 'ent', name: 'Chuỗi', tag: 'Cho nhiều khách sạn', price: null, note: 'Liên hệ để nhận báo giá', cta: 'Liên hệ tư vấn', prev: 'Nâng cao',
    perks: ['Quản lý nhiều khách sạn trong một tài khoản', 'Báo cáo hợp nhất toàn chuỗi', 'Phân quyền theo khách sạn', 'Quản lý khách hàng thành công riêng'] },
];
const MOB = { free: { chip: 'Cá nhân', I: Compass, cta: ArrowRight }, pro: { chip: 'Phổ biến', I: null, cta: Lock }, max: { chip: 'Phổ biến nhất', I: Zap, cta: ArrowUp }, ent: { chip: 'Tập đoàn', I: Building2, cta: Headset } };
const P = PLANS.map(p => p.id);
const T = true, F = false;
// [tên, dùng thử, cơ bản, nâng cao, chuỗi]
const GROUPS = [
  ['CMS — Bán phòng OTA', [
    ['Lịch phòng & Bán phòng', T, T, T, T], ['Cập nhật hàng loạt', F, T, T, T], ['Số kênh OTA kết nối', '2', '6', 'Không giới hạn', 'Không giới hạn'],
    ['Chính sách giá OTA', T, T, T, T], ['Giá thông minh', F, F, T, T], ['Định giá linh động', F, F, T, T], ['Đặt phòng OTA', T, T, T, T]]],
  ['PMS — Vận hành', [
    ['Front desk', F, T, T, T], ['Sơ đồ phòng', F, T, T, T], ['Quản lý khách', F, T, T, T], ['Buồng phòng', F, F, T, T], ['F&B', F, F, T, T], ['Quản lý kho', F, F, T, T], ['Bán hàng & Marketing', F, F, T, T]]],
  ['PMS — Tài chính & Báo cáo', [['Tài chính', F, F, T, T], ['Bàn giao ca', F, F, T, T], ['Phân tích', F, F, T, T], ['Báo cáo hợp nhất nhiều khách sạn', F, F, F, T]]],
  ['Quản trị & hỗ trợ', [
    ['Số khách sạn', '1', '1', '1', 'Nhiều'], ['Số phòng tối đa', '20', '60', 'Không giới hạn', 'Không giới hạn'], ['Số người dùng', '2', '5', '20', 'Không giới hạn'],
    ['Phân quyền theo vai trò', F, T, T, T], ['Phân quyền theo khách sạn', F, F, F, T], ['Hỗ trợ', 'Email', 'Email & chat', 'Ưu tiên', 'Quản lý riêng']]],
];
const ROW = 'grid grid-cols-[1.3fr_repeat(4,1fr)] max-md:grid-cols-[1.5fr_repeat(4,1fr)] items-center px-6 max-md:px-3 max-md:gap-x-1';
const Cell = ({ v }) => v === T ? <Check className="w-[18px] h-[18px] mx-auto rounded-full bg-ink text-white p-[3px]" /> : v === F ? <X className="w-4 h-4 mx-auto text-slate-400" />
  : <span className="inline-block rounded border border-slate-300 bg-slate-50 px-2 py-0.5 max-md:px-1 max-md:text-[10px] max-md:leading-tight text-xs text-slate-700">{v}</span>;

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
  return <div className="md:hidden">
    <h1 className="font-serif text-2xl font-bold text-ink">Gói dịch vụ</h1><p className="text-sm text-slate-500 mt-1 mb-3">Chọn gói phù hợp với quy mô khách sạn. Một gói dùng chung cho cả CMS và PMS.</p>
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
    <p className="text-center text-xs text-slate-400 mt-4">Giá chưa gồm VAT. Số liệu trên là dữ liệu mẫu.</p></div>;
}
export default function Plans() {
  const [cmp, setCmp] = useState(false), [yearly, setYearly] = useState(true), [q, setQ] = useState(''), [shut, setShut] = useState({}), cur = 'pro';
  const price = p => p.price == null ? 'Liên hệ' : p.price === 0 ? '0 ₫' : money(Math.round(p.price * (p.id === 'pro' && !yearly ? 1.15 : 1))) + ' ₫';
  const pick = p => toast(p.price == null ? 'Bộ phận kinh doanh sẽ liên hệ bạn' : `Đã ghi nhận yêu cầu chuyển sang gói ${p.name}`);
  return <>
    {cmp ? <MobCompare onBack={() => setCmp(false)} cur={cur} /> : <MobPlans yearly={yearly} setYearly={setYearly} price={price} pick={pick} cur={cur} onCompare={() => setCmp(true)} />}
    <div className="max-md:hidden">
    <Title keep t="Gói dịch vụ" sub="Chọn gói phù hợp với quy mô khách sạn. Một gói dùng chung cho cả CMS và PMS." right={<Seg value={yearly ? 'y' : 'm'} onChange={v => setYearly(v === 'y')} items={[['y', 'Theo năm'], ['m', 'Theo tháng']]} />} />
    <div className="grid grid-cols-4 max-md:!grid-cols-1 gap-5">{PLANS.map(p => <Card key={p.id} className={`p-6 max-md:p-5 flex flex-col ${p.hot ? 'shadow-lg border-brand' : ''}`}>
      <Sprout className="w-9 h-9 max-md:w-7 max-md:h-7 text-ink" strokeWidth={1.4} />
      <div className="mt-6 max-md:mt-3 flex items-center gap-2"><h2 className="font-serif text-3xl max-md:text-2xl font-bold text-ink">{p.name}</h2>{p.id === cur && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Đang dùng</span>}</div>
      <div className="text-slate-600 mt-1">{p.tag}</div>
      <div className="mt-6 max-md:mt-4 text-2xl font-bold text-ink">{price(p)}</div><div className="text-xs text-slate-500 mt-1 md:min-h-8">{p.id === 'pro' && !yearly ? 'Mỗi tháng, thanh toán theo tháng' : p.note}</div>
      <Btn className="mt-5 w-full justify-center" kind={p.id === cur ? 'ghost' : undefined} disabled={p.id === cur} onClick={() => pick(p)}>{p.id === cur ? 'Gói hiện tại' : p.cta}</Btn>
      <div className="mt-5 pt-5 border-t border-slate-200 text-sm">{p.prev && <div className="font-semibold text-ink mb-2">Mọi tính năng của {p.prev}, cộng thêm:</div>}
        <ul className="space-y-2.5">{p.perks.map(x => <li key={x} className="flex gap-2.5"><Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />{x}</li>)}</ul></div></Card>)}</div>
    <p className="text-center text-xs text-slate-400 mt-5">Giá chưa gồm VAT. Số liệu trên là dữ liệu mẫu.</p>

    <h2 className="font-serif text-4xl max-md:text-2xl font-bold text-ink text-center mt-16 max-md:mt-10 mb-8 max-md:mb-4">So sánh tính năng các gói</h2>
    <label className="md:hidden relative block mb-3"><Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng" value={q} onChange={e => setQ(e.target.value)} /></label>
    <Card><div className={`${ROW} py-4 border-b sticky top-14 z-20 bg-white rounded-t-xl`}>
      <label className="relative max-md:hidden"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng" value={q} onChange={e => setQ(e.target.value)} /></label><span className="md:hidden" />
      {PLANS.map(p => <div key={p.id} className="text-center font-serif font-bold text-lg max-md:text-[12px] max-md:leading-tight text-ink">{p.name}</div>)}</div>
      {GROUPS.map(([g, rows]) => { const list = rows.filter(r => r[0].toLowerCase().includes(q.toLowerCase())); if (!list.length) return null;
        return <div key={g}><button type="button" className="w-full flex items-center justify-between px-6 max-md:px-3 py-5 max-md:py-4 border-b text-left" onClick={() => setShut(o => ({ ...o, [g]: !o[g] }))}>
          <span className="font-serif text-2xl max-md:text-lg font-bold text-ink">{g}</span>{shut[g] ? <ChevronRight className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</button>
          {!shut[g] && list.map(([n, ...v]) => <div key={n} className={`${ROW} py-3.5 border-b border-slate-100 text-sm`}>
            <span>{n}</span>{P.map((id, i) => <div key={id} className="text-center"><Cell v={v[i]} /></div>)}</div>)}</div>; })}</Card>
    </div>
  </>;
}
