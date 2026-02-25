// src/components/MapComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup, Polyline, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Plus, Minus, Ruler, Layers, Map as MapIcon, Droplet } from 'lucide-react';
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
    const basePrefix = '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>';
    // Modificando o prefixo padrão para incluir nossa fonte também, dentro da MESMA caixa branca
    map.attributionControl.setPrefix(
      '<span style="display:block; text-align:right;">Mancha de Inundação: Prefeitura de Joinville</span>' + basePrefix
    );
  }, [map]);

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
function CustomToolbox({
  isMeasuring, setIsMeasuring,
  mapType, setMapType,
  showFloodLayer, setShowFloodLayer
}: {
  isMeasuring: boolean, setIsMeasuring: (val: boolean) => void,
  mapType: 'light' | 'satellite' | 'hybrid',
  setMapType: (type: 'light' | 'satellite' | 'hybrid') => void,
  showFloodLayer: boolean,
  setShowFloodLayer: (val: boolean) => void
}) {
  const map = useMap();
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useMapEvents({
    click(e) {
      if (!isMeasuring) {
        // Se clicar no mapa sem estar na ferramenta e houver pinos, limpa os pinos
        if (measurePoints.length > 0) {
          setMeasurePoints([]);
          setDistance(null);
        }
        return;
      }

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMeasurePoints([]);
        setDistance(null);
        setIsMeasuring(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsMeasuring]);

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
      {/* Container Principal Direito/Inferior */}
      <div className="absolute bottom-24 sm:bottom-12 right-4 z-[400] flex flex-col items-end gap-3 pointer-events-none">

        {/* Controles Acima do Botão de Camadas */}
        <div className="flex flex-col items-center w-12 gap-3 pb-1 pointer-events-none">
          {/* Bússola / Norte */}
          <button
            onClick={() => map.flyTo([-26.3045, -48.8487], 12, { duration: 1 })}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-slate-700 hover:text-blue-600 transition-colors"
            title="Orientar para o Norte"
          >
            <Compass className="w-5 h-5" />
          </button>

          {/* Controles de Zoom */}
          <div className="pointer-events-auto flex flex-col bg-white rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => map.zoomIn()}
              className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
              title="Aumentar Zoom"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => map.zoomOut()}
              className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
              title="Diminuir Zoom"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BARRA INFERIOR DE FERRAMENTAS E CAMADAS */}
        <div className="flex flex-row-reverse items-center gap-2 pointer-events-auto">

          {/* BOTÃO DE CAMADAS (Ícone Escuro) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-12 h-12 flex items-center justify-center text-white rounded-xl shadow-lg border-2 border-transparent transition-all hover:scale-105 active:scale-95 ${isExpanded ? 'bg-black' : 'bg-blue-600'
              }`}
            title="Alternar Ferramentas"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* FERRAMENTAS RECOLHÍVEIS (Esquerda do Botão de Camadas) */}
          <div className={`flex flex-row-reverse items-center gap-1.5 sm:gap-2 transition-all duration-300 origin-right ${isExpanded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 w-0 pointer-events-none'
            }`}>

            {/* RÉGUA */}
            <button
              onClick={() => {
                const newVal = !isMeasuring;
                setIsMeasuring(newVal);
                if (!newVal) {
                  setMeasurePoints([]);
                  setDistance(null);
                }
              }}
              className={`h-12 px-2.5 sm:px-4 flex items-center gap-1.5 sm:gap-2 justify-center rounded-full shadow-lg font-sans font-bold text-xs sm:text-sm transition-all border shrink-0 ${isMeasuring ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 shadow-md border-transparent'
                }`}
              title="Medir Distância"
            >
              <Ruler className="w-4 h-4 shrink-0" />
              <span>Medir</span>
            </button>

            {/* MANCHA DE ENCHENTE */}
            <button
              onClick={() => setShowFloodLayer(!showFloodLayer)}
              className={`h-12 flex flex-col items-center justify-center px-2 sm:px-4 rounded-xl shadow-lg font-sans transition-all border-2 shrink-0 ${showFloodLayer ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-transparent text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                }`}
              title="Mancha de Enchente"
            >
              <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-slate-400">Camada</span>
              <span className="text-[11px] sm:text-[12px] font-black leading-tight">Inundações</span>
            </button>

            {/* MINIATURAS MAPA/SATÉLITE */}
            <div className="flex p-1 bg-white rounded-xl shadow-lg gap-1 shrink-0">
              <button
                onClick={() => setMapType('light')}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${mapType === 'light' ? 'border-blue-600' : 'border-transparent hover:border-slate-300'}`}
                title="Mapa Normal"
                style={{ backgroundImage: 'url("https://a.tile.openstreetmap.org/12/1460/2361.png")', backgroundSize: 'cover' }}
              />
              <button
                onClick={() => setMapType('hybrid')}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${mapType === 'hybrid' || mapType === 'satellite' ? 'border-blue-600' : 'border-transparent hover:border-slate-300'}`}
                title="Satélite"
                style={{ backgroundImage: 'url("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/12/2361/1460")', backgroundSize: 'cover' }}
              />
            </div>
          </div>
        </div>
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
  setMapType,
  showFloodLayer,
  setShowFloodLayer
}: {
  searchData: SearchResult;
  mapType: 'light' | 'satellite' | 'hybrid';
  setMapType: (type: 'light' | 'satellite' | 'hybrid') => void;
  showFloodLayer: boolean;
  setShowFloodLayer: (val: boolean) => void;
}) {
  const [floodData, setFloodData] = useState<any>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

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
      ) : mapType === 'satellite' ? (
        <TileLayer
          key="satellite"
          maxZoom={20}
          maxNativeZoom={19}
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      ) : (
        <>
          <TileLayer
            key="hybrid-base"
            maxZoom={20}
            maxNativeZoom={19}
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <TileLayer
            key="hybrid-overlay"
            maxZoom={20}
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          />
        </>
      )}

      <MapController searchData={searchData} />
      <CustomToolbox
        isMeasuring={isMeasuring} setIsMeasuring={setIsMeasuring}
        mapType={mapType} setMapType={setMapType}
        showFloodLayer={showFloodLayer} setShowFloodLayer={setShowFloodLayer}
      />

      {searchData && searchData.isPolygon && (
        <GeoJSON
          key={`search-${searchData.name}-${isMeasuring}`}
          data={searchData.geojson}
          interactive={!isMeasuring}
          style={{ color: '#3b82f6', weight: 2, dashArray: '5, 5', fillColor: '#3b82f6', fillOpacity: 0.05 }}
        />
      )}

      {searchData && !searchData.isPolygon && (
        <Marker position={searchData.center} icon={customMarkerIcon} interactive={!isMeasuring}>
          <Popup><strong className="font-sans text-slate-800">{searchData.name}</strong></Popup>
        </Marker>
      )}

      {floodData && showFloodLayer && (
        <GeoJSON
          key={`${JSON.stringify(floodData).substring(0, 20)}-${isMeasuring}`}
          data={floodData}
          interactive={!isMeasuring}
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