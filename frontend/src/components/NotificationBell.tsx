'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/client';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  contract: '📝',
  comment: '💬',
  like: '❤️',
  price: '💰',
  system: '🔔',
  community: '🤝',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  return `${days}일 전`;
}

const FALLBACK: Notification[] = [
  { id:1, type:'contract', title:'계약 서명 요청', message:'에비스 디아쥬 1LDK 계약서에 서명이 필요합니다.', link:'/contracts/2', read:false, createdAt:'2026-04-07T09:00:00Z' },
  { id:2, type:'comment', title:'새 댓글', message:'이유진님이 댓글을 남겼습니다.', link:'/community/1', read:false, createdAt:'2026-04-06T15:30:00Z' },
  { id:4, type:'price', title:'가격 변동', message:'신주쿠산초메 1K 월세가 변경되었습니다.', link:'/properties/1', read:false, createdAt:'2026-04-05T18:00:00Z' },
  { id:6, type:'community', title:'모임 알림', message:'4/12 시부야 한일교류 모임 D-5!', link:'/community/3', read:false, createdAt:'2026-04-07T08:00:00Z' },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await getNotifications() as any;
      if (data?.notifications) {
        setNotes(data.notifications);
        setUnread(data.unreadCount || 0);
      } else throw new Error('');
    } catch {
      setNotes(FALLBACK);
      setUnread(FALLBACK.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRead = async (n: Notification) => {
    if (!n.read) {
      try { await markNotificationRead(n.id); } catch {}
      setNotes(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
  };

  const handleReadAll = async () => {
    try { await markAllNotificationsRead(); } catch {}
    setNotes(prev => prev.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1.5 hover:bg-gray-100 transition" aria-label="알림">
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center min-w-[18px] px-1" style={{ borderRadius:'9px' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-xl z-[9999] max-h-[420px] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-800">🔔 알림</h3>
            {unread > 0 && (
              <button onClick={handleReadAll} className="text-[11px] text-green-600 font-bold hover:underline">모두 읽음</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">알림이 없습니다</div>
            ) : (
              notes.map(n => (
                <Link key={n.id} href={n.link || '#'} onClick={() => handleRead(n)}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.read ? 'bg-green-50/50' : ''}`}>
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-xs font-bold truncate ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
