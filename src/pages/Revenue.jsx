import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useCrud, useDB, fmChans, ymd } from '../store.jsx';
import { MultiSelect, Btn, Title, Card, H2, Table, Pager, Toggle, Tabs, Seg, SearchBox, RowActions, Input, Select, Area, FToggle, FCheck, Radios, Back, Footer, useForm } from '../ui.jsx';

/* ---------- Giá thông minh ---------- */
const layersText = f => String(f.layers).split(',').filter(Boolean).map(l => `(1-${l}%)`).join('×') || '1';
export function Smart() {
  const fm = useCrud('formulas'), { db } = useDB(), [edit, setEdit] = useState(null); // null | 'new' | id
  return <>
    <Title t="Giá thông minh" sub="Cấu hình công thức BAR đẩy lên OTA: Booking.com, Agoda, Expedia…" right={<Btn onClick={() => setEdit('new')}>+ Thêm công thức</Btn>} />
    <Card><Table head={['STT', 'Tên / Nhãn', 'Gói cơ sở (C) → Gói thông minh (S)', 'Kênh áp dụng', 'Công thức', 'Trạng thái', 'Thao tác']} rows={fm.list.map((f, i) => ({ key: f.id, cells: [i + 1, f.ten_nhan_dien, `${f.c} → ${f.s}`, fmChans(db, f).map(id => db.channels.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—',
      <span className="text-xs">((C{+f.d1 ? '+' + f.d1 : ''})×{f.k}{+f.d2 ? '+' + f.d2 : ''}) / {layersText(f)}</span>,
      <Toggle checked={f.active} onChange={v => fm.patch(f.id, { active: v })} />, <RowActions onEdit={() => setEdit(f.id)} onDel={() => fm.remove(f.id)} />] }))} /></Card>
    <Pager n={`${fm.list.length} công thức · Trang 1/1`} label="Số công thức mỗi trang" />
    {edit && <Drawer key={edit} id={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
  </>;
}
function Drawer({ id, onClose }) {
  const { db } = useDB(), fm = useCrud('formulas'), names = db.policies.map(p => p.ten_chinh_sach_gia);
  const f = useForm(id ? fm.get(id) : { ten_nhan_dien: '', c: names[0], s: names[0], channels: [], d1: 0, k: 1, d2: 0, layers: '', active: true });
  const submit = async e => { e.preventDefault(); await fm.save(id, f.v); onClose(); };
  return <><div className="fixed inset-0 bg-black/50 z-40 anim-fade" onClick={onClose} />
    <form onSubmit={submit} className="fixed right-0 top-0 bottom-0 w-[1000px] max-w-[85vw] bg-white z-50 flex flex-col shadow-2xl anim-slide">
      <div className="flex justify-between items-center px-6 py-4 border-b"><h2 className="font-serif text-xl font-bold">Thiết lập công thức giá thông minh</h2><button type="button" onClick={onClose} className="border rounded-lg p-1.5"><X className="w-4 h-4" /></button></div>
      <div className="p-6 space-y-4 flex-1 overflow-y-auto"><Input label="Tên nhận diện *" req f={f} k="ten_nhan_dien" ph="VD: Booking.com +15%" />
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="bg-slate-50 border rounded-xl p-4"><b>C · Chính sách giá cơ sở</b><div className="text-xs text-slate-500 mb-3">Giá gốc để tính</div><Select label="Chính sách giá" f={f} k="c" opts={names} /></div><ArrowRight className="w-4 h-4" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><b className="text-amber-800">S · Chính sách giá thông minh</b><div className="text-xs text-amber-700 mb-3">Giá tính ra · bắt buộc</div><Select label="Chính sách giá *" f={f} k="s" opts={names} /></div></div>
        <Card><div className="p-4"><div className="font-semibold mb-3">S = ((C ± Δ1) × hệ số ± Δ2) / Π(1 − lớp phí%)</div>
          <div className="grid grid-cols-3 gap-4"><Input label="Δ1 (VND trước nhân)" type="number" f={f} k="d1" /><Input label="Hệ số nhân" type="number" step="any" f={f} k="k" /><Input label="Δ2 (VND sau nhân)" type="number" f={f} k="d2" /></div>
          <div className="mt-4"><Input label="Lớp phí mẫu số (%, cách nhau dấu phẩy — VD: 15,10)" ph="64,10" f={f} k="layers" /></div></div></Card>
        <MultiSelect label="Kênh áp dụng (một giá thông minh có thể gắn nhiều kênh)" opts={db.channels.map(c => [c.id, c.name])} value={f.v.channels?.length ? f.v.channels : fmChans(db, f.v)} onChange={v => f.set('channels', v)} />
        <FCheck f={f} k="active" label="Kích hoạt công thức này" /></div>
      <div className="px-6 py-4 border-t flex justify-end gap-2"><Btn kind="ghost" onClick={onClose}>Huỷ</Btn><Btn type="submit">{id ? 'Lưu công thức' : 'Tạo công thức'}</Btn></div>
    </form></>;
}

/* ---------- Định giá linh động ---------- */
export function Dynamic() {
  const { db, commit } = useDB(), dy = useCrud('dynamics'), nav = useNavigate();
  const [tab, setTab] = useState('cfg'), [q, setQ] = useState('all'), [s, setS] = useState('');
  const list = dy.list.filter(d => (q === 'all' || (q === 'on') === !!d.kich_hoat) && d.ten_mau_gia_linh_dong.toLowerCase().includes(s.toLowerCase()));
  return <>
    <Title t="Định giá linh động" sub="Tự động điều chỉnh giá bán theo công suất phòng, thời điểm đặt và ngày trong tuần." />
    <Tabs value={tab} onChange={setTab} items={[['cfg', 'Cấu hình'], ['list', 'Giá linh động']]} />
    {tab === 'cfg' ? <Card><div className="p-6"><h3 className="font-serif font-bold mb-1">Phương thức thay đổi giá linh hoạt</h3>
      <p className="text-slate-500 mb-3">Hệ thống tự động điều chỉnh giá phòng dựa trên số lượng phòng còn trống và thời điểm khách đặt phòng để tối ưu doanh thu.</p>
      <ul className="list-disc ml-5 space-y-1 mb-4"><li>Nhiều phòng trống → Có thể giảm giá để thu hút đặt phòng.</li><li>Ít phòng trống → Tăng giá để tối đa doanh thu.</li><li>Đặt sát ngày hoặc đặt sớm → Áp dụng mức giá theo quy tắc đã thiết lập.</li></ul>
      <div className="border-t pt-4 flex justify-between"><span>Đang hoạt động</span><Toggle checked={db.dynCfg.active} onChange={v => commit('dynCfg', { ...db.dynCfg, active: v })} /></div></div></Card>
    : <><div className="flex items-center gap-3 mb-4"><SearchBox value={s} onChange={setS} ph="Tìm theo tên mẫu giá..." /><div className="flex-1" />
        <Seg value={q} onChange={setQ} items={[['all', 'Tất cả'], ['on', 'Đang hoạt động'], ['off', 'Ngừng hoạt động']]} /><Btn onClick={() => nav('/dynamic/new')}>+ Thêm mới mẫu giá linh động</Btn></div>
      <Card><Table head={['Tên mẫu', 'Gói giá (D)', 'Tiêu chí', 'Ngày áp dụng', 'Trạng thái', 'Thao tác']} rows={list.map(d => ({ key: d.id, cells: [<b>{d.ten_mau_gia_linh_dong}</b>, d.goi || '—', d.tc || '—', `${d.from || ''} → ${d.to || ''}`,
        <Toggle checked={d.kich_hoat} onChange={v => dy.patch(d.id, { kich_hoat: v })} />, <RowActions onEdit={() => nav(`/dynamic/edit/${d.id}`)} onDel={() => dy.remove(d.id)} />] }))} /></Card></>}
  </>;
}
export function DynamicForm() {
  const { id } = useParams(), { db } = useDB(), dy = useCrud('dynamics'), t = ymd(new Date());
  const f = useForm(id ? dy.get(id) : { ten_mau_gia_linh_dong: '', goi: db.policies[0]?.ten_chinh_sach_gia, mo_ta: '', kich_hoat: true, tc: 'Số lượng phòng trống', dt: 'Từng hạng phòng', from: t, to: t, phong: db.rooms[0]?.id });
  return <form onSubmit={e => { e.preventDefault(); dy.save(id, f.v, '/dynamic'); }}>
    <Back to="/dynamic">Quay lại</Back><Title keep t={id ? 'Sửa mẫu giá linh động' : 'Thêm mới mẫu giá linh động'} sub="Chọn gói giá và thiết lập quy tắc tự động điều chỉnh giá." />
    <div className="space-y-4">
      <Card><div className="p-5"><H2>Chọn gói giá linh động (D)</H2><Select f={f} k="goi" opts={db.policies.map(p => p.ten_chinh_sach_gia)} className="w-96" /></div></Card>
      <Card><div className="p-5 space-y-3"><H2>Thông tin mẫu giá</H2><Input label="Tên mẫu giá linh động *" req f={f} k="ten_mau_gia_linh_dong" ph="Vd. Giá linh động cuối tuần" /><Area label="Mô tả" f={f} k="mo_ta" rows={4} /><FToggle f={f} k="kich_hoat" label="Kích hoạt" /></div></Card>
      <Card><div className="p-5"><H2>Công thức tính giá</H2><div className="flex gap-8 items-center"><b className="font-medium">Tiêu chí</b><Radios f={f} k="tc" opts={['Số lượng phòng trống', 'Theo booking window']} />
        <b className="font-medium">Đối tượng áp dụng</b><Radios f={f} k="dt" opts={['Từng hạng phòng', 'Toàn bộ khách sạn']} /></div></div></Card>
      <Card><div className="p-5"><H2>Ngày áp dụng *</H2><div className="flex items-center gap-2"><Input type="date" f={f} k="from" req className="w-44" />–<Input type="date" f={f} k="to" req className="w-44" /></div></div></Card>
      <Card><div className="p-5"><H2>Áp dụng cho</H2><Select f={f} k="phong" opts={db.rooms.map(r => [r.id, r.ten_phong_vi])} /></div></Card></div>
    <Footer ok={id ? 'Lưu' : 'Thêm giá linh động'} /></form>;
}
