import { NavLink, useLocation } from 'react-router-dom';
import { Building2, BedDouble, LayoutGrid, Clock, Percent, Printer, Coins, QrCode, FileUp, ConciergeBell, ShieldCheck, Palette, Network, Users, Workflow } from 'lucide-react';
import { Soon } from './Overview.jsx';

export const PMS_SET = [['Sơ đồ phòng', 'so-do-phong'], ['Cấu hình giờ', 'gio'], ['Thuế / Phí', 'thue-phi'], ['Máy in & Mẫu in', 'may-in'], ['Tỷ giá', 'ty-gia'], ['Thanh toán QRcode', 'qrcode'], ['Import dữ liệu', 'import'], ['Cấu hình dịch vụ', 'dich-vu']].map(([t, s]) => [t, '/settings/pms/' + s]);
export const MAP = [['Thông tin hiển thị', 'thong-tin'], ['Màu đặt phòng', 'mau'], ['Nhóm nguồn', 'nhom-nguon'], ['Phân khúc khách hàng', 'phan-khuc'], ['Phân loại khách hàng', 'hang-khach']].map(([t, s]) => [t, '/settings/pms/so-do-phong/' + s]);
const GROUPS = [['CHUNG', [['Hồ sơ khách sạn', '/hotel'], ['Cấu hình phòng', '/rooms']]], ['SƠ ĐỒ PHÒNG', MAP], ['PMS', PMS_SET.slice(1)], ['HỆ THỐNG', [['Phân quyền', '/roles']]]];
const ICON = { '/hotel': Building2, '/rooms': BedDouble, 'thong-tin': LayoutGrid, mau: Palette, 'nhom-nguon': Network, 'phan-khuc': Users, 'hang-khach': Workflow, gio: Clock, 'thue-phi': Percent, 'may-in': Printer, 'ty-gia': Coins, qrcode: QrCode, import: FileUp, 'dich-vu': ConciergeBell, '/roles': ShieldCheck };
const iconOf = to => ICON[to] || ICON[to.split('/').pop()] || LayoutGrid;
export const SETTINGS_PATHS = ['/hotel', '/rooms', '/settings', '/roles'];

// Khung chung của mục Cài đặt: menu nhóm bên trái, nội dung bên phải
export const SettingsLayout = ({ children }) => {
  const { pathname } = useLocation(), on = p => pathname === p || pathname.startsWith(p + '/');
  return <div className="st">
    <div className="flex gap-7 items-start">
      <nav className="w-60 shrink-0 sticky top-20 bg-white rounded-2xl border border-slate-200/70 shadow-[0_10px_28px_-16px_rgba(20,33,61,.25)] p-3 max-h-[calc(100vh-110px)] overflow-y-auto">{GROUPS.map(([g, items]) => <div key={g} className="mb-3 last:mb-0">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-[.14em] text-slate-400">{g}</div>
        {items.map(([t, to]) => { const I = iconOf(to), act = on(to); return <NavLink key={to} to={to} className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${act ? 'bg-brand/10 text-brand-dark font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'}`}>
          {act && <i className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand" />}<I className={`w-4 h-4 shrink-0 ${act ? 'text-brand-dark' : 'text-slate-400'}`} />{t}</NavLink>; })}</div>)}</nav>
      <div className="flex-1 min-w-0 anim-rise" key={pathname}>{children}</div></div>
  </div>;
};
export const SettingsSoon = ({ t }) => <SettingsLayout><Soon t={t} bare /></SettingsLayout>;
