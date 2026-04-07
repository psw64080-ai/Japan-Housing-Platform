'use client';

import { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendMessage, translateText } from '@/lib/api/client';

interface Message {
  id: number;
  sender: { id: number; name: string };
  receiver: { id: number; name: string };
  content: string;
  translatedContent?: string;
  originalLanguage?: string;
  createdAt: string;
}

interface ChatBoxProps {
  currentUserId: number;
  otherUserId: number;
  otherUserName: string;
}

export default function ChatBox({
  currentUserId,
  otherUserId,
  otherUserName,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅 내역 로드
  useEffect(() => {
    loadChatHistory();
  }, [currentUserId, otherUserId]);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const data = await getChatHistory(currentUserId, otherUserId);
      setMessages(data as Message[]);
    } catch (error) {
      console.error('채팅 내역 로드 실패:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);

      // 번역
      let translatedContent = newMessage;
      if (autoTranslate) {
        const translation = await translateText(newMessage, 'ja');
        translatedContent = (translation as any).translated;
      }

      // 메시지 전송
      const messageData = {
        sender: { id: currentUserId },
        receiver: { id: otherUserId },
        content: newMessage,
        translatedContent,
        originalLanguage: 'ko',
      };

      await sendMessage(messageData);

      // 로컬 상태 업데이트
      const newMsg: Message = {
        id: Date.now(),
        sender: { id: currentUserId, name: 'You' },
        receiver: { id: otherUserId, name: otherUserName },
        content: newMessage,
        translatedContent,
        originalLanguage: 'ko',
        createdAt: new Date().toISOString(),
      };

      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center border-b border-blue-600">
        <h3 className="font-semibold text-lg">{otherUserName}</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm bg-white/20 px-3 py-1 rounded-lg">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
            className="w-3 h-3 accent-white rounded"
          />
          <span>자동 번역</span>
        </label>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender.id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-xl ${
                msg.sender.id === currentUserId
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.translatedContent && autoTranslate && (
                <p className={`text-xs mt-2 opacity-75 italic ${msg.sender.id === currentUserId ? 'text-blue-100' : 'text-slate-500'}`}>
                  번역: {msg.translatedContent}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-slate-100 p-4 flex gap-2 bg-white rounded-b-xl">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading) {
              handleSendMessage();
            }
          }}
          placeholder="메시지 입력..."
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none rounded-lg"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !newMessage.trim()}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 text-sm rounded-lg disabled:opacity-50 transition"
        >
          전송
        </button>
      </div>
    </div>
  );
}
