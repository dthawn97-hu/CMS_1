import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, Trash2, Upload, X, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, ChevronDown, Pencil, UtensilsCrossed, Infinity as InfIcon, Banknote } from 'lucide-react';
import { useCrud, useDB, money, DAYS } from '../store.jsx';
import { Btn, Title, Card, H2, Table, Pager, Toggle, Seg, SearchBox, RowActions, Input, Select, Area, FToggle, FCheck, Radios, Tabs, Back, Footer, useForm, toast } from '../ui.jsx';

/* ---------- Tài khoản & khách sạn (một bản ghi) ---------- */
function useSingleton(key) {
  const { db, commit } = useDB(), f = useForm(db[key]);
  return [f, async e => { e.preventDefault(); await commit(key, f.v); toast('Đã lưu thay đổi'); }];
}
const SaveBtn = () => <div className="text-right mt-5"><Btn type="submit">Lưu thay đổi</Btn></div>;

export function Account() {
  const [f, submit] = useSingleton('account'), pw = useForm({ cur: '', n1: '', n2: '' }), v = f.v;
  const ini = (v.ho_va_ten || 'NN').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  const changePw = e => { e.preventDefault(); const { cur, n1, n2 } = pw.v;
    if (!cur) return toast('Vui lòng nhập mật khẩu hiện tại', true);
    if (n1.length < 8) return toast('Mật khẩu mới phải có ít nhất 8 ký tự', true);
    if (n1 !== n2) return toast('Mật khẩu nhắc lại không khớp', true);
    pw.reset({ cur: '', n1: '', n2: '' }); toast('Đã đổi mật khẩu'); }; // ponytail: chưa có backend xác thực, chỉ kiểm tra form
  return <div className="space-y-5">
    <Card className="p-6 flex flex-wrap items-center gap-5">
      <div className="w-[72px] h-[72px] rounded-full bg-ink text-white grid place-items-center font-serif text-2xl font-bold shrink-0">{ini}</div>
      <div className="min-w-0 flex-1"><div className="font-serif text-xl font-bold text-ink truncate">{v.ho_va_ten || '—'}</div><div className="text-slate-500 truncate">{v.email || '—'}</div>
        <div className="flex flex-wrap gap-2 mt-2"><span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">Chủ khách sạn</span><span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">{v.nhom_nguoi_dung || 'Chưa phân loại'}</span></div></div></Card>
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,32%)] gap-5 items-stretch">
      <form onSubmit={submit} className="flex"><Card className="flex-1 flex flex-col"><div className="p-6 flex-1"><H2>Thông tin cá nhân</H2><p className="text-slate-500 text-sm -mt-2 mb-5">Cập nhật thông tin liên hệ và công việc của bạn</p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4"><Input label="Họ và tên *" req f={f} k="ho_va_ten" />
          <div><span className="lbl">Giới tính</span><Radios f={f} k="gioi_tinh" opts={['Nam', 'Nữ']} /></div>
          <Input label="Email *" req type="email" f={f} k="email" /><Input label="Số điện thoại *" req f={f} k="so_dien_thoai" />
          <div className="col-span-2"><Input label="Địa chỉ" ph="Số nhà, đường, quận/huyện, tỉnh/thành" f={f} k="dia_chi" /></div>
          <Select label="Nhóm người dùng" f={f} k="nhom_nguoi_dung" opts={[['', 'Không có'], ['Quản lý', 'Quản lý'], ['Lễ tân', 'Lễ tân'], ['Kế toán', 'Kế toán']]} />
          <Select label="Chức vụ" f={f} k="chuc_vu" opts={[['', 'Không có'], ['Chủ khách sạn', 'Chủ khách sạn'], ['Giám đốc', 'Giám đốc'], ['Nhân viên', 'Nhân viên']]} /></div></div>
        <div className="px-6 py-4 border-t bg-slate-50 rounded-b-xl flex justify-end"><Btn type="submit">Lưu thay đổi</Btn></div></Card></form>
      <form onSubmit={changePw} className="flex"><Card className="flex-1 flex flex-col"><div className="p-6 flex-1"><H2>Đổi mật khẩu</H2><p className="text-slate-500 text-sm -mt-2 mb-5">Để bảo mật tài khoản, bạn nên thay đổi mật khẩu định kỳ.</p>
        <div className="space-y-4"><Input label="Mật khẩu hiện tại *" type="password" ph="Nhập mật khẩu hiện tại" f={pw} k="cur" /><Input label="Mật khẩu mới (ít nhất 8 ký tự) *" type="password" ph="Nhập mật khẩu mới" f={pw} k="n1" /><Input label="Nhắc lại mật khẩu mới *" type="password" ph="Nhập lại mật khẩu mới" f={pw} k="n2" /></div></div>
        <div className="px-6 py-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-2"><Btn kind="ghost" onClick={() => pw.reset({ cur: '', n1: '', n2: '' })}>Huỷ</Btn><Btn type="submit">Cập nhật mật khẩu</Btn></div></Card></form>
    </div></div>;
}

const AMENITIES = ['Máy ATM tại chỗ', 'Mặt tiền biển', 'Trò chơi cờ bàn/xếp hình', 'Hộp mang đi bữa sáng', 'Kết nối truyền hình cáp', 'Kênh truyền hình thiếu nhi', 'Khu đốt lửa trại chung', 'Phòng tắm chung', 'Khu vực hút thuốc riêng', 'Đường đất', 'Nhân viên giải trí', 'Khu đốt lửa trại', 'Phòng thay đồ gym/spa', 'Chỗ đỗ xe nhà di động (RV) lùi vào', 'Dịch vụ làm đẹp', 'Thư viện sách/DVD/nhạc cho trẻ em', 'Phòng tân hôn', 'Nhà nguyện/đền thờ', 'Nhà câu lạc bộ', 'Nhà vệ sinh chung', 'Vòi nước uống chung', 'Bữa tối', 'Thang máy', 'Phòng gia đình', 'Thể dục', 'Bồn ngâm chân', 'Lễ tân 24 giờ', 'Điều hòa không khí', 'Hồ bơi', 'Nhà hàng', 'Wifi miễn phí', 'Xe đưa đón sân bay (phụ thu)'];
const HSec = ({ id, n, hint, right, wide, children }) => <section id={id} className={`scroll-mt-6 flex ${wide ? 'xl:col-span-2' : ''}`}><Card className="flex-1 min-w-0"><div className="flex items-start justify-between gap-4 px-6 max-md:px-4 pt-5 pb-4 border-b border-slate-100"><div><h3 className="font-serif font-bold text-ink">{n}</h3>{hint && <p className="text-sm text-slate-500 mt-0.5">{hint}</p>}</div>{right}</div><div className="p-6 max-md:p-4">{children}</div></Card></section>;
const G2 = 'grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4', GM = 'grid grid-cols-2 gap-x-3 md:gap-x-5 gap-y-4', G4 = 'grid grid-cols-2 xl:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-4', COLS = 'grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch';
const Count = ({ v, max }) => <div className="text-xs text-slate-400 mt-1 text-right">{(v || '').length}/{max}</div>;
const readImg = (file, max = 2e6) => new Promise((ok, no) => { if (file.size > max) return no(new Error('Ảnh tối đa 2MB')); const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(file); });
export function Hotel() {
  const [f, submit] = useSingleton('hotel'), { db } = useDB(), v = f.v, [q, setQ] = useState(''), [tab, setTab] = useState('gen');
  const dirty = JSON.stringify(v) !== JSON.stringify(db.hotel), totalRooms = db.rooms.reduce((n, r) => n + (+r.so_luong_phong || 0), 0);
  const picked = AMENITIES.filter(x => v['ti_' + x]).length, shown = AMENITIES.filter(x => x.toLowerCase().includes(q.toLowerCase()));
  const lat = parseFloat(v.vi_do) || 10.7769, lng = parseFloat(v.kinh_do) || 106.7009, wk = v.cuoi_tuan ?? [4, 5], hol = v.ngay_le ?? [], imgs = v.hinh_anh ?? [];
  const pick = async (key, files, multi) => { try { const list = await Promise.all([...files].slice(0, 8).map(x => readImg(x))); f.set(key, multi ? [...imgs, ...list].slice(0, 8) : list[0]); } catch (e) { toast(e.message || 'Không đọc được ảnh', true); } };
  return <form onSubmit={submit}>
    <div className="space-y-5 min-w-0">
      <Tabs value={tab} onChange={setTab} items={[['gen', 'Thông tin chung'], ['ops', 'Vận hành']]} />
      {tab === 'gen' && <div className={COLS}>
      <HSec id="hs-profile" n="Hồ sơ & liên hệ" hint="Thông tin cơ bản hiển thị trên các kênh OTA">
        <div className="flex items-center gap-4 mb-5 max-md:rounded-xl max-md:border max-md:border-dashed max-md:border-slate-200 max-md:bg-slate-50 max-md:p-3"><div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 grid place-items-center overflow-hidden text-xs text-slate-400">{v.logo ? <img src={v.logo} alt="Logo" className="w-full h-full object-cover" /> : 'Logo'}</div>
          <div><label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium cursor-pointer hover:bg-slate-50"><Upload className="w-4 h-4" />Tải ảnh lên<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={e => e.target.files[0] && pick('logo', e.target.files)} /></label><div className="text-xs text-slate-400 mt-1.5">JPG, PNG · Tối đa 2MB</div></div></div>
        <div className={G2}><Input label="Tên khách sạn *" req f={f} k="ten_khach_san" /><Select label="Loại hình kinh doanh *" f={f} k="loai_hinh" opts={['Khách sạn', 'Homestay', 'Resort', 'Căn hộ dịch vụ', 'Biệt thự', 'Hostel']} />
          <Input label="Số điện thoại *" req f={f} k="so_dien_thoai" /><Input label="Email liên hệ" type="email" f={f} k="email_lien_he" /><Input label="Website" ph="https://hotel.com" f={f} k="website" /><Input label="Trang đặt phòng" ph="https://booking.hotel.com" f={f} k="trang_dat_phong" />
          <Select label="Múi giờ *" f={f} k="mui_gio" opts={['Việt Nam (GMT+7)']} /></div></HSec>
      <HSec id="hs-address" n="Địa chỉ & bản đồ" hint="Vị trí chính xác giúp khách tìm đến và hiển thị đúng trên OTA">
        <div className={GM}><div className="col-span-2"><Area label="Địa chỉ *" rows={2} f={f} k="dia_chi" /></div>
          <Select label="Quốc gia *" f={f} k="quoc_gia" opts={['Việt Nam']} /><Select label="Tỉnh/Thành phố *" f={f} k="tinh_thanh" opts={['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bà Rịa - Vũng Tàu', 'Khánh Hòa', 'Lâm Đồng', 'Quảng Ninh']} />
          <Input label="Quận/Huyện" f={f} k="quan_huyen" /><div className="grid grid-cols-2 gap-4 max-md:contents"><Input label="Phường/Xã" f={f} k="phuong_xa" /><Input label="Mã bưu điện" ph="Ví dụ: 700000" className="max-md:col-span-2" f={f} k="ma_buu_dien" /></div></div>
        <div className="mt-4 grid grid-cols-1 gap-4"><div><span className="lbl">Vị trí trên bản đồ</span><iframe title="Bản đồ" className="w-full h-44 rounded-xl border border-slate-200" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.006},${lng + 0.01},${lat + 0.006}&layer=mapnik&marker=${lat},${lng}`} /></div>
          <div className="grid grid-cols-2 gap-3 md:gap-4"><Input label="Vĩ độ (Latitude)" f={f} k="vi_do" ph="10.7769" /><Input label="Kinh độ (Longitude)" f={f} k="kinh_do" ph="106.7009" /></div></div></HSec>
      <HSec wide id="hs-about" n="Mô tả & tiện ích" hint="Hiển thị trên các kênh OTA">
        <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"><div><Area label="Giới thiệu khách sạn" rows={4} ph="Giới thiệu ngắn gọn về khách sạn, hiển thị trên các kênh OTA" f={f} k="gioi_thieu" /></div><Area label="Thông tin quan trọng" rows={4} ph="Lưu ý khách cần biết trước khi đặt phòng (giờ nhận/trả phòng đặc biệt, giấy tờ yêu cầu…)" f={f} k="thong_tin_quan_trong" /></div>
          <div><div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-2 mb-1.5"><span className="lbl !mb-0">Tiện ích <span className="text-slate-400 font-normal">({picked} đã chọn)</span></span><div className="relative w-56 max-md:w-full"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field !py-1.5 !pl-9" placeholder="Tìm tiện ích…" value={q} onChange={e => setQ(e.target.value)} /></div></div>
            <div className="border border-slate-200 rounded-xl p-4 max-md:p-3 grid grid-cols-2 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-2.5 max-h-52 max-md:max-h-72 [&_label]:items-start [&_label]:leading-snug [&_label]:text-[13.5px] [&_input]:mt-[1px] [&_input]:shrink-0 overflow-y-auto">{shown.map(x => <FCheck key={x} f={f} k={'ti_' + x} label={x} />)}{!shown.length && <p className="text-sm text-slate-400">Không có tiện ích phù hợp</p>}</div></div></div></HSec>
      <HSec wide id="hs-photos" n="Hình ảnh khách sạn" hint="Ảnh sẽ được đồng bộ sang các kênh OTA (tối đa 8 ảnh, mỗi ảnh 2MB)" right={<label className="inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium cursor-pointer hover:bg-slate-50"><Upload className="w-4 h-4" />Thêm ảnh<input type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={e => { pick('hinh_anh', e.target.files, true); e.target.value = ''; }} /></label>}>
        {imgs.length ? <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">{imgs.map((src, i) => <div key={i} className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-slate-200"><img src={src} alt="" className="w-full h-full object-cover" />
          <button type="button" title="Xoá ảnh" onClick={() => f.set('hinh_anh', imgs.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-7 h-7 grid place-items-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button></div>)}</div>
          : <p className="text-sm text-slate-400 py-6 text-center">Chưa có ảnh nào. Ảnh sẽ được đồng bộ sang các kênh OTA.</p>}</HSec>
      </div>}
      {tab === 'ops' && <div className={COLS}>
      <HSec id="hs-email" n="Cấu hình email" hint="Địa chỉ nhận thông báo đặt phòng">
        <div className={G2}><Input label="Email khách sạn *" req type="email" f={f} k="email_khach_san" /><Input label="Email nhận thông báo ĐP *" req type="email" f={f} k="email_nhan_thong_bao_dp" />
          <div><Input label="Email CC thông báo ĐP" f={f} k="email_cc_thong_bao_dp" /><p className="text-xs text-slate-400 mt-1">Nhiều email, cách nhau dấu phẩy</p></div><Input label="Email BCC thông báo ĐP" f={f} k="email_bcc_thong_bao_dp" />
          <div className="md:col-span-2"><Input label="Email mã truy cập thẻ" f={f} k="email_ma_truy_cap_the" /><p className="text-xs text-slate-400 mt-1">OTP khi xem thông tin thẻ từ OTA</p></div></div>
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-3"><FCheck f={f} k="huy_khong_xac_nhan" label="Cho phép hủy tự động booking không được xác nhận" />
          <div className="flex items-center gap-2 flex-wrap"><FCheck f={f} k="huy_thanh_toan_that_bai" label="Hủy tự động booking thanh toán thất bại sau" /><input type="number" min="1" disabled={!v.huy_thanh_toan_that_bai} className="field !w-20 !py-1.5 text-center disabled:bg-slate-100" value={v.huy_thanh_toan_sau ?? 30} onChange={e => f.set('huy_thanh_toan_sau', e.target.value)} /><span className="text-sm text-slate-600">phút</span></div></div></HSec>
      <HSec id="hs-lang" n="Ngôn ngữ & cuối tuần">
        <div className={G2}><Select label="Ngôn ngữ hệ thống" f={f} k="ngon_ngu" opts={['Tiếng Việt', 'English']} /><div><span className="lbl">Ngôn ngữ email</span><Radios f={f} k="ngon_ngu_email" opts={['Tiếng Việt', 'English']} /></div></div>
        <div className="mt-5"><span className="lbl">Ngày cuối tuần *</span><p className="text-xs text-slate-400 -mt-1 mb-2">Ảnh hưởng đến weekend rate</p><div className="flex gap-2">{DAYS.map((d, i) => <button key={d} type="button" onClick={() => f.set('cuoi_tuan', wk.includes(i) ? wk.filter(x => x !== i) : [...wk, i].sort())} className={`w-11 h-11 max-md:w-10 max-md:h-10 rounded-full text-sm font-medium border transition-colors ${wk.includes(i) ? 'bg-ink text-white border-ink' : 'bg-white text-slate-600 border-slate-200 hover:border-ink'}`}>{d}</button>)}</div></div>
        <div className="mt-5 pt-5 border-t border-slate-100"><div className="flex items-start justify-between"><div><span className="lbl !mb-0">Ngày lễ</span><p className="text-xs text-slate-400">Dùng cho giá ngày lễ trong cấu hình giá</p></div>
          <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark" onClick={() => f.set('ngay_le', [...hol, { ten: '', ngay: '' }])}><Plus className="w-4 h-4" />Thêm ngày lễ</button></div>
          {hol.length ? <div className="mt-3 space-y-2">{hol.map((h, i) => <div key={i} className="flex gap-2"><input className="field" placeholder="Tên ngày lễ" value={h.ten} onChange={e => f.set('ngay_le', hol.map((x, j) => j === i ? { ...x, ten: e.target.value } : x))} /><input type="date" className="field !w-48 max-md:!w-36" value={h.ngay} onChange={e => f.set('ngay_le', hol.map((x, j) => j === i ? { ...x, ngay: e.target.value } : x))} />
            <button type="button" title="Xoá" className="w-10 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500" onClick={() => f.set('ngay_le', hol.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></button></div>)}</div>
            : <p className="text-sm italic text-slate-400 mt-3">Chưa có ngày lễ nào. Nhấn “Thêm ngày lễ” để khai báo.</p>}</div></HSec>
      <HSec id="hs-tax" n="Tiền tệ & thuế/phí">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 mb-5">Theo quy định mới của Google, các khách sạn sử dụng Google Hotel bắt buộc phải cập nhật dữ liệu thuế và phí. Hệ thống cần có ít nhất một loại thuế hoặc phí có giá trị lớn hơn 0.</div>
        <div className={GM}><Select label="Đơn vị tiền tệ *" className="col-span-2 md:col-span-1" f={f} k="don_vi_tien_te" opts={['VND', 'USD']} /><Input label="Mức % thuế VAT *" type="number" min="0" f={f} k="vat" ph="0" /><Input label="Mức % phí dịch vụ *" type="number" min="0" f={f} k="phi_dich_vu" ph="0" /><div className="pt-7 max-md:pt-0 col-span-2 md:col-span-1"><FCheck f={f} k="gia_bao_gom_thue" label="Giá đã bao gồm thuế/phí" /></div></div></HSec>
      <HSec id="hs-kids" n="Quy định độ tuổi trẻ em">
        <div className={GM}><Select label="Độ tuổi em bé tối đa *" f={f} k="tuoi_em_be" opts={['2 tuổi', '3 tuổi']} /><Select label="Độ tuổi trẻ em tối đa *" f={f} k="tuoi_tre_em" opts={['12 tuổi', '14 tuổi']} /></div>
        <div className="mt-4"><Area label="Chính sách trẻ em" rows={4} f={f} k="chinh_sach_tre_em" /><Count v={v.chinh_sach_tre_em} max={3000} /></div></HSec>
      <HSec wide id="hs-other" n="Thông tin khác">
        <div className={G4}><Input label="Thời gian nhận phòng *" req type="time" f={f} k="thoi_gian_nhan_phong" /><Input label="Thời gian trả phòng *" req type="time" f={f} k="thoi_gian_tra_phong" />
          <Input label="Năm xây dựng" f={f} k="nam_xay_dung" /><Input label="Tổng số tầng *" req type="number" f={f} k="tong_so_tang" />
          <div className="col-span-2 xl:col-span-1"><span className="lbl">Tổng số phòng</span><div className="field bg-slate-50 text-slate-600">{totalRooms}</div><p className="text-xs text-slate-400 mt-1">Chỉ mang tính thông tin — để bán phòng, vào Cấu hình → Thông tin hạng phòng</p></div><Input label="Khoảng cách tới sân bay (km)" f={f} k="km_san_bay" />
          <Input label="Khoảng cách tới TT (km)" f={f} k="km_trung_tam" /><Input label="Thời gian tới sân bay (phút)" f={f} k="phut_san_bay" /><div><Input label="Điện áp sử dụng" ph="220V" f={f} k="dien_ap" /></div></div>
        <div className="mt-4"><Area label="Quy định khách sạn" rows={4} f={f} k="quy_dinh" /><Count v={v.quy_dinh} max={5000} /></div></HSec>
      </div>}
      <div className="sticky bottom-0 -mx-2 px-4 py-3 bg-white/90 backdrop-blur border-t border-slate-200 rounded-xl flex items-center justify-between z-10 shadow-[0_-4px_12px_rgba(0,0,0,.04)]"><span className={`text-sm ${dirty ? 'text-amber-700' : 'text-slate-400'}`}>{dirty ? 'Có thay đổi chưa lưu' : 'Chưa có thay đổi'}</span>
        <div className="flex gap-2"><Btn kind="ghost" disabled={!dirty} onClick={() => f.reset(db.hotel)}>Hoàn tác</Btn><Btn type="submit" disabled={!dirty}>Lưu thay đổi</Btn></div></div>
    </div></form>;
}

/* ---------- Hạng phòng ---------- */
export function Rooms() {
  const rm = useCrud('rooms'), nav = useNavigate(), [hide, setHide] = useState(false), [q, setQ] = useState('');
  const list = rm.list.filter(r => (!hide || r.dang_hoat_dong) && (r.ten_phong_vi + r.ma_hang_phong).toLowerCase().includes(q.toLowerCase()));
  return <div className="cfg"><Title t="Cấu hình Phòng & Giá" sub={<>Danh sách các hạng phòng và cấu hình chi tiết. Mở bán và quản lý phòng trống theo ngày tại <b className="text-ink">Bán phòng</b>.</>} />
    <div className="md:hidden mb-4 space-y-3"><SearchBox value={q} onChange={setQ} ph="Tìm mã/tên hạng phòng..." />
      <div className="flex items-center gap-2"><div className="flex-1 min-w-0 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"><span className="truncate">Ẩn ngừng hoạt động</span><Toggle checked={hide} onChange={setHide} /></div>
        <Btn className="shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-1.5 !py-3" onClick={() => nav('/rooms/new')}><Plus className="w-4 h-4" />Thêm phòng</Btn></div></div>
    <div className="md:hidden space-y-3">{list.map(r => <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><b className="text-base text-ink">{r.ten_phong_vi}</b><div className="mt-1"><span className="px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-600">{r.ma_hang_phong}</span></div></div><Toggle checked={r.dang_hoat_dong} onChange={v => rm.patch(r.id, { dang_hoat_dong: v })} /></div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 grid grid-cols-3 max-md:!grid-cols-3 gap-2 text-sm"><div><div className="text-[10px] tracking-wide text-slate-400">GIÁ THƯỜNG</div><b>{money(r.gia_ngay_thuong || 0)} đ</b></div><div><div className="text-[10px] tracking-wide text-slate-400">KHÁCH</div><b className="font-medium">{r.suc_chua_nguoi_lon || 0} NL · {r.suc_chua_tre_em || 0} TE</b></div><div><div className="text-[10px] tracking-wide text-slate-400">SỐ PHÒNG</div><b>{r.so_luong_phong}</b></div></div>
      <div className="mt-2 flex justify-end gap-1"><button type="button" title="Sửa" onClick={() => nav(`/rooms/edit/${r.id}`)} className="w-10 h-10 grid place-items-center text-slate-500"><Pencil className="w-4 h-4" /></button><button type="button" title="Xoá" onClick={() => rm.remove(r.id)} className="w-10 h-10 grid place-items-center text-red-500"><Trash2 className="w-4 h-4" /></button></div></div>)}
      {!list.length && <p className="text-center text-slate-400 py-10">Chưa có hạng phòng nào</p>}</div>
    <div className="max-md:hidden"><div className="flex justify-between items-center mb-4"><SearchBox value={q} onChange={setQ} ph="Tìm mã/tên hạng phòng..." /><div className="flex items-center gap-4"><Toggle checked={hide} onChange={setHide} label="Ẩn hạng phòng ngừng hoạt động" /><Btn onClick={() => nav('/rooms/new')}>+ Thêm hạng phòng</Btn></div></div>
    <Card><Table head={['Hạng phòng', 'Giá thường', 'Khách', 'Số phòng', 'Trạng thái', 'Hành động']} rows={list.map(r => ({ key: r.id, cells: [<><b>{r.ten_phong_vi}</b><div className="text-xs text-slate-500">{r.ma_hang_phong}</div></>,
      <b>{money(r.gia_ngay_thuong || 0)} đ</b>, `${r.suc_chua_nguoi_lon || 0} NL · ${r.suc_chua_tre_em || 0} TE`, r.so_luong_phong,
      <Toggle checked={r.dang_hoat_dong} onChange={v => rm.patch(r.id, { dang_hoat_dong: v })} />, <RowActions onEdit={() => nav(`/rooms/edit/${r.id}`)} onDel={() => rm.remove(r.id)} />] }))} /></Card>
    <Pager n={`${list.length} hạng phòng · Trang 1/1`} label="Số hạng phòng mỗi trang" /></div></div>;
}
const ROOM_AMENITIES = [['Chung', ['Nguồn điện 100A', 'Nguồn điện 20A', 'Nguồn điện 30A', 'Nguồn điện 50A', 'Phù hợp xe cỡ lớn', 'Trạm xả thải', 'Đấu nối thoát nước thải', 'Khoang mở rộng (xe nhà di động RV)', 'Đấu nối cấp nước']],
  ['Trong phòng', ['Tiếp cận bằng thang máy', 'Bộ chuyển đổi ổ cắm', 'Có máy lọc không khí', 'Điều hòa không khí', 'Đồng hồ báo thức', 'Không dị ứng', 'Đầu Blu-ray', 'Trò chơi cờ bàn/xếp hình', 'Thư viện sách/DVD/nhạc cho trẻ em', 'Nước đóng chai', 'Đầu đĩa CD', 'Kênh truyền hình cáp', 'Sàn trải thảm', 'Nôi/cũi cho trẻ em', 'Chocolate/bánh quy', 'Giá treo quần áo', 'Giá phơi quần áo', 'Bàn ủi quần áo', 'Máy pha cà phê', 'Ấm pha trà/cà phê', 'Máy tính', 'Đầu đĩa DVD', 'Bàn làm việc', 'Nhà riêng biệt', 'Khu vực ăn uống', 'Bàn ăn', 'Phòng thay đồ', 'Nút bịt tai', 'Ấm đun nước điện', 'Chăn điện', 'Toàn bộ ở tầng trệt', 'Toàn bộ phòng tiếp cận được bằng xe lăn', 'Sử dụng Executive Lounge', 'Quạt', 'Tủ lạnh', 'Két sắt', 'TV', 'Wifi']]];
const BEDS = ['Giường đôi', 'Giường đơn', 'Giường tầng', 'Sofa bed'];
const RSec = ({ id, n, children }) => <div id={id} className="rounded-xl border border-slate-200 p-5 max-md:p-3.5 scroll-mt-16"><h3 className="font-serif font-bold text-ink text-base mb-4">{n}</h3>{children}</div>;
const Vnd = ({ label, f, k, ph = '0' }) => <label className="block"><span className="lbl">{label}</span><div className="relative"><input type="number" min="0" placeholder={ph} className="field text-right !pr-14" value={f.v[k] ?? ''} onChange={e => f.set(k, e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">VND</span></div></label>;
export function RoomForm() { const { id } = useParams(); return <RoomEditor key={id || 'new'} id={id} />; } // key: đổi hạng phòng ở danh sách trái thì form nạp lại
function RoomEditor({ id }) {
  const rm = useCrud('rooms'), nav = useNavigate(), [q, setQ] = useState('');
  const f = useForm(id ? rm.get(id) : { loai_hinh_phong: 'Phòng', dang_hoat_dong: true, tong_khach_toi_da: 2, suc_chua_nguoi_lon: 2, suc_chua_tre_em: 0, tre_so_sinh: 0, so_luong_phong: 1, gia_ngay_thuong: 0, gia_cuoi_tuan: 0, gia_ngay_le: 0, cau_hinh_giuong: [] }), v = f.v, beds = v.cau_hinh_giuong ?? [];
  const picked = ROOM_AMENITIES.flatMap(([, l]) => l).filter(x => v['ti_' + x]).length;
  return <div className="cfg">
    <Back to="/rooms">Quay lại danh sách</Back><Title keep t={id ? 'Sửa hạng phòng' : 'Thêm hạng phòng'} sub="" />
    <form onSubmit={e => { e.preventDefault(); rm.save(id, v, '/rooms'); }} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
      <div className="min-w-0 space-y-4">
      <Card><div className="px-6 max-md:px-4 py-4 border-b font-serif font-bold">{id ? 'Sửa: ' + (v.ten_phong_vi || '') : 'Thêm hạng phòng mới'}</div>
        <div className="p-6 max-md:p-4 space-y-5">
          <RSec id="rs-info" n="Thông tin phòng"><div className={G2}>
            <div><span className="lbl">Loại *</span><div className="grid grid-cols-2 rounded-lg border border-slate-200 overflow-hidden">{['Phòng', 'Dorm / Giường'].map(t => <button key={t} type="button" onClick={() => f.set('loai_hinh_phong', t)} className={`py-2.5 text-sm font-medium ${v.loai_hinh_phong === t ? 'bg-ink text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>{t}</button>)}</div></div>
            <Select label="Loại phòng" f={f} k="loai_phong" opts={[['', '– Chọn –'], ['Phòng đơn', 'Phòng đơn'], ['Phòng đôi', 'Phòng đôi'], ['Phòng gia đình', 'Phòng gia đình'], ['Suite', 'Suite'], ['Studio', 'Studio'], ['Villa', 'Villa']]} />
            <Input label="Tên phòng (VI) *" req ph="Phòng Deluxe Biển" f={f} k="ten_phong_vi" /><Input label="Tên phòng (EN)" ph="Deluxe Sea View" f={f} k="ten_phong_en" />
            <Input label="Tên tùy chọn" ph="Tên nội bộ hiển thị khi bán phòng (không bắt buộc)" f={f} k="ten_tuy_chon" /><Input label="Mã hạng phòng *" req ph="DLX-SEA" f={f} k="ma_hang_phong" />
            <Select label="Xếp hạng" f={f} k="xep_hang" opts={[['', '– Không –'], ['Tiêu chuẩn', 'Tiêu chuẩn'], ['Cao cấp', 'Cao cấp'], ['Hạng sang', 'Hạng sang']]} /><Select label="Hướng phòng" f={f} k="huong_phong" opts={['Hướng nội bộ (không view)', 'Hướng biển', 'Hướng thành phố']} /></div>
            <div className="mt-4"><FToggle f={f} k="dang_hoat_dong" label="Đang hoạt động" /></div></RSec>
          <RSec id="rs-cap" n="Cấu hình sức chứa & giường"><div className={GM}><Input label="Tổng khách tối đa" type="number" f={f} k="tong_khach_toi_da" /><Input label="Sức chứa người lớn *" req type="number" f={f} k="suc_chua_nguoi_lon" />
            <Input label="Sức chứa trẻ em" type="number" f={f} k="suc_chua_tre_em" /><Input label="Trẻ sơ sinh tối đa" type="number" f={f} k="tre_so_sinh" /><Input label="Số lượng phòng *" req type="number" min="0" f={f} k="so_luong_phong" /><Input label="Diện tích (m²)" type="number" ph="Ví dụ: 28" f={f} k="dien_tich" /></div>
            <div className="mt-4"><Select label="Loại giường chính" f={f} k="loai_giuong" opts={[['', '– Không –'], ['Giường đôi', 'Giường đôi'], ['Giường đơn', 'Giường đơn']]} /></div>
            <div className="mt-4"><span className="lbl">Cấu hình giường</span><div className="space-y-2">{beds.map((b, i) => <div key={i} className="flex gap-2"><select className="field pr-9" value={b.loai} onChange={e => f.set('cau_hinh_giuong', beds.map((x, j) => j === i ? { ...x, loai: e.target.value } : x))}>{BEDS.map(x => <option key={x}>{x}</option>)}</select>
              <input type="number" min="1" className="field !w-24 text-center" value={b.so} onChange={e => f.set('cau_hinh_giuong', beds.map((x, j) => j === i ? { ...x, so: e.target.value } : x))} /><button type="button" title="Xoá" className="w-10 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-500" onClick={() => f.set('cau_hinh_giuong', beds.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></button></div>)}
              <Btn kind="ghost" className="inline-flex items-center gap-1.5" onClick={() => f.set('cau_hinh_giuong', [...beds, { loai: BEDS[0], so: 1 }])}><Plus className="w-4 h-4" />Thêm tùy chọn</Btn></div></div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between"><div><div className="font-medium text-sm">Free allotment</div><div className="text-xs text-slate-500">Phân bổ phòng tự động cho kênh phân phối</div></div><Toggle checked={!!v.free_allotment} onChange={x => f.set('free_allotment', x)} /></div></RSec>
          <RSec id="rs-price" n="Giá phòng (VND)"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Vnd label="Giá ngày thường" f={f} k="gia_ngay_thuong" /><Vnd label="Giá cuối tuần" f={f} k="gia_cuoi_tuan" /><Vnd label="Giá ngày lễ" f={f} k="gia_ngay_le" /></div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="font-medium text-sm mb-3">Khoảng giá an toàn</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Vnd label="Giá tối thiểu" f={f} k="gia_toi_thieu" /><Vnd label="Giá tối đa" f={f} k="gia_toi_da" /></div>
              <p className="text-xs text-amber-800/80 mt-2">Cảnh báo (không chặn lưu) khi giá nhập ở màn Đơn giá hoặc Bán phòng nằm ngoài khoảng này.</p></div></RSec>
          <RSec id="rs-desc" n="Mô tả & Tiện ích"><Area label="Mô tả phòng" rows={5} ph="Phòng rộng rãi với view biển tuyệt đẹp..." f={f} k="mo_ta" />
            <div className="mt-4"><div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-2 mb-1.5"><span className="lbl !mb-0">Tiện ích <span className="text-slate-400">({picked} đã chọn)</span></span><div className="relative w-56 max-md:w-full"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field !py-1.5 !pl-9" placeholder="Tìm tiện ích…" value={q} onChange={e => setQ(e.target.value)} /></div></div>
              <div className="border border-slate-200 rounded-xl p-4 max-md:p-3 max-h-72 overflow-y-auto space-y-3 [&_label]:items-start [&_label]:leading-snug [&_label]:text-[13.5px] [&_input]:mt-[1px] [&_input]:shrink-0">{ROOM_AMENITIES.map(([g, list]) => { const shown = list.filter(x => x.toLowerCase().includes(q.toLowerCase())); return shown.length > 0 && <div key={g}><div className="text-xs font-semibold text-slate-500 mb-1.5">{g}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-3 md:gap-y-2">{shown.map(x => <FCheck key={x} f={f} k={'ti_' + x} label={x} />)}</div></div>; })}</div></div></RSec>
          <p className="text-xs text-slate-400">{id ? 'Hình ảnh hạng phòng sẽ được thêm ở bước sau.' : 'Lưu hạng phòng trước khi thêm hình ảnh.'}</p></div>
        </Card>
      <div className="sticky bottom-0 z-10 px-5 max-md:px-3 py-3 bg-white/90 backdrop-blur border border-slate-200 rounded-xl flex items-center justify-end gap-2 max-md:[&>button]:flex-1 shadow-[0_-4px_12px_rgba(0,0,0,.04)]"><Btn kind="ghost" onClick={() => nav('/rooms')}>Huỷ</Btn><Btn type="submit">{id ? 'Lưu hạng phòng' : 'Tạo hạng phòng'}</Btn></div></div>
      <Card className="xl:sticky xl:top-6 max-md:hidden"><div className="p-5"><b>Tóm tắt</b>{[['Tên phòng', v.ten_phong_vi || '—'], ['Mã hạng phòng', v.ma_hang_phong || '—'], ['Sức chứa', `${v.suc_chua_nguoi_lon || 0} người lớn, ${v.suc_chua_tre_em || 0} trẻ em`], ['Giá ngày thường', money(v.gia_ngay_thuong || 0) + ' VND'], ['Số lượng phòng', v.so_luong_phong || 0]].map(([k, x]) =>
        <div key={k} className="mt-3"><div className="text-xs text-slate-400">{k}</div><div className="text-sm font-medium break-words">{x}</div></div>)}</div></Card>
    </form></div>;
}

/* ---------- Chính sách giá ---------- */
export function Policies() {
  const pc = useCrud('policies'), nav = useNavigate(), [q, setQ] = useState('all'), [s, setS] = useState('');
  const list = pc.list.filter(p => (q === 'all' || (q === 'on') === !!p.kich_hoat) && (p.ma_chinh_sach_gia + p.ten_chinh_sach_gia).toLowerCase().includes(s.toLowerCase()));
  const cnt = k => pc.list.filter(p => k === 'all' || (k === 'on') === !!p.kich_hoat).length;
  const mobile = <div className="md:hidden">
    <div className="flex items-center justify-between gap-3 mb-4"><div className="flex items-center gap-2 min-w-0"><h1 className="text-xl font-bold text-ink">Chính sách giá</h1><span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium whitespace-nowrap">{pc.list.length} chính sách</span></div>
      <Btn className="shrink-0 inline-flex items-center gap-1.5" onClick={() => nav('/policies/new')}><Plus className="w-4 h-4" />Thêm mới</Btn></div>
    <div className="relative mb-3"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field !pl-10" placeholder="Tìm mã / tên chính sách..." value={s} onChange={e => setS(e.target.value)} /></div>
    <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 pb-3">{[['all', 'Tất cả'], ['on', 'Đang hoạt động'], ['off', 'Ngưng hoạt động']].map(([k, l]) => <button key={k} type="button" onClick={() => setQ(k)} className={`min-w-0 inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-2 text-[13px] font-medium whitespace-nowrap ${q === k ? 'bg-ink text-white border-ink' : 'bg-white text-slate-700 border-slate-200'}`}>{l}<span className={`px-1.5 rounded-full text-xs ${q === k ? 'bg-white/20' : 'bg-indigo-50 text-indigo-700'}`}>{cnt(k)}</span></button>)}</div>
    <div className="space-y-3">{list.map((p, i) => <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3"><span className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 grid place-items-center text-sm font-semibold text-slate-600">{i + 1}</span>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><b className="text-base text-ink">{p.ten_chinh_sach_gia}</b></div>
          <div className="mt-1 text-xs text-slate-500">Mã: <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">{p.ma_chinh_sach_gia}</span></div></div>
        <Toggle checked={p.kich_hoat} onChange={v => pc.patch(p.id, { kich_hoat: v })} /></div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 grid grid-cols-2 gap-3">
        {[[UtensilsCrossed, 'BỮA ĂN', p.bua_an_bao_gom || '—'], [InfIcon, 'ÁP DỤNG', p.t || 'Luôn luôn']].map(([I, k, v]) => <div key={k} className="flex items-center gap-2.5 min-w-0"><span className="w-9 h-9 shrink-0 rounded-lg bg-white grid place-items-center text-brand-dark"><I className="w-4 h-4" /></span><div className="min-w-0"><div className="text-[10px] tracking-wide text-slate-400">{k}</div><div className="text-sm font-medium truncate">{v}</div></div></div>)}</div>
      <div className="mt-3 flex items-center justify-between"><button type="button" onClick={() => nav('/bulk', { state: { pid: p.id, tab: 'price' } })} className="inline-flex items-center gap-2 rounded-lg bg-brand/10 text-brand-dark px-3.5 py-2 text-sm font-medium"><Banknote className="w-4 h-4" />Cập nhật giá</button>
        <div className="flex items-center gap-1"><button type="button" title="Sửa" onClick={() => nav(`/policies/edit/${p.id}`)} className="w-10 h-10 grid place-items-center text-slate-500"><Pencil className="w-4 h-4" /></button><button type="button" title="Xoá" onClick={() => pc.remove(p.id)} className="w-10 h-10 grid place-items-center text-red-500"><Trash2 className="w-4 h-4" /></button></div></div></div>)}
      {!list.length && <p className="text-center text-slate-400 py-10">Không có chính sách phù hợp</p>}</div>
    <p className="text-sm text-slate-500 mt-4">Hiển thị {list.length} / {pc.list.length} chính sách</p></div>;
  return <div className="cfg">{mobile}<div className="max-md:hidden"><Title t="Chính sách giá OTA" sub="Định nghĩa chính sách giá theo bữa ăn, thời gian áp dụng, đại lý và phân khúc thị trường; gắn cho từng hạng phòng." />
    <div className="flex items-center gap-3 mb-4"><SearchBox value={s} onChange={setS} ph="Tìm mã/tên chính sách..." /><Seg value={q} onChange={setQ} items={[['all', 'Tất cả'], ['on', 'Đang hoạt động'], ['off', 'Ngưng hoạt động']]} /><div className="flex-1" />
      <Btn onClick={() => nav('/policies/new')}>+ Thêm mới chính sách giá</Btn></div>
    <Card><Table head={['STT', 'Mã chính sách giá', 'Tên chính sách giá', 'Bữa ăn', 'Thời gian áp dụng', 'Trạng thái', 'Thao tác']} rows={list.map((p, i) => ({ key: p.id, cells: [i + 1, <span>{p.ma_chinh_sach_gia}</span>, <b>{p.ten_chinh_sach_gia}</b>,
      p.bua_an_bao_gom || '—', p.t || 'Luôn luôn', <Toggle checked={p.kich_hoat} onChange={v => pc.patch(p.id, { kich_hoat: v })} />, <RowActions extra={['Cập nhật giá', () => nav('/bulk', { state: { pid: p.id, tab: 'price' } })]} onEdit={() => nav(`/policies/edit/${p.id}`)} onDel={() => pc.remove(p.id)} />] }))} /></Card>
    <Pager n={`${list.length} chính sách · Trang 1/1`} label="Số chính sách giá mỗi trang" /></div></div>;
}
// Hai danh sách Chưa gán / Đã gán; mỗi hạng phòng đính kèm các kênh. v.gan = { 'roomId@chanId': true }
function GanPhong({ f, rooms, chans }) {
  const g = f.v.gan || {}, [sel, setSel] = useState({}), [open, setOpen] = useState({}), [q, setQ] = useState({ L: '', R: '' });
  const k = (r, c) => r + '@' + c, side = on => rooms.map(r => ({ r, cs: chans.filter(c => !!g[k(r.id, c.id)] === on) })).filter(x => x.cs.length);
  const move = (pairs, on) => { const n = { ...g }; pairs.forEach(p => on ? n[p] = true : delete n[p]); f.set('gan', n); setSel({}); };
  const pairsOf = on => side(on).flatMap(x => x.cs.map(c => k(x.r.id, c.id)));
  const tog = (ps, val) => setSel(o => { const n = { ...o }; ps.forEach(p => val ? n[p] = true : delete n[p]); return n; });
  const Cb = ({ checked, part, onChange }) => <input type="checkbox" ref={el => el && (el.indeterminate = part && !checked)} checked={checked} onChange={onChange} className="w-4 h-4 rounded accent-brand-dark cursor-pointer shrink-0" />;
  const Panel = ({ on, id, title }) => {
    const items = side(on).map(x => ({ ...x, cs: x.cs.filter(c => (x.r.ten_phong_vi + ' ' + c.name).toLowerCase().includes(q[id].toLowerCase())) })).filter(x => x.cs.length);
    const total = pairsOf(on).length, nSel = pairsOf(on).filter(p => sel[p]).length;
    return <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col h-[380px] shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{nSel ? nSel + ' đã chọn · ' : ''}{new Set(pairsOf(on).map(p => p.split('@')[0])).size} phòng</span></div>
      <div className="px-3 pt-3"><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-lg bg-slate-50 border border-transparent focus:bg-white focus:border-brand focus:outline-none pl-9 pr-3 py-2 text-sm transition-colors" placeholder="Tìm loại phòng hoặc kênh..." value={q[id]} onChange={e => setQ(o => ({ ...o, [id]: e.target.value }))} /></div></div>
      <div className="flex-1 overflow-auto p-3 space-y-1">{items.length ? items.map(({ r, cs }) => { const ps = cs.map(c => k(r.id, c.id)), n = ps.filter(p => sel[p]).length, key = id + r.id, exp = open[key] || !!q[id];
        return <div key={r.id}><div className={'flex items-center gap-1 rounded-lg pr-2 transition-colors ' + (n ? 'bg-brand/10' : 'hover:bg-slate-50')}>
          <div onClick={() => setOpen(o => ({ ...o, [key]: !o[key] }))} className="flex items-center gap-2.5 py-2 pl-2 cursor-pointer flex-1 min-w-0 select-none"><span className="text-slate-400">{exp ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span><span onClick={e => e.stopPropagation()} className="flex"><Cb checked={n > 0} part={n < ps.length} onChange={e => tog(ps, e.target.checked)} /></span><span className="truncate font-medium text-ink">{r.ten_phong_vi}</span>
          <span className="ml-auto text-xs text-slate-400 tabular-nums">{n ? n + '/' : ''}{ps.length} kênh</span></div></div>
          {exp && <div className="ml-[18px] pl-4 border-l border-slate-200 my-1 space-y-0.5">{cs.map(c => <label key={c.id} className={'flex items-center gap-2.5 py-1.5 px-2 text-sm rounded-md cursor-pointer transition-colors ' + (sel[k(r.id, c.id)] ? 'bg-brand/10 text-ink' : 'text-slate-600 hover:bg-slate-50')}><Cb checked={!!sel[k(r.id, c.id)]} onChange={e => tog([k(r.id, c.id)], e.target.checked)} />{c.name}</label>)}</div>}</div>; })
        : <p className="text-sm text-slate-400 text-center py-10">{total ? 'Không tìm thấy' : on ? 'Chưa gán kênh nào' : 'Đã gán hết'}</p>}</div></div>;
  };
  const mv = on => move(Object.keys(sel).filter(p => !!g[p] !== on), on), AB = 'w-10 h-10 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-500 shadow-sm hover:bg-brand/10 hover:text-brand-dark hover:border-brand transition-colors';
  return <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
    <Panel on={false} id="L" title="Chưa gán" />
    <div className="flex lg:flex-col gap-2 justify-center"><button type="button" className={AB} title="Gán mục đã chọn" onClick={() => mv(true)}><ChevronRight size={18} /></button><button type="button" className={AB} title="Bỏ gán mục đã chọn" onClick={() => mv(false)}><ChevronLeft size={18} /></button>
      <button type="button" className={AB} title="Gán tất cả" onClick={() => move(pairsOf(false), true)}><ChevronsRight size={18} /></button><button type="button" className={AB} title="Bỏ gán tất cả" onClick={() => move(pairsOf(true), false)}><ChevronsLeft size={18} /></button></div>
    <Panel on={true} id="R" title="Đã gán" /></div>;
}

const AGES = [['', 'Không giới hạn'], ...Array.from({ length: 18 }, (_, i) => [String(i), i + ' tuổi'])];
export function PolicyForm() {
  const { id } = useParams(), { db } = useDB(), pc = useCrud('policies');
  const f = useForm(id ? pc.get(id) : { kich_hoat: true, bua_an_bao_gom: 'Không bao gồm', t: 'Luôn luôn', dat_coc: 0 });
  return <form className="cfg" onSubmit={e => { e.preventDefault(); pc.save(id, f.v, '/policies'); }}>
    <Back to="/policies">Quay lại</Back><Title keep t={`${id ? 'Sửa' : 'Thêm mới'} chính sách giá`} sub="" />
    <div className="space-y-5">
      <Card><div className="p-6 space-y-4"><H2>Thông tin chính sách giá</H2><Input label="Tên chính sách giá *" req ph="VD: Giá BAR tiêu chuẩn" f={f} k="ten_chinh_sach_gia" />
        <Input label="Mô tả mặc định ngắn (tối đa 20 ký tự)" maxLength={20} ph="Tóm tắt hiển thị" f={f} k="mo_ta_ngan" /><Area label="Mô tả chi tiết (hiển thị cho khách)" rows={5} ph="Mô tả chính sách giá..." f={f} k="mo_ta" /></div></Card>
      <Card><div className="p-6 space-y-4"><H2>Thông tin chính sách giá chi tiết</H2><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"><Input label="Mã chính sách giá *" req ph="BAR-001" f={f} k="ma_chinh_sach_gia" />
        <Select label="Bữa ăn bao gồm" f={f} k="bua_an_bao_gom" opts={['Không bao gồm', 'Bữa sáng', 'Nửa pension', 'Full pension']} />
        <Select label="Tuổi trẻ em lớn nhất" f={f} k="tuoi_tre_em" opts={AGES} /><Select label="Tuổi sơ sinh lớn nhất" f={f} k="tuoi_so_sinh" opts={AGES} />
        <Input label="Đại lý du lịch" ph="Tất cả" f={f} k="dai_ly" /><Input label="Phân khúc thị trường" ph="Tất cả" f={f} k="phan_khuc" /><Input label="Thời hạn hủy" ph="Ví dụ: Miễn phí hủy trước 24 giờ" f={f} k="thoi_han_huy" /><Input label="Đặt cọc (%)" type="number" f={f} k="dat_coc" />
        <Select label="Danh mục giá" f={f} k="danh_muc_gia" opts={[['', 'Không thuộc danh mục'], ['BAR', 'BAR'], ['Công ty', 'Công ty'], ['Khuyến mãi', 'Khuyến mãi']]} /></div>
        <div className="flex gap-6"><FToggle f={f} k="kich_hoat" label="Kích hoạt" /><FToggle f={f} k="bao_gom_thue" label="Đã bao gồm thuế" /></div></div></Card>
      <Card><div className="p-6"><H2>Ngày áp dụng</H2><div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5">
        <div><span className="lbl">Thời gian ở</span><Radios f={f} k="t" opts={['Luôn luôn', 'Trong khoảng']} />
          {f.v.t === 'Trong khoảng' && <div className="flex items-center gap-2"><input type="date" className="field" value={f.v.tu || ''} onChange={e => f.set('tu', e.target.value)} /><span className="text-slate-400">→</span><input type="date" className="field" min={f.v.tu} value={f.v.den || ''} onChange={e => f.set('den', e.target.value)} /></div>}</div>
        <div><span className="lbl">Ngày áp dụng trong tuần</span><div className="flex flex-wrap gap-1.5 pt-1">{DAYS.map((d, i) => { const on = (f.v.thu || [0, 1, 2, 3, 4, 5, 6]).includes(i);
          return <button key={d} type="button" onClick={() => f.set('thu', on ? (f.v.thu || [0, 1, 2, 3, 4, 5, 6]).filter(x => x !== i) : [...(f.v.thu || [0, 1, 2, 3, 4, 5, 6]), i])} className={'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ' + (on ? 'bg-ink text-white border-ink' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300')}>{d}</button>; })}</div></div>
        <div className="lg:col-span-2"><div className="flex items-center justify-between mb-2"><span className="lbl !mb-0">Khoảng ngày không áp dụng</span>
          <Btn kind="ghost" onClick={() => f.set('khong_ap_dung', [...(f.v.khong_ap_dung || []), { tu: '', den: '' }])}>+ Thêm khoảng ngày không áp dụng</Btn></div>
          {(f.v.khong_ap_dung || []).length ? <div className="space-y-2">{f.v.khong_ap_dung.map((r, i) => { const up = p => f.set('khong_ap_dung', f.v.khong_ap_dung.map((x, j) => j === i ? { ...x, ...p } : x));
            return <div key={i} className="flex items-center gap-2"><input type="date" className="field !w-auto" value={r.tu} onChange={e => up({ tu: e.target.value })} /><span className="text-slate-400">→</span><input type="date" className="field !w-auto" min={r.tu} value={r.den} onChange={e => up({ den: e.target.value })} />
              <button type="button" className="p-2 text-slate-400 hover:text-red-500" onClick={() => f.set('khong_ap_dung', f.v.khong_ap_dung.filter((_, j) => j !== i))}><Trash2 size={16} /></button></div>; })}</div>
            : <p className="text-sm text-slate-400">Chưa có khoảng ngày không áp dụng</p>}</div>
        <div className="lg:col-span-2"><FCheck f={f} k="ngay_le" label="Thiết lập ngày lễ" /></div></div></div></Card>
      <Card><div className="p-6"><H2>Gắn loại phòng</H2><div className="font-serif font-bold text-sm mb-3">Gắn loại phòng theo kênh OTA</div><GanPhong f={f} rooms={db.rooms} chans={db.channels} /></div></Card></div>
    <Footer ok={id ? 'Lưu chính sách' : 'Tạo chính sách giá'} /></form>;
}
