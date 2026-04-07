'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getContract, signContractAsTenant, cancelContract, deleteContract, getExchangeRates } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

interface Contract {
  id: number;
  propertyId?: number;
  propertyTitle?: string;
  tenantName?: string;
  landlordName?: string;
  monthlyRent?: number;
  deposit?: number;
  reikin?: number;
  managementFee?: number;
  keyMoney?: number;
  insuranceFee?: number;
  status: string;
  tenantSigned?: boolean;
  landlordSigned?: boolean;
  startDate?: string;
  endDate?: string;
  contractPeriod?: number;
  specialTerms?: string;
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEMO: Record<number, Contract> = {
  1: { id:1, propertyId:1, propertyTitle:'신주쿠산초메 도보 5분 1K 맨션', tenantName:'Test User', landlordName:'Tanaka Taro', monthlyRent:89000, deposit:89000, reikin:89000, managementFee:5000, keyMoney:16500, insuranceFee:18000, status:'active', tenantSigned:true, landlordSigned:true, startDate:'2026-04-01', endDate:'2028-03-31', contractPeriod:24, specialTerms:'외국인 보증회사(GTN) 가입 필수. 퇴거 시 원상복구 비용 별도.', createdAt:'2026-03-20T10:00:00Z', updatedAt:'2026-03-25T14:00:00Z' },
  2: { id:2, propertyId:10, propertyTitle:'에비스 디아쥬 1LDK 고급 맨션', tenantName:'Test User', landlordName:'Tanaka Taro', monthlyRent:475000, deposit:950000, reikin:475000, managementFee:15000, keyMoney:22000, insuranceFee:20000, status:'draft', tenantSigned:false, landlordSigned:true, startDate:'2026-05-01', endDate:'2028-04-30', contractPeriod:24, specialTerms:'펫 가능(소형견 1마리). 24시간 콩시어지 서비스 포함.', createdAt:'2026-04-01T09:00:00Z', updatedAt:'2026-04-01T09:00:00Z' },
  3: { id:3, propertyId:16, propertyTitle:'이케부쿠로 프라임어반 1K', tenantName:'Test User', landlordName:'Suzuki Hanako', monthlyRent:139000, deposit:139000, reikin:0, managementFee:8000, keyMoney:16500, insuranceFee:18000, status:'cancelled', tenantSigned:true, landlordSigned:false, startDate:'2026-03-01', endDate:'2028-02-28', contractPeriod:24, specialTerms:'레이킨 무료 캠페인 적용. 인터넷 무료.', cancelReason:'집주인 사정으로 매물 철회', createdAt:'2026-02-15T11:00:00Z', updatedAt:'2026-03-01T16:00:00Z' },
  4: { id:4, propertyId:24, propertyTitle:'아자부주반 라산테 1LDK', tenantName:'Test User', landlordName:'Yamada Ichiro', monthlyRent:283000, deposit:566000, reikin:283000, managementFee:12000, keyMoney:22000, insuranceFee:20000, status:'draft', tenantSigned:false, landlordSigned:false, startDate:'2026-06-01', endDate:'2028-05-31', contractPeriod:24, specialTerms:'오토록·택배BOX 완비. 주차장 별도 계약 가능(월 35,000엔).', createdAt:'2026-04-05T08:30:00Z', updatedAt:'2026-04-05T08:30:00Z' },
};

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [krwRate, setKrwRate] = useState(9.5);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<'cancel' | 'delete' | null>(null);
  const contractId = parseInt(params.id);

  useEffect(() => {
    (async () => {
      try {
        const data = await getContract(contractId);
        if (data && typeof data === 'object' && 'id' in (data as any)) setContract(data as Contract);
        else throw new Error('invalid');
      } catch {
        setContract(DEMO[contractId] ?? DEMO[1]!);
      }
      setLoading(false);
    })();
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
  }, [contractId]);

  const toKrw = (jpy: number) => `₩${Math.round(jpy * krwRate).toLocaleString()}`;

  const handleSign = async () => {
    setActionLoading(true);
    try {
      const res = await signContractAsTenant(contractId);
      setContract(res as Contract);
    } catch { alert('서명에 실패했습니다.'); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await cancelContract(contractId);
      setContract(res as Contract);
      setConfirmModal(null);
    } catch { alert('취소에 실패했습니다.'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteContract(contractId);
      setConfirmModal(null);
      router.push('/contracts');
    } catch (e: any) { alert(e.message || '삭제에 실패했습니다.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400"><p className="text-4xl mb-3 animate-pulse">📄</p><p className="font-bold">계약서를 불러오는 중...</p></div>
    </div>
  );

  if (!contract) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><p className="text-4xl mb-3">😥</p><p className="text-gray-500 font-bold">계약을 찾을 수 없습니다</p>
        <Link href="/contracts" className="inline-block mt-4 bg-green-500 text-white font-bold text-sm px-6 py-2">← 계약 목록</Link></div>
    </div>
  );

  const c = contract;
  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    draft: { label: '서명 대기', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⏳' },
    active: { label: '계약 체결', color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
    cancelled: { label: '취소됨', color: 'bg-red-100 text-red-700 border-red-200', icon: '❌' },
  };
  const cfg = statusConfig[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-600', icon: '📄' };

  const costItems = [
    { label: '보증금 (敷金)', value: c.deposit, desc: '퇴거 시 원상복구 비용 공제 후 반환' },
    { label: '사례금 (礼金)', value: c.reikin, desc: '집주인에게 지불하는 사례금, 반환 불가' },
    { label: '첫 달 월세', value: c.monthlyRent, desc: '입주 시 첫 달 월세 선납' },
    { label: '관리비 (管理費)', value: c.managementFee, desc: '건물 공용부 관리·청소 비용' },
    { label: '열쇠 교환비', value: c.keyMoney, desc: '보안을 위한 열쇠 교환 비용' },
    { label: '화재보험료', value: c.insuranceFee, desc: '2년 일괄 납부 (갱신 시 재가입)' },
  ];
  const totalInitial = costItems.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/contracts" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">← 계약 목록으로</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 계약 헤더 */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-xl font-extrabold text-gray-900">{c.propertyTitle}</h1>
                    <span className={`text-[11px] font-bold px-2.5 py-1 border ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">계약번호: #{c.id.toString().padStart(4, '0')}</p>
                </div>
              </div>

              {/* 당사자 정보 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 border border-blue-100 p-4">
                  <p className="text-[11px] text-gray-500 mb-1">🏠 임대인 (집주인)</p>
                  <p className="font-bold text-sm">{c.landlordName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={c.landlordSigned ? 'text-green-500' : 'text-gray-300'}>{c.landlordSigned ? '✅' : '⬜'}</span>
                    <span className={`text-xs ${c.landlordSigned ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                      {c.landlordSigned ? '서명 완료' : '서명 대기'}
                    </span>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 p-4">
                  <p className="text-[11px] text-gray-500 mb-1">👤 임차인 (세입자)</p>
                  <p className="font-bold text-sm">{c.tenantName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={c.tenantSigned ? 'text-green-500' : 'text-gray-300'}>{c.tenantSigned ? '✅' : '⬜'}</span>
                    <span className={`text-xs ${c.tenantSigned ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                      {c.tenantSigned ? '서명 완료' : '서명 대기'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 계약 기간 */}
              <div className="bg-gray-50 border border-gray-100 p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">계약 시작일</p>
                    <p className="font-bold">{c.startDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">계약 종료일</p>
                    <p className="font-bold">{c.endDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 mb-0.5">계약 기간</p>
                    <p className="font-bold">{c.contractPeriod || 24}개월</p>
                  </div>
                </div>
              </div>

              {/* 월세 */}
              <div className="bg-green-50 border border-green-200 p-4">
                <p className="text-[11px] text-gray-500 mb-1">💰 월세 (賃料)</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-green-600">¥{c.monthlyRent?.toLocaleString()}</span>
                  {c.monthlyRent && <span className="text-sm text-gray-500">{toKrw(c.monthlyRent)}</span>}
                  {c.managementFee && <span className="text-xs text-gray-400">+ 관리비 ¥{c.managementFee.toLocaleString()}/월</span>}
                </div>
              </div>
            </div>

            {/* 초기비용 내역 */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">💳 초기비용 내역</h2>
              <div className="space-y-3">
                {costItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-700">{item.label}</p>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">¥{(item.value || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">{toKrw(item.value || 0)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t-2 border-green-200">
                  <p className="font-extrabold text-green-700">합계</p>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-green-600">¥{totalInitial.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{toKrw(totalInitial)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 특약사항 */}
            {c.specialTerms && (
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-lg font-extrabold text-gray-900 mb-3">📌 특약사항</h2>
                <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 leading-relaxed">
                  {c.specialTerms}
                </div>
              </div>
            )}

            {/* 취소 사유 */}
            {c.status === 'cancelled' && c.cancelReason && (
              <div className="bg-red-50 border border-red-200 p-6">
                <h2 className="text-lg font-extrabold text-red-700 mb-2">❌ 계약 취소 사유</h2>
                <p className="text-sm text-red-600">{c.cancelReason}</p>
              </div>
            )}

            {/* 타임라인 */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">📅 계약 이력</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">계약서 생성</p>
                    <p className="text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleString('ko-KR') : '-'}</p>
                  </div>
                </div>
                {c.landlordSigned && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">집주인 서명 완료</p>
                      <p className="text-xs text-gray-400">{c.landlordName}</p>
                    </div>
                  </div>
                )}
                {c.tenantSigned && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">세입자 서명 완료</p>
                      <p className="text-xs text-gray-400">{c.tenantName}</p>
                    </div>
                  </div>
                )}
                {c.status === 'active' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-green-600">계약 체결 완료</p>
                      <p className="text-xs text-gray-400">양측 서명 완료 → 계약 확정</p>
                    </div>
                  </div>
                )}
                {c.status === 'cancelled' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-red-600">계약 취소</p>
                      <p className="text-xs text-gray-400">{c.updatedAt ? new Date(c.updatedAt).toLocaleString('ko-KR') : '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 액션 패널 */}
            <div className="bg-white border border-gray-200 p-6 sticky top-4">
              <div className="text-center mb-4">
                <span className={`inline-block text-sm font-bold px-4 py-1.5 border ${cfg.color} mb-2`}>{cfg.icon} {cfg.label}</span>
                <p className="text-xl font-extrabold text-gray-800">¥{c.monthlyRent?.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/월</span></p>
              </div>

              <div className="space-y-2">
                {c.status === 'draft' && !c.tenantSigned && (
                  <button onClick={handleSign} disabled={actionLoading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 text-sm transition">
                    {actionLoading ? '처리 중...' : '✍️ 전자 서명하기'}
                  </button>
                )}

                {c.status === 'draft' && (
                  <Link href={`/contracts/${c.id}/edit`} className="block w-full border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-bold py-3 text-sm text-center transition">
                    ✏️ 계약 내용 수정
                  </Link>
                )}

                {(c.status === 'draft' || c.status === 'active') && (
                  <button onClick={() => setConfirmModal('cancel')}
                    className="w-full border border-orange-300 text-orange-600 hover:bg-orange-50 font-bold py-3 text-sm transition">
                    🚫 계약 취소
                  </button>
                )}

                {(c.status === 'draft' || c.status === 'cancelled') && (
                  <button onClick={() => setConfirmModal('delete')}
                    className="w-full border border-red-300 text-red-500 hover:bg-red-50 font-bold py-3 text-sm transition">
                    🗑️ 계약 삭제
                  </button>
                )}

                <Link href="/contracts" className="block w-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 font-bold py-3 text-sm text-center transition">
                  ← 목록으로 돌아가기
                </Link>
              </div>
            </div>

            {/* 일본 계약 용어 */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-sm text-gray-800 mb-3">📖 계약 용어 해설</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">敷金 (시키킨)</span><span className="text-gray-700 font-bold">보증금</span></div>
                <div className="flex justify-between"><span className="text-gray-500">礼金 (레이킨)</span><span className="text-gray-700 font-bold">사례금</span></div>
                <div className="flex justify-between"><span className="text-gray-500">管理費 (칸리히)</span><span className="text-gray-700 font-bold">관리비</span></div>
                <div className="flex justify-between"><span className="text-gray-500">仲介手数料</span><span className="text-gray-700 font-bold">중개수수료</span></div>
                <div className="flex justify-between"><span className="text-gray-500">更新料 (코신료)</span><span className="text-gray-700 font-bold">갱신료 (2년마다)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">原状回復</span><span className="text-gray-700 font-bold">원상복구</span></div>
                <div className="flex justify-between"><span className="text-gray-500">解約予告</span><span className="text-gray-700 font-bold">해약고지 (1개월 전)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 z-[9990] flex items-center justify-center px-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-white w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">{confirmModal === 'cancel' ? '🚫' : '🗑️'}</div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                {confirmModal === 'cancel' ? '계약을 취소하시겠습니까?' : '계약을 삭제하시겠습니까?'}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{c.propertyTitle}</p>
              <p className="text-xs text-red-500">
                {confirmModal === 'cancel' ? '취소된 계약은 되돌릴 수 없습니다.' : '삭제된 계약은 복구할 수 없습니다.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 text-sm hover:bg-gray-50 transition">
                아니오
              </button>
              <button
                onClick={confirmModal === 'cancel' ? handleCancel : handleDelete}
                disabled={actionLoading}
                className={`flex-1 text-white font-bold py-2.5 text-sm transition ${confirmModal === 'cancel' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600'} disabled:bg-gray-300`}
              >
                {actionLoading ? '처리 중...' : confirmModal === 'cancel' ? '네, 취소합니다' : '네, 삭제합니다'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
