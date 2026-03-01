// src/app/page.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, Layers, Map as MapIcon, Loader2, Check, X } from 'lucide-react';

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

  const [mapType, setMapType] = useState<'light' | 'satellite' | 'hybrid'>('light');
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
          setMapType={setMapType}
          showFloodLayer={showFloodLayer}
          setShowFloodLayer={setShowFloodLayer}
        />
      </div>

      {/* LOGO FLUTUANTE */}
      <div className="absolute top-4 left-4 sm:left-6 z-[500] pointer-events-auto flex items-center gap-2">
        <div className="bg-slate-100 pl-0 pt-0 pr-0.5 pb-0.5 sm:pl-0 sm:pt-0 sm:pr-0.5 sm:pb-0.5 rounded-xl shadow-md border border-slate-300/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src="/logo.png"
            alt="GeoInunda Joinville - Mapa de Risco de Inundações e Enchentes"
            title="GeoInunda Joinville"
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain"
          />
        </div>
        <div>
          <h1
            className="block font-black text-slate-800 text-base sm:text-xl tracking-tight whitespace-nowrap"
            style={{
              textShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8), 0 2px 4px rgba(255,255,255,0.8)'
            }}
          >
            GeoInunda
          </h1>
          <h2 className="sr-only">Mapa Interativo de Suscetibilidade a Inundações em Joinville, Santa Catarina</h2>
        </div>
      </div>

      {/* SEARCH BAR — TAMANHO FIXO CONTROLADO */}
      <div
        className="
          absolute
          z-[500]
          pointer-events-none
          
          /* Default Mobile (Telões/Telas médias - iPhone normais/Androids normais) */
          top-[21px]
          sm:top-[23px]
          right-4
          left-auto
          translate-x-0
          
          /* Telas MUITO pequenas (Apenas abaixo de 395px) vai pra baixo do logo */
          max-[395px]:top-[72px]
          max-[395px]:right-auto
          max-[395px]:left-1/2
          max-[395px]:-translate-x-1/2
          max-[395px]:w-[92%]
          max-[395px]:flex
          max-[395px]:justify-center

          /* Tablet em diante (Centralizado no Topo) */
          sm:right-auto
          sm:left-1/2
          sm:-translate-x-1/2
        "
      >
        <div className="pointer-events-auto">
          <div
            className={`
              flex
              items-center
              bg-white/95
              backdrop-blur-md
              rounded-xl
              shadow-lg
              border
              border-slate-200/60
              ${isSearchExpanded
                ? 'w-[215px] max-[395px]:w-full'
                : 'w-[185px] max-[395px]:w-full'}
              sm:w-[300px]
              md:w-[380px]
              transition-all
              duration-300
            `}
            onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
          >
            <button
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 text-slate-500 hover:text-blue-600 focus:outline-none transition-colors"
              onClick={() => {
                if (searchQuery.trim()) {
                  handleSearch(searchQuery);
                }
              }}
              title="Pesquisar"
              aria-label="Pesquisar"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              onBlur={() => {
                if (!searchQuery) setIsSearchExpanded(false);
              }}
              placeholder="Pesquise a moradia..."
              aria-label="Pesquisar endereço para verificar risco de enchente em Joinville"
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

            {searchQuery && (
              <button
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 text-slate-400 hover:text-red-500 focus:outline-none transition-colors"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  setSearchData(null);
                }}
                title="Limpar pesquisa"
                aria-label="Limpar pesquisa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

    </main>
  );
}