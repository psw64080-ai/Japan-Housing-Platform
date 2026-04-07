'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', icon: '🏠', label: '홈' },
  { href: '/properties', icon: '🔍', label: '매물' },
  { href: '/map', icon: '🗺️', label: '지도' },
  { href: '/community', icon: '💬', label: '커뮤니티' },
  { href: '/mypage', icon: '👤', label: 'MY' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {TABS.map(tab => {
          const isActive = tab.href === '/' ? pathname === '/' : (pathname === tab.href || pathname?.startsWith(tab.href + '/'));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
