'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getContract, updateContract } from '@/lib/api/client';

interface ContractForm {
  propertyTitle: string;
  landlordName: string;
  monthlyRent: number;
  deposit: number;
  reikin: number;
  managementFee: number;
  keyMoney: number;
  insuranceFee: number;
  startDate: string;
  endDate: string;
  contractPeriod: number;
  specialTerms: string;
}

const DEMO_MAP: Record<number, ContractForm> = {
  2: { propertyTitle:'에비스 디아쥬 1LDK 고급 맨션', landlordName:'Tanaka Taro', monthlyRent:475000, deposit:950000, reikin:475000, managementFee:15000, keyMoney:22000, insuranceFee:20000, startDate:'2026-05-01', endDate:'2028-04-30', contractPeriod:24, specialTerms:'펫 가능(소형견 1마리). 24시간 콩시어지 서비스 포함.' },
  4: { propertyTitle:'아자부주반 라산테 1LDK', landlordName:'Yamada Ichiro', monthlyRent:283000, deposit:566000, reikin:283000, managementFee:12000, keyMoney:22000, insuranceFee:20000, startDate:'2026-06-01', endDate:'2028-05-31', contractPeriod:24, specialTerms:'오토록·택배BOX 완비. 주차장 별도 계약 가능(월 35,000엔).' },
};

export default function EditContractPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const contractId = parseInt(params.id);
  const [form, setForm] = useState<ContractForm>({
    propertyTitle: '', landlordName: '', monthlyRent: 0, deposit: 0, reikin: 0,
    managementFee: 0, keyMoney: 0, insuranceFee: 0, startDate: '', endDate: '',
    contractPeriod: 24, specialTerms: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getContract(contractId) as any;
        if (data && data.status === 'draft') {
          setForm({
            propertyTitle: data.propertyTitle || '',
            landlordName: data.landlordName || '',
            monthlyRent: data.monthlyRent || 0,
            deposit: data.deposit || 0,
            reikin: data.reikin || 0,
            managementFee: data.managementFee || 0,
            keyMoney: data.keyMoney || 0,
            insuranceFee: data.insuranceFee || 0,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            contractPeriod: data.contractPeriod || 24,
            specialTerms: data.specialTerms || '',
          });
        } else if (data && data.status !== 'draft') {
          setError('서명 대기(draft) 상태의 계약만 수정할 수 있습니다.');
        } else {
          throw new Error('not found');
        }
      } catch {
        const demo = DEMO_MAP[contractId];
        if (demo) setForm(demo);
        else setError('계약을 찾을 수 없습니다.');
      }
      setLoading(false);
    })();
  }, [contractId]);

  const handleChange = (field: keyof ContractForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleNumberChange = (field: keyof ContractForm, value: string) => {
    const num = parseInt(value) || 0;
    handleChange(field, num);
  };

  const handleSave = async () => {
    if (!form.propertyTitle.trim()) { setError('매물명을 입력하세요.'); return; }
    if (form.monthlyRent <= 0) { setError('월세를 입력하세요.'); return; }
    if (!form.startDate) { setError('계약 시작일을 입력하세요.'); return; }

    setSaving(true);
    setError('');
    try {
      await updateContract(contractId, form);
      setSuccess(true);
      setTimeout(() => router.push(`/contracts/${contractId}`), 1200);
    } catch (e: any) {
      setError(e.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const totalInitial = form.deposit + form.reikin + form.monthlyRent + form.managementFee + form.keyMoney + form.insuranceFee;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400"><p className="text-4xl mb-3 animate-pulse">✏️</p><p className="font-bold">계약 정보를 불러오는 중...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link href={`/contracts/${contractId}`} className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">← 계약 상세로</Link>

        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">✏️ 계약 수정</h1>
          <p className="text-sm text-gray-500">계약번호: #{contractId.toString().padStart(4, '0')} · 서명 대기 상태에서만 수정 가능</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-sm p-4 mb-6">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 font-bold text-sm p-4 mb-6">
            ✅ 저장되었습니다! 상세 페이지로 이동합니다...
          </div>
        )}

        {/* 매물 정보 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">🏠 기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">매물명</label>
              <input type="text" value={form.propertyTitle} onChange={(e) => handleChange('propertyTitle', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">집주인 이름</label>
              <input type="text" value={form.landlordName} onChange={(e) => handleChange('landlordName', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          </div>
        </div>

        {/* 비용 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">💰 비용 항목</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {([
              { key: 'monthlyRent' as const, label: '월세 (賃料)' },
              { key: 'deposit' as const, label: '보증금 (敷金)' },
              { key: 'reikin' as const, label: '사례금 (礼金)' },
              { key: 'managementFee' as const, label: '관리비 (管理費)' },
              { key: 'keyMoney' as const, label: '열쇠 교환비' },
              { key: 'insuranceFee' as const, label: '화재보험료' },
            ]).map(item => (
              <div key={item.key}>
                <label className="block text-xs text-gray-500 font-bold mb-1">{item.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">¥</span>
                  <input type="number" value={form[item.key] || ''} onChange={(e) => handleNumberChange(item.key, e.target.value)}
                    className="w-full border border-gray-200 pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 flex justify-between items-center">
            <span className="font-bold text-sm text-gray-700">초기비용 합계</span>
            <span className="font-extrabold text-green-600 text-lg">¥{totalInitial.toLocaleString()}</span>
          </div>
        </div>

        {/* 기간 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">📅 계약 기간</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">시작일</label>
              <input type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">종료일</label>
              <input type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-bold mb-1">기간 (개월)</label>
              <input type="number" value={form.contractPeriod} onChange={(e) => handleNumberChange('contractPeriod', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
            </div>
          </div>
        </div>

        {/* 특약 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">📌 특약사항</h2>
          <textarea value={form.specialTerms} onChange={(e) => handleChange('specialTerms', e.target.value)}
            rows={4} placeholder="특약사항을 입력하세요..."
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none" />
        </div>

        {/* 저장 버튼 */}
        <div className="flex gap-3">
          <Link href={`/contracts/${contractId}`} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 text-sm text-center hover:bg-gray-50 transition">
            취소
          </Link>
          <button onClick={handleSave} disabled={saving || !!error && !form.propertyTitle}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 text-sm transition">
            {saving ? '저장 중...' : '💾 변경사항 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
