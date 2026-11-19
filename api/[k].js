// Vercel: API demo, dữ liệu mẫu trong bộ nhớ (ghi tạm, có thể về lại dữ liệu mẫu khi hàm khởi động lại)
import { SEED } from '../seed.js';
let db = structuredClone(SEED);
export default function handler(req, res) {
  const k = req.query.k;
  if (req.method === 'GET' && k === 'db') return res.status(200).json(db);
  if (req.method === 'PUT' && k in SEED) { try { db[k] = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; return res.status(200).json({ ok: true }); } catch (e) { return res.status(400).json({ error: e.message }); } }
  res.status(404).json({ error: 'not found' });
}
