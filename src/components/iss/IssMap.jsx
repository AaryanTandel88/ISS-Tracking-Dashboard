import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ISS_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:38px; height:38px;
    background: linear-gradient(135deg,#3b82f6,#06b6d4);
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 0 16px #3b82f680, 0 0 32px #06b6d440;
    display:flex; align-items:center; justify-content:center;
    font-size:18px;
  ">🛸</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

const TRAJECTORY_COLOR = '#06b6d4';

export default function IssMap({ position, trajectory, loading }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const dotMarkersRef = useRef([]);

  // Init map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
  }, []);

  // Update marker + trajectory when position changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !position) return;

    const latLng = [position.lat, position.lng];

    // Update or create marker
    if (!markerRef.current) {
      markerRef.current = L.marker(latLng, { icon: ISS_ICON }).addTo(map);
      markerRef.current.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:4px 0">
          <b style="color:#3b82f6">🛸 ISS Position</b><br/>
          Lat: ${position.lat.toFixed(4)}°<br/>
          Lng: ${position.lng.toFixed(4)}°<br/>
          <small style="color:#888">Last updated: ${new Date(position.timestamp * 1000).toLocaleTimeString()}</small>
        </div>
      `);
    } else {
      markerRef.current.setLatLng(latLng);
      markerRef.current.setPopupContent(`
        <div style="font-family:Inter,sans-serif;padding:4px 0">
          <b style="color:#3b82f6">🛸 ISS Position</b><br/>
          Lat: ${position.lat.toFixed(4)}°<br/>
          Lng: ${position.lng.toFixed(4)}°<br/>
          <small style="color:#888">Last updated: ${new Date(position.timestamp * 1000).toLocaleTimeString()}</small>
        </div>
      `);
    }

    // Update trajectory polyline
    if (trajectory.length > 1) {
      const latlngs = trajectory.map(p => [p.lat, p.lng]);

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latlngs);
      } else {
        polylineRef.current = L.polyline(latlngs, {
          color: TRAJECTORY_COLOR,
          weight: 2.5,
          opacity: 0.8,
          dashArray: '6 4',
        }).addTo(map);
      }

      // Remove old dot markers
      dotMarkersRef.current.forEach(m => m.remove());
      dotMarkersRef.current = [];

      // Add small dots for each trajectory point (skip last = main marker)
      trajectory.slice(0, -1).forEach((p, i) => {
        const opacity = 0.2 + (i / trajectory.length) * 0.6;
        const dot = L.circleMarker([p.lat, p.lng], {
          radius: 4,
          color: TRAJECTORY_COLOR,
          fillColor: TRAJECTORY_COLOR,
          fillOpacity: opacity,
          weight: 0,
        }).addTo(map);
        dotMarkersRef.current.push(dot);
      });
    }

    // Pan to ISS (smooth)
    map.panTo(latLng, { animate: true, duration: 1 });
  }, [position, trajectory]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 380 }}>
      {loading && !position && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'var(--bg-card)', borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--accent-blue)',
            animation: 'spin-slow 1s linear infinite',
          }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Map...</span>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
    </div>
  );
}
