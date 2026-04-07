'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatbotMessage } from '@/lib/api/client';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

const QUICK_QUESTIONS = [
  '집 구하는 방법',
  '초기비용 얼마?',
  '이사 업체 추천',
  '셰어하우스 정보',
  '보증인 없어도 돼?',
  '생활비 얼마?',
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'bot',
      text: '안녕하세요! 🏠 Housing Connect AI입니다.\n일본 주거·생활에 관해 무엇이든 물어보세요!',
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: idRef.current++, role: 'user', text: trimmed, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatbotMessage(trimmed);
      const botMsg: ChatMessage = {
        id: idRef.current++,
        role: 'bot',
        text: res.reply,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((u) => u + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          role: 'bot',
          text: '죄송합니다, 응답을 받지 못했어요. 잠시 후 다시 시도해주세요.',
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* 마크다운 간이 렌더링: **bold**, [text](url), | 테이블 |, 줄바꿈 */
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // 테이블 구분선 스킵
      if (/^\|[-|: ]+\|$/.test(line.trim())) return null;
      // 테이블 행
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').filter(Boolean).map((c) => c.trim());
        return (
          <div key={i} className="flex text-xs gap-0">
            {cells.map((cell, j) => (
              <span key={j} className={`flex-1 px-1 py-0.5 ${i === 0 ? 'font-bold' : ''}`}>
                {cell}
              </span>
            ))}
          </div>
        );
      }
      // 일반 텍스트 — bold + 링크
      let processed = line
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-green-600 underline hover:text-green-700">$1</a>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ boxShadow: '0 4px 20px rgba(0,199,60,0.4)' }}
      >
        {open ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            <circle cx="8" cy="10" r="1" />
            <circle cx="12" cy="10" r="1" />
            <circle cx="16" cy="10" r="1" />
          </svg>
        )}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* 챗 윈도우 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9998] w-[380px] max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '560px', maxHeight: 'calc(100vh - 120px)' }}>
          
          {/* 헤더 */}
          <div className="bg-green-500 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="font-bold text-sm leading-tight">AI 생활 어시스턴트</p>
                <p className="text-[10px] text-green-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse"></span>
                  온라인 · 한국어 대응
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition p-1">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  {msg.role === 'bot' && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs">🤖</span>
                      <span className="text-[10px] text-gray-400 font-bold">AI 어시스턴트</span>
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-green-500 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg'
                        : 'bg-white text-gray-700 border border-gray-100 rounded-tr-lg rounded-bl-lg rounded-br-lg shadow-sm'
                    }`}
                  >
                    {msg.role === 'bot' ? renderText(msg.text) : msg.text}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-0.5 ${msg.role === 'user' ? 'text-right' : ''}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-tr-lg rounded-bl-lg rounded-br-lg px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 빠른 질문 */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0">
              <p className="text-[10px] text-gray-400 font-bold mb-1.5">💡 이런 것도 물어보세요</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 입력 */}
          <div className="px-3 py-2 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(input); }}
                placeholder="질문을 입력하세요..."
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-green-400 bg-gray-50"
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition flex-shrink-0"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="text-[9px] text-gray-300 text-center mt-1">Housing Connect AI · 일본 생활 도우미</p>
          </div>
        </div>
      )}
    </>
  );
}
