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

interface DayScheduleGroup {
  dateKey: string;
  dayName: string;
  dateFormatted: string;
  sessions: TrainingSession[];
}

const DAY_ORDER_MAP: Record<string, number> = {
  'lunes': 1,
  'martes': 2,
  'miércoles': 3,
  'miercoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sábado': 6,
  'sabado': 6,
  'domingo': 7
};

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

  // Agrupación lineal día por día (Lunes a Sábado) en secuencia cronológica
  const dayGroups = useMemo<DayScheduleGroup[]>(() => {
    const map = new Map<string, TrainingSession[]>();

    sessions.forEach(session => {
      // Clave de fecha: specificDate (YYYY-MM-DD), o date, o daysOfWeek[0]
      const key = session.specificDate || session.date || (session.daysOfWeek && session.daysOfWeek[0]) || 'General';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(session);
    });

    const groups: DayScheduleGroup[] = [];

    map.forEach((sessList, key) => {
      // Ordenar sesiones dentro del día por hora de inicio
      const sortedSessions = [...sessList].sort((a, b) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });

      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
        const [y, m, d] = key.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const dayName = dayNames[dt.getDay()] || 'Día';
        const dateFormatted = `${d} de ${monthNames[m - 1]} de ${y}`;

        groups.push({
          dateKey: key,
          dayName,
          dateFormatted,
          sessions: sortedSessions
        });
      } else {
        groups.push({
          dateKey: key,
          dayName: key,
          dateFormatted: '',
          sessions: sortedSessions
        });
      }
    });

    // Ordenar los grupos cronológicamente
    groups.sort((a, b) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(a.dateKey) && /^\d{4}-\d{2}-\d{2}$/.test(b.dateKey)) {
        return a.dateKey.localeCompare(b.dateKey);
      }
      const orderA = DAY_ORDER_MAP[a.dayName.toLowerCase()] || 99;
      const orderB = DAY_ORDER_MAP[b.dayName.toLowerCase()] || 99;
      return orderA - orderB;
    });

    return groups;
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
      {/* Estilos CSS específicos de impresión: sin saltos forzados de página */}
      <style>{`
        @media print {
          @page {
            margin: 10mm;
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
          .avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Barra de Control Superior (Oculta en Impresión) */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 shadow-md print:hidden">
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
                {scopeLabel} • <strong>{sessions.length} sesiones sincronizadas</strong>
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
        className="max-w-[1280px] mx-auto p-6 md:p-8 bg-white text-slate-900 print:p-0 print:m-0 print:max-w-none"
      >
        {/* ========================================================================= */}
        {/* 1. UN SOLO MEMBRETE GENERAL SUPERIOR */}
        {/* ========================================================================= */}
        {sectionsConfig.header && (
          <div className="border-b-2 border-slate-900 pb-3 mb-4 print-header">
            <div className="flex items-center justify-between w-full gap-4">
              {/* Columna izquierda: Logo Legado Oficial Exclusivo */}
              <div className="w-40 sm:w-48 shrink-0 flex items-center justify-start">
                <img 
                  src="/logos/legado.png" 
                  alt="Legado para los Territorios" 
                  className="h-10 w-auto object-contain filter invert contrast-200" 
                />
              </div>

              {/* Columna central: Alianza 100% visible (sin truncate ni overflow) y Títulos */}
              <div className="flex-1 text-center min-w-0 px-2">
                <p className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-slate-700 leading-normal whitespace-normal break-words max-w-full">
                  ALIANZA: GRUPO ENERGÍA BOGOTÁ • ACDI/VOCA • FUNDACIÓN PROMIGAS • ENLAZA • THE BIZ NATION
                </p>
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-950 uppercase tracking-tight leading-tight mt-0.5">
                  {branding.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA'}
                </h1>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {docTitle}
                </p>
                <div className="text-[9.5px] text-slate-600 mt-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3 font-medium">
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

              {/* Columna derecha: Sello Oficial */}
              <div className="w-32 sm:w-40 shrink-0 flex flex-col items-end justify-center text-right">
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-1 rounded-md shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Concertado 2026
                </span>
                <span className="text-[8.5px] text-slate-500 font-semibold mt-1">
                  La Guajira, Colombia
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. UN SOLO BLOQUE DE TARJETAS DE RESUMEN (TOTAL, PRESENCIALES, VIRTUALES, PERIODO) */}
        {/* ========================================================================= */}
        {sectionsConfig.dashboardKpis && (
          <div className="grid grid-cols-4 gap-2 mb-4 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center print-kpis">
            <div className="border-r border-slate-200 pr-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Total Sesiones</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">{kpis.total}</span>
              <span className="text-[8px] text-slate-500">Programadas</span>
            </div>
            <div className="border-r border-slate-200 px-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block">Presenciales</span>
              <span className="text-base font-black text-emerald-800 mt-0.5 block">{kpis.presencial}</span>
              <span className="text-[8px] text-emerald-600 font-medium">En Aula Territorial</span>
            </div>
            <div className="border-r border-slate-200 px-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-sky-700 block">Virtuales</span>
              <span className="text-base font-black text-sky-800 mt-0.5 block">{kpis.virtual}</span>
              <span className="text-[8px] text-sky-600 font-medium">Conexión Sincrónica</span>
            </div>
            <div className="pl-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block">Periodo</span>
              <span className="text-xs font-black text-amber-900 mt-1 block truncate" title={effectivePeriod}>
                {effectivePeriod}
              </span>
              <span className="text-[8px] text-amber-600 font-medium">{sessions.length} sesiones</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DESGLOSE DE DÍAS Y TABLAS HORARIAS EN SECUENCIA (LUNES A SÁBADO) */}
        {/* ========================================================================= */}
        {sectionsConfig.scheduleGrid && (
          <div className="space-y-4 mb-6">
            {sessions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs">
                No hay sesiones programadas para este periodo o filtro seleccionado.
              </div>
            ) : (
              dayGroups.map((dayGroup, groupIdx) => (
                <div key={dayGroup.dateKey || groupIdx} className="avoid-break mb-4">
                  {/* Encabezado del Día */}
                  <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-t-lg flex items-center justify-between border-b-2 border-amber-400">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-black text-xs uppercase tracking-wider">
                        {dayGroup.dayName}
                      </span>
                      {dayGroup.dateFormatted && (
                        <span className="text-slate-300 text-xs font-semibold">
                          • {dayGroup.dateFormatted}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                      {dayGroup.sessions.length} {dayGroup.sessions.length === 1 ? 'formación' : 'formaciones'}
                    </span>
                  </div>

                  {/* Tabla Horaria del Día */}
                  <div className="overflow-x-auto border-x border-b border-slate-300 rounded-b-lg">
                    <table className="w-full text-left text-[9.5px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                          <th className="p-1.5 border-r border-slate-300 text-center w-8">#</th>
                          <th className="p-1.5 border-r border-slate-300 w-24">Horario</th>
                          <th className="p-1.5 border-r border-slate-300 w-20">Municipio</th>
                          <th className="p-1.5 border-r border-slate-300 min-w-[140px]">Institución / Sede</th>
                          <th className="p-1.5 border-r border-slate-300 min-w-[130px]">Formación / Audiencia</th>
                          <th className="p-1.5 border-r border-slate-300 w-20 text-center">Modalidad</th>
                          <th className="p-1.5 border-r border-slate-300 w-22 text-center">Estado</th>
                          <th className="p-1.5 min-w-[140px]">Observaciones y Condiciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {dayGroup.sessions.map((session, sIdx) => {
                          const effectiveStatus = getExportSessionStatus(session);
                          const isApproved = effectiveStatus === 'APROBADO';

                          return (
                            <tr key={session.id || sIdx} className={sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                              <td className="p-1.5 border-r border-slate-200 text-center font-bold text-slate-600">
                                {session.itemNumber || sIdx + 1}
                              </td>
                              <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-800 whitespace-nowrap">
                                <div>{session.startTime || 'Por definir'} - {session.endTime || 'Por definir'}</div>
                                <div className="text-[8px] text-slate-500 font-normal">
                                  {session.academicShift || (session.durationHours ? `${session.durationHours} hrs` : '')}
                                </div>
                              </td>
                              <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-800">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                                  session.municipality === 'Uribia'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : session.municipality === 'Riohacha'
                                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                }`}>
                                  {session.municipality}
                                </span>
                              </td>
                              <td className="p-1.5 border-r border-slate-200">
                                <div className="font-bold text-slate-900 leading-tight">{session.institution}</div>
                                {session.campus && (
                                  <div className="text-[8.5px] text-slate-600 mt-0.5">
                                    Sede: {session.campus}
                                  </div>
                                )}
                              </td>
                              <td className="p-1.5 border-r border-slate-200">
                                <div className="font-semibold text-slate-900 leading-tight">
                                  {session.trainingType || session.topic || 'Formación Vocacional'}
                                </div>
                                <div className="text-[8.5px] text-slate-500 mt-0.5">
                                  Audiencia: <strong className="text-slate-700">{session.targetAudience}</strong>
                                </div>
                              </td>
                              <td className="p-1.5 border-r border-slate-200 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                                  session.modality === 'Presencial'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-sky-100 text-sky-900 border border-sky-300'
                                }`}>
                                  {session.modality === 'Presencial' ? '🏛️ Presencial' : '💻 Virtual'}
                                </span>
                              </td>
                              <td className="p-1.5 border-r border-slate-200 text-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-extrabold ${
                                  isApproved
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-400'
                                    : 'bg-amber-50 text-amber-800 border border-amber-400'
                                }`}>
                                  {effectiveStatus}
                                </span>
                              </td>
                              <td className="p-1.5 text-slate-700">
                                <div className="text-[8.5px] leading-tight">
                                  {session.observations || 'Formación regular concertada con la sede.'}
                                </div>
                                {session.responsible && (
                                  <div className="text-[8px] text-slate-500 mt-0.5">
                                    Responsable: <strong>{session.responsible}</strong>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BLOQUE DE FIRMAS TÉCNICAS */}
        {/* ========================================================================= */}
        {sectionsConfig.signatureBlock && (
          <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 avoid-break">
            <div className="text-center">
              <div className="h-12 border-b border-slate-400 mx-auto w-48 mb-1.5 flex items-end justify-center">
                {/* Espacio para rúbrica */}
              </div>
              <p className="text-[11px] font-bold text-slate-900 uppercase">
                {branding.coordinatorName || 'Pompilio Camargo'}
              </p>
              <p className="text-[9px] text-slate-600 font-medium">
                Coordinador Territorial del Programa
              </p>
              <p className="text-[8px] text-slate-500">
                Programa Vocación que Transforma
              </p>
            </div>

            <div className="text-center">
              <div className="h-12 border-b border-slate-400 mx-auto w-48 mb-1.5 flex items-end justify-center">
                {/* Espacio para rúbrica */}
              </div>
              <p className="text-[11px] font-bold text-slate-900 uppercase">
                {branding.engineerName || 'Luis Ángel Camargo'}
              </p>
              <p className="text-[9px] text-slate-600 font-medium">
                Especialista de Sistemas y Datos
              </p>
              <p className="text-[8px] text-slate-500">
                Validación Técnica y Concertación
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. UN SOLO PIE DE PÁGINA IMPRIMIBLE CON LOS 5 LOGOS */}
        {/* ========================================================================= */}
        {sectionsConfig.footer && (
          <>
            <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between gap-4 flex-wrap print:flex">
              <img src="/logos/grupo_energia_bogota.png" alt="GEB" className="h-7 w-auto object-contain" />
              <img src="/logos/acdi.png" alt="ACDI/VOCA" className="h-7 w-auto object-contain" />
              <img src="/logos/promigas.png" alt="Promigas" className="h-7 w-auto object-contain" />
              <img src="/logos/enlaza.png" alt="Enlaza" className="h-7 w-auto object-contain" />
              <img src="/logos/biz_nation.png" alt="Biz Nation" className="h-7 w-auto object-contain" />
            </div>

            {/* Pie de página Legal */}
            <div className="text-center text-[8.5px] text-slate-500 pt-2 border-t border-slate-200 mt-2">
              <p>
                Documento Técnico Oficial Concertado • Sistema de Gestión de Formaciones Territoriales La Guajira 2026.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrintScheduleView;
