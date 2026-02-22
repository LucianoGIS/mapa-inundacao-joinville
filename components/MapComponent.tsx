// src/components/MapComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup, Polyline, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Plus, Minus, Ruler } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

import type { SearchResult } from '@/app/page';

function MapController({ searchData }: { searchData: SearchResult }) {
  const map = useMap();
  useEffect(() => {
    if (!searchData) return;
    if (searchData.isPolygon && searchData.bbox) {
      map.flyToBounds(searchData.bbox, { duration: 1.5, padding: [40, 40] });
    } else {
      map.flyTo(searchData.center, 18, { duration: 1.5 });
    }
  }, [searchData, map]);
  return null;
}

// FERRAMENTAS SIG (Canto Superior Direito)
function CustomToolbox() {
  const map = useMap();
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [distance, setDistance] = useState<number | null>(null);

  useMapEvents({
    click(e) {
      if (!isMeasuring) return;
      
      if (measurePoints.length === 0) {
        setMeasurePoints([e.latlng]);
        setDistance(null);
      } else if (measurePoints.length === 1) {
        const p2 = e.latlng;
        setMeasurePoints([measurePoints[0], p2]);
        setDistance(map.distance(measurePoints[0], p2));
        setIsMeasuring(false); // Desativa a régua automaticamente ao marcar o 2º ponto
      } else {
        setMeasurePoints([e.latlng]); 
        setDistance(null);
      }
    }
  });

  // Atualiza a distância em tempo real ao arrastar os marcadores
  const handleMarkerDrag = (e: L.LeafletEvent, index: number) => {
    const newPos = e.target.getLatLng();
    setMeasurePoints((prev) => {
      const newPoints = [...prev];
      newPoints[index] = newPos;
      
      if (newPoints.length === 2) {
        setDistance(map.distance(newPoints[0], newPoints[1]));
      }
      return newPoints;
    });
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-[400] flex flex-col bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 overflow-hidden">
        {/* Bússola / Norte */}
        <button 
          onClick={() => map.flyTo([-26.3045, -48.8487], 12, { duration: 1 })}
          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-100"
          title="Orientar para o Norte"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Régua de Medição */}
        <button 
          onClick={() => {
            setIsMeasuring(!isMeasuring);
            // Se reativar a régua, limpa os pontos anteriores
            if (!isMeasuring) {
              setMeasurePoints([]);
              setDistance(null);
            }
          }}
          className={`w-10 h-10 flex items-center justify-center transition-colors border-b border-slate-100 ${
            isMeasuring ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
          }`}
          title="Medir Distância"
        >
          <Ruler className="w-4 h-4" />
        </button>

        {/* Zoom In */}
        <button 
          onClick={() => map.zoomIn()}
          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100"
          title="Aumentar Zoom"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button 
          onClick={() => map.zoomOut()}
          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          title="Diminuir Zoom"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* RENDERIZAÇÃO DA RÉGUA NO MAPA (ARRASTÁVEL) */}
      {measurePoints.length > 0 && (
        <>
          <Marker 
            position={measurePoints[0]} 
            icon={customMarkerIcon} 
            draggable={true} 
            eventHandlers={{ drag: (e) => handleMarkerDrag(e, 0) }} 
          />
          {measurePoints.length === 2 && distance !== null && (
            <>
              <Marker 
                position={measurePoints[1]} 
                icon={customMarkerIcon} 
                draggable={true} 
                eventHandlers={{ drag: (e) => handleMarkerDrag(e, 1) }}
              >
                <Tooltip 
                  permanent 
                  direction="top" 
                  offset={[0, -40]} 
                  className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xl border-0 font-sans text-sm font-bold text-slate-800"
                >
                  {distance >= 1000 
                    ? `${(distance / 1000).toFixed(2)} km` 
                    : `${distance.toFixed(2)} m`
                  }
                </Tooltip>
              </Marker>
              <Polyline positions={measurePoints} color="#ef4444" weight={3} dashArray="8, 8" />
            </>
          )}
        </>
      )}
    </>
  );
}

export default function MapComponent({ 
  searchData, 
  mapType,
  showFloodLayer 
}: { 
  searchData: SearchResult; 
  mapType: 'light' | 'satellite';
  showFloodLayer: boolean;
}) {
  const [floodData, setFloodData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/manchas.geojson')
      .then((res) => res.json())
      .then((data) => setFloodData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <MapContainer center={[-26.3045, -48.8487]} zoom={12} maxZoom={20} className="w-full h-full z-0" zoomControl={false}>
      {mapType === 'light' ? (
        <TileLayer 
          key="light" 
          maxZoom={20} 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
      ) : (
        <TileLayer 
          key="satellite" 
          maxZoom={20} 
          maxNativeZoom={19} 
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
        />
      )}
      
      <MapController searchData={searchData} />
      <CustomToolbox />

      {searchData && searchData.isPolygon && (
        <GeoJSON 
          key={`search-${searchData.name}`} 
          data={searchData.geojson} 
          style={{ color: '#3b82f6', weight: 2, dashArray: '5, 5', fillColor: '#3b82f6', fillOpacity: 0.05 }} 
        />
      )}

      {searchData && !searchData.isPolygon && (
        <Marker position={searchData.center} icon={customMarkerIcon}>
          <Popup><strong className="font-sans text-slate-800">{searchData.name}</strong></Popup>
        </Marker>
      )}

      {floodData && showFloodLayer && (
        <GeoJSON
          key={JSON.stringify(floodData).substring(0, 20)} 
          data={floodData}
          style={{ 
            color: '#ef4444', 
            weight: 1, 
            fillColor: '#ef4444', 
            fillOpacity: mapType === 'satellite' ? 0.5 : 0.35 
          }}
          onEachFeature={(feature, layer) => {
            layer.bindPopup(`<div class="font-sans"><strong class="text-slate-800">Área de Risco</strong><br/><span class="text-sm text-slate-600">Atenção ao pesquisar imóveis nesta região.</span></div>`);
          }}
        />
      )}
    </MapContainer>
  );
}