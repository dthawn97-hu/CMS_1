import { useSyncExternalStore } from 'react';

// Danh mục cấu hình dùng chung cho booking (Công ty, Thị trường) — trong bộ nhớ, mất khi tải lại; thay bằng API cấu hình khi có backend
const subs = new Set();
let s = { info: {}, companies: ['Công Ty TNHH Bellhop', 'Công Ty TNHH Giải Pháp Phần Mềm Bellhop'], markets: ['Việt Nam', 'Hàn Quốc', 'Nhật Bản', 'Mỹ', 'Trung Quốc', 'Châu Âu', 'Khác'] };
export const addOpt = (k, v, data = {}) => { if (s[k].some(o => o.toLowerCase() === v.toLowerCase())) return; s = { ...s, [k]: [...s[k], v], info: { ...s.info, [k + '|' + v]: data } }; subs.forEach(f => f()); };
export const useBookingCfg = () => useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => s);
