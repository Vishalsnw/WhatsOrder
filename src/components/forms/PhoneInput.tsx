'use client';

import React, { useState, useEffect } from 'react';
import { COUNTRY_CODES, parsePhoneNumber, formatWhatsAppNumber } from '@/lib/countryCodes';

interface PhoneInputProps {
  value: string; // full number e.g. "+919876543210" or "9876543210"
  onChange: (fullFormattedNumber: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}

export default function PhoneInput({
  value,
  onChange,
  label = 'WhatsApp Number',
  required = true,
  placeholder = '123 456 7890',
  helperText = 'Orders will be sent directly to this WhatsApp number.',
}: PhoneInputProps) {
  // Parse initial value into dial code & local number
  const parsed = parsePhoneNumber(value || '');
  const [dialCode, setDialCode] = useState(parsed.dialCode || '+1');
  const [localNumber, setLocalNumber] = useState(parsed.localNumber || '');

  // Keep internal state synced if external value changes
  useEffect(() => {
    if (value) {
      const p = parsePhoneNumber(value);
      setDialCode(p.dialCode);
      setLocalNumber(p.localNumber);
    }
  }, [value]);

  const handleDialCodeChange = (newCode: string) => {
    setDialCode(newCode);
    const cleanedFull = formatWhatsAppNumber(localNumber, newCode);
    onChange('+' + cleanedFull);
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^\d\s-]/g, '');
    const cleanDigits = rawVal.replace(/\D/g, '');
    setLocalNumber(cleanDigits);
    const cleanedFull = formatWhatsAppNumber(cleanDigits, dialCode);
    onChange('+' + cleanedFull);
  };

  const currentCountry = COUNTRY_CODES.find(c => c.dialCode === dialCode) || COUNTRY_CODES[0];
  const cleanedFullNumber = formatWhatsAppNumber(localNumber, dialCode);
  const isValidLength = cleanedFullNumber.length >= 8 && cleanedFullNumber.length <= 15;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative min-w-[120px] sm:min-w-[140px]">
          <select
            value={dialCode}
            onChange={(e) => handleDialCodeChange(e.target.value)}
            className="w-full h-12 pl-3 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium text-gray-800 appearance-none shadow-sm cursor-pointer"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
                {c.flag} {c.dialCode} ({c.code})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 text-xs">
            ▼
          </div>
        </div>

        {/* Local Number Input */}
        <div className="relative flex-1">
          <input
            type="tel"
            value={localNumber}
            onChange={handleLocalNumberChange}
            placeholder={placeholder}
            required={required}
            className={`w-full h-12 px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:outline-none text-sm font-medium text-gray-900 shadow-sm ${
              localNumber.length > 0 && !isValidLength
                ? 'border-amber-400 focus:ring-amber-400'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {localNumber.length > 0 && isValidLength && (
            <span className="absolute right-3 top-3.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
              ✓ Valid
            </span>
          )}
        </div>
      </div>

      {/* Verification & Preview Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-1 pt-1">
        <span>{helperText}</span>
        {cleanedFullNumber.length > 0 && (
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
            WhatsApp format: <strong className="text-blue-600">+{cleanedFullNumber}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
