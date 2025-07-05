'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  value: string;
}

export default function QRGenerator({ value }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} />
      <p className="text-xs text-gray-500 mt-2">Scan QR to open link</p>
    </div>
  );
}
