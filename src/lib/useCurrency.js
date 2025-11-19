import { useState, useEffect, useCallback } from 'react';

const DEFAULT_CURRENCY = 'USD';
const STORAGE_KEY = 'app_currency';

export default function useCurrency() {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCurrency(stored);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch (e) {
      // ignore storage errors
    }
  }, [currency]);

  const format = useCallback(
    (value, opts = {}) => {
      const v = (typeof value === 'number') ? value : Number(value) || 0;
      // choose locale by currency, default USD en-US
      const locale = opts.locale || (currency === 'INR' ? 'en-IN' : 'en-US');
      const maximumFractionDigits = opts.maximumFractionDigits ?? (currency === 'JPY' ? 0 : 2);
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits,
        }).format(v);
      } catch (e) {
        // fallback to simple formatting
        return (currency ? currency + ' ' : '') + v.toFixed(Math.max(0, maximumFractionDigits));
      }
    },
    [currency]
  );

  return { currency, setCurrency, format };
}
