import { useState } from 'react';
import { Tabs } from '../ui.jsx';
import { CashBook } from './FinanceCash.jsx';
import { CashFund, BankFund } from './FinanceFunds.jsx';

const T = [['cash', 'Quỹ tiền mặt', CashFund], ['bank', 'Quỹ tiền gửi', BankFund], ['rep', 'Báo cáo tài chính', CashBook]];
export default function CashFlow() {
  const [tab, setTab] = useState('cash'), P = T.find(x => x[0] === tab)[2];
  return <><Tabs value={tab} onChange={setTab} items={T.map(x => x.slice(0, 2))} /><P /></>;
}
