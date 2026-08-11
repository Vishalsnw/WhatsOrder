export interface CountryCode {
  code: string; // ISO 2 letter
  name: string;
  dialCode: string; // e.g. "+1", "+91"
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
];

/**
 * Formats raw input into clean numeric-only E.164 string for WhatsApp wa.me link
 * Example: dialCode "+1", phone "555-0199" -> "15550199"
 * Example: full raw "+91 98765 43210" -> "919876543210"
 */
export function formatWhatsAppNumber(phone: string, defaultDialCode = '+1'): string {
  if (!phone) return '';
  // Remove all non-digits except initial '+'
  let cleaned = phone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else {
    // If user provided a plain local number without dial code
    const rawDial = defaultDialCode.replace(/\D/g, '');
    // If the number starts with 0 (e.g. 07123456789 in UK), strip leading 0
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    cleaned = rawDial + cleaned;
  }

  // Remove any remaining non-digit characters
  return cleaned.replace(/\D/g, '');
}

/**
 * Parse phone into dialCode and local phone
 */
export function parsePhoneNumber(fullPhone: string): { dialCode: string; localNumber: string } {
  if (!fullPhone) return { dialCode: '+1', localNumber: '' };
  
  const digitsOnly = fullPhone.replace(/\D/g, '');
  
  // Try matching against sorted dialCodes by length descending
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sortedCodes) {
    const codeDigits = c.dialCode.replace(/\D/g, '');
    if (digitsOnly.startsWith(codeDigits)) {
      return {
        dialCode: c.dialCode,
        localNumber: digitsOnly.substring(codeDigits.length),
      };
    }
  }

  // Fallback to +1 if not matched
  return { dialCode: '+1', localNumber: digitsOnly };
}
