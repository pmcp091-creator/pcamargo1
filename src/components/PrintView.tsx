import React, { useState } from 'react';
import { TrainingSession, BrandingSettings, Municipality } from '../types/schedule';
import { LogoBadge } from './LogoBadge';
import { Printer, ArrowLeft, Download, CheckCircle2, Clock, MapPin, FileCode, Check, Loader2, FileSpreadsheet } from 'lucide-react';
import { generateDirectPDF } from '../utils/pdfExport';

interface PrintSectionsConfig {
  header?: boolean;
  dashboardKpis?: boolean;
  territorialCharts?: boolean;
  scheduleGrid?: boolean;
  signatures?: boolean;
}

interface PrintViewProps {
  sessions: TrainingSession[];
  branding: BrandingSettings;
  onBack: () => void;
  onExportHTML?: () => void;
  onExportExcel?: () => void;
  paperFormat?: 'letter' | 'legal';
  paperOrientation?: 'portrait' | 'landscape';
  sectionsConfig?: PrintSectionsConfig;
  restrictedInstName?: string | null;
}

export const PrintView: React.FC<PrintViewProps> = ({ 
  sessions, 
  branding, 
  onBack, 
  onExportHTML,
  onExportExcel,
  paperFormat = 'letter',
  paperOrientation = 'landscape',
  sectionsConfig = {
    header: true,
    dashboardKpis: true,
    territorialCharts: true,
    scheduleGrid: true,
    signatures: true
  },
  restrictedInstName
}) => {
  const [filterMun, setFilterMun] = useState<string>('all');
  const [onlyApproved, setOnlyApproved] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const filteredSessions = sessions.filter(s => {
    const matchesMun = filterMun === 'all' || s.municipality === filterMun;
    const matchesApproved = !onlyApproved || s.status === 'APROBADO';
    return matchesMun && matchesApproved;
  });

  // Descarga directa de archivo binario PDF (.pdf)
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateDirectPDF({
        elementId: 'printable-official-document',
        paperFormat: paperFormat as 'letter' | 'legal',
        paperOrientation: paperOrientation as 'landscape' | 'portrait',
        restrictedInstName,
      });
    } catch (error) {
      console.error('Error generando archivo PDF:', error);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Disparador de impresión del navegador de respaldo
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.focus();
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Reglas de impresión CSS estrictas para Carta (21.59x27.94cm) y Oficio (21.59x33.02cm) */}
      <style>{`
        @page {
          size: ${paperFormat === 'letter' ? '215.9mm 279.4mm' : '215.9mm 330.2mm'} ${paperOrientation};
          margin: 12mm 15mm;
        }
        @media print {
          .no-print, .print-hide { display: none !important; }
          body { background: white !important; color: black !important; font-size: 10pt; }
          .page-break { page-break-after: always; break-after: page; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #94a3b8 !important; }
        }
      `}</style>

      {/* Barra de Controles en Pantalla (Oculta al imprimir) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Tablero</span>
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Vista Previa Oficial para Imprenta / PDF</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formato: <strong>{paperFormat === 'letter' ? 'Carta (21.59 x 27.94 cm)' : 'Oficio (21.59 x 33.02 cm)'}</strong> — {paperOrientation === 'landscape' ? 'Horizontal' : 'Vertical'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!restrictedInstName && (
            <select
              value={filterMun}
              onChange={e => setFilterMun(e.target.value)}
              className="text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg font-medium focus:outline-none"
            >
              <option value="all">Todas las Zonas (12 Sedes)</option>
              <option value="Uribia">Solo Uribia</option>
              <option value="Riohacha">Solo Riohacha</option>
              <option value="Manaure">Solo Manaure</option>
            </select>
          )}

          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={onlyApproved}
              onChange={e => setOnlyApproved(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>Solo Concertados</span>
          </label>

          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700/60 rounded-lg shadow-xs transition"
              title="Descargar tabla completa a Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Descargar Excel</span>
            </button>
          )}

          {onExportHTML && (
            <button
              onClick={onExportHTML}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700/60 rounded-lg shadow-xs transition"
            >
              <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Descargar HTML</span>
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-75 cursor-pointer"
            title="Descargar documento oficial en formato PDF a su dispositivo"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Generando PDF y descargando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>📥 Descargar Archivo PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            disabled={isPrinting || isGeneratingPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            title="Abrir cuadro de diálogo de impresión del navegador"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Hoja de Impresión Oficial */}
      <div 
        id="printable-official-document" 
        className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0"
      >
        
        {/* 1. Membrete Oficial */}
        {sectionsConfig.header && (
          <div className="border-b-2 border-slate-900 pb-3 mb-4 print-header">
            <div className="flex items-center justify-between w-full">
              {/* Columna izquierda: Logo 1 con contenedor rígido */}
              <div className="w-24 shrink-0 flex items-center justify-start">
                <LogoBadge type="logo1" customUrl={branding.logo1Url} size="lg" className="max-w-[96px] h-12" />
              </div>

              {/* Columna central: Bloque de texto institucional con márgenes laterales de seguridad */}
              <div className="flex-1 px-4 text-center min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block truncate">
                  {branding.organizationName || 'THE BIZ NATION'}
                </span>
                <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-950 uppercase tracking-tight leading-tight truncate">
                  {restrictedInstName ? `CRONOGRAMA OFICIAL DE FORMACIONES — ${restrictedInstName.toUpperCase()}` : (branding.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA')}
                </h1>
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {restrictedInstName ? `Sede Exclusiva Concertada • ${branding.programSubtitle}` : branding.programSubtitle}
                </p>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3">
                  <span><strong>Institución / Zona:</strong> {restrictedInstName || (filterMun === 'all' ? 'Uribia, Riohacha y Manaure' : filterMun)}</span>
                  <span>•</span>
                  <span><strong>Emisión:</strong> {currentDate}</span>
                  <span>•</span>
                  <span><strong>Coordinador:</strong> {branding.coordinatorName}</span>
                </div>
              </div>

              {/* Columna derecha: Logo 2 con contenedor rígido */}
              <div className="w-24 shrink-0 flex items-center justify-end">
                <LogoBadge type="logo2" customUrl={branding.logo2Url} size="lg" className="max-w-[50px] h-12" />
              </div>
            </div>
          </div>
        )}

        {/* 2. Métricas de Avance y Conteo de Sesiones (Dashboard) */}
        {sectionsConfig.dashboardKpis && (
          <div className="grid grid-cols-4 gap-2 mb-4 p-2.5 bg-slate-50 border border-slate-300 rounded text-center print-kpis">
            <div className="border-r border-slate-200 pr-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Total Sesiones</span>
              <span className="text-sm font-black text-slate-900">{filteredSessions.length}</span>
            </div>
            <div className="border-r border-slate-200 pr-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Presenciales</span>
              <span className="text-sm font-black text-emerald-700">{filteredSessions.filter(s => s.modality === 'Presencial').length}</span>
            </div>
            <div className="border-r border-slate-200 pr-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Virtuales</span>
              <span className="text-sm font-black text-blue-700">{filteredSessions.filter(s => s.modality === 'Virtual').length}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Concertadas</span>
              <span className="text-sm font-black text-slate-900">{filteredSessions.filter(s => s.status === 'APROBADO').length}</span>
            </div>
          </div>
        )}

        {/* 3. Distribución Territorial */}
        {sectionsConfig.territorialCharts && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-slate-50 border border-slate-300 rounded text-center text-[10px] print-charts">
            <div className="bg-white p-1.5 border border-slate-200 rounded">
              <span className="font-bold text-slate-800 block">Uribia</span>
              <span className="text-xs font-black text-blue-800">
                {filteredSessions.filter(s => s.municipality === 'Uribia').length} sesiones
              </span>
              <span className="text-[8px] text-slate-500 block">Alta Guajira</span>
            </div>
            <div className="bg-white p-1.5 border border-slate-200 rounded">
              <span className="font-bold text-slate-800 block">Riohacha</span>
              <span className="text-xs font-black text-amber-700">
                {filteredSessions.filter(s => s.municipality === 'Riohacha').length} sesiones
              </span>
              <span className="text-[8px] text-slate-500 block">Distrito Capital</span>
            </div>
            <div className="bg-white p-1.5 border border-slate-200 rounded">
              <span className="font-bold text-slate-800 block">Manaure</span>
              <span className="text-xs font-black text-emerald-700">
                {filteredSessions.filter(s => s.municipality === 'Manaure').length} sesiones
              </span>
              <span className="text-[8px] text-slate-500 block">Municipio Salinero</span>
            </div>
          </div>
        )}

        {/* 4. Grilla de Actividades */}
        {sectionsConfig.scheduleGrid && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-1.5 border-r border-slate-300 text-center w-7">#</th>
                  <th className="p-1.5 border-r border-slate-300 w-16">Municipio</th>
                  <th className="p-1.5 border-r border-slate-300 min-w-[130px]">Institución / Sede</th>
                  <th className="p-1.5 border-r border-slate-300 w-20">Jornada</th>
                  <th className="p-1.5 border-r border-slate-300 w-24">Audiencia / Tipo</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-center">Modalidad</th>
                  <th className="p-1.5 border-r border-slate-300 w-16 text-center">Estado</th>
                  <th className="p-1.5 border-r border-slate-300 w-20">Día(s)</th>
                  <th className="p-1.5 border-r border-slate-300 w-24">Horario</th>
                  <th className="p-1.5 min-w-[140px]">Observaciones y Logística</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSessions.map((session, idx) => (
                  <tr key={session.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="p-1.5 border-r border-slate-200 text-center font-bold text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 font-semibold">
                      {session.municipality}
                    </td>
                    <td className="p-1.5 border-r border-slate-200">
                      <div className="font-bold text-slate-900 leading-tight">{session.institution}</div>
                      {session.campus && session.campus !== session.institution && (
                        <div className="text-[9px] text-slate-500">Sede: {session.campus}</div>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-slate-700">
                      {session.academicShift}
                    </td>
                    <td className="p-1.5 border-r border-slate-200">
                      <div className="font-semibold text-slate-800">{session.targetAudience}</div>
                      <div className="text-[9px] text-slate-500">{session.trainingType}</div>
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center font-semibold">
                      {session.modality}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                        session.status === 'APROBADO' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="p-1.5 border-r border-slate-200 font-medium">
                      {session.daysOfWeek.join(', ')}
                    </td>
                    <td className="p-1.5 border-r border-slate-200 font-semibold">
                      {session.startTime} - {session.endTime}
                      <span className="text-[9px] text-slate-500 block font-normal">({session.durationHours}h)</span>
                    </td>
                    <td className="p-1.5 text-slate-600 text-[9px] leading-tight">
                      <p>{session.observations}</p>
                      {session.infrastructureNotes && (
                        <p className="text-amber-800 font-medium mt-0.5">Nota: {session.infrastructureNotes}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Bloque de Firmas Oficiales */}
        {sectionsConfig.signatures && (
          <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-10">
            <div className="text-center">
              <div className="w-48 mx-auto border-b border-slate-900 mb-1.5"></div>
              <div className="font-bold text-xs text-slate-900">{branding.coordinatorName}</div>
              <div className="text-[10px] text-slate-500">{branding.coordinatorRole}</div>
              <div className="text-[9px] text-slate-400">{branding.organizationName}</div>
            </div>

            <div className="text-center">
              <div className="w-48 mx-auto border-b border-slate-900 mb-1.5"></div>
              <div className="font-bold text-xs text-slate-900">{restrictedInstName ? `Rector / Coordinador Académico` : 'Directivo / Rector Institucional'}</div>
              <div className="text-[10px] text-slate-500">Validación y Concertación de Horarios</div>
              <div className="text-[9px] text-slate-400">{restrictedInstName || 'Sede Educativa La Guajira'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};