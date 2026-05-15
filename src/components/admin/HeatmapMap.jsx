import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat/dist/leaflet-heat';

const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points?.length) return;

    const heatPoints = points.map((point) => [point.lat, point.lng, Math.min(Math.max(point.count / 2, 0.2), 1.8)]);
    const heat = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 20,
      maxZoom: 8,
      gradient: { 0.2: '#a8e0ff', 0.4: '#60c4ff', 0.6: '#1e90ff', 0.9: '#0b4799' },
    });

    heat.addTo(map);
    return () => {
      if (map.hasLayer(heat)) {
        map.removeLayer(heat);
      }
    };
  }, [map, points]);

  return null;
};

const HeatmapMap = ({ points = [], center = [20, 78], zoom = 4 }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full"
      style={{ minHeight: '420px' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatLayer points={points} />
      {points.slice(0, 25).map((point, index) => (
        <CircleMarker
          key={`${point.state}-${point.city}-${index}`}
          center={[point.lat, point.lng]}
          radius={Math.min(5 + point.count * 0.8, 18)}
          fillColor="#2563eb"
          color="#1d4ed8"
          weight={1}
          fillOpacity={0.65}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <div className="text-xs">
              <strong>{point.city || point.state}</strong>
              <div>{point.count} submissions</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default HeatmapMap;
