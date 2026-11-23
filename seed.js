// Dữ liệu mẫu dùng chung cho server.js (local) và api/ (Vercel)
const room = (ten, ma, gia, nl, sl) => ({ id: ma.toLowerCase(), ten_phong_vi: ten, ma_hang_phong: ma, gia_ngay_thuong: gia, suc_chua_nguoi_lon: nl, suc_chua_tre_em: 0, so_luong_phong: sl, dang_hoat_dong: true });
const pol = ma => ({ id: ma.toLowerCase(), ten_chinh_sach_gia: ma, ma_chinh_sach_gia: ma, bua_an_bao_gom: 'Không bao gồm', kich_hoat: true });
const fm = (id, n, s, layers) => ({ id, ten_nhan_dien: n, c: 'Standard', s, d1: 0, k: 1, d2: 0, layers, active: true });
export const SEED = {
  rooms: [room('Phòng 2 giường - giường đôi', 'DOUBLE', 1000000, 2, 4), room('Phòng 2 giường đơn', 'TWIN', 1000000, 2, 18), room('Phòng 3 Người', 'TRIPLE', 1200000, 3, 2), room('Phòng Vip khu A', 'VIP', 2000000, 4, 3), room('Phòng 4 người', '4NGUOI', 1500000, 2, 1)],
  policies: ['Standard', 'Standard_Agoda', 'Standard_Booking', 'Standard_Expedia', 'Standard_Trip'].map(pol),
  formulas: [fm('f1', 'Booking', 'Standard_Booking', '64,10'), fm('f2', 'Agoda', 'Standard_Agoda', '67'), fm('f3', 'Expedia', 'Standard_Expedia', '67'), fm('f4', 'Trip', 'Standard_Trip', '67')],
  dynamics: [
    { id: 'd1', ten_mau_gia_linh_dong: 'Giá linh động cuối tuần', goi: 'Standard', mo_ta: 'Tăng giá khi còn ít phòng vào cuối tuần', kich_hoat: true, tc: 'Số lượng phòng trống', dt: 'Từng hạng phòng', from: '2026-11-27', to: '2026-11-29', phong: 'double' },
    { id: 'd2', ten_mau_gia_linh_dong: 'Đặt sớm 30 ngày', goi: 'Standard_Booking', mo_ta: 'Giảm giá cho khách đặt trước 30 ngày', kich_hoat: true, tc: 'Theo booking window', dt: 'Toàn bộ khách sạn', from: '2026-12-01', to: '2027-01-31', phong: 'double' },
    { id: 'd3', ten_mau_gia_linh_dong: 'Cao điểm Noel - Tết Dương', goi: 'Standard_Agoda', mo_ta: 'Tăng giá theo công suất dịp lễ cuối năm', kich_hoat: true, tc: 'Số lượng phòng trống', dt: 'Toàn bộ khách sạn', from: '2026-12-20', to: '2027-01-03', phong: 'twin' },
    { id: 'd4', ten_mau_gia_linh_dong: 'Giảm giá phòng trống giữa tuần', goi: 'Standard_Expedia', mo_ta: 'Kích cầu các ngày thấp điểm trong tuần', kich_hoat: false, tc: 'Số lượng phòng trống', dt: 'Từng hạng phòng', from: '2026-11-24', to: '2026-12-15', phong: 'triple' }], dynCfg: { active: true },
  channels: ['Booking.com', 'Agoda', 'Expedia', 'Traveloka', 'Ctrip / Trip.com', 'Airbnb'].map((name, i) => ({ id: 'c' + i, name, connected: false, active: true, map: {} })),
  cal: {},
  account: { ho_va_ten: 'Ngan Nguyen', gioi_tinh: 'Nữ', email: 'ngannguyen@lifrooms.com', so_dien_thoai: '0901234567' },
  hotel: { ten_khach_san: 'NHÀ SÁNG TÁC KHU VỰC MIỀN NAM', so_dien_thoai: '0254 3816276', email_lien_he: 'dothuynstvt@gmail.com', dia_chi: '153 Thuỳ Vân, P. Vũng Tàu, TP. Hồ Chí Minh',
    email_khach_san: 'lytranvt89@gmail.com', email_nhan_thong_bao_dp: 'lytranvt89@gmail.com', thoi_gian_tra_phong: '12:00', tong_so_tang: '5' }
};

