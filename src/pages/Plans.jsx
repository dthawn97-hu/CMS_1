import { useState } from 'react';
import { Check, X, Search, ChevronDown, ChevronRight, Sprout } from 'lucide-react';
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
const ROW = 'grid grid-cols-[1.3fr_repeat(4,1fr)] items-center px-6';
const Cell = ({ v }) => v === T ? <Check className="w-[18px] h-[18px] mx-auto rounded-full bg-ink text-white p-[3px]" /> : v === F ? <X className="w-4 h-4 mx-auto text-slate-400" />
  : <span className="inline-block rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">{v}</span>;

export default function Plans() {
  const [yearly, setYearly] = useState(true), [q, setQ] = useState(''), [shut, setShut] = useState({}), cur = 'pro';
  const price = p => p.price == null ? 'Liên hệ' : p.price === 0 ? '0 ₫' : money(Math.round(p.price * (p.id === 'pro' && !yearly ? 1.15 : 1))) + ' ₫';
  const pick = p => toast(p.price == null ? 'Bộ phận kinh doanh sẽ liên hệ bạn' : `Đã ghi nhận yêu cầu chuyển sang gói ${p.name}`);
  return <>
    <Title keep t="Gói dịch vụ" sub="Chọn gói phù hợp với quy mô khách sạn. Một gói dùng chung cho cả CMS và PMS." right={<Seg value={yearly ? 'y' : 'm'} onChange={v => setYearly(v === 'y')} items={[['y', 'Theo năm'], ['m', 'Theo tháng']]} />} />
    <div className="grid grid-cols-4 gap-5">{PLANS.map(p => <Card key={p.id} className={`p-6 flex flex-col ${p.hot ? 'shadow-lg border-brand' : ''}`}>
      <Sprout className="w-9 h-9 text-ink" strokeWidth={1.4} />
      <div className="mt-6 flex items-center gap-2"><h2 className="font-serif text-3xl font-bold text-ink">{p.name}</h2>{p.id === cur && <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Đang dùng</span>}</div>
      <div className="text-slate-600 mt-1">{p.tag}</div>
      <div className="mt-6 text-2xl font-bold text-ink">{price(p)}</div><div className="text-xs text-slate-500 mt-1 min-h-8">{p.id === 'pro' && !yearly ? 'Mỗi tháng, thanh toán theo tháng' : p.note}</div>
      <Btn className="mt-5 w-full justify-center" kind={p.id === cur ? 'ghost' : undefined} disabled={p.id === cur} onClick={() => pick(p)}>{p.id === cur ? 'Gói hiện tại' : p.cta}</Btn>
      <div className="mt-5 pt-5 border-t border-slate-200 text-sm">{p.prev && <div className="font-semibold text-ink mb-2">Mọi tính năng của {p.prev}, cộng thêm:</div>}
        <ul className="space-y-2.5">{p.perks.map(x => <li key={x} className="flex gap-2.5"><Check className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />{x}</li>)}</ul></div></Card>)}</div>
    <p className="text-center text-xs text-slate-400 mt-5">Giá chưa gồm VAT. Số liệu trên là dữ liệu mẫu.</p>

    <h2 className="font-serif text-4xl font-bold text-ink text-center mt-16 mb-8">So sánh tính năng các gói</h2>
    <Card><div className={`${ROW} py-4 border-b sticky top-14 z-20 bg-white rounded-t-xl`}>
      <label className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input className="field !pl-9" placeholder="Tìm tính năng" value={q} onChange={e => setQ(e.target.value)} /></label>
      {PLANS.map(p => <div key={p.id} className="text-center font-serif font-bold text-lg text-ink">{p.name}</div>)}</div>
      {GROUPS.map(([g, rows]) => { const list = rows.filter(r => r[0].toLowerCase().includes(q.toLowerCase())); if (!list.length) return null;
        return <div key={g}><button type="button" className="w-full flex items-center justify-between px-6 py-5 border-b text-left" onClick={() => setShut(o => ({ ...o, [g]: !o[g] }))}>
          <span className="font-serif text-2xl font-bold text-ink">{g}</span>{shut[g] ? <ChevronRight className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}</button>
          {!shut[g] && list.map(([n, ...v]) => <div key={n} className={`${ROW} py-3.5 border-b border-slate-100 text-sm`}>
            <span>{n}</span>{P.map((id, i) => <div key={id} className="text-center"><Cell v={v[i]} /></div>)}</div>)}</div>; })}</Card>
  </>;
}
