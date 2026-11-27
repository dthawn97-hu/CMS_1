import { useState } from 'react';
import { Save } from 'lucide-react';
import { Btn, Card, Select, TimeField, Title, toast } from '../ui.jsx';

// ponytail: chỉ lưu trong state của trang (PMS chưa có backend) — nối API khi có PMS
const TZ = ['Việt Nam (GMT+7)', 'Lào / Campuchia / Thái Lan (GMT+7)', 'Singapore / Malaysia (GMT+8)', 'Nhật Bản / Hàn Quốc (GMT+9)', 'Giờ UTC (GMT+0)'];
const Lbl = ({ l, children, className = '' }) => <label className={`block ${className}`}><span className="block text-xs text-slate-600 mb-1.5">{l}</span>{children}</label>;
const Time = ({ v, set }) => narrow() ? <TimeField value={v} onChange={set} /> : <input type="time" className="field" value={v} onChange={e => set(e.target.value)} />;
const narrow = () => window.matchMedia('(max-width:767px)').matches;
const Hint = ({ children }) => <p className="text-xs text-slate-500">{children}</p>;
const SaveBtn = ({ children = 'Lưu', ...p }) => <Btn className="max-md:w-full" {...p}><Save className="w-4 h-4 mr-2 inline" />{children}</Btn>;

export default function HoursSettings() {
  const [inn, setIn] = useState('14:00'), [out, setOut] = useState('12:00'), [real, setReal] = useState(false), [round, setRound] = useState(true), [mins, setMins] = useState('15'),
    [ns, setNs] = useState('19:00'), [ne, setNe] = useState('10:00'), [tz, setTz] = useState(TZ[0]), [tz0, setTz0] = useState(TZ[0]);
  return <>
    <Title keep t="Cấu hình giờ" sub="Cấu hình giờ nhận, trả phòng, giờ qua đêm và múi giờ." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
      <Card className="p-7 max-md:p-4 space-y-5"><h3 className="font-semibold text-ink text-base">Giờ nhận / trả phòng</h3>
        <Lbl l="Giờ nhận phòng (check-in)"><Time v={inn} set={setIn} /></Lbl>
        <Lbl l="Giờ trả phòng (check-out)"><Time v={out} set={setOut} /></Lbl>
        <div className="space-y-1.5"><label className="flex items-center gap-3"><input type="checkbox" checked={real} onChange={e => setReal(e.target.checked)} />Thời gian khi tạo mới đặt phòng</label>
          <Hint>Tắt: hệ thống dùng đúng giờ thực tế lúc lễ tân tạo đặt phòng.</Hint></div>
        <div className="space-y-3"><label className="flex items-center gap-3"><input type="checkbox" checked={round} onChange={e => setRound(e.target.checked)} />Số phút làm tròn 1 giờ</label>
          {round && <Select className="w-36 max-md:w-full" f={{ v: { mins }, set: (k, x) => setMins(x) }} k="mins" opts={[5, 10, 15, 30, 60].map(m => [String(m), `${m} phút`])} />}</div>
        <SaveBtn onClick={() => toast('Đã lưu giờ nhận / trả phòng')} /></Card>
      <Card className="p-7 max-md:p-4 space-y-5"><h3 className="font-semibold text-ink text-base">Giờ qua đêm & Múi giờ</h3>
        <div className="text-xs text-slate-600">Cấu hình giờ qua đêm</div>
        <div className="grid grid-cols-2 gap-4"><Lbl l="Bắt đầu"><Time v={ns} set={setNs} /></Lbl><Lbl l="Kết thúc"><Time v={ne} set={setNe} /></Lbl></div>
        <Hint>Check-in trước khung giờ này tính giá ngày, sau đó tính giá đêm.</Hint>
        <SaveBtn onClick={() => toast('Đã lưu giờ qua đêm')} />
        <div className="border-t pt-5 space-y-3"><Lbl l="Múi giờ khách sạn"><Select f={{ v: { tz }, set: (k, x) => setTz(x) }} k="tz" opts={TZ} /></Lbl>
          <Btn kind="ghost" className="max-md:w-full" disabled={tz === tz0} onClick={() => { setTz0(tz); toast('Đã lưu múi giờ'); }}>Lưu múi giờ</Btn></div></Card></div></>;
}
