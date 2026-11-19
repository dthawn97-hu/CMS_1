import { useState } from 'react';
import { NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { PanelLeft, BellRing, Building2, CalendarDays, ChevronDown, ChevronRight, Inbox, Link2, Settings, TrendingUp } from 'lucide-react';
import { DBProvider, useDB } from './store.jsx';
import { Toaster } from './ui.jsx';
import { Sales, Bulk } from './pages/Calendar.jsx';
import Sync from './pages/Sync.jsx';
import Booking from './pages/Booking.jsx';
import { Smart, Dynamic, DynamicForm } from './pages/Revenue.jsx';
import { Account, Hotel, Rooms, RoomForm, Policies, PolicyForm } from './pages/Config.jsx';

const NAV = [
  ['Lịch phòng', CalendarDays, [['Bán phòng', '/sales'], ['Cập nhật hàng loạt', '/bulk']]],
  ['Đặt phòng', Inbox, '/booking'], ['Đồng bộ CMS', Link2, '/sync'],
  ['Quản lý doanh thu', TrendingUp, [['Giá thông minh', '/smart'], ['Định giá linh động', '/dynamic']]],
  ['Cấu hình', Settings, [['Thông tin tài khoản', '/account'], ['Thông tin khách sạn', '/hotel'], ['Cấu hình Phòng & Giá', '/rooms'], ['Chính sách giá', '/policies']]]
];

function Sidebar({ open }) {
  const { pathname } = useLocation(), { db } = useDB(), act = p => pathname === p || pathname.startsWith(p + '/');
  const ini = (db.account.ho_va_ten || 'NN').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  return <aside className={`${open ? 'w-[232px]' : 'w-[68px]'} transition-[width] duration-200 shrink-0 bg-navy-900 text-slate-300 flex flex-col sticky top-0 h-screen overflow-y-auto`}>
    <div className="px-5 py-4 whitespace-nowrap text-white text-xl font-bold flex items-center gap-2.5"><span className="w-8 h-8 rounded-lg bg-white grid place-items-center text-navy-900"><BellRing className="w-5 h-5" strokeWidth={2.2} /></span>{open && ' bellhop'}</div>
    {open && <div className="px-4 mt-1 text-[10px] tracking-widest text-slate-400">KHÁCH SẠN</div>}
    {open && <div className="mx-3 mt-1.5 mb-4 border border-white/20 rounded-lg px-3 py-2 text-white text-[13px] font-semibold flex justify-between gap-2"><span className="truncate">{db.hotel.ten_khach_san || '—'}</span><ChevronDown className="w-4 h-4" /></div>}
    {open && <div className="px-4 mb-1.5 text-[10px] tracking-widest text-slate-400">BELLHOP EXTRANET</div>}
    <nav className="px-2.5 flex-1 space-y-0.5">{NAV.map(([t, Icon, x]) => {
      const kids = Array.isArray(x), on = kids ? x.some(k => act(k[1])) : act(x);
      return <div key={t}>
        <NavLink title={t} to={kids ? x[0][1] : x} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] ${on ? 'bg-navy-700 text-white' : 'hover:bg-navy-800'}`}>
          <Icon className="w-[18px] h-[18px]" />{open && <span className="flex-1">{t}</span>}{open && kids && (on ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}</NavLink>
        {open && kids && on && <div className="ml-5 border-l border-white/10 pl-2.5 space-y-0.5 mt-1">{x.map(([n, to]) =>
          <NavLink key={to} to={to} className={`block px-3 py-1.5 rounded-lg text-[13px] ${act(to) ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}>{n}</NavLink>)}</div>}</div>; })}</nav>
    <div className="p-3 border-t border-white/10 flex items-center gap-2.5 text-[13px]"><div className="w-8 h-8 rounded-full bg-ink text-white grid place-items-center text-xs font-bold">{ini}</div>
      {open && <div className="leading-tight"><div className="text-white font-semibold">{db.account.ho_va_ten}</div><div className="text-xs text-slate-400">Chủ khách sạn</div></div>}</div>
  </aside>;
}


export default function App() {
  const { pathname } = useLocation(), [open, setOpen] = useState(true);
  return <DBProvider>
    <div className="flex min-h-screen"><Sidebar open={open} />
      <main className="flex-1 min-w-0 p-8 relative"><button type="button" title="Đóng/mở menu" onClick={() => setOpen(o => !o)} className="absolute top-1.5 left-1.5 z-50 p-1 rounded text-slate-400 hover:text-ink hover:bg-slate-200"><PanelLeft className="w-4 h-4" /></button><div key={pathname} className="anim-rise"><Routes>
        <Route path="/" element={<Navigate to="/sales" replace />} />
        <Route path="/sales" element={<Sales />} /><Route path="/bulk" element={<Bulk />} />
        <Route path="/booking" element={<Booking />} /><Route path="/sync" element={<Sync />} />
        <Route path="/smart" element={<Smart />} />
        <Route path="/dynamic" element={<Dynamic />} /><Route path="/dynamic/new" element={<DynamicForm />} /><Route path="/dynamic/edit/:id" element={<DynamicForm />} />
        <Route path="/account" element={<Account />} /><Route path="/hotel" element={<Hotel />} />
        <Route path="/rooms" element={<Rooms />} /><Route path="/rooms/new" element={<RoomForm />} /><Route path="/rooms/edit/:id" element={<RoomForm />} />
        <Route path="/policies" element={<Policies />} /><Route path="/policies/new" element={<PolicyForm />} /><Route path="/policies/edit/:id" element={<PolicyForm />} />
        <Route path="*" element={<Navigate to="/sales" replace />} />
      </Routes></div></main></div>
    <Toaster />
  </DBProvider>;
}
