// src/app/page.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, Layers, Map as MapIcon, Loader2, Check } from 'lucide-react';

const Map = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-500">
      <MapIcon className="mr-2 h-6 w-6 animate-pulse" />
      <span className="text-sm font-medium tracking-wide">A carregar o mapa...</span>
    </div>
  ),
});

export type SearchResult = {
  center: [number, number];
  bbox: [[number, number], [number, number]];
  geojson: any;
  isPolygon: boolean;
  name: string;
} | null;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData, setSearchData] = useState<SearchResult>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [mapType, setMapType] = useState<'light' | 'satellite'>('light');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFloodLayer, setShowFloodLayer] = useState(true);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      let cleanQuery = query
        .replace(/^R\.\s/i, 'Rua ')
        .replace(/^Av\.\s/i, 'Avenida ')
        .split('-')[0]
        .replace(/\d{5}\s*$/, '')
        .trim();

      const fetchLocation = async (searchString: string) => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchString
          )}, Joinville, Santa Catarina, Brasil&limit=1&polygon_geojson=1`
        );
        return await response.json();
      };

      let data = await fetchLocation(cleanQuery);

      if (!data || data.length === 0) {
        const streetOnly = cleanQuery.split(',')[0].trim();
        if (streetOnly && streetOnly !== cleanQuery) {
          data = await fetchLocation(streetOnly);
        }
      }

      if (data && data.length > 0) {
        const item = data[0];
        const isPolygon =
          item.geojson?.type === 'Polygon' ||
          item.geojson?.type === 'MultiPolygon';

        const bbox: [[number, number], [number, number]] = [
          [parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[2])],
          [parseFloat(item.boundingbox[1]), parseFloat(item.boundingbox[3])],
        ];

        setSearchData({
          center: [parseFloat(item.lat), parseFloat(item.lon)],
          bbox: bbox,
          geojson: item.geojson,
          isPolygon: isPolygon,
          name: item.display_name.split(',')[0],
        });
      } else {
        alert(
          'Localização não encontrada. Tente inserir apenas o nome da rua.'
        );
      }
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao processar a pesquisa.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-100 font-sans text-slate-800">
      <div className="absolute inset-0 z-0">
        <Map
          searchData={searchData}
          mapType={mapType}
          showFloodLayer={showFloodLayer}
        />
      </div>

{/* SEARCH BAR — TAMANHO FIXO CONTROLADO */}
<div
  className="
    absolute
    top-4
    left-1/2
    -translate-x-1/2
    z-[500]
    pointer-events-none
  "
>
  <div className="pointer-events-auto">

    <div
      className="
        flex
        items-center
        bg-white/95
        backdrop-blur-md
        rounded-xl
        shadow-lg
        border
        border-slate-200/60

        /* 🔥 CONTROLE REAL DE TAMANHO */
        w-[280px]
        sm:w-[300px]
        md:w-[380px]
      "
      onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 text-slate-500">
        {isSearching ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
        onBlur={() => {
          if (!searchQuery) setIsSearchExpanded(false);
        }}
        placeholder="Pesquise a moradia..."
        autoFocus={isSearchExpanded}
        className="
          flex-1
          min-w-0
          bg-transparent
          border-0
          outline-none
          text-sm
          font-medium
          text-slate-700
          pr-2
          placeholder:text-slate-400
        "
      />
    </div>

  </div>
</div>

      {/* MENU DE CAMADAS */}
      <div className="absolute bottom-15 right-4 z-[400] flex flex-col items-end gap-3 pointer-events-auto">
        {isLayerMenuOpen && (
          <div className="flex flex-col gap-1 w-52 rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-md border border-slate-200 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">
              Mapa Base
            </h3>

            <button
              onClick={() => {
                setMapType('light');
                setIsLayerMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors text-slate-700 hover:bg-slate-100"
            >
              Mapa (OSM)
              {mapType === 'light' && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>

            <button
              onClick={() => {
                setMapType('satellite');
                setIsLayerMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors text-slate-700 hover:bg-slate-100 mb-2"
            >
              Satélite
              {mapType === 'satellite' && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>

            <div className="h-px w-full bg-slate-100 my-1"></div>

            <label className="flex items-center justify-between w-full px-3 py-2 cursor-pointer group rounded-xl hover:bg-slate-100 transition-colors">
              <span className="text-sm font-medium text-slate-700">
                Mancha Inundação
              </span>
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  showFloodLayer ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                    showFloodLayer
                      ? 'translate-x-4.5 left-[14px]'
                      : 'translate-x-0.5 left-[2px]'
                  }`}
                ></div>
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={showFloodLayer}
                onChange={() => setShowFloodLayer(!showFloodLayer)}
              />
            </label>
          </div>
        )}

        <button
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 border ${
            isLayerMenuOpen
              ? 'bg-slate-100 border-slate-300 text-blue-600'
              : 'bg-white border-slate-100 text-slate-700'
          }`}
          title="Camadas do Mapa"
        >
          <Layers className="h-6 w-6" />
        </button>
      </div>
    </main>
  );
}