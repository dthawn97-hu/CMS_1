import { useState } from 'react';
import { ChevronDown, ChevronRight, History, Plus, Printer, Search, ShoppingCart, Trash2, Wallet, X } from 'lucide-react';
import { money, ymd } from '../store.jsx';
import { debtOf, seqNo, stockOf, total, nextNo, uid, useStock } from '../stockStore.js';
import { Btn, Card, SheetTabs, Title, ask, toast } from '../ui.jsx';
import { Filters, Lbl, Modal, RangeFields, Table, Underline, dmy, useRange, vnd } from './FinanceFunds.jsx';

// ponytail: dữ liệu mua hàng nằm trong bộ nhớ trình duyệt (PMS chưa có backend) — nối API khi có PMS
const inR = (d, a) => (!a.from || d >= a.from) && (!a.to || d <= a.to), amber = 'font-bold text-amber-800', rnd = () => String(Math.floor(1000 + Math.random() * 9000));
const BADGE = { 'Chưa tạo đặt hàng': 'bg-slate-100 text-slate-600', 'Đã tạo đặt hàng': 'bg-brand/10 text-brand-dark', 'Chờ thực hiện': 'bg-slate-100 text-slate-600', 'Đã thực hiện': 'bg-brand/10 text-brand-dark', 'Đã huỷ': 'bg-red-50 text-red-600' };
const Pill = ({ s }) => <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${BADGE[s]}`}>{s}</span>;
const Acts = ({ onDel, children }) => <div className="flex justify-end items-center gap-3 text-slate-500 max-md:[&_button]:min-h-10 max-md:[&_button]:min-w-10 max-md:[&_button]:inline-flex max-md:[&_button]:items-center max-md:[&_button]:justify-center">{children}<button type="button" title="In phiếu" className="hover:text-ink" onClick={() => window.print()}><Printer className="w-4 h-4" /></button>{onDel && <button type="button" title="Xoá" className="hover:text-red-500" onClick={onDel}><Trash2 className="w-4 h-4" /></button>}</div>;
const confirmDel = (what, run) => async () => { if (await ask(`Xoá ${what}? Thao tác không thể hoàn tác.`, { title: `Xoá ${what}?`, ok: 'Xoá', danger: true })) run(); };

// bộ lọc dùng chung: khoảng thời gian + (tuỳ chọn) một ô chọn + nút
function Bar({ r, onGet, onAdd, addLabel, extra, children }) {
  return <Filters><RangeFields r={r} />{children}<div className="flex-1" /><Btn onClick={onGet}><Search className="w-4 h-4 mr-2 inline" />Lấy dữ liệu</Btn><Btn kind="ghost" className="!border-brand !text-brand-dark" onClick={onAdd}><Plus className="w-4 h-4 mr-1 inline" />{addLabel}</Btn></Filters>;
}
const Sel = ({ l, v, set, opts, cls = 'w-44' }) => <Lbl l={l} className={`${cls} shrink-0 max-md:!w-full`}><select className="field" value={v} onChange={e => set(e.target.value)}>{opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o || 'Tất cả'}</option>)}</select></Lbl>;

// bảng dòng hàng: price=true thì có cột đơn giá
function Lines({ lines, set, mats, price }) {
  const up = (i, p) => set(lines.map((l, j) => j === i ? { ...l, ...p } : l));
  return <div><div className="text-sm font-medium text-ink mb-1.5">Dòng hàng</div><div className="space-y-2">{lines.map((l, i) => <div key={i} className={`grid gap-2 ${price ? 'grid-cols-[1fr_80px_110px_28px] max-md:grid-cols-[1fr_1fr_36px]' : 'grid-cols-[1fr_90px_28px] max-md:grid-cols-[1fr_36px]'}`}>
      <select className={`field !py-2 ${price ? 'max-md:col-span-3' : 'max-md:col-span-2'}`} value={l.m} onChange={e => up(i, { m: e.target.value })}>{mats.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}</select>
      <input inputMode="decimal" className="field !py-2" placeholder="SL" value={l.q} onChange={e => up(i, { q: e.target.value.replace(/[^\d.]/g, '') })} />
      {price && <input inputMode="numeric" className="field !py-2" placeholder="Đơn giá" value={l.p ? money(+l.p) : ''} onChange={e => up(i, { p: e.target.value.replace(/\D/g, '') })} />}
      <button type="button" title="Xoá dòng" disabled={lines.length < 2} className="text-slate-400 disabled:opacity-30 max-md:h-11 max-md:grid max-md:place-items-center" onClick={() => set(lines.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button></div>)}</div>
    <button type="button" className="mt-2 text-sm font-medium text-brand-dark" onClick={() => set([...lines, { m: mats[0]?.id ?? '', q: '', p: '' }])}>+ Thêm dòng</button>
    {price && <div className="flex justify-between text-sm pt-3 mt-3 border-t"><span className="text-slate-500">Tổng tiền</span><b>{vnd(lines.reduce((a, l) => a + (+l.q || 0) * (+l.p || 0), 0))}</b></div>}</div>;
}
const clean = lines => lines.filter(l => l.m && +l.q > 0).map(l => ({ m: l.m, q: +l.q, p: +l.p || 0 }));
const blankLine = s => ({ m: s.mats[0]?.id ?? '', q: '', p: '' });
const Foot = ({ onClose, onSave, ok = 'Lưu' }) => <div className="flex justify-end gap-2 mt-5 max-md:[&>button]:flex-1"><Btn kind="ghost" onClick={onClose}>Bỏ qua</Btn><Btn onClick={onSave}>{ok}</Btn></div>;
const Head = ({ no, children }) => <><td className="font-bold text-amber-800">{no}</td>{children}</>;

/* ---------- Báo hàng ---------- */
function PoForm({ init, onClose }) {
  const [s, set] = useStock(), [d, setD] = useState(init);
  const save = () => { const lines = clean(d.lines); if (!d.sup) return toast('Chọn nhà cung cấp', true); if (!lines.length) return toast('Thêm ít nhất một dòng hàng có số lượng', true);
    set(st => ({ ...st, pos: [...st.pos, { id: uid(), no: `PO-${d.date.replace(/-/g, '')}-${rnd()}`, date: d.date, sup: d.sup, wh: d.wh, eta: d.eta, note: d.note, st: 'Chờ thực hiện', lines }], reports: st.reports.map(x => x.id === d.rep ? { ...x, st: 'Đã tạo đặt hàng' } : x) })); onClose(); toast('Đã tạo đơn đặt hàng'); };
  return <Modal title="Thêm đơn đặt hàng" onClose={onClose}><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><Sel cls="w-full" l="Nhà cung cấp" v={d.sup} set={v => setD({ ...d, sup: v })} opts={s.sups.map(x => [x.id, x.name])} /><Sel cls="w-full" l="Kho nhận" v={d.wh} set={v => setD({ ...d, wh: v })} opts={s.whs.map(x => [x.id, x.name])} />
    <Lbl l="Ngày đặt"><input type="date" className="field" value={d.date} onChange={e => setD({ ...d, date: e.target.value })} /></Lbl><Lbl l="Ngày dự kiến nhận"><input type="date" className="field" value={d.eta} onChange={e => setD({ ...d, eta: e.target.value })} /></Lbl></div>
    <Lbl l="Ghi chú"><input className="field" value={d.note} onChange={e => setD({ ...d, note: e.target.value })} /></Lbl><Lines price lines={d.lines} set={lines => setD({ ...d, lines })} mats={s.mats} /></div><Foot onClose={onClose} onSave={save} /></Modal>;
}
const newPo = (s, o = {}) => ({ sup: s.sups[0]?.id ?? '', wh: s.whs[0]?.id ?? '', date: ymd(new Date()), eta: '', note: '', lines: [blankLine(s)], ...o });

function Reports() {
  const [s, set] = useStock(), r = useRange('custom'), [st, setSt] = useState(''), [ap, setAp] = useState({ from: '', to: '', st: '' }), [dlg, setDlg] = useState(null), [po, setPo] = useState(null);
  const rows = s.reports.filter(x => inR(x.date, ap) && (!ap.st || x.st === ap.st)).sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no));
  const save = () => { const lines = dlg.lines.filter(l => l.m && +l.q > 0).map(l => ({ m: l.m, q: +l.q })); if (!lines.length) return toast('Thêm ít nhất một dòng hàng có số lượng', true);
    const note = dlg.note.trim() || lines.map(l => `${l.q} ${s.mats.find(m => m.id === l.m)?.name.toLowerCase()}`).join(', ');
    set(st => ({ ...st, reports: [...st.reports, { id: uid(), no: seqNo(st.reports, 'BH'), date: ymd(new Date()), note, st: 'Chưa tạo đặt hàng', lines }] })); setDlg(null); toast('Đã thêm phiếu báo hàng'); };
  return <><Title keep t="Báo hàng" sub="Quản lý phiếu báo hàng trước khi tạo đơn đặt hàng" />
    <Bar r={r} onGet={() => setAp({ from: r.from, to: r.to, st })} onAdd={() => setDlg({ note: '', lines: [blankLine(s)] })} addLabel="Thêm phiếu báo hàng"><Sel l="Trạng thái" v={st} set={setSt} opts={['', 'Chưa tạo đặt hàng', 'Đã tạo đặt hàng']} /></Bar>
    <h3 className="font-semibold text-ink mb-3">Danh sách phiếu báo hàng</h3>
    <Table cols={['Ngày', 'Số phiếu', 'Trạng thái', 'Diễn giải', 'Thao tác']} right={[4]} empty="Không có phiếu báo hàng nào" rows={rows.map(x => [dmy(x.date), <span className={amber}>{x.no}</span>, <Pill s={x.st} />, x.note || '—',
      <Acts onDel={confirmDel(`phiếu ${x.no}`, () => set(st => ({ ...st, reports: st.reports.filter(y => y.id !== x.id) })))}>{x.st === 'Chưa tạo đặt hàng' && <button type="button" className="h-8 px-3 rounded-lg border border-brand text-brand-dark text-xs font-semibold inline-flex items-center gap-1.5" onClick={() => setPo(newPo(s, { rep: x.id, note: x.note, lines: x.lines.map(l => ({ m: l.m, q: String(l.q), p: '' })) }))}><ShoppingCart className="w-3.5 h-3.5" />Tạo đơn đặt hàng</button>}</Acts>])} />
    {dlg && <Modal title="Thêm phiếu báo hàng" onClose={() => setDlg(null)}><div className="space-y-4"><Lbl l="Diễn giải"><input className="field" placeholder="VD: Cần 50 khăn tắm" value={dlg.note} onChange={e => setDlg({ ...dlg, note: e.target.value })} /></Lbl><Lines lines={dlg.lines} set={lines => setDlg({ ...dlg, lines })} mats={s.mats} /></div><Foot onClose={() => setDlg(null)} onSave={save} /></Modal>}
    {po && <PoForm init={po} onClose={() => setPo(null)} />}</>;
}

/* ---------- Đặt hàng ---------- */
function Orders() {
  const [s, set] = useStock(), r = useRange('custom'), [st, setSt] = useState(''), [ap, setAp] = useState({ from: '', to: '', st: '' }), [dlg, setDlg] = useState(null), nm = (l, id) => l.find(x => x.id === id)?.name ?? '—';
  const rows = s.pos.filter(x => inR(x.date, ap) && (!ap.st || x.st === ap.st)).sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no));
  const receive = p => set(stt => ({ ...stt, pos: stt.pos.map(x => x.id === p.id ? { ...x, st: 'Đã thực hiện' } : x), docs: [...stt.docs, { id: uid(), kind: 'in', no: nextNo(stt, 'in'), date: ymd(new Date()), wh: p.wh, sup: p.sup, note: '', po: p.no, inv: '', lines: p.lines }] }));
  return <><Title keep t="Đặt hàng" sub="Quản lý đơn đặt hàng gửi nhà cung cấp" />
    <Bar r={r} onGet={() => setAp({ from: r.from, to: r.to, st })} onAdd={() => setDlg(newPo(s))} addLabel="Thêm đơn đặt hàng"><Sel l="Trạng thái" v={st} set={setSt} opts={['', 'Chờ thực hiện', 'Đã thực hiện', 'Đã huỷ']} /></Bar>
    <h3 className="font-semibold text-ink mb-3">Danh sách đơn đặt hàng</h3>
    <Table cols={['Ngày', 'Số đơn', 'Nhà cung cấp', 'Kho nhận', 'Ngày dự kiến nhận', 'Tổng tiền', 'Trạng thái', 'Thao tác']} right={[5, 7]} empty="Không có đơn đặt hàng nào"
      rows={rows.map(p => [dmy(p.date), <span className={amber}>{p.no}</span>, nm(s.sups, p.sup), nm(s.whs, p.wh), p.eta ? dmy(p.eta) : '-', <b>{vnd(total(p))}</b>, <Pill s={p.st} />,
        <div className="flex justify-end gap-2">{p.st === 'Chờ thực hiện' && <><button type="button" className="h-8 max-md:h-10 px-3 rounded-lg border border-brand text-brand-dark text-xs font-semibold" onClick={async () => { if (await ask(`Nhận hàng cho đơn ${p.no}? Hệ thống sẽ tạo phiếu nhập kho.`, { title: 'Nhập hàng', ok: 'Nhập hàng' })) { receive(p); toast('Đã tạo phiếu nhập hàng'); } }}>Nhập hàng</button>
          <button type="button" className="h-8 max-md:h-10 px-3 rounded-lg border text-xs font-semibold text-slate-600" onClick={() => { set(st => ({ ...st, pos: st.pos.map(x => x.id === p.id ? { ...x, st: 'Đã huỷ' } : x) })); toast('Đã huỷ đơn'); }}>Huỷ</button></>}</div>])} />
    {dlg && <PoForm init={dlg} onClose={() => setDlg(null)} />}</>;
}

/* ---------- Nhập hàng (theo đơn mua) ---------- */
function Receipts() {
  const [s, set] = useStock(), r = useRange(), [sup, setSup] = useState(''), [ap, setAp] = useState(null), [dlg, setDlg] = useState(null), nm = id => s.sups.find(x => x.id === id)?.name ?? '—';
  const rows = s.docs.filter(d => d.kind === 'in' && (!ap || (d.date >= ap.from && d.date <= ap.to && (!ap.sup || d.sup === ap.sup)))).sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no));
  const open = () => setDlg({ sup: s.sups[0]?.id ?? '', wh: s.whs[0]?.id ?? '', date: ymd(new Date()), inv: '', po: '', note: '', lines: [blankLine(s)] });
  const pend = dlg ? s.pos.filter(p => p.sup === dlg.sup && p.st === 'Chờ thực hiện') : [];
  const pickPo = no => { const p = s.pos.find(x => x.no === no); setDlg(p ? { ...dlg, po: no, wh: p.wh, lines: p.lines.map(l => ({ m: l.m, q: String(l.q), p: String(l.p || '') })) } : { ...dlg, po: '' }); };
  const save = () => { const lines = clean(dlg.lines); if (!lines.length) return toast('Thêm ít nhất một dòng hàng có số lượng', true);
    set(st => ({ ...st, pos: st.pos.map(p => p.no === dlg.po ? { ...p, st: 'Đã thực hiện' } : p), docs: [...st.docs, { id: uid(), kind: 'in', no: nextNo(st, 'in'), date: dlg.date, wh: dlg.wh, sup: dlg.sup, note: dlg.note, po: dlg.po, inv: dlg.inv, lines }] })); setDlg(null); toast('Đã lưu phiếu nhập hàng'); };
  return <><Title keep t="Nhập hàng" sub="Quản lý phiếu nhập hàng theo đơn mua" />
    <Bar r={r} onGet={() => setAp({ from: r.from, to: r.to, sup })} onAdd={open} addLabel="Thêm phiếu nhập hàng"><Sel l="Nhà cung cấp" v={sup} set={setSup} opts={[['', 'Tất cả'], ...s.sups.map(x => [x.id, x.name])]} cls="w-56" /></Bar>
    <h3 className="font-semibold text-ink mb-3">Danh sách phiếu nhập hàng</h3>
    <Table cols={['Ngày', 'Số phiếu', 'Số hoá đơn', 'Nhà cung cấp', 'Đơn mua hàng', 'Tổng tiền', 'Diễn giải']} right={[5]} empty="Không có phiếu nhập hàng nào"
      rows={rows.map(d => [dmy(d.date), <span className={amber}>{d.no}</span>, d.inv || '-', nm(d.sup), d.po ? <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold">{d.po}</span> : <span className="text-xs text-slate-400">Nhập trực tiếp</span>, <b>{vnd(total(d))}</b>, d.note || '-'])} />
    {dlg && <Modal title="Thêm phiếu nhập hàng" onClose={() => setDlg(null)}><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><Sel cls="w-full" l="Nhà cung cấp" v={dlg.sup} set={v => setDlg({ ...dlg, sup: v, po: '' })} opts={s.sups.map(x => [x.id, x.name])} /><Sel cls="w-full" l="Kho nhập" v={dlg.wh} set={v => setDlg({ ...dlg, wh: v })} opts={s.whs.map(x => [x.id, x.name])} />
      <Lbl l="Ngày"><input type="date" className="field" value={dlg.date} onChange={e => setDlg({ ...dlg, date: e.target.value })} /></Lbl><Lbl l="Số hoá đơn"><input className="field" value={dlg.inv} onChange={e => setDlg({ ...dlg, inv: e.target.value })} /></Lbl></div>
      <Sel cls="w-full" l="Đơn mua hàng" v={dlg.po} set={pickPo} opts={[['', 'Nhập trực tiếp (không theo đơn)'], ...pend.map(p => [p.no, `${p.no} — ${vnd(total(p))}`])]} />
      <Lbl l="Diễn giải"><input className="field" value={dlg.note} onChange={e => setDlg({ ...dlg, note: e.target.value })} /></Lbl><Lines price lines={dlg.lines} set={lines => setDlg({ ...dlg, lines })} mats={s.mats} /></div><Foot onClose={() => setDlg(null)} onSave={save} /></Modal>}</>;
}

/* ---------- Trả lại hàng mua ---------- */
function Returns() {
  const [s, set] = useStock(), r = useRange(), [ap, setAp] = useState({ from: r.from, to: r.to }), [dlg, setDlg] = useState(null), nm = (l, id) => l.find(x => x.id === id)?.name ?? '—';
  const rows = s.docs.filter(d => d.kind === 'ret' && inR(d.date, ap)).sort((a, b) => b.date.localeCompare(a.date) || b.no.localeCompare(a.no));
  const save = () => { const lines = clean(dlg.lines); if (!lines.length) return toast('Thêm ít nhất một dòng hàng có số lượng', true);
    for (const l of lines) { const need = lines.filter(x => x.m === l.m).reduce((a, x) => a + x.q, 0); if (need > stockOf(s, dlg.wh, l.m)) return toast(`Không đủ tồn "${nm(s.mats, l.m)}" tại ${nm(s.whs, dlg.wh)} (còn ${stockOf(s, dlg.wh, l.m)})`, true); }
    set(st => ({ ...st, docs: [...st.docs, { id: uid(), kind: 'ret', no: nextNo(st, 'ret'), date: dlg.date, wh: dlg.wh, sup: dlg.sup, note: dlg.note, po: '', inv: '', lines }] })); setDlg(null); toast('Đã lưu phiếu trả hàng'); };
  return <><Title keep t="Trả lại hàng mua" sub="Quản lý phiếu trả lại hàng hóa cho nhà cung cấp" />
    <Filters><RangeFields r={r} /><div className="flex-1" /><Btn onClick={() => setAp({ from: r.from, to: r.to })}><Search className="w-4 h-4 mr-2 inline" />Lấy dữ liệu</Btn><Btn kind="ghost" className="!border-brand !text-brand-dark" onClick={() => setDlg({ sup: s.sups[0]?.id ?? '', wh: s.whs[0]?.id ?? '', date: ymd(new Date()), note: '', lines: [blankLine(s)] })}><Plus className="w-4 h-4 mr-1 inline" />Thêm phiếu trả hàng</Btn></Filters>
    <h3 className="font-semibold text-ink mb-3">Danh sách phiếu trả lại hàng mua</h3>
    {rows.length ? <Table cols={['Ngày', 'Số phiếu', 'Nhà cung cấp', 'Kho', 'Tổng tiền', 'Diễn giải', 'Thao tác']} right={[4, 6]} empty="" rows={rows.map(d => [dmy(d.date), <span className={amber}>{d.no}</span>, nm(s.sups, d.sup), nm(s.whs, d.wh), <b>{vnd(total(d))}</b>, d.note || '-', <Acts onDel={confirmDel(`phiếu ${d.no}`, () => set(st => ({ ...st, docs: st.docs.filter(x => x.id !== d.id) })))} />])} />
      : <Card className="py-16 text-center text-slate-500">Chưa có phiếu trả lại hàng mua nào</Card>}
    {dlg && <Modal title="Thêm phiếu trả hàng" onClose={() => setDlg(null)}><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><Sel cls="w-full" l="Nhà cung cấp" v={dlg.sup} set={v => setDlg({ ...dlg, sup: v })} opts={s.sups.map(x => [x.id, x.name])} /><Sel cls="w-full" l="Kho xuất trả" v={dlg.wh} set={v => setDlg({ ...dlg, wh: v })} opts={s.whs.map(x => [x.id, x.name])} /></div>
      <Lbl l="Ngày"><input type="date" className="field" value={dlg.date} onChange={e => setDlg({ ...dlg, date: e.target.value })} /></Lbl><Lbl l="Diễn giải"><input className="field" value={dlg.note} onChange={e => setDlg({ ...dlg, note: e.target.value })} /></Lbl><Lines price lines={dlg.lines} set={lines => setDlg({ ...dlg, lines })} mats={s.mats} /></div><Foot onClose={() => setDlg(null)} onSave={save} /></Modal>}</>;
}

/* ---------- Trả nợ ---------- */
function Debts() {
  const [s, set] = useStock(), [f, setF] = useState('all'), [q, setQ] = useState(''), [open, setOpen] = useState(null), [pay, setPay] = useState(null), [hist, setHist] = useState(null);
  const rows = s.sups.map(x => ({ x, ...debtOf(s, x.id) })).filter(d => (f === 'all' || (f === 'debt') === (d.left > 0)) && (d.x.name + d.x.code).toLowerCase().includes(q.toLowerCase()));
  const save = () => { const amt = +pay.amt; if (!(amt > 0)) return toast('Nhập số tiền thanh toán', true); if (amt > pay.left) return toast('Số tiền vượt quá công nợ còn lại', true);
    set(st => ({ ...st, pays: [...st.pays, { id: uid(), sup: pay.sup, date: pay.date, amt, method: pay.method, note: pay.note }] })); setPay(null); toast(`Đã thanh toán ${vnd(amt)}`); };
  const detail = id => [...s.docs.filter(d => d.sup === id && (d.kind === 'in' || d.kind === 'ret')).map(d => ({ date: d.date, t: d.kind === 'in' ? 'Nhập hàng' : 'Trả lại hàng', no: d.no, amt: d.kind === 'in' ? total(d) : -total(d) })), ...s.pays.filter(p => p.sup === id).map(p => ({ date: p.date, t: 'Thanh toán', no: p.method, amt: -p.amt }))].sort((a, b) => b.date.localeCompare(a.date));
  return <><Title keep t="Trả nợ" sub="Theo dõi công nợ nhà cung cấp và lập phiếu thanh toán" />
    <div className="flex items-center justify-between mb-4 max-md:flex-col max-md:items-stretch max-md:gap-3"><div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5">{[['all', 'Tất cả'], ['debt', 'Còn nợ'], ['done', 'Đã thanh toán hết']].map(([k, l]) => <button key={k} type="button" onClick={() => setF(k)} className={`px-4 max-md:px-1 max-md:flex-1 max-md:text-[13px] py-2 rounded-md text-sm font-semibold ${f === k ? 'bg-ink text-white' : 'text-slate-600'}`}>{l}</button>)}</div>
      <label className="relative w-72 max-md:w-full"><Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input className="field !pl-10 !h-11" placeholder="Tìm theo tên / mã NCC" value={q} onChange={e => setQ(e.target.value)} /></label></div>
    <div className="md:hidden space-y-3">{rows.map(d => <div key={d.x.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><b className="text-ink break-words">{d.x.name}</b><div className="text-xs text-slate-400">{d.x.code}</div></div><b className={d.left > 0 ? 'text-red-700' : 'text-slate-500'}>{vnd(d.left)}</b></div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 space-y-1.5 text-sm">{[['Tổng phát sinh', d.total], ['Trả lại hàng mua', d.ret], ['Đã thanh toán', d.paid]].map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-xs text-slate-400 uppercase">{k}</span><span>{vnd(v)}</span></div>)}</div>
      <div className="mt-3 grid grid-cols-2 gap-2"><Btn disabled={d.left <= 0} onClick={() => setPay({ sup: d.x.id, name: d.x.name, left: d.left, amt: String(d.left), date: ymd(new Date()), method: 'Chuyển khoản', note: '' })}>Thanh toán</Btn><Btn kind="ghost" onClick={() => setHist(d.x)}>Lịch sử</Btn></div>
      <button type="button" className="mt-2 w-full text-sm text-slate-500 py-2 inline-flex items-center justify-center gap-1" onClick={() => setOpen(open === d.x.id ? null : d.x.id)}>{open === d.x.id ? 'Ẩn phát sinh' : 'Xem phát sinh'}{open === d.x.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
      {open === d.x.id && <div className="border-t divide-y text-xs">{detail(d.x.id).map((e, i) => <div key={i} className="py-2 flex justify-between gap-2"><span><b className="font-medium text-ink">{e.t}</b> · {e.no}<div className="text-slate-400">{dmy(e.date)}</div></span><span className="font-medium">{e.amt < 0 ? '−' : ''}{vnd(Math.abs(e.amt))}</span></div>)}{!detail(d.x.id).length && <p className="py-2 text-slate-400">Chưa có phát sinh</p>}</div>}</div>)}
      {!rows.length && <p className="text-center text-slate-400 py-10">Không có nhà cung cấp phù hợp</p>}</div>
    <Card className="overflow-hidden max-md:hidden"><table className="w-full text-sm"><thead><tr className="border-b bg-slate-50/60 text-xs tracking-wide text-slate-500 uppercase">{['Nhà cung cấp', 'Tổng phát sinh', 'Trả lại hàng mua', 'Đã thanh toán', 'Còn nợ', 'Hành động'].map((h, i) => <th key={h} className={`px-5 py-3.5 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(d => [<tr key={d.x.id} className="border-b hover:bg-slate-50/70"><td className="px-5 py-3.5"><button type="button" className="flex items-center gap-3 text-left" onClick={() => setOpen(open === d.x.id ? null : d.x.id)}>{open === d.x.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}<div><div className="font-semibold text-ink">{d.x.name}</div><div className="text-xs text-slate-400">{d.x.code}</div></div></button></td>
          <td className="px-5 text-right">{vnd(d.total)}</td><td className="px-5 text-right text-slate-400">{vnd(d.ret)}</td><td className="px-5 text-right text-slate-500">{vnd(d.paid)}</td><td className={`px-5 text-right font-bold ${d.left > 0 ? 'text-red-700' : 'text-slate-500'}`}>{vnd(d.left)}</td>
          <td className="px-5"><div className="flex justify-end gap-2"><Btn disabled={d.left <= 0} className="!py-1.5" onClick={() => setPay({ sup: d.x.id, name: d.x.name, left: d.left, amt: String(d.left), date: ymd(new Date()), method: 'Chuyển khoản', note: '' })}><Wallet className="w-4 h-4 mr-1.5 inline" />Thanh toán</Btn>
            <Btn kind="ghost" className="!py-1.5" onClick={() => setHist(d.x)}><History className="w-4 h-4 mr-1.5 inline" />Lịch sử</Btn></div></td></tr>,
        open === d.x.id && <tr key={d.x.id + 'd'} className="border-b bg-slate-50/50"><td colSpan={6} className="px-14 py-4"><table className="w-full text-xs"><tbody>{detail(d.x.id).map((e, i) => <tr key={i} className="border-b last:border-0"><td className="py-1.5 w-28 text-slate-500">{dmy(e.date)}</td><td className="w-36">{e.t}</td><td className="text-slate-500">{e.no}</td><td className={`text-right font-medium ${e.amt < 0 ? 'text-slate-500' : ''}`}>{e.amt < 0 ? '−' : ''}{vnd(Math.abs(e.amt))}</td></tr>)}{!detail(d.x.id).length && <tr><td className="py-2 text-slate-400">Chưa có phát sinh</td></tr>}</tbody></table></td></tr>])}
        {!rows.length && <tr><td colSpan={6} className="text-center text-slate-400 py-12">Không có nhà cung cấp phù hợp</td></tr>}</tbody></table>
      <div className="px-5 py-3.5 border-t text-sm text-slate-500 text-right">1–{rows.length} trên {rows.length}</div></Card>
    {pay && <Modal title={`Thanh toán — ${pay.name}`} onClose={() => setPay(null)}><div className="space-y-4"><div className="flex justify-between text-sm rounded-lg bg-slate-50 border px-4 py-3"><span className="text-slate-500">Công nợ còn lại</span><b className="text-red-700">{vnd(pay.left)}</b></div>
      <Lbl l="Số tiền thanh toán (VNĐ)"><input autoFocus inputMode="numeric" className="field" value={pay.amt ? money(+pay.amt) : ''} onChange={e => setPay({ ...pay, amt: e.target.value.replace(/\D/g, '') })} /></Lbl>
      <div className="grid grid-cols-2 gap-3"><Lbl l="Ngày"><input type="date" className="field" value={pay.date} onChange={e => setPay({ ...pay, date: e.target.value })} /></Lbl><Sel cls="w-full" l="Hình thức" v={pay.method} set={v => setPay({ ...pay, method: v })} opts={['Tiền mặt', 'Chuyển khoản']} /></div>
      <Lbl l="Ghi chú"><input className="field" value={pay.note} onChange={e => setPay({ ...pay, note: e.target.value })} /></Lbl></div><Foot onClose={() => setPay(null)} onSave={save} ok="Thanh toán" /></Modal>}
    {hist && <Modal title={`Lịch sử thanh toán — ${hist.name}`} onClose={() => setHist(null)}>{s.pays.filter(p => p.sup === hist.id).length ? <table className="w-full text-sm"><thead><tr className="text-xs text-slate-500 border-b"><th className="py-2 text-left">Ngày</th><th className="text-left">Hình thức</th><th className="text-left">Ghi chú</th><th className="text-right">Số tiền</th></tr></thead>
      <tbody>{s.pays.filter(p => p.sup === hist.id).sort((a, b) => b.date.localeCompare(a.date)).map(p => <tr key={p.id} className="border-b last:border-0"><td className="py-2">{dmy(p.date)}</td><td>{p.method}</td><td className="text-slate-500">{p.note || '—'}</td><td className="text-right font-semibold">{vnd(p.amt)}</td></tr>)}</tbody></table> : <p className="text-center text-sm text-slate-400 py-10">Chưa có lần thanh toán nào</p>}
      <div className="flex justify-end mt-5"><Btn kind="ghost" onClick={() => setHist(null)}>Đóng</Btn></div></Modal>}</>;
}

const PTABS = [['b', 'Báo hàng'], ['o', 'Đặt hàng'], ['r', 'Nhập hàng'], ['t', 'Trả lại hàng mua'], ['d', 'Trả nợ']];
export default function Purchasing() {
  const [tab, setTab] = useState('b'), P = { b: Reports, o: Orders, r: Receipts, t: Returns, d: Debts }[tab];
  return <><div className="max-md:hidden"><Underline items={PTABS} value={tab} onChange={setTab} /></div><SheetTabs items={PTABS} value={tab} onChange={setTab} /><P /></>;
}
