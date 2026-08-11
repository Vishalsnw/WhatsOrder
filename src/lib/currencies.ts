export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR ₹)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD $)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR €)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP £)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED د.إ)' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal (SAR ﷼)' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar (CAD $)' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar (AUD $)' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar (SGD $)' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (MYR RM)' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (BDT ৳)' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee (PKR Rs)' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso (PHP ₱)' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah (IDR Rp)' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (BRL R$)' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso (MXN $)' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound (EGP E£)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (ZAR R)' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (NGN ₦)' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KES KSh)' },
];

export function getCurrencySymbol(currencyCode?: string, fallback: string = '$'): string {
  if (!currencyCode) return fallback;
  const match = CURRENCIES.find(c => c.code.toUpperCase() === currencyCode.toUpperCase());
  if (match) return match.symbol;
  // If it's already a symbol like '$' or '€' or '₹' or 'د.إ'
  if (currencyCode.length <= 4 && !/^[A-Z]{3}$/.test(currencyCode)) return currencyCode;
  return fallback;
}

export function formatPrice(amount: number | string, symbol: string = '$'): string {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
