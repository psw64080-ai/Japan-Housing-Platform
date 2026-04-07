'use client';

import Link from 'next/link';

type Property = {
  id: number;
  title: string;
  address: string;
  monthlyRent?: number;
  monthlyPrice?: number;
  averageRating: number;
  foreignerWelcome: boolean;
  petFriendly: boolean;
  squareMeters?: number;
  floor?: number;
  roomType?: string;
  imagesJson?: string;
  images?: string;
};

export default function PropertyCard({ property }: { property: Property }) {
  const rent = property.monthlyRent ?? property.monthlyPrice ?? 0;

  const getImage = () => {
    if (property.imagesJson) {
      try {
        const arr = JSON.parse(property.imagesJson);
        return arr[0] || null;
      } catch {}
    }
    if (property.images) return property.images.split(',')[0] || null;
    return null;
  };
  const img = getImage();

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-green-400 transition">
        <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
          {img ? (
            <img src={img} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {property.foreignerWelcome && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5">외국인OK</span>}
            {property.petFriendly && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5">반려동물 가능</span>}
          </div>
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1 text-sm font-bold text-slate-800">
            ¥{rent.toLocaleString()}
            <span className="text-xs font-normal">/월</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 text-sm mb-1">{property.title}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
            <span>📍</span>
            {property.address}
          </p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex gap-2">
              {property.squareMeters && (
                <span className="text-xs text-slate-500">{property.squareMeters}m²</span>
              )}
              {property.floor && (
                <span className="text-xs text-slate-500">{property.floor}층</span>
              )}
              {property.roomType && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5">{property.roomType}</span>
              )}
            </div>
            {property.averageRating > 0 && (
              <span className="text-xs font-semibold text-amber-500">⭐ {property.averageRating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
