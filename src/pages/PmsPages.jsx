import { useRef, useState } from 'react';
import { Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { money } from '../store.jsx';
import { useFin } from '../finStore.js';
import { Btn, Card, Select, Title, toast } from '../ui.jsx';

// ponytail: các trang này chỉ lưu trong state của trang (PMS chưa có backend) — nối API khi có PMS
const Lbl = ({ l, req, children, className = '' }) => <label className={`block ${className}`}><span className="block text-xs text-slate-600 mb-1.5">{l}{req && ' *'}</span>{children}</label>;
// tab gạch chân dùng chung
const Underline = ({ items, value, onChange }) => <div className="flex gap-6 border-b border-slate-200 mb-5">{items.map(([k, l]) => <button key={k} type="button" onClick={() => onChange(k)}
  className={`pb-2.5 -mb-px border-b-2 text-sm ${value === k ? 'border-brand text-brand-dark font-semibold' : 'border-transparent text-slate-500 hover:text-ink'}`}>{l}</button>)}</div>;
const Drawer = ({ title, onClose, children }) => <div className="fixed inset-0 z-50 bg-black/50 anim-fade" onMouseDown={e => e.target === e.currentTarget && onClose()}>
  <div className="absolute right-0 top-0 h-full w-[500px] max-md:!w-full max-md:!max-w-none max-md:p-4 bg-white p-6 overflow-auto"><div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold text-ink">{title}</h3><button type="button" title="Đóng" onClick={onClose}><X className="w-5 h-5" /></button></div>{children}</div></div>;

/* ---------------- Tỷ giá ---------------- */
export function Rates() {
  const [tab, setTab] = useState('pms'), [rows, setRows] = useState({ pms: [{ c: 'USD', r: '25400' }], cms: [{ c: 'EUR', r: '27500' }] }), list = rows[tab];
  const set = a => setRows({ ...rows, [tab]: a });
  const save = () => { if (list.some(x => !x.c.trim() || !+x.r)) return toast('Nhập đủ ngoại tệ và tỷ giá', true); if (new Set(list.map(x => x.c.trim().toUpperCase())).size < list.length) return toast('Ngoại tệ bị trùng', true); toast('Đã lưu tỷ giá'); };
  return <><Title keep t="Tỷ giá" sub="Khai báo tỷ giá quy đổi từ ngoại tệ sang VND cho PMS và CMS." />
    <Card className="p-7 max-md:p-4"><h3 className="font-semibold text-ink text-lg mb-5">Tỷ giá</h3>
      <Underline items={[['pms', 'Tỷ giá'], ['cms', 'Tỷ giá CMS']]} value={tab} onChange={setTab} />
      <div className="md:hidden space-y-3"><div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-sm"><div className="text-xs text-slate-500">Loại tiền mặc định</div><div className="flex justify-between font-medium text-ink"><span>VND - Dong</span><span>Tỷ giá 1</span></div></div>
        {list.map((x, i) => <div key={i} className="grid grid-cols-[96px_1fr_36px] gap-x-2 gap-y-1 items-end rounded-xl border border-slate-200 p-3"><span className="text-xs text-slate-500">Ngoại tệ</span><span className="text-xs text-slate-500">Tỷ giá (1 đơn vị = ? VND)</span><span />
          <input className="field uppercase" maxLength={5} placeholder="USD" value={x.c} onChange={e => set(list.map((y, j) => j === i ? { ...y, c: e.target.value.replace(/[^a-zA-Z]/g, '') } : y))} />
          <input inputMode="numeric" className="field text-right" value={x.r ? money(+x.r) : ''} onChange={e => set(list.map((y, j) => j === i ? { ...y, r: e.target.value.replace(/D/g, '') } : y))} />
          <button type="button" title="Xoá" className="h-11 grid place-items-center text-red-500" onClick={() => set(list.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button></div>)}</div>
      <div className="max-md:hidden grid grid-cols-[1fr_1fr_28px] gap-x-3 gap-y-3 items-center"><span className="text-xs text-slate-600">Ngoại tệ</span><span className="text-xs text-slate-600">Tỷ giá (1 đơn vị = ? VND)</span><span />
        <input disabled className="field" value="Loại tiền mặc định: VND - Dong" /><input disabled className="field text-right" value="1" /><span />
        {list.map((x, i) => [<input key={'c' + i} className="field uppercase" maxLength={5} placeholder="VD: USD" value={x.c} onChange={e => set(list.map((y, j) => j === i ? { ...y, c: e.target.value.replace(/[^a-zA-Z]/g, '') } : y))} />,
          <input key={'r' + i} inputMode="numeric" className="field text-right" value={x.r ? money(+x.r) : ''} onChange={e => set(list.map((y, j) => j === i ? { ...y, r: e.target.value.replace(/\D/g, '') } : y))} />,
          <button key={'d' + i} type="button" title="Xoá" className="text-red-500" onClick={() => set(list.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button>])}</div>
      <button type="button" className="mt-4 text-sm font-medium inline-flex items-center gap-1 max-md:w-full max-md:justify-center max-md:rounded-xl max-md:border max-md:border-slate-200 max-md:py-2.5" onClick={() => set([...list, { c: '', r: '' }])}><Plus className="w-4 h-4" />Thêm ngoại tệ</button>
      <div className="flex justify-end max-md:mt-4 max-md:[&>button]:w-full"><Btn onClick={save}>Lưu</Btn></div></Card></>;
}

/* ---------------- Thanh toán QR code ---------------- */
const GATES = [['vnpay', 'Mã QR (via VNPay)'], ['bidv', 'Mã VietQR (BIDV)'], ['ab', 'Mã VietQR (via ABBank)'], ['mb', 'Mã VietQR (via MBBank)']];
const VNPAY = ['App ID', 'Merchant Name', 'Merchant Code', 'Secret Key', 'Terminal ID', 'Merchant Type', 'Secret Key Query'];
export function QrPay() {
  const [tab, setTab] = useState('qr'), [reg, setReg] = useState({ tax: '', country: 'Việt Nam', city: '', district: '', addr: '' }), [on, setOn] = useState({ vnpay: true }), [act, setAct] = useState('vnpay'),
    [cfg, setCfg] = useState({}), [fin, setFin] = useFin(), banks = fin.banks, setBanks = a => setFin(s => ({ ...s, banks: a })), [nb, setNb] = useState({ no: '', bank: '', br: '' }), [acct, setAcct] = useState('');
  const g = GATES.find(x => x[0] === act), put = (k, v) => setCfg({ ...cfg, [act + k]: v });
  return <><Title keep t="Thanh toán QR code" sub="Cấu hình đăng ký và kết nối cổng thanh toán QR." />
    <Underline items={[['qr', 'QR code'], ['bank', 'Tài khoản ngân hàng']]} value={tab} onChange={setTab} />
    {tab === 'qr' ? <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      <Card className="p-6 max-md:p-4 space-y-4"><h3 className="font-semibold text-ink">Đăng ký</h3>
        <Lbl l="Mã số thuế"><input className="field" value={reg.tax} onChange={e => setReg({ ...reg, tax: e.target.value })} /></Lbl>
        <Select label="Quốc gia" f={{ v: reg, set: (k, x) => setReg({ ...reg, country: x }) }} k="country" opts={['Việt Nam', 'Khác']} />
        <Lbl l="Tỉnh/Thành"><input className="field" value={reg.city} onChange={e => setReg({ ...reg, city: e.target.value })} /></Lbl>
        <Lbl l="Quận/Huyện"><input className="field" value={reg.district} onChange={e => setReg({ ...reg, district: e.target.value })} /></Lbl>
        <Lbl l="Địa chỉ"><input className="field" value={reg.addr} onChange={e => setReg({ ...reg, addr: e.target.value })} /></Lbl>
        <Btn className="max-md:w-full" onClick={() => toast('Đã lưu thông tin đăng ký')}>Lưu</Btn></Card>
      <Card className="p-6 max-md:p-4"><h3 className="font-semibold text-ink mb-4">Kết nối với cổng thanh toán</h3>{GATES.map(([k, l]) => <label key={k} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${act === k ? 'bg-blue-50' : ''}`} onClick={() => setAct(k)}>
        <input type="checkbox" checked={!!on[k]} onChange={e => setOn({ ...on, [k]: e.target.checked })} />{l}</label>)}</Card>
      <Card className="p-6 max-md:p-4 space-y-4"><h3 className="font-semibold text-ink">{g[1]}</h3>
        {!on[act] && <p className="text-xs text-slate-500">Tích chọn cổng này ở cột bên cạnh để bật kết nối.</p>}
        {act === 'vnpay' && VNPAY.map(f => <Lbl key={f} l={f}><input className="field" disabled={!on[act]} value={cfg[act + f] ?? ''} onChange={e => put(f, e.target.value)} /></Lbl>)}
        <Select label="Tài khoản ngân hàng" disabled={!on[act]} f={{ v: { acct }, set: (k, x) => setAcct(x) }} k="acct" opts={[['', 'Chọn tài khoản'], ...banks.map(b => [b.no, `${b.no} - ${b.bank}`])]} />
        <Btn className="max-md:w-full" disabled={!on[act]} onClick={() => toast('Đã lưu cấu hình ' + g[1])}>Lưu</Btn></Card></div>
    : <Card className="p-2"><div className="max-md:hidden grid grid-cols-[1fr_1fr_1fr_40px] px-4 py-3 text-xs font-semibold text-slate-600"><span>Số tài khoản</span><span>Tên ngân hàng</span><span>Chi nhánh</span><span /></div>
        {banks.map(b => <div key={b.no} className="grid grid-cols-[1fr_1fr_1fr_40px] max-md:grid-cols-[1fr_40px] max-md:gap-y-0.5 px-4 py-4 max-md:py-3 text-sm items-center max-md:border-b max-md:last:border-0"><span className="max-md:font-semibold max-md:text-ink">{b.no}</span><span className="max-md:text-slate-600">{b.bank}</span><span className="max-md:text-xs max-md:text-slate-400">{b.br}</span>
          <button type="button" title="Xoá" className="text-slate-400 hover:text-red-500 max-md:col-start-2 max-md:row-start-1 max-md:row-span-3 max-md:h-10 max-md:grid max-md:place-items-center" onClick={() => setBanks(banks.filter(x => x.no !== b.no))}><Trash2 className="w-4 h-4" /></button></div>)}
        <form className="grid grid-cols-[1fr_1fr_1fr_auto] max-md:grid-cols-1 gap-3 p-3 max-md:border-t max-md:[&>button]:w-full" onSubmit={e => { e.preventDefault(); if (!nb.no.trim() || !nb.bank.trim()) return toast('Nhập số tài khoản và tên ngân hàng', true); if (banks.some(x => x.no === nb.no.trim())) return toast('Số tài khoản đã tồn tại', true); setBanks([...banks, { no: nb.no.trim(), bank: nb.bank.trim(), br: nb.br.trim() }]); setNb({ no: '', bank: '', br: '' }); }}>
          {[['no', 'Số tài khoản'], ['bank', 'Tên ngân hàng'], ['br', 'Chi nhánh']].map(([k, p]) => <input key={k} className="field" placeholder={p} value={nb[k]} onChange={e => setNb({ ...nb, [k]: e.target.value })} />)}<Btn>Lưu</Btn></form></Card>}</>;
}

/* ---------------- Import dữ liệu ---------------- */
const IMPORTS = {
  room: ['Phòng', ['roomNumber', 'floor', 'roomTypeCode'], 'roomNumber,floor,roomTypeCode\n101,1,STD\n102,1,DLX\n201,2,SUITE'],
  booking: ['Đặt phòng lịch sử', ['guestName', 'guestEmail', 'guestPhone', 'roomNumber', 'checkIn', 'checkOut', 'status', 'adults', 'totalVnd'], 'guestName,guestEmail,roomNumber,checkIn,checkOut,status,totalVnd\nNguyen Van A,a@hotel.com,101,2026-01-01,2026-01-05,checked_out,2000000\nTran Thi B,,102,2026-01-03,2026-01-07,confirmed,3500000'],
};
export function ImportData() {
  const [tab, setTab] = useState('room'), [res, setRes] = useState(null), [over, setOver] = useState(false), ref = useRef(null), [title, req, sample] = IMPORTS[tab];
  const read = async f => {
    if (!f) return; if (!/\.(csv|xlsx|xls)$/i.test(f.name)) return toast('Chỉ nhận .csv, .xlsx, .xls', true);
    if (!/\.csv$/i.test(f.name)) return setRes({ name: f.name, err: 'Chưa đọc được file Excel — vui lòng lưu thành CSV rồi chọn lại.' });
    const rows = (await f.text()).replace(/^﻿/, '').split(/\r?\n/).filter(x => x.trim()).map(l => l.split(',').map(c => c.trim())), head = rows[0] ?? [], miss = req.filter(c => !head.includes(c));
    setRes(miss.length ? { name: f.name, err: `Thiếu cột bắt buộc: ${miss.join(', ')}` } : rows.length - 1 > 1000 ? { name: f.name, err: 'Vượt quá 1000 hàng' } : rows.length < 2 ? { name: f.name, err: 'File không có dữ liệu' } : { name: f.name, head, body: rows.slice(1) });
  };
  return <><Title keep t="Import dữ liệu" sub="Upload CSV hoặc Excel để nhập dữ liệu hàng loạt" />
    <div className="flex gap-2 mb-5 max-md:[&>button]:flex-1 max-md:[&>button]:px-2">{Object.entries(IMPORTS).map(([k, [l]]) => <button key={k} type="button" onClick={() => { setTab(k); setRes(null); }} className={`px-4 py-2 rounded-full text-sm font-medium ${tab === k ? 'bg-ink text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand hover:text-brand-dark'}`}>{l}</button>)}</div>
    <Card className="p-5 mb-5 text-sm"><div className="font-semibold text-ink mb-3 break-words">Cột bắt buộc: {req.join(', ')}</div><pre className="text-slate-500 text-xs leading-5 font-sans overflow-x-auto max-md:whitespace-pre-wrap max-md:break-all max-md:rounded-lg max-md:bg-slate-50 max-md:p-3">{sample}</pre></Card>
    <div onClick={() => ref.current.click()} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); read(e.dataTransfer.files[0]); }}
      className={`rounded-xl border-2 border-dashed py-14 max-md:py-10 text-center cursor-pointer ${over ? 'border-brand bg-brand/5' : 'border-slate-300 bg-white'}`}>
      <UploadCloud className="w-8 h-8 mx-auto text-slate-400" /><div className="font-medium mt-2">Chọn file CSV hoặc Excel</div><div className="text-xs text-slate-400 mt-1">.csv, .xlsx, .xls — tối đa 1000 hàng</div>
      <input ref={ref} type="file" hidden accept=".csv,.xlsx,.xls" onChange={e => { read(e.target.files[0]); e.target.value = ''; }} /></div>
    {res && <Card className="mt-5 p-5 max-md:p-4"><div className="flex items-center justify-between gap-3"><b className="break-all">{res.name}</b><button type="button" className="text-xs text-slate-500" onClick={() => setRes(null)}>Bỏ file</button></div>
      {res.err ? <p className="text-sm text-red-600 mt-2">{res.err}</p> : <><p className="text-sm text-slate-600 mt-2">Hợp lệ: {res.body.length} hàng. Xem trước 5 hàng đầu:</p>
        <div className="overflow-auto mt-3"><table className="text-xs w-full"><thead><tr>{res.head.map(h => <th key={h} className="text-left px-2 py-1.5 bg-slate-50 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{res.body.slice(0, 5).map((r, i) => <tr key={i} className="border-t">{res.head.map((h, j) => <td key={h} className="px-2 py-1.5">{r[j]}</td>)}</tr>)}</tbody></table></div>
        <div className="mt-4 max-md:[&>button]:w-full"><Btn onClick={() => toast('Chưa kết nối PMS nên chưa nhập được dữ liệu', true)}>Nhập {res.body.length} hàng</Btn></div></>}</Card>}</>;
}

/* ---------------- Cấu hình dịch vụ ---------------- */
const CATS = [['Đền bù', 'compensation'], ['Dịch vụ khác', 'other'], ['Giặt là', 'laundry'], ['Minibar', 'minibar'], ['Dịch vụ phòng', 'room_service']];
const uid = () => Math.random().toString(36).slice(2, 8);
export function Services() {
  const [groups, setGroups] = useState([{ id: 'g1', cat: 'compensation', name: 'Đền bù 1', on: false }]), [svcs, setSvcs] = useState([{ id: 's1', g: 'g1', name: 'Đền bù dép', code: '', unit: '', price: 50000, on: true }]),
    [cat, setCat] = useState('compensation'), [gid, setGid] = useState('g1'), [dr, setDr] = useState(null);
  const gl = groups.filter(g => g.cat === cat), cur = groups.find(g => g.id === gid && g.cat === cat) ?? gl[0], list = svcs.filter(s => s.g === cur?.id);
  const saveG = () => { if (!dr.name.trim()) return toast('Nhập tên nhóm', true); const g = { id: uid(), cat, name: dr.name.trim(), on: true }; setGroups([...groups, g]); setGid(g.id); setDr(null); toast('Đã thêm nhóm'); };
  const saveS = () => { if (!dr.name.trim() || !+dr.price) return toast('Nhập tên và đơn giá', true); setSvcs([...svcs, { id: uid(), g: cur.id, name: dr.name.trim(), code: dr.code, unit: dr.unit, price: +dr.price, on: true }]); setDr(null); toast('Đã thêm dịch vụ'); };
  const Col = ({ h, children, cls = '' }) => <div className="border-r last:border-0 min-h-[560px] max-md:min-h-0 max-md:border-r-0 max-md:border-b"><div className="px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 border-b uppercase">{h}</div><div className={`p-2.5 ${cls}`}>{children}</div></div>;
  const Link = p => <button type="button" className="px-3 py-2 text-sm font-medium text-brand-dark inline-flex items-center gap-1.5" {...p}><Plus className="w-3.5 h-3.5" />{p.children}</button>;
  return <><Title keep t="Dịch vụ mở rộng" sub="Quản lý các dịch vụ bán thêm hoặc phát sinh trong quá trình vận hành khách sạn — đền bù, dịch vụ khác, giặt là, minibar và dịch vụ phòng." />
    <Card className="grid grid-cols-[250px_340px_1fr] max-md:grid-cols-1 overflow-hidden">
      <Col h="Dịch vụ mở rộng" cls="max-md:grid max-md:grid-cols-[repeat(3,minmax(0,1fr))] max-md:gap-2 max-md:p-3">{CATS.map(([l, k]) => <button key={k} type="button" onClick={() => setCat(k)} className={`w-full text-left px-3 py-3 rounded-lg max-md:rounded-xl max-md:border max-md:py-3 max-md:px-1 max-md:text-center max-md:text-[13px] max-md:leading-tight text-sm ${cat === k ? 'bg-brand/10 text-brand-dark font-semibold max-md:border-brand/40' : 'hover:bg-slate-50 max-md:bg-white'}`}>{l}</button>)}</Col>
      <Col h="Nhóm dịch vụ">{gl.map(g => <div key={g.id} role="button" tabIndex={0} onClick={() => setGid(g.id)} className={`px-3 py-2.5 mb-2 rounded-lg cursor-pointer ${cur?.id === g.id ? 'bg-brand/10 ring-1 ring-brand/30' : 'hover:bg-slate-50'}`}>
          <div className="font-semibold">{g.name}</div><div className="text-xs text-slate-500">{svcs.filter(s => s.g === g.id).length} dịch vụ · <button type="button" title="Bấm để bật/tắt" className="underline decoration-dotted" onClick={e => { e.stopPropagation(); setGroups(groups.map(x => x.id === g.id ? { ...x, on: !x.on } : x)); }}>{g.on ? 'Đang sử dụng' : 'Ngừng sử dụng'}</button></div></div>)}
        <Link onClick={() => setDr({ t: 'g', name: '' })}>Thêm nhóm</Link></Col>
      <Col h={`Dịch vụ${cur ? ' · ' + cur.name : ''}`}>{cur ? <>{list.map(s => <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 mb-2"><div><div className="font-semibold">{s.name}</div><div className="text-xs text-slate-500">{money(s.price)}đ / {s.unit || '—'}</div></div>
          <button type="button" title="Bấm để bật/tắt" onClick={() => setSvcs(svcs.map(x => x.id === s.id ? { ...x, on: !x.on } : x))} className={`text-xs px-2.5 py-0.5 rounded-full ${s.on ? 'bg-brand/10 text-brand-dark' : 'bg-slate-100 text-slate-500'}`}>{s.on ? 'Hoạt động' : 'Tạm dừng'}</button></div>)}
          <Link onClick={() => setDr({ t: 's', name: '', code: '', unit: '', price: '', edit: false, stock: false, bill: true })}>Thêm dịch vụ</Link></> : <p className="text-sm text-slate-400 px-3 py-4">Thêm nhóm để bắt đầu.</p>}</Col></Card>
    {dr?.t === 'g' && <Drawer title="Thêm nhóm dịch vụ" onClose={() => setDr(null)}><Lbl l="Tên nhóm" req><input autoFocus className="field" placeholder="VD: Giặt là khách sạn" value={dr.name} onChange={e => setDr({ ...dr, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && saveG()} /></Lbl>
      <p className="text-xs text-slate-500 my-3">Loại: <b className="text-ink">{cat}</b></p><div className="flex gap-3"><Btn kind="ghost" className="flex-1" onClick={() => setDr(null)}>Huỷ</Btn><Btn className="flex-1" onClick={saveG}>Lưu</Btn></div></Drawer>}
    {dr?.t === 's' && <Drawer title="Thêm dịch vụ" onClose={() => setDr(null)}><div className="space-y-3"><Lbl l="Tên dịch vụ" req><input autoFocus className="field" placeholder="VD: Giặt áo sơ mi" value={dr.name} onChange={e => setDr({ ...dr, name: e.target.value })} /></Lbl>
      <div className="grid grid-cols-2 gap-3"><Lbl l="Mã dịch vụ"><input className="field" placeholder="LDY-01" value={dr.code} onChange={e => setDr({ ...dr, code: e.target.value })} /></Lbl><Lbl l="Đơn vị"><input className="field" placeholder="VD: Cái, Kg, Giờ..." value={dr.unit} onChange={e => setDr({ ...dr, unit: e.target.value })} /></Lbl></div>
      <Lbl l="Đơn giá (VNĐ)" req><input inputMode="numeric" className="field" placeholder="50000" value={dr.price} onChange={e => setDr({ ...dr, price: e.target.value.replace(/\D/g, '') })} /></Lbl>
      {[['edit', 'Cho phép sửa giá khi đăng ký'], ['stock', 'Quản lý tồn kho'], ['bill', 'Tính phí (billable)']].map(([k, l]) => <label key={k} className="flex items-center gap-3"><input type="checkbox" checked={dr[k]} onChange={e => setDr({ ...dr, [k]: e.target.checked })} />{l}</label>)}
      <div className="flex gap-3 pt-1"><Btn kind="ghost" className="flex-1" onClick={() => setDr(null)}>Huỷ</Btn><Btn className="flex-1" onClick={saveS}>Lưu</Btn></div></div></Drawer>}</>;
}
