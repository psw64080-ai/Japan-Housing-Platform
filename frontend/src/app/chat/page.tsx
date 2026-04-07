'use client';

import { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendMessage, translateText } from '@/lib/api/client';

interface Message {
  id?: number;
  senderId: number;
  receiverId: number;
  content: string;
  translatedContent?: string;
  timestamp?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = 1;
  const otherUserId = 2;

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await getChatHistory(currentUserId, otherUserId);
      setMessages(data as Message[]);
    } catch {
      // 서버 미연결 시 데모 메시지
      setMessages([
        { senderId: 2, receiverId: 1, content: 'この部屋はまだ空いていますか？', translatedContent: '이 방은 아직 비어 있나요?', timestamp: new Date().toISOString() },
        { senderId: 1, receiverId: 2, content: '네, 현재 입주 가능합니다!', translatedContent: 'はい、現在入居可能です！', timestamp: new Date().toISOString() },
      ]);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      let translatedContent = '';
      if (autoTranslate) {
        const translation = await translateText(newMessage, 'ja');
        translatedContent = (translation as any).translated || '';
      }
      const msg: Message = {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: newMessage,
        translatedContent,
        timestamp: new Date().toISOString(),
      };
      await sendMessage(msg).catch(() => {});
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch {
      const msg: Message = {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: newMessage,
        translatedContent: '(번역 서버 연결 안됨)',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">💬 AI 번역 채팅</h1>
          <p className="text-gray-500 text-sm">집주인과 실시간 대화 — 메시지가 자동으로 번역됩니다</p>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-280px)] sm:h-[calc(100vh-300px)] min-h-[350px] max-h-[700px]">
          {/* Header */}
          <div className="border-b border-gray-200 px-5 py-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full text-white flex items-center justify-center text-sm font-bold">집</div>
              <div>
                <p className="font-bold text-sm text-gray-800">집주인 (田中様)</p>
                <p className="text-xs text-gray-400">온라인</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input type="checkbox" checked={autoTranslate} onChange={() => setAutoTranslate(!autoTranslate)}
                className="accent-green-500" />
              <span className="font-bold text-gray-600">자동번역</span>
            </label>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${isMine ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-800'} px-4 py-3 text-sm shadow-sm`}>
                    <p className="font-bold">{msg.content}</p>
                    {msg.translatedContent && (
                      <p className={`text-xs mt-1.5 pt-1.5 border-t ${isMine ? 'border-green-400 text-green-100' : 'border-gray-100 text-gray-400'}`}>
                        🌐 {msg.translatedContent}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 flex gap-3 bg-white">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 transition"
              placeholder="메시지를 입력하세요 (한국어 → 일본어 자동 번역)"
            />
            <button onClick={handleSend} disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 text-sm transition disabled:opacity-50">
              {loading ? '...' : '전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
