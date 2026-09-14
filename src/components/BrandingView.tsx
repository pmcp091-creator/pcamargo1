import React from 'react';
import { BrandingSettings } from '../types/schedule';
import { RotateCcw, Sparkles, Building2, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface BrandingViewProps {
  branding: BrandingSettings;
  onUpdateBranding: (updated: BrandingSettings) => void;
  onResetBranding: () => void;
}

export const BrandingView: React.FC<BrandingViewProps> = ({
  branding,
  onUpdateBranding,
  onResetBranding
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Introduction Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-slate-900 dark:text-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Configuración de Membrete Oficial
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              El membrete institucional cuenta con la identidad fija de <strong>Legado para los Territorios</strong> en la cabecera y los 5 aliados estratégicos oficiales en el pie de página. Desde este panel puedes personalizar los textos de encabezado, nombres de coordinación e información de los reportes.
            </p>
          </div>
        </div>
      </div>

      {/* Live Header & Letterhead Preview */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
            Vista Previa del Membrete Institucional Oficial
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Identidad Central Concertada
          </span>
        </div>

        {/* Header Preview Container */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-800/90 rounded-lg border border-slate-700 w-full">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center shrink-0 bg-white/5 p-1.5 rounded-lg border border-slate-700/60">
              <img 
                src="/logos/legado.png" 
                alt="Legado para los Territorios" 
                className="h-10 md:h-12 w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col min-w-0 justify-center overflow-hidden">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide truncate">
                {branding.organizationName || 'THE BIZ NATION'}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight truncate text-white">
                {branding.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA'}
              </h3>
              <p className="text-xs text-slate-300 truncate">{branding.programSubtitle}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 shrink-0">
            <div>Coordinador: <strong className="text-white">{branding.coordinatorName}</strong></div>
            <div>Ing. de Sistemas: <strong className="text-white">{branding.engineerName}</strong></div>
          </div>
        </div>

        {/* Footer Allies Preview */}
        <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Aliados Oficiales en el Pie de Página (Estricto Orden de Izquierda a Derecha)
          </span>
          <div className="flex items-center gap-6 md:gap-8 flex-wrap py-2 bg-white/95 dark:bg-slate-900/90 p-3 rounded-md border border-slate-700/50">
            <img 
              src="/logos/grupo_energia_bogota.png" 
              alt="Grupo Energía Bogotá" 
              className="h-7 md:h-8 w-auto object-contain" 
            />
            <img 
              src="/logos/acdi.png" 
              alt="ACDI/VOCA LA" 
              className="h-7 md:h-8 w-auto object-contain" 
            />
            <img 
              src="/logos/promigas.png" 
              alt="Fundación Promigas" 
              className="h-7 md:h-8 w-auto object-contain" 
            />
            <img 
              src="/logos/enlaza.png" 
              alt="Enlaza" 
              className="h-7 md:h-8 w-auto object-contain" 
            />
            <img 
              src="/logos/biz_nation.png" 
              alt="Biz Nation" 
              className="h-7 md:h-8 w-auto object-contain" 
            />
          </div>
        </div>
      </div>

      {/* Organization and Coordinator Details Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Textos de Encabezado y Reportes Oficiales</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Se aplican en pantalla, PDFs e impresiones
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Nombre de la Organización</label>
            <input
              type="text"
              value={branding.organizationName}
              onChange={e => onUpdateBranding({ ...branding, organizationName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Título del Programa</label>
            <input
              type="text"
              value={branding.programTitle}
              onChange={e => onUpdateBranding({ ...branding, programTitle: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Subtítulo del Cronograma</label>
            <input
              type="text"
              value={branding.programSubtitle}
              onChange={e => onUpdateBranding({ ...branding, programSubtitle: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Nombre del Coordinador</label>
            <input
              type="text"
              value={branding.coordinatorName}
              onChange={e => onUpdateBranding({ ...branding, coordinatorName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Cargo del Coordinador</label>
            <input
              type="text"
              value={branding.coordinatorRole}
              onChange={e => onUpdateBranding({ ...branding, coordinatorRole: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Ingeniero de Sistemas</label>
            <input
              type="text"
              value={branding.engineerName}
              onChange={e => onUpdateBranding({ ...branding, engineerName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Cargo Técnico</label>
            <input
              type="text"
              value={branding.engineerRole}
              onChange={e => onUpdateBranding({ ...branding, engineerRole: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Device Sync & Share Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4 space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              📲 Sincronizar con Otros Dispositivos (Celular / WhatsApp)
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Para compartir los nombres modificados y textos oficiales con el equipo o con el Coordinador <strong className="text-slate-900 dark:text-slate-200">{branding.coordinatorName}</strong>, utiliza cualquiera de estas dos opciones:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                try {
                  const payload = { branding };
                  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
                  const shareUrl = `${window.location.origin}${window.location.pathname}#config=${encoded}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('¡Enlace de sincronización copiado al portapapeles!\n\nEnvía este enlace por WhatsApp al otro dispositivo. Al abrirlo, sincronizará automáticamente los textos del membrete.');
                } catch (e) {
                  alert('Por favor copia la configuración mediante archivo JSON.');
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
            >
              <span>🔗 Copiar Enlace con Textos del Membrete</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const data = {
                  version: '1.0',
                  exportDate: new Date().toISOString(),
                  branding
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CONFIGURACION_MEMBRETE_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition cursor-pointer"
            >
              <span>📥 Descargar Archivo (.json)</span>
            </button>
          </div>
        </div>

        {/* Reset button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onResetBranding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Textos Predeterminados</span>
          </button>
        </div>
      </div>
    </div>
  );
};

