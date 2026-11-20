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
  banks: [{ no: '023615325120', bank: 'Viettinbank', br: 'Hồ Chí Minh' }],
};
const subs = new Set();
export const useFin = () => [useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => state), fn => { state = fn(state); subs.forEach(f => f()); }];
export const uid = () => Math.random().toString(36).slice(2, 8);
