'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface RoomData {
  id: string;
  label: string;
  icon: string;
  desc: string;
  img: string;
  details: string[];
  hotspots: { label: string; x: number; y: number }[];
}

const rooms: RoomData[] = [
  { id:'living', label:'거실', icon:'🛋️', desc:'넓은 거실 공간, 남향 채광 — 12조 (약 20㎡)', img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop', details:['남향 큰 창문','플로링 바닥','에어컨 설치 완료','LED 조명'], hotspots:[{label:'에어컨',x:75,y:15},{label:'창문 (남향)',x:30,y:25},{label:'콘센트',x:90,y:80}] },
  { id:'bedroom', label:'침실', icon:'🛏️', desc:'6조 (약 10㎡) 다다미 침실, 붙박이 수납장', img:'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=600&fit=crop', details:['6조 (약 10㎡)','클로젯 수납장','커튼레일 설치','차음 이중벽'], hotspots:[{label:'클로젯',x:85,y:40},{label:'침대 위치',x:40,y:60},{label:'조명 스위치',x:10,y:50}] },
  { id:'kitchen', label:'주방', icon:'🍳', desc:'2구 IH 쿡탑, 미니 싱크대', img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop', details:['IH 2구 쿡탑','미니 냉장고 포함','환기팬','수납 선반 2단'], hotspots:[{label:'IH 쿡탑',x:45,y:55},{label:'냉장고',x:80,y:50},{label:'싱크대',x:25,y:60}] },
  { id:'bathroom', label:'욕실', icon:'🚿', desc:'유닛배스, 욕조+샤워+세면대 일체형', img:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=600&fit=crop', details:['욕조 (자동 급수)','추이건조기','독립 세면대','방수 바닥'], hotspots:[{label:'욕조',x:50,y:65},{label:'세면대',x:20,y:45},{label:'건조기',x:80,y:30}] },
  { id:'entrance', label:'현관', icon:'🚪', desc:'오토락 현관, 신발장 포함', img:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=600&fit=crop', details:['오토락 시스템','신발장 (8켤레)','인터폰 모니터','우산꽂이'], hotspots:[{label:'오토락',x:15,y:40},{label:'신발장',x:70,y:70},{label:'인터폰',x:30,y:35}] },
];

export default function TourPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  const room = rooms[selectedIdx];

  /* simple drag-to-pan */
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    let dragging = false, startX = 0;
    const onDown = (e: MouseEvent | TouchEvent) => { dragging = true; startX = 'touches' in e ? e.touches[0].clientX : e.clientX; };
    const onMove = (e: MouseEvent | TouchEvent) => { if (!dragging) return; const cx = 'touches' in e ? e.touches[0].clientX : e.clientX; setRotateX(prev => prev + (cx - startX) * 0.3); startX = cx; };
    const onUp = () => { dragging = false; };
    el.addEventListener('mousedown', onDown); el.addEventListener('mousemove', onMove); el.addEventListener('mouseup', onUp); el.addEventListener('mouseleave', onUp);
    el.addEventListener('touchstart', onDown); el.addEventListener('touchmove', onMove); el.addEventListener('touchend', onUp);
    return () => { el.removeEventListener('mousedown', onDown); el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseup', onUp); el.removeEventListener('mouseleave', onUp); el.removeEventListener('touchstart', onDown); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onUp); };
  }, []);

  /* auto-rotate toggle */
  useEffect(() => {
    if (!isRotating) return;
    const id = setInterval(() => setRotateX(prev => prev + 0.5), 30);
    return () => clearInterval(id);
  }, [isRotating]);

  const goNext = () => { setSelectedIdx(i => (i + 1) % rooms.length); setRotateX(0); };
  const goPrev = () => { setSelectedIdx(i => (i - 1 + rooms.length) % rooms.length); setRotateX(0); };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white mb-1">🎬 3D 가상 투어</h1>
            <p className="text-gray-400 text-sm">마우스를 드래그하거나 터치로 360° 둘러보세요</p>
          </div>
          <Link href="/properties" className="text-green-400 hover:text-green-300 text-sm font-bold">← 매물 목록</Link>
        </div>

        {/* Main Viewer */}
        <div ref={viewerRef} className="bg-gray-800 border border-gray-700 mb-4 overflow-hidden relative cursor-grab active:cursor-grabbing select-none" style={{height:'450px'}}>
          {/* panoramic image with transform */}
          <div className="absolute inset-0" style={{ transform:`translateX(${rotateX % 300}px)`, transition: isRotating ? 'none' : 'transform 0.1s ease-out' }}>
            <img src={room.img} alt={room.label} className="w-full h-full object-cover" draggable={false} />
          </div>
          {/* overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

          {/* HUD top */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 animate-pulse">● LIVE 360°</span>
            <span className="bg-black/60 text-white text-xs px-2.5 py-1">{room.label}</span>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setShowHotspots(!showHotspots)} className={`text-xs font-bold px-3 py-1.5 transition ${showHotspots ? 'bg-green-500 text-white' : 'bg-black/60 text-gray-300'}`}>
              📍 핫스팟 {showHotspots ? 'ON' : 'OFF'}
            </button>
            <button onClick={() => setIsRotating(!isRotating)} className={`text-xs font-bold px-3 py-1.5 transition ${isRotating ? 'bg-blue-500 text-white' : 'bg-black/60 text-gray-300'}`}>
              🔄 자동회전 {isRotating ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Hotspots */}
          {showHotspots && room.hotspots.map((h, i) => (
            <div key={i} className="absolute group" style={{left:`${h.x}%`, top:`${h.y}%`, transform:'translate(-50%,-50%)'}}>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-ping absolute opacity-40" />
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold relative cursor-pointer z-10">+</div>
              <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs font-bold px-3 py-1.5 whitespace-nowrap z-20">{h.label}</div>
            </div>
          ))}

          {/* Navigation arrows */}
          <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/70 text-white text-xl flex items-center justify-center transition rounded-full">←</button>
          <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 hover:bg-black/70 text-white text-xl flex items-center justify-center transition rounded-full">→</button>

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3 flex items-center justify-between">
            <p className="text-white text-sm font-bold">{room.icon} {room.label} — {room.desc}</p>
            <p className="text-gray-400 text-xs">{selectedIdx + 1} / {rooms.length}</p>
          </div>
        </div>

        {/* Room Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {rooms.map((r, i) => (
            <button key={r.id} onClick={() => { setSelectedIdx(i); setRotateX(0); }}
              className={`p-4 border text-center transition ${selectedIdx === i ? 'bg-green-500 border-green-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-400'}`}>
              <p className="text-2xl mb-1">{r.icon}</p>
              <p className="text-sm font-bold">{r.label}</p>
            </button>
          ))}
        </div>

        {/* Room Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 border border-gray-700 p-6">
            <h2 className="text-white font-bold text-base mb-4">📋 {room.label} 상세</h2>
            <ul className="space-y-2">
              {room.details.map((d, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span> {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Property Quick Info */}
          <div className="bg-gray-800 border border-gray-700 p-6">
            <h2 className="text-white font-bold text-base mb-4">🏠 매물 정보</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs mb-1">위치</p><p className="text-white font-bold">신주쿠구 햐쿠닌초</p></div>
              <div><p className="text-gray-400 text-xs mb-1">월세</p><p className="text-green-400 font-bold">¥75,000</p></div>
              <div><p className="text-gray-400 text-xs mb-1">면적</p><p className="text-white font-bold">25㎡ (1K)</p></div>
              <div><p className="text-gray-400 text-xs mb-1">역 거리</p><p className="text-white font-bold">도보 5분</p></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 flex gap-3">
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 transition">📩 견학 예약</button>
              <Link href="/properties/1" className="border border-gray-600 text-gray-300 hover:border-green-400 hover:text-green-400 font-bold text-sm px-5 py-2.5 text-center transition">상세 보기 →</Link>
            </div>
          </div>
        </div>

        {/* Floor Plan */}
        <div className="bg-gray-800 border border-gray-700 p-6">
          <h2 className="text-white font-bold text-base mb-4">📐 간이 평면도</h2>
          <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto" style={{aspectRatio:'5/3'}}>
            {rooms.map((r, i) => (
              <button key={r.id} onClick={() => { setSelectedIdx(i); setRotateX(0); }}
                className={`border-2 flex flex-col items-center justify-center transition text-center p-2 ${selectedIdx === i ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-green-400'}`}>
                <span className="text-xl">{r.icon}</span>
                <span className="text-[10px] font-bold mt-1">{r.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
