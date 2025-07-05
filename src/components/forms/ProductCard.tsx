'use client';

import React from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  image?: string;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

export default function ProductCard({
  name,
  price,
  image,
  quantity,
  onQuantityChange,
}: ProductCardProps) {
  return (
    <div className="flex gap-4 border border-gray-200 p-3 rounded-lg items-center bg-gray-50">
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-16 h-16 object-cover rounded-lg border"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs border">
          No Image
        </div>
      )}

      <div className="flex-1">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-sm text-gray-600">₹{price}</p>
      </div>

      <input
        type="number"
        min={0}
        value={quantity}
        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
        className="w-16 text-center border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-indigo-400"
      />
    </div>
  );
}
