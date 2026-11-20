import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

/* ---------- toast ---------- */
let pushToast = () => {};
export const toast = (t, err) => pushToast({ t, err, id: Math.random() });
// Hộp thoại xác nhận của hệ thống (thay cho confirm() của trình duyệt): ask('Nội dung', { ok: 'Xoá', danger: true }) → Promise<boolean>
let pushAsk = () => {};
export const ask = (msg, o = {}) => new Promise(res => pushAsk({ msg, res, ...o }));
export function Toaster() {
  const [list, setList] = useState([]), [dlg, setDlg] = useState(null);
  useEffect(() => { pushToast = x => { setList(l => [...l, x]); setTimeout(() => setList(l => l.filter(i => i !== x)), 2200); }; pushAsk = setDlg; }, []);
  const done = v => { dlg?.res(v); setDlg(null); };
  useEffect(() => { if (!dlg) return; const h = e => e.key === 'Escape' && done(false); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [dlg]);
  return <><div className="fixed top-5 right-5 z-[60] space-y-2">{list.map(x =>
    <div key={x.id} className={`px-4 py-3 rounded-lg shadow-lg text-white anim-pop ${x.err ? 'bg-red-600' : 'bg-emerald-600'}`}>{x.t}</div>)}</div>
    {dlg && <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/40 backdrop-blur-[2px] anim-fade" onClick={() => done(false)}>
      <div className="w-[420px] max-w-[92vw] bg-white rounded-2xl shadow-2xl p-6 anim-pop" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif text-lg font-bold text-ink">{dlg.title || 'Xác nhận'}</h3><p className="mt-2 text-slate-600">{dlg.msg}</p>
        <div className="mt-6 flex justify-end gap-2"><button type="button" autoFocus className="rounded-lg px-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => done(false)}>{dlg.cancel || 'Huỷ'}</button>
          <button type="button" className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 ${dlg.danger ? 'bg-red-600' : 'bg-ink'}`} onClick={() => done(true)}>{dlg.ok || 'Đồng ý'}</button></div></div></div>}</>;
}

/* ---------- form state ---------- */
export function useForm(init) {
  const [v, setV] = useState(init);
  return { v, set: (k, val) => setV(o => ({ ...o, [k]: val })), reset: x => setV(x) };
}

/* ---------- primitives ---------- */
const KINDS = { dark: 'bg-ink text-white', ghost: 'bg-white border border-slate-200 text-slate-700', gray: 'bg-slate-400 text-white', brand: 'bg-brand-dark text-white' };
export const Btn = ({ kind = 'dark', type = 'button', className = '', ...p }) =>
  <button type={type} {...p} className={`${KINDS[kind]} rounded-lg px-4 py-2.5 font-semibold text-sm hover:opacity-90 hover:shadow-sm disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap ${className}`} />;
// Trang danh sách: bỏ tiêu đề (giống Bán phòng), chỉ giữ nút hành động bên phải. Trang form dùng keep để giữ tiêu đề.
export const Title = ({ t, sub, right, keep }) => !keep ? (right ? <div className="flex justify-end mb-4">{right}</div> : null) : <div className="flex justify-between items-start mb-6">
  <div><h1 className="font-serif text-3xl font-bold text-ink">{t}</h1><p className="text-slate-500 mt-1">{sub}</p></div>{right}</div>;
export const Card = ({ className = '', ...p }) => <div {...p} className={`bg-white border border-slate-200 rounded-xl ${className}`} />;
export const H2 = ({ children }) => <h3 className="font-serif font-bold text-ink text-base mb-3">{children}</h3>;
export const Badge = ({ children }) => <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">{children}</span>;

export function Input({ label, f, k, type = 'text', ph, req, className = '', ...rest }) {
  return <label className={`block ${className}`}>{label && <span className="lbl">{label}</span>}
    <input type={type} required={req} placeholder={ph} className="field" value={f.v[k] ?? ''} onChange={e => f.set(k, e.target.value)} {...rest} /></label>;
}
export function Select({ label, f, k, opts, className = '', ...rest }) {
  return <label className={`block ${className}`}>{label && <span className="lbl">{label}</span>}
    <select className="field pr-9" value={f.v[k] ?? ''} onChange={e => f.set(k, e.target.value)} {...rest}>
      {opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}</select></label>;
}
export const Area = ({ label, f, k, rows = 3, ph }) => <label className="block"><span className="lbl">{label}</span>
  <textarea rows={rows} placeholder={ph} className="field" value={f.v[k] ?? ''} onChange={e => f.set(k, e.target.value)} /></label>;
export const Toggle = ({ checked, onChange, label }) => <label className="inline-flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="peer sr-only" checked={!!checked} onChange={e => onChange(e.target.checked)} />
  <span className="w-11 h-6 rounded-full bg-slate-300 peer-checked:bg-ink relative transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:after:translate-x-5" />{label}</label>;
export const Check = ({ label, checked, onChange }) => <label className="inline-flex items-center gap-2 text-sm">
  <input type="checkbox" className="rounded" checked={!!checked} onChange={e => onChange(e.target.checked)} />{label}</label>;
export const FToggle = ({ f, k, label }) => <Toggle checked={f.v[k]} onChange={x => f.set(k, x)} label={label} />;
export const FCheck = ({ f, k, label }) => <Check checked={f.v[k]} onChange={x => f.set(k, x)} label={label} />;
export const Radios = ({ f, k, opts }) => <div className="flex gap-5 py-2.5">{opts.map(o =>
  <label key={o} className="inline-flex items-center gap-2 text-sm"><input type="radio" checked={f.v[k] === o} onChange={() => f.set(k, o)} />{o}</label>)}</div>;
export const Tabs = ({ items, value, onChange }) => <div className="inline-flex bg-slate-100 rounded-xl p-1 mb-5">{items.map(([id, t]) =>
  <button key={id} type="button" onClick={() => onChange(id)} className={`px-4 py-2 rounded-lg ${value === id ? 'bg-white text-ink font-semibold shadow-sm' : 'text-slate-500'}`}>{t}</button>)}</div>;
export const Seg = ({ items, value, onChange }) => <div className="inline-flex bg-white border rounded-xl p-1">{items.map(([id, t]) =>
  <button key={id} type="button" onClick={() => onChange(id)} className={`px-4 py-1.5 rounded-lg ${value === id ? 'bg-ink text-white' : ''}`}>{t}</button>)}</div>;
export const SearchBox = ({ value, onChange, ph }) => <div className="relative w-80"><input className="field pl-10" placeholder={ph} value={value} onChange={e => onChange(e.target.value)} /><Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /></div>;

export const Table = ({ head, rows }) => <table className="w-full text-left"><thead><tr className="text-xs uppercase text-slate-500 border-b border-slate-200">
  {head.map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
  <tbody className="divide-y divide-slate-100">{rows.length ? rows.map(r => <tr key={r.key} className="hover:bg-slate-50">{r.cells.map((c, i) => <td key={i} className="px-4 py-3.5">{c}</td>)}</tr>)
    : <tr><td colSpan={head.length} className="text-center text-slate-400 py-12">Chưa có dữ liệu</td></tr>}</tbody></table>;
export const Pager = ({ n, label }) => <div className="flex justify-between items-center mt-4 text-slate-500">
  <div className="flex items-center gap-2">{label} <select className="field !w-20 !py-1.5"><option>10</option></select></div><span>{n}</span>
  <div className="flex gap-1"><Btn kind="ghost"><ChevronLeft className="w-4 h-4" /></Btn><Btn kind="ghost"><ChevronRight className="w-4 h-4" /></Btn></div></div>;
export const Back = ({ to, children }) => { const nav = useNavigate();
  return <button type="button" onClick={() => nav(to)} className="inline-flex items-center gap-1 text-slate-700 mb-3"><ArrowLeft className="w-4 h-4" /> {children}</button>; };
export function Footer({ ok }) { const nav = useNavigate();
  return <div className="sticky bottom-0 z-10 mt-5 px-5 py-3 bg-white/90 backdrop-blur border border-slate-200 rounded-xl flex items-center justify-end gap-2 shadow-[0_-4px_12px_rgba(0,0,0,.04)]">
    <Btn kind="ghost" onClick={() => nav(-1)}>Huỷ</Btn><Btn type="submit">{ok}</Btn></div>; }
export const RowActions = ({ onEdit, onDel, extra }) => <div className="flex gap-3 items-center text-slate-500">
  {extra && <button type="button" onClick={extra[1]} className="text-brand-dark">{extra[0]}</button>}<button type="button" onClick={onEdit}>✎ Sửa</button><button type="button" onClick={onDel} className="text-red-500">Xoá</button></div>;

/* Multi-select dropdown: label shows "Tất cả N" when everything is ticked */
export function MultiSelect({ label, opts, value, onChange, className = '', inline }) {
  const [open, setOpen] = useState(false), [q, setQ] = useState(''), ref = useRef(null);
  useEffect(() => { // close on outside click
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const all = value.length === opts.length;
  const text = all ? `Tất cả ${opts.length}` : value.length === 0 ? 'Chưa chọn' : value.length === 1 ? (opts.find(o => o[0] === value[0]) || ['', '—'])[1] : `${value.length} đã chọn`;
  const toggle = v => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return <div ref={ref} className={`relative ${className}`}>{!inline && <span className="lbl">{label}</span>}
    <button type="button" onClick={() => setOpen(o => !o)} className={`field flex justify-between items-center gap-2 text-left ${inline ? "!py-2" : ""}`}><span className="truncate">{inline && <span className="text-slate-400">{label}: </span>}{text}</span><ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} /></button>
    {open && <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl anim-drop p-2 max-h-64 overflow-y-auto">
      <input className="field !py-1.5 mb-2" placeholder="Tìm kiếm" value={q} onChange={e => setQ(e.target.value)} />
      <div className="flex gap-3 px-2 pb-2 mb-1 border-b text-sm"><button type="button" className="text-brand" onClick={() => onChange(opts.map(o => o[0]))}>Chọn tất cả</button><span className="text-slate-300">|</span><button type="button" className="text-slate-400" onClick={() => onChange([])}>Xóa</button></div>
      {opts.filter(([, l]) => l.toLowerCase().includes(q.toLowerCase())).map(([v, l]) => <label key={v} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded"><input type="checkbox" className="rounded" checked={value.includes(v)} onChange={() => toggle(v)} />{l}</label>)}
    </div>}</div>;
}
