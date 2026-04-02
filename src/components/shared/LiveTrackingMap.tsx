import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Advanced SVG renderers
const createIcon = (svgString: string, living: boolean = false) => L.divIcon({
  html: svgString,
  className: living ? 'custom-map-marker living-marker' : 'custom-map-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const tractorSvg = `<div style="background-color: #2563eb; border: 3px solid white; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="10" width="16" height="8" rx="2" ry="2"></rect>
    <circle cx="6" cy="18" r="2"></circle>
    <circle cx="16" cy="18" r="2"></circle>
    <path d="M12 10V6a2 2 0 0 1 2-2h4"></path>
  </svg>
</div>`;

const farmerSvg = `<div style="background-color: #dcfce7; border: 3px solid #22c55e; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">🌾</div>`;
const buyerSvg = `<div style="background-color: #fef3c7; border: 3px solid #f59e0b; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">🏭</div>`;

const icons = {
  baler: createIcon(tractorSvg, true),
  farmer: createIcon(farmerSvg),
  buyer: createIcon(buyerSvg)
};

interface Location {
  lat: number;
  lng: number;
  label?: string;
}

interface Props {
  balerLoc?: Location | null;
  farmerLoc?: Location | null;
  buyerLoc?: Location | null;
  showRoute?: boolean;
}

function MapUpdater({ balerLoc, farmerLoc, buyerLoc }: Props) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (balerLoc) bounds.extend([balerLoc.lat, balerLoc.lng]);
    if (farmerLoc) bounds.extend([farmerLoc.lat, farmerLoc.lng]);
    if (buyerLoc) bounds.extend([buyerLoc.lat, buyerLoc.lng]);
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [balerLoc?.lat, balerLoc?.lng, farmerLoc?.lat, farmerLoc?.lng, buyerLoc?.lat, buyerLoc?.lng, map]);
  return null;
}

export default function LiveTrackingMap({ balerLoc, farmerLoc, buyerLoc, showRoute = true }: Props) {
  const centerLat = balerLoc?.lat || farmerLoc?.lat || 30.9;
  const centerLng = balerLoc?.lng || farmerLoc?.lng || 75.85;

  const pathCoordinates: [number, number][] = [];
  if (showRoute) {
    if (balerLoc) pathCoordinates.push([balerLoc.lat, balerLoc.lng]);
    if (farmerLoc) pathCoordinates.push([farmerLoc.lat, farmerLoc.lng]);
    if (buyerLoc) pathCoordinates.push([buyerLoc.lat, buyerLoc.lng]);
  }

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-[#e8e5de]">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={12} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        maxBounds={[[6.5, 68.0], [35.5, 97.5]]}
        minZoom={5}
      >
        <TileLayer
          attribution="Google Maps"
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en"
        />
        
        <MapUpdater balerLoc={balerLoc} farmerLoc={farmerLoc} buyerLoc={buyerLoc} />

        {balerLoc && (
          <Marker position={[balerLoc.lat, balerLoc.lng]} icon={icons.baler}>
            <Popup className="font-sans font-semibold">🚜 {balerLoc.label || 'Baler'}</Popup>
          </Marker>
        )}
        
        {farmerLoc && (
          <Marker position={[farmerLoc.lat, farmerLoc.lng]} icon={icons.farmer}>
            <Popup className="font-sans font-semibold">📍 {farmerLoc.label || 'Farm'}</Popup>
          </Marker>
        )}
        
        {buyerLoc && (
          <Marker position={[buyerLoc.lat, buyerLoc.lng]} icon={icons.buyer}>
            <Popup className="font-sans font-semibold">🏭 {buyerLoc.label || 'Buyer Facility'}</Popup>
          </Marker>
        )}

        {showRoute && pathCoordinates.length > 1 && (
          <Polyline 
            positions={pathCoordinates} 
            color="#3b82f6" 
            weight={5} 
            dashArray="10, 10" 
            opacity={0.8}
            className="animated-route"
          />
        )}
      </MapContainer>
    </div>
  );
}
