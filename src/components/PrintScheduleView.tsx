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
  sessions: TrainingSession[]; // filteredSessions from App.tsx
  allSessions?: TrainingSession[];
  branding: BrandingSettings;
  selectedInstitution?: string;
  selectedMunicipality?: string;
  selectedModality?: string;
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

export const PrintScheduleView: React.FC<PrintScheduleViewProps> = ({
  sessions,
  branding,
  selectedInstitution = 'all',
  selectedMunicipality = 'all',
  selectedModality = 'all',
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

  // Determinar institución única para el título
  const activeInstitution = restrictedInstName || (selectedInstitution !== 'all' ? selectedInstitution : null);

  const docTitle = activeInstitution
    ? `CRONOGRAMA OFICIAL CONCERTADO — ${activeInstitution.toUpperCase()}`
    : `CRONOGRAMA OFICIAL CONCERTADO — TODAS LAS INSTITUCIONES (12 SEDES)`;

  const scopeLabel = activeInstitution
    ? activeInstitution
    : selectedMunicipality !== 'all'
    ? `Municipio de ${selectedMunicipality}`
    : 'Todas las Instituciones (12 Sedes Territoriales: Uribia, Riohacha, Manaure)';

  // Métricas dinámicas calculadas sobre las sesiones recibidas
  const kpis = useMemo(() => {
    const total = sessions.length;
    const presencial = sessions.filter(s => s.modality === 'Presencial').length;
    const virtual = sessions.filter(s => s.modality === 'Virtual').length;
    const approved = sessions.filter(s => getExportSessionStatus(s) === 'APROBADO').length;
    const pct = total > 0 ? Math.round((approved / total) * 100) : 100;
    return { total, presencial, virtual, approved, pct };
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

      {/* Contenedor Imprimible Oficial (Renderizado en pantalla y para PDF) */}
      <div 
        id="printable-official-document"
        className="max-w-[1280px] mx-auto p-6 md:p-8 bg-white text-slate-900 print:p-0 print:m-0 print:max-w-none"
      >
        {/* ========================================================================= */}
        {/* 1. MEMBRETE OFICIAL SUPERIOR */}
        {/* ========================================================================= */}
        {sectionsConfig.header && (
          <div className="border-b-2 border-slate-900 pb-3 mb-5 print-header">
            <div className="flex items-center justify-between w-full gap-4">
              {/* Columna izquierda: Logo Legado Oficial */}
              <div className="w-44 sm:w-52 shrink-0 flex items-center justify-start">
                <img
                  src="/logos/legado.png"
                  alt="Legado para los Territorios"
                  className="h-14 sm:h-16 w-auto object-contain max-w-full filter invert contrast-200"
                />
              </div>

              {/* Columna central: Título Institucional y Alianza */}
              <div className="flex-1 text-center min-w-0 px-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 block truncate">
                  GRUPO ENERGÍA BOGOTÁ • ACDI/VOCA • FUNDACIÓN PROMIGAS • ENLAZA • THE BIZ NATION
                </span>
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-950 uppercase tracking-tight leading-tight mt-0.5">
                  {branding.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA'}
                </h1>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {branding.programSubtitle || 'Cronograma Oficial Concertado de Formaciones'}
                </p>
                <div className="text-[9.5px] text-slate-600 mt-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3 font-medium">
                  <span><strong>Alcance:</strong> {scopeLabel}</span>
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
        {/* 2. MÉTRICAS OFICIALES DE AVANCE Y TOTALES (DASHBOARD) */}
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
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block">Aprobadas</span>
              <span className="text-base font-black text-amber-800 mt-0.5 block">{kpis.approved} ({kpis.pct}%)</span>
              <span className="text-[8px] text-amber-600 font-medium">Validación Técnica</span>
            </div>
          </div>
        )}

        {/* Título de Sección del Documento */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-1.5">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-900">
            {docTitle}
          </h2>
          <span className="text-[10px] text-slate-600 font-bold">
            Total Registros: {sessions.length}
          </span>
        </div>

        {/* ========================================================================= */}
        {/* 3. GRILLA CRONOLÓGICA OFICIAL DE FORMACIÓN (100% DINÁMICA) */}
        {/* ========================================================================= */}
        {sectionsConfig.scheduleGrid && (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                  <th className="p-1.5 border-r border-slate-700 text-center w-8">#</th>
                  <th className="p-1.5 border-r border-slate-700 w-16">Municipio</th>
                  <th className="p-1.5 border-r border-slate-700 min-w-[140px]">Institución / Sede</th>
                  <th className="p-1.5 border-r border-slate-700 w-24">Fecha Real</th>
                  <th className="p-1.5 border-r border-slate-700 w-20">Jornada</th>
                  <th className="p-1.5 border-r border-slate-700 w-24">Audiencia / Formación</th>
                  <th className="p-1.5 border-r border-slate-700 w-16 text-center">Modalidad</th>
                  <th className="p-1.5 border-r border-slate-700 w-20 text-center">Estado</th>
                  <th className="p-1.5 border-r border-slate-700 w-24">Horario</th>
                  <th className="p-1.5 min-w-[150px]">Observaciones y Condiciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-4 text-center text-slate-500 font-semibold">
                      No hay sesiones para mostrar con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session, idx) => {
                    const effectiveStatus = getExportSessionStatus(session);
                    const isApproved = effectiveStatus === 'APROBADO';
                    const executionDate = session.specificDate || session.date || '2026-09-15';

                    return (
                      <tr key={session.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="p-1.5 border-r border-slate-200 text-center font-bold text-slate-600">
                          {session.itemNumber || idx + 1}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-800">
                          {session.municipality}
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <div className="font-bold text-slate-900 leading-tight">{session.institution}</div>
                          {session.campus && session.campus !== session.institution && (
                            <div className="text-[9px] text-slate-500 font-medium">Sede: {session.campus}</div>
                          )}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-900">
                          <div>{executionDate}</div>
                          <div className="text-[8.5px] text-slate-500 font-normal">
                            {session.daysOfWeek && session.daysOfWeek.length > 0 ? session.daysOfWeek.join(', ') : 'Día programado'}
                          </div>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-slate-700">
                          {session.academicShift}
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <div className="font-semibold text-slate-800">
                            {Array.isArray(session.targetAudience) ? session.targetAudience.join(', ') : session.targetAudience}
                          </div>
                          <div className="text-[9px] text-slate-500">{session.trainingType}</div>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-center font-semibold">
                          <span className={session.modality === 'Presencial' ? 'text-emerald-800 font-bold' : 'text-blue-800 font-bold'}>
                            {session.modality}
                          </span>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black tracking-wide border ${
                            isApproved 
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                              : effectiveStatus === 'Programada'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {effectiveStatus}
                          </span>
                        </td>
                        <td className="p-1.5 border-r border-slate-200 font-semibold">
                          <div>{session.startTime} - {session.endTime}</div>
                          <span className="text-[9px] text-slate-500 block font-normal">({session.durationHours}h)</span>
                        </td>
                        <td className="p-1.5 text-slate-600 text-[9px] leading-tight">
                          <p>{session.observations}</p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BLOQUE DE FIRMAS DE VALIDACIÓN TÉCNICA */}
        {/* ========================================================================= */}
        {sectionsConfig.signatureBlock && (
          <div className="grid grid-cols-2 gap-8 pt-4 pb-4 border-t border-slate-300 mt-6 print-signatures">
            <div className="text-center">
              <div className="h-10 border-b border-slate-400 mx-auto w-48 mb-1"></div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">
                {branding.coordinatorName || 'Pompilio Camargo'}
              </p>
              <p className="text-[8.5px] text-slate-600">
                {branding.coordinatorRole || 'Coordinador del Programa'}
              </p>
              <p className="text-[8px] text-slate-500">The Biz Nation</p>
            </div>

            <div className="text-center">
              <div className="h-10 border-b border-slate-400 mx-auto w-48 mb-1"></div>
              <p className="text-[10px] font-bold text-slate-900 uppercase">
                {branding.engineerName || 'Luis Ángel Camargo'}
              </p>
              <p className="text-[8.5px] text-slate-600">
                {branding.engineerRole || 'Ingeniero de Sistemas e Infraestructura'}
              </p>
              <p className="text-[8px] text-slate-500">The Biz Nation</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. LOGOS OFICIALES DE ALIADOS EN EL PIE DE PÁGINA */}
        {/* ========================================================================= */}
        {sectionsConfig.alliesLogos && (
          <div className="border-t-2 border-slate-900 pt-3 mt-4 print-footer">
            <div className="text-center mb-2">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                Alianza Estratégica Interinstitucional para el Desarrollo Territorial
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 px-2">
              <div className="flex items-center justify-center flex-1 h-10 max-w-[130px]">
                <img
                  src={branding.logo2Url || '/logos/grupo_energia_bogota.png'}
                  alt="Grupo Energía Bogotá"
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center flex-1 h-10 max-w-[130px]">
                <img
                  src={branding.logo3Url || '/logos/acdi.png'}
                  alt="ACDI / VOCA"
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center flex-1 h-10 max-w-[130px]">
                <img
                  src={branding.logo4Url || '/logos/promigas.png'}
                  alt="Fundación Promigas"
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center flex-1 h-10 max-w-[130px]">
                <img
                  src={branding.logo5Url || '/logos/enlaza.png'}
                  alt="Enlaza Grupo Energía Bogotá"
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center flex-1 h-10 max-w-[130px]">
                <img
                  src={branding.logo6Url || '/logos/biz_nation.png'}
                  alt="The Biz Nation"
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. PIE DE PÁGINA LEGAL */}
        {/* ========================================================================= */}
        {sectionsConfig.footer && (
          <div className="text-center text-[8px] text-slate-500 pt-2 border-t border-slate-200 mt-2">
            <p>
              Documento Técnico Oficial Concertado • Sistema de Gestión de Formaciones Territoriales La Guajira 2026.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintScheduleView;
