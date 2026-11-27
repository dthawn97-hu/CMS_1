import { useState } from 'react';
import { CalendarCheck, Plus, Search, Trash2, ArrowLeft, ChevronRight, Eye, User, Clock, Banknote, PlusCircle, MousePointerClick } from 'lucide-react';
import { Btn, Card, Select, toast } from '../ui.jsx';

// ponytail: dữ liệu chỉ nằm trong state của trang (PMS chưa có backend) — nối API/DB khi có PMS
const MobHead = ({ t, sub }) => <div className="md:hidden mb-4"><h1 className="font-serif text-ink">{t}</h1><p className="text-slate-500">{sub}</p></div>;
const SIDE = 'block w-full text-left px-4 py-3 rounded-lg text-sm border-l-4';
const side = on => `${SIDE} ${on ? 'bg-slate-100 text-ink font-semibold border-ink' : 'text-slate-500 border-transparent hover:bg-slate-50'}`;
const Lbl = ({ l, req, children, className = '' }) => <label className={`block ${className}`}><span className="block font-semibold text-ink mb-1.5">{l}{req && <span className="text-red-500"> *</span>}</span>{children}</label>;
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/* ---- Thẻ xem trước booking card ---- */
const CHANNELS = ['Booking.com', 'Agoda', 'Trip.com', 'Airbnb', 'Trực tiếp'];
function Preview({ o, colors }) {
  const [ch, setCh] = useState('Booking.com');
  const price = { first: '800.000đ', last: '850.000đ', total: '2.450.000đ' }[o.price];
  return <Card className="p-5 max-md:p-4 mb-5"><div className="flex items-center justify-between gap-2 mb-4"><b className="inline-flex items-center gap-2"><Eye className="w-4 h-4 max-md:inline hidden" />Xem trước booking card</b>
    <Select className="w-40 max-md:w-44 [&_.field]:!py-1.5" f={{ v: { ch }, set: (k, x) => setCh(x) }} k="ch" opts={CHANNELS} /></div>
    <div className="mx-auto w-full max-w-[420px] flex rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <div className="w-[88px] text-white grid place-items-center text-center py-4" style={{ background: colors['Đã đặt'] }}><div><CalendarCheck className="w-4 h-4 mx-auto mb-1" /><div className="text-[10px] font-bold">SUP</div><div className="text-2xl font-bold">101</div></div></div>
      <div className="flex-1 p-2.5 text-xs bg-white"><div className="flex justify-between items-center"><span className="font-medium">{ch}</span><span className="px-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px]">Đã đặt</span></div>
        <div className="font-semibold text-sm mt-0.5">{o.guest === 'nat' && '🇻🇳 '}Nguyễn Văn A{o.guest === 'sex' && ' (Nam)'}{o.seg && ' - Gia đình'}</div>
        <div className="text-slate-500 mt-1">{o.time === 'date' ? '15/07 14:00 → 18/07 12:00' : '3 đêm'}</div>
        <div className="text-slate-500">SUP · 3 đêm{o.src && ' · OTA'}</div><div className="mt-2 flex justify-between items-center rounded bg-slate-50 px-2 py-1.5"><span className="text-slate-500">{{ first: 'Giá đêm đầu', last: 'Giá đêm cuối', total: 'Tổng giá phòng' }[o.price]}</span><b className="text-sm" style={{ color: colors['Đã đặt'] }}>{price}</b></div></div></div>
    <p className="md:hidden mt-3 flex items-start gap-2 text-xs text-slate-500"><MousePointerClick className="w-4 h-4 shrink-0" />Tùy chọn phía dưới sẽ cập nhật ngay trên thẻ mẫu.</p></Card>;
}

/* ---- Sơ đồ phòng ---- */
const TI = { KHÁCH: User, 'THỜI GIAN': Clock, 'GIÁ PHÒNG': Banknote, THÊM: PlusCircle };
const Head = ({ t }) => { const I = TI[t]; return <div className="flex items-center gap-2 text-xs max-md:text-[13px] font-semibold tracking-wide text-slate-500 max-md:text-ink mb-3"><I className="w-4 h-4 text-brand-dark" />{t}</div>; };
const Radios = ({ title, name, items, o, set }) => <Card className="p-4"><Head t={title} />
  {items.map(([k, l]) => <label key={k} className="flex items-center gap-3 py-1.5"><input type="radio" checked={o[name] === k} onChange={() => set({ ...o, [name]: k })} />{l}</label>)}</Card>;
const STATUS = [['Phòng trống', '#01C656'], ['Đã đặt', '#0073D1'], ['Chưa đến', '#B052C0'], ['Có khách', '#D9390D'], ['Chưa đi', '#FCAD6C'], ['Bảo trì', '#BABABA'], ['Bẩn', '#000000'], ['Đã trả', '#EC4899']];
const PALETTE = ['#01C656', '#22C55E', '#14B8A6', '#0073D1', '#3B82F6', '#6366F1', '#B052C0', '#A855F7', '#EC4899', '#F43F5E', '#D9390D', '#EF4444', '#FCAD6C', '#F59E0B', '#EAB308', '#84CC16', '#BABABA', '#64748B', '#334155', '#000000'];
const DEF = { guest: 'nat', time: 'date', price: 'first', seg: true, src: true };

export function RoomMap({ sub }) {
  const [saved, setSaved] = useState(DEF), [o, setO] = useState(DEF), [cols, setCols] = useState(Object.fromEntries(STATUS)),
    [names, setNames] = useState(Object.fromEntries(STATUS.map(([n]) => [n, n]))), [pk, setPk] = useState(null), [draft, setDraft] = useState('#000000');
  const colors = cols;
  return <div>
    <div>
      <h3 className="font-semibold text-ink max-md:text-lg">{sub === 'info' ? 'Cấu hình thẻ đặt phòng' : 'Màu trạng thái phòng'}</h3>
      <p className="text-xs max-md:text-sm text-slate-500 mb-4">{sub === 'info' ? 'Chọn thông tin sẽ hiển thị trên booking card trong sơ đồ phòng.' : 'Tùy chỉnh màu sắc hiển thị cho từng trạng thái phòng trên sơ đồ.'}</p>
      <Preview o={o} colors={colors} />
      {sub === 'info' ? <>
        <div className="grid grid-cols-4 max-md:!grid-cols-1 gap-4">
          <Radios title="KHÁCH" name="guest" o={o} set={setO} items={[['name', 'Chỉ hiển thị tên khách'], ['sex', 'Giới tính'], ['nat', 'Quốc tịch']]} />
          <Radios title="THỜI GIAN" name="time" o={o} set={setO} items={[['date', 'Ngày đến/đi'], ['nights', 'Thời gian khách ở (số đêm)']]} />
          <Radios title="GIÁ PHÒNG" name="price" o={o} set={setO} items={[['first', 'Giá đêm đầu'], ['last', 'Giá đêm cuối'], ['total', 'Tổng giá phòng']]} />
          <Card className="p-4"><Head t="THÊM" />
            {[['src', 'Nhóm nguồn'], ['seg', 'Phân khúc khách hàng']].map(([k, l]) => <label key={k} className="flex items-center gap-3 py-1.5"><input type="checkbox" checked={o[k]} onChange={e => setO({ ...o, [k]: e.target.checked })} />{l}</label>)}
            <p className="text-xs text-slate-400 mt-2">Nguồn dữ liệu lấy từ cấu hình Phân loại Booking</p></Card></div>
        <div className="flex justify-end gap-2 mt-5 max-md:[&>button]:flex-1"><Btn kind="ghost" onClick={() => setO(saved)}>Hủy</Btn><Btn onClick={() => { setSaved(o); toast('Đã lưu thay đổi'); }}>Lưu thay đổi</Btn></div></>
      : <><div className="grid grid-cols-[1fr_280px] max-md:grid-cols-1 gap-4 items-start">
          <Card className="max-md:order-2"><div className="grid grid-cols-[1fr_200px_90px] max-md:grid-cols-[1fr_104px_84px] max-md:gap-2 px-5 max-md:px-3 py-3 text-xs font-semibold tracking-wide text-slate-500 border-b"><span>TRẠNG THÁI</span><span>MÀU HIỆN TẠI</span><span className="max-md:text-right">HÀNH ĐỘNG</span></div>
            {STATUS.map(([n]) => <div key={n} className="grid grid-cols-[1fr_200px_90px] max-md:grid-cols-[1fr_104px_84px] max-md:gap-2 items-center px-5 max-md:px-3 py-2.5 border-b last:border-0">
              <div className="flex items-center gap-3 max-md:gap-2 min-w-0"><i className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cols[n] }} /><input className="field !w-44 max-md:!w-full min-w-0 !py-1.5" value={names[n]} onChange={e => setNames({ ...names, [n]: e.target.value })} /></div>
              <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-md shrink-0" style={{ background: cols[n] }} /><input className="field !w-28 !py-1.5 uppercase max-md:hidden" value={cols[n]} maxLength={7} onChange={e => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && setCols({ ...cols, [n]: e.target.value })} /><span className="md:hidden font-mono text-xs uppercase text-slate-500">{cols[n]}</span></div>
              <button type="button" className="md:hidden px-1 py-1.5 rounded-md border text-xs font-medium text-center whitespace-nowrap" onClick={() => { setPk(n); setDraft(cols[n]); }}>Đổi màu</button><label className="max-md:hidden relative px-3 py-1.5 rounded-md border text-xs font-medium text-center cursor-pointer hover:bg-slate-50 whitespace-nowrap">Đổi màu<input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={cols[n]} onChange={e => setCols({ ...cols, [n]: e.target.value })} /></label></div>)}</Card>
          <Card className="p-4 max-md:order-1"><div className="flex items-center justify-between mb-3"><b className="max-md:text-sm max-md:tracking-wide">{'Preview sơ đồ phòng'}</b><span className="md:hidden text-xs text-slate-400">{STATUS.length} trạng thái</span></div><div className="grid grid-cols-2 gap-2">{STATUS.map(([n]) => <div key={n} className="h-12 max-md:h-11 rounded-md max-md:rounded-lg grid place-items-center text-white text-xs max-md:text-sm font-semibold" style={{ background: cols[n], color: n === 'Chưa đi' ? '#333' : '#fff' }}>{names[n]}</div>)}</div></Card></div>
        <div className="md:hidden sticky bottom-0 z-10 mt-4 -mx-1 px-1 py-3 bg-page/90 backdrop-blur flex gap-2 [&>button]:flex-1"><Btn kind="ghost" onClick={() => { setCols(Object.fromEntries(STATUS)); setNames(Object.fromEntries(STATUS.map(([n]) => [n, n]))); }}>Mặc định</Btn><Btn onClick={() => toast('Đã lưu thay đổi')}>Lưu thay đổi</Btn></div>
        {pk && <><div className="md:hidden fixed inset-0 bg-black/40 z-[60] anim-fade" onClick={() => setPk(null)} />
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[61] rounded-t-2xl bg-white p-4 pb-6 shadow-2xl anim-rise"><div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" /><div className="font-semibold text-ink mb-3">Đổi màu: {names[pk]}</div>
            <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] gap-3 mb-4">{PALETTE.map(c => <button key={c} type="button" onClick={() => setDraft(c)} className={`h-11 rounded-lg border-2 ${draft.toLowerCase() === c.toLowerCase() ? 'border-ink' : 'border-transparent'}`} style={{ background: c }} />)}</div>
            <div className="flex items-center gap-3 mb-4"><span className="w-11 h-11 rounded-lg border shrink-0" style={{ background: draft }} /><input className="field uppercase" value={draft} maxLength={7} onChange={e => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && setDraft(e.target.value)} /></div>
            <div className="flex gap-2 [&>button]:flex-1"><Btn kind="ghost" onClick={() => setPk(null)}>Huỷ</Btn><Btn disabled={draft.length !== 7} onClick={() => { setCols({ ...cols, [pk]: draft }); setPk(null); }}>Áp dụng</Btn></div></div></>}</>}
    </div></div>;
}

/* ---- Phân loại booking ---- */
const OTA = ['Agoda', 'Booking.com', 'Trip.com'];
// nguồn mẫu theo nhóm — dùng chung cho Cài đặt > Nhóm nguồn và chọn nguồn trong chi tiết đặt phòng
export const SRC_TREE = { OTA, Direct: ['Trực tiếp', 'Walk-in', 'Điện thoại', 'Website', 'Facebook / Zalo'], 'Cộng tác viên': ['Khách quen'] };
export const GROUPS = [['OTA', 'Kênh đặt phòng online qua các nền tảng', 'border-l-blue-500'], ['Công tác', 'Khách công tác, khách đi công tác', 'border-l-orange-400'], ['Travel Agent / Tour', 'Khách đến từ đại lý du lịch, công ty', 'border-l-emerald-500'],
  ['Direct', 'Khách đặt trực tiếp qua website, điện thoại', 'border-l-purple-500'], ['Long Stay / Resident', 'Khách ở dài ngày, khách thuê theo tháng', 'border-l-pink-500'], ['Event / MICE', 'Khách đi theo sự kiện, hội nghị, hội thảo', 'border-l-teal-500'], ['Cộng tác viên', 'Khách được giới thiệu bởi cá nhân/đối tác', 'border-l-amber-500']];
const code = (g, n) => g.split(' ')[0].toUpperCase() + '-' + n.toUpperCase().replace(/[^A-Z0-9]/g, '');
const FIELDS = [['Người đại diện', 'rep'], ['Số điện thoại', 'tel', 'Số điện thoại của kênh (nếu có)'], ['Số di động', 'mob'], ['Email', 'mail', 'Email của kênh (nếu có)'], ['Email liên hệ', 'mail2'], ['Chức vụ', 'role'], ['Mã số thuế', 'tax']];

export function Sources() {
  const [src, setSrc] = useState(() => Object.fromEntries(Object.entries(SRC_TREE).map(([g, l]) => [g, l.map(n => ({ n }))]))), [g, setG] = useState('OTA'), [sel, setSel] = useState(0), [q, setQ] = useState(''), [off, setOff] = useState({}), [det, setDet] = useState(false);
  const list = src[g] ?? [], cur = list[sel], upd = p => setSrc({ ...src, [g]: list.map((s, i) => i === sel ? { ...s, ...p } : s) });
  const shown = list.map((s, i) => [s, i]).filter(([s]) => s.n.toLowerCase().includes(q.toLowerCase()));
  return <><div className={det ? 'hidden' : ''}><MobHead t="Nhóm nguồn" sub="Quản lý nguồn đặt phòng theo từng nhóm để lọc và thống kê booking." /></div>
  <div className="grid grid-cols-[340px_1fr] max-md:grid-cols-1 gap-5 items-start">
    <Card className={`max-h-[640px] max-md:max-h-none overflow-y-auto ${det ? 'max-md:hidden' : ''}`}><div className="sticky top-0 bg-white border-b p-2 space-y-2">
      <Select className="[&_.field]:font-semibold" f={{ v: { g }, set: (k, x) => { setG(x); setSel(0); setQ(''); } }} k="g" opts={GROUPS.map(([n]) => [n, `${n} (${(src[n] ?? []).length})`])} /><label className="relative block"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input className="field !pl-9" placeholder={`Lọc nguồn trong ${g}`} value={q} onChange={e => setQ(e.target.value)} /></label>
      <Btn kind="ghost" className="w-full justify-center" onClick={() => { setSrc({ ...src, [g]: [...list, { n: 'Nguồn mới' }] }); setSel(list.length); setQ(''); setDet(true); }}><Plus className="w-4 h-4 mr-1 inline" />Thêm {g}</Btn></div>
      {shown.length ? shown.map(([s, i]) => <button key={i} type="button" onClick={() => { setSel(i); setDet(true); }} className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-0 ${i === sel ? 'bg-slate-100 max-md:bg-brand/10 max-md:shadow-[inset_3px_0_0_#2bb3c6]' : 'hover:bg-slate-50'} ${off[g + s.n] ? 'opacity-50' : ''}`}>
        <span className="w-9 h-9 rounded-lg bg-slate-100 border grid place-items-center text-[11px] text-slate-500">{s.n.slice(0, 2).toUpperCase()}</span><div className="flex-1 min-w-0"><div className="font-medium">{s.n}</div><div className="text-[11px] text-slate-400">{code(g, s.n)}</div></div><ChevronRight className="w-4 h-4 text-slate-300 md:hidden" /></button>)
        : <p className="text-center text-sm text-slate-400 py-10">Chưa có nguồn nào</p>}</Card>
    <Card className={`p-6 max-md:p-4 ${det ? '' : 'max-md:hidden'}`}><button type="button" onClick={() => setDet(false)} className="md:hidden inline-flex items-center gap-1 text-slate-700 mb-3 text-sm"><ArrowLeft className="w-4 h-4" />Danh sách {g}</button>{cur ? <><h3 className="font-semibold text-ink mb-4">Chi tiết công ty</h3>
      <p className="rounded-lg bg-slate-50 border text-xs text-slate-500 p-3 mb-5">Mã nguồn và tên nguồn được cố định để đồng bộ filter booking. Khách sạn có thể điền thêm số điện thoại, email hoặc thông tin liên hệ của kênh.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4"><Lbl l="Mã nguồn" req><input disabled className="field" value={code(g, cur.n)} /></Lbl>
        <Lbl l="Tên nguồn" req>{cur.n === 'Nguồn mới' || !OTA.includes(cur.n) ? <input className="field" value={cur.n} onChange={e => upd({ n: e.target.value })} /> : <input disabled className="field" value={cur.n} />}</Lbl>
        <Lbl l="Nhóm nguồn"><input disabled className="field" value={g} /></Lbl>
        {FIELDS.map(([l, k, ph]) => <Lbl key={k} l={l}><input className="field" placeholder={ph} value={cur[k] ?? ''} onChange={e => upd({ [k]: e.target.value })} /></Lbl>)}
        <Lbl l="Địa chỉ liên hệ" className="md:col-span-2"><textarea rows={3} className="field" value={cur.addr ?? ''} onChange={e => upd({ addr: e.target.value })} /></Lbl>
        <Lbl l="Mô tả" className="md:col-span-2"><textarea rows={3} className="field" value={cur.desc ?? ''} onChange={e => upd({ desc: e.target.value })} /></Lbl></div>
      <div className="flex gap-2 mt-5 max-md:[&>button]:flex-1"><Btn onClick={() => toast('Đã lưu thay đổi')}>Lưu thay đổi</Btn><Btn kind="ghost" onClick={() => { setOff({ ...off, [g + cur.n]: !off[g + cur.n] }); toast(off[g + cur.n] ? 'Đã kích hoạt lại' : 'Đã vô hiệu hóa'); }}>{off[g + cur.n] ? 'Kích hoạt' : 'Vô hiệu hóa'}</Btn></div></>
      : <p className="text-center text-slate-400 py-16">Chọn hoặc thêm một nguồn</p>}</Card></div></>;
}

const SEGS = ['Gia đình', 'Công tác', 'Nhóm'];
export function Segments() {
  const [list, setList] = useState([...SEGS.map(n => ({ n, def: true }))]), [sel, setSel] = useState(0), [det, setDet] = useState(false), cur = list[sel];
  const upd = p => setList(list.map((s, i) => i === sel ? { ...s, ...p } : s));
  return <><div className={det ? 'hidden' : ''}><MobHead t="Phân khúc khách hàng" sub="Quản lý các phân khúc dùng để phân loại khách trong booking." /></div>
  <div className="grid grid-cols-[340px_1fr] max-md:grid-cols-1 gap-5 items-start">
    <Card className={det ? 'max-md:hidden' : ''}><div className="p-2 border-b"><Btn kind="ghost" className="w-full justify-center" onClick={() => { setList([...list, { n: 'Phân khúc mới' }]); setSel(list.length); setDet(true); }}><Plus className="w-4 h-4 mr-1 inline" />Thêm phân khúc</Btn></div>
      {list.map((s, i) => <button key={i} type="button" onClick={() => { setSel(i); setDet(true); }} className={`w-full text-left px-4 py-3 border-b last:border-b-0 border-l-4 ${i === sel ? 'bg-slate-100 max-md:bg-brand/10 border-l-ink max-md:border-l-brand' : 'border-l-transparent hover:bg-slate-50'}`}>
        <div className="flex justify-between"><b className="font-medium">{s.n}</b>{s.def && <span className="text-[10px] px-1.5 rounded bg-slate-100 border">Mặc định</span>}</div><div className="text-[11px] text-slate-400">Nhóm phân khúc khách hàng</div></button>)}</Card>
    <Card className={`p-6 max-md:p-4 ${det ? '' : 'max-md:hidden'}`}><button type="button" onClick={() => setDet(false)} className="md:hidden inline-flex items-center gap-1 text-slate-700 mb-3 text-sm"><ArrowLeft className="w-4 h-4" />Danh sách phân khúc</button><h3 className="font-semibold text-ink mb-4">Chi tiết phân khúc khách hàng</h3><div className="max-w-[520px] space-y-4">
      <Lbl l="Tên phân khúc" req><input className="field" value={cur.n} onChange={e => upd({ n: e.target.value })} /></Lbl>
      <Lbl l="Mã phân khúc"><input disabled className="field" value={slug(cur.n)} /></Lbl>
      <Lbl l="Mô tả"><textarea rows={3} className="field" placeholder="Mô tả ngắn về phân khúc này (tùy chọn)" value={cur.d ?? ''} onChange={e => upd({ d: e.target.value })} /></Lbl>
      <Btn className="max-md:w-full" onClick={() => toast('Đã lưu thay đổi')}>Lưu thay đổi</Btn></div></Card></div></>;
}

/* ---- Phân loại khách hàng (hạng theo số lượt lưu trú) ---- */
const TIERS = [['Khách mới', 0], ['Bạc', 2], ['Vàng', 4], ['Kim cương', 7]].map(([n, f]) => ({ n, f }));
export function Tiers() {
  const [saved, setSaved] = useState(TIERS), [rows, setRows] = useState(TIERS), dirty = JSON.stringify(rows) !== JSON.stringify(saved);
  const sorted = [...rows].map(r => +r.f).sort((a, b) => a - b), range = r => { const nx = sorted.find(x => x > +r.f); return nx === undefined ? `từ ${r.f} lượt` : `${r.f} – ${nx - 1} lượt`; };
  const set = (i, p) => setRows(rows.map((r, j) => j === i ? { ...r, ...p } : r));
  const save = () => { if (rows.some(r => !r.n.trim() || r.f === '')) return toast('Nhập đủ tên hạng và số lượt', true); setSaved(rows); toast('Đã lưu thay đổi'); };
  return <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink max-md:text-lg">Phân loại khách hàng</h3>
    <p className="text-xs max-md:text-sm text-slate-500 mb-5">Mỗi khách sạn tự đặt các hạng khách theo số lượt lưu trú (chỉ tính lượt đã trả phòng). Không có hạng mặc định.</p>
    <div className="grid grid-cols-[1fr_170px_150px_40px] max-md:hidden gap-3 text-xs text-slate-400 mb-2 px-1"><span>Tên hạng</span><span>Từ N lượt lưu trú</span><span>Khoảng áp dụng</span><span /></div>
    <div className="space-y-2.5 max-md:space-y-3">{rows.map((r, i) => <div key={i} className="relative grid grid-cols-[1fr_170px_150px_40px] max-md:grid-cols-2 gap-3 max-md:gap-x-3 max-md:gap-y-3 items-center max-md:rounded-xl max-md:border max-md:border-slate-200 max-md:p-3"><input className="field max-md:col-span-2 max-md:!pr-12 max-md:!text-[17px] max-md:!font-bold max-md:text-ink" placeholder="Tên hạng" value={r.n} onChange={e => set(i, { n: e.target.value })} />
      <label className="block"><span className="md:hidden block text-xs text-slate-500 mb-1">Từ N lượt lưu trú</span><input className="field" inputMode="numeric" value={r.f} onChange={e => set(i, { f: e.target.value.replace(/D/g, '') })} /></label>
      <div><span className="md:hidden block text-xs text-slate-500 mb-1">Khoảng áp dụng</span><div className="text-xs max-md:text-sm text-slate-500 max-md:flex max-md:items-center max-md:rounded-lg max-md:bg-slate-50 max-md:border max-md:border-slate-100 max-md:px-3 max-md:h-[46px] max-md:font-medium max-md:text-ink">{r.f === '' ? '—' : range(r)}</div></div>
      <button type="button" title="Xoá hạng" className="text-slate-400 hover:text-red-500 max-md:absolute max-md:right-4 max-md:top-4 max-md:w-9 max-md:h-9 max-md:grid max-md:place-items-center" onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></button></div>)}</div>
    <Btn kind="ghost" className="mt-4 max-md:w-full" onClick={() => setRows([...rows, { n: '', f: '' }])}><Plus className="w-4 h-4 mr-1 inline" />Thêm hạng</Btn>
    <div className="flex gap-2 mt-6 pt-5 border-t max-md:[&>button]:flex-1"><Btn disabled={!dirty} onClick={save}>Lưu thay đổi</Btn><Btn kind="ghost" disabled={!dirty} onClick={() => setRows(saved)}>Hủy</Btn></div></Card>;
}
