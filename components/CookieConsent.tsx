'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
    const [show, setShow] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        // Verifica no LocalStorage se o usuário já aceitou os cookies
        const consent = localStorage.getItem('geoinunda_cookie_consent');
        if (!consent) {
            // Retarda ligeiramente a aparição para uma entrada mais suave e profissional
            const timer = setTimeout(() => setShow(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!show) return null;

    const handleAccept = () => {
        localStorage.setItem('geoinunda_cookie_consent', 'true');
        setShow(false);
    };

    const handleDecline = () => {
        // Apenas oculta o aviso momentaneamente (opcional para o usuário)
        setShow(false);
    };

    return (
        <>
            {/* Modal de Termos de Uso e Cookies */}
            {showTerms && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <Cookie className="w-5 h-5 text-blue-600" /> Termos de Uso e Cookies
                            </h2>
                            <button onClick={() => setShowTerms(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-5 text-sm text-slate-600 space-y-4 max-h-[60vh] overflow-y-auto">
                            <p>
                                O <strong>Joinville GeoInunda</strong> utiliza recursos locais do seu próprio navegador (localStorage/cache) puramente para manter a interface funcionando com performance e lembrar preferências de leitura (como este aviso).
                            </p>
                            <p>
                                Nós <strong>não</strong> coletamos informações em massa, não repassamos logs de pesquisa a terceiros e não utilizamos cookies de rastreamento de anúncios e publicidade.
                            </p>
                            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <strong>Aviso legal:</strong> Esta ferramenta destina-se a fins preventivos e educativos para visualização interativa das áreas de vulnerabilidade a alagamentos. Esta aplicação não substitui os dados oficiais da Prefeitura ou laudos técnicos da Defesa Civil.
                            </p>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => { setShowTerms(false); handleAccept(); }}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-md transition-all active:scale-95"
                            >
                                Compreendido (Aceitar)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-[130px] sm:bottom-28 left-1/2 -translate-x-1/2 w-[92%] sm:w-auto max-w-xl z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-500">
                <div className="bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-xl shadow-2xl border border-slate-200/60 flex flex-col sm:flex-row gap-3 items-start sm:items-center relative">

                    {/* Ícone Estilizado - Menor */}
                    <div className="flex bg-blue-100/50 border border-blue-200 p-2 rounded-lg shrink-0">
                        <Cookie className="w-5 h-5 text-blue-600" />
                    </div>

                    {/* Texto Informativo - Compacto */}
                    <div className="flex-1 text-xs text-slate-600 pr-4 sm:pr-8">
                        <p className="leading-tight">
                            Usamos cookies locais para aprimorar o mapa. Ao continuar, você concorda com nossos <button onClick={() => setShowTerms(true)} className="font-semibold text-blue-600 hover:underline">termos e cookies</button>.
                        </p>
                    </div>

                    {/* Zona de Botões Interativos - Menores */}
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-0.5 sm:mt-0 justify-end shrink-0">
                        <button
                            onClick={handleDecline}
                            className="sm:hidden px-3 py-1.5 text-slate-500 hover:text-slate-700 font-medium text-xs transition-colors whitespace-nowrap"
                        >
                            Agora não
                        </button>

                        <button
                            onClick={handleAccept}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
                        >
                            Concordar
                        </button>
                    </div>

                    {/* Botão de Fechar Superior */}
                    <button
                        onClick={handleDecline}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors hidden sm:flex"
                        aria-label="Fechar Aviso de Configuração"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </>
    );
}
