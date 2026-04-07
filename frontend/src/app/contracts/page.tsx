'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getContracts,
  signContractAsTenant,
  cancelContract,
  deleteContract,
  getExchangeRates,
} from '@/lib/api/client';
import { getUser } from '@/lib/auth';

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

const FALLBACK: Contract[] = [
  { id:1, propertyId:1, propertyTitle:'신주쿠산초메 도보 5분 1K 맨션', tenantName:'Test User', landlordName:'Tanaka Taro', monthlyRent:89000, deposit:89000, reikin:89000, managementFee:5000, keyMoney:16500, insuranceFee:18000, status:'active', tenantSigned:true, landlordSigned:true, startDate:'2026-04-01', endDate:'2028-03-31', contractPeriod:24, specialTerms:'외국인 보증회사(GTN) 가입 필수.', createdAt:'2026-03-20T10:00:00Z' },
  { id:2, propertyId:10, propertyTitle:'에비스 디아쥬 1LDK 고급 맨션', tenantName:'Test User', landlordName:'Tanaka Taro', monthlyRent:475000, deposit:950000, reikin:475000, managementFee:15000, keyMoney:22000, insuranceFee:20000, status:'draft', tenantSigned:false, landlordSigned:true, startDate:'2026-05-01', endDate:'2028-04-30', contractPeriod:24, specialTerms:'펫 가능.', createdAt:'2026-04-01T09:00:00Z' },
  { id:3, propertyId:16, propertyTitle:'이케부쿠로 프라임어반 1K', tenantName:'Test User', landlordName:'Suzuki Hanako', monthlyRent:139000, deposit:139000, reikin:0, managementFee:8000, keyMoney:16500, insuranceFee:18000, status:'cancelled', tenantSigned:true, landlordSigned:false, startDate:'2026-03-01', endDate:'2028-02-28', contractPeriod:24, cancelReason:'집주인 사정으로 매물 철회', createdAt:'2026-02-15T11:00:00Z' },
  { id:4, propertyId:24, propertyTitle:'아자부주반 라산테 1LDK', tenantName:'Test User', landlordName:'Yamada Ichiro', monthlyRent:283000, deposit:566000, reikin:283000, managementFee:12000, keyMoney:22000, insuranceFee:20000, status:'draft', tenantSigned:false, landlordSigned:false, startDate:'2026-06-01', endDate:'2028-05-31', contractPeriod:24, createdAt:'2026-04-05T08:30:00Z' },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [krwRate, setKrwRate] = useState(9.5);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: 'cancel' | 'delete'; contractId: number; title: string } | null>(null);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const user = getUser();
      if (!user) { setContracts([]); return; }
      const data = await getContracts({ tenantId: user.id });
      const list = Array.isArray(data) ? data : [];
      setContracts(list as Contract[]);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
  }, []);

  const toKrw = (jpy: number) => `₩${Math.round(jpy * krwRate).toLocaleString()}`;

  const handleSign = async (id: number) => {
    setActionLoading(id);
    try {
      await signContractAsTenant(id);
      await loadContracts();
    } catch { alert('서명에 실패했습니다.'); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (id: number) => {
    setActionLoading(id);
    try {
      await cancelContract(id);
      await loadContracts();
      setConfirmModal(null);
    } catch { alert('취소에 실패했습니다.'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    try {
      await deleteContract(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      setConfirmModal(null);
    } catch (e: any) { alert(e.message || '삭제에 실패했습니다.'); }
    finally { setActionLoading(null); }
  };

  const filtered = filter === 'all' ? contracts : contracts.filter(c => c.status === filter);

  const counts = {
    all: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    active: contracts.filter(c => c.status === 'active').length,
    cancelled: contracts.filter(c => c.status === 'cancelled').length,
  };

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    draft: { label: '서명 대기', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⏳' },
    active: { label: '계약 체결', color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
    cancelled: { label: '취소됨', color: 'bg-red-100 text-red-700 border-red-200', icon: '❌' },
  };

  const totalInitialCost = (c: Contract) =>
    (c.deposit || 0) + (c.reikin || 0) + (c.monthlyRent || 0) + (c.managementFee || 0) + (c.keyMoney || 0) + (c.insuranceFee || 0);

  const monthlyCost = (c: Contract) => (c.monthlyRent || 0) + (c.managementFee || 0);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">✍️ 전자 계약</h1>
            <p className="text-gray-500 text-sm">안전한 디지털 전자 서명으로 임대차 계약을 관리하세요</p>
          </div>
          <Link href="/contracts/new" className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 transition flex items-center justify-center gap-1.5 flex-shrink-0 w-full sm:w-auto">
            ➕ 새 계약 작성
          </Link>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {([
            { key: 'all', label: '전체', icon: '📋', bg: 'bg-blue-50 border-blue-200' },
            { key: 'draft', label: '서명 대기', icon: '⏳', bg: 'bg-amber-50 border-amber-200' },
            { key: 'active', label: '계약 체결', icon: '✅', bg: 'bg-green-50 border-green-200' },
            { key: 'cancelled', label: '취소됨', icon: '❌', bg: 'bg-red-50 border-red-200' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`p-4 border text-left transition ${f.bg} ${filter === f.key ? 'ring-2 ring-green-400' : 'hover:shadow'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{f.icon}</span>
                <span className="text-2xl font-extrabold text-gray-800">{counts[f.key]}</span>
              </div>
              <p className="text-xs text-gray-500 font-bold mt-1">{f.label}</p>
            </button>
          ))}
        </div>

        {/* 계약 목록 */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-3xl mb-3 animate-pulse">📄</div>
            <p className="font-bold">계약서를 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="font-bold text-gray-700 mb-2">
              {filter === 'all' ? '아직 계약이 없습니다' : `"${statusConfig[filter]?.label || filter}" 상태의 계약이 없습니다`}
            </p>
            <p className="text-sm text-gray-400 mb-4">매물을 검색하고 집주인에게 연락하면 계약서가 여기에 표시됩니다</p>
            <Link href="/properties" className="inline-block bg-green-500 text-white font-bold text-sm px-6 py-2">매물 검색하기</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => {
              const cfg = statusConfig[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-600', icon: '📄' };
              const initCost = totalInitialCost(c);
              return (
                <div key={c.id} className={`bg-white border p-6 transition hover:shadow-md ${c.status === 'cancelled' ? 'border-gray-200 opacity-70' : 'border-gray-200'}`}>
                  {/* 상단: 제목 + 상태 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/contracts/${c.id}`} className="font-bold text-base text-gray-800 hover:text-green-600 transition truncate">
                          {c.propertyTitle || `계약 #${c.id}`}
                        </Link>
                        <span className={`text-[11px] font-bold px-2 py-0.5 border ${cfg.color} flex-shrink-0`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        집주인: {c.landlordName || '미정'} · 계약번호: #{c.id.toString().padStart(4, '0')}
                        {c.createdAt && <> · {new Date(c.createdAt).toLocaleDateString('ko-KR')}</>}
                      </p>
                    </div>
                  </div>

                  {/* 비용 상세 */}
                  <div className="mb-4 border border-gray-100 overflow-hidden">
                    {/* 월 납부 비용 */}
                    <div className="bg-blue-50/60 px-4 py-2 border-b border-gray-100">
                      <p className="text-[11px] font-bold text-blue-600 tracking-wide">💰 매월 납부 비용</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-gray-600">월세(賃料)</span>
                        <div className="text-right">
                          <span className="font-bold text-green-600">¥{c.monthlyRent?.toLocaleString() || '0'}</span>
                          {c.monthlyRent ? <span className="text-[11px] text-gray-400 ml-2">{toKrw(c.monthlyRent)}</span> : null}
                        </div>
                      </div>
                      {(c.managementFee || 0) > 0 && (
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-gray-600">관리비(管理費)</span>
                          <div className="text-right">
                            <span className="font-bold">¥{c.managementFee?.toLocaleString()}</span>
                            <span className="text-[11px] text-gray-400 ml-2">{toKrw(c.managementFee!)}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/40">
                        <span className="text-sm font-bold text-gray-700">월 합계</span>
                        <div className="text-right">
                          <span className="font-extrabold text-blue-600">¥{monthlyCost(c).toLocaleString()}</span>
                          <span className="text-[11px] text-gray-400 ml-2">{toKrw(monthlyCost(c))}</span>
                        </div>
                      </div>
                    </div>

                    {/* 초기 비용 */}
                    <div className="bg-amber-50/60 px-4 py-2 border-t border-b border-gray-100">
                      <p className="text-[11px] font-bold text-amber-600 tracking-wide">🏠 입주 시 초기 비용</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <span className="text-sm text-gray-600">보증금(敷金)</span>
                          <span className="text-[10px] text-gray-400 ml-1">퇴거 시 반환</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">¥{c.deposit?.toLocaleString() || '0'}</span>
                          {c.deposit ? <span className="text-[11px] text-gray-400 ml-2">{toKrw(c.deposit)}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <span className="text-sm text-gray-600">사례금(礼金)</span>
                          <span className="text-[10px] text-gray-400 ml-1">반환 불가</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">¥{c.reikin?.toLocaleString() || '0'}</span>
                          {c.reikin ? <span className="text-[11px] text-gray-400 ml-2">{toKrw(c.reikin)}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-gray-600">첫달 월세+관리비</span>
                        <div className="text-right">
                          <span className="font-bold">¥{monthlyCost(c).toLocaleString()}</span>
                          <span className="text-[11px] text-gray-400 ml-2">{toKrw(monthlyCost(c))}</span>
                        </div>
                      </div>
                      {(c.keyMoney || 0) > 0 && (
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-gray-600">중개수수료(仲介手数料)</span>
                          <div className="text-right">
                            <span className="font-bold">¥{c.keyMoney?.toLocaleString()}</span>
                            <span className="text-[11px] text-gray-400 ml-2">{toKrw(c.keyMoney!)}</span>
                          </div>
                        </div>
                      )}
                      {(c.insuranceFee || 0) > 0 && (
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-gray-600">화재보험(火災保険)</span>
                          <div className="text-right">
                            <span className="font-bold">¥{c.insuranceFee?.toLocaleString()}</span>
                            <span className="text-[11px] text-gray-400 ml-2">{toKrw(c.insuranceFee!)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 합계 */}
                    <div className="bg-green-50 border-t-2 border-green-300 px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-gray-800">초기비용 합계</p>
                        <p className="text-[10px] text-gray-400">입주 시 한 번에 납부하는 금액</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-extrabold text-green-600">¥{initCost.toLocaleString()}</p>
                        <p className="text-xs font-bold text-gray-500">{toKrw(initCost)}</p>
                      </div>
                    </div>

                    {/* 계약 기간 */}
                    {c.startDate && c.endDate && (
                      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-sm text-gray-600">📅 계약 기간</span>
                        <span className="font-bold text-sm text-gray-700">{c.startDate?.slice(0,7)} ~ {c.endDate?.slice(0,7)} ({c.contractPeriod || 24}개월)</span>
                      </div>
                    )}
                  </div>

                  {/* 서명 상태 */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className={c.tenantSigned ? 'text-green-500' : 'text-gray-300'}>{c.tenantSigned ? '✅' : '⬜'}</span>
                      <span className={`font-bold ${c.tenantSigned ? 'text-green-600' : 'text-gray-400'}`}>세입자 서명</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className={c.landlordSigned ? 'text-green-500' : 'text-gray-300'}>{c.landlordSigned ? '✅' : '⬜'}</span>
                      <span className={`font-bold ${c.landlordSigned ? 'text-green-600' : 'text-gray-400'}`}>집주인 서명</span>
                    </div>
                    {c.status === 'cancelled' && c.cancelReason && (
                      <span className="text-xs text-red-500 ml-auto">사유: {c.cancelReason}</span>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/contracts/${c.id}`} className="text-sm font-bold text-green-600 border border-green-300 px-4 py-1.5 hover:bg-green-50 transition">
                      상세보기
                    </Link>

                    {c.status === 'draft' && !c.tenantSigned && (
                      <button
                        onClick={() => handleSign(c.id)}
                        disabled={actionLoading === c.id}
                        className="text-sm font-bold bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-1.5 transition"
                      >
                        {actionLoading === c.id ? '처리 중...' : '✍️ 전자 서명'}
                      </button>
                    )}

                    {c.status === 'draft' && (
                      <Link href={`/contracts/${c.id}/edit`} className="text-sm font-bold text-blue-600 border border-blue-300 px-4 py-1.5 hover:bg-blue-50 transition">
                        ✏️ 수정
                      </Link>
                    )}

                    {(c.status === 'draft' || c.status === 'active') && (
                      <button
                        onClick={() => setConfirmModal({ type: 'cancel', contractId: c.id, title: c.propertyTitle || '' })}
                        className="text-sm font-bold text-orange-600 border border-orange-300 px-4 py-1.5 hover:bg-orange-50 transition"
                      >
                        🚫 계약 취소
                      </button>
                    )}

                    {(c.status === 'draft' || c.status === 'cancelled') && (
                      <button
                        onClick={() => setConfirmModal({ type: 'delete', contractId: c.id, title: c.propertyTitle || '' })}
                        className="text-sm font-bold text-red-500 border border-red-300 px-4 py-1.5 hover:bg-red-50 transition"
                      >
                        🗑️ 삭제
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 안내 배너 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-5">
          <h3 className="font-bold text-blue-800 mb-2">📌 전자계약 안내</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <p>• 2022년 5월부터 일본에서도 전자계약이 법적으로 유효합니다</p>
            <p>• 중요사항설명(重要事項説明)도 온라인으로 가능</p>
            <p>• 서명 대기 상태에서만 계약 내용 수정이 가능합니다</p>
            <p>• 체결된 계약은 먼저 취소 후 삭제할 수 있습니다</p>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 z-[9990] flex items-center justify-center px-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-white w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">{confirmModal.type === 'cancel' ? '🚫' : '🗑️'}</div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                {confirmModal.type === 'cancel' ? '계약을 취소하시겠습니까?' : '계약을 삭제하시겠습니까?'}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{confirmModal.title}</p>
              <p className="text-xs text-red-500">
                {confirmModal.type === 'cancel' ? '취소된 계약은 되돌릴 수 없습니다.' : '삭제된 계약은 복구할 수 없습니다.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 text-sm hover:bg-gray-50 transition">
                아니오
              </button>
              <button
                onClick={() => confirmModal.type === 'cancel' ? handleCancel(confirmModal.contractId) : handleDelete(confirmModal.contractId)}
                disabled={actionLoading === confirmModal.contractId}
                className={`flex-1 text-white font-bold py-2.5 text-sm transition ${confirmModal.type === 'cancel' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600'} disabled:bg-gray-300`}
              >
                {actionLoading === confirmModal.contractId ? '처리 중...' : confirmModal.type === 'cancel' ? '네, 취소합니다' : '네, 삭제합니다'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
