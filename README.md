<div align="center">

# 🌊 GeoInunda JVE

Mapa Interativo de Cotas de Inundação e Busca de Endereços — Joinville/SC

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://mapa-inundacao-joinville.vercel.app/)
![Status](https://img.shields.io/badge/status-ativo-blue)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61dafb?logo=react&logoColor=black)
![Leaflet](https://img.shields.io/badge/Maps-Leaflet-199900?logo=leaflet&logoColor=white)

<a href="https://mapa-inundacao-joinville.vercel.app/">
  <img src="https://img.shields.io/badge/🚀%20Ver%20Aplicação%20Online-000?style=for-the-badge&logo=vercel" />
</a>

</div>

---
<div align="center">

Projeto de um Web App interativo para visualização de manchas de inundação em Joinville, permitindo pesquisar endereços específicos, alternar entre mapas base (satélite e ruas) e medir distâncias.
</div>

---

## Estrutura do Projeto

```
mapa-inundacao-joinville/
├── public/
│   ├── logo.png             ← Logo oficial da aplicação
│   └── data/
│       └── manchas.geojson  ← DADOS DAS MANCHAS DE INUNDAÇÃO (Polígonos)
├── app/
│   ├── globals.css          ← Estilos globais e Tailwind
│   ├── layout.tsx           ← Root layout e metadados
│   └── page.tsx             ← Página Principal (UI, Header, Search)
├── components/
│   └── MapComponent.tsx     ← Componente do Mapa (Leaflet, Camadas, Ferramentas)
├── package.json
└── tailwind.config.ts
```

---

## Como Rodar (passo a passo)

### 1. Instale o Node.js (se ainda não tiver)
Acesse: https://nodejs.org → Baixe a versão **LTS** → Instale normalmente.

Para verificar se instalou, abra o terminal e rode:
```bash
node --version
npm --version 
```

### 2. Abra a pasta no VSCode
- Abra o VSCode
- Vá em **File → Open Folder**
- Selecione a pasta do projeto

### 3. Abra o terminal integrado no VSCode
- Menu **Terminal → New Terminal**  
  (ou pressione ` Ctrl + \` `)

### 4. Instale as dependências
```bash
npm install
```

### 5. Rode o projeto
```bash
npm run dev
```
O site abrirá automaticamente em: **http://localhost:3000** 🎉

---

## 🔧 Principais Funcionalidades

- **Pesquisa Inteligente**: Busca de ruas e endereços usando a API Nominatim (OpenStreetMap), focada em Joinville.
- **Camadas de Mapa**: Alternância entre mapa base padrão (OSM) e visualização de Satélite/Híbrida (Esri + CartoDB).
- **Mancha de Inundação**: Visualização em formato GeoJSON das áreas com risco histórico de enchentes na cidade.
- **Ferramenta de Medição**: Régua interativa para medir a distância em metros/quilômetros entre dois pontos no mapa.

---

## Dependências Usadas

| Pacote | Para que serve |
|--------|---------------|
| `next` | Framework React (App Router) |
| `react` + `react-dom` | Bibliotecas UI core |
| `leaflet` | Renderização do mapa (Core) |
| `react-leaflet` | Integração de componentes Leaflet no React |
| `lucide-react` | Ícones da interface UI |
| `tailwindcss` | Estilização utilitária |

---
