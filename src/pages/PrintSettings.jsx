import { useEffect, useRef, useState } from 'react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, ChevronLeft, ChevronRight, Code2, Eye, FileText, Image, Indent, Italic, LayoutTemplate, Link2, List, ListOrdered, Outdent, Redo2, Receipt, Strikethrough, Table, Underline, Undo2 } from 'lucide-react';
import { useDB } from '../store.jsx';
import { Btn, Card, Select, Title, toast } from '../ui.jsx';

// ponytail: chỉ lưu trong state của trang (PMS chưa có backend) — nối API khi có PMS
const PAPER = ['A4', 'A5', 'K80 (80mm)', 'K58 (58mm)'], DAYS = ['7 ngày', '15 ngày', '30 ngày', '60 ngày', '90 ngày'];
const SUBS = [['room', FileText, 'Cấu hình hóa đơn phòng', 'Khổ giấy hóa đơn phòng', 'Hóa đơn phòng'], ['sales', Receipt, 'Cấu hình hóa đơn bán hàng', 'Khổ giấy, xóa hóa đơn nháp', 'Hóa đơn bán hàng'], ['tpl', LayoutTemplate, 'Thiết lập biểu mẫu', 'Soạn thảo mẫu in chứng từ', 'Biểu mẫu']];
const fmt = d => `${d.toLocaleTimeString('vi-VN', { hour12: false })} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
const PER = 5;

const Sel = ({ l, v, set, opts }) => <Select label={l} f={{ v: { x: v }, set: (k, y) => set(y) }} k="x" opts={opts} />;
const narrow = () => window.matchMedia('(max-width:767px)').matches;

/* Khối cấu hình + lịch sử thay đổi dùng chung cho hóa đơn phòng / bán hàng */
function Config({ kind, fields, title, sub, seed }) {
  const { db } = useDB(), who = db.account.ho_va_ten || 'Admin';
  const [saved, setSaved] = useState(Object.fromEntries(fields.map(f => [f.k, f.def]))), [v, setV] = useState(saved), [hist, setHist] = useState(seed), [pg, setPg] = useState(0);
  const dirty = fields.some(f => v[f.k] !== saved[f.k]), pages = Math.max(1, Math.ceil(hist.length / PER));
  const save = () => { const ch = fields.filter(f => v[f.k] !== saved[f.k]).map(f => ({ t: fmt(new Date()), who, c: `${f.l}: ${saved[f.k]} → ${v[f.k]}` })); setHist([...ch, ...hist]); setSaved(v); setPg(0); toast('Đã lưu thay đổi'); };
  return <div className="space-y-5">
    <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink text-lg">{title}</h3><p className="text-sm text-slate-500 mb-5">{sub}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-md:gap-4">{fields.map(f => <Sel key={f.k} l={f.q} v={v[f.k]} set={x => setV({ ...v, [f.k]: x })} opts={f.opts} />)}</div>
      <div className="flex justify-end gap-2 mt-5 max-md:[&>button]:flex-1"><Btn kind="ghost" disabled={!dirty} onClick={() => setV(saved)}>Hủy</Btn><Btn disabled={!dirty} onClick={save}>Lưu thay đổi</Btn></div></Card>
    <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink mb-4">Lịch sử thay đổi</h3>
      <div className="max-md:hidden grid grid-cols-[1fr_1fr_1.4fr] px-4 py-3 text-sm font-semibold text-slate-600 border-b"><span>Thời gian</span><span>Người thay đổi</span><span>Thay đổi</span></div>
      {hist.slice(pg * PER, pg * PER + PER).map((h, i) => <div key={i} className="grid grid-cols-[1fr_1fr_1.4fr] max-md:grid-cols-1 max-md:gap-0.5 px-4 max-md:px-1 py-4 max-md:py-3 text-sm border-b last:border-0"><span className="max-md:text-xs max-md:text-slate-400">{h.t}</span><span className="max-md:font-medium">{h.who}</span><span>{h.c}</span></div>)}
      {!hist.length && <p className="text-center text-sm text-slate-400 py-6">Chưa có thay đổi nào</p>}
      <div className="flex justify-end gap-2 mt-3"><Btn kind="ghost" disabled={pg === 0} onClick={() => setPg(pg - 1)}><ChevronLeft className="w-4 h-4" /></Btn><Btn kind="ghost" disabled={pg >= pages - 1} onClick={() => setPg(pg + 1)}><ChevronRight className="w-4 h-4" /></Btn></div></Card></div>;
}

/* ---- Soạn thảo biểu mẫu ---- */
const TYPES = ['Đăng ký / Phiếu đăng ký lưu trú', 'Hóa đơn phòng', 'Biên lai thu tiền', 'Hóa đơn bán hàng'], LANGS = ['Tiếng Việt', 'English'];
const TOKENS = ['Arrival', 'Number_Children', 'Room_name', 'Source', 'Company_name', 'Note', 'Deposit', 'Booking_number', 'PassCode_Lock', 'Departure', 'Number_Adults', 'Room_type', 'Price_room_per_night', 'Company_address', 'Total_price', 'Total_price_after_Discount', 'Total_night', 'Full_name', 'Customer_phone', 'Customer_identity_number', 'Customer_birthday', 'Code'];
const SAMPLE = { Arrival: '15/07/2026', Departure: '18/07/2026', Room_name: '101', Room_type: 'Superior', Full_name: 'Nguyễn Văn A', Customer_phone: '0901234567', Customer_identity_number: '079012345678', Customer_birthday: '01/01/1990', Code: 'BK-0001', Booking_number: 'BK-0001', Total_price: '2.400.000đ', Total_night: '3', Source: 'Booking.com', Deposit: '500.000đ', Number_Adults: '2', Number_Children: '0', Company_name: 'Khách sạn Bellhop', Company_address: '12 Nguyễn Huệ, Q1', Price_room_per_night: '800.000đ', Total_price_after_Discount: '2.400.000đ', PassCode_Lock: '123456', Note: '' };
const tok = t => `<b>[${t}]</b>`;
const B = 'border:1px solid #111;padding:6px 10px;vertical-align:top;font-size:12px';
const DEFAULT = `<div style="text-align:center;font-weight:700;font-size:18px;padding:18px">PHIẾU ĐĂNG KÝ / REGISTRATION FORM</div>
<table style="width:100%;border-collapse:collapse"><tr><td style="${B}">Họ tên / Full name: ${tok('Full_name')}<br>Mã đặt phòng / Bks ID: [Code]<br>CCCD / ID: ${tok('Customer_identity_number')}<br>Ngày sinh / DOB: ${tok('Customer_birthday')}<br>Số điện thoại / Phone no.: ${tok('Customer_phone')}<br>Số phòng / Room no.: ${tok('Room_name')}</td>
<td style="${B}">Tổng tiền / Total price: ${tok('Total_price')}<br>Loại phòng / Room type: ${tok('Room_type')}<br>Đêm phòng / Room night: [Total_night]<br>Ngày đến / Arrival date: ${tok('Arrival')}<br>Ngày đi / Departure date: ${tok('Departure')}</td></tr></table>
<p style="font-size:12px;padding:8px 0"><b>Thông tin khác:</b><br>- Biển số xe hơi: &nbsp; - Yêu cầu đặc biệt:<br>- Thuê xe máy: &nbsp; - Chèo SUP:</p>
<p style="font-size:12px">- Tất cả khách lưu trú tại khách sạn cần được đăng ký lưu trú với lễ tân khách sạn. / Guests staying at the hotel must be registered at the reception desk.</p>`;
const ZOOM = narrow() ? 0.45 : 0.75;
const render = h => h.replace(/\[([A-Za-z_]+)\]/g, (m, k) => SAMPLE[k] ?? m);

function Tools({ run, on }) {
  const Bt = ({ cmd, arg, I, t }) => <button type="button" title={t} onMouseDown={e => { e.preventDefault(); run(cmd, arg); }} className="w-8 h-8 grid place-items-center rounded-md text-slate-600 hover:bg-slate-100"><I className="w-4 h-4" /></button>;
  const addTable = () => run('insertHTML', `<table style="border-collapse:collapse;width:100%">${'<tr>' + `<td style="${B}">&nbsp;</td>`.repeat(3) + '</tr>'}${'<tr>' + `<td style="${B}">&nbsp;</td>`.repeat(3) + '</tr>'}</table><br>`);
  return <div className="flex flex-wrap items-center gap-1 p-2 border-b">
    <select className="field !w-32 !py-1.5 !text-sm" defaultValue="p" onChange={e => run('formatBlock', e.target.value)}><option value="p">Đoạn văn</option><option value="h1">Tiêu đề 1</option><option value="h2">Tiêu đề 2</option><option value="h3">Tiêu đề 3</option></select>
    <select className="field !w-24 !py-1.5 !text-sm" defaultValue="3" onChange={e => run('fontSize', e.target.value)}>{[['1', 'Rất nhỏ'], ['2', 'Nhỏ'], ['3', 'Vừa'], ['4', 'Lớn'], ['5', 'Rất lớn']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><span className="w-px h-6 bg-slate-200 mx-1" />
    <Bt cmd="bold" I={Bold} t="Đậm" /><Bt cmd="italic" I={Italic} t="Nghiêng" /><Bt cmd="underline" I={Underline} t="Gạch chân" /><Bt cmd="strikeThrough" I={Strikethrough} t="Gạch ngang" /><span className="w-px h-6 bg-slate-200 mx-1" />
    <Bt cmd="insertUnorderedList" I={List} t="Danh sách" /><Bt cmd="insertOrderedList" I={ListOrdered} t="Danh sách số" /><span className="w-px h-6 bg-slate-200 mx-1" />
    <button type="button" title="Chèn ảnh (đường dẫn)" onMouseDown={e => { e.preventDefault(); on('insertImage', 'Đường dẫn ảnh'); }} className="w-8 h-8 grid place-items-center rounded-md text-slate-600 hover:bg-slate-100"><Image className="w-4 h-4" /></button>
    <button type="button" title="Chèn bảng" onMouseDown={e => { e.preventDefault(); addTable(); }} className="w-8 h-8 grid place-items-center rounded-md text-slate-600 hover:bg-slate-100"><Table className="w-4 h-4" /></button>
    <button type="button" title="Chèn liên kết" onMouseDown={e => { e.preventDefault(); on('createLink', 'Đường dẫn liên kết'); }} className="w-8 h-8 grid place-items-center rounded-md text-slate-600 hover:bg-slate-100"><Link2 className="w-4 h-4" /></button><span className="w-px h-6 bg-slate-200 mx-1" />
    <Bt cmd="undo" I={Undo2} t="Hoàn tác" /><Bt cmd="redo" I={Redo2} t="Làm lại" /><span className="w-px h-6 bg-slate-200 mx-1" />
    <Bt cmd="justifyLeft" I={AlignLeft} t="Căn trái" /><Bt cmd="justifyCenter" I={AlignCenter} t="Căn giữa" /><Bt cmd="justifyRight" I={AlignRight} t="Căn phải" /><Bt cmd="justifyFull" I={AlignJustify} t="Căn đều" /><Bt cmd="indent" I={Indent} t="Thụt vào" /><Bt cmd="outdent" I={Outdent} t="Thụt ra" /></div>;
}

function Templates() {
  const [type, setType] = useState(TYPES[0]), [lang, setLang] = useState(LANGS[0]), [store, setStore] = useState({}), [mode, setMode] = useState('edit'), [raw, setRaw] = useState(''), ref = useRef(null), rng = useRef(null), [pr, setPr] = useState(null), key = type + '|' + lang;
  const html = () => mode === 'raw' ? raw : ref.current?.innerHTML ?? '';
  useEffect(() => { if (ref.current && mode === 'edit') ref.current.innerHTML = store[key] ?? (type === TYPES[0] ? DEFAULT : `<p style="padding:20px;color:#888">Mẫu "${type}" chưa có nội dung</p>`); }, [key, mode]); // eslint-disable-line
  const run = (c, a) => { ref.current?.focus(); document.execCommand(c, false, a); };
  const switchTo = (t, l) => { setStore(s => ({ ...s, [key]: html() })); setType(t); setLang(l); };
  const toMode = m => { if (mode === 'edit') { const h = ref.current.innerHTML; setStore(s => ({ ...s, [key]: h })); setRaw(h); } else if (mode === 'raw') setStore(s => ({ ...s, [key]: raw })); setMode(m); };
  const cur = mode === 'edit' ? null : (mode === 'raw' ? raw : store[key] ?? DEFAULT);
  return <div>
    <h3 className="font-semibold text-ink text-lg">Thiết lập biểu mẫu</h3><p className="text-sm text-slate-500 mb-4">Soạn thảo mẫu in theo từng loại biểu mẫu và ngôn ngữ.</p>
    <div className="flex items-end gap-3 mb-4 flex-wrap"><div className="w-72 max-md:w-full"><Sel l="Loại biểu mẫu" v={type} set={t => switchTo(t, lang)} opts={TYPES} /></div><div className="w-44 max-md:w-full"><Sel l="Ngôn ngữ" v={lang} set={l => switchTo(type, l)} opts={LANGS} /></div>
      <Btn kind="ghost" onClick={() => { navigator.clipboard?.writeText(html()); toast('Đã sao chép mẫu'); }}>Copy mẫu</Btn>
      <Btn kind="ghost" title="Xem / sửa HTML" onClick={() => toMode(mode === 'raw' ? 'edit' : 'raw')}><Code2 className="w-4 h-4" /></Btn>
      <Btn kind="ghost" onClick={() => toMode(mode === 'preview' ? 'edit' : 'preview')}><Eye className="w-4 h-4 mr-2 inline" />{mode === 'preview' ? 'Quay lại soạn' : 'Xem trước'}</Btn></div>
    <div className="grid grid-cols-[1fr_260px] max-md:grid-cols-1 gap-4 items-start">
      <Card className="overflow-hidden">{mode === 'edit' && <Tools run={run} on={(cmd, label) => { const sel = getSelection(); rng.current = sel.rangeCount ? sel.getRangeAt(0) : null; setPr({ cmd, label, v: '' }); }} />}
        {mode === 'edit' && pr && <form className="flex items-center gap-2 p-2 border-b bg-slate-50" onSubmit={e => { e.preventDefault(); if (pr.v.trim()) { ref.current.focus(); const sel = getSelection(); sel.removeAllRanges(); rng.current && sel.addRange(rng.current); document.execCommand(pr.cmd, false, pr.v.trim()); } setPr(null); }}><span className="text-sm text-slate-600">{pr.label}</span><input autoFocus className="field !py-1.5 flex-1" value={pr.v} onChange={e => setPr({ ...pr, v: e.target.value })} /><Btn>Chèn</Btn><Btn type="button" kind="ghost" onClick={() => setPr(null)}>Huỷ</Btn></form>}
        <div className="bg-slate-50 p-4 max-md:p-3 max-h-[560px] overflow-auto"><div className="text-xs text-slate-400 mb-3">Vừa màn hình ({ZOOM * 100}%)</div>
          {mode === 'raw' ? <textarea className="field font-mono !text-xs h-[420px]" value={raw} onChange={e => setRaw(e.target.value)} />
            : mode === 'preview' ? <div className="bg-white border border-slate-300 mx-auto p-4" style={{ width: 794, zoom: ZOOM }} dangerouslySetInnerHTML={{ __html: render(cur) }} />
            : <div ref={ref} contentEditable suppressContentEditableWarning className="bg-white border border-slate-300 mx-auto p-4 outline-none" style={{ width: 794, minHeight: 500, zoom: ZOOM }} />}</div></Card>
      <Card className="p-4 max-h-[620px] max-md:max-h-72 overflow-auto"><div className="text-xs font-semibold tracking-wide text-slate-500 mb-2">PHÒNG</div>
        <div className="max-md:grid max-md:grid-cols-2 max-md:gap-x-2">{TOKENS.map(t => <button key={t} type="button" title="Bấm để chèn vào vị trí con trỏ" disabled={mode !== 'edit'} onMouseDown={e => { e.preventDefault(); run('insertHTML', `<b>[${t}]</b>&nbsp;`); }} className="block w-full text-left px-2 py-1.5 rounded text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40">{t}</button>)}</div></Card></div>
    <div className="mt-4 max-md:[&>button]:w-full"><Btn onClick={() => { setStore(s => ({ ...s, [key]: html() })); toast('Đã lưu mẫu in'); }}>Lưu mẫu in</Btn></div></div>;
}

export default function PrintSettings() {
  const [tab, setTab] = useState('room');
  return <>
    <Title keep t="Máy in & Mẫu in" sub="Thiết lập khổ giấy in hóa đơn phòng, hóa đơn bán hàng và soạn thảo mẫu in chứng từ." />
    <div className="grid grid-cols-[300px_1fr] max-md:grid-cols-1 gap-5 items-start">
      <div className="space-y-2 max-md:space-y-0 max-md:grid max-md:grid-cols-[repeat(3,minmax(0,1fr))] max-md:gap-2">{SUBS.map(([k, I, t, s, sh]) => <button key={k} type="button" onClick={() => setTab(k)} className={`w-full flex items-start gap-3 text-left px-4 py-3 rounded-lg max-md:flex-col max-md:items-center max-md:text-center max-md:gap-1.5 max-md:px-2 max-md:border ${tab === k ? 'bg-ink text-white' : 'hover:bg-white max-md:bg-white'}`}>
        <I className="w-4 h-4 mt-1 max-md:mt-0" /><span className="md:hidden text-[13px] leading-tight font-medium">{sh}</span><div className="max-md:hidden"><div className="text-sm">{t}</div><div className={`text-xs ${tab === k ? 'text-slate-300' : 'text-slate-400'}`}>{s}</div></div></button>)}</div>
      <div className="min-w-0">
        {tab === 'room' && <Config kind="room" title="Cấu hình hóa đơn phòng" sub="Thiết lập khổ giấy in hóa đơn phòng và biên lai." fields={[{ k: 'inv', l: 'Khổ hóa đơn phòng', q: 'Khổ in Hóa đơn phòng', opts: PAPER, def: 'A4' }, { k: 'rec', l: 'Khổ biên lai', q: 'Khổ in Biên lai', opts: PAPER, def: 'A4' }]}
          seed={[{ t: '15:39:09 7/9/2026', who: 'Smoke Test Admin', c: 'Khổ hóa đơn phòng: A5 → A4' }, { t: '09:49:11 7/9/2026', who: 'Smoke Test Admin', c: 'Khổ hóa đơn phòng: A4 → A5' }]} />}
        {tab === 'sales' && <Config kind="sales" title="Cấu hình hóa đơn bán hàng" sub="Thiết lập khổ giấy in hóa đơn bán hàng và thời gian tự động xóa hóa đơn nháp." fields={[{ k: 'pos', l: 'Khổ hóa đơn bán hàng', q: 'Khổ in Hóa đơn bán hàng', opts: PAPER, def: 'A4' }, { k: 'del', l: 'Số ngày tự động xóa hóa đơn nháp', q: 'Số ngày tự động xóa hóa đơn nháp', opts: DAYS, def: '30 ngày' }]} seed={[]} />}
        {tab === 'tpl' && <Templates />}</div></div></>;
}
