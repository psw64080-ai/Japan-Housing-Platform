import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 마커 아이콘 수정 (webpack이 아이콘 경로를 깨뜨리는 문제)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Property {
  id: number;
  title?: string;
  titleKo?: string;
  monthlyRent?: number;
  roomType?: string;
  size?: number;
  floorArea?: number;
  latitude?: number;
  longitude?: number;
  nearbyStation?: string;
  nearestStation?: string;
  nearestStationKo?: string;
  walkMinutes?: number;
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  properties: Property[];
  onMarkerClick: (id: number) => void;
  mapKey: string;
}

export default function LeafletMap({ center, zoom, properties, onMarkerClick, mapKey }: LeafletMapProps) {
  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map(p => (
        p.latitude && p.longitude ? (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            eventHandlers={{ click: () => onMarkerClick(p.id) }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-bold text-sm mb-1">{p.titleKo || p.title}</p>
                <p className="text-green-600 font-bold">¥{p.monthlyRent?.toLocaleString()}/월</p>
                <p className="text-xs text-gray-500">{p.roomType} · {p.floorArea || p.size}㎡</p>
                {(p.nearestStationKo || p.nearbyStation || p.nearestStation) && (
                  <p className="text-xs text-gray-400">🚶 {p.nearestStationKo || p.nearbyStation || p.nearestStation}</p>
                )}
                <a href={`/properties/${p.id}`} className="text-xs text-blue-500 font-bold mt-1 inline-block">상세보기 →</a>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}
