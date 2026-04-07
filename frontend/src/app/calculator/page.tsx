'use client';

import { useState, useEffect, useMemo } from 'react';
import { getExchangeRates } from '@/lib/api/client';
import { getLang } from '@/lib/i18n';

const CUR = {
  ko: { symbol: '₩', code: 'KRW', flag: '🇰🇷', name: '원' },
  ja: { symbol: '¥', code: 'JPY', flag: '🇯🇵', name: '円' },
  en: { symbol: '$', code: 'USD', flag: '🇺🇸', name: 'USD' },
} as const;

const L = {
  ko: {
    h1: '📊 초기 비용 계산기',
    sub: '일본 임대 시 발생하는 초기 비용을 한국 원화로 정확히 계산하세요',
    inputTitle: '기본 정보 입력',
    required: '필수',
    rent: '월세(家賃)',
    mgmt: '관리비(管理費)',
    deposit: '보증금(敷金)',
    reikin: '사례금(礼金)',
    brokerFee: '중개수수료(仲介手数料)',
    guarantor: '보증회사 이용료',
    fireIns: '화재보험(火災保険)',
    keyExchange: '열쇠교환(鍵交換)',
    firstMonth: '첫 달 월세 + 관리비',
    months: '개월',
    none: '없음',
    custom: '직접 입력',
    rateLabel: '적용 환율',
    rateLoading: '실시간 환율 조회 중...',
    rateDate: '기준일',
    rateSrc: '출처: Frankfurter API (실시간)',
    resultTitle: '예상 초기 비용 내역',
    resultSub: '입력하신 조건으로 계산된 총 초기비용입니다.',
    simulation: '시뮬레이션',
    total: '초기비용 합계',
    localTotal: '원화 환산',
    monthlyLabel: '월 고정 지출',
    tip: '일본의 초기비용은 통상 월세의 4~6배 수준입니다. 도쿄 일반 원룸 기준으로 산정된 참고용 시뮬레이션입니다.',
    refundable: '퇴거 시 반환',
    nonRefund: '반환 불가',
    taxIncl: '소비세 10% 포함',
    perMonth: '월 50% 기준',
    twoYear: '2년분',
  },
  ja: {
    h1: '📊 初期費用シミュレーター',
    sub: '賃貸の初期費用を正確に計算しましょう',
    inputTitle: '基本情報入力',
    required: '必須',
    rent: '家賃',
    mgmt: '管理費・共益費',
    deposit: '敷金',
    reikin: '礼金',
    brokerFee: '仲介手数料',
    guarantor: '保証会社利用料',
    fireIns: '火災保険',
    keyExchange: '鍵交換費用',
    firstMonth: '初月賃料＋管理費',
    months: 'ヶ月',
    none: 'なし',
    custom: '直接入力',
    rateLabel: '為替レート',
    rateLoading: 'レート取得中...',
    rateDate: '基準日',
    rateSrc: '出典: Frankfurter API（リアルタイム）',
    resultTitle: '初期費用見積もり',
    resultSub: '入力条件で計算された概算の初期費用です。',
    simulation: 'シミュレーション',
    total: '初期費用合計',
    localTotal: '合計（円）',
    monthlyLabel: '月額固定費',
    tip: '初期費用は一般的に家賃の4〜6倍です。東京の一般ワンルームを基準としたシミュレーションです。',
    refundable: '退去時返還',
    nonRefund: '返還不可',
    taxIncl: '消費税10%込',
    perMonth: '月額50%基準',
    twoYear: '2年分',
  },
  en: {
    h1: '📊 Initial Cost Calculator',
    sub: 'Accurately calculate all upfront costs for renting in Japan',
    inputTitle: 'Basic Information',
    required: 'Required',
    rent: 'Monthly Rent',
    mgmt: 'Management Fee',
    deposit: 'Security Deposit (敷金)',
    reikin: 'Key Money (礼金)',
    brokerFee: 'Broker Fee',
    guarantor: 'Guarantor Company Fee',
    fireIns: 'Fire Insurance',
    keyExchange: 'Lock Exchange',
    firstMonth: 'First Month Rent + Mgmt',
    months: ' months',
    none: 'None',
    custom: 'Custom',
    rateLabel: 'Exchange Rate',
    rateLoading: 'Loading real-time rate...',
    rateDate: 'As of',
    rateSrc: 'Source: Frankfurter API (Real-time)',
    resultTitle: 'Estimated Initial Cost',
    resultSub: 'Calculated based on your input conditions.',
    simulation: 'Simulation',
    total: 'Total Initial Cost',
    localTotal: 'In USD',
    monthlyLabel: 'Monthly Fixed',
    tip: 'Initial costs in Japan are typically 4-6x monthly rent. This is a simulation based on standard Tokyo 1R conditions.',
    refundable: 'Refundable',
    nonRefund: 'Non-refundable',
    taxIncl: 'incl. 10% tax',
    perMonth: '50% of rent',
    twoYear: '2-year',
  },
} as const;

export default function CalculatorPage() {
  const lang = getLang();
  const t = L[lang];
  const cur = CUR[lang];

  // 인풋 (전부 엔화 기준)
  const [rent, setRent] = useState(80000);
  const [mgmt, setMgmt] = useState(5000);
  const [depositMonths, setDepositMonths] = useState(1);
  const [depositCustom, setDepositCustom] = useState(0);
  const [reikinMonths, setReikinMonths] = useState(1);
  const [reikinCustom, setReikinCustom] = useState(0);
  const [brokerMonths, setBrokerMonths] = useState(1); // 중개수수료 (월세 N개월치 + 세금)
  const [guarantorPct, setGuarantorPct] = useState(50); // 월세 대비 %
  const [fireIns, setFireIns] = useState(20000);
  const [keyExchange, setKeyExchange] = useState(22000);

  // 환율
  const [rates, setRates] = useState<{ KRW: number; USD: number }>({ KRW: 9.5, USD: 0.00627 });
  const [rateDate, setRateDate] = useState('');
  const [rateLoaded, setRateLoaded] = useState(false);

  useEffect(() => {
    getExchangeRates('JPY').then((r: any) => {
      if (r?.rates) {
        setRates({ KRW: r.rates.KRW || 9.5, USD: r.rates.USD || 0.00627 });
        if (r.date) setRateDate(r.date);
        setRateLoaded(true);
      }
    }).catch(() => setRateLoaded(true));
  }, []);

  // 계산
  const costs = useMemo(() => {
    const deposit = depositMonths === -1 ? depositCustom : rent * depositMonths;
    const reikin = reikinMonths === -1 ? reikinCustom : rent * reikinMonths;
    const broker = Math.round(rent * brokerMonths * 1.1); // 소비세 10% 포함
    const guarantor = Math.round(rent * (guarantorPct / 100));
    const firstMonth = rent + mgmt;

    const totalJpy = deposit + reikin + broker + guarantor + fireIns + keyExchange + firstMonth;
    return { deposit, reikin, broker, guarantor, firstMonth, totalJpy };
  }, [rent, mgmt, depositMonths, depositCustom, reikinMonths, reikinCustom, brokerMonths, guarantorPct, fireIns, keyExchange]);

  const jpyToLocal = (jpy: number) => {
    if (lang === 'ja') return jpy;
    if (lang === 'ko') return Math.round(jpy * rates.KRW);
    return Math.round(jpy * rates.USD * 100) / 100;
  };

  const fmtJpy = (n: number) => `¥${n.toLocaleString()}`;
  const fmtLocal = (n: number) => {
    if (lang === 'ja') return fmtJpy(n);
    if (lang === 'ko') return `₩${Math.round(n).toLocaleString()}`;
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // 항목별 배열
  const items: { label: string; jpy: number; note?: string }[] = [
    { label: t.deposit, jpy: costs.deposit, note: costs.deposit > 0 ? t.refundable : undefined },
    { label: t.reikin, jpy: costs.reikin, note: costs.reikin > 0 ? t.nonRefund : undefined },
    { label: t.brokerFee, jpy: costs.broker, note: t.taxIncl },
    { label: t.guarantor, jpy: costs.guarantor, note: t.perMonth },
    { label: `${t.fireIns} + ${t.keyExchange}`, jpy: fireIns + keyExchange, note: t.twoYear },
    { label: t.firstMonth, jpy: costs.firstMonth },
  ];

  const monthlyTotal = rent + mgmt;

  // 보조 셀렉트 컴포넌트
  const MonthSelect = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div>
      <label className="block text-sm font-bold mb-2 text-gray-800">{label}</label>
      <select value={value} onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full bg-white border border-gray-200 px-4 py-3 outline-none text-sm font-bold focus:border-green-400 transition">
        <option value={0}>{t.none} (0{t.months})</option>
        <option value={0.5}>0.5{t.months}</option>
        <option value={1}>1{t.months}</option>
        <option value={1.5}>1.5{t.months}</option>
        <option value={2}>2{t.months}</option>
        <option value={-1}>{t.custom}</option>
      </select>
      {value === -1 && (
        <div className="mt-2 flex border border-gray-200 overflow-hidden">
          <span className="flex items-center px-3 bg-gray-100 text-gray-500 font-bold text-sm border-r border-gray-200">¥</span>
          <input type="number" value={label.includes(t.deposit) ? depositCustom : reikinCustom}
            onChange={e => label.includes(t.deposit) ? setDepositCustom(Number(e.target.value) || 0) : setReikinCustom(Number(e.target.value) || 0)}
            className="flex-1 px-3 py-2 outline-none text-sm font-bold" />
        </div>
      )}
      {value > 0 && rent > 0 && (
        <p className="text-xs text-gray-400 mt-1">{fmtJpy(rent * value)}</p>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-green-600 mb-3">{t.h1}</h1>
          <p className="text-gray-500">{t.sub}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* INPUT */}
          <div className="md:w-1/2">
            <div className="bg-white border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8 h-full">
              <h2 className="font-bold text-xl mb-6 border-b-2 border-green-500 pb-3 flex items-center justify-between text-gray-800">
                {t.inputTitle} <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1">{t.required}</span>
              </h2>

              <div className="space-y-5">
                {/* 월세 */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">{t.rent}</label>
                  <div className="flex border border-gray-200 overflow-hidden">
                    <span className="flex items-center px-4 bg-gray-100 border-r border-gray-200 text-gray-500 font-bold">¥</span>
                    <input type="number" value={rent || ''} onChange={e => setRent(Number(e.target.value) || 0)}
                      placeholder="80000"
                      className="flex-1 bg-white px-4 py-3 outline-none text-base font-bold focus:bg-green-50/30 transition" />
                  </div>
                  {rent > 0 && lang !== 'ja' && (
                    <p className="text-xs text-blue-500 mt-1">≈ {fmtLocal(jpyToLocal(rent))}</p>
                  )}
                </div>

                {/* 관리비 */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">{t.mgmt}</label>
                  <div className="flex border border-gray-200 overflow-hidden">
                    <span className="flex items-center px-4 bg-gray-100 border-r border-gray-200 text-gray-500 font-bold">¥</span>
                    <input type="number" value={mgmt || ''} onChange={e => setMgmt(Number(e.target.value) || 0)}
                      placeholder="5000"
                      className="flex-1 bg-white px-4 py-3 outline-none text-base font-bold focus:bg-green-50/30 transition" />
                  </div>
                </div>

                {/* 보증금 & 사례금 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MonthSelect value={depositMonths} onChange={setDepositMonths} label={t.deposit} />
                  <MonthSelect value={reikinMonths} onChange={setReikinMonths} label={t.reikin} />
                </div>

                {/* 중개수수료 */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">{t.brokerFee}</label>
                  <select value={brokerMonths} onChange={e => setBrokerMonths(parseFloat(e.target.value))}
                    className="w-full bg-white border border-gray-200 px-4 py-3 outline-none text-sm font-bold focus:border-green-400 transition">
                    <option value={0}>{t.none}</option>
                    <option value={0.5}>0.5{t.months} + {lang === 'en' ? 'tax' : '税'}</option>
                    <option value={1}>1{t.months} + {lang === 'en' ? 'tax' : '税'} ({lang === 'ko' ? '일반적' : lang === 'ja' ? '一般的' : 'typical'})</option>
                  </select>
                  {brokerMonths > 0 && rent > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{fmtJpy(Math.round(rent * brokerMonths * 1.1))} ({t.taxIncl})</p>
                  )}
                </div>

                {/* 보증회사 */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">{t.guarantor}</label>
                  <select value={guarantorPct} onChange={e => setGuarantorPct(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 px-4 py-3 outline-none text-sm font-bold focus:border-green-400 transition">
                    <option value={0}>{t.none}</option>
                    <option value={30}>{lang === 'ko' ? '월세의 30%' : lang === 'ja' ? '家賃の30%' : '30% of rent'}</option>
                    <option value={50}>{lang === 'ko' ? '월세의 50% (일반적)' : lang === 'ja' ? '家賃の50%（一般的）' : '50% of rent (typical)'}</option>
                    <option value={100}>{lang === 'ko' ? '월세의 100%' : lang === 'ja' ? '家賃の100%' : '100% of rent'}</option>
                  </select>
                  {guarantorPct > 0 && rent > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{fmtJpy(Math.round(rent * guarantorPct / 100))}</p>
                  )}
                </div>

                {/* 화재보험 & 열쇠 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-800">{t.fireIns}</label>
                    <div className="flex border border-gray-200 overflow-hidden">
                      <span className="flex items-center px-3 bg-gray-100 border-r border-gray-200 text-gray-500 font-bold text-sm">¥</span>
                      <input type="number" value={fireIns || ''} onChange={e => setFireIns(Number(e.target.value) || 0)}
                        className="flex-1 bg-white px-3 py-3 outline-none text-sm font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-800">{t.keyExchange}</label>
                    <div className="flex border border-gray-200 overflow-hidden">
                      <span className="flex items-center px-3 bg-gray-100 border-r border-gray-200 text-gray-500 font-bold text-sm">¥</span>
                      <input type="number" value={keyExchange || ''} onChange={e => setKeyExchange(Number(e.target.value) || 0)}
                        className="flex-1 bg-white px-3 py-3 outline-none text-sm font-bold" />
                    </div>
                  </div>
                </div>

                {/* 환율 정보 */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-800">{t.rateLabel}</span>
                    {rateLoaded ? (
                      <span className="text-[10px] text-green-600 font-bold px-2 py-0.5 bg-green-50 border border-green-200">✓ LIVE</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 animate-pulse">{t.rateLoading}</span>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">🇰🇷 1 JPY → KRW</span>
                      <span className="font-bold">{rates.KRW.toFixed(4)} 원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">🇺🇸 1 JPY → USD</span>
                      <span className="font-bold">${rates.USD.toFixed(5)}</span>
                    </div>
                    {rateDate && (
                      <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">{t.rateDate}: {rateDate} · {t.rateSrc}</p>
                    )}
                  </div>
                </div>

                {/* 팁 */}
                <div className="bg-green-50 border border-green-200 p-4 text-xs font-bold text-green-800">
                  <p className="flex items-start gap-2">
                    <span className="text-base leading-none">💡</span>
                    <span>{t.tip}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RESULT */}
          <div className="md:w-1/2">
            <div className="bg-white border-2 border-green-500 shadow-lg overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="bg-green-500 text-white p-6 relative overflow-hidden">
                <h2 className="font-extrabold text-xl mb-1 flex items-center justify-between">
                  <span>{t.resultTitle}</span>
                  <span className="opacity-80 text-sm font-medium border border-white px-2 py-0.5">{t.simulation}</span>
                </h2>
                <p className="text-sm opacity-90 font-bold">{t.resultSub}</p>
                <div className="absolute -right-10 -bottom-10 text-white text-9xl opacity-10">¥</div>
              </div>

              {/* Items */}
              <div className="p-6 space-y-0 flex-1">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div>
                      <span className="text-sm font-bold text-gray-600">{item.label}</span>
                      {item.note && <span className="text-[10px] text-gray-400 ml-1.5">({item.note})</span>}
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-gray-800">{fmtJpy(item.jpy)}</span>
                      {lang !== 'ja' && item.jpy > 0 && (
                        <p className="text-[11px] text-blue-500">{fmtLocal(jpyToLocal(item.jpy))}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly */}
              <div className="px-6 py-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-700">{t.monthlyLabel}</p>
                  <p className="text-[10px] text-blue-400">{t.rent} + {t.mgmt}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-blue-600">{fmtJpy(monthlyTotal)}</span>
                  {lang !== 'ja' && (
                    <p className="text-[11px] text-blue-400">{fmtLocal(jpyToLocal(monthlyTotal))}</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 p-6 border-t-2 border-green-400">
                <p className="text-xs text-green-600 font-black mb-1 tracking-wider uppercase">{t.total}</p>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-600 tracking-tight mb-1">{fmtJpy(costs.totalJpy)}</div>
                {rent > 0 && (
                  <p className="text-xs text-gray-400 mb-4">
                    {lang === 'ko' ? '월세의' : lang === 'ja' ? '家賃の' : 'Rent ×'} {(costs.totalJpy / rent).toFixed(1)}{lang === 'en' ? 'x' : '배'}
                  </p>
                )}

                {lang !== 'ja' && (
                  <div className="bg-white p-4 border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-gray-500">{t.localTotal}</p>
                      <p className="text-[10px] text-gray-400">{t.rateLabel}: 1 JPY = {lang === 'ko' ? `${rates.KRW.toFixed(2)} KRW` : `$${rates.USD.toFixed(5)}`}</p>
                    </div>
                    <p className="text-2xl font-black text-gray-800 tracking-tight">{fmtLocal(jpyToLocal(costs.totalJpy))}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
