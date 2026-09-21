export const INITIAL_BALANCES = { USDT: { available: 25000, reserved: 0 }, ETH: { available: 4.2, reserved: 0 }, BTC: { available: .15, reserved: 0 } };
export function validateOrder({ side, type, price, amount }, balances, base = 'ETH', quote = 'USDT') {
  const qty = Number(amount), px = Number(price);
  if (!Number.isFinite(qty) || qty <= 0) return 'Введіть коректну кількість';
  if (decimalPlaces(qty) > 6) return 'Максимум 6 знаків для кількості';
  if (type === 'limit' && (!Number.isFinite(px) || px <= 0)) return 'Введіть коректну ціну';
  const effective = px;
  if (side === 'buy' && qty * effective > balances[quote].available + 1e-9) return `Недостатньо ${quote}`;
  if (side === 'sell' && qty > balances[base].available + 1e-9) return `Недостатньо ${base}`;
  return null;
}
const decimalPlaces = n => (String(n).split('.')[1] || '').length;
export function reserveLimit(balances, order, base='ETH', quote='USDT') {
  const out = structuredClone(balances); const asset = order.side === 'buy' ? quote : base;
  const value = order.side === 'buy' ? order.amount * order.price : order.amount;
  out[asset].available -= value; out[asset].reserved += value; return out;
}
export function cancelLimit(balances, order, base='ETH', quote='USDT') {
  const out = structuredClone(balances); const asset = order.side === 'buy' ? quote : base;
  const value = order.side === 'buy' ? order.amount * order.price : order.amount;
  out[asset].available += value; out[asset].reserved -= value; return out;
}
export function executeMarket(balances, order, marketPrice, base='ETH', quote='USDT') {
  const out = structuredClone(balances), cost = order.amount * marketPrice;
  if (order.side === 'buy') { out[quote].available -= cost; out[base].available += order.amount; }
  else { out[base].available -= order.amount; out[quote].available += cost; }
  return out;
}
