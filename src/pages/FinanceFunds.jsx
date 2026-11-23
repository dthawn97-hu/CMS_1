import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Download, ExternalLink, Plus, Search, X } from 'lucide-react';
import { addDays, money, useDB, ymd } from '../store.jsx';
import { useFin, uid } from '../finStore.js';
import { Btn, Card, Title, toast } from '../ui.jsx';

// ponytail: dữ liệu chỉ nằm trong bộ nhớ trình duyệt (PMS chưa có backend) — nối API khi có PMS
export const vnd = n => money(n) + 'đ', dmy = s => s.split('-').reverse().join('/');
export const PRESETS = [['today', 'Hôm nay'], ['yesterday', 'Hôm qua'], ['7d', '7 ngày qua'], ['month', 'Tháng này'], ['lastmonth', 'Tháng trước'], ['custom', 'Tùy chọn khoảng ngày']];
const calc = p => { const t = ymd(new Date()), d = new Date(); return { today: [t, t], yesterday: [addDays(t, -1), addDays(t, -1)], '7d': [addDays(t, -6), t], month: [t.slice(0, 8) + '01', t],
  lastmonth: [ymd(new Date(d.getFullYear(), d.getMonth() - 1, 1)), ymd(new Date(d.getFullYear(), d.getMonth(), 0))] }[p] ?? [t, t]; };

export const Underline = ({ items, value, onChange }) => <div className="flex gap-7 max-md:gap-0 border-b border-slate-200 mb-6">{items.map(([k, l]) => <button key={k} type="button" onClick={() => onChange(k)}
  className={`pb-3 -mb-px max-md:flex-1 max-md:px-1 max-md:text-[13px] max-md:leading-tight border-b-2 text-sm ${value === k ? 'border-brand text-brand-dark font-semibold' : 'border-transparent text-slate-500 hover:text-ink'}`}>{l}</button>)}</div>;
export const Lbl = ({ l, children, className = '' }) => <label className={`block ${className}`}><span className="block text-sm font-medium text-ink mb-1.5">{l}</span>{children}</label>;
export const Modal = ({ title, onClose, children }) => <div className="fixed inset-0 z-50 grid place-items-center max-md:place-items-end bg-black/50 anim-fade" onMouseDown={e => e.target === e.currentTarget && onClose()}>
  <div className="w-[500px] max-w-[92vw] max-md:!w-full max-md:!max-w-none max-md:rounded-b-none max-md:pb-8 max-md:max-h-[90vh] max-md:overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 anim-pop"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-ink">{title}</h3><button type="button" title="Đóng" onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button></div>{children}</div></div>;

// bộ lọc khoảng thời gian dùng chung: chọn nhanh + 2 ô ngày
export function useRange(init = 'today') {
  const [preset, setPreset] = useState(init), [[from, to], setR] = useState(init === 'custom' ? ['', ''] : calc(init));
  return { preset, from, to, pick: p => { setPreset(p); if (p !== 'custom') setR(calc(p)); }, setFrom: v => { setPreset('custom'); setR([v, !to || v > to ? v : to]); }, setTo: v => { setPreset('custom'); setR([from, v]); } };
}
export const RangeFields = ({ r }) => <><Lbl l="Khoảng thời gian" className="w-52 max-md:!w-full shrink-0"><select className="field" value={r.preset} onChange={e => r.pick(e.target.value)}>{PRESETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Lbl>
  <Lbl l="Khoảng ngày" className="w-[320px] max-md:!w-full shrink-0"><div className="flex items-center gap-2"><input type="date" className="field min-w-0 flex-1" value={r.from} onChange={e => e.target.value && r.setFrom(e.target.value)} /><span className="text-slate-400">→</span><input type="date" className="field min-w-0 flex-1" value={r.to} min={r.from || undefined} onChange={e => e.target.value && r.setTo(e.target.value)} /></div></Lbl></>;

export function Table({ cols, rows, empty, right = [], onRow, tIdx = 1, sIdx = 0 }) {
  const [size, setSize] = useState(20), [pg, setPg] = useState(0), pages = Math.max(1, Math.ceil(rows.length / size)), p = Math.min(pg, pages - 1), a = p * size, view = rows.slice(a, a + size);
  const act = c => /Thao tác|Chọn/.test(c) || c === '', body = i => cols.map((c, j) => [c, j]).filter(([c, j]) => j !== tIdx && j !== sIdx && !act(c) && view[i][j] !== '' && view[i][j] != null);
  return <><div className="md:hidden space-y-3">{view.map((r, i) => <div key={i} onClick={onRow ? () => onRow(a + i) : undefined} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${onRow ? 'cursor-pointer active:bg-slate-50' : ''}`}>
    <div className="flex items-start justify-between gap-3"><b className="text-ink break-words min-w-0">{r[tIdx]}</b><span className="text-sm text-slate-500 shrink-0">{r[sIdx]}</span></div>
    <div className="mt-3 rounded-xl bg-slate-50 p-3 space-y-2 text-sm">{body(i).map(([c, j]) => <div key={j} className="flex items-start justify-between gap-3"><span className="text-xs text-slate-400 uppercase shrink-0 pt-0.5">{c}</span><span className="text-right break-words min-w-0">{r[j]}</span></div>)}</div>
    {!onRow && cols.some(act) && <div className="mt-2 flex justify-end">{r.filter((_, j) => act(cols[j]))}</div>}</div>)}
    {!rows.length && <p className="text-center text-slate-400 py-10">{empty}</p>}</div>
  <Card className="overflow-hidden max-md:hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-slate-50/60">{cols.map((c, i) => <th key={c} className={`px-5 py-3.5 text-xs font-semibold tracking-wide text-slate-500 uppercase ${right.includes(i) ? 'text-right' : 'text-left'}`}>{c}</th>)}</tr></thead>
    <tbody>{view.map((r, i) => <tr key={i} className="border-b last:border-0 hover:bg-slate-50/70">{r.map((c, j) => <td key={j} className={`px-5 py-4 ${right.includes(j) ? 'text-right' : ''}`}>{c}</td>)}</tr>)}
      {!rows.length && <tr><td colSpan={cols.length} className="text-center text-slate-400 py-14">{empty}</td></tr>}</tbody></table></div>
    <div className="flex items-center justify-end gap-5 px-5 py-3.5 border-t text-sm text-slate-500"><span>Số dòng mỗi trang</span><select className="field !w-20 !py-1.5" value={size} onChange={e => { setSize(+e.target.value); setPg(0); }}>{[20, 50, 100].map(n => <option key={n}>{n}</option>)}</select>
      <span>{rows.length ? `${a + 1}–${a + view.length}` : '0–0'} trên {rows.length}</span><button type="button" title="Trang trước" disabled={p === 0} onClick={() => setPg(p - 1)} className="disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
      <span className="text-ink">Trang {p + 1}</span><button type="button" title="Trang sau" disabled={p >= pages - 1} onClick={() => setPg(p + 1)} className="disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button></div></Card>
  <div className="md:hidden flex items-center justify-between gap-3 mt-3 text-sm text-slate-500"><span>{rows.length ? `${a + 1}–${a + view.length}` : '0–0'} trên {rows.length}</span><span className="flex items-center gap-4"><button type="button" title="Trang trước" disabled={p === 0} onClick={() => setPg(p - 1)} className="w-9 h-9 grid place-items-center rounded-lg border bg-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button><span className="text-ink">Trang {p + 1}/{pages}</span><button type="button" title="Trang sau" disabled={p >= pages - 1} onClick={() => setPg(p + 1)} className="w-9 h-9 grid place-items-center rounded-lg border bg-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button></span></div></>;
}
export const Filters = ({ children }) => <Card className="p-6 max-md:p-4 mb-6"><div className="flex items-end gap-4 max-md:gap-3 flex-wrap [&>button]:shrink-0 max-md:[&>button]:w-full max-md:[&>div.flex-1:empty]:hidden">{children}</div></Card>;
const Dark = p => <Btn {...p} />;

/* ---------- Lập phiếu thu chi (dùng chung quỹ tiền mặt / tiền gửi) ---------- */
function Vouchers({ fund }) {
  const [fin, set] = useFin(), { db } = useDB(), bank = fund === 'bank', r = useRange(), [type, setType] = useState('all'), [q, setQ] = useState(''), [ap, setAp] = useState({ from: r.from, to: r.to, type: 'all', q: '' }), [dlg, setDlg] = useState(null), [view, setView] = useState(null);
  const rows = fin.vouchers.filter(v => v.fund === fund && v.date >= ap.from && v.date <= ap.to && (ap.type === 'all' || v.type === ap.type) && (v.no + v.reason + v.who).toLowerCase().includes(ap.q.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no));
  const bankName = no => fin.banks.find(b => b.no === no)?.bank ?? '';
  const open = () => setDlg({ type: 'thu', date: ymd(new Date()), who: '', bank: fin.banks[0]?.no ?? '', group: '', amount: '', reason: '' });
  const save = () => { if (!+dlg.amount) return toast('Nhập số tiền', true); if (!dlg.reason.trim()) return toast('Nhập lý do', true); if (bank && !dlg.bank) return toast('Chọn tài khoản ngân hàng (hãy thêm ở Cấu hình Thu/Chi)', true);
    const pre = (dlg.type === 'thu' ? 'PT' : 'PC') + '-' + dlg.date.slice(5, 7) + dlg.date.slice(8), n = fin.vouchers.filter(v => v.no.startsWith(pre)).length + 1;
    set(s => ({ ...s, vouchers: [...s.vouchers, { ...dlg, id: uid(), fund, no: `${pre}-${String(n).padStart(4, '0')}`, amount: +dlg.amount, recon: false, by: db.account.ho_va_ten }] })); setDlg(null); toast('Đã lập phiếu'); };
  const groups = dlg ? fin.cfg[dlg.type].filter(g => g.on) : [];
  return <><Title keep t="Lập phiếu thu chi" sub={`Lập và xem phiếu thu, phiếu chi ${bank ? 'qua tài khoản ngân hàng' : 'tiền mặt'}. Phiếu đã lưu không sửa hoặc xóa.`} />
    <Filters><RangeFields r={r} />
      <div className="w-36 max-md:!w-full shrink-0"><Lbl l="Loại phiếu"><select className="field" value={type} onChange={e => setType(e.target.value)}><option value="all">Tất cả</option><option value="thu">Phiếu thu</option><option value="chi">Phiếu chi</option></select></Lbl></div>
      <div className="flex-1 min-w-[150px] max-md:!block max-md:basis-full"><Lbl l="Tìm kiếm"><input className="field" placeholder="Số phiếu, lý do, đối tượng..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && setAp({ from: r.from, to: r.to, type, q })} /></Lbl></div>
      <Dark onClick={() => setAp({ from: r.from, to: r.to, type, q })}><Search className="w-4 h-4 mr-2 inline" />Lấy dữ liệu</Dark><Btn kind="ghost" className="!border-brand !text-brand-dark" onClick={open}><Plus className="w-4 h-4 mr-1 inline" />Lập phiếu</Btn></Filters>
    <h3 className="font-semibold text-ink mb-3">Danh sách phiếu thu chi</h3>
    <Table onRow={i => setView(rows[i])} empty="Không có phiếu nào" right={bank ? [3] : [4]} cols={bank ? ['Ngày', 'Số chứng từ', 'Tài khoản', 'Số tiền', 'Lý do', 'Thao tác'] : ['Ngày', 'Số phiếu', 'Loại', 'Đối tượng', 'Số tiền', 'Lý do', 'Trạng thái', 'Thao tác']}
      rows={rows.map(v => { const amt = <b className={v.type === 'thu' ? 'text-emerald-700' : 'text-red-700'}>{v.type === 'thu' ? '+' : '−'}{vnd(v.amount)}</b>, act = <button type="button" className="text-brand-dark font-medium" onClick={() => setView(v)}>Xem</button>;
        return bank ? [dmy(v.date), v.no, bankName(v.bank) || '—', amt, v.reason, act] : [dmy(v.date), v.no, v.type === 'thu' ? 'Thu' : 'Chi', v.who || '—', amt, v.reason, <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">Đã lưu</span>, act]; })} />
    {dlg && <Modal title="Lập phiếu thu chi" onClose={() => setDlg(null)}><div className="space-y-4 [&_button.btn-row]:flex-1">
      <div className="inline-flex bg-slate-100 rounded-lg p-0.5">{[['thu', 'Phiếu thu'], ['chi', 'Phiếu chi']].map(([k, l]) => <button key={k} type="button" onClick={() => setDlg({ ...dlg, type: k, group: '' })} className={`px-4 py-1.5 rounded-md text-sm font-semibold ${dlg.type === k ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`}>{l}</button>)}</div>
      <div className="grid grid-cols-2 gap-3"><Lbl l="Ngày"><input type="date" className="field" value={dlg.date} onChange={e => setDlg({ ...dlg, date: e.target.value })} /></Lbl>
        <Lbl l="Số tiền (VNĐ)"><input autoFocus inputMode="numeric" className="field" value={dlg.amount ? money(+dlg.amount) : ''} onChange={e => setDlg({ ...dlg, amount: e.target.value.replace(/\D/g, '') })} /></Lbl></div>
      {bank ? <Lbl l="Tài khoản ngân hàng"><select className="field" value={dlg.bank} onChange={e => setDlg({ ...dlg, bank: e.target.value })}><option value="">Chọn tài khoản</option>{fin.banks.map(b => <option key={b.no} value={b.no}>{b.no} - {b.bank}</option>)}</select></Lbl>
        : <Lbl l="Đối tượng"><input className="field" placeholder="Người nộp / người nhận" value={dlg.who} onChange={e => setDlg({ ...dlg, who: e.target.value })} /></Lbl>}
      <Lbl l={`Nhóm ${dlg.type === 'thu' ? 'thu' : 'chi'} (không bắt buộc)`}><select className="field" value={dlg.group} onChange={e => setDlg({ ...dlg, group: e.target.value })}><option value="">— Không chọn —</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Lbl>
      <Lbl l="Lý do"><textarea rows={2} className="field" value={dlg.reason} onChange={e => setDlg({ ...dlg, reason: e.target.value })} /></Lbl>
      <div className="flex justify-end gap-2"><Btn kind="ghost" onClick={() => setDlg(null)}>Bỏ qua</Btn><Btn onClick={save}>Lưu phiếu</Btn></div></div></Modal>}
    {view && <Modal title={`Phiếu ${view.no}`} onClose={() => setView(null)}><dl className="grid grid-cols-[130px_1fr] gap-y-2.5 text-sm">{[['Loại', view.type === 'thu' ? 'Phiếu thu' : 'Phiếu chi'], ['Ngày', dmy(view.date)], ['Số tiền', vnd(view.amount)], [bank ? 'Tài khoản' : 'Đối tượng', bank ? bankName(view.bank) || 'Chưa gán' : view.who || '—'], ['Lý do', view.reason], ['Người tạo', view.by || '—']].map(([k, v]) => [<dt key={k} className="text-slate-500">{k}</dt>, <dd key={k + 'v'} className="font-medium">{v}</dd>])}</dl>
      <p className="text-xs text-slate-400 mt-4">Phiếu đã lưu không sửa hoặc xóa.</p></Modal>}</>;
}

/* ---------- Sổ chi tiết (dùng chung) ---------- */
function Ledger({ fund }) {
  const [fin] = useFin(), { db } = useDB(), bank = fund === 'bank', r = useRange(), [ap, setAp] = useState({ from: r.from, to: r.to });
  const all = fin.vouchers.filter(v => v.fund === fund), net = list => list.reduce((a, v) => a + (v.type === 'thu' ? v.amount : -v.amount), 0);
  const rows = all.filter(v => v.date >= ap.from && v.date <= ap.to).sort((a, b) => a.date.localeCompare(b.date) || a.no.localeCompare(b.no)), open = fin.base[fund] + net(all.filter(v => v.date < ap.from));
  const thu = rows.filter(v => v.type === 'thu').reduce((a, v) => a + v.amount, 0), chi = rows.filter(v => v.type === 'chi').reduce((a, v) => a + v.amount, 0), gname = v => fin.cfg[v.type].find(g => g.id === v.group)?.name ?? '—';
  const exp = () => { if (!rows.length) return toast('Không có dữ liệu để xuất', true); const head = ['STT', 'Ngày', 'Số phiếu thu', 'Số phiếu chi', 'Số tiền thu', 'Số tiền chi', 'Nội dung', 'Người tạo'];
    const csv = [head, ...rows.map((v, i) => [i + 1, dmy(v.date), v.type === 'thu' ? v.no : '', v.type === 'chi' ? v.no : '', v.type === 'thu' ? v.amount : '', v.type === 'chi' ? v.amount : '', v.who || v.reason, v.by || ''])].map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = `so-chi-tiet-tien-${bank ? 'gui' : 'mat'}.csv`; a.click(); URL.revokeObjectURL(a.href); };
  const sum = [['I. Số dư đầu kỳ', open], ['II. Tổng thu', thu], ['III. Tổng chi', chi], ['IV. Số dư cuối kỳ', open + thu - chi]];
  return <><Title keep t={`Sổ chi tiết tiền ${bank ? 'gửi' : 'mặt'}`} sub={`Xem sổ ${bank ? 'thu chi theo từng tài khoản ngân hàng' : 'chi tiết tiền mặt theo khoảng ngày'}, số dư đầu kỳ, cuối kỳ và xuất file Excel.`} />
    <Filters><RangeFields r={r} /><div className="flex-1" /><Dark onClick={() => setAp({ from: r.from, to: r.to })}><Search className="w-4 h-4 mr-2 inline" />Lấy dữ liệu</Dark><Btn kind="ghost" className="!border-brand !text-brand-dark" onClick={exp}><Download className="w-4 h-4 mr-2 inline" />Xuất Excel</Btn></Filters>
    <h3 className="font-semibold text-ink mb-3">{bank ? 'Danh sách giao dịch' : 'Sổ thu chi tiền mặt'}</h3>
    <Table empty="Không có giao dịch nào" right={bank ? [4] : [5, 6]} cols={bank ? ['STT', 'Ngày', 'Số phiếu thu', 'Số phiếu chi', 'Thu chi', 'Mục thu', 'Mục chi', 'Người tạo'] : ['STT', 'Ngày', 'Số phiếu thu', 'Số phiếu chi', 'Đối tượng / Nội dung', 'Số tiền thu', 'Số tiền chi', 'Người tạo']}
      rows={rows.map((v, i) => { const by = v.by || '—', t = v.type === 'thu';
        return bank ? [i + 1, dmy(v.date), t ? v.no : '', t ? '' : v.no, <b className={t ? 'text-emerald-700' : 'text-red-700'}>{t ? '+' : '−'}{vnd(v.amount)}</b>, t ? gname(v) : '', t ? '' : gname(v), by]
          : [i + 1, dmy(v.date), t ? v.no : '', t ? '' : v.no, v.who || v.reason, t ? vnd(v.amount) : '', t ? '' : vnd(v.amount), by]; })} />
    <Card className="p-6 mt-6"><h3 className="font-semibold text-ink mb-3">Tổng hợp sổ chi tiết</h3><dl className="grid grid-cols-[260px_200px] max-md:grid-cols-[1fr_auto] gap-y-2.5 text-sm">{sum.map(([k, v]) => [<dt key={k}>{k}</dt>, <dd key={k + 'v'} className="font-medium text-right">{vnd(v)}</dd>])}</dl></Card></>;
}

/* ---------- Kiểm kê (tiền mặt) ---------- */
function Count() {
  const [fin, set] = useFin(), { db } = useDB(), [dlg, setDlg] = useState(null), cash = fin.vouchers.filter(v => v.fund === 'cash').reduce((a, v) => a + (v.type === 'thu' ? v.amount : -v.amount), fin.base.cash), diff = dlg ? (+dlg.real || 0) - cash : 0;
  const save = () => { if (dlg.real === '') return toast('Nhập số tiền đếm thực tế', true); set(s => ({ ...s, counts: [{ id: uid(), date: ymd(new Date()), book: cash, real: +dlg.real, note: dlg.note, by: db.account.ho_va_ten }, ...s.counts] })); setDlg(null); toast('Đã lưu kiểm kê'); };
  return <><Title keep t="Kiểm kê" sub="Kiểm kê quỹ tiền mặt: đếm tiền thực tế và đối chiếu với số dư trên sổ." />
    <Card className="p-6 max-md:p-4 flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-4"><span>Mở màn kiểm kê để đếm tiền thực tế và đối chiếu với số dư trên sổ.</span><Btn onClick={() => setDlg({ real: '', note: '' })}>Mở kiểm kê quỹ tiền mặt <ExternalLink className="w-4 h-4 ml-2 inline" /></Btn></Card>
    {fin.counts.length > 0 && <><h3 className="font-semibold text-ink mt-6 mb-3">Lịch sử kiểm kê</h3><Table empty="" right={[1, 2, 3]} cols={['Ngày', 'Số dư trên sổ', 'Tiền thực tế', 'Chênh lệch', 'Ghi chú', 'Người kiểm']}
      rows={fin.counts.map(c => [dmy(c.date), vnd(c.book), vnd(c.real), <b className={c.real === c.book ? 'text-slate-600' : c.real > c.book ? 'text-emerald-700' : 'text-red-700'}>{c.real - c.book > 0 ? '+' : ''}{vnd(c.real - c.book)}</b>, c.note || '—', c.by])} /></>}
    {dlg && <Modal title="Kiểm kê quỹ tiền mặt" onClose={() => setDlg(null)}><div className="space-y-4"><div className="flex justify-between text-sm rounded-lg bg-slate-50 border px-4 py-3"><span className="text-slate-500">Số dư trên sổ</span><b>{vnd(cash)}</b></div>
      <Lbl l="Tiền đếm thực tế (VNĐ)"><input autoFocus inputMode="numeric" className="field" value={dlg.real ? money(+dlg.real) : ''} onChange={e => setDlg({ ...dlg, real: e.target.value.replace(/\D/g, '') })} /></Lbl>
      <div className="flex justify-between text-sm px-1"><span className="text-slate-500">Chênh lệch</span><b className={diff === 0 ? '' : diff > 0 ? 'text-emerald-700' : 'text-red-700'}>{diff > 0 ? '+' : ''}{vnd(diff)}</b></div>
      <Lbl l="Ghi chú"><textarea rows={2} className="field" value={dlg.note} onChange={e => setDlg({ ...dlg, note: e.target.value })} /></Lbl>
      <div className="flex justify-end gap-2"><Btn kind="ghost" onClick={() => setDlg(null)}>Bỏ qua</Btn><Btn onClick={save}>Lưu kiểm kê</Btn></div></div></Modal>}</>;
}

/* ---------- Đối chiếu (tiền gửi) ---------- */
function Recon() {
  const [fin, set] = useFin(), [acc, setAcc] = useState(''), [st, setSt] = useState('no'), [q, setQ] = useState(''), [ap, setAp] = useState({ acc: '', st: 'no', q: '' }), [sel, setSel] = useState([]);
  const rows = fin.vouchers.filter(v => v.fund === 'bank' && (!ap.acc || v.bank === ap.acc) && (ap.st === 'all' || (ap.st === 'no') === !v.recon) && (v.no + v.reason).toLowerCase().includes(ap.q.toLowerCase())).sort((a, b) => a.date.localeCompare(b.date));
  const patch = (id, p) => set(s => ({ ...s, vouchers: s.vouchers.map(v => v.id === id ? { ...v, ...p } : v) }));
  const run = () => { set(s => ({ ...s, vouchers: s.vouchers.map(v => sel.includes(v.id) ? { ...v, recon: true } : v) })); toast(`Đã đối chiếu ${sel.length} giao dịch`); setSel([]); };
  return <><Title keep t="Đối chiếu" sub="Đối chiếu phiếu với sao kê ngân hàng: gán tài khoản, xác nhận từng dòng và so số dư với sổ ngân hàng." />
    <Filters><div className="w-60 max-md:!w-full shrink-0"><Lbl l="Tài khoản ngân hàng"><select className="field" value={acc} onChange={e => setAcc(e.target.value)}><option value="">Tất cả tài khoản</option>{fin.banks.map(b => <option key={b.no} value={b.no}>{b.bank} - {b.no}</option>)}</select></Lbl></div>
      <div className="w-48 max-md:!w-full shrink-0"><Lbl l="Trạng thái"><select className="field" value={st} onChange={e => setSt(e.target.value)}><option value="no">Chưa đối chiếu</option><option value="yes">Đã đối chiếu</option><option value="all">Tất cả</option></select></Lbl></div>
      <div className="flex-1 min-w-[150px] max-md:!block max-md:basis-full"><Lbl l="Tìm kiếm"><input className="field" value={q} onChange={e => setQ(e.target.value)} /></Lbl></div><div className="flex-1" />
      <Dark onClick={() => { setAp({ acc, st, q }); setSel([]); }}><Search className="w-4 h-4 mr-2 inline" />Lấy dữ liệu</Dark><Btn disabled={!sel.length} onClick={run}>Thực hiện ({sel.length})</Btn></Filters>
    <h3 className="font-semibold text-ink mb-3">Danh sách giao dịch cần đối chiếu</h3>
    <Table empty="Không có giao dịch nào" right={[5, 6]} cols={['STT', 'Số phiếu', 'Ngày', 'Tài khoản', 'Lý do', 'Số tiền', 'Số tiền quy đổi', 'Chọn']}
      rows={rows.map((v, i) => [i + 1, v.no, dmy(v.date), v.bank ? fin.banks.find(b => b.no === v.bank)?.bank ?? v.bank : <select className="field !w-44 !py-1.5 !text-xs" value="" onChange={e => patch(v.id, { bank: e.target.value })}><option value="">-- Gán tài khoản --</option>{fin.banks.map(b => <option key={b.no} value={b.no}>{b.bank} - {b.no}</option>)}</select>,
        <span className="truncate block max-w-[300px]" title={v.reason}>{v.reason}</span>, <b>{vnd(v.amount)}</b>, vnd(v.amount),
        v.recon ? <span className="text-xs text-slate-400">Đã đối chiếu</span> : <button type="button" title={v.bank ? 'Chọn để đối chiếu' : 'Gán tài khoản trước'} disabled={!v.bank} onClick={() => setSel(sel.includes(v.id) ? sel.filter(x => x !== v.id) : [...sel, v.id])}
          className={`w-9 h-9 grid place-items-center rounded-lg border disabled:opacity-30 ${sel.includes(v.id) ? 'bg-ink border-ink text-white' : 'border-slate-300 text-ink'}`}><Check className="w-4 h-4" /></button>])} /></>;
}

const wrap = (tabs, pages) => () => { const [tab, setTab] = useState(tabs[0][0]), P = pages[tab]; return <><Underline items={tabs} value={tab} onChange={setTab} /><P /></>; };
export const CashFund = wrap([['v', 'Lập phiếu thu chi'], ['c', 'Kiểm kê'], ['l', 'Sổ chi tiết tiền mặt']], { v: () => <Vouchers fund="cash" />, c: Count, l: () => <Ledger fund="cash" /> });
export const BankFund = wrap([['v', 'Lập phiếu thu chi'], ['r', 'Đối chiếu'], ['l', 'Sổ chi tiết tiền gửi']], { v: () => <Vouchers fund="bank" />, r: Recon, l: () => <Ledger fund="bank" /> });
