'use client';

import { useState } from 'react';
import { toggleSaveProperty } from '@/lib/api/client';

interface Props {
  propertyId: number;
  initialSaved?: boolean;
  size?: 'sm' | 'md';
}

export default function SaveButton({ propertyId, initialSaved = false, size = 'md' }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const result = await toggleSaveProperty(propertyId) as any;
      setSaved(result?.saved ?? !saved);
    } catch {
      setSaved(!saved);
    }
    setLoading(false);
  };

  const sizeClasses = size === 'sm'
    ? 'w-8 h-8 text-base'
    : 'w-10 h-10 text-lg';

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${sizeClasses} flex items-center justify-center rounded-full transition bg-white/90 hover:bg-white shadow-sm border border-gray-100 ${loading ? 'opacity-50' : ''}`}
      title={saved ? '찜 해제' : '찜하기'}
    >
      {saved ? '❤️' : '🤍'}
    </button>
  );
}
