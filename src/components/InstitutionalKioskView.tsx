import React, { useState, useMemo } from 'react';
import { 
  TrainingSession, 
  InstitutionProfile, 
  Modality,
  ChangeRequest
} from '../types/schedule';
import { 
  Calendar as CalendarIcon, 
  ListOrdered, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  Laptop, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  FileSpreadsheet, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Info,
  CalendarDays,
  Wifi,
  Zap,
  HelpCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface InstitutionalKioskViewProps {
  institutionName: string;
  institutionProfile?: InstitutionProfile | null;
  sessions: TrainingSession[];
  onPrint: () => void;
  onExportExcel: () => void;
  onRequestReschedule?: (session: TrainingSession) => void;
  changeRequests?: ChangeRequest[];
}

const MONTHS_SPANISH = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS_HEADER = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Función para formatear fechas completas y legibles en español
export function formatFullDate(dateStr?: string, fallbackDays?: string[]): string {
  if (dateStr && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, monthIndex, day);
      const dayName = WEEKDAYS_HEADER[dateObj.getDay()];
      const monthName = MONTHS_SPANISH[monthIndex];
      return `${dayName}, ${day} de ${monthName} de ${year}`;
    }
  }
  if (fallbackDays && fallbackDays.length > 0) {
    return `${fallbackDays.join(', ')} (Programación semanal)`;
  }
  return 'Fecha por confirmar';
}

const SEMESTER_WEEKS = [
  { id: 'w1', label: 'Semana 1: 14 al 19 de Septiembre', start: '2026-09-14', end: '2026-09-19', month: 'Septiembre' },
  { id: 'w2', label: 'Semana 2: 21 al 26 de Septiembre', start: '2026-09-21', end: '2026-09-26', month: 'Septiembre' },
  { id: 'w3', label: 'Semana 3: 28 de Sep al 03 de Octubre', start: '2026-09-28', end: '2026-10-03', month: 'Octubre' },
  { id: 'w4', label: 'Semana 4: 05 al 10 de Octubre', start: '2026-10-05', end: '2026-10-10', month: 'Octubre' },
  { id: 'w5', label: 'Semana 5: 12 al 17 de Octubre', start: '2026-10-12', end: '2026-10-17', month: 'Octubre' },
  { id: 'w6', label: 'Semana 6: 19 al 24 de Octubre', start: '2026-10-19', end: '2026-10-24', month: 'Octubre' },
  { id: 'w7', label: 'Semana 7: 26 al 31 de Octubre', start: '2026-10-26', end: '2026-10-31', month: 'Octubre' },
  { id: 'w8', label: 'Semana 8: 02 al 07 de Noviembre', start: '2026-11-02', end: '2026-11-07', month: 'Noviembre' },
  { id: 'w9', label: 'Semana 9: 09 al 14 de Noviembre', start: '2026-11-09', end: '2026-11-14', month: 'Noviembre' },
  { id: 'w10', label: 'Semana 10: 16 al 21 de Noviembre', start: '2026-11-16', end: '2026-11-21', month: 'Noviembre' },
  { id: 'w11', label: 'Semana 11: 23 al 28 de Noviembre', start: '2026-11-23', end: '2026-11-28', month: 'Noviembre' }
];

export const InstitutionalKioskView: React.FC<InstitutionalKioskViewProps> = ({
  institutionName,
  institutionProfile,
  sessions,
  onPrint,
  onExportExcel,
  onRequestReschedule,
  changeRequests = []
}) => {
  const [viewFormat, setViewFormat] = useState<'list' | 'week' | 'calendar'>('week');

  const isUribia = (institutionProfile?.municipality || '').toLowerCase().includes('uribia') ||
    sessions.some(s => s.municipality === 'Uribia');

  // Solicitudes con respuesta para esta institución
  const myAnsweredRequests = useMemo(() => {
    return changeRequests.filter(r => 
      (r.institution.toLowerCase().includes(institutionName.toLowerCase()) || 
       institutionName.toLowerCase().includes(r.institution.toLowerCase())) &&
      (r.status === 'Aprobada' || r.status === 'Rechazada')
    );
  }, [changeRequests, institutionName]);

  // Solicitudes pendientes de respuesta para esta institución
  const myPendingRequests = useMemo(() => {
    return changeRequests.filter(r => 
      (r.institution.toLowerCase().includes(institutionName.toLowerCase()) || 
       institutionName.toLowerCase().includes(r.institution.toLowerCase())) &&
      r.status === 'Pendiente'
    );
  }, [changeRequests, institutionName]);

  // Filtros para la lista
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<'ALL' | 'september' | 'october' | 'november'>('ALL');
  const [selectedModality, setSelectedModality] = useState<'ALL' | Modality>('ALL');

  // Estado de vista semanal
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const [weekDisplayMode, setWeekDisplayMode] = useState<'byWeek' | 'recurring'>('byWeek');

  // Estado del calendario mensual
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(8); // 8 = Septiembre
  const [selectedSessionModal, setSelectedSessionModal] = useState<TrainingSession | null>(null);

  // Estadísticas clave de la institución
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalHours = sessions.reduce((acc, s) => acc + (s.durationHours || 0), 0);
    const presenciales = sessions.filter(s => s.modality === 'Presencial').length;
    const virtuales = sessions.filter(s => s.modality === 'Virtual').length;
    const estudiantes = sessions.filter(s => s.targetAudience.includes('Estudiantes')).length;
    const docentes = sessions.filter(s => s.targetAudience.includes('Docentes')).length;

    return { totalSessions, totalHours, presenciales, virtuales, estudiantes, docentes };
  }, [sessions]);

  // Sesiones filtradas para la lista
  const filteredListSessions = useMemo(() => {
    return sessions.filter(s => {
      // Búsqueda por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesTitle = s.trainingType.toLowerCase().includes(q);
        const matchesAudience = s.targetAudience.toLowerCase().includes(q);
        const matchesGrade = (s.gradeOrCycle || '').toLowerCase().includes(q);
        const matchesObs = (s.observations || '').toLowerCase().includes(q);
        const matchesCampus = (s.campus || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesAudience && !matchesGrade && !matchesObs && !matchesCampus) {
          return false;
        }
      }

      // Filtro por modalidad
      if (selectedModality !== 'ALL' && s.modality !== selectedModality) {
        return false;
      }

      // Filtro por mes
      if (selectedMonth !== 'ALL') {
        const hasDateInMonth = s.datesScheduled && s.datesScheduled[selectedMonth] && s.datesScheduled[selectedMonth]!.length > 0;
        const matchesSpecificDateMonth = s.specificDate && (
          (selectedMonth === 'september' && s.specificDate.includes('-09-')) ||
          (selectedMonth === 'october' && s.specificDate.includes('-10-')) ||
          (selectedMonth === 'november' && s.specificDate.includes('-11-'))
        );
        if (!hasDateInMonth && !matchesSpecificDateMonth) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, searchTerm, selectedModality, selectedMonth]);

  // Sesiones para una fecha específica en el calendario
  const getSessionsForDate = (dateStr: string, dayOfWeekName: string, dayNumber: number) => {
    return sessions.filter(s => {
      if (s.specificDate && s.specificDate === dateStr) {
        return true;
      }
      const mName = calMonth === 8 ? 'september' : calMonth === 9 ? 'october' : calMonth === 10 ? 'november' : null;
      if (mName && s.datesScheduled?.[mName as keyof typeof s.datesScheduled]?.length) {
        const scheduledList = s.datesScheduled[mName as keyof typeof s.datesScheduled] || [];
        const hasDay = scheduledList.some(item => {
          const numMatch = item.match(/\d+/);
          return numMatch && parseInt(numMatch[0], 10) === dayNumber;
        });
        if (hasDay) return true;
        return false;
      }
      if (s.specificDate && s.specificDate !== dateStr) {
        return false;
      }
      return Array.isArray(s.daysOfWeek) && s.daysOfWeek.includes(dayOfWeekName);
    });
  };

  // Cálculo de fechas para la Vista Semanal
  const currentWeek = SEMESTER_WEEKS[selectedWeekIdx] || SEMESTER_WEEKS[0];

  const weekDays = useMemo(() => {
    const parts = currentWeek.start.split('-').map(Number);
    const startDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return dayNames.map((dayName, idx) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + idx);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;
      return {
        dayName,
        dateStr,
        dayNumber: d.getDate(),
        monthName: MONTHS_SPANISH[d.getMonth()]
      };
    });
  }, [currentWeek]);

  const getSessionsForWeekDay = (dayName: string, dateStr: string) => {
    return sessions.filter(s => {
      if (weekDisplayMode === 'recurring') {
        return Array.isArray(s.daysOfWeek) && s.daysOfWeek.includes(dayName);
      }
      // Modo 'byWeek': coincidencia con fecha exacta
      if (s.specificDate === dateStr || s.date === dateStr) return true;
      if (s.specificDates && s.specificDates.includes(dateStr)) return true;
      if (s.datesScheduled) {
        if (dateStr.includes('-09-') && s.datesScheduled.september?.includes(dateStr)) return true;
        if (dateStr.includes('-10-') && s.datesScheduled.october?.includes(dateStr)) return true;
        if (dateStr.includes('-11-') && s.datesScheduled.november?.includes(dateStr)) return true;
      }
      // Si la sesión no tiene fecha específica pero coincide el día de la semana recurrente
      if (!s.specificDate && Array.isArray(s.daysOfWeek) && s.daysOfWeek.includes(dayName)) {
        return true;
      }
      return false;
    });
  };

  // Cálculos matemáticos del calendario
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
  const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  return (
    <div className="space-y-6">
      {/* Banner de Solicitudes Pendientes (En Evaluación por Coordinador) */}
      {myPendingRequests.length > 0 && (
        <div id="pending-reschedule-banner" className="space-y-2">
          {myPendingRequests.map(req => (
            <div 
              key={`pending-notif-${req.id}`}
              className="p-4 rounded-2xl border bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl mt-0.5 shrink-0 bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-xs uppercase tracking-wide">
                      Solicitud de Reprogramación Recibida
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700">
                      ⏳ En revisión por Coordinación
                    </span>
                  </div>
                  <p className="text-xs mt-1 font-medium text-slate-700 dark:text-slate-300">
                    Su petición de cambio de fecha para el <strong>{req.proposedDate} ({req.proposedStartTime} - {req.proposedEndTime})</strong> fue remitida exitosamente al Coordinador General. Tan pronto sea revisada y aprobada de acuerdo con los cupos en campo, los cambios se verán reflejados en este cronograma.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    Motivo registrado: "{req.reason}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner de Notificación de Solicitudes Respondidas por el Coordinador */}
      {myAnsweredRequests.length > 0 && (
        <div id="reschedule-notifications-banner" className="space-y-2">
          {myAnsweredRequests.map(req => {
            const isApproved = req.status === 'Aprobada';
            return (
              <div 
                key={`notification-${req.id}`}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  isApproved 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200' 
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    isApproved ? 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                  }`}>
                    {isApproved ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs uppercase tracking-wide">
                        Respuesta de Coordinación: Solicitud {req.status}
                      </span>
                      <span className="text-[11px] opacity-75">
                        (Propuesta para el {req.proposedDate})
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 font-medium">
                      {isApproved 
                        ? `Su cambio de fecha al ${req.proposedDate} (${req.proposedStartTime} - ${req.proposedEndTime}) ha sido APROBADO e incorporado al cronograma oficial.`
                        : `Su solicitud de reprogramación para el ${req.proposedDate} fue RECHAZADA.`}
                    </p>
                    {req.coordinatorFeedback && (
                      <div className="mt-1.5 text-xs italic bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-black/10 dark:border-white/10 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span><strong>Nota del Coordinador:</strong> "{req.coordinatorFeedback}"</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Tarjeta de Presentación Institucional y Metadatos */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-400/30">
                <Building2 className="w-3.5 h-3.5" />
                Consulta Oficial Institucional
              </span>
              {institutionProfile?.daneCode && (
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs rounded-full border border-slate-200 dark:border-slate-700">
                  DANE: {institutionProfile.daneCode}
                </span>
              )}
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                Vigencia 2026
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {institutionProfile?.name || institutionName}
            </h1>

            {/* Fila de Datos Clave: Municipio, Sede, Jornada */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Municipio: <strong>{institutionProfile?.municipality || 'La Guajira'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Sede(s): <strong>{institutionProfile?.campuses?.join(', ') || 'Sede Principal'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Jornada: <strong>{institutionProfile?.shifts?.join(' / ') || 'Jornada Mañana'}</strong></span>
              </div>
              {institutionProfile?.infrastructure && (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                  {institutionProfile.infrastructure.hasInternet && (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400" title="Cuenta con conexión a internet">
                      <Wifi className="w-3.5 h-3.5" /> Conectividad
                    </span>
                  )}
                  {institutionProfile.infrastructure.hasPower && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Fluido eléctrico disponible">
                      <Zap className="w-3.5 h-3.5" /> Energía
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Resumen Rápido de Formación para el Rector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shrink-0">
            <div className="text-center px-3 py-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Sesiones
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {stats.totalSessions}
              </span>
            </div>
            <div className="text-center px-3 py-1 border-x border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Horas
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.totalHours}h
              </span>
            </div>
            <div className="text-center px-3 py-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Presenciales
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.presenciales}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Selector de Formato: [📋 Lista Detallada] | [📅 Vista Semanal] | [🗓️ Calendario Mensual] */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            id="btn-kiosk-view-list"
            type="button"
            onClick={() => setViewFormat('list')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              viewFormat === 'list'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>📋 Lista Detallada</span>
          </button>
          <button
            id="btn-kiosk-view-week"
            type="button"
            onClick={() => setViewFormat('week')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              viewFormat === 'week'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>📅 Vista Semanal</span>
          </button>
          <button
            id="btn-kiosk-view-calendar"
            type="button"
            onClick={() => setViewFormat('calendar')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              viewFormat === 'calendar'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>🗓️ Calendario Mensual</span>
          </button>
        </div>

        {/* Acciones Secundarias Rápidas de la Vista */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* 3. VISTA 1: LISTA DETALLADA DE SESIONES */}
      {viewFormat === 'list' && (
        <div className="space-y-4">
          {/* Barra de Filtros Amigables */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por tema, grado, salón o módulo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro por Mes */}
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="ALL">🗓️ Todos los Meses</option>
                <option value="september">Septiembre 2026</option>
                <option value="october">Octubre 2026</option>
                <option value="november">Noviembre 2026</option>
              </select>

              {/* Filtro por Modalidad */}
              <select
                value={selectedModality}
                onChange={e => setSelectedModality(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="ALL">🏛️ Todas las Modalidades</option>
                <option value="Presencial">🏛️ Presencial en Sede</option>
                <option value="Virtual">💻 Virtual Sincrónica</option>
                <option value="Microlearning">📱 Microlearning</option>
              </select>
            </div>
          </div>

          {/* Tarjetas de Sesión Detalladas */}
          {filteredListSessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No se encontraron formaciones con los filtros seleccionados
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMonth('ALL');
                  setSelectedModality('ALL');
                }}
                className="text-xs text-amber-600 dark:text-amber-400 font-bold underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredListSessions.map((session, index) => {
                const isPresencial = session.modality === 'Presencial';
                const isVirtual = session.modality === 'Virtual';

                return (
                  <div
                    key={session.id || index}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 transition-all p-5 sm:p-6 shadow-xs space-y-4"
                  >
                    {/* Encabezado de Sesión */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                          #{session.itemNumber || index + 1}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isPresencial
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : isVirtual
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {isPresencial ? '🏛️ Presencial en Sede' : isVirtual ? '💻 Virtual' : '📱 Microlearning'}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700">
                          {session.targetAudience}
                        </span>
                        {session.gradeOrCycle && (
                          <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full border border-purple-200 dark:border-purple-800">
                            {session.gradeOrCycle}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Estado: <strong className="text-slate-800 dark:text-slate-200">{session.status || 'APROBADO'}</strong></span>
                      </div>
                    </div>

                    {/* Contenido Principal de la Formación */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Columna 1: Tema y Horario */}
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                          {session.trainingType}
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {/* Fecha Exacta */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                              Fecha Programada
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              {formatFullDate(session.specificDate, session.daysOfWeek)}
                            </span>
                            {/* Días adicionales en el mes si existen */}
                            {session.datesScheduled && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {session.datesScheduled.september && session.datesScheduled.september.length > 0 && (
                                  <div>Septiembre: {session.datesScheduled.september.join(', ')}</div>
                                )}
                                {session.datesScheduled.october && session.datesScheduled.october.length > 0 && (
                                  <div>Octubre: {session.datesScheduled.october.join(', ')}</div>
                                )}
                                {session.datesScheduled.november && session.datesScheduled.november.length > 0 && (
                                  <div>Noviembre: {session.datesScheduled.november.join(', ')}</div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Horario y Duración */}
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                              Horario y Duración
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              {session.startTime} a {session.endTime} ({session.durationHours} horas)
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                              Frecuencia: {session.frequency || 'Quincenal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Columna 2: Logística y Observaciones en Sede */}
                      <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-400 block">
                            🏛️ Logística en su Colegio
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            {session.observations || 'Espacio académico estándar con sillas y ventilación adecuada.'}
                          </p>
                          {session.campus && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                              <strong>Sede requerida:</strong> {session.campus}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-2 border-t border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Operado por: <strong>{session.responsible || 'The Biz Nation'}</strong></span>
                          {isUribia && isPresencial && onRequestReschedule && (
                            <button
                              type="button"
                              onClick={() => onRequestReschedule(session)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                              title="Solicitar reprogramación de fecha para esta clase presencial"
                            >
                              <span>📅 Solicitar Cambio de Fecha</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. VISTA SEMANAL */}
      {viewFormat === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6">
          {/* Barra de Controles de la Vista Semanal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {/* Navegador de Semana */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedWeekIdx === 0}
                onClick={() => setSelectedWeekIdx(prev => Math.max(0, prev - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Semana anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <select
                  value={selectedWeekIdx}
                  onChange={(e) => setSelectedWeekIdx(Number(e.target.value))}
                  className="bg-transparent font-black text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {SEMESTER_WEEKS.map((w, idx) => (
                    <option key={w.id} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {w.label} ({w.month})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={selectedWeekIdx === SEMESTER_WEEKS.length - 1}
                onClick={() => setSelectedWeekIdx(prev => Math.min(SEMESTER_WEEKS.length - 1, prev + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                title="Semana siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Modo: Por Fechas de Semana vs Distribución Semanal Recurrente */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setWeekDisplayMode('byWeek')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  weekDisplayMode === 'byWeek'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Por Fechas del Calendario
              </button>
              <button
                type="button"
                onClick={() => setWeekDisplayMode('recurring')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  weekDisplayMode === 'recurring'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Distribución Semanal General
              </button>
            </div>
          </div>

          {/* Grilla Semanal: Lunes a Sábado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {weekDays.map(dayInfo => {
              const daySessions = getSessionsForWeekDay(dayInfo.dayName, dayInfo.dateStr);

              return (
                <div
                  key={dayInfo.dayName}
                  className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden flex flex-col min-h-[260px]"
                >
                  {/* Encabezado del Día */}
                  <div className={`p-3 border-b flex items-center justify-between ${
                    dayInfo.dayName === 'Sábado'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40'
                      : daySessions.length > 0
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30'
                      : 'bg-slate-100/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60'
                  }`}>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {dayInfo.dayName}
                      </span>
                      {weekDisplayMode === 'byWeek' && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {dayInfo.dayNumber} de {dayInfo.monthName}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      daySessions.length > 0 
                        ? 'bg-amber-400 text-slate-950 shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {daySessions.length} {daySessions.length === 1 ? 'sesión' : 'sesiones'}
                    </span>
                  </div>

                  {/* Lista de Sesiones para este día */}
                  <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                    {daySessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-8 text-center">
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                          Sin actividades
                        </span>
                      </div>
                    ) : (
                      daySessions.map(sess => (
                        <div
                          key={sess.id}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500 shadow-xs transition space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                sess.modality === 'Presencial'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                              }`}>
                                {sess.modality === 'Presencial' ? '🏛️ Presencial' : '💻 Virtual'}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                                {sess.status || 'APROBADO'}
                              </span>
                            </div>

                            <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                              {sess.topic || sess.trainingType}
                            </h4>

                            {sess.topic && sess.topic !== sess.trainingType && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                                {sess.trainingType}
                              </p>
                            )}

                            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 pt-0.5">
                              <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                                <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>{sess.startTime} - {sess.endTime} ({sess.durationHours}h)</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px]">
                                <Users className="w-3 h-3 text-blue-500 shrink-0" />
                                <span className="truncate">{sess.targetAudience} {sess.gradeOrCycle ? `(${sess.gradeOrCycle})` : ''}</span>
                              </div>
                              {sess.campus && (
                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px]">
                                  <Building2 className="w-3 h-3 text-purple-500 shrink-0" />
                                  <span className="truncate">{sess.campus}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedSessionModal(sess)}
                              className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer"
                            >
                              👁️ Detalle
                            </button>
                            {isUribia && sess.modality === 'Presencial' && onRequestReschedule && (
                              <button
                                type="button"
                                onClick={() => onRequestReschedule(sess)}
                                className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-bold rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                                title="Solicitar reprogramación"
                              >
                                📅 Reprogramar
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VISTA 2: VISTA CALENDARIO MENSUAL */}
      {viewFormat === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          {/* Navegador de Meses */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {MONTHS_SPANISH[calMonth]} {calYear}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formaciones concertadas para {institutionProfile?.shortName || institutionName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear(calYear - 1);
                  } else {
                    setCalMonth(calMonth - 1);
                  }
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Mes Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Botones de Meses Rápidos del Programa */}
              <button
                type="button"
                onClick={() => { setCalYear(2026); setCalMonth(8); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  calMonth === 8 ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Septiembre
              </button>
              <button
                type="button"
                onClick={() => { setCalYear(2026); setCalMonth(9); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  calMonth === 9 ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Octubre
              </button>
              <button
                type="button"
                onClick={() => { setCalYear(2026); setCalMonth(10); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  calMonth === 10 ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Noviembre
              </button>

              <button
                type="button"
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear(calYear + 1);
                  } else {
                    setCalMonth(calMonth + 1);
                  }
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Mes Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grilla de Días de la Semana */}
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS_HEADER.map(dayName => (
              <div key={dayName} className="text-center font-bold text-xs uppercase tracking-wider py-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                {dayName.substring(0, 3)}
              </div>
            ))}

            {/* Días del mes previo vacíos */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[90px] p-2 bg-slate-50/40 dark:bg-slate-900/30 rounded-xl border border-transparent text-slate-300 dark:text-slate-700 text-xs font-bold">
                {prevMonthDays - firstDayIndex + idx + 1}
              </div>
            ))}

            {/* Días del mes activo */}
            {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayDate = new Date(calYear, calMonth, dayNum);
              const dayOfWeek = WEEKDAYS_HEADER[dayDate.getDay()];
              const daySessions = getSessionsForDate(dateStr, dayOfWeek, dayNum);
              const hasSessions = daySessions.length > 0;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[90px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    hasSessions
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-600/40 shadow-xs'
                      : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      hasSessions ? 'text-amber-900 dark:text-amber-300 font-black' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {dayNum}
                    </span>
                    {hasSessions && (
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </div>

                  {/* Badges de sesiones en el día */}
                  <div className="space-y-1 my-1">
                    {daySessions.map((sess, sIdx) => {
                      const isPres = sess.modality === 'Presencial';
                      return (
                        <button
                          key={sess.id || sIdx}
                          type="button"
                          onClick={() => setSelectedSessionModal(sess)}
                          className={`w-full text-left p-1 rounded-md text-[10px] font-bold truncate transition cursor-pointer border ${
                            isPres
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800 hover:bg-blue-200'
                          }`}
                          title={`${sess.trainingType} (${sess.startTime} - ${sess.endTime})`}
                        >
                          {isPres ? '🏛️' : '💻'} {sess.trainingType}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[9px] text-right text-slate-400">
                    {hasSessions ? `${daySessions.length} ses.` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Detalle Completo de Sesión al hacer clic en el Calendario */}
      {selectedSessionModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Detalle Oficial de la Formación
              </span>
              <button
                type="button"
                onClick={() => setSelectedSessionModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    selectedSessionModal.modality === 'Presencial'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  }`}>
                    {selectedSessionModal.modality === 'Presencial' ? '🏛️ Presencial en Sede' : '💻 Formación Virtual'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                    {selectedSessionModal.status || 'APROBADO'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {selectedSessionModal.topic || selectedSessionModal.trainingType}
                </h3>
                {selectedSessionModal.topic && selectedSessionModal.topic !== selectedSessionModal.trainingType && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                    {selectedSessionModal.trainingType}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 sm:col-span-2">
                  <CalendarDays className="w-4 h-4 text-amber-500 shrink-0" />
                  <span><strong>Fecha Programada:</strong> {formatFullDate(selectedSessionModal.specificDate, selectedSessionModal.daysOfWeek)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Horario:</strong> {selectedSessionModal.startTime} - {selectedSessionModal.endTime} ({selectedSessionModal.durationHours}h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>Sede:</strong> {selectedSessionModal.campus || 'Sede Principal'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500 shrink-0" />
                  <span><strong>Población:</strong> {selectedSessionModal.targetAudience} {selectedSessionModal.gradeOrCycle ? `(${selectedSessionModal.gradeOrCycle})` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span><strong>Jornada:</strong> {selectedSessionModal.academicShift || 'Jornada Mañana'}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                  <span><strong>Entidad Responsable:</strong> {selectedSessionModal.responsible || 'The Biz Nation'}</span>
                </div>
              </div>

              {selectedSessionModal.observations && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/40 text-xs">
                  <span className="font-bold text-amber-950 dark:text-amber-200 block mb-1">Observaciones y Requerimientos:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedSessionModal.observations}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between">
              {isUribia && selectedSessionModal.modality === 'Presencial' && onRequestReschedule ? (
                <button
                  type="button"
                  onClick={() => {
                    const s = selectedSessionModal;
                    setSelectedSessionModal(null);
                    onRequestReschedule(s);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span>📅 Solicitar Cambio de Fecha</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setSelectedSessionModal(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
