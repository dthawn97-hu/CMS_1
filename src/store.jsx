import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ask } from './ui.jsx';

const Ctx = createContext(null);
export const useDB = () => useContext(Ctx);
export const uid = () => Math.random().toString(36).slice(2, 9);

export function DBProvider({ children }) {
  const [db, setDb] = useState(null), [err, setErr] = useState(false);
  useEffect(() => { fetch('/api/db').then(r => r.json()).then(setDb).catch(() => setErr(true)); }, []);
  // commit: replace one top-level key (state + server)
  const commit = useCallback((k, val) => {
    setDb(d => ({ ...d, [k]: val }));
    return fetch('/api/' + k, { method: 'PUT', body: JSON.stringify(val) }).then(r => { if (!r.ok) throw 0; }).catch(() => toast('Lưu thất bại — kiểm tra server', true));
  }, []);
  if (err) return <p className="p-8 text-red-600">Không kết nối được server. Chạy: npm run dev</p>;
  if (!db) return <p className="p-8 text-slate-400">Đang tải…</p>;
  return <Ctx.Provider value={{ db, commit }}>{children}</Ctx.Provider>;
}

/* CRUD helpers for list collections */
export function useCrud(coll) {
  const { db, commit } = useDB(), nav = useNavigate();
  return {
    list: db[coll], get: id => db[coll].find(x => x.id === id),
    patch: (id, p) => commit(coll, db[coll].map(x => x.id === id ? { ...x, ...p } : x)),
    remove: async id => { if (await ask('Bạn có chắc muốn xoá mục này? Thao tác không thể hoàn tác.', { title: 'Xoá mục này?', ok: 'Xoá', danger: true })) commit(coll, db[coll].filter(x => x.id !== id)); },
    save: async (id, v, back) => { await commit(coll, id ? db[coll].map(x => x.id === id ? { ...x, ...v } : x) : [...db[coll], { id: uid(), ...v }]); toast(id ? 'Đã cập nhật' : 'Đã tạo mới'); if (back) nav(back); }
  };
}

/* ---------- calendar / pricing helpers ---------- */
export const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return ymd(d); };
export const wd = s => (new Date(s + 'T00:00').getDay() + 6) % 7; // Mon=0
export const num = v => (v === '' || v == null || isNaN(+v)) ? null : +v;
export const money = n => Math.round(n).toLocaleString('vi-VN');
// Kênh gắn với công thức giá thông minh: danh sách chọn f.channels; công thức cũ chưa chọn thì khớp theo tên nhận diện
export const fmChans = (db, f) => f.channels?.length ? f.channels : f.ten_nhan_dien ? db.channels.filter(c => c.name.toLowerCase().includes(f.ten_nhan_dien.toLowerCase())).map(c => c.id) : [];
export const stdPolicy = db => db.policies.find(p => p.ma_chinh_sach_gia === 'Standard');
export const dayOf = (db, r, d) => db.cal[r]?.[d] || { p: {}, s: {}, l: {} };
export const mutDay = (cal, r, d) => ((cal[r] ||= {})[d] ||= { p: {}, s: {}, l: {} });
export const availOf = (db, room, d) => dayOf(db, room.id, d).a ?? room.so_luong_phong;
// Prices/limits are stored per (policy, channel) pair so each one is independent: p["policy@channel"], l["limit@channel@policy"], s["policy@channel"].
// Fallbacks keep older data working: policy-wide p[policy], global l[limit], per-channel s[channel].
export const basePrice = (db, room, d, cid) => { const p = dayOf(db, room.id, d).p, sid = stdPolicy(db)?.id; return p[`${sid}@${cid}`] ?? p[sid] ?? num(room.gia_ngay_thuong) ?? 0; };
export function smartPrice(db, f, room, d, cid, pid) { // default S = ((B + d1) * k + d2) / Π(1 - layer%), B = this channel's own base price; an explicit edit wins
  const p = dayOf(db, room.id, d).p, own = p[`${pid}@${cid}`] ?? p[pid]; if (own != null) return own;
  const den = String(f.layers || '').split(',').filter(x => x.trim()).reduce((a, l) => a * (1 - l / 100), 1);
  return (((basePrice(db, room, d, cid) + (+f.d1 || 0)) * (+f.k || 1)) + (+f.d2 || 0)) / (den || 1);
}
export const limitOf = (db, room, d, k, cid, pid) => { const l = dayOf(db, room.id, d).l; return l[`${k}@${cid}@${pid}`] ?? l[k]; };
export const isOpen = (db, room, d, cid, pid) => { const s = dayOf(db, room.id, d).s; return !(s[`${pid}@${cid}`] ?? s[cid]); };
export function eachDay(from, to, fn) {
  if (!from || !to || to < from) { toast('Khoảng ngày không hợp lệ', true); return false; }
  if (from < ymd(new Date())) { toast('Không cập nhật ngày trong quá khứ', true); return false; }
  for (let d = from, i = 0; d <= to && i < 800; d = addDays(d, 1), i++) fn(d, wd(d)); return true;
}
