'use client';

import React from 'react';
import { DeliveryConfig, DeliveryZone } from '@/lib/firestore';

interface DeliveryConfigInputsProps {
  config: DeliveryConfig;
  currencySymbol: string;
  onChange: (updated: DeliveryConfig) => void;
}

export default function DeliveryConfigInputs({
  config,
  currencySymbol,
  onChange,
}: DeliveryConfigInputsProps) {
  const handleToggleEnabled = (enabled: boolean) => {
    onChange({
      ...config,
      enabled,
    });
  };

  const handleTypeChange = (type: 'flat' | 'zones' | 'tiered') => {
    onChange({
      ...config,
      type,
    });
  };

  const handleBaseFeeChange = (feeStr: string) => {
    const fee = Math.max(0, parseFloat(feeStr) || 0);
    onChange({
      ...config,
      baseFee: fee,
    });
  };

  const handleToggleFreeDelivery = (enableFreeDelivery: boolean) => {
    onChange({
      ...config,
      enableFreeDelivery,
    });
  };

  const handleFreeThresholdChange = (thresholdStr: string) => {
    const freeDeliveryThreshold = Math.max(0, parseFloat(thresholdStr) || 0);
    onChange({
      ...config,
      freeDeliveryThreshold,
    });
  };

  const handleTogglePickup = (enablePickup: boolean) => {
    onChange({
      ...config,
      enablePickup,
    });
  };

  const handlePickupAddressChange = (pickupAddress: string) => {
    onChange({
      ...config,
      pickupAddress,
    });
  };

  // Zones helper
  const zones = config.zones || [];

  const handleAddZone = () => {
    const newZone: DeliveryZone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${zones.length + 1}`,
      fee: 5,
    };
    onChange({
      ...config,
      zones: [...zones, newZone],
    });
  };

  const handleUpdateZone = (index: number, field: keyof DeliveryZone, value: any) => {
    const updatedZones = [...zones];
    updatedZones[index] = {
      ...updatedZones[index],
      [field]: field === 'fee' ? Math.max(0, parseFloat(value) || 0) : value,
    };
    onChange({
      ...config,
      zones: updatedZones,
    });
  };

  const handleRemoveZone = (index: number) => {
    onChange({
      ...config,
      zones: zones.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-2xl p-4 sm:p-5 border border-blue-100/80 shadow-sm space-y-4">
      {/* Header & Main Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>🚚</span> Smart Delivery Charge Automation
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            Automate delivery fee calculations, free shipping thresholds, or zone rates.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleToggleEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-4 pt-2 border-t border-blue-100">
          {/* Delivery Pricing Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Delivery Fee Structure
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('flat')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all flex flex-col items-center gap-1 ${
                  config.type === 'flat'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">🏷️</span>
                <span>Flat Rate</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('zones')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all flex flex-col items-center gap-1 ${
                  config.type === 'zones'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">📍</span>
                <span>Area / Zones</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('tiered')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all flex flex-col items-center gap-1 ${
                  config.type === 'tiered'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">🎁</span>
                <span>Free Tier Nudge</span>
              </button>
            </div>
          </div>

          {/* Base Delivery Fee */}
          {config.type !== 'zones' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Standard Delivery Fee ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5.00"
                  value={config.baseFee ?? 5}
                  onChange={(e) => handleBaseFeeChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl bg-white text-xs sm:text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Zone Rates Setup */}
          {config.type === 'zones' && (
            <div className="space-y-3 bg-white p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-gray-800">Delivery Zones / Neighborhood Rates</h5>
                  <p className="text-[11px] text-gray-500">Allow customers to choose their delivery area.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddZone}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100"
                >
                  + Add Zone
                </button>
              </div>

              {zones.length === 0 ? (
                <div className="text-center py-3 text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  No delivery zones configured yet. Click &quot;+ Add Zone&quot; above.
                </div>
              ) : (
                <div className="space-y-2">
                  {zones.map((zone, idx) => (
                    <div key={zone.id || idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Zone name (e.g., Local Area 0-5km)"
                        value={zone.name}
                        onChange={(e) => handleUpdateZone(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                      />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-2 text-[10px] text-gray-500 font-bold">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Fee"
                          value={zone.fee}
                          onChange={(e) => handleUpdateZone(idx, 'fee', e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveZone(idx)}
                        className="text-red-500 hover:text-red-700 p-1 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Free Shipping / Delivery Threshold */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>🎉</span> Enable Free Delivery Threshold
              </span>
              <input
                type="checkbox"
                checked={config.enableFreeDelivery ?? true}
                onChange={(e) => handleToggleFreeDelivery(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
            </label>

            {(config.enableFreeDelivery ?? true) && (
              <div className="pt-1.5">
                <label className="block text-[11px] font-medium text-emerald-800 mb-1">
                  Minimum Order Subtotal for FREE Delivery ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-emerald-700 font-bold">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="50"
                    value={config.freeDeliveryThreshold ?? 50}
                    onChange={(e) => handleFreeThresholdChange(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-emerald-300 rounded-lg bg-white text-xs font-semibold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">
                  Customers will see an interactive progress bar showing how much more they need to spend to get Free Delivery!
                </p>
              </div>
            )}
          </div>

          {/* Store Pickup Option */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span>🏬</span> Allow Store / Self-Pickup (Free $0 Fee)
              </span>
              <input
                type="checkbox"
                checked={config.enablePickup ?? true}
                onChange={(e) => handleTogglePickup(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            {(config.enablePickup ?? true) && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Optional Store Pickup Address or Instructions..."
                  value={config.pickupAddress || ''}
                  onChange={(e) => handlePickupAddressChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
