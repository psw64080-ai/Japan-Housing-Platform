'use client';

import { useState } from 'react';

const GUIDE_DATA = [
  {
    category: '🏠 입주 전 준비',
    items: [
      {
        title: '일본 임대 초기 비용 완벽 정리',
        desc: '보증금, 사례금, 중개수수료 등 어떤 비용이 들어가는지 하나씩 알아봅니다.',
        detail: `일본에서 집을 빌릴 때 초기 비용은 보통 '월세의 4~6배' 정도가 필요합니다.

1. **보증금(敷金, 시키킨)**: 월세의 1~2개월치. 퇴거 시 청소비 및 원상복구 비용을 제한 후 돌려받습니다.
2. **사례금(礼金, 레이킨)**: 집주인에게 감사함의 표시로 지불하는 관행적인 비용으로 돌려받지 못합니다. (요즘은 0개월 매물도 많습니다.)
3. **중개수수료(仲介手数料)**: 부동산에 지불하는 수수료로 월세의 0.5~1개월치(소비세 별도)가 보통입니다.
4. **보증회사 이용료(保証会社)**: 연대보증인 대신 가입하며, 초기 비용으로 월세의 50~100%가 부과됩니다.
5. **화재보험료**: 1~2년 단위로 약 1.5~2만 엔 정도가 청구됩니다.
6. **열쇠 교환비**: 안전을 위해 전 세입자가 쓰던 열쇠 실린더를 교체하는 비용입니다. (약 1.5~2만 엔)`
      },
      {
        title: '외국인이 집 구할 때 필요한 서류',
        desc: '재류카드, 수입증명서, 긴급연락처 등 준비해야 할 서류 목록입니다.',
        detail: `안전한 임대 계약을 위해 일본 부동산에서 외국인에게 요구하는 필수 서류는 다음과 같습니다.

• **재류카드(在留カード)**: 주민등록증과 같은 신분증입니다. 앞/뒷면 사본이 필요합니다.
• **여권(Passport)**: 신원 확인 교차 검증용으로 요구됩니다.
• **수입 증명서(또는 원천징수표/합격통지서)**: 매월 월세를 밀리지 않고 낼 수 있는 능력을 심사합니다. 유학생의 경우 아르바이트 증명 또는 통장 잔고 증명 등을 제출하게 됩니다.
• **일본 내 연락 가능한 휴대폰 번호**: 일본의 유심 또는 개통된 번호가 필수적입니다.
• **일본인 또는 현지 긴급연락처**: 본인과 연락이 닿지 않을 비상 상황에 대비한 연락처(지인, 학교 관계자, 직장 상사 등)가 필요합니다.`
      },
      {
        title: '보증회사 란?',
        desc: '일본은 연대보증인 대신 보증회사를 이용합니다. 가입 방법과 비용을 설명합니다.',
        detail: `과거 일본에서는 '연대보증인(일본인)'을 세우는 것이 일반적이었으나, 최근에는 **보증회사(保証会社)** 가입을 필수로 하는 매물이 절대다수입니다.

• **역할**: 세입자가 월세를 체납했을 시 집주인에게 대납을 해주고, 이후 세입자에게 징수하는 역할을 합니다.
• **외국인 심사**: 외국인의 경우 GTN, Casa 등 외국인 심사에 관대한 전용 보증회사를 지정하는 경우가 많아 예전보다 집 구하기가 한결 수월해졌습니다.
• **비용**: 첫 계약 시 보통 월세 총액의 50~100%를 지불하고, 이후 1년마다 갱신 비용(약 1만 엔)이 추가로 청구됩니다.`
      },
    ]
  },
  {
    category: '🗑️ 생활 규칙',
    items: [
      {
        title: '쓰레기 분리수거 완벽 가이드',
        desc: '요일별 분리수거 규칙, 대형쓰레기 처리 방법, 벌금 주의사항까지.',
        detail: `일본의 분리수거는 한국보다 엄격하며 지자체(구/시)마다 규정이 상이합니다. 위반 시 수거를 거부당할 수 있습니다!

1. **지정 쓰레기봉투 사용 필수**: 편의점이나 슈퍼에서 본인이 거주하는 구(예: 시부야구, 신주쿠구) 전용 봉투를 구매해야 합니다.
2. **타는 쓰레기(燃えるゴミ)**: 음식물, 더러운 종이, 천장 등. (주 2회가량 수거)
3. **타지 않는 쓰레기(燃えないゴミ)**: 금속, 도자기, 깨진 유리 등. (월 1~2회 수거)
4. **자원(資源ゴミ)**: 깨끗한 페트병(상표 페트 비닐 분리!), 캔, 캔, 유리병, 종이상자 등.
5. **시간 준수**: 수거 당일 **아침 8시 이전**에 전용 수거장에 내놓아야 합니다. (전날 밤 배출 금지 구역이 많습니다.)
6. **대형 쓰레기(粗大ゴミ)**: 의자, 가로세로 30cm 이상의 가구/가전은 구청 사이트에 배출 신고를 하고 편의점에서 스티커(유료)를 사서 붙여 내놓아야 합니다.`
      },
      {
        title: '소음 예절과 이웃 인사',
        desc: '밤 10시 이후 소음 금지, 이웃에게 인사하는 방법 등 일본 생활 매너.',
        detail: `일본의 맨션이나 아파트는 목조나 경량 철골 구조가 많아 방음에 매우 취약합니다.

• **야간 소음 금지**: 밤 10시 이후에는 세탁기, 청소기 사용을 절대 피해야 하며, 큰 소리로 통화하거나 음악/TV 소리를 키우는 것도 클레임의 대상이 됩니다.
• **발망치 주의**: 실내에서 슬리퍼를 착용하고 발뒤꿈치로 걷지 않도록 주의합니다.
• **이사 인사**: 필수 사항은 아니지만, 양옆과 아랫집에 소박한 수건이나 과자(500~1000엔 정도)를 건네며 인사(“이사 왔습니다, 잘 부탁드립니다”)를 하면 향후 발생할지 모를 마찰을 크게 줄일 수 있습니다.`
      },
      {
        title: '우편함 확인과 회람판',
        desc: '일본 아파트 우편함 사용법과 동네 회람판 참가 방법.',
        detail: `아날로그 행정이 많은 일본 특성상, 중요한 서류가 우편으로 날아옵니다.

• **다이얼식 우편함**: 오른쪽으로 3번 돌리고, 왼쪽으로 2번 돌리는 식의 암호 설정 우편함이 많습니다. 입주 시 안내서를 숙지하세요.
• **매일 비우기**: 세금, 보험료 청구서나 마이넘버 관련 서류 등 누락 시 큰 문제가 발생하는 우편물이 넘치지 않게 자주 치워야 합니다.
• **회람판(回覧板)**: 동네 자치회에서 중요 공지사항이나 이벤트 소식을 바인더에 끼워 집집마다 돌리는 문화가 있습니다. 받으면 읽고 확인 도장이나 서명을 한 후, 다음 집 우편함에 넣어주면 됩니다.`
      },
    ]
  },
  {
    category: '🚨 비상 상황 대처',
    items: [
      {
        title: '지진 발생 시 행동 요령',
        desc: '문 열기, 머리 보호, 책상 아래 대피 등 일본 지진 대처법.',
        detail: `언제 지진이 올지 모르는 일본이기에 행동 매뉴얼을 반드시 숙지하세요.

1. **초기(흔들림 발생)**: 
   - 책상이나 테이블 밑으로 들어가 방석이나 가방으로 **머리를 우선 보호**합니다. 
   - 흔들릴 때 무리하게 밖으로 뛰어나오면 낙하물에 맞아 더 위험합니다.
2. **소강(흔들림 멈춤)**: 
   - 문이나 창문을 열어 탈출구가 찌그러져 갇히지 않게 출구를 확보합니다. 
   - 화재 방지를 위해 **가스 밸브를 잠그고 전기 콘센트를 뽑습니다**.
3. **대피**: 
   - 절대로 엘리베이터를 이용하지 말고 **계단을 통해** 밖으로 나갑니다.
   - 근처의 지정된 '피난소(대개 초등학교나 공원)'로 이동합니다. 안전을 위해 'Yahoo! 방재 속보' 앱을 설치해 두는 것을 권장합니다.`
      },
      {
        title: '119 신고 방법 (일본식)',
        desc: '화재·구급 신고 방법과 일본어 표현 안내.',
        detail: `일본의 긴급 신고 번호는 화재/구급은 **119**, 경찰은 **110** 입니다. 긴급 상황에서 쓸 수 있는 기초 일본어입니다.

• 전화 연결 후 나오는 질문: **"화재입니까, 구급입니까? (火事ですか、救急ですか？ / 카지데스카, 큐큐-데스카?)"**
• **답변 방법**:
   - 구급차 요청: "구급차를 부탁합니다. (救急車をお願いします / 큐큐-샤오 오네가이시마스)"
   - 화재 발생: "불이 났습니다! (火事です！ / 카지데스!)"
• **주소 말하기**: 제일 중요합니다. "여기는 OOO구 OOO초메 O-O(주소) 입니다." (이곳 주소를 모를 경우, 밖으로 나가 근처 전봇대에 적힌 주소표시판을 불러주세요.)
• 도쿄 소방청 등 일부 지역에서는 영어, 한국어 등 다국어 동시통역 서비스를 지원하기도 합니다.`
      },
      {
        title: '병원 응급실 이용법',
        desc: '야간·휴일 진료 가능한 병원 찾기와 보험 적용 방법.',
        detail: `휴일이나 심야에 구급차가 올 정도는 아니지만 아파서 병원에 가야 할 때 유용한 방법입니다.

• **야간/휴일 진료 당번병 찾기**: 구청이나 시청 홈페이지에 '휴일 당번 의사(休日当番医)' 목록이 있습니다.
• **구급 핫라인(#7119)**: 병원에 가야 할지, 아니면 응급차를 불러야 할지 판단이 서지 않을 때 상담받을 수 있는 전화입니다. 의료 전문가가 병원 안내 등 조언을 해줍니다.
• **필수 지참물**: **건강보험증(保険証)**과 **재류카드**, 현금(카드가 안 되는 개인병원이 매우 많으므로 필수)을 꼭 지참하세요. 만약 보험증을 챙기지 못해 100% 진료비를 냈더라도 당월 이내에 보험증과 영수증을 지참하면 70% 차액을 환불받을 수 있습니다.`
      },
    ]
  },
  {
    category: '💡 생활 꿀팁',
    items: [
      {
        title: '겨울 난방비 절약하는 법',
        desc: '코타츠, 결로 방지, 단열 시트 활용 등 난방비를 아끼는 꿀팁.',
        detail: `일본 집(특히 목조 아파트)은 단열이 취약해 한국처럼 바닥 전체가 따뜻해지지 않으며, 에어컨(냉난방기)만 틀다간 전기세 폭탄을 맞기 십상입니다.

1. **결로 방지 및 단열 뽁뽁이**: 100엔 숍(다이소, 세리아 등)에서 창문용 뽁뽁이(단열 시트)를 사서 유리에 붙이면 냉기를 극적으로 막을 수 있습니다.
2. **코타츠(こたつ) 활용**: 테이블 밑에 히터가 달려있고 이불을 덮어쓰는 일본 전통 난방기구. 전기세가 에어컨보다 압도적으로 저렴합니다.
3. **가습기 사용**: 에어컨 난방 모드를 켜면 매우 건조해집니다. 가습기를 함께 사용하면 체감 온도가 확 올라가 난방비를 절약할 수 있습니다.
4. **유단포(湯たんぽ)**: 자기 전 뜨거운 물을 넣고 침대 이불 속에 넣어두면 아침까지 따끈따끈해 난방 없이도 푹 잘 수 있는 극강의 가성비 아이템입니다.`
      },
      {
        title: '일본 세탁기 사용법',
        desc: '일본 세탁기 버튼이 전부 일본어! 각 버튼 기능을 사진으로 설명.',
        detail: `일본 세탁기의 필수 한자(버튼) 버튼 기능을 요약해 드립니다!

• **入 (이리) / 切 (키리)**: 전원 켜기 / 끄기
• **スタート (스타-토) / 一時停止 (이치지테이시)**: 시작 / 일시정지
• **標準 (효쥰)**: 표준 코스 (평소 기본으로 사용)
• **急ぎ (이소기) / スピード (스피-도)**: 쾌속 코스 (빨리 세탁할 때)
• **手洗い (테아라이) / ドライ (도라이)**: 울코스 / 손빨래 (니트, 섬세한 옷)
• **毛布 (모-후)**: 이불 등 두꺼운 세탁물
• **脱水 (닷스이)**: 탈수
• **水量 (스이료)**: 물높이 수동 조절 버튼`
      },
      {
        title: '에어컨 리모컨 조작법',
        desc: '냉방/난방/제습/타이머 등 리모컨 버튼별 기능 안내.',
        detail: `일본에서는 천장형 보일러가 없기 때문에 여름/겨울 사계절 내내 에어컨 리모컨 하나로 실내 온도를 제어합니다.

• **運転 / 停止 (운텐 / 테이시)**: 전원 ON/OFF
• **冷房 (레이보-)**: 냉방 기동 (여름)
• **暖房 (단보-)**: 난방 기동 (겨울)
• **除湿 (죠시츠) / ドライ (도라이)**: 제습 모드 (장마철 습기 제거 시 최고)
• **自動 (지도-)**: 오토 스위치 (설정 온도에 맞춰 알아서 냉/난방 조절)
• **温度 (온도) ▲ / ▼ ** : 온도 올림 / 내림
• **風量 (후-료-) / 風速 (후-소쿠)**: 터보나 미풍 등 바람 세기 조절
• **風向 (후-코-) / スイング (스인구)**: 바람 방향 흔들기 조절`
      },
    ]
  }
];

export default function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [selectedGuide, setSelectedGuide] = useState<{ title: string; desc: string; detail: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 relative">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-12 mb-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-5xl mb-3">📖</div>
          <h1 className="text-3xl font-extrabold mb-2">일본 생활 가이드</h1>
          <p className="text-green-200 text-base">입주 준비 • 약관 • 언어 • 교통 • 관청 절차까지, 일본 생활의 모든 필수 정보를 한 곳에서</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {GUIDE_DATA.map((section, sIdx) => (
            <button key={sIdx} onClick={() => setActiveCategory(sIdx)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === sIdx ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400'}`}>
              {section.category}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDE_DATA[activeCategory]?.items.map((item, iIdx) => (
            <div key={iIdx} onClick={() => setSelectedGuide(item)}
              className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-extrabold text-base text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{item.desc}</p>
              <div className="mt-4 flex items-center text-green-600 text-sm font-bold">
                자세히 보기 <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Detail Modal Popup */}
      {selectedGuide && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedGuide(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-green-100 bg-green-50/50">
              <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
                <span className="text-2xl mr-2">💡</span>
                {selectedGuide.title}
              </h2>
              <button 
                onClick={() => setSelectedGuide(null)}
                className="text-gray-400 hover:text-gray-800 focus:outline-none transition-colors border border-transparent hover:border-gray-200 rounded p-1"
              >
                ✖
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Highlight Box for Summary */}
              <div className="bg-gray-50 p-4 border-l-4 border-gray-300 text-sm text-gray-600 mb-6 font-medium">
                {selectedGuide.desc}
              </div>
              
              {/* Main Content Markdown-like Rendering */}
              <div className="space-y-4 text-[15px] font-medium text-gray-800 leading-[1.8] whitespace-pre-wrap">
                {selectedGuide.detail.split('\\n').map((line, idx) => {
                  // 간단한 마크다운 문법 (굵은 글씨) 파서
                  const parts = line.split(/(\\*\\*.*?\\*\\*)/g);
                  return (
                    <p key={idx} className="mb-2 break-keep">
                      {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={pIdx} className="text-green-700 bg-green-50 px-1 mx-0.5 rounded">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white text-right">
              <button 
                onClick={() => setSelectedGuide(null)}
                className="px-6 py-2 bg-gray-900 text-white font-bold text-sm rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all"
              >
                확인 (닫기)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
