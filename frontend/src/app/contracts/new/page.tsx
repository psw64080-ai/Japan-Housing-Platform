'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateContract, getExchangeRates } from '@/lib/api/client';
import { getLang } from '@/lib/i18n';
import { getUser } from '@/lib/auth';

// 언어별 통화 설정
const CURRENCY_CONFIG = {
  ko: { symbol: '₩', code: 'KRW', name: '원', flag: '🇰🇷' },
  ja: { symbol: '¥', code: 'JPY', name: '円', flag: '🇯🇵' },
  en: { symbol: '$', code: 'USD', name: 'USD', flag: '🇺🇸' },
} as const;

// 라벨 다국어
const LABELS = {
  ko: {
    title: '📝 새 계약 작성',
    desc: '일본 임대차 계약서를 전자문서로 작성합니다. 작성 후 양측 서명이 필요합니다.',
    back: '← 계약 목록',
    basicInfo: '기본 정보 입력',
    required: '필수',
    propertyName: '매물명',
    propertyPh: '예: 신주쿠 도보 5분 1K 맨션',
    landlord: '집주인 이름',
    landlordPh: '예: Tanaka Taro',
    tenant: '세입자 이름',
    cost: '💰 비용 항목',
    costDesc: '금액을 원화(₩)로 입력하면 엔화(¥)로 자동 환산됩니다',
    rent: '월세',
    mgmt: '관리비',
    deposit: '보증금(敷金)',
    reikin: '사례금(礼金)',
    keyMoney: '중개수수료',
    insurance: '화재보험',
    months: '개월',
    custom: '직접 입력',
    initialTotal: '초기비용 합계 (예상)',
    monthlyTotal: '월 납부 합계',
    period: '📅 계약 기간',
    startDate: '시작일',
    endDate: '종료일',
    duration: '기간',
    terms: '📌 특약사항',
    termsPh: '특약사항을 입력하세요. 예: 펫 가능, 인터넷 무료, 퇴거 시 조건 등...',
    termsNote: '※ 일본 임대 계약에서 특약사항(特約事項)은 법적 효력이 있으므로 신중하게 작성해주세요.',
    cancel: '취소',
    submit: '📝 계약서 생성',
    submitting: '계약서 생성 중...',
    tip: '💡 일반적인 초기비용 기준: 보증금 1~2개월분, 사례금 0~1개월분, 중개수수료 ¥15,000~22,000, 화재보험 ¥15,000~20,000 (2년)',
    errProp: '매물명을 입력하세요.',
    errLandlord: '집주인 이름을 입력하세요.',
    errRent: '월세를 입력하세요.',
    errStart: '계약 시작일을 입력하세요.',
    errFail: '계약 생성에 실패했습니다.',
    approx: '≈',
    refundable: '퇴거 시 반환',
    nonRefundable: '반환 불가',
    rateInfo: '환율',
  },
  ja: {
    title: '📝 新規契約作成',
    desc: '賃貸契約書を電子文書で作成します。作成後、双方の署名が必要です。',
    back: '← 契約一覧',
    basicInfo: '基本情報入力',
    required: '必須',
    propertyName: '物件名',
    propertyPh: '例：新宿三丁目 徒歩5分 1Kマンション',
    landlord: '大家さんの名前',
    landlordPh: '例：田中太郎',
    tenant: '入居者名',
    cost: '💰 費用項目',
    costDesc: '金額を円(¥)で入力してください',
    rent: '家賃',
    mgmt: '管理費',
    deposit: '敷金',
    reikin: '礼金',
    keyMoney: '仲介手数料',
    insurance: '火災保険',
    months: 'ヶ月',
    custom: '直接入力',
    initialTotal: '初期費用合計（見積）',
    monthlyTotal: '月額合計',
    period: '📅 契約期間',
    startDate: '開始日',
    endDate: '終了日',
    duration: '期間',
    terms: '📌 特約事項',
    termsPh: '特約事項を入力してください。例：ペット可、インターネット無料など...',
    termsNote: '※ 特約事項は法的効力がありますので、慎重に記入してください。',
    cancel: 'キャンセル',
    submit: '📝 契約書作成',
    submitting: '作成中...',
    tip: '💡 一般的な初期費用：敷金1〜2ヶ月分、礼金0〜1ヶ月分、仲介手数料¥15,000〜22,000、火災保険¥15,000〜20,000（2年）',
    errProp: '物件名を入力してください。',
    errLandlord: '大家さんの名前を入力してください。',
    errRent: '家賃を入力してください。',
    errStart: '開始日を入力してください。',
    errFail: '契約の作成に失敗しました。',
    approx: '≈',
    refundable: '退去時返還',
    nonRefundable: '返還不可',
    rateInfo: '為替レート',
  },
  en: {
    title: '📝 New Contract',
    desc: 'Create a digital lease agreement. Both parties must sign after creation.',
    back: '← Contract List',
    basicInfo: 'Basic Information',
    required: 'Required',
    propertyName: 'Property Name',
    propertyPh: 'e.g. Shinjuku 5min walk 1K Mansion',
    landlord: 'Landlord Name',
    landlordPh: 'e.g. Tanaka Taro',
    tenant: 'Tenant Name',
    cost: '💰 Cost Items',
    costDesc: 'Enter amounts in USD ($). They will be auto-converted to JPY (¥)',
    rent: 'Monthly Rent',
    mgmt: 'Management Fee',
    deposit: 'Security Deposit',
    reikin: 'Key Money (礼金)',
    keyMoney: 'Broker Fee',
    insurance: 'Fire Insurance',
    months: 'months',
    custom: 'Custom',
    initialTotal: 'Estimated Initial Cost',
    monthlyTotal: 'Monthly Total',
    period: '📅 Contract Period',
    startDate: 'Start Date',
    endDate: 'End Date',
    duration: 'Duration',
    terms: '📌 Special Terms',
    termsPh: 'Enter special terms. e.g. Pets allowed, Free internet, Move-out conditions...',
    termsNote: '※ Special terms (特約事項) in Japanese leases are legally binding. Please write carefully.',
    cancel: 'Cancel',
    submit: '📝 Create Contract',
    submitting: 'Creating...',
    tip: '💡 Typical initial costs: Deposit 1-2 months, Key money 0-1 month, Broker fee ¥15,000-22,000, Fire insurance ¥15,000-20,000 (2yr)',
    errProp: 'Please enter a property name.',
    errLandlord: 'Please enter landlord name.',
    errRent: 'Please enter monthly rent.',
    errStart: 'Please enter a start date.',
    errFail: 'Failed to create contract.',
    approx: '≈',
    refundable: 'Refundable on move-out',
    nonRefundable: 'Non-refundable',
    rateInfo: 'Exchange rate',
  },
} as const;

export default function NewContractPage() {
  const router = useRouter();
  const lang = getLang();
  const L = LABELS[lang];
  const cur = CURRENCY_CONFIG[lang];

  // 환율 (1 JPY = X KRW / USD)
  const [rates, setRates] = useState<{ KRW: number; USD: number }>({ KRW: 9.5, USD: 0.00627 });
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    getExchangeRates('JPY').then((r: any) => {
      if (r?.rates) {
        setRates({ KRW: r.rates.KRW || 9.5, USD: r.rates.USD || 0.00627 });
        setRatesLoaded(true);
      }
    }).catch(() => {});
  }, []);

  // 사용자 입력 통화 → JPY 변환 계수
  // ko: 입력값(KRW) ÷ krwPerJpy = JPY
  // ja: 입력값 = JPY
  // en: 입력값(USD) ÷ usdPerJpy = JPY
  const toJpy = useCallback((localAmount: number): number => {
    if (lang === 'ja') return localAmount;
    if (lang === 'ko') return Math.round(localAmount / rates.KRW);
    return Math.round(localAmount / rates.USD);
  }, [lang, rates]);

  const jpyToLocal = useCallback((jpy: number): number => {
    if (lang === 'ja') return jpy;
    if (lang === 'ko') return Math.round(jpy * rates.KRW);
    return Math.round(jpy * rates.USD * 100) / 100;
  }, [lang, rates]);

  const formatLocal = useCallback((amount: number): string => {
    if (lang === 'en') return `${cur.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    return `${cur.symbol}${Math.round(amount).toLocaleString()}`;
  }, [lang, cur.symbol]);

  const formatJpy = useCallback((jpy: number): string => `¥${jpy.toLocaleString()}`, []);

  // form은 "사용자 입력 통화" 기준으로 저장
  const [form, setForm] = useState({
    propertyTitle: '',
    landlordName: '',
    tenantName: '',
    monthlyRent: 0,     // 사용자 통화 기준
    managementFee: 0,
    depositMonths: 1,    // 보증금 개월 수 (-1이면 직접 입력)
    depositCustom: 0,
    reikinMonths: 1,     // 사례금 개월 수 (-1이면 직접 입력)
    reikinCustom: 0,
    keyMoney: 0,
    insuranceFee: 0,
    startDate: '',
    endDate: '',
    contractPeriod: 24,
    specialTerms: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 로그인 유저 이름 설정
  useEffect(() => {
    const user = getUser();
    if (user?.name && !form.tenantName) {
      setForm(prev => ({ ...prev, tenantName: user.name }));
    }
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNumber = (field: string, value: string) => {
    const num = parseFloat(value) || 0;
    handleChange(field, num);
  };

  // 보증금/사례금 계산 (사용자 통화 기준)
  const depositLocal = form.depositMonths === -1 ? form.depositCustom : form.monthlyRent * form.depositMonths;
  const reikinLocal = form.reikinMonths === -1 ? form.reikinCustom : form.monthlyRent * form.reikinMonths;

  // JPY 환산값
  const rentJpy = toJpy(form.monthlyRent);
  const mgmtJpy = toJpy(form.managementFee);
  const depositJpy = toJpy(depositLocal);
  const reikinJpy = toJpy(reikinLocal);
  const keyJpy = toJpy(form.keyMoney);
  const insJpy = toJpy(form.insuranceFee);
  const monthlyJpy = rentJpy + mgmtJpy;
  const initialJpy = depositJpy + reikinJpy + monthlyJpy + keyJpy + insJpy;

  const handleStartDate = (value: string) => {
    handleChange('startDate', value);
    if (value) {
      try {
        const start = new Date(value);
        start.setMonth(start.getMonth() + form.contractPeriod);
        start.setDate(start.getDate() - 1);
        handleChange('endDate', start.toISOString().split('T')[0]);
      } catch { /* ignore */ }
    }
  };

  const handleSubmit = async () => {
    if (!form.propertyTitle.trim()) { setError(L.errProp); return; }
    if (!form.landlordName.trim()) { setError(L.errLandlord); return; }
    if (form.monthlyRent <= 0) { setError(L.errRent); return; }
    if (!form.startDate) { setError(L.errStart); return; }

    const user = getUser();
    setSaving(true);
    try {
      const res = await generateContract({
        propertyId: 0,
        tenantId: user?.id || 0,
        landlordId: 1,
        propertyTitle: form.propertyTitle,
        landlordName: form.landlordName,
        tenantName: form.tenantName,
        monthlyRent: rentJpy,
        deposit: depositJpy,
        reikin: reikinJpy,
        managementFee: mgmtJpy,
        keyMoney: keyJpy,
        insuranceFee: insJpy,
        startDate: form.startDate,
        endDate: form.endDate,
        contractPeriod: form.contractPeriod,
        specialTerms: form.specialTerms,
      }) as any;
      if (res?.id) {
        router.push(`/contracts/${res.id}`);
      } else {
        router.push('/contracts');
      }
    } catch (e: any) {
      setError(e.message || L.errFail);
      setSaving(false);
    }
  };

  // 환산 뱃지 컴포넌트
  const JpyBadge = ({ jpy }: { jpy: number }) => {
    if (lang === 'ja' || jpy <= 0) return null;
    return <span className="text-[11px] text-blue-500 font-bold ml-2">{L.approx} {formatJpy(jpy)}</span>;
  };

  // 통화 입력 필드
  const CurrencyInput = ({ label, value, field, placeholder, note }: { label: string; value: number; field: string; placeholder: string; note?: string }) => (
    <div>
      <label className="block text-xs text-gray-500 font-bold mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-bold">{cur.symbol}</span>
        <input type="number" value={value || ''} onChange={(e) => handleNumber(field, e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-200 pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition" />
      </div>
      {value > 0 && lang !== 'ja' && (
        <p className="text-[11px] text-blue-500 mt-1">{L.approx} {formatJpy(toJpy(value))}</p>
      )}
      {note && <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/contracts" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">{L.back}</Link>

        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">{L.title}</h1>
          <p className="text-sm text-gray-500">{L.desc}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-sm p-4 mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* 기본 정보 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">{L.basicInfo}</h2>
            <span className="text-xs font-bold text-green-600 border border-green-300 px-2 py-0.5">{L.required}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.propertyName} <span className="text-red-500">*</span></label>
              <input type="text" value={form.propertyTitle} onChange={(e) => handleChange('propertyTitle', e.target.value)}
                placeholder={L.propertyPh}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.landlord} <span className="text-red-500">*</span></label>
              <input type="text" value={form.landlordName} onChange={(e) => handleChange('landlordName', e.target.value)}
                placeholder={L.landlordPh}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.tenant}</label>
              <input type="text" value={form.tenantName} onChange={(e) => handleChange('tenantName', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition bg-gray-50" />
            </div>
          </div>
        </div>

        {/* 비용 항목 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-800">{L.cost}</h2>
            {lang !== 'ja' && ratesLoaded && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                {L.rateInfo}: 1 JPY = {lang === 'ko' ? `${rates.KRW.toFixed(2)} KRW` : `${rates.USD.toFixed(5)} USD`}
              </span>
            )}
          </div>
          {lang !== 'ja' && (
            <p className="text-xs text-gray-400 mb-4">{L.costDesc}</p>
          )}

          {/* 월세 & 관리비 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <CurrencyInput label={`${L.rent} *`} value={form.monthlyRent} field="monthlyRent"
              placeholder={lang === 'ko' ? '845,000' : lang === 'en' ? '600' : '89000'} />
            <CurrencyInput label={L.mgmt} value={form.managementFee} field="managementFee"
              placeholder={lang === 'ko' ? '47,500' : lang === 'en' ? '35' : '5000'} />
          </div>

          {/* 월 합계 */}
          {form.monthlyRent > 0 && (
            <div className="mb-5 p-3 bg-blue-50 border border-blue-100 flex items-center justify-between">
              <span className="text-sm font-bold text-blue-700">{L.monthlyTotal}</span>
              <div className="text-right">
                <span className="font-extrabold text-blue-600">{formatLocal(form.monthlyRent + form.managementFee)}</span>
                {lang !== 'ja' && <span className="text-[11px] text-blue-400 font-bold ml-2">{L.approx} {formatJpy(monthlyJpy)}</span>}
              </div>
            </div>
          )}

          {/* 보증금 & 사례금 (개월 수 선택) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.deposit} <span className="text-[10px] text-green-500">{L.refundable}</span></label>
              <select value={form.depositMonths} onChange={(e) => handleChange('depositMonths', parseFloat(e.target.value))}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white transition">
                <option value={0}>0{L.months}</option>
                <option value={0.5}>0.5{L.months}</option>
                <option value={1}>1{L.months}</option>
                <option value={1.5}>1.5{L.months}</option>
                <option value={2}>2{L.months}</option>
                <option value={-1}>{L.custom}</option>
              </select>
              {form.depositMonths === -1 && (
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-bold">{cur.symbol}</span>
                  <input type="number" value={form.depositCustom || ''} onChange={(e) => handleNumber('depositCustom', e.target.value)}
                    className="w-full border border-gray-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-green-400 transition" />
                </div>
              )}
              {depositLocal > 0 && (
                <p className="text-xs mt-1">
                  <span className="font-bold text-gray-700">{formatLocal(depositLocal)}</span>
                  <JpyBadge jpy={depositJpy} />
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.reikin} <span className="text-[10px] text-red-400">{L.nonRefundable}</span></label>
              <select value={form.reikinMonths} onChange={(e) => handleChange('reikinMonths', parseFloat(e.target.value))}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white transition">
                <option value={0}>0{L.months}</option>
                <option value={0.5}>0.5{L.months}</option>
                <option value={1}>1{L.months}</option>
                <option value={1.5}>1.5{L.months}</option>
                <option value={2}>2{L.months}</option>
                <option value={-1}>{L.custom}</option>
              </select>
              {form.reikinMonths === -1 && (
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-bold">{cur.symbol}</span>
                  <input type="number" value={form.reikinCustom || ''} onChange={(e) => handleNumber('reikinCustom', e.target.value)}
                    className="w-full border border-gray-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-green-400 transition" />
                </div>
              )}
              {reikinLocal > 0 && (
                <p className="text-xs mt-1">
                  <span className="font-bold text-gray-700">{formatLocal(reikinLocal)}</span>
                  <JpyBadge jpy={reikinJpy} />
                </p>
              )}
            </div>
          </div>

          {/* 기타 비용 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <CurrencyInput label={L.keyMoney} value={form.keyMoney} field="keyMoney"
              placeholder={lang === 'ko' ? '157,000' : lang === 'en' ? '110' : '16500'} />
            <CurrencyInput label={L.insurance} value={form.insuranceFee} field="insuranceFee"
              placeholder={lang === 'ko' ? '171,000' : lang === 'en' ? '120' : '18000'} />
          </div>

          {/* 초기비용 합계 */}
          <div className="mt-4 border-t-2 border-green-400 bg-green-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-gray-800">{L.initialTotal}</span>
              <div className="text-right">
                {lang !== 'ja' && (
                  <p className="text-lg font-extrabold text-green-600">{formatLocal(depositLocal + reikinLocal + form.monthlyRent + form.managementFee + form.keyMoney + form.insuranceFee)}</p>
                )}
                <p className={lang === 'ja' ? 'text-lg font-extrabold text-green-600' : 'text-sm font-bold text-gray-500'}>
                  {lang !== 'ja' && `${L.approx} `}{formatJpy(initialJpy)}
                </p>
              </div>
            </div>

            {/* 내역 미니 테이블 */}
            {initialJpy > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200 space-y-1 text-xs text-gray-600">
                {rentJpy > 0 && <div className="flex justify-between"><span>{L.rent}+{L.mgmt}</span><span>{formatJpy(monthlyJpy)}</span></div>}
                {depositJpy > 0 && <div className="flex justify-between"><span>{L.deposit}</span><span>{formatJpy(depositJpy)}</span></div>}
                {reikinJpy > 0 && <div className="flex justify-between"><span>{L.reikin}</span><span>{formatJpy(reikinJpy)}</span></div>}
                {keyJpy > 0 && <div className="flex justify-between"><span>{L.keyMoney}</span><span>{formatJpy(keyJpy)}</span></div>}
                {insJpy > 0 && <div className="flex justify-between"><span>{L.insurance}</span><span>{formatJpy(insJpy)}</span></div>}
              </div>
            )}
          </div>

          <div className="mt-3 p-3 bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700">{L.tip}</p>
          </div>
        </div>

        {/* 기간 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">{L.period}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.startDate} <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate} onChange={(e) => handleStartDate(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.endDate}</label>
              <input type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">{L.duration}</label>
              <select value={form.contractPeriod} onChange={(e) => handleChange('contractPeriod', parseInt(e.target.value))}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white transition">
                <option value={12}>12{lang === 'en' ? ' months (1yr)' : lang === 'ja' ? 'ヶ月（1年）' : '개월 (1년)'}</option>
                <option value={24}>24{lang === 'en' ? ' months (2yr)' : lang === 'ja' ? 'ヶ月（2年）' : '개월 (2년)'}</option>
                <option value={36}>36{lang === 'en' ? ' months (3yr)' : lang === 'ja' ? 'ヶ月（3年）' : '개월 (3년)'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 특약 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">{L.terms}</h2>
          <textarea value={form.specialTerms} onChange={(e) => handleChange('specialTerms', e.target.value)}
            rows={4} placeholder={L.termsPh}
            className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none transition" />
          <p className="text-xs text-gray-400 mt-1">{L.termsNote}</p>
        </div>

        {/* 제출 */}
        <div className="flex gap-3 mb-10">
          <Link href="/contracts" className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 text-sm text-center hover:bg-gray-50 transition">
            {L.cancel}
          </Link>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 text-sm transition">
            {saving ? L.submitting : L.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
