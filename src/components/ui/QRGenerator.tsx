'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRGeneratorProps {
  value: string;
  size?: number;
  logo?: string;
  title?: string;
}

export default function QRGenerator({
  value,
  size = 180,
  logo,
  title = 'Scan to Order',
}: QRGeneratorProps) {
  return (
    <div className="flex flex-col items-center space-y-3 p-4 rounded-xl border shadow bg-white">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <QRCodeCanvas
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin
        imageSettings={
          logo
            ? {
                src: logo,
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }
            : undefined
        }
      />
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-indigo-600 underline mt-2"
      >
        Open Link
      </a>
    </div>
  );
}
