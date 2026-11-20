import { useSyncExternalStore } from 'react';

// ponytail: store dùng chung trong bộ nhớ cho các trang kho/mua hàng (PMS chưa có backend) — mất khi tải lại trang; thay bằng API khi có PMS
const L = (m, q, p = 0) => ({ m, q, p });
let state = {
  whs: [{ id: 'k1', name: 'Kho tổng', addr: '', desc: '', roles: [], on: true }, { id: 'k2', name: 'Kho phụ', addr: '', desc: '', roles: [], on: true }],
  sups: [{ id: 's1', code: 'NCC001', name: 'Nhà cung cấp Kiểm Thử', desc: '', phone: '', mobile: '', email: '', fax: '', rep: '', vat: '', bank: '', acc: '', holder: '', qr: '', on: true },
    { id: 's2', code: 'ABC_01', name: 'Công ty ABC', desc: '', phone: '', mobile: '', email: '', fax: '', rep: '', vat: '', bank: '', acc: '', holder: '', qr: '', on: true }],
  mats: [{ id: 'm1', name: 'Chăn', unit: 'cái', min: 5, sup: 's2', grp: 'Vải' }, { id: 'm2', name: 'Khăn tắm', unit: 'cái', min: 0, sup: 's1', grp: 'Vải' }, { id: 'm3', name: 'Nước suối 500ml', unit: 'chai', min: 0, sup: '', grp: 'Đồ uống' }],
  // docs: in = nhập, out = xuất, move = điều chuyển, adj = chênh lệch kiểm kê, ret = trả lại hàng mua
  docs: [
    { id: 'd5', kind: 'in', no: 'PN-000005', date: '2026-10-20', wh: 'k1', sup: 's2', note: '', po: '', inv: '', lines: [L('m3', 10, 4000)] },
    { id: 'd4', kind: 'in', no: 'PN-000004', date: '2026-10-19', wh: 'k2', sup: 's2', note: '', po: 'PO-20261019-1556', inv: '', lines: [L('m1', 60, 25000)] },
    { id: 'd1', kind: 'in', no: 'PN-000001', date: '2026-09-09', wh: 'k1', sup: 's1', note: '', po: 'PO-SMK-001', inv: '', lines: [L('m2', 12, 75000)] },
    { id: 'r1', kind: 'ret', no: 'TH-000001', date: '2026-10-25', wh: 'k1', sup: 's2', note: 'Trả chăn lỗi', po: '', inv: '', lines: [L('m1', 10, 50000)] }],
  counts: [{ id: 'c1', no: 'KK00001', date: '2026-10-20', wh: 'k2', note: '', st: 'Chưa xử lý', lines: [{ m: 'm1', sys: 50, real: 48 }] }],
  reports: [{ id: 'b1', no: 'BH00001', date: '2026-10-19', note: 'Cần 50 khăn tắm', st: 'Chưa tạo đặt hàng', lines: [{ m: 'm2', q: 50 }] }],
  pos: [{ id: 'p1', no: 'PO-20261019-1556', date: '2026-10-19', sup: 's2', wh: 'k2', eta: '2026-10-19', note: '', st: 'Đã thực hiện', lines: [L('m1', 60, 25000)] },
    { id: 'p2', no: 'PO-SMK-001', date: '2026-09-05', sup: 's1', wh: 'k1', eta: '', note: '', st: 'Đã thực hiện', lines: [] }],
  pays: [],
};
const subs = new Set();
export const useStock = () => [useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => state), fn => { state = fn(state); subs.forEach(f => f()); }];
export const uid = () => Math.random().toString(36).slice(2, 8);
export const total = d => d.lines.reduce((a, l) => a + l.q * l.p, 0);
// [nhập, xuất] của một dòng phiếu với bộ lọc kho (wh rỗng = tất cả kho; điều chuyển nội bộ không tính)
export const deltas = (d, l, wh) => {
  if (d.kind === 'move') return !wh ? [0, 0] : d.to === wh ? [l.q, 0] : d.wh === wh ? [0, l.q] : [0, 0];
  if (wh && d.wh !== wh) return [0, 0];
  return d.kind === 'in' ? [l.q, 0] : d.kind === 'adj' ? (l.q > 0 ? [l.q, 0] : [0, -l.q]) : [0, l.q];
};
export const stockOf = (s, wh, m) => s.docs.reduce((a, d) => a + d.lines.filter(l => l.m === m).reduce((b, l) => { const [i, o] = deltas(d, l, wh); return b + i - o; }, 0), 0);
export const nextNo = (s, kind) => { const pre = { in: 'PN', out: 'PX', move: 'DC', adj: 'KK', ret: 'TH' }[kind]; return `${pre}-${String(s.docs.filter(d => d.kind === kind).reduce((a, d) => Math.max(a, +d.no.split('-')[1]), 0) + 1).padStart(6, '0')}`; };
export const seqNo = (list, pre) => `${pre}${String(list.reduce((a, x) => Math.max(a, +x.no.replace(/\D/g, '').slice(-5) || 0), 0) + 1).padStart(5, '0')}`;
// công nợ nhà cung cấp = tổng nhập − trả lại − đã thanh toán
export const debtOf = (s, sup) => { const sum = k => s.docs.filter(d => d.kind === k && d.sup === sup).reduce((a, d) => a + total(d), 0), t = sum('in'), r = sum('ret'), p = s.pays.filter(x => x.sup === sup).reduce((a, x) => a + x.amt, 0); return { total: t, ret: r, paid: p, left: t - r - p }; };
