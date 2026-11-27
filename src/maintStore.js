import { useSyncExternalStore } from 'react';

// ponytail: lịch bảo trì phòng + yêu cầu xóa chờ quản lý duyệt, lưu trong bộ nhớ (PMS chưa có backend) — thay bằng API khi có PMS
const d = (o, h) => { const x = new Date(); x.setDate(x.getDate() + o); x.setHours(h, 0, 0, 0); const p = n => String(n).padStart(2, '0'); return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(h)}:00`; };
const subs = new Set(), now = () => new Date().toLocaleString('vi-VN'), id = () => Math.random().toString(36).slice(2, 9);
let s = {
  blocks: [{ id: 'b1', room: '205', from: d(0, 8), to: d(2, 18), reason: 'Sửa điều hòa', by: 'Lễ tân' }, { id: 'b2', room: '201', from: d(1, 9), to: d(1, 17), reason: 'Thay ga giường, vệ sinh sâu', by: 'Lễ tân', del: true }],
  reqs: [{ id: 'q1', blockId: 'b2', room: '201', from: d(1, 9), to: d(1, 17), why: 'Bảo trì', reason: 'Nhập nhầm phòng, cần xóa', by: 'Lễ tân Hoa', at: now(), status: 'Chờ duyệt' }] };
const set = f => { s = f(s); subs.forEach(x => x()); };
export const useMaint = () => useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => s);
export const addBlock = b => set(x => ({ ...x, blocks: [...x.blocks, { ...b, id: id(), by: 'Lễ tân' }] }));
export const updBlock = (bid, p) => set(x => ({ ...x, blocks: x.blocks.map(b => b.id === bid ? { ...b, ...p } : b) }));
// lễ tân xin xóa → khối vẫn giữ phòng cho tới khi quản lý duyệt
export const requestDelete = (bid, reason, by = 'Lễ tân') => set(x => { const b = x.blocks.find(k => k.id === bid); return { blocks: x.blocks.map(k => k.id === bid ? { ...k, del: true } : k), reqs: [{ id: id(), blockId: bid, room: b.room, from: b.from, to: b.to, why: b.reason, reason, by, at: now(), status: 'Chờ duyệt' }, ...x.reqs] }; });
export const decide = (rid, ok, by = 'Quản lý', note = '') => set(x => { const r = x.reqs.find(k => k.id === rid); return { blocks: ok ? x.blocks.filter(b => b.id !== r.blockId) : x.blocks.map(b => b.id === r.blockId ? { ...b, del: false } : b), reqs: x.reqs.map(k => k.id === rid ? { ...k, status: ok ? 'Đã duyệt' : 'Từ chối', by2: by, at2: now(), note } : k) }; });
