'use client';

import { useState } from 'react';

interface NamePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function NamePromptModal({
  isOpen,
  onClose,
  onSubmit,
}: NamePromptModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Enter your name
        </h2>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(name);
              setName('');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
