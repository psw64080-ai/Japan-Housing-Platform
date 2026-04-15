'use client';

import { useState } from 'react';

const GUIDE_DATA = [
  {
    category: '🏠 입주 전 준비',
    items: [
      { title: '일본 임대 초기 비용 완벽 정리', desc: '보증금, 사례금, 중개수수료 등 어떤 비용이 들어가는지 하나씩 알아봅니다.' },
      { title: '외국인이 집 구할 때 필요한 서류', desc: '재류카드, 수입증명서, 긴급연락처 등 준비해야 할 서류 목록입니다.' },
      { title: '보증회사 란?', desc: '일본은 연대보증인 대신 보증회사를 이용합니다. 가입 방법과 비용을 설명합니다.' },
    ]
  },
  {
    category: '🗑️ 생활 규칙',
    items: [
      { title: '쓰레기 분리수거 완벽 가이드', desc: '요일별 분리수거 규칙, 대형쓰레기 처리 방법, 벌금 주의사항까지.' },
      { title: '소음 예절과 이웃 인사', desc: '밤 10시 이후 소음 금지, 이웃에게 인사하는 방법 등 일본 생활 매너.' },
      { title: '우편함 확인과 회람판', desc: '일본 아파트 우편함 사용법과 동네 회람판 참가 방법.' },
    ]
  },
  {
    category: '🚨 비상 상황 대처',
    items: [
      { title: '지진 발생 시 행동 요령', desc: '문 열기, 머리 보호, 책상 아래 대피 등 일본 지진 대처법.' },
      { title: '119 신고 방법 (일본식)', desc: '화재·구급 신고 방법과 일본어 표현 안내.' },
      { title: '병원 응급실 이용법', desc: '야간·휴일 진료 가능한 병원 찾기와 보험 적용 방법.' },
    ]
  },
  {
    category: '💡 생활 꿀팁',
    items: [
      { title: '겨울 난방비 절약하는 법', desc: '코타츠, 결로 방지, 단열 시트 활용 등 난방비를 아끼는 꿀팁.' },
      { title: '일본 세탁기 사용법', desc: '일본 세탁기 버튼이 전부 일본어! 각 버튼 기능을 사진으로 설명.' },
      { title: '에어컨 리모컨 조작법', desc: '냉방/난방/제습/타이머 등 리모컨 버튼별 기능 안내.' },
    ]
  }
];

export default function GuidesPage() {
  const [openCategory, setOpenCategory] = useState<number>(0);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">📖 일본 생활 가이드</h1>
          <p className="text-gray-500 text-sm">입주 준비부터 비상 상황 대처까지, 일본 생활에 필요한 모든 정보</p>
        </div>

        <div className="space-y-4">
          {GUIDE_DATA.map((section, sIdx) => (
            <div key={sIdx} className="bg-white border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenCategory(openCategory === sIdx ? -1 : sIdx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="font-bold text-base text-gray-800">{section.category}</span>
                <span className="text-gray-400 text-lg">{openCategory === sIdx ? '−' : '+'}</span>
              </button>

              {openCategory === sIdx && (
                <div className="border-t border-gray-100">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="px-6 py-4 border-b border-gray-50 last:border-b-0 hover:bg-green-50 transition cursor-pointer">
                      <h3 className="font-bold text-sm text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
