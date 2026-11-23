import { useState, useEffect } from 'react';
import { Link, NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CalendarCheck, LayoutGrid, Users, BedDouble, UtensilsCrossed, ShoppingCart, ClipboardList, BarChart3, LayoutDashboard, Briefcase, Wallet, SlidersHorizontal, Package, PanelLeft, Bell, LogOut, UserRound, BellRing, Building2, CalendarDays, ChevronDown, ChevronRight, Inbox, Link2, TrendingUp } from 'lucide-react';
import { DBProvider, useDB } from './store.jsx';
import { Toaster, MobileDatePicker, MobileSelectSheet, ask, toast } from './ui.jsx';
import { Sales, Bulk } from './pages/Calendar.jsx';
import Sync from './pages/Sync.jsx';
import Booking from './pages/Booking.jsx';
import Plans from './pages/Plans.jsx';
import HoursSettings from './pages/HoursSettings.jsx';
import { Rates, QrPay, ImportData, Services } from './pages/PmsPages.jsx';
import PrintSettings from './pages/PrintSettings.jsx';
import TaxSettings from './pages/TaxSettings.jsx';
import { RoomMap, Sources, Segments, Tiers } from './pages/RoomMapSettings.jsx';
import { SettingsLayout as SL, SettingsSoon, PMS_SET, MAP, SETTINGS_PATHS } from './pages/Settings.jsx';
import { Invoices, EInvoices } from './pages/FinancePages.jsx';
import { CashConfig, CashBook } from './pages/FinanceCash.jsx';
import { CashFund, BankFund } from './pages/FinanceFunds.jsx';
import Shift from './pages/ShiftPage.jsx';
import { GeneralStats, OpsStats } from './pages/StatsPages.jsx';
import { Revenue, Reports } from './pages/RevenuePages.jsx';
import { Bookings, Guests, Groups } from './pages/PmsLists.jsx';
import Housekeeping from './pages/Housekeeping.jsx';
import FrontDesk from './pages/FrontDesk.jsx';
import FnB from './pages/FnB.jsx';
import { StockConfig, StockOps } from './pages/Warehouse.jsx';
import Purchasing from './pages/Purchasing.jsx';
import { PosInvoice, Campaigns, SmtpConfig } from './pages/SalesPages.jsx';
import EmailHistory from './pages/EmailHistory.jsx';
import Overview, { Soon } from './pages/Overview.jsx';
import { Smart, Dynamic, DynamicForm } from './pages/Revenue.jsx';
import { Account, Hotel, Rooms, RoomForm, Policies, PolicyForm } from './pages/Config.jsx';

const sub = (p, a) => a.map(t => [t, p + '/' + t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z]+/g, '-').replace(/-$/, '')]);
const PMS_OPS = sub('/pms', ['Front desk', 'Sơ đồ phòng', 'Đặt phòng', 'Quản lý khách', 'Buồng phòng', 'F&B', 'Quản lý kho', 'Bán hàng & Marketing']),
  FIN_T = sub('/pms/tai-chinh', ['Hóa đơn', 'Hóa đơn điện tử', 'Cấu hình Thu/Chi', 'Sổ sách', 'Quỹ tiền mặt', 'Quỹ tiền gửi']), FIN_A = sub('/pms/phan-tich', ['Thống kê chung', 'Thống kê vận hành', 'Doanh thu', 'Báo cáo']), SHIFT = ['/pms/ban-giao-ca'], GUESTS = sub('/pms/quan-ly-khach', ['Danh sách khách', 'Danh sách đoàn']), STOCK = sub('/pms/quan-ly-kho', ['Cấu hình kho', 'Quản lý kho', 'Quản lý mua hàng']),
  SALES = [['Tạo hóa đơn', '/pms/ban-hang/tao-hoa-don'], ['Tiếp thị Email', [['Chiến dịch Email', '/pms/ban-hang/email/chien-dich'], ['Lịch sử', '/pms/ban-hang/email/lich-su'], ['Cấu hình', '/pms/ban-hang/email/cau-hinh']]]];
const leaves = x => x.flatMap(k => Array.isArray(k[1]) ? leaves(k[1]) : [k[1]]);
// Navbar 3 phần: mở (Tổng quan) · thân (PMS + CMS) · kết (Cấu hình)
const NAV = [
  [null, [['Tổng quan', LayoutDashboard, '/overview']]],
  ['PMS - VẬN HÀNH', [['Front Desk', CalendarCheck, PMS_OPS[0][1]], ['Sơ đồ phòng', LayoutGrid, PMS_OPS[1][1]], ['Đặt phòng', ClipboardList, PMS_OPS[2][1]], ['Quản lý khách', Users, GUESTS], ['Buồng phòng', BedDouble, PMS_OPS[4][1]], ['F&B', UtensilsCrossed, PMS_OPS[5][1]], ['Quản lý kho', Package, STOCK], ['Bán hàng & Marketing', ShoppingCart, SALES]]],
  ['TÀI CHÍNH & BÁO CÁO', [['Tài chính', Wallet, FIN_T], ['Bàn giao ca', ClipboardList, SHIFT[0]], ['Phân tích', BarChart3, FIN_A]]],
  ['CMS', [['Lịch phòng', CalendarDays, [['Bán phòng', '/sales'], ['Cập nhật hàng loạt', '/bulk']]],
    ['Đặt phòng OTA', Inbox, '/booking'], ['Đồng bộ CMS', Link2, '/sync'],
    ['Quản lý doanh thu', TrendingUp, [['Chính sách giá OTA', '/policies'], ['Giá thông minh', '/smart'], ['Định giá linh động', '/dynamic']]]]],
  ['CẤU HÌNH', [['Cài đặt', SlidersHorizontal, '/hotel', SETTINGS_PATHS], ["Gói dịch vụ", Package, "/plans"]], true]
];

function Sidebar({ open }) {
  const { pathname } = useLocation(), { db } = useDB(), act = p => pathname === p || pathname.startsWith(p + '/');
  return <aside className={`${open ? 'w-[264px]' : 'lg:w-[68px]'} max-lg:w-[264px] max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:transition-transform ${open ? '' : 'max-lg:-translate-x-full'} lg:transition-[width] duration-200 shrink-0 bg-navy-900 text-slate-300 flex flex-col sticky top-0 h-screen overflow-y-auto overflow-x-hidden no-sb`}>
    <div className={`py-4 whitespace-nowrap text-white text-xl font-bold flex items-center gap-2.5 ${open ? "px-5" : "lg:justify-center lg:px-0 px-5"}`}><span className="w-8 h-8 rounded-lg bg-white grid place-items-center text-navy-900"><BellRing className="w-5 h-5" strokeWidth={2.2} /></span>{open && ' bellhop'}</div>
    {open && <div className="px-4 mt-1 text-[11px] font-semibold tracking-widest text-slate-300">KHÁCH SẠN</div>}
    {open && <div className="mx-3 mt-1.5 mb-4 border border-white/20 rounded-lg px-3 py-2 text-white text-[13px] font-semibold flex justify-between gap-2"><span className="truncate">{db.hotel.ten_khach_san || '—'}</span><ChevronDown className="w-4 h-4" /></div>}
    <nav className={`${open ? "px-2.5" : "lg:px-2"} flex-1 flex flex-col`}>{NAV.map(([lbl, items, end]) => <div key={lbl || 'top'} className={`space-y-0.5 ${end ? 'mt-auto pt-3 pb-3 border-t border-white/10' : 'mb-3'}`}>
      {open && lbl && !end && <div className="px-3 pt-1 pb-1 text-[11px] font-semibold tracking-widest text-slate-300">{lbl}</div>}
      {items.map(([t, Icon, x, m]) => {
      const kids = Array.isArray(x), on = kids ? leaves(x).some(act) : (m || [x]).some(act);
      return <div key={t}>
        <NavLink title={t} to={kids ? leaves(x)[0] : x} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${open ? "" : "lg:justify-center lg:px-0 lg:py-3"} ${on ? 'bg-navy-700 text-white font-semibold shadow-[inset_3px_0_0_#2bb3c6]' : 'hover:bg-navy-800'}`}>
          <Icon className="w-[18px] h-[18px]" />{open && <span className="flex-1 truncate whitespace-nowrap">{t}</span>}{open && kids && (on ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}</NavLink>
        {open && kids && on && <div className="ml-5 border-l border-white/10 pl-2.5 space-y-0.5 mt-1">{x.map(([n, to]) => Array.isArray(to) ? <div key={n}><NavLink to={leaves(to)[0]} className={`flex items-center whitespace-nowrap px-3 py-2 rounded-lg text-sm ${leaves(to).some(act) ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}><span className="flex-1 truncate">{n}</span>{leaves(to).some(act) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</NavLink>
          {leaves(to).some(act) && <div className="ml-3 border-l border-white/10 pl-2 space-y-0.5 mt-0.5">{to.map(([n2, t2]) => <NavLink key={t2} to={t2} className={`block truncate whitespace-nowrap px-3 py-2 rounded-lg text-sm ${act(t2) ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}>{n2}</NavLink>)}</div>}</div>
          : <NavLink key={to} to={to} className={`block truncate whitespace-nowrap px-3 py-2 rounded-lg text-sm ${act(to) ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}>{n}</NavLink>)}</div>}</div>; })}</div>)}</nav>
  </aside>;
}

function Header({ onToggle }) {
  const { db } = useDB(), name = db.account.ho_va_ten || '', ini = (name || 'NN').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  return <header className="sticky top-0 z-40 h-14 shrink-0 bg-white border-b border-slate-200 px-4 flex items-center gap-3">
    <button type="button" title="Đóng/mở menu" onClick={onToggle} className="p-1.5 rounded text-slate-500 hover:text-ink hover:bg-slate-100"><PanelLeft className="w-5 h-5" /></button>
    <span className="text-sm text-slate-600 hidden lg:block">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><div className="flex-1" />
    <details className="relative"><summary title="Thông báo" className="list-none cursor-pointer w-9 h-9 grid place-items-center rounded-full text-slate-500 hover:bg-slate-100"><Bell className="w-5 h-5" /></summary>
      <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white shadow-xl"><div className="px-4 py-3 border-b font-semibold text-ink">Thông báo</div><p className="px-4 py-6 text-center text-sm text-slate-400">Chưa có thông báo mới</p></div></details>
    <details className="relative" onBlur={e => !e.currentTarget.contains(e.relatedTarget) && (e.currentTarget.open = false)}>
      <summary title="Tài khoản" className="list-none cursor-pointer flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-80"><div className="w-8 h-8 rounded-full bg-ink text-white grid place-items-center text-xs font-bold">{ini}</div>
        <div className="leading-tight text-[13px] hidden sm:block"><div className="font-semibold text-ink">{name}</div><div className="text-xs text-slate-500">Chủ khách sạn</div></div><ChevronDown className="w-4 h-4 text-slate-400" /></summary>
      <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl py-1.5 text-sm" onClick={e => e.currentTarget.parentNode.open = false}>
        <div className="flex items-center gap-3 px-4 py-3"><div className="w-10 h-10 rounded-lg bg-ink text-white grid place-items-center font-bold">{ini}</div><div className="min-w-0"><div className="font-bold text-ink truncate">{name}</div><div className="text-xs text-slate-500 truncate">{db.account.email}</div></div></div>
        <div className="border-t my-1" />
        {[['/account', UserRound, 'Thông tin tài khoản']].map(([to, I, l]) => <Link key={to} to={to} className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50"><I className="w-4 h-4 text-slate-500" />{l}</Link>)}
        <div className="border-t my-1" />
        <button type="button" className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50" onClick={async () => { if (await ask('Bạn muốn đăng xuất khỏi Bellhop?', { title: 'Đăng xuất?', ok: 'Đăng xuất' })) toast('Chưa có hệ thống đăng nhập nên chưa đăng xuất được', true); }}><LogOut className="w-4 h-4 text-slate-500" />Đăng xuất</button></div></details>
  </header>;
}

export default function App() {
  const { pathname } = useLocation(), [open, setOpen] = useState(() => window.innerWidth >= 1280);
  useEffect(() => { if (window.innerWidth < 1024) setOpen(false); }, [pathname]);
  return <DBProvider>
    <div className="flex min-h-screen"><Sidebar open={open} />{open && <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40" onClick={() => setOpen(false)} />}
      <div className="flex-1 min-w-0 flex flex-col"><Header onToggle={() => setOpen(o => !o)} /><main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8"><div key={pathname} className="anim-rise"><Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} /><Route path="/plans" element={<Plans />} /><Route path="/roles" element={<SettingsSoon t="Phân quyền" />} />
        {PMS_SET.slice(1).map(([t, to]) => <Route key={to} path={to} element={to.endsWith('/gio') ? <SL><HoursSettings /></SL> : to.endsWith('/ty-gia') ? <SL><Rates /></SL> : to.endsWith('/qrcode') ? <SL><QrPay /></SL> : to.endsWith('/import') ? <SL><ImportData /></SL> : to.endsWith('/dich-vu') ? <SL><Services /></SL> : to.endsWith('/may-in') ? <SL><PrintSettings /></SL> : to.endsWith('/thue-phi') ? <SL><TaxSettings /></SL> : <SettingsSoon t={t} />} />)}
        {MAP.map(([, to], i) => <Route key={to} path={to} element={<SL>{[<RoomMap sub="info" />, <RoomMap sub="color" />, <Sources />, <Segments />, <Tiers />][i]}</SL>} />)}<Route path="/settings/pms/so-do-phong" element={<Navigate to={MAP[0][1]} replace />} /><Route path="/settings" element={<Navigate to="/hotel" replace />} />
        {PMS_OPS.filter((_, i) => ![0, 1, 2, 3, 4, 5, 6, 7].includes(i)).map(([t, to]) => <Route key={to} path={to} element={<Soon t={t} />} />)}
        <Route path={FIN_T[0][1]} element={<Invoices />} /><Route path={FIN_T[1][1]} element={<EInvoices />} /><Route path={FIN_T[2][1]} element={<CashConfig />} /><Route path={FIN_T[3][1]} element={<CashBook />} /><Route path={PMS_OPS[0][1]} element={<FrontDesk />} /><Route path={PMS_OPS[1][1]} element={<FrontDesk start="map" />} /><Route path={PMS_OPS[2][1]} element={<Bookings />} /><Route path={PMS_OPS[4][1]} element={<Housekeeping />} /><Route path={PMS_OPS[5][1]} element={<FnB />} /><Route path={PMS_OPS[6][1]} element={<Navigate to={STOCK[0][1]} replace />} /><Route path={PMS_OPS[7][1]} element={<Navigate to={SALES[0][1]} replace />} /><Route path={SALES[0][1]} element={<PosInvoice />} /><Route path={SALES[1][1][0][1]} element={<Campaigns />} /><Route path={SALES[1][1][1][1]} element={<EmailHistory />} /><Route path={SALES[1][1][2][1]} element={<SmtpConfig />} /><Route path={STOCK[0][1]} element={<StockConfig />} /><Route path={STOCK[1][1]} element={<StockOps />} /><Route path={STOCK[2][1]} element={<Purchasing />} /><Route path={GUESTS[0][1]} element={<Guests />} /><Route path={GUESTS[1][1]} element={<Groups />} /><Route path={PMS_OPS[3][1]} element={<Navigate to={GUESTS[0][1]} replace />} /><Route path={SHIFT[0]} element={<Shift />} /><Route path={FIN_A[0][1]} element={<GeneralStats />} /><Route path={FIN_A[1][1]} element={<OpsStats />} /><Route path={FIN_A[2][1]} element={<Revenue />} /><Route path={FIN_A[3][1]} element={<Reports />} /><Route path={FIN_T[4][1]} element={<CashFund />} /><Route path={FIN_T[5][1]} element={<BankFund />} />
        <Route path="/sales" element={<Sales />} /><Route path="/bulk" element={<Bulk />} />
        <Route path="/booking" element={<Booking />} /><Route path="/sync" element={<Sync />} />
        <Route path="/smart" element={<Smart />} />
        <Route path="/dynamic" element={<Dynamic />} /><Route path="/dynamic/new" element={<DynamicForm />} /><Route path="/dynamic/edit/:id" element={<DynamicForm />} />
        <Route path="/account" element={<Account />} /><Route path="/hotel" element={<SL><Hotel /></SL>} />
        <Route path="/rooms" element={<SL><Rooms /></SL>} /><Route path="/rooms/new" element={<RoomForm />} /><Route path="/rooms/edit/:id" element={<RoomForm />} />
        <Route path="/policies" element={<Policies />} /><Route path="/policies/new" element={<PolicyForm />} /><Route path="/policies/edit/:id" element={<PolicyForm />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes></div></main></div></div>
    <Toaster /><MobileDatePicker /><MobileSelectSheet />
  </DBProvider>;
}
