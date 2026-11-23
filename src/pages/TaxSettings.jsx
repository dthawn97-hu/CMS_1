import { useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import { useDB } from '../store.jsx';
import { Btn, Card, Select, Title, toast } from '../ui.jsx';

// ponytail: chỉ lưu trong state của trang (PMS chưa có backend) — nối API khi có PMS
const ZONES = [['room', 'Tiền phòng & phụ thu', 'Doanh thu tiền phòng và phụ thu tiền phòng'], ['svc', 'Dịch vụ', 'Đèn bù, giặt là, minibar, dịch vụ phòng...'], ['total', 'Tổng hóa đơn', 'Áp dụng trên toàn bộ hóa đơn']];
const uid = () => Math.random().toString(36).slice(2, 8);
const num = s => s.replace(/[^\d.]/g, '');
const Head = ({ t, sub, right, stack }) => <div className={`flex items-start justify-between ${stack ? 'max-md:flex-col max-md:gap-3' : 'gap-3'}`}><div><h3 className="font-semibold text-ink text-lg max-md:text-base max-md:leading-snug">{t}</h3>{sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}</div>{right}</div>;
const AddBtn = ({ children, ...p }) => <Btn kind="ghost" {...p}><Plus className="w-4 h-4 mr-1 inline" />{children}</Btn>;
const Fld = ({ l, children }) => <label className="block"><span className="block text-xs text-slate-600 mb-1.5">{l}</span>{children}</label>;

export default function TaxSettings() {
  const { db } = useDB();
  const [taxes, setTaxes] = useState([{ id: 'vat', name: 'VAT', rate: 10 }, { id: 'svc', name: 'Phí dịch vụ', rate: 5 }]), [incl, setIncl] = useState(false), [auto, setAuto] = useState(false),
    [zone, setZone] = useState({ room: [{ id: 'vat', after: true }], svc: [{ id: 'svc', after: true }], total: [] }), [nw, setNw] = useState(null),
    [rules, setRules] = useState([{ id: 'r0', tax: 'vat', rate: 8, room: '', ch: '' }]), [rf, setRf] = useState(null), [drag, setDrag] = useState(null);
  const tx = id => taxes.find(t => t.id === id), label = id => tx(id) ? `${tx(id).name} ${tx(id).rate}%` : '—';
  const setRate = (id, rate) => setTaxes(taxes.map(t => t.id === id ? { ...t, rate } : t));
  const drop = z => { if (drag && !zone[z].some(x => x.id === drag)) setZone({ ...zone, [z]: [...zone[z], { id: drag, after: true }] }); setDrag(null); };
  const patchZ = (z, id, p) => setZone({ ...zone, [z]: zone[z].map(x => x.id === id ? { ...x, ...p } : x) });
  const delTax = id => { setTaxes(taxes.filter(t => t.id !== id)); setZone(Object.fromEntries(Object.entries(zone).map(([k, v]) => [k, v.filter(x => x.id !== id)]))); setRules(rules.filter(r => r.tax !== id)); };
  const move = (i, d) => { const a = [...rules], j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setRules(a); };
  const formula = (z, t, after) => { const base = { room: 'Tiền phòng & phụ thu', svc: 'Dịch vụ', total: 'Tổng hóa đơn' }[z]; return `(${after ? `${base} − Chiết khấu` : base}) × (1 − ${label(t)})`; };
  const scope = r => [r.room && db.rooms.find(x => x.id === r.room)?.ten_phong_vi, r.ch && db.channels.find(x => x.id === r.ch)?.name].filter(Boolean).join(' · ') || 'Mặc định (tất cả)';
  return <>
    <Title keep t="Cấu hình Thuế/Phí" sub="Thiết lập các loại thuế, phí và quy định thời điểm áp dụng lên doanh thu khách sạn" right={<Btn onClick={() => toast('Đã lưu cấu hình Thuế/Phí')}><Save className="w-4 h-4 mr-2 inline" />Lưu</Btn>} />
    <div className="space-y-5">
      <Card className="p-7 max-md:p-4 space-y-5"><Head t="Thuế/Phí đã thiết lập" right={<AddBtn onClick={() => setNw({ name: '', rate: '' })}>Thêm mới</AddBtn>} />
        <div className="flex gap-4 max-md:gap-3"><div className="w-64 max-md:w-auto max-md:flex-1 min-w-0"><Select label="VAT (%)" disabled={!tx('vat')} f={{ v: { r: String(tx('vat')?.rate ?? '') }, set: (k, x) => setRate('vat', +x) }} k="r" opts={[0, 5, 8, 10].map(v => [String(v), `${v}%`])} /></div>
          <div className="w-64 max-md:w-auto max-md:flex-1 min-w-0"><Fld l="Phí dịch vụ (%)"><input inputMode="decimal" className="field" disabled={!tx('svc')} value={tx('svc')?.rate ?? ''} onChange={e => setRate('svc', num(e.target.value))} /></Fld></div></div>
        {nw && <div className="flex items-end gap-3 p-3 rounded-lg bg-slate-50 border max-md:flex-col max-md:items-stretch [&>label]:max-md:w-full [&_.field]:max-md:!w-full [&>button]:max-md:w-full"><Fld l="Tên thuế/phí"><input autoFocus className="field !w-52" value={nw.name} onChange={e => setNw({ ...nw, name: e.target.value })} /></Fld>
          <Fld l="Tỉ lệ (%)"><input inputMode="decimal" className="field !w-28" value={nw.rate} onChange={e => setNw({ ...nw, rate: num(e.target.value) })} /></Fld>
          <Btn onClick={() => { if (!nw.name.trim() || nw.rate === '') return toast('Nhập tên và tỉ lệ', true); setTaxes([...taxes, { id: uid(), name: nw.name.trim(), rate: nw.rate }]); setNw(null); }}>Thêm</Btn><Btn kind="ghost" onClick={() => setNw(null)}>Huỷ</Btn></div>}
        <div className="flex flex-wrap gap-2">{taxes.map(t => <span key={t.id} draggable onDragStart={() => setDrag(t.id)} className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 text-brand-dark text-sm px-3 py-1 cursor-grab">
          <GripVertical className="w-3.5 h-3.5 text-brand" />{t.name} {t.rate}%{!['vat', 'svc'].includes(t.id) && <button type="button" title="Xoá" onClick={() => delTax(t.id)}><X className="w-3.5 h-3.5" /></button>}</span>)}</div>
        <label className="flex items-center gap-3"><input type="checkbox" checked={incl} onChange={e => setIncl(e.target.checked)} />Giá đã bao gồm thuế (inclusive)</label></Card>

      <Card className="p-7 max-md:p-4 space-y-5"><Head t="Áp dụng vào doanh thu" sub="Kéo một Thuế/Phí ở trên và thả vào ô tương ứng, chọn thời điểm áp dụng trước hoặc sau khi trừ chiết khấu" />
        <div className="grid grid-cols-3 max-md:!grid-cols-1 gap-5">{ZONES.map(([z, t, d]) => <div key={z} onDragOver={e => e.preventDefault()} onDrop={() => drop(z)} className="rounded-lg border border-dashed border-slate-300 p-4 min-h-[170px]">
          <div className="font-semibold text-ink">{t}</div><div className="text-xs text-slate-500 mb-3">{d}</div>
          {zone[z].map(x => <div key={x.id} className="rounded-md border border-brand/30 bg-brand/10 p-2.5 mb-2 text-xs">
            <div className="flex justify-between font-semibold text-ink text-sm"><span>{label(x.id)}</span><button type="button" title="Gỡ" onClick={() => setZone({ ...zone, [z]: zone[z].filter(y => y.id !== x.id) })}><X className="w-3.5 h-3.5 text-brand-dark" /></button></div>
            <div className="flex gap-1.5 my-1.5">{[[false, 'Trước giảm giá'], [true, 'Sau giảm giá']].map(([v, l]) => <button key={l} type="button" onClick={() => patchZ(z, x.id, { after: v })} className={`px-2 py-0.5 rounded border ${x.after === v ? 'bg-ink text-white border-ink font-semibold' : 'bg-white text-slate-600'}`}>{l}</button>)}</div>
            <div className="text-slate-500">{formula(z, x.id, x.after)}</div></div>)}
          {!zone[z].length && <p className="italic text-xs text-slate-400">Kéo Thuế/Phí vào đây để áp dụng<span className="md:hidden"> hoặc chạm để thêm</span></p>}
          <div className="md:hidden flex flex-wrap gap-2 mt-2">{taxes.filter(t => !zone[z].some(x => x.id === t.id)).map(t => <button key={t.id} type="button" onClick={() => setZone({ ...zone, [z]: [...zone[z], { id: t.id, after: true }] })} className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand text-brand-dark text-sm px-3 py-1.5"><Plus className="w-3.5 h-3.5" />{t.name} {t.rate}%</button>)}</div>
          {z === 'total' && <p className="text-[11px] text-slate-400 mt-3">Tổng hóa đơn = tổng hai công thức trên</p>}</div>)}</div>
        <label className="flex items-center gap-3"><input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} />Tự động áp dụng Thuế/Phí đối với các đặt phòng mới (không áp dụng với đặt phòng từ OTA)</label></Card>

      <Card className="p-7 max-md:p-4 space-y-4"><Head stack t="Quy tắc Thuế/Phí theo Loại phòng/Kênh" right={<AddBtn className="max-md:w-full" disabled={!taxes.length} onClick={() => setRf({ tax: taxes[0]?.id ?? '', rate: '', room: '', ch: '' })}>Thêm quy tắc</AddBtn>} />
        <p className="text-xs text-slate-500">Quy tắc cụ thể hơn (Loại phòng + Kênh) sẽ ưu tiên hơn quy tắc chung. Không cộng dồn — chỉ 1 quy tắc áp dụng cho mỗi lần tính.</p>
        {rf && <div className="grid grid-cols-[1fr_110px_1fr_1fr_auto] max-md:grid-cols-2 items-end gap-3 p-3 rounded-lg bg-slate-50 border">
          <Select label="Thuế/Phí" f={{ v: rf, set: (k, x) => setRf({ ...rf, [k]: x }) }} k="tax" opts={taxes.map(t => [t.id, t.name])} />
          <Fld l="Tỉ lệ (%)"><input inputMode="decimal" className="field" value={rf.rate} onChange={e => setRf({ ...rf, rate: num(e.target.value) })} /></Fld>
          <Select label="Loại phòng" f={{ v: rf, set: (k, x) => setRf({ ...rf, [k]: x }) }} k="room" opts={[['', 'Tất cả'], ...db.rooms.map(r => [r.id, r.ten_phong_vi])]} />
          <Select label="Kênh" f={{ v: rf, set: (k, x) => setRf({ ...rf, [k]: x }) }} k="ch" opts={[['', 'Tất cả'], ...db.channels.map(c => [c.id, c.name])]} />
          <div className="flex gap-2 max-md:col-span-2 max-md:[&>button]:flex-1"><Btn onClick={() => { if (rf.rate === '') return toast('Nhập tỉ lệ', true); setRules([...rules, { ...rf, id: uid() }]); setRf(null); }}>Thêm</Btn><Btn kind="ghost" onClick={() => setRf(null)}>Huỷ</Btn></div></div>}
        <div className="space-y-2">{rules.map((r, i) => <div key={r.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"><GripVertical className="w-4 h-4 text-slate-300" />
          <div className="flex-1"><div className="flex items-center gap-2"><b>{tx(r.tax)?.name}</b><span className="text-[11px] px-2 rounded-full border bg-white">{(+r.rate).toFixed(3)}%</span></div><div className="text-xs text-slate-500">{scope(r)}</div></div>
          <button type="button" title="Lên" className="p-1.5 text-slate-500 hover:text-ink" onClick={() => move(i, -1)}><ArrowUp className="w-4 h-4" /></button>
          <button type="button" title="Xuống" className="p-1.5 text-slate-500 hover:text-ink" onClick={() => move(i, 1)}><ArrowDown className="w-4 h-4" /></button>
          <button type="button" title="Xoá quy tắc" className="p-1.5 text-red-500" onClick={() => setRules(rules.filter(x => x.id !== r.id))}><Trash2 className="w-4 h-4" /></button></div>)}
          {!rules.length && <p className="text-center text-sm text-slate-400 py-4">Chưa có quy tắc nào</p>}</div></Card>
    </div></>;
}
