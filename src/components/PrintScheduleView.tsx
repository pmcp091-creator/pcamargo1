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
import { ordenarSesionesDelDia, getStartMinutes } from '../utils/sorting';
import { PdfLayout, PdfHeader, PdfFooter } from './pdf';

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

export { getStartMinutes };

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

  // Detección dinámica del tipo de reporte: Semanal / Concertado / Más de 6 formaciones vs Agenda Diaria
  const isWeekly = Boolean(
    docTitle?.toLowerCase().includes('semanal') || 
    docTitle?.toLowerCase().includes('concertado') || 
    sessions.length > 6
  );
  const isMultiPage = isWeekly;

  // Generación y descarga directa de PDF oficial
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateDirectPDF({
        elementId: 'printable-agenda',
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

  const renderKpis = () => (
    <div className="grid grid-cols-4 gap-1 my-1 p-1 bg-slate-50 border border-slate-300 rounded text-center print-kpis">
      <div className="border-r border-slate-200 py-1 px-2">
        <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-slate-500 block">Total Sesiones</span>
        <span className="text-xs sm:text-sm print:text-xs font-black text-slate-900 block leading-tight">{kpis.total}</span>
        <span className="text-[7px] text-slate-500 block">Programadas</span>
      </div>
      <div className="border-r border-slate-200 py-1 px-2">
        <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-emerald-700 block">Presenciales</span>
        <span className="text-xs sm:text-sm print:text-xs font-black text-emerald-800 block leading-tight">{kpis.presencial}</span>
        <span className="text-[7px] text-emerald-600 block">Aula Territorial</span>
      </div>
      <div className="border-r border-slate-200 py-1 px-2">
        <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-sky-700 block">Virtuales</span>
        <span className="text-xs sm:text-sm print:text-xs font-black text-sky-800 block leading-tight">{kpis.virtual}</span>
        <span className="text-[7px] text-sky-600 block">Conexión Sincrónica</span>
      </div>
      <div className="py-1 px-2">
        <span className="text-[7.5px] print:text-[7px] font-bold uppercase tracking-wider text-amber-700 block">Periodo</span>
        <span className="text-[10px] print:text-[8.5px] font-black text-amber-900 block truncate leading-tight" title={effectivePeriod}>
          {effectivePeriod}
        </span>
        <span className="text-[7px] text-amber-700 block">{kpis.approved} Aprobadas ({kpis.pct}%)</span>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white text-slate-800 dark:text-slate-100 font-sans print:m-0 print:p-0 ${isWeekly ? 'print-weekly print-multi-page print:h-auto print:min-h-0' : 'print-daily print-single-page'}`}>
      {/* Estilos CSS específicos de impresión: sin saltos forzados de página y protección de corte de filas */}
      <style>{`
        @page {
          size: auto;
          margin: 5mm 7mm !important;
        }
        @media print {
          /* 1. Liberar la altura en el documento para permitir varias páginas en Agenda Semanal / General */
          html, body, #root, main, div[role="dialog"], .print-multi-page, .print-weekly {
            ${isWeekly ? `
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            ` : ''}
          }

          html, body, #root, #root > div, main, .min-h-screen {
            ${isWeekly ? `
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            ` : `
            height: 100% !important;
            min-height: 100% !important;
            `}
            margin: 0 !important;
            margin-top: 0 !important;
            padding: 0 !important;
            padding-top: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header:not(.print-header), footer:not(.print-footer), 
          .no-print, [role="dialog"] > div:first-child, .fixed.inset-0.bg-black\/80,
          .fixed.inset-0.bg-slate-950\/70, .fixed.inset-0.bg-black\/60,
          #fab-calendar-new-session, .mobile-bottom-nav, button {
            display: none !important;
          }
          * {
            color-scheme: light !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-agenda, #printable-agenda *,
          #printable-official-document, #printable-official-document *,
          .print-sheet, .print-sheet * {
            visibility: visible;
          }

          /* 2. Contenedor semanal en bloque sin flexbox limitante */
          #printable-agenda.print-weekly,
          #printable-agenda.print-multi-page,
          .print-sheet.print-weekly,
          .print-sheet.print-multi-page {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* 3. Paginación limpia de la tabla semanal */
          .print-weekly table,
          .print-multi-page table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            table-layout: fixed !important;
          }

          /* Forzar repetición en el tope de cada hoja */
          .print-weekly thead,
          .print-weekly thead.print-table-header,
          .print-multi-page thead,
          .print-multi-page thead.print-table-header {
            display: table-header-group !important;
          }

          /* Forzar repetición en el fondo de cada hoja */
          .print-weekly tfoot,
          .print-weekly tfoot.print-table-footer,
          .print-multi-page tfoot,
          .print-multi-page tfoot.print-table-footer {
            display: table-footer-group !important;
          }

          /* No cortar filas de sesiones a la mitad */
          .print-weekly tr,
          .print-multi-page tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Evitar que las cabeceras de día queden huérfanas al final de una hoja */
          .print-weekly tr.day-header,
          .print-weekly tr[class*="bg-slate"],
          .print-multi-page tr.day-header,
          .print-multi-page tr[class*="bg-slate"] {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* 4. MANTENER LA AGENDA DIARIA EN 1 SOLA HOJA CON FOOTER AL FONDO (.print-daily / .print-single-page) */
          #printable-agenda.print-daily,
          #printable-agenda.print-single-page,
          .print-sheet.print-daily,
          .print-sheet.print-single-page {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            min-height: 98% !important;
            height: 98% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
          }

          #printable-agenda.print-daily > table,
          #printable-agenda.print-daily > .table-container,
          #printable-agenda.print-daily > .print-content-body,
          #printable-agenda.print-daily > div:nth-child(2),
          #printable-agenda.print-daily > div:nth-child(3),
          #printable-agenda.print-single-page > table,
          #printable-agenda.print-single-page > .table-container,
          #printable-agenda.print-single-page > .print-content-body,
          #printable-agenda.print-single-page > div:nth-child(2),
          #printable-agenda.print-single-page > div:nth-child(3) {
            flex-grow: 1 !important;
          }

          #printable-agenda.print-daily > div:last-child,
          #printable-agenda.print-daily .print-footer,
          #printable-agenda.print-single-page > div:last-child,
          #printable-agenda.print-single-page .print-footer {
            margin-top: auto !important;
            padding-top: 8px !important;
            width: 100% !important;
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-header {
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            margin-top: 0 !important;
            padding-top: 2px !important;
            margin-bottom: 6px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-footer img {
            max-height: 22px !important;
          }
          /* Distribución de columnas y ajuste fluido de Observaciones */
          #printable-agenda th:nth-child(1), #printable-agenda td:nth-child(1) { width: 4% !important; max-width: 4% !important; }
          #printable-agenda th:nth-child(2), #printable-agenda td:nth-child(2) { width: 10% !important; max-width: 10% !important; }
          #printable-agenda th:nth-child(3), #printable-agenda td:nth-child(3) { width: 11% !important; max-width: 11% !important; }
          #printable-agenda th:nth-child(4), #printable-agenda td:nth-child(4) { width: 8% !important; max-width: 8% !important; }
          #printable-agenda th:nth-child(5), #printable-agenda td:nth-child(5) { width: 21% !important; max-width: 21% !important; }
          #printable-agenda th:nth-child(6), #printable-agenda td:nth-child(6) { width: 13% !important; max-width: 13% !important; }
          #printable-agenda th:nth-child(7), #printable-agenda td:nth-child(7) { width: 9% !important; max-width: 9% !important; }
          #printable-agenda th:nth-child(8), #printable-agenda td:nth-child(8) { width: 8% !important; max-width: 8% !important; }
          #printable-agenda th:nth-child(9), #printable-agenda td:nth-child(9) { width: 26% !important; max-width: 26% !important; }

          td.col-observaciones, 
          #printable-agenda td:last-child,
          #printable-agenda td:last-child * {
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }

          table {
            border-collapse: collapse !important;
            width: 100% !important;
            table-layout: fixed !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          tr, td, th, .avoid-break {
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

      {/* Aviso sutil en móvil para desplazamiento horizontal de la hoja */}
      <div className="md:hidden text-[11px] text-slate-400 dark:text-slate-400 flex items-center justify-center gap-1.5 py-1 px-2 no-print">
        ↔ Desliza horizontalmente para ver la hoja completa
      </div>

      {/* Contenedor Imprimible Oficial Unificado mediante PdfLayout Global */}
      <div className={`w-full max-w-full overflow-x-auto overflow-y-visible touch-auto [-webkit-overflow-scrolling:touch] p-2 print:p-0 print:m-0 print:overflow-visible ${isWeekly ? 'print:h-auto print:min-h-0' : 'print:h-full print:min-h-full'}`}>
        <PdfLayout
          id="printable-agenda"
          className={isWeekly ? 'print-weekly print-multi-page' : 'print-daily print-single-page'}
          showHeader={!isWeekly && sectionsConfig.header}
          showFooter={!isWeekly && sectionsConfig.footer}
          headerProps={{
            branding,
            docTitle,
            scopeLabel,
            effectivePeriod,
            showSeal: true,
          }}
          footerProps={{
            customLegend: 'Documento Técnico Oficial Concertado • Alianza Grupo Energía Bogotá • ACDI/VOCA • Fundación Promigas • Enlaza • The Biz Nation • Sistema de Gestión de Formaciones La Guajira 2026.',
          }}
        >
        {/* ========================================================================= */}
        {/* 2. BLOQUE ULTRA-COMPACTO DE RESUMEN (EN DIARIA FUERA DE LA TABLA) */}
        {/* ========================================================================= */}
        {!isWeekly && sectionsConfig.dashboardKpis && renderKpis()}

        {/* ========================================================================= */}
        {/* 3. TABLA CONTINUA UNIFICADA DE FORMACIONES (INICIA DE INMEDIATO EN PÁGINA 1) */}
        {/* ========================================================================= */}
        {sectionsConfig.scheduleGrid && (
          <div className="mb-2 print:mb-1 print-schedule">
            {sortedSessions.length === 0 ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs">
                No hay sesiones programadas para este periodo o filtro seleccionado.
              </div>
            ) : (
              <div className="border border-slate-300 rounded overflow-visible print:border print:rounded-none">
                <table className="w-full text-left text-[9px] print:text-[8px] border-collapse">
                  <thead className="print-table-header">
                    {/* Fila 1: Cabezote institucional que se repetirá en cada hoja */}
                    {isWeekly && sectionsConfig.header && (
                      <tr className="border-0 bg-white">
                        <th colSpan={9} className="border-0 p-0 font-normal text-left bg-white">
                          <div className="pb-2">
                            {/* Contenido del Cabezote: Logo, Título, Subtítulo y Tarjetas de Resumen */}
                            <PdfHeader
                              branding={branding}
                              docTitle={docTitle}
                              scopeLabel={scopeLabel}
                              effectivePeriod={effectivePeriod}
                              showSeal={true}
                            />
                            {sectionsConfig.dashboardKpis && renderKpis()}
                          </div>
                        </th>
                      </tr>
                    )}
                    {/* Fila 2: Encabezados de columnas que ya se repiten */}
                    <tr className="bg-slate-900 text-white font-bold border-b border-slate-400">
                      <th className="col-num py-1 px-1 text-center w-[4%] border-r border-slate-700">#</th>
                      <th className="col-fecha py-1 px-1.5 w-[10%] border-r border-slate-700">Fecha / Día</th>
                      <th className="col-horario py-1 px-1.5 w-[11%] border-r border-slate-700">Horario</th>
                      <th className="col-municipio py-1 px-1.5 w-[8%] border-r border-slate-700">Municipio</th>
                      <th className="col-institucion py-1 px-1.5 w-[21%] border-r border-slate-700">Institución / Sede</th>
                      <th className="col-formacion py-1 px-1.5 w-[13%] border-r border-slate-700">Formación / Audiencia</th>
                      <th className="col-modalidad py-1 px-1 text-center w-[9%] border-r border-slate-700">Modalidad</th>
                      <th className="col-estado py-1 px-1 text-center w-[8%] border-r border-slate-700">Estado</th>
                      <th className="col-observaciones py-1 px-1.5 w-[26%]">Observaciones y Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dayGroups.map((group, gIdx) => {
                      const daySessions = group.daySessions;
                      // Orden visual e impreso único — AM a PM (Paso 2)
                      const sortedDaySessions = ordenarSesionesDelDia(daySessions);
                      const showDayHeader = group.dateKey !== 'sin-fecha' && (dayGroups.length > 1 || group.dateKey !== '9999-99-99');

                      return (
                        <React.Fragment key={group.dateKey || gIdx}>
                          {showDayHeader && (
                            <tr 
                              className="bg-slate-800 text-amber-300 font-bold text-[9px] print:text-[8px] avoid-break day-header" 
                              style={{ breakInside: 'avoid', pageBreakInside: 'avoid', breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
                            >
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
                                    <span className="inline-block mt-0.5 py-0.5 px-1.5 text-[9px] font-bold rounded bg-slate-200 text-slate-800 border border-slate-300">
                                      Población: Formación Docente
                                    </span>
                                  ) : (
                                    <span className="inline-block mt-0.5 py-0.5 px-1.5 text-[9px] font-bold rounded bg-blue-100 text-blue-900 border border-blue-200 font-semibold">
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
                                <td className="col-modalidad py-1 px-1 border-r border-slate-200 text-center whitespace-nowrap">
                                  <span className={`inline-block py-0.5 px-1 rounded text-[8.5px] font-bold ${
                                    session.modality === 'Presencial'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : 'bg-sky-100 text-sky-900 border border-sky-300'
                                  }`}>
                                    {session.modality === 'Presencial' ? '🏛️ Presencial' : '💻 Virtual'}
                                  </span>
                                </td>
                                <td className="col-estado py-1 px-1 border-r border-slate-200 text-center whitespace-nowrap">
                                  <span className={`inline-block py-0.5 px-1 rounded text-[8.5px] font-extrabold ${
                                    isApproved
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-400'
                                      : 'bg-amber-50 text-amber-800 border border-amber-400'
                                  }`}>
                                    {effectiveStatus}
                                  </span>
                                </td>
                                <td className="col-observaciones py-1 px-1.5 text-slate-800 text-[9.5px] print:text-[9.5px] leading-tight align-top">
                                  <div className="text-[9.5px] print:text-[9.5px] leading-tight text-slate-800 font-normal">
                                    {session.observations || 'Formación regular concertada.'}
                                  </div>
                                  {session.responsible && (
                                    <div className="text-[8.5px] print:text-[8.5px] text-slate-600 mt-0.5 font-medium">
                                      Resp: <strong className="text-slate-700">{session.responsible}</strong>
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
                  {isWeekly && sectionsConfig.footer && (
                    <tfoot className="print-table-footer">
                      <tr className="border-0 bg-white">
                        <td colSpan={9} className="border-0 p-0 bg-white pt-2">
                          <div className="border-t border-slate-300 pt-2 px-1 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-4">
                              <img src="/logos/geb.png" alt="GEB" className="h-5 object-contain" />
                              <img src="/logos/acdivoca.png" alt="ACDI/VOCA" className="h-5 object-contain" />
                              <img src="/logos/promigas.png" alt="Promigas" className="h-5 object-contain" />
                              <img src="/logos/enlaza.png" alt="Enlaza" className="h-5 object-contain" />
                              <img src="/logos/biznation.png" alt="The Biz Nation" className="h-5 object-contain" />
                            </div>
                            <span className="text-[8px] text-slate-500 font-medium">
                              Documento Técnico Oficial Concertado • Alianza Grupo Energía Bogotá • ACDI/VOCA • Fundación Promigas • Enlaza • The Biz Nation • 2026.
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BLOQUE DE FIRMAS TÉCNICAS COMPACTO */}
        {/* ========================================================================= */}
        {sectionsConfig.signatureBlock && (
          <div className="mt-2 pt-1.5 print:mt-1 print:pt-1 border-t border-slate-300 grid grid-cols-2 gap-4 avoid-break" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
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
        </PdfLayout>
      </div>
    </div>
  );
};

export default PrintScheduleView;
