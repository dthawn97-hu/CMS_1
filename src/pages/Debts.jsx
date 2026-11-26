import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { money, ymd } from '../store.jsx';
import { useFin, uid } from '../finStore.js';
import { Btn, Card, Tabs, Title, ask, toast } from '../ui.jsx';

const vnd = n => money(n) + 'đ', dmy = s => s.split('-').reverse().join('/'), E = { who: '', due: '', amount: '', note: '' };
export default function Debts() {
  const [fin, set] = useFin(), [kind, setKind] = useState('thu'), [nd, setNd] = useState(E), today = ymd(new Date()),
    rows = fin.debts.filter(d => d.kind === kind), left = d => d.amount - d.paid, total = rows.reduce((a, d) => a + left(d), 0),
    patch = (id, p) => set(s => ({ ...s, debts: s.debts.map(d => d.id === id ? { ...d, ...p } : d) }));
  const add = e => { e.preventDefault(); if (!nd.who.trim() || !+nd.amount) return toast('Nhập đối tượng và số tiền', true);
    set(s => ({ ...s, debts: [...s.debts, { id: uid(), kind, who: nd.who.trim(), due: nd.due, amount: +nd.amount, paid: 0, note: nd.note }] })); setNd(E); toast('Đã thêm công nợ'); };
  const pay = d => patch(d.id, { paid: d.amount }), del = async d => { if (await ask(`Xoá công nợ "${d.who}"? Thao tác không thể hoàn tác.`, { title: 'Xoá công nợ?', ok: 'Xoá', danger: true })) set(s => ({ ...s, debts: s.debts.filter(x => x.id !== d.id) })); };
  return <><Title keep t="Quản lý công nợ" sub="Theo dõi khoản phải thu từ khách và khoản phải trả nhà cung cấp." />
    <Tabs value={kind} onChange={setKind} items={[['thu', 'Phải thu'], ['chi', 'Phải trả']]} />
    <Card className="p-5 mb-5 max-md:p-4"><div className="text-sm text-slate-500">{kind === 'thu' ? 'Tổng còn phải thu' : 'Tổng còn phải trả'}</div><div className={`mt-1 text-2xl font-bold ${kind === 'thu' ? 'text-emerald-700' : 'text-red-700'}`}>{vnd(total)}</div></Card>
    <Card className="p-2"><form className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] max-md:grid-cols-1 gap-3 p-3" onSubmit={add}>
      <input className="field" placeholder={kind === 'thu' ? 'Khách / công ty' : 'Nhà cung cấp'} value={nd.who} onChange={e => setNd({ ...nd, who: e.target.value })} />
      <input type="date" className="field" value={nd.due} onChange={e => setNd({ ...nd, due: e.target.value })} />
      <input inputMode="numeric" className="field" placeholder="Số tiền" value={nd.amount ? money(+nd.amount) : ''} onChange={e => setNd({ ...nd, amount: e.target.value.replace(/\D/g, '') })} />
      <input className="field" placeholder="Ghi chú" value={nd.note} onChange={e => setNd({ ...nd, note: e.target.value })} /><Btn>Thêm</Btn></form>
      {rows.map(d => { const l = left(d), late = l > 0 && d.due && d.due < today;
        return <div key={d.id} className="flex items-center gap-3 max-md:flex-wrap px-4 py-4 border-t text-sm">
          <div className="flex-1 min-w-[160px]"><div className="font-semibold text-ink">{d.who}</div><div className="text-slate-500">{d.note || '—'}</div></div>
          <div className={`w-28 ${late ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{d.due ? 'Hạn ' + dmy(d.due) : 'Không hạn'}{late && ' (quá hạn)'}</div>
          <div className="w-40 text-right"><div className="font-semibold">{vnd(l)}</div><div className="text-xs text-slate-400">/ {vnd(d.amount)}</div></div>
          {l > 0 ? <Btn kind="ghost" onClick={() => pay(d)}>Đã thanh toán</Btn> : <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Đã tất toán</span>}
          <button type="button" title="Xoá" className="text-slate-400 hover:text-red-500" onClick={() => del(d)}><Trash2 className="w-4 h-4" /></button></div>; })}
      {!rows.length && <p className="px-5 py-8 text-center text-slate-400 border-t">Chưa có công nợ nào.</p>}</Card></>;
}
