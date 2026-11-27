import { useSyncExternalStore } from 'react';

// Gói đang dùng — tạm thời đổi được ở header để xem hệ thống theo từng gói (chưa có backend gói dịch vụ)
export const PLAN_IDS = ['free', 'pro', 'max'], PLAN_NAMES = { free: 'Miễn phí', pro: 'Cơ bản', max: 'Nâng cao' };
const K = 'bellhop.plan', subs = new Set();
let plan = 'pro'; try { const v = localStorage.getItem(K); if (PLAN_IDS.includes(v)) plan = v; } catch { /* không có localStorage thì giữ mặc định */ }
export const setPlan = id => { plan = id; try { localStorage.setItem(K, id); } catch { /* bỏ qua */ } subs.forEach(f => f()); };
export const usePlan = () => useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => plan);
