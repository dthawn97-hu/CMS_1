import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, X, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useCrud, useDB, fmChans, ymd } from '../store.jsx';
import { MultiSelect, Btn, Title, Card, H2, Table, Pager, Toggle, Tabs, Seg, SearchBox, RowActions, Input, Select, Area, FToggle, FCheck, Radios, Back, Footer, useForm } from '../ui.jsx';

/* ---------- Giá Liên Kết ---------- */
const layersText = f => String(f.layers).split(',').filter(Boolean).map(l => `(1-${l}%)`).join('×') || '1';
export function Smart() {
  const fm = useCrud('formulas'), { db } = useDB(), [edit, setEdit] = useState(null); // null | 'new' | id
  return <>
    <Title t="Giá Liên Kết" sub="Cấu hình công thức BAR đẩy lên OTA: Booking.com, Agoda, Expedia…" right={<Btn onClick={() => setEdit('new')}>+ Thêm công thức</Btn>} />
    <div className="md:hidden space-y-3">{fm.list.map((f, i) => <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3"><span className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 grid place-items-center text-sm font-semibold text-slate-600">{i + 1}</span>
        <div className="min-w-0 flex-1"><b className="text-base text-ink">{f.ten_nhan_dien}</b><div className="mt-1 text-xs text-slate-500">{f.c} → <b className="text-slate-700">{f.s}</b></div></div><Toggle checked={f.active} onChange={v => fm.patch(f.id, { active: v })} /></div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 space-y-3 text-sm">
        <div><div className="text-[10px] tracking-wide text-slate-400 mb-1">KÊNH ÁP DỤNG</div><div className="flex flex-wrap gap-1.5">{fmChans(db, f).map(id => db.channels.find(c => c.id === id)?.name).filter(Boolean).map(n => <span key={n} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs text-slate-700">{n}</span>)}{!fmChans(db, f).length && '—'}</div></div>
        <div><div className="text-[10px] tracking-wide text-slate-400 mb-1">CÔNG THỨC</div><div className="text-xs text-slate-700 break-words">((C{+f.d1 ? '+' + f.d1 : ''})×{f.k}{+f.d2 ? '+' + f.d2 : ''}) / {layersText(f)}</div></div></div>
      <div className="mt-2 flex justify-end gap-1"><button type="button" title="Sửa" onClick={() => setEdit(f.id)} className="w-10 h-10 grid place-items-center text-slate-500"><Pencil className="w-4 h-4" /></button><button type="button" title="Xoá" onClick={() => fm.remove(f.id)} className="w-10 h-10 grid place-items-center text-red-500"><Trash2 className="w-4 h-4" /></button></div></div>)}
      {!fm.list.length && <p className="text-center text-slate-400 py-10">Chưa có công thức nào</p>}</div>
    <Card className="max-md:hidden"><Table head={['STT', 'Tên / Nhãn', 'Gói cơ sở (C) → Gói liên kết (S)', 'Kênh áp dụng', 'Công thức', 'Trạng thái', 'Thao tác']} rows={fm.list.map((f, i) => ({ key: f.id, cells: [i + 1, f.ten_nhan_dien, `${f.c} → ${f.s}`, fmChans(db, f).map(id => db.channels.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—',
      <span className="text-xs">((C{+f.d1 ? '+' + f.d1 : ''})×{f.k}{+f.d2 ? '+' + f.d2 : ''}) / {layersText(f)}</span>,
      <Toggle checked={f.active} onChange={v => fm.patch(f.id, { active: v })} />, <RowActions onEdit={() => setEdit(f.id)} onDel={() => fm.remove(f.id)} />] }))} /></Card>
    <div className="max-md:hidden"><Pager n={`${fm.list.length} công thức · Trang 1/1`} label="Số công thức mỗi trang" /></div>
    {edit && <Drawer key={edit} id={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
  </>;
}
function Drawer({ id, onClose }) {
  const { db } = useDB(), fm = useCrud('formulas'), names = db.policies.map(p => p.ten_chinh_sach_gia);
  const f = useForm(id ? fm.get(id) : { ten_nhan_dien: '', c: names[0], s: names[0], channels: [], d1: 0, k: 1, d2: 0, layers: '', active: true });
  const submit = async e => { e.preventDefault(); await fm.save(id, f.v); onClose(); };
  return <><div className="fixed inset-0 bg-black/50 z-40 anim-fade" onClick={onClose} />
    <form onSubmit={submit} className="fixed right-0 top-0 bottom-0 w-[1000px] max-w-[85vw] max-md:w-full max-md:max-w-none bg-white z-50 flex flex-col shadow-2xl anim-slide">
      <div className="flex justify-between items-center px-6 py-4 border-b"><h2 className="font-serif text-xl font-bold">Thiết lập công thức giá liên kết</h2><button type="button" onClick={onClose} className="border rounded-lg p-1.5"><X className="w-4 h-4" /></button></div>
      <div className="p-6 max-md:p-4 space-y-4 flex-1 overflow-y-auto"><Input label="Tên nhận diện *" req f={f} k="ten_nhan_dien" ph="VD: Booking.com +15%" />
        <div className="grid grid-cols-[1fr_auto_1fr] max-md:grid-cols-1 gap-4 items-center">
          <div className="bg-slate-50 border rounded-xl p-4"><b>C · Chính sách giá cơ sở</b><div className="text-xs text-slate-500 mb-3">Giá gốc để tính</div><Select label="Chính sách giá" f={f} k="c" opts={names} /></div><ArrowRight className="w-4 h-4 max-md:rotate-90 max-md:mx-auto" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4"><b className="text-amber-800">S · Chính sách giá liên kết</b><div className="text-xs text-amber-700 mb-3">Giá tính ra · bắt buộc</div><Select label="Chính sách giá *" f={f} k="s" opts={names} /></div></div>
        <Card><div className="p-4"><div className="font-semibold mb-3">S = ((C ± Δ1) × hệ số ± Δ2) / Π(1 − lớp phí%)</div>
          <div className="grid grid-cols-3 max-md:!grid-cols-1 gap-4"><Input label="Δ1 (VND trước nhân)" type="number" f={f} k="d1" /><Input label="Hệ số nhân" type="number" step="any" f={f} k="k" /><Input label="Δ2 (VND sau nhân)" type="number" f={f} k="d2" /></div>
          <div className="mt-4"><Input label="Lớp phí mẫu số (%, cách nhau dấu phẩy — VD: 15,10)" ph="64,10" f={f} k="layers" /></div></div></Card>
        <MultiSelect label="Kênh áp dụng (một giá liên kết có thể gắn nhiều kênh)" opts={db.channels.map(c => [c.id, c.name])} value={f.v.channels?.length ? f.v.channels : fmChans(db, f.v)} onChange={v => f.set('channels', v)} />
        <FCheck f={f} k="active" label="Kích hoạt công thức này" /></div>
      <div className="px-6 py-4 border-t flex justify-end gap-2"><Btn kind="ghost" onClick={onClose}>Huỷ</Btn><Btn type="submit">{id ? 'Lưu công thức' : 'Tạo công thức'}</Btn></div>
    </form></>;
}

/* ---------- Giá thông minh ---------- */
export function Dynamic() {
  const { db, commit } = useDB(), dy = useCrud('dynamics'), nav = useNavigate();
  const [tab, setTab] = useState('cfg'), [q, setQ] = useState('all'), [s, setS] = useState('');
  const list = dy.list.filter(d => (q === 'all' || (q === 'on') === !!d.kich_hoat) && d.ten_mau_gia_linh_dong.toLowerCase().includes(s.toLowerCase()));
  return <>
    <Title t="Giá thông minh" sub="Tự động điều chỉnh giá bán theo công suất phòng, thời điểm đặt và ngày trong tuần." />
    <Tabs value={tab} onChange={setTab} items={[['cfg', 'Cấu hình'], ['list', 'Giá thông minh']]} />
    {tab === 'cfg' ? <Card><div className="p-6"><h3 className="font-serif font-bold mb-1">Phương thức thay đổi giá linh hoạt</h3>
      <p className="text-slate-500 mb-3">Hệ thống tự động điều chỉnh giá phòng dựa trên số lượng phòng còn trống và thời điểm khách đặt phòng để tối ưu doanh thu.</p>
      <ul className="list-disc ml-5 space-y-1 mb-4"><li>Nhiều phòng trống → Có thể giảm giá để thu hút đặt phòng.</li><li>Ít phòng trống → Tăng giá để tối đa doanh thu.</li><li>Đặt sát ngày hoặc đặt sớm → Áp dụng mức giá theo quy tắc đã thiết lập.</li></ul>
      <div className="border-t pt-4 flex justify-between"><span>Đang hoạt động</span><Toggle checked={db.dynCfg.active} onChange={v => commit('dynCfg', { ...db.dynCfg, active: v })} /></div></div></Card>
    : <><div className="md:hidden mb-4 space-y-3">
        <div className="relative"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field !pl-10" placeholder="Tìm theo tên mẫu giá..." value={s} onChange={e => setS(e.target.value)} /></div>
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5">{[['all', 'Tất cả'], ['on', 'Đang hoạt động'], ['off', 'Ngừng hoạt động']].map(([k, l]) => <button key={k} type="button" onClick={() => setQ(k)} className={`min-w-0 rounded-full border px-2.5 py-2 text-[13px] font-medium whitespace-nowrap ${q === k ? 'bg-ink text-white border-ink' : 'bg-white text-slate-700 border-slate-200'}`}>{l}</button>)}</div>
        <Btn className="w-full inline-flex items-center justify-center gap-1.5" onClick={() => nav('/dynamic/new')}><Plus className="w-4 h-4" />Thêm mới mẫu giá thông minh</Btn></div>
      <div className="md:hidden space-y-3">{list.map(d => <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><b className="text-base text-ink">{d.ten_mau_gia_linh_dong}</b><div className="mt-1 text-xs text-slate-500">Gói giá: <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{d.goi || '—'}</span></div></div><Toggle checked={d.kich_hoat} onChange={v => dy.patch(d.id, { kich_hoat: v })} /></div>
        <div className="mt-3 rounded-xl bg-slate-50 p-3 grid grid-cols-2 gap-3 text-sm"><div><div className="text-[10px] tracking-wide text-slate-400">TIÊU CHÍ</div><div className="font-medium">{d.tc || '—'}</div></div><div><div className="text-[10px] tracking-wide text-slate-400">NGÀY ÁP DỤNG</div><div className="font-medium">{(d.from || '').split('-').reverse().join('/')} → {(d.to || '').split('-').reverse().join('/')}</div></div></div>
        <div className="mt-2 flex justify-end gap-1"><button type="button" title="Sửa" onClick={() => nav(`/dynamic/edit/${d.id}`)} className="w-10 h-10 grid place-items-center text-slate-500"><Pencil className="w-4 h-4" /></button><button type="button" title="Xoá" onClick={() => dy.remove(d.id)} className="w-10 h-10 grid place-items-center text-red-500"><Trash2 className="w-4 h-4" /></button></div></div>)}
        {!list.length && <p className="text-center text-slate-400 py-10">Chưa có mẫu giá nào</p>}</div>
      <div className="max-md:hidden"><div className="flex items-center gap-3 mb-4"><SearchBox value={s} onChange={setS} ph="Tìm theo tên mẫu giá..." /><div className="flex-1" />
        <Seg value={q} onChange={setQ} items={[['all', 'Tất cả'], ['on', 'Đang hoạt động'], ['off', 'Ngừng hoạt động']]} /><Btn onClick={() => nav('/dynamic/new')}>+ Thêm mới mẫu giá thông minh</Btn></div>
      <Card><Table head={['Tên mẫu', 'Gói giá (D)', 'Tiêu chí', 'Ngày áp dụng', 'Trạng thái', 'Thao tác']} rows={list.map(d => ({ key: d.id, cells: [<b>{d.ten_mau_gia_linh_dong}</b>, d.goi || '—', d.tc || '—', `${d.from || ''} → ${d.to || ''}`,
        <Toggle checked={d.kich_hoat} onChange={v => dy.patch(d.id, { kich_hoat: v })} />, <RowActions onEdit={() => nav(`/dynamic/edit/${d.id}`)} onDel={() => dy.remove(d.id)} />] }))} /></Card></div></>}
  </>;
}
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const numIn = 'field !py-2 w-24 max-md:w-full';
export function DynamicForm() {
  const { id } = useParams(), { db } = useDB(), dy = useCrud('dynamics'), t = ymd(new Date());
  const f = useForm(id ? dy.get(id) : { ten_mau_gia_linh_dong: '', goi: '', mo_ta: '', kich_hoat: true, tc: 'Số lượng phòng trống', dt: 'Từng hạng phòng', from: t, to: t, bw: false, bwEnds: [], dates: [{ from: t, to: t }], byDay: false, days: [], rooms: [], cfg: {} });
  const [clip, setClip] = useState(null), v = f.v, goi = v.goi || db.policies[0]?.ten_chinh_sach_gia || '';
  const all = v.dt === 'Toàn bộ khách sạn', rooms = db.rooms.filter(r => all ? r.dang_hoat_dong !== false : (v.rooms || []).includes(r.id));
  const dates = v.dates || [{ from: v.from, to: v.to }], ends = v.bwEnds || [], cfg = v.cfg || {};
  const slotsOf = r => cfg[r.id]?.slots || [{ a: 0, b: r.so_luong_phong, d1: 0, k: 1, d2: 0 }];
  const setRoom = (rid, p) => f.set('cfg', { ...cfg, [rid]: { chans: [], ...cfg[rid], ...p } });
  const setSlot = (r, i, p) => setRoom(r.id, { slots: slotsOf(r).map((x, j) => j === i ? { ...x, ...p } : x) });
  const setDate = (i, p) => f.set('dates', dates.map((d, j) => j === i ? { ...d, ...p } : d));
  const submit = e => { e.preventDefault(); const d0 = dates[0] || {}; dy.save(id, { ...v, goi, from: d0.from, to: d0.to, tc: v.bw ? 'Phòng trống + Booking window' : 'Số lượng phòng trống' }, '/dynamic'); };
  const lnk = 'text-brand-dark text-sm hover:underline', mini = 'px-2 py-1 border rounded-md text-slate-700 bg-white';
  const dateF = i => ({ v: dates[i], set: (k, x) => setDate(i, { [k]: x }) });
  return <form onSubmit={submit}>
    <Back to="/dynamic">Quay lại</Back><Title keep t={id ? 'Sửa mẫu giá thông minh' : 'Thêm mới mẫu giá thông minh'} sub="Chọn gói giá và thiết lập quy tắc tự động điều chỉnh giá." />
    <div className="space-y-4">
      <Card><div className="p-5"><H2>Chọn gói giá thông minh (D)</H2><Select f={{ v: { goi }, set: (k, x) => f.set('goi', x) }} k="goi" opts={db.policies.map(p => p.ten_chinh_sach_gia)} className="w-96 max-md:w-full" /></div></Card>
      <Card><div className="p-5 space-y-3"><H2>Thông tin mẫu giá</H2><Input label="Tên mẫu giá thông minh *" req f={f} k="ten_mau_gia_linh_dong" ph="Vd. Giá thông minh cuối tuần" maxLength={250} /><div className="text-right text-xs text-slate-400 -mt-2">{(v.ten_mau_gia_linh_dong || '').length}/250</div>
        <Area label="Mô tả" f={f} k="mo_ta" rows={4} /><div className="text-right text-xs text-slate-400 -mt-2">{(v.mo_ta || '').length}/3000</div><FToggle f={f} k="kich_hoat" label="Kích hoạt" /></div></Card>
      <Card><div className="p-5"><H2>Công thức tính giá</H2>
        <div className="flex gap-8 items-center flex-wrap max-md:flex-col max-md:items-start max-md:gap-1"><b className="font-medium">Tiêu chí</b>
          <div className="flex gap-5 py-2.5 max-md:flex-col max-md:gap-2"><label className="inline-flex items-center gap-2 text-sm"><input type="radio" checked readOnly />Số lượng phòng trống</label><FCheck f={f} k="bw" label="Theo booking window" /></div>
          <b className="font-medium max-md:mt-2">Đối tượng áp dụng</b><Radios f={f} k="dt" opts={['Từng hạng phòng', 'Toàn bộ khách sạn']} /></div>
        {v.bw && <div className="mt-2 rounded-xl bg-slate-50 p-4 space-y-3 text-sm"><div className="flex gap-6 max-md:flex-col max-md:gap-1"><span className="text-slate-500 w-14 shrink-0">Còn lại</span><div className="space-y-2">
          {ends.map((e, i) => <div key={i} className="flex items-center gap-2 flex-wrap">Từ T &gt; {i ? ends[i - 1] : 0} đến ≤ <input type="number" min={(i ? +ends[i - 1] : 0) + 1} className="field !py-1.5 w-20" value={e} onChange={x => f.set('bwEnds', ends.map((y, j) => j === i ? x.target.value : y))} /> ngày<button type="button" className="text-red-500 text-xs" onClick={() => f.set('bwEnds', ends.filter((_, j) => j !== i))}>Xoá</button></div>)}
          <div>Từ T &gt; {ends.length ? ends[ends.length - 1] : 0} ngày</div></div></div>
          <Btn kind="ghost" className="!py-1.5 !px-3 text-sm" onClick={() => f.set('bwEnds', [...ends, (+ends[ends.length - 1] || 0) + 7])}>+ Thêm khoảng</Btn>
          <p className="text-xs text-slate-400">(khoảng còn lại này mặc định lấy số cuối cùng của khung cuối cùng)</p></div>}</div></Card>
      <Card><div className="p-5 space-y-3"><H2>Ngày áp dụng *</H2>
        {dates.map((d, i) => <div key={i} className="flex items-center gap-2"><Input type="date" f={dateF(i)} k="from" req className="w-44 max-md:flex-1" />–<Input type="date" f={dateF(i)} k="to" req className="w-44 max-md:flex-1" />
          {dates.length > 1 && <button type="button" title="Xoá" className="text-red-500 p-1" onClick={() => f.set('dates', dates.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button>}</div>)}
        <div><Btn kind="ghost" className="inline-flex items-center gap-1.5" onClick={() => f.set('dates', [...dates, { from: t, to: t }])}><Plus className="w-4 h-4" />Thêm khoảng ngày</Btn></div>
        <FCheck f={f} k="byDay" label="Theo thứ" />
        {v.byDay && <div className="flex flex-wrap gap-2">{DAYS.map(d => { const on = (v.days || []).includes(d); return <button key={d} type="button" onClick={() => f.set('days', on ? v.days.filter(x => x !== d) : [...(v.days || []), d])} className={`w-11 h-9 rounded-lg border text-sm ${on ? 'bg-ink text-white border-ink' : 'bg-white text-slate-700 border-slate-200'}`}>{d}</button>; })}</div>}</div></Card>
      <Card><div className="p-5"><H2>Áp dụng cho</H2>
        {all ? <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-slate-600 text-sm mb-3">Tự động áp dụng cho {rooms.length} hạng phòng đang hoạt động.</div>
          : <MultiSelect label="Chọn cặp hạng phòng – gói giá" inline opts={db.rooms.map(r => [r.id, `${r.ten_phong_vi} – ${goi}`])} value={v.rooms || []} onChange={x => f.set('rooms', x)} />}
        {!!rooms.length && <div className="font-medium my-3">Tổng số phòng của khách sạn: {db.rooms.reduce((n, r) => n + (+r.so_luong_phong || 0), 0)} phòng</div>}
        <div className="space-y-4">{rooms.map(r => {
          const sl = slotsOf(r), max = +r.so_luong_phong || 0, chans = cfg[r.id]?.chans || [], last = sl[sl.length - 1], full = +last.b >= max, g = v.bw ? 'md:grid-cols-[150px_1fr_1.3fr]' : 'md:grid-cols-[1fr_1.3fr]';
          return <div key={r.id} className="rounded-xl border border-slate-200 p-4 max-md:p-3">
            <div className="flex justify-between items-start gap-2 max-md:flex-col"><b className="text-sm">• {r.ten_phong_vi} – {goi} ({max} phòng)</b>
              <Btn kind="ghost" className="!py-1.5 !px-3 text-xs" onClick={() => f.set('cfg', Object.fromEntries(rooms.map(x => [x.id, { ...cfg[x.id], chans: [...chans], slots: sl.map(s => ({ ...s, b: Math.min(s.b, +x.so_luong_phong || 0) })) }])))}>Áp dụng cho tất cả hạng phòng</Btn></div>
            <div className="mt-3 flex justify-between items-center"><span className="text-sm font-medium">Kênh bán áp dụng *</span><span className="flex gap-2 items-center"><button type="button" className={lnk} onClick={() => setRoom(r.id, { chans: db.channels.map(c => c.id) })}>Chọn tất cả</button><span className="text-slate-300">|</span><button type="button" className={lnk} onClick={() => setRoom(r.id, { chans: [] })}>Xoá</button></span></div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">{db.channels.map(c => <label key={c.id} className="inline-flex items-center gap-1.5 text-sm"><input type="checkbox" checked={chans.includes(c.id)} onChange={e => setRoom(r.id, { chans: e.target.checked ? [...chans, c.id] : chans.filter(x => x !== c.id) })} />{c.name}</label>)}</div>
            <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden text-sm">
              <div className={`grid max-md:hidden bg-slate-50 px-3 py-2 font-semibold text-xs ${g}`}>{v.bw && <span>Booking Window</span>}<span>Số lượng phòng trống</span><span>Công thức linh động</span></div>
              {sl.map((s, i) => <div key={i} className={`grid gap-3 px-3 py-3 items-start border-t first:border-t-0 max-md:grid-cols-1 ${g}`}>
                {v.bw && <span className="text-slate-500 text-xs">Còn lại (T &gt; {ends.length ? ends[ends.length - 1] : 0})</span>}
                <div><div className="flex items-center gap-2 flex-wrap">Từ <input type="number" className={numIn + ' !w-20'} value={s.a} readOnly={i > 0} onChange={e => setSlot(r, i, { a: e.target.value })} /> đến nhỏ hơn <input type="number" className={numIn + ' !w-20'} min={+s.a + 1} max={max} value={s.b} onChange={e => setSlot(r, i, { b: e.target.value })} /></div><div className="text-xs text-slate-400 mt-1">Tối đa {max} phòng</div></div>
                <div className="flex items-center gap-2 flex-wrap">D = (B + <input type="number" className={numIn} value={s.d1} onChange={e => setSlot(r, i, { d1: e.target.value })} /> VND) × <input type="number" step="any" className={numIn + ' !w-20'} value={s.k} onChange={e => setSlot(r, i, { k: e.target.value })} /> + <input type="number" className={numIn} value={s.d2} onChange={e => setSlot(r, i, { d2: e.target.value })} /> VND{sl.length > 1 && <button type="button" title="Xoá" className="text-red-500 p-1" onClick={() => setRoom(r.id, { slots: sl.filter((_, j) => j !== i) })}><X className="w-4 h-4" /></button>}</div></div>)}
              <div className="flex items-center gap-2 flex-wrap px-3 py-2 border-t text-xs text-slate-500">
                {full ? <span>Đã đến số phòng tối đa của hạng này</span> : <button type="button" className={mini} onClick={() => setRoom(r.id, { slots: [...sl, { a: last.b, b: max, d1: 0, k: 1, d2: 0 }] })}>+ Thêm khoảng</button>}
                <button type="button" className={mini} onClick={() => setClip(sl)}>Copy</button><button type="button" disabled={!clip} className={mini + ' disabled:opacity-40'} onClick={() => setRoom(r.id, { slots: clip.map(s => ({ ...s, b: Math.min(s.b, max) })) })}>Paste</button></div></div></div>; })}</div></div></Card></div>
    <p className="mt-6 text-xs text-slate-500 leading-6">B: Giá phòng của loại phòng tương ứng. Giá phòng hiển thị và cập nhật tại màn Bán phòng. Khi tạo mới, giá phòng được lấy mặc định từ giá phòng ở loại phòng.<br />T: số ngày từ lúc đặt phòng đến ngày nhận phòng.</p>
    <Footer ok={id ? 'Lưu' : 'Thêm giá thông minh'} /></form>;
}
