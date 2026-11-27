import { useState } from 'react';
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { usePlan } from '../planStore.js';
import { Building2, BedDouble, LayoutGrid, Clock, Percent, Printer, Coins, QrCode, FileUp, ConciergeBell, ShieldCheck, SlidersHorizontal, ChevronDown, Check, Palette, Network, Users, Workflow, Lock } from 'lucide-react';
import { Soon } from './Overview.jsx';

export const PMS_SET = [['Sơ đồ phòng', 'so-do-phong'], ['Cấu hình giờ', 'gio'], ['Thuế / Phí', 'thue-phi'], ['Máy in & Mẫu in', 'may-in'], ['Tỷ giá', 'ty-gia'], ['Thanh toán QRcode', 'qrcode'], ['Import dữ liệu', 'import'], ['Cấu hình dịch vụ', 'dich-vu']].map(([t, s]) => [t, '/settings/pms/' + s]);
export const MAP = [['Thông tin hiển thị', 'thong-tin'], ['Nhóm nguồn', 'nhom-nguon'], ['Phân khúc khách hàng', 'phan-khuc'], ['Phân loại khách hàng', 'hang-khach']].map(([t, s]) => [t, '/settings/pms/so-do-phong/' + s]);
const ALL_GROUPS = [['CHUNG', [['Hồ sơ khách sạn', '/hotel'], ['Cấu hình phòng', '/rooms']]], ['SƠ ĐỒ PHÒNG', MAP], ['PMS', PMS_SET.slice(1)], ['HỆ THỐNG', [['Phân quyền', '/roles']]]];
const HIDE_FREE = '/settings/pms/so-do-phong/hang-khach'; // gói Miễn phí không có phân loại khách hàng
const ICON = { '/hotel': Building2, '/rooms': BedDouble, 'thong-tin': LayoutGrid, mau: Palette, 'nhom-nguon': Network, 'phan-khuc': Users, 'hang-khach': Workflow, gio: Clock, 'thue-phi': Percent, 'may-in': Printer, 'ty-gia': Coins, qrcode: QrCode, import: FileUp, 'dich-vu': ConciergeBell, '/roles': ShieldCheck };
const iconOf = to => ICON[to] || ICON[to.split('/').pop()] || LayoutGrid;
export const SETTINGS_PATHS = ['/hotel', '/rooms', '/settings', '/roles'];

// Khung chung của mục Cài đặt: menu nhóm bên trái, nội dung bên phải
export const SettingsLayout = ({ children }) => {
  const free = usePlan() === 'free', GROUPS = ALL_GROUPS, lk = to => free && to === HIDE_FREE, { pathname } = useLocation(), nav = useNavigate(), [open, setOpen] = useState(false), on = p => pathname === p || pathname.startsWith(p + '/'), all = GROUPS.flatMap(g => g[1]), cur = all.find(([, to]) => on(to));
  if (free && pathname === HIDE_FREE) return <Navigate to={MAP[0][1]} replace />;
  return <div className="st">
    <div className="md:hidden mb-3"><div className="flex items-center gap-1.5 text-sm text-slate-500"><SlidersHorizontal className="w-4 h-4" />Cấu hình chung<span>›</span>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-brand/10 text-brand-dark font-semibold pl-3 pr-2 py-1 min-w-0"><span className="truncate">{cur?.[0] || 'Chọn mục'}</span><ChevronDown className="w-4 h-4 shrink-0" /></button></div>
      {open && <><div className="fixed inset-0 bg-black/40 z-40 anim-fade" onClick={() => setOpen(false)} />
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-3 pb-6 shadow-2xl anim-rise"><div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200" />
          {GROUPS.map(([g, items]) => <div key={g} className="mb-2"><div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-[.14em] text-slate-400">{g}</div>
            {items.map(([t, to]) => { const I = iconOf(to), act = on(to); if (lk(to)) return <NavLink key={to} to="/plans" title="Nâng cấp gói để sử dụng" onClick={() => setOpen(false)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] text-slate-300"><I className="w-4 h-4 shrink-0" /><span className="flex-1">{t}</span><Lock className="w-4 h-4" /></NavLink>; return <button key={to} type="button" onClick={() => { setOpen(false); nav(to); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] text-left ${act ? 'bg-brand/10 text-brand-dark font-semibold' : 'text-slate-700'}`}><I className={`w-4 h-4 shrink-0 ${act ? 'text-brand-dark' : 'text-slate-400'}`} /><span className="flex-1">{t}</span>{act && <Check className="w-4 h-4" />}</button>; })}</div>)}</div></>}</div>
    <div className="flex gap-7 items-start">
      <nav className="max-md:hidden w-60 shrink-0 sticky top-[68px] bg-white rounded-2xl border border-slate-200/70 shadow-[0_10px_28px_-16px_rgba(20,33,61,.25)] p-3 max-h-[calc(100vh-84px)] overflow-y-auto">{GROUPS.map(([g, items]) => <div key={g} className="mb-3 last:mb-0">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-[.14em] text-slate-400">{g}</div>
        {items.map(([t, to]) => { const I = iconOf(to), act = on(to); if (lk(to)) return <NavLink key={to} to="/plans" title="Nâng cấp gói để sử dụng" className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] text-slate-300 hover:bg-slate-50 whitespace-nowrap"><I className="w-4 h-4 shrink-0" /><span className="flex-1 truncate">{t}</span><Lock className="w-4 h-4 shrink-0" /></NavLink>; return <NavLink key={to} to={to} className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${act ? 'bg-brand/10 text-brand-dark font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'}`}>
          {act && <i className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand" />}<I className={`w-4 h-4 shrink-0 ${act ? 'text-brand-dark' : 'text-slate-400'}`} />{t}</NavLink>; })}</div>)}</nav>
      <div className="flex-1 min-w-0 anim-rise" key={pathname}>{children}</div></div>
  </div>;
};
export const SettingsSoon = ({ t }) => <SettingsLayout><Soon t={t} bare /></SettingsLayout>;
