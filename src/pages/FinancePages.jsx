import { useState } from 'react';
import { Ban, Download, FileText, Mail, Plug, Search, Send } from 'lucide-react';
import { money } from '../store.jsx';
import { Btn, Card, Tabs, Title, toast } from '../ui.jsx';

// ponytail: dữ liệu mẫu, chỉ nằm trong state của trang (PMS chưa có backend) — nối API khi có PMS
const BADGE = { 'Nháp': 'bg-slate-100 text-slate-600', 'Đã phát hành': 'bg-navy-700/10 text-ink', 'Chờ phát hành': 'bg-slate-100 text-slate-600', 'Đã gửi': 'bg-brand/10 text-brand-dark', 'Đã thanh toán': 'bg-brand text-white', 'Huỷ': 'bg-red-50 text-red-600', 'Đã huỷ': 'bg-red-50 text-red-600' };
const Badge = ({ s }) => <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${BADGE[s]}`}>{s}</span>;
const vnd = n => money(n) + 'đ';
const dmy = s => s.split('-').reverse().join('/');
const Th = ({ children, right }) => <th className={`px-4 py-3 text-xs font-semibold text-slate-500 ${right ? 'text-right' : 'text-left'}`}>{children}</th>;

/* ---------------- Hóa đơn ---------------- */
const mk = (n, d, total, st, who = '') => ({ id: `1C26TBH-${n}`, d, who, total, st, type: 'Thường' });
const INV = [mk(3, '2026-11-17', 1100000, 'Đã phát hành'), mk(2, '2026-11-12', 520000, 'Đã thanh toán', 'Nguyễn Văn A'), mk(1, '2026-11-11', 440000, 'Nháp')];
const INV_TABS = ['Tất cả', 'Nháp', 'Đã phát hành', 'Đã gửi', 'Đã thanh toán', 'Huỷ'];

export function Invoices() {
  const [tab, setTab] = useState('Tất cả'), [q, setQ] = useState(''), [f, setF] = useState(''), [t, setT] = useState('');
  const rows = INV.filter(r => (tab === 'Tất cả' || r.st === tab) && (r.id + r.who).toLowerCase().includes(q.toLowerCase()) && (!f || r.d >= f) && (!t || r.d <= t));
  return <><Title keep t="Hoá đơn" sub="Quản lý hóa đơn của khách sạn." />
    <Tabs value={tab} onChange={setTab} items={INV_TABS.map(x => [x, x])} />
    <div className="flex gap-3 mb-4"><label className="relative flex-1"><Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input className="field !pl-10" placeholder="Tìm số hoá đơn, tên khách..." value={q} onChange={e => setQ(e.target.value)} /></label>
      <input type="date" className="field !w-44" value={f} onChange={e => setF(e.target.value)} /><input type="date" className="field !w-44" value={t} min={f} onChange={e => setT(e.target.value)} /></div>
    <Card className="overflow-hidden"><table className="w-full text-sm"><thead className="border-b"><tr><Th>Số HĐ</Th><Th>Ngày</Th><Th>Khách / Công ty</Th><Th>Trạng thái</Th><Th right>Tổng</Th><Th right>Loại</Th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50/70"><td className="px-4 py-3.5 font-semibold"><FileText className="w-4 h-4 inline mr-2 text-slate-400" />{r.id}</td><td className="px-4 text-slate-500">{dmy(r.d)}</td><td className="px-4">{r.who || '—'}</td>
        <td className="px-4"><Badge s={r.st} /></td><td className="px-4 text-right font-semibold">{vnd(r.total)}</td><td className="px-4 text-right text-slate-400">{r.type}</td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="text-center text-slate-400 py-12">Không có hoá đơn phù hợp</td></tr>}</tbody></table></Card></>;
}

/* ---------------- Hóa đơn điện tử ---------------- */
const PROVIDERS = ['MISA meInvoice', 'Viettel S-Invoice', 'VNPT Invoice', 'FPT eInvoice', 'BKAV eHoadon', 'Easy Invoice'];
const E0 = [
  { id: 'E1', no: '00000124', ser: '1C26TAA', d: '2026-11-17', who: 'Công ty TNHH ABC', mst: '0312345678', total: 1100000, st: 'Đã phát hành', cqt: 'A1B2C3D4E5F6' },
  { id: 'E2', no: '00000123', ser: '1C26TAA', d: '2026-11-12', who: 'Nguyễn Văn A', mst: '', total: 520000, st: 'Đã gửi', cqt: 'F6E5D4C3B2A1' },
  { id: 'E3', no: '—', ser: '1C26TAA', d: '2026-11-18', who: 'Công ty CP XYZ', mst: '0109876543', total: 4400000, st: 'Chờ phát hành', cqt: '' }];
const E_TABS = ['Tất cả', 'Chờ phát hành', 'Đã phát hành', 'Đã gửi', 'Đã huỷ'];

export function EInvoices() {
  const [cfg, setCfg] = useState({ prov: PROVIDERS[0], mst: '', form: '1', ser: '1C26TAA', user: '', key: '' }), [on, setOn] = useState(false), [rows, setRows] = useState(E0), [tab, setTab] = useState('Tất cả'), [q, setQ] = useState('');
  const list = rows.filter(r => (tab === 'Tất cả' || r.st === tab) && (r.no + r.who + r.mst).toLowerCase().includes(q.toLowerCase()));
  const patch = (id, p) => setRows(rows.map(r => r.id === id ? { ...r, ...p } : r));
  const connect = () => { if (!cfg.mst.trim() || !cfg.user.trim() || !cfg.key.trim()) return toast('Nhập đủ MST, tài khoản và khóa API', true); setOn(true); toast('Đã lưu cấu hình nhà cung cấp'); };
  const need = () => { toast('Cần kết nối nhà cung cấp hóa đơn điện tử trước', true); return true; };
  const issue = r => { if (!on && need()) return; const n = Math.max(0, ...rows.map(x => +x.no || 0)) + 1; patch(r.id, { st: 'Đã phát hành', no: String(n).padStart(8, '0'), cqt: Math.random().toString(36).slice(2, 14).toUpperCase() }); toast('Đã phát hành hóa đơn'); };
  const Act = ({ I, t, ...p }) => <button type="button" title={t} className="w-8 h-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-ink" {...p}><I className="w-4 h-4" /></button>;
  const F = ({ l, k, ph, type }) => <label className="block"><span className="block text-xs text-slate-600 mb-1.5">{l}</span><input type={type} className="field" placeholder={ph} value={cfg[k]} onChange={e => setCfg({ ...cfg, [k]: e.target.value })} /></label>;
  return <><Title keep t="Hóa đơn điện tử" sub="Phát hành, gửi và quản lý hóa đơn điện tử theo quy định của cơ quan thuế." />
    <Card className="p-6 mb-5"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-ink">Kết nối nhà cung cấp</h3>
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${on ? 'bg-brand/10 text-brand-dark' : 'bg-slate-100 text-slate-500'}`}><i className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-brand' : 'bg-slate-400'}`} />{on ? 'Đã kết nối' : 'Chưa kết nối'}</span></div>
      <div className="grid grid-cols-4 gap-4"><label className="block"><span className="block text-xs text-slate-600 mb-1.5">Nhà cung cấp</span><select className="field" value={cfg.prov} onChange={e => setCfg({ ...cfg, prov: e.target.value })}>{PROVIDERS.map(p => <option key={p}>{p}</option>)}</select></label>
        <F l="Mã số thuế" k="mst" ph="VD: 0312345678" /><F l="Mẫu số" k="form" ph="1" /><F l="Ký hiệu" k="ser" ph="1C26TAA" /><F l="Tài khoản" k="user" ph="Tên đăng nhập" /><F l="Khóa API" k="key" ph="••••••••" type="password" /></div>
      <div className="flex gap-2 mt-5"><Btn onClick={connect}><Plug className="w-4 h-4 mr-2 inline" />{on ? 'Cập nhật kết nối' : 'Lưu & kết nối'}</Btn>{on && <Btn kind="ghost" onClick={() => { setOn(false); toast('Đã ngắt kết nối'); }}>Ngắt kết nối</Btn>}</div></Card>
    <Tabs value={tab} onChange={setTab} items={E_TABS.map(x => [x, x])} />
    <label className="relative block mb-4"><Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" /><input className="field !pl-10" placeholder="Tìm số hóa đơn, tên khách, mã số thuế..." value={q} onChange={e => setQ(e.target.value)} /></label>
    <Card className="overflow-hidden"><table className="w-full text-sm"><thead className="border-b"><tr><Th>Số HĐĐT</Th><Th>Ký hiệu</Th><Th>Ngày</Th><Th>Khách / Công ty</Th><Th>Trạng thái</Th><Th>Mã CQT</Th><Th right>Tổng</Th><Th right>Thao tác</Th></tr></thead>
      <tbody>{list.map(r => <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50/70"><td className="px-4 py-3.5 font-semibold">{r.no}</td><td className="px-4 text-slate-500">{r.ser}</td><td className="px-4 text-slate-500">{dmy(r.d)}</td>
        <td className="px-4"><div>{r.who}</div>{r.mst && <div className="text-xs text-slate-400">MST {r.mst}</div>}</td><td className="px-4"><Badge s={r.st} /></td><td className="px-4 text-xs text-slate-500 font-mono">{r.cqt || '—'}</td><td className="px-4 text-right font-semibold">{vnd(r.total)}</td>
        <td className="px-4"><div className="flex justify-end">{r.st === 'Chờ phát hành' && <Act I={Send} t="Phát hành" onClick={() => issue(r)} />}
          {['Đã phát hành', 'Đã gửi'].includes(r.st) && <><Act I={Mail} t="Gửi email cho khách" onClick={() => { patch(r.id, { st: 'Đã gửi' }); toast('Đã gửi hóa đơn cho khách'); }} /><Act I={Download} t="Tải XML / PDF" onClick={() => toast('Chưa kết nối nhà cung cấp nên chưa tải được file', true)} /><Act I={Ban} t="Huỷ hóa đơn" onClick={() => { if (!on && need()) return; patch(r.id, { st: 'Đã huỷ' }); toast('Đã huỷ hóa đơn'); }} /></>}</div></td></tr>)}
        {!list.length && <tr><td colSpan={8} className="text-center text-slate-400 py-12">Không có hóa đơn phù hợp</td></tr>}</tbody></table></Card></>;
}
