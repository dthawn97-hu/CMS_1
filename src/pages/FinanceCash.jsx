import { useState } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Minus, X } from 'lucide-react';
import { money, ymd } from '../store.jsx';
import { useFin, uid } from '../finStore.js';
import { Btn, Card, Tabs, Title, ask, toast } from '../ui.jsx';

const vnd = n => money(n) + 'đ', dmy = s => s.split('-').reverse().join('/');
const Switch = ({ on, set, title }) => <button type="button" role="switch" aria-checked={on} title={title} onClick={e => { e.stopPropagation(); set(!on); }} className={`relative w-11 h-6 rounded-full shrink-0 ${on ? 'bg-ink' : 'bg-slate-300'}`}><i className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></button>;
const Modal = ({ title, onClose, children }) => <div className="fixed inset-0 z-50 grid place-items-center max-md:place-items-end bg-black/50 anim-fade" onMouseDown={e => e.target === e.currentTarget && onClose()}>
  <div className="w-[480px] max-w-[92vw] max-md:!w-full max-md:!max-w-none max-md:rounded-b-none max-md:pb-8 bg-white rounded-2xl shadow-2xl p-6 anim-pop"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-ink">{title}</h3><button type="button" title="Đóng" onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button></div>{children}</div></div>;
const Fld = ({ l, children }) => <label className="block"><span className="block font-semibold text-ink mb-1.5">{l}</span>{children}</label>;

/* ---------------- Cấu hình Thu/Chi ---------------- */
function Categories() {
  const [fin, set] = useFin(), [kind, setKind] = useState('thu'), [gid, setGid] = useState(null), [iid, setIid] = useState(null), [dlg, setDlg] = useState(null);
  const groups = fin.cfg[kind], g = groups.find(x => x.id === gid), it = g?.items.find(x => x.id === iid);
  const patchG = (id, p) => set(s => ({ ...s, cfg: { ...s.cfg, [kind]: s.cfg[kind].map(x => x.id === id ? { ...x, ...p } : x) } }));
  const patchI = (id, p) => patchG(g.id, { items: g.items.map(x => x.id === id ? { ...x, ...p } : x) });
  const save = () => { const name = dlg.v.trim(); if (!name) return;
    if (dlg.t === 'g') { const n = { id: uid(), name, on: true, items: [] }; set(s => ({ ...s, cfg: { ...s.cfg, [kind]: [...s.cfg[kind], n] } })); setGid(n.id); setIid(null); }
    else { const n = { id: uid(), name, on: true, desc: '' }; patchG(g.id, { items: [...g.items, n] }); setIid(n.id); }
    setDlg(null); toast('Đã thêm'); };
  const del = async (what, name, run) => { if (await ask(`Xoá ${what} "${name}"? Thao tác không thể hoàn tác.`, { title: `Xoá ${what}?`, ok: 'Xoá', danger: true })) run(); };
  const Head = ({ t, onAdd, off }) => <div className="flex items-center justify-between px-5 py-4 border-b"><span className="font-semibold text-ink">{t}</span><button type="button" disabled={off} onClick={onAdd} className="inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-40"><Plus className="w-4 h-4" />Thêm</button></div>;
  return <>
    <div className="flex gap-2 mb-5 max-md:[&>button]:flex-1">{[['thu', 'Mục thu'], ['chi', 'Mục chi']].map(([k, l]) => <button key={k} type="button" onClick={() => { setKind(k); setGid(null); setIid(null); }} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${kind === k ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-slate-200 hover:border-brand'}`}>{l}</button>)}</div>
    <div className="grid grid-cols-3 max-md:!grid-cols-1 gap-5 items-start">
      <Card className="overflow-hidden"><Head t="Nhóm" onAdd={() => setDlg({ t: 'g', v: '' })} />
        {groups.map(x => <div key={x.id} role="button" tabIndex={0} onClick={() => { setGid(x.id); setIid(null); }} className={`flex items-center gap-3 px-5 py-4 border-b last:border-0 cursor-pointer ${gid === x.id ? 'bg-brand/10' : 'hover:bg-slate-50'}`}>
          <span className="flex-1 font-medium">{x.name}</span><Switch on={x.on} set={v => patchG(x.id, { on: v })} title={x.on ? 'Đang dùng — bấm để tắt' : 'Đã tắt — bấm để bật'} />
          <button type="button" title="Xoá nhóm" className="text-slate-400 hover:text-red-500" onClick={e => { e.stopPropagation(); del('nhóm', x.name, () => { set(s => ({ ...s, cfg: { ...s.cfg, [kind]: s.cfg[kind].filter(y => y.id !== x.id) } })); if (gid === x.id) setGid(null); }); }}><Trash2 className="w-4 h-4" /></button></div>)}
        {!groups.length && <p className="px-5 py-5 text-sm text-slate-400">Chưa có nhóm nào.</p>}</Card>
      <Card className="overflow-hidden"><Head t="Danh mục" off={!g} onAdd={() => setDlg({ t: 'i', v: '' })} />
        {g ? g.items.map(x => <div key={x.id} role="button" tabIndex={0} onClick={() => setIid(x.id)} className={`flex items-center gap-3 px-5 py-4 border-b last:border-0 cursor-pointer ${iid === x.id ? 'bg-brand/10' : 'hover:bg-slate-50'}`}>
          <span className="flex-1 font-medium">{x.name}</span><Switch on={x.on} set={v => patchI(x.id, { on: v })} title={x.on ? 'Đang dùng' : 'Đã tắt'} />
          <button type="button" title="Xoá danh mục" className="text-slate-400 hover:text-red-500" onClick={e => { e.stopPropagation(); del('danh mục', x.name, () => { patchG(g.id, { items: g.items.filter(y => y.id !== x.id) }); if (iid === x.id) setIid(null); }); }}><Trash2 className="w-4 h-4" /></button></div>)
          : <p className="px-5 py-5 text-sm text-slate-400">Chọn một nhóm để xem danh mục.</p>}
        {g && !g.items.length && <p className="px-5 py-5 text-sm text-slate-400">Nhóm này chưa có danh mục.</p>}</Card>
      <Card className="p-5">{it ? <div className="space-y-4"><h3 className="font-semibold text-ink">Chi tiết danh mục</h3>
        <Fld l="Tên danh mục"><input className="field" value={it.name} onChange={e => patchI(it.id, { name: e.target.value })} /></Fld>
        <Fld l="Nhóm"><input disabled className="field" value={g.name} /></Fld>
        <Fld l="Mô tả"><textarea rows={3} className="field" value={it.desc ?? ''} onChange={e => patchI(it.id, { desc: e.target.value })} /></Fld>
        <Btn className="max-md:w-full" onClick={() => toast('Đã lưu danh mục')}>Lưu</Btn></div> : <p className="text-sm text-slate-400">Chọn một danh mục để xem chi tiết.</p>}</Card></div>
    {dlg && <Modal title={dlg.t === 'g' ? 'Thêm nhóm' : 'Thêm danh mục'} onClose={() => setDlg(null)}><Fld l="Tên"><input autoFocus className="field" value={dlg.v} onChange={e => setDlg({ ...dlg, v: e.target.value })} onKeyDown={e => e.key === 'Enter' && save()} /></Fld>
      <div className="flex justify-end gap-2 mt-5 max-md:[&>button]:flex-1"><Btn kind="ghost" onClick={() => setDlg(null)}>Bỏ qua</Btn><Btn disabled={!dlg.v.trim()} onClick={save}>Lưu</Btn></div></Modal>}</>;
}

function Banks() {
  const [fin, set] = useFin(), [nb, setNb] = useState({ no: '', bank: '', br: '' }), banks = fin.banks;
  const Th = ({ children }) => <span className="text-xs font-semibold text-slate-600">{children}</span>;
  return <Card className="p-2"><div className="max-md:hidden grid grid-cols-[1fr_1fr_1fr_40px] px-4 py-3"><Th>Số tài khoản</Th><Th>Tên ngân hàng</Th><Th>Chi nhánh</Th><span /></div>
    {banks.map(b => <div key={b.no} className="grid grid-cols-[1fr_1fr_1fr_40px] max-md:grid-cols-[1fr_40px] max-md:gap-y-0.5 px-4 py-4 max-md:py-3 text-sm items-center max-md:border-b max-md:last:border-0"><span className="max-md:font-semibold max-md:text-ink">{b.no}</span><span className="max-md:text-slate-600">{b.bank}</span><span className="max-md:text-xs max-md:text-slate-400">{b.br}</span>
      <button type="button" title="Xoá" className="text-slate-400 hover:text-red-500 max-md:col-start-2 max-md:row-start-1 max-md:row-span-3 max-md:h-10 max-md:grid max-md:place-items-center" onClick={() => set(s => ({ ...s, banks: s.banks.filter(x => x.no !== b.no) }))}><Trash2 className="w-4 h-4" /></button></div>)}
    <form className="grid grid-cols-[1fr_1fr_1fr_auto] max-md:grid-cols-1 gap-3 p-3 max-md:border-t max-md:[&>button]:w-full" onSubmit={e => { e.preventDefault(); if (!nb.no.trim() || !nb.bank.trim()) return toast('Nhập số tài khoản và tên ngân hàng', true); if (banks.some(x => x.no === nb.no.trim())) return toast('Số tài khoản đã tồn tại', true);
      set(s => ({ ...s, banks: [...s.banks, { no: nb.no.trim(), bank: nb.bank.trim(), br: nb.br.trim() }] })); setNb({ no: '', bank: '', br: '' }); }}>
      {[['no', 'Số tài khoản'], ['bank', 'Tên ngân hàng'], ['br', 'Chi nhánh']].map(([k, p]) => <input key={k} className="field" placeholder={p} value={nb[k]} onChange={e => setNb({ ...nb, [k]: e.target.value })} />)}<Btn>Lưu</Btn></form></Card>;
}

export function CashConfig() {
  const [tab, setTab] = useState('cat');
  return <><Title keep t="Cấu hình Thu/Chi" sub="Cấu hình nhóm và danh mục thu chi." />
    <Tabs value={tab} onChange={setTab} items={[['cat', 'Danh mục thu/chi'], ['bank', 'Tài khoản ngân hàng']]} />{tab === 'cat' ? <Categories /> : <Banks />}</>;
}

/* ---------------- Sổ sách Thu Chi ---------------- */
export function CashBook() {
  const [fin, set] = useFin(), today = ymd(new Date()), [type, setType] = useState('all'), [from, setFrom] = useState(today.slice(0, 8) + '01'), [to, setTo] = useState(today), [dlg, setDlg] = useState(null);
  const rows = fin.tx.filter(x => (type === 'all' || x.type === type) && x.date >= from && x.date <= to).sort((a, b) => b.date.localeCompare(a.date)),
    sum = k => fin.tx.filter(x => x.type === k && x.date >= from && x.date <= to).reduce((a, x) => a + x.amount, 0), thu = sum('thu'), chi = sum('chi'), profit = thu - chi;
  const gOf = x => fin.cfg[x.type].find(g => g.id === x.g), label = x => { const g = gOf(x); return g ? `${g.name}${g.items.find(i => i.id === x.i) ? ' / ' + g.items.find(i => i.id === x.i).name : ''}` : '—'; };
  const open = () => { if (!fin.cfg.thu.some(g => g.on) && !fin.cfg.chi.some(g => g.on)) return toast('Hãy tạo nhóm trong Cấu hình Thu/Chi trước', true); const t = fin.cfg.thu.some(g => g.on) ? 'thu' : 'chi'; setDlg({ type: t, date: today, g: fin.cfg[t].find(g => g.on).id, i: '', amount: '', note: '' }); };
  const pickType = t => { const g = fin.cfg[t].find(x => x.on); if (g) setDlg({ ...dlg, type: t, g: g.id, i: '' }); else toast(`Chưa có nhóm ${t === 'thu' ? 'thu' : 'chi'} đang dùng`, true); };
  const add = () => { if (!+dlg.amount) return toast('Nhập số tiền', true); set(s => ({ ...s, tx: [...s.tx, { ...dlg, id: uid(), amount: +dlg.amount }] })); setDlg(null); toast('Đã thêm giao dịch'); };
  const Stat = ({ I, l, v, c }) => <Card className="p-5 max-md:p-4"><div className="flex items-center gap-2 text-sm text-slate-500"><I className={`w-4 h-4 ${c}`} />{l}</div><div className={`mt-1 text-2xl max-md:text-xl font-bold ${c}`}>{vnd(v)}</div></Card>;
  const dg = dlg && fin.cfg[dlg.type].find(g => g.id === dlg.g);
  return <><Title keep t="Báo cáo tài chính" sub="Ghi nhận doanh thu và chi phí khách sạn" right={<Btn onClick={open}><Plus className="w-4 h-4 mr-1 inline" />Thêm giao dịch</Btn>} />
    <div className="flex items-center gap-3 mb-5 max-md:flex-wrap max-md:gap-2"><div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5 max-md:w-full">{[['all', 'Tất cả'], ['thu', 'Thu'], ['chi', 'Chi']].map(([k, l]) => <button key={k} type="button" onClick={() => setType(k)} className={`px-4 max-md:flex-1 py-1.5 rounded-md text-sm font-semibold ${type === k ? 'bg-ink text-white' : 'text-slate-600'}`}>{l}</button>)}</div>
      <input type="date" className="field !w-44 max-md:!w-auto max-md:flex-1 min-w-0" value={from} max={to} onChange={e => e.target.value && setFrom(e.target.value)} /><span className="text-slate-400">→</span><input type="date" className="field !w-44 max-md:!w-auto max-md:flex-1 min-w-0" value={to} min={from} onChange={e => e.target.value && setTo(e.target.value)} /></div>
    <div className="grid grid-cols-3 max-md:!grid-cols-2 gap-5 max-md:gap-3 mb-5"><Stat I={TrendingUp} l="Tổng thu" v={thu} c="text-emerald-700" /><Stat I={TrendingDown} l="Tổng chi" v={chi} c="text-red-700" /><div className="max-md:col-span-2 contents max-md:block"><Stat I={Minus} l="Lợi nhuận" v={profit} c={profit < 0 ? 'text-red-700' : 'text-emerald-700'} /></div></div>
    <div className="md:hidden space-y-3">{rows.map(x => <div key={x.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${x.type === 'thu' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{x.type === 'thu' ? 'Thu' : 'Chi'}</span><span className="text-sm text-slate-500">{dmy(x.date)}</span></div>
        <b className={x.type === 'thu' ? 'text-emerald-700' : 'text-red-700'}>{x.type === 'thu' ? '+' : '−'}{vnd(x.amount)}</b></div>
      <div className="mt-2 font-medium text-ink break-words">{label(x)}</div>{x.note && <div className="text-sm text-slate-500 break-words">{x.note}</div>}
      <div className="mt-1 flex justify-end"><button type="button" title="Xoá giao dịch" className="w-10 h-10 grid place-items-center text-red-500" onClick={async () => { if (await ask('Xoá giao dịch này? Thao tác không thể hoàn tác.', { title: 'Xoá giao dịch?', ok: 'Xoá', danger: true })) set(s => ({ ...s, tx: s.tx.filter(y => y.id !== x.id) })); }}><Trash2 className="w-4 h-4" /></button></div></div>)}</div>
    <Card className={`overflow-hidden ${rows.length ? 'max-md:hidden' : ''}`}>{rows.length ? <table className="w-full text-sm"><thead className="border-b"><tr>{['Ngày', 'Loại', 'Nhóm / Danh mục', 'Ghi chú', 'Số tiền', ''].map((h, i) => <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(x => <tr key={x.id} className="border-b last:border-0 hover:bg-slate-50/70"><td className="px-4 py-3.5 text-slate-500">{dmy(x.date)}</td><td className="px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${x.type === 'thu' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{x.type === 'thu' ? 'Thu' : 'Chi'}</span></td>
        <td className="px-4">{label(x)}</td><td className="px-4 text-slate-500">{x.note || '—'}</td><td className={`px-4 text-right font-semibold ${x.type === 'thu' ? 'text-emerald-700' : 'text-red-700'}`}>{x.type === 'thu' ? '+' : '−'}{vnd(x.amount)}</td>
        <td className="px-4 w-10"><button type="button" title="Xoá giao dịch" className="text-slate-400 hover:text-red-500" onClick={async () => { if (await ask('Xoá giao dịch này? Thao tác không thể hoàn tác.', { title: 'Xoá giao dịch?', ok: 'Xoá', danger: true })) set(s => ({ ...s, tx: s.tx.filter(y => y.id !== x.id) })); }}><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table>
      : <div className="py-14 text-center"><p className="text-slate-500 mb-4">Chưa có giao dịch nào trong kỳ này</p><Btn onClick={open}><Plus className="w-4 h-4 mr-1 inline" />Thêm giao dịch</Btn></div>}</Card>
    {dlg && <Modal title="Thêm giao dịch" onClose={() => setDlg(null)}><div className="space-y-4">
      <div className="inline-flex bg-slate-100 rounded-lg p-0.5">{[['thu', 'Khoản thu'], ['chi', 'Khoản chi']].map(([k, l]) => <button key={k} type="button" onClick={() => pickType(k)} className={`px-4 py-1.5 rounded-md text-sm font-semibold ${dlg.type === k ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`}>{l}</button>)}</div>
      <div className="grid grid-cols-2 gap-3"><Fld l="Ngày"><input type="date" className="field" value={dlg.date} onChange={e => setDlg({ ...dlg, date: e.target.value })} /></Fld>
        <Fld l="Số tiền (VNĐ)"><input autoFocus inputMode="numeric" className="field" value={dlg.amount ? money(+dlg.amount) : ''} onChange={e => setDlg({ ...dlg, amount: e.target.value.replace(/\D/g, '') })} /></Fld></div>
      <div className="grid grid-cols-2 gap-3"><Fld l="Nhóm"><select className="field" value={dlg.g} onChange={e => setDlg({ ...dlg, g: e.target.value, i: '' })}>{fin.cfg[dlg.type].filter(g => g.on).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Fld>
        <Fld l="Danh mục"><select className="field" value={dlg.i} onChange={e => setDlg({ ...dlg, i: e.target.value })}><option value="">— Không chọn —</option>{dg?.items.filter(i => i.on).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></Fld></div>
      <Fld l="Ghi chú"><textarea rows={2} className="field" value={dlg.note} onChange={e => setDlg({ ...dlg, note: e.target.value })} /></Fld>
      <div className="flex justify-end gap-2 max-md:[&>button]:flex-1"><Btn kind="ghost" onClick={() => setDlg(null)}>Bỏ qua</Btn><Btn onClick={add}>Lưu</Btn></div></div></Modal>}</>;
}
