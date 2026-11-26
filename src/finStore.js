import { useSyncExternalStore } from 'react';

// ponytail: store dùng chung trong bộ nhớ cho các trang tài chính (PMS chưa có backend) — mất khi tải lại trang; thay bằng API khi có PMS
let state = {
  cfg: { thu: [{ id: 'g1', name: 'Test_01', on: true, items: [] }], chi: [] },
  tx: [{ id: 'x1', type: 'thu', date: new Date().toISOString().slice(0, 10), g: 'g1', i: '', amount: 500000, note: 'Thu mẫu' }],
  base: { cash: 97618456, bank: 735000 }, counts: [],
  vouchers: [
    { id: 'v1', fund: 'bank', no: 'PC-0914-0001', date: '2026-09-14', type: 'chi', who: '', bank: '023615325120', amount: 50000, reason: 'Sửa máy lạnh', group: '', recon: false },
    { id: 'v2', fund: 'bank', no: 'PT-1005-0001', date: '2026-10-05', type: 'thu', who: '', bank: '023615325120', amount: 5000000, reason: 'Nhận khoản thanh toán VND 5.000.000', group: '', recon: false },
    { id: 'v3', fund: 'bank', no: 'PT-1020-0001', date: '2026-10-20', type: 'thu', who: '', bank: '', amount: 350000, reason: 'Nhận khoản thanh toán VND 350.000', group: '', recon: false },
    { id: 'v4', fund: 'cash', no: 'PT-1120-0001', date: new Date().toISOString().slice(0, 10), type: 'thu', who: 'Khách lẻ', bank: '', amount: 200000, reason: 'Thu tiền dịch vụ', group: '', recon: false },
  ],
  debts: [{ id: 'd1', kind: 'thu', who: 'Công ty Du lịch ABC', due: '2026-12-05', amount: 3000000, paid: 1000000, note: 'Công nợ đoàn tháng 11' }, { id: 'd2', kind: 'chi', who: 'Nhà cung cấp Giặt ủi', due: '2026-12-01', amount: 1500000, paid: 0, note: 'Tiền giặt ủi tháng 11' }],
  shifts: [{ id: 's1', no: 'Ca #1', opened: '05/11/2026 06:00', closed: '05/11/2026 14:00', from: 'Lễ tân A', to: 'Lễ tân B', opening: 500000, thuCash: 1200000, thuBank: 300000, chiCash: 200000, chiBank: 0, real: 1500000, next: 1000000, mgr: 500000, tasks: [{ t: 'Nhắc khách phòng 102 gia hạn', urgent: false }], note: '', logs: [{ at: '05/11/2026 14:00', by: 'Lễ tân A', act: 'Tạo bàn giao ca', detail: 'Bàn giao cho Lễ tân B: ca sau 1.000.000đ, quản lý 500.000đ; thực tế trong két 1.500.000đ' }, { at: '05/11/2026 14:02', by: 'Lễ tân B', act: 'Nhận ca', detail: 'Thực nhận 1.000.000đ' }, { at: '05/11/2026 15:00', by: 'Kế toán', act: 'Đối soát ca', detail: 'Kiểm đếm 1.500.000đ, khớp sổ' }], status: 'Đã đối soát', recv: { by: 'Lễ tân B', at: '05/11/2026 14:02', counted: 1000000, note: '' }, recon: { by: 'Kế toán', at: '05/11/2026 15:00', counted: 1500000, note: '' } },
    { id: 's2', no: 'Ca #2', opened: '05/11/2026 14:00', closed: '05/11/2026 22:00', from: 'Lễ tân B', to: 'Lễ tân A', opening: 1000000, thuCash: 770000, thuBank: 200000, chiCash: 300000, chiBank: 0, real: 1450000, next: 450000, mgr: 1000000, tasks: [{ t: 'Dọn phòng 103 trước 8h sáng', urgent: true }], note: 'Két thiếu 20.000đ, đang kiểm tra lại hoá đơn', logs: [{ at: '05/11/2026 22:00', by: 'Lễ tân B', act: 'Tạo bàn giao ca', detail: 'Bàn giao cho Lễ tân A: ca sau 450.000đ, quản lý 1.000.000đ; thực tế trong két 1.450.000đ' }, { at: '05/11/2026 22:00', by: 'Hệ thống', act: 'Phát hiện chênh lệch', detail: 'Dự kiến 1.470.000đ, thực tế 1.450.000đ: thiếu 20.000đ' }], status: 'Chờ nhận ca' }],
  banks: [{ no: '023615325120', bank: 'Viettinbank', br: 'Hồ Chí Minh' }],
};
const subs = new Set();
export const useFin = () => [useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => state), fn => { state = fn(state); subs.forEach(f => f()); }];
export const uid = () => Math.random().toString(36).slice(2, 8);
