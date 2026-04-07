'use client';

import { useState, useEffect } from 'react';
import { getLang, setLang, Language } from '@/lib/i18n';

const LANGS: { key: Language; flag: string; label: string }[] = [
  { key: 'ko', flag: '🇰🇷', label: '한국어' },
  { key: 'ja', flag: '🇯🇵', label: '日本語' },
  { key: 'en', flag: '🇺🇸', label: 'English' },
];

export default function LanguageSwitcher() {
  const [current, setCurrent] = useState<Language>('ko');

  useEffect(() => {
    setCurrent(getLang());
  }, []);

  return (
    <div className="flex gap-3 font-bold text-xs">
      {LANGS.map(l => (
        <button
          key={l.key}
          onClick={() => { if (l.key !== current) setLang(l.key); }}
          className={`flex items-center gap-1 transition ${
            l.key === current
              ? 'text-primary'
              : 'text-muted hover:text-text hover:underline cursor-pointer'
          }`}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
