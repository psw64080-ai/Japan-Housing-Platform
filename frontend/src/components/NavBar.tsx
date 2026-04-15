'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, logout as logoutApi } from '@/lib/api/client';
import NotificationBell from '@/components/NotificationBell';
import { getLang, DICT } from '@/lib/i18n';

type CurrentUser = {
  id?: number;
  name?: string;
  email?: string;
};

function useT() {
  const lang = typeof window !== 'undefined' ? getLang() : 'ko';
  return DICT[lang];
}

// NAV_LINKS without icons for cleaner desktop look, Naver style
function getNavLinks(t: typeof DICT['ko']) {
  return [
    { href: '/properties', label: t.nav.props },
    { href: '/map', label: t.nav.map || '지도검색' },
    { href: '/sharehouses', label: t.nav.share },
    { href: '/moving-services', label: t.nav.moving },
    { href: '/calculator', label: t.nav.calc },
    { href: '/contracts', label: t.nav.contract },
    { href: '/community', label: t.nav.community },
    { href: '/guides', label: t.nav.life },
  ];
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const t = useT();
  const NAV_LINKS = getNavLinks(t);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoggedIn(false);
      setUserName('');
      return;
    }

    (async () => {
      try {
        const user = (await getCurrentUser()) as CurrentUser;
        setIsLoggedIn(true);
        setUserName(user?.name || user?.email || 'User');
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        setIsLoggedIn(false);
        setUserName('');
      }
    })();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUserName('');
    router.push('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP UTILITY MENU (Naver style tiny top bar) */}
        <div className="hidden lg:flex justify-end items-center h-8 text-[12px] text-muted space-x-4 border-b border-gray-100">
          <Link href="/" className="hover:text-primary transition-colors">{t.nav.home}</Link>
          <Link href="/guides" className="hover:text-primary transition-colors">{t.nav.guide}</Link>
          {isLoggedIn ? (
            <>
              <Link href="/saved-properties" className="hover:text-primary transition-colors flex items-center gap-1">
                <span>❤️</span> {t.nav.saved || '찜한매물'}
              </Link>
              <button onClick={handleLogout} className="hover:text-primary transition-colors flex-shrink-0">
                {t.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary transition-colors">{t.nav.login}</Link>
              <Link href="/register" className="hover:text-primary transition-colors">{t.nav.register}</Link>
            </>
          )}
        </div>

        {/* MAIN NAV AREA */}
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mr-4 lg:mr-8 hover:opacity-90 transition-opacity">
            <img src="/favicon.svg" alt="JHC" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-sm border border-border/20" />
            <span className="font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tighter text-primary drop-shadow-sm">
              <span className="hidden lg:inline">Housing Connect</span>
              <span className="inline lg:hidden">JHC</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex flex-1 items-center justify-center h-full">
            <ul className="flex items-center h-full space-x-2 lg:space-x-8">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <li key={link.href} className="h-full flex items-center">
                    <Link
                      href={link.href}
                      className={`text-[16px] lg:text-[17px] font-bold px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                        isActive 
                          ? 'text-primary bg-primary-light/50' 
                          : 'text-text hover:text-primary hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* RIGHT ACTION AR EA (SEARCH OR MY PROFILE) */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <Link href="/mypage" className="flex items-center gap-2 bg-light px-3 py-1.5 rounded-full border border-border hover:border-primary transition">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {userName.charAt(0)}
                  </span>
                  <span className="text-sm font-bold text-text truncate max-w-[120px]">
                    {userName}
                  </span>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <button className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-6 py-2 rounded-sm transition-colors shadow-sm">
                  {t.nav.start}
                </button>
              </Link>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            className="lg:hidden text-text hover:text-primary transition-colors p-2 -mr-2 bg-transparent border-none appearance-none outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <div className="w-6 flex flex-col items-end gap-1.5">
              <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
              <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-5'}`}></span>
              <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-4'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-border shadow-xl flex flex-col z-40 max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* Mobile Profile Area */}
          {isLoggedIn ? (
            <div className="p-5 bg-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-text text-lg">{userName}{t.nav.sir}</p>
                  <p className="text-xs text-muted">{t.nav.welcome}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-xs font-bold text-muted border border-border px-3 py-1 bg-white rounded">
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <div className="p-5 bg-light flex gap-3">
              <Link href="/login" className="flex-1 bg-white border border-border text-center py-2.5 font-bold text-text rounded" onClick={() => setIsOpen(false)}>
                {t.nav.login}
              </Link>
              <Link href="/register" className="flex-1 bg-primary text-white text-center py-2.5 font-bold rounded" onClick={() => setIsOpen(false)}>
                {t.nav.register}
              </Link>
            </div>
          )}

          {/* Mobile Menu Links */}
          <ul className="py-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-5 py-3.5 text-base font-bold ${
                      isActive ? 'bg-primary-light text-primary border-l-4 border-primary' : 'text-text hover:bg-light border-l-4 border-transparent'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
