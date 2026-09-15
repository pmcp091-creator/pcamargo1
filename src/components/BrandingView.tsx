import React, { useState, useEffect } from 'react';
import { BrandingSettings } from '../types/schedule';
import { RotateCcw, Sparkles, Building2, ShieldCheck, FileText, CheckCircle2, Save, AlertCircle } from 'lucide-react';

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
  const [formData, setFormData] = useState<BrandingSettings>(branding);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(branding);
    setIsDirty(false);
  }, [branding]);

  const handleChange = (field: keyof BrandingSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    onUpdateBranding(formData);
    try {
      localStorage.setItem('biz_cronograma_branding_v3', JSON.stringify(formData));
      localStorage.setItem('biz_cronograma_branding', JSON.stringify(formData));
    } catch (e) {
      console.error('Error guardando membrete en localStorage:', e);
    }
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer todos los textos del membrete a sus valores predeterminados de fábrica?')) {
      onResetBranding();
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Introduction Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-slate-900 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Configuración de Membrete Oficial
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                El membrete institucional cuenta con el logo de <strong>Legado para los Territorios</strong> en la cabecera y los 5 aliados estratégicos oficiales en el pie de página. Modifica los textos de encabezado y haz clic en <strong>Guardar Cambios</strong>.
              </p>
            </div>
          </div>

          <button
            id="btn-save-branding-top"
            type="button"
            onClick={handleSave}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 shrink-0 cursor-pointer ${
              isDirty
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isDirty ? 'Guardar Cambios Pendientes' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            ¡Configuración de membrete guardada exitosamente! Los cambios de textos de encabezado y reportes oficiales se han guardado y aplicado a todo el sistema.
          </div>
        </div>
      )}

      {/* Live Header & Letterhead Preview */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
            Vista Previa en Vivo del Membrete Institucional Oficial
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Identidad Central Concertada
          </span>
        </div>

        {/* Header Preview Container */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-800/90 rounded-xl border border-slate-700 w-full">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center shrink-0 bg-white p-2 rounded-xl shadow-xs border border-slate-200">
              <img 
                src="/logos/legado.png" 
                alt="Legado para los Territorios" 
                className="h-10 md:h-12 w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col min-w-0 justify-center overflow-hidden">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide truncate">
                {formData.organizationName || 'THE BIZ NATION'}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight truncate text-white">
                {formData.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA'}
              </h3>
              <p className="text-xs text-slate-300 truncate">{formData.programSubtitle}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 shrink-0">
            <div>Coordinador: <strong className="text-white">{formData.coordinatorName}</strong></div>
            <div>Ing. de Sistemas: <strong className="text-white">{formData.engineerName}</strong></div>
          </div>
        </div>

        {/* Footer Allies Preview */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Aliados Oficiales en el Pie de Página (5 Entidades en Reportes PDF y Excel)
            </span>
            <span className="text-[10px] text-slate-400">
              Orden oficial de izquierda a derecha
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
            {/* 1. Grupo Energía Bogotá */}
            <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-lg shadow-xs border border-slate-200 hover:border-amber-400 transition">
              <img 
                src="/logos/grupo_energia_bogota.png" 
                alt="Grupo Energía Bogotá" 
                className="h-8 md:h-9 w-auto max-w-[130px] object-contain" 
              />
              <span className="text-[9px] font-bold text-slate-700 mt-1.5 text-center truncate max-w-full">
                Grupo Energía Bogotá
              </span>
            </div>

            {/* 2. ACDI/VOCA */}
            <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-lg shadow-xs border border-slate-200 hover:border-amber-400 transition">
              <img 
                src="/logos/acdi.png" 
                alt="ACDI/VOCA LA" 
                className="h-8 md:h-9 w-auto max-w-[130px] object-contain" 
              />
              <span className="text-[9px] font-bold text-slate-700 mt-1.5 text-center truncate max-w-full">
                ACDI / VOCA
              </span>
            </div>

            {/* 3. Fundación Promigas */}
            <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-lg shadow-xs border border-slate-200 hover:border-amber-400 transition">
              <img 
                src="/logos/promigas.png" 
                alt="Fundación Promigas" 
                className="h-8 md:h-9 w-auto max-w-[130px] object-contain" 
              />
              <span className="text-[9px] font-bold text-slate-700 mt-1.5 text-center truncate max-w-full">
                Fundación Promigas
              </span>
            </div>

            {/* 4. Enlaza */}
            <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-lg shadow-xs border border-slate-200 hover:border-amber-400 transition">
              <img 
                src="/logos/enlaza.png" 
                alt="Enlaza" 
                className="h-8 md:h-9 w-auto max-w-[130px] object-contain" 
              />
              <span className="text-[9px] font-bold text-slate-700 mt-1.5 text-center truncate max-w-full">
                Enlaza
              </span>
            </div>

            {/* 5. The Biz Nation */}
            <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-lg shadow-xs border border-slate-200 hover:border-amber-400 transition">
              <img 
                src="/logos/biz_nation.png" 
                alt="The Biz Nation" 
                className="h-8 md:h-9 w-auto max-w-[130px] object-contain" 
              />
              <span className="text-[9px] font-bold text-slate-700 mt-1.5 text-center truncate max-w-full">
                The Biz Nation
              </span>
            </div>
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
          {isDirty && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-3.5 h-3.5" />
              Cambios pendientes por guardar
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Nombre de la Organización</label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={e => handleChange('organizationName', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Título del Programa</label>
            <input
              type="text"
              value={formData.programTitle}
              onChange={e => handleChange('programTitle', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Subtítulo del Cronograma</label>
            <input
              type="text"
              value={formData.programSubtitle}
              onChange={e => handleChange('programSubtitle', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Nombre del Coordinador</label>
            <input
              type="text"
              value={formData.coordinatorName}
              onChange={e => handleChange('coordinatorName', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Cargo del Coordinador</label>
            <input
              type="text"
              value={formData.coordinatorRole}
              onChange={e => handleChange('coordinatorRole', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Ingeniero de Sistemas</label>
            <input
              type="text"
              value={formData.engineerName}
              onChange={e => handleChange('engineerName', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 block">Cargo Técnico</label>
            <input
              type="text"
              value={formData.engineerRole}
              onChange={e => handleChange('engineerRole', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Primary Save Action Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                Tienes modificaciones sin guardar. Haz clic en Guardar Cambios para aplicarlos.
              </span>
            ) : (
              <span>Los textos actuales están guardados y sincronizados.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>

            <button
              id="btn-save-branding-bottom"
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>💾 Guardar Cambios de Membrete</span>
            </button>
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
            Para compartir los nombres modificados y textos oficiales con el equipo o con el Coordinador <strong className="text-slate-900 dark:text-slate-200">{formData.coordinatorName}</strong>, utiliza cualquiera de estas dos opciones:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                try {
                  const payload = { branding: formData };
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
                  branding: formData
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
      </div>
    </div>
  );
};

