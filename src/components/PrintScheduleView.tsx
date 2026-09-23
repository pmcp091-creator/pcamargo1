import React, { useState, useMemo } from 'react';
import { TrainingSession, BrandingSettings } from '../types/schedule';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  FileSpreadsheet
} from 'lucide-react';
import { generateDirectPDF } from '../utils/pdfExport';

export const getExportSessionStatus = (session: TrainingSession): string => {
  return session.status || 'APROBADO';
};

export interface PrintScheduleViewProps {
  sessions: TrainingSession[];
  allSessions?: TrainingSession[];
  branding: BrandingSettings;
  selectedInstitution?: string;
  selectedMunicipality?: string;
  selectedModality?: string;
  customTitle?: string | null;
  periodLabel?: string | null;
  onBack: () => void;
  onExportHTML?: () => void;
  onExportExcel?: (selectedInsts?: string[]) => void;
  paperFormat?: 'letter' | 'legal';
  paperOrientation?: 'portrait' | 'landscape';
  sectionsConfig?: {
    header?: boolean;
    dashboardKpis?: boolean;
    alliesLogos?: boolean;
    scheduleGrid?: boolean;
    signatureBlock?: boolean;
    footer?: boolean;
    territorialCharts?: boolean;
    signatures?: boolean;
  };
  restrictedInstName?: string | null;
}

// Resuelve la fecha y timestamp para ordenamiento cronológico riguroso
export function getSessionDateForSort(session: TrainingSession): { dateStr: string; timestamp: number } {
  if (session.specificDate && /^\d{4}-\d{2}-\d{2}$/.test(session.specificDate)) {
    return { dateStr: session.specificDate, timestamp: new Date(session.specificDate + 'T00:00:00').getTime() };
  }
  if (session.date && /^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
    return { dateStr: session.date, timestamp: new Date(session.date + 'T00:00:00').getTime() };
  }
  if (session.specificDates && Array.isArray(session.specificDates) && session.specificDates.length > 0) {
    const sorted = [...session.specificDates].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    if (sorted.length > 0) {
      return { dateStr: sorted[0], timestamp: new Date(sorted[0] + 'T00:00:00').getTime() };
    }
  }
  if (session.datesScheduled) {
    const monthMap: Record<string, string> = {
      september: '2026-09',
      october: '2026-10',
      november: '2026-11',
      december: '2026-12'
    };
    for (const [mName, mPrefix] of Object.entries(monthMap)) {
      const days = session.datesScheduled[mName as keyof typeof session.datesScheduled];
      if (days && days.length > 0) {
        const sortedDays = [...days].map(d => parseInt(d, 10)).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (sortedDays.length > 0) {
          const dStr = `${mPrefix}-${String(sortedDays[0]).padStart(2, '0')}`;
          return { dateStr: dStr, timestamp: new Date(dStr + 'T00:00:00').getTime() };
        }
      }
    }
  }
  if (session.daysOfWeek && session.daysOfWeek.length > 0) {
    const dayMap: Record<string, string> = {
      'lunes': '2026-09-14',
      'martes': '2026-09-15',
      'miércoles': '2026-09-16',
      'miercoles': '2026-09-16',
      'jueves': '2026-09-17',
      'viernes': '2026-09-18',
      'sábado': '2026-09-19',
      'sabado': '2026-09-19',
      'domingo': '2026-09-20'
    };
    const key = session.daysOfWeek[0].toLowerCase();
    if (dayMap[key]) {
      return { dateStr: dayMap[key], timestamp: new Date(dayMap[key] + 'T00:00:00').getTime() };
    }
  }
  return { dateStr: '9999-99-99', timestamp: 9999999999999 };
}

// Convierte cualquier formato de hora a minutos del día (de 0 a 1440) para orden cronológico real AM a PM
export const getStartMinutes = (item: any): number => {
  const raw = item.startTime || item.time || item.horario || item.timeRange || '';
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = (match[3] || '').toUpperCase();
  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Convierte cadena de hora '07:00 AM' a minutos desde la medianoche para ordenar
export function parseTimeToMinutes(timeStr?: string): number {
  return getStartMinutes({ startTime: timeStr });
}

// Formatea la fecha y día legible en español
export function formatSessionDateDisplay(session: TrainingSession): { dayName: string; dateFormatted: string; isDated: boolean } {
  const { dateStr } = getSessionDateForSort(session);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && dateStr !== '9999-99-99') {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      dayName: dayNames[dt.getDay()] || 'Día',
      dateFormatted: `${d} ${monthNames[m - 1]} ${y}`,
      isDated: true
    };
  }
  return {
    dayName: (session.daysOfWeek && session.daysOfWeek[0]) || 'Programada',
    dateFormatted: session.date || '',
    isDated: false
  };
}

export const PrintScheduleView: React.FC<PrintScheduleViewProps> = ({
  sessions,
  branding,
  selectedInstitution = 'all',
  selectedMunicipality = 'all',
  customTitle,
  periodLabel,
  onBack,
  onExportExcel,
  paperFormat = 'letter',
  paperOrientation = 'landscape',
  sectionsConfig = {
    header: true,
    dashboardKpis: true,
    alliesLogos: true,
    scheduleGrid: true,
    signatureBlock: true,
    footer: true,
  },
  restrictedInstName
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Determinar institución para el alcance
  const activeInstitution = restrictedInstName || (selectedInstitution !== 'all' ? selectedInstitution : null);

  const docTitle = customTitle
    ? customTitle
    : activeInstitution
    ? `CRONOGRAMA OFICIAL CONCERTADO — ${activeInstitution.toUpperCase()}`
    : `CRONOGRAMA OFICIAL CONCERTADO — TODAS LAS INSTITUCIONES (12 SEDES)`;

  const scopeLabel = activeInstitution
    ? activeInstitution
    : selectedMunicipality !== 'all'
    ? `Municipio de ${selectedMunicipality}`
    : 'Todas las Instituciones (12 Sedes Territoriales: Uribia, Riohacha, Manaure)';

  const effectivePeriod = periodLabel || 'Septiembre - Diciembre 2026';

  // Métricas dinámicas calculadas sobre las sesiones recibidas
  const kpis = useMemo(() => {
    const total = sessions.length;
    const presencial = sessions.filter(s => s.modality === 'Presencial').length;
    const virtual = sessions.filter(s => s.modality === 'Virtual').length;
    const approved = sessions.filter(s => getExportSessionStatus(s) === 'APROBADO').length;
    const pct = total > 0 ? Math.round((approved / total) * 100) : 100;
    return { total, presencial, virtual, approved, pct };
  }, [sessions]);

  // Agrupar sesiones por día para asegurar separación nítida de días y orden cronológico AM -> PM en cada jornada
  const dayGroups = useMemo(() => {
    const groupsMap = new Map<string, {
      dateKey: string;
      dayName: string;
      dateFormatted: string;
      daySessions: TrainingSession[];
      timestamp: number;
    }>();

    sessions.forEach(session => {
      const { dateStr, timestamp } = getSessionDateForSort(session);
      const { dayName, dateFormatted } = formatSessionDateDisplay(session);
      const key = dateStr !== '9999-99-99' ? dateStr : (session.date || 'sin-fecha');

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          dateKey: key,
          dayName,
          dateFormatted,
          daySessions: [],
          timestamp
        });
      }
      groupsMap.get(key)!.daySessions.push(session);
    });

    return Array.from(groupsMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }, [sessions]);

  // Ordenamiento cronológico estricto: Fechas más cercanas / del día actual arriba, lejanas abajo
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      // 1. Fecha cronológica
      const dateA = getSessionDateForSort(a);
      const dateB = getSessionDateForSort(b);
      if (dateA.timestamp !== dateB.timestamp) {
        return dateA.timestamp - dateB.timestamp;
      }
      // 2. Horario dentro del mismo día (más temprano primero de AM a PM)
      const timeDiff = getStartMinutes(a) - getStartMinutes(b);
      if (timeDiff !== 0) {
        return timeDiff;
      }
      // 3. Desempate por número de ítem
      return (a.itemNumber || 0) - (b.itemNumber || 0);
    });
  }, [sessions]);

  // Manejo de impresión nativa
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.focus();
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  // Generación y descarga directa de PDF oficial
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateDirectPDF({
        elementId: 'printable-official-document',
        paperFormat: paperFormat as 'letter' | 'legal',
        paperOrientation: paperOrientation as 'landscape' | 'portrait',
        restrictedInstName: activeInstitution,
      });
    } catch (error) {
      console.error('Error generando archivo PDF oficial:', error);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white text-slate-800 dark:text-slate-100 font-sans">
      {/* Estilos CSS específicos de impresión: sin saltos forzados de página y protección de corte de filas */}
      <style>{`
        @media print {
          @page {
            margin: 8mm;
            size: ${paperOrientation === 'portrait' ? 'portrait' : 'landscape'};
          }
          body {
            background: white !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          td, th {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .overflow-x-auto, .overflow-y-auto {
            overflow: visible !important;
          }
        }
      `}</style>

      {/* Barra de Control Superior (Oculta en Impresión) */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-2.5 shadow-md print:hidden">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la App</span>
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-slate-200 leading-tight">
                Vista Previa de Exportación Oficial (PDF e Impresión)
              </h2>
              <p className="text-[11px] text-slate-400">
                {scopeLabel} • <strong>{sortedSessions.length} formaciones ordenadas por fecha y hora</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onExportExcel && (
              <button
                type="button"
                id="btn-printview-export-excel"
                onClick={() => onExportExcel(activeInstitution ? [activeInstitution] : undefined)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                title="Descargar archivo Excel con datos filtrados"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Descargar Excel</span>
              </button>
            )}

            <button
              type="button"
              id="btn-printview-download-pdf"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Descargar archivo binario PDF oficial"
            >
              {isGeneratingPDF ? (
                <span className="inline-block animate-spin">⌛</span>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>

            <button
              type="button"
              id="btn-printview-print"
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
              title="Abrir cuadro de diálogo de impresión"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Imprimible Oficial (Renderizado Estrictamente UNA Vez en el DOM) */}
      <div 
        id="printable-official-document"
        className="max-w-[1280px] mx-auto p-4 sm:p-6 bg-white text-slate-900 print:p-0 print:m-0 print:max-w-none"
      >
        {/* ========================================================================= */}
        {/* 1. MEMBRETE COMPACTO SUPERIOR */}
        {/* ========================================================================= */}
        {sectionsConfig.header && (
          <div className="border-b border-slate-900 pb-1.5 mb-2 print:pb-1 print:mb-1.5 print-header">
            <div className="flex items-center justify-between w-full gap-3">
              {/* Columna izquierda: Logo Legado Oficial */}
              <div className="w-36 sm:w-44 shrink-0 flex items-center justify-start">
                <img 
                  src="/logos/legado.png" 
                  alt="Legado para los Territorios" 
                  className="h-8 print:h-7 w-auto object-contain filter invert contrast-200" 
                />
              </div>

              {/* Columna central: Alianza y Título compactos */}
              <div className="flex-1 text-center min-w-0 px-1">
                <p className="text-[8.5px] print:text-[8px] font-bold tracking-wide uppercase text-slate-700 leading-tight">
                  ALIANZA: GRUPO ENERGÍA BOGOTÁ • ACDI/VOCA • FUNDACIÓN PROMIGAS • ENLAZA • THE BIZ NATION
                </p>
                <h1 className="text-xs sm:text-sm print:text-[11px] font-black text-slate-950 uppercase tracking-tight leading-tight mt-0.5">
                  {branding.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA'}
                </h1>
                <p className="text-[11px] print:text-[9.5px] font-bold text-slate-800 leading-tight">
                  {docTitle}
                </p>
                <div className="text-[8px] print:text-[7.5px] text-slate-600 mt-0.5 flex items-center justify-center flex-wrap gap-2 font-medium leading-tight">
                  <span><strong>Alcance:</strong> {scopeLabel}</span>
                  <span>•</span>
                  <span><strong>Periodo:</strong> {effectivePeriod}</span>
                  <span>•</span>
                  <span><strong>Emisión:</strong> {new Date().toLocaleDateString('es-CO')}</span>
                  <span>•</span>
                  <span><strong>Coordinador:</strong> {branding.coordinatorName || 'Pompilio Camargo'}</span>
                  <span>•</span>
                  <span><strong>Ing. Sistemas:</strong> {branding.engineerName || 'Luis Ángel Camargo'}</span>
                </div>
              </div>

              {/* Columna derecha: Sello Oficial compacto */}
              <div className="w-28 sm:w-36 shrink-0 flex flex-col items-end justify-center text-right">
                <span className="inline-flex items-center gap-1 text-[8.5px] print:text-[8px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Concertado 2026
                </span>
                <span className="text-[7.5px] text-slate-500 font-semibold mt-0.5">
                  La Guajira, Colombia
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. BLOQUE ULTRA-COMPACTO DE RESUMEN (TOTAL, PRESENCIALES, VIRTUALES, PERIODO) */}
        {/* ========================================================================= */}
        {sectionsConfig.dashboardKpis && (
          <div className="grid grid-cols-4 gap-1 mb-2 print:mb-1.5 p-1 print:p-0.5 bg-slate-50 border border-slate-300 rounded text-center print-kpis">
            <div className="border-r border-slate-200 pr-1">
              <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-slate-500 block">Total Sesiones</span>
              <span className="text-xs sm:text-sm print:text-[11px] font-black text-slate-900 block leading-tight">{kpis.total}</span>
              <span className="text-[7px] text-slate-500 block">Programadas</span>
            </div>
            <div className="border-r border-slate-200 px-1">
              <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-emerald-700 block">Presenciales</span>
              <span className="text-xs sm:text-sm print:text-[11px] font-black text-emerald-800 block leading-tight">{kpis.presencial}</span>
              <span className="text-[7px] text-emerald-600 block">Aula Territorial</span>
            </div>
            <div className="border-r border-slate-200 px-1">
              <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-sky-700 block">Virtuales</span>
              <span className="text-xs sm:text-sm print:text-[11px] font-black text-sky-800 block leading-tight">{kpis.virtual}</span>
              <span className="text-[7px] text-sky-600 block">Conexión Sincrónica</span>
            </div>
            <div className="pl-1">
              <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-amber-700 block">Periodo</span>
              <span className="text-[10px] print:text-[8.5px] font-black text-amber-900 block truncate leading-tight" title={effectivePeriod}>
                {effectivePeriod}
              </span>
              <span className="text-[7px] text-amber-700 block">{kpis.approved} Aprobadas ({kpis.pct}%)</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TABLA CONTINUA UNIFICADA DE FORMACIONES (INICIA DE INMEDIATO EN PÁGINA 1) */}
        {/* ========================================================================= */}
        {sectionsConfig.scheduleGrid && (
          <div className="mb-3 print:mb-1.5 print-schedule">
            {sortedSessions.length === 0 ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs">
                No hay sesiones programadas para este periodo o filtro seleccionado.
              </div>
            ) : (
              <div className="border border-slate-300 rounded overflow-visible print:border print:rounded-none">
                <table className="w-full text-left text-[9px] print:text-[8px] border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-400">
                      <th className="py-1 px-1 text-center w-7 border-r border-slate-700">#</th>
                      <th className="py-1 px-1.5 w-22 border-r border-slate-700">Fecha / Día</th>
                      <th className="py-1 px-1.5 w-22 border-r border-slate-700">Horario</th>
                      <th className="py-1 px-1.5 w-16 border-r border-slate-700">Municipio</th>
                      <th className="py-1 px-1.5 min-w-[130px] border-r border-slate-700">Institución / Sede</th>
                      <th className="py-1 px-1.5 min-w-[120px] border-r border-slate-700">Formación / Audiencia</th>
                      <th className="py-1 px-1 text-center w-18 border-r border-slate-700">Modalidad</th>
                      <th className="py-1 px-1 text-center w-18 border-r border-slate-700">Estado</th>
                      <th className="py-1 px-1.5 min-w-[120px]">Observaciones y Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dayGroups.map((group, gIdx) => {
                      const daySessions = group.daySessions;
                      // Orden cronológico obligatorio de horarios (mañana a tarde: AM a PM)
                      const sortedDaySessions = [...daySessions].sort((a, b) => getStartMinutes(a) - getStartMinutes(b));
                      const showDayHeader = group.dateKey !== 'sin-fecha' && (dayGroups.length > 1 || group.dateKey !== '9999-99-99');

                      return (
                        <React.Fragment key={group.dateKey || gIdx}>
                          {showDayHeader && (
                            <tr className="bg-slate-800 text-amber-300 font-bold text-[9px] print:text-[8px] avoid-break" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                              <td colSpan={9} className="py-0.5 px-2 uppercase tracking-wider">
                                📅 {group.dayName} • {group.dateFormatted}
                              </td>
                            </tr>
                          )}
                          {sortedDaySessions.map((session, sIdx) => {
                            const effectiveStatus = getExportSessionStatus(session);
                            const isApproved = effectiveStatus === 'APROBADO';
                            const { dayName, dateFormatted } = formatSessionDateDisplay(session);

                            // Detección de Grado / Población
                            const detectedGrade = 
                              session.grade || 
                              (session as any).gradeOrCycle ||
                              session.observations?.match(/Grado\s*([0-9]{1,2}(?:-[0-9]{1,2})?)/i)?.[0] || 
                              session.topic?.match(/Grado\s*([0-9]{1,2}(?:-[0-9]{1,2})?)/i)?.[0] ||
                              (session as any).name?.match(/Grado\s*([0-9]{1,2}(?:-[0-9]{1,2})?)/i)?.[0];

                            const isDocente = 
                              (session as any).audience?.toLowerCase().includes('docente') || 
                              (session as any).type?.toLowerCase().includes('docente') ||
                              session.targetAudience?.toLowerCase().includes('docente') ||
                              (session.targetPopulation && String(session.targetPopulation).toLowerCase().includes('docente')) ||
                              session.trainingType?.toLowerCase().includes('docente');

                            return (
                              <tr 
                                key={session.id || `${group.dateKey}-${sIdx}`}
                                className={`avoid-break ${sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                              >
                                <td className="py-1 px-1 border-r border-slate-200 text-center font-bold text-slate-600">
                                  {session.itemNumber || sIdx + 1}
                                </td>
                                <td className="py-1 px-1.5 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800">
                                  <div className="font-bold text-slate-900 leading-tight">{dayName}</div>
                                  <div className="text-[8px] text-slate-500">{dateFormatted}</div>
                                </td>
                                <td className="py-1 px-1.5 border-r border-slate-200 font-semibold text-slate-800 whitespace-nowrap">
                                  <div className="leading-tight">{session.startTime || 'Por definir'} - {session.endTime || 'Por definir'}</div>
                                  <div className="text-[8px] text-slate-500 font-normal">
                                    {session.academicShift || (session.durationHours ? `${session.durationHours} hrs` : '')}
                                  </div>
                                </td>
                                <td className="py-1 px-1.5 border-r border-slate-200 font-semibold text-slate-800">
                                  <span className={`inline-block px-1 py-0.2 rounded text-[8px] font-bold ${
                                    session.municipality === 'Uribia'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : session.municipality === 'Riohacha'
                                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}>
                                    {session.municipality}
                                  </span>
                                </td>
                                <td className="py-1 px-1.5 border-r border-slate-200">
                                  <div className="font-bold text-slate-900 leading-tight">{session.institution}</div>
                                  {session.campus && (
                                    <div className="text-[8px] text-slate-600">
                                      Sede: {session.campus}
                                    </div>
                                  )}
                                  {isDocente ? (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-800 border border-slate-300">
                                      Población: Formación Docente
                                    </span>
                                  ) : (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-900 border border-blue-200 font-semibold">
                                      {detectedGrade ? `Grado / Grupo: ${detectedGrade.replace(/grado\s*/i, '')}` : 'Audiencia: Estudiantes'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-1 px-1.5 border-r border-slate-200">
                                  <div className="font-semibold text-slate-900 leading-tight">
                                    {session.trainingType || session.topic || 'Formación Vocacional'}
                                  </div>
                                  <div className="text-[8px] text-slate-500">
                                    Audiencia: <strong className="text-slate-700">{session.targetAudience}</strong>
                                  </div>
                                </td>
                                <td className="py-1 px-1 border-r border-slate-200 text-center whitespace-nowrap">
                                  <span className={`inline-block px-1 py-0.2 rounded text-[8px] font-bold ${
                                    session.modality === 'Presencial'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : 'bg-sky-100 text-sky-900 border border-sky-300'
                                  }`}>
                                    {session.modality === 'Presencial' ? '🏛️ Presencial' : '💻 Virtual'}
                                  </span>
                                </td>
                                <td className="py-1 px-1 border-r border-slate-200 text-center whitespace-nowrap">
                                  <span className={`inline-block px-1 py-0.2 rounded text-[8px] font-extrabold ${
                                    isApproved
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-400'
                                      : 'bg-amber-50 text-amber-800 border border-amber-400'
                                  }`}>
                                    {effectiveStatus}
                                  </span>
                                </td>
                                <td className="py-1 px-1.5 text-slate-700">
                                  <div className="text-[8px] leading-tight">
                                    {session.observations || 'Formación regular concertada.'}
                                  </div>
                                  {session.responsible && (
                                    <div className="text-[7.5px] text-slate-500">
                                      Resp: <strong>{session.responsible}</strong>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BLOQUE DE FIRMAS TÉCNICAS COMPACTO */}
        {/* ========================================================================= */}
        {sectionsConfig.signatureBlock && (
          <div className="mt-3 pt-2 border-t border-slate-300 grid grid-cols-2 gap-6 avoid-break" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="text-center">
              <div className="h-8 border-b border-slate-400 mx-auto w-44 mb-1 flex items-end justify-center">
              </div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">
                {branding.coordinatorName || 'Pompilio Camargo'}
              </p>
              <p className="text-[8.5px] text-slate-600 font-medium">
                Coordinador Territorial del Programa
              </p>
              <p className="text-[7.5px] text-slate-500">
                Programa Vocación que Transforma
              </p>
            </div>

            <div className="text-center">
              <div className="h-8 border-b border-slate-400 mx-auto w-44 mb-1 flex items-end justify-center">
              </div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">
                {branding.engineerName || 'Luis Ángel Camargo'}
              </p>
              <p className="text-[8.5px] text-slate-600 font-medium">
                Especialista de Sistemas y Datos
              </p>
              <p className="text-[7.5px] text-slate-500">
                Validación Técnica y Concertación
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PIE DE PÁGINA IMPRIMIBLE CON LOS 5 LOGOS */}
        {/* ========================================================================= */}
        {sectionsConfig.footer && (
          <div className="mt-3 pt-2 border-t border-slate-300 avoid-break" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div className="flex items-center justify-between gap-3 flex-wrap print:flex">
              <img src="/logos/grupo_energia_bogota.png" alt="GEB" className="h-6 w-auto object-contain" />
              <img src="/logos/acdi.png" alt="ACDI/VOCA" className="h-6 w-auto object-contain" />
              <img src="/logos/promigas.png" alt="Promigas" className="h-6 w-auto object-contain" />
              <img src="/logos/enlaza.png" alt="Enlaza" className="h-6 w-auto object-contain" />
              <img src="/logos/biz_nation.png" alt="Biz Nation" className="h-6 w-auto object-contain" />
            </div>

            {/* Pie de página Legal */}
            <div className="text-center text-[7.5px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
              <p>
                Documento Técnico Oficial Concertado • Sistema de Gestión de Formaciones Territoriales La Guajira 2026.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintScheduleView;
