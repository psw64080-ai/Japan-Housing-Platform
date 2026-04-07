'use client';

import { useEffect, useState } from 'react';
import { getLang, DICT, Language } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Footer() {
  const [lang, setLanguage] = useState<Language>('ko');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLanguage(getLang());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const t = DICT[lang].footer;
  const nav = DICT[lang].nav;

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="text-primary font-bold text-xl flex items-center gap-2 mb-3">
              <img src="/favicon.svg" alt="JHC" className="w-7 h-7 rounded" />
              Housing Connect
            </div>
            <p className="text-sm leading-relaxed text-muted mt-4 whitespace-pre-line">
              {t.desc}
            </p>
          </div>
          
          <div>
            <h4 className="text-text font-bold mb-4">{t.service}</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="/properties" className="hover:text-primary transition-colors">{nav.props}</a></li>
              <li><a href="/sharehouses" className="hover:text-primary transition-colors">{nav.share}</a></li>
              <li><a href="/map" className="hover:text-primary transition-colors">{nav.map || 'Map'}</a></li>
              <li><a href="/contracts" className="hover:text-primary transition-colors">{nav.contract}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-text font-bold mb-4">{t.tools}</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="/calculator" className="hover:text-primary transition-colors">{nav.calc}</a></li>
              <li><a href="/guides" className="hover:text-primary transition-colors">{nav.life}</a></li>
              <li><a href="/community" className="hover:text-primary transition-colors">{nav.community}</a></li>
              <li><a href="/moving-services" className="hover:text-primary transition-colors">{nav.moving}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-text font-bold mb-4">{t.support}</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-primary transition-colors">{t.terms}</a></li>
              <li><a href="#" className="font-bold hover:text-primary transition-colors">{t.privacy}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t.faq}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t.contact}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>&copy; 2026 Japan Housing Connect. All rights reserved.</p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
