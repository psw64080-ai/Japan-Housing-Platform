import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import ChatBot from '@/components/ChatBot';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'Japan Housing Connect - 일본 거주 외국인을 위한 최고의 선택',
  description: 'AI 기반 일본 주택 검색, 계약부터 생활까지 한번에 안전하게 해결하세요.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </head>
      <body className="bg-light font-sans text-text antialiased overflow-x-hidden">
        <NavBar />
        
        {/* Main Content Area */}
        <main className="min-h-[calc(100vh-200px)] pb-16 lg:pb-0">
          {children}
        </main>

        <Footer />
        <MobileNav />
        <ChatBot />
      </body>
    </html>
  );
}
