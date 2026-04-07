'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getProperties, getExchangeRates } from '@/lib/api/client';

interface Property {
  id: number;
  title?: string;
  titleKo?: string;
  address?: string;
  addressKo?: string;
  monthlyRent?: number;
  deposit?: number;
  roomType?: string;
  floorArea?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  images?: string[];
  foreignerWelcome?: boolean;
  foreigner?: boolean;
  rating?: number;
  averageRating?: number;
  walkMinutes?: number;
  nearbyStation?: string;
  nearestStation?: string;
  nearestStationKo?: string;
}

const AREAS = [
  { label: '전체 도쿄', center: [35.6895, 139.6917] as [number, number], zoom: 12 },
  { label: '신주쿠', center: [35.6938, 139.7035] as [number, number], zoom: 14 },
  { label: '시부야', center: [35.6580, 139.7016] as [number, number], zoom: 14 },
  { label: '이케부쿠로', center: [35.7295, 139.7109] as [number, number], zoom: 14 },
  { label: '미나토', center: [35.6580, 139.7514] as [number, number], zoom: 14 },
  { label: '나카노', center: [35.7067, 139.6651] as [number, number], zoom: 14 },
  { label: '메구로', center: [35.6340, 139.7160] as [number, number], zoom: 14 },
  { label: '세타가야', center: [35.6461, 139.6532] as [number, number], zoom: 14 },
];

const RENT_RANGES = [
  { label: '전체', min: 0, max: 99999999 },
  { label: '~8만엔', min: 0, max: 80000 },
  { label: '8~12만엔', min: 80000, max: 120000 },
  { label: '12~20만엔', min: 120000, max: 200000 },
  { label: '20만엔~', min: 200000, max: 99999999 },
];

const FALLBACK_PROPS: Property[] = [
  { id:1, titleKo:'신주쿠산초메 1K 맨션', addressKo:'신주쿠구 나카이 1초메', monthlyRent:89000, deposit:89000, roomType:'1K', size:25, latitude:35.6938, longitude:139.6977, foreigner:true, rating:4.5, walkMinutes:5, nearestStationKo:'신주쿠산초메역' },
  { id:2, titleKo:'시부야 디자이너 맨션', addressKo:'시부야구 진난 1초메', monthlyRent:145000, deposit:145000, roomType:'1K', size:28, latitude:35.6625, longitude:139.6994, foreigner:true, rating:4.7, walkMinutes:8, nearestStationKo:'시부야역' },
  { id:3, titleKo:'이케부쿠로 프라임어반', addressKo:'토시마구 히가시이케부쿠로', monthlyRent:139000, deposit:139000, roomType:'1K', size:26, latitude:35.7312, longitude:139.7105, foreigner:true, rating:4.3, walkMinutes:6, nearestStationKo:'이케부쿠로역' },
  { id:4, titleKo:'아자부주반 타워 2LDK', addressKo:'미나토구 아자부주반', monthlyRent:420000, deposit:840000, roomType:'2LDK', size:68, latitude:35.6545, longitude:139.7369, foreigner:true, rating:4.9, walkMinutes:3, nearestStationKo:'아자부주반역' },
  { id:5, titleKo:'나카노 스테이션프론트', addressKo:'나카노구 나카노 4초메', monthlyRent:78000, deposit:78000, roomType:'1R', size:20, latitude:35.7067, longitude:139.6651, foreigner:true, rating:4.2, walkMinutes:2, nearestStationKo:'나카노역' },
];

export default function MapPage() {
  const [props, setProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState(0);
  const [rent, setRent] = useState(0);
  const [foreignerOnly, setForeignerOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [krwRate, setKrwRate] = useState(9.5);
  const [mapReady, setMapReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProperties() as any;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        if (list.length > 0) setProps(list);
        else throw new Error('empty');
      } catch { setProps(FALLBACK_PROPS); }
      setLoading(false);
    })();
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
  }, []);

  // Leaflet 초기화 (순수 JS API, react-leaflet 안 씀)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;
      leafletRef.current = L;

      // 마커 아이콘 수정
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current).setView(AREAS[0].center, AREAS[0].zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    })();

    return () => { cancelled = true; };
  }, []);

  // 지역 변경 시 지도 이동
  useEffect(() => {
    if (!mapRef.current) return;
    const a = AREAS[area];
    mapRef.current.setView(a.center, a.zoom);
  }, [area, mapReady]);

  const filtered = useMemo(() => {
    let list = props.filter(p => p.latitude && p.longitude);
    const r = RENT_RANGES[rent];
    if (r) list = list.filter(p => (p.monthlyRent || 0) >= r.min && (p.monthlyRent || 0) < r.max);
    if (foreignerOnly) list = list.filter(p => p.foreignerWelcome || p.foreigner);
    return list;
  }, [props, rent, foreignerOnly]);

  // 마커 업데이트
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    // 기존 마커 제거
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // 새 마커 추가
    filtered.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      const marker = L.marker([p.latitude, p.longitude]).addTo(map);
      const station = p.nearbyStation || p.nearestStation || '';
      marker.bindPopup(`
        <div style="min-width:200px">
          <p style="font-weight:bold;font-size:13px;margin-bottom:4px">${p.titleKo || p.title}</p>
          <p style="color:#16a34a;font-weight:bold">¥${(p.monthlyRent || 0).toLocaleString()}/월</p>
          <p style="font-size:12px;color:#666">${p.roomType || ''} · ${p.floorArea || p.size || ''}㎡</p>
          ${station ? `<p style="font-size:11px;color:#999">🚶 ${station}</p>` : ''}
          <a href="/properties/${p.id}" style="font-size:12px;color:#3b82f6;font-weight:bold">상세보기 →</a>
        </div>
      `);
      marker.on('click', () => setSelectedId(p.id));
      markersRef.current.push(marker);
    });
  }, [filtered, mapReady]);

  // cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const toKrw = (jpy: number) => `₩${Math.round(jpy * krwRate).toLocaleString()}`;
  const selected = selectedId !== null ? props.find(p => p.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-extrabold text-gray-900">🗺️ 지도로 매물 찾기</h1>
            <span className="text-sm text-gray-500 font-bold">{filtered.length}개 매물</span>
          </div>
          {/* 필터 */}
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a, i) => (
              <button key={i} onClick={() => setArea(i)}
                className={`text-xs font-bold px-3 py-1.5 border transition ${area === i ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}>
                {a.label}
              </button>
            ))}
            <div className="w-px bg-gray-200 mx-1"></div>
            {RENT_RANGES.map((r, i) => (
              <button key={i} onClick={() => setRent(i)}
                className={`text-xs font-bold px-3 py-1.5 border transition ${rent === i ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}>
                {r.label}
              </button>
            ))}
            <button onClick={() => setForeignerOnly(!foreignerOnly)}
              className={`text-xs font-bold px-3 py-1.5 border transition ${foreignerOnly ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
              🌏 외국인 가능
            </button>
          </div>
        </div>
      </div>

      {/* 지도 + 사이드바 */}
      <div className="flex" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 지도 */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="w-full h-full" />
          {(loading || !mapReady) && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
              <div className="text-center"><p className="text-4xl mb-2 animate-pulse">🗺️</p><p className="font-bold text-gray-500 text-sm">매물 로딩 중...</p></div>
            </div>
          )}
        </div>

        {/* 사이드 리스트 */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto hidden lg:block">
          <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="font-bold text-sm text-gray-800">📋 매물 목록 ({filtered.length})</h2>
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400"><p className="text-3xl mb-2">🏠</p><p className="text-sm font-bold">조건에 맞는 매물이 없습니다</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(p => (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left p-4 hover:bg-green-50 transition ${selectedId === p.id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0 overflow-hidden">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-800 truncate">{p.titleKo || p.title}</p>
                      <p className="text-[10px] text-gray-400 mb-1">🚶 {p.nearestStationKo || p.nearbyStation || p.nearestStation}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-extrabold text-sm">¥{p.monthlyRent?.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400">{p.roomType} · {p.floorArea || p.size}㎡</span>
                      </div>
                      {p.monthlyRent && <p className="text-[10px] text-gray-400">{toKrw(p.monthlyRent)}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 선택된 매물 모바일 카드 */}
      {selected && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl z-[1000]">
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
              {selected.imageUrl ? <img src={selected.imageUrl} alt="" className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-800 truncate">{selected.titleKo || selected.title}</p>
              <p className="text-[11px] text-gray-400 mb-1">🚶 {selected.nearestStationKo || selected.nearbyStation || selected.nearestStation} · {selected.roomType} · {selected.floorArea || selected.size}㎡</p>
              <p className="text-green-600 font-extrabold">¥{selected.monthlyRent?.toLocaleString()}/월 <span className="text-gray-400 font-normal text-xs">{selected.monthlyRent ? toKrw(selected.monthlyRent) : ''}</span></p>
            </div>
            <Link href={`/properties/${selected.id}`} className="bg-green-500 text-white text-xs font-bold px-4 flex items-center flex-shrink-0 hover:bg-green-600 transition">
              상세 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
