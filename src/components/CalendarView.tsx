import React, { useState, useMemo } from 'react';
import { TrainingSession, Municipality, Modality, InstitutionProfile } from '../types/schedule';
import { deduplicateSessions } from '../App';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Filter, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  BookOpen,
  Eye,
  Info
} from 'lucide-react';
import { SessionDetailModal } from './SessionDetailModal';

interface CalendarViewProps {
  sessions: TrainingSession[];
  setSessions?: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
  institutions?: InstitutionProfile[];
  onEditSession: (session: TrainingSession) => void;
  onAddSessionForDate: (dateStr: string) => void;
  onDeleteSession: (id: string) => void;
  onDuplicateSession: (session: TrainingSession) => void;
  onRequestReschedule?: (session: TrainingSession) => void;
  onExportExcel?: () => void;
  onExportCSV?: () => void;
  onExportHTML?: () => void;
  onPrint?: () => void;
  sessionRole?: 'admin' | 'viewer';
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_HEADER = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  setSessions,
  institutions = [],
  onEditSession,
  onAddSessionForDate,
  onDeleteSession,
  onDuplicateSession,
  onRequestReschedule,
  onExportExcel,
  onExportCSV,
  onExportHTML,
  onPrint,
  sessionRole = 'viewer'
}) => {
  const isAdmin = sessionRole === 'admin';
  // Calendar date state: starts on Septiembre 2026 as per user requirement
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = Septiembre (0-indexed)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Institution filter state
  const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>('all');

  // Filters
  const [filterMuni, setFilterMuni] = useState<string>('ALL');
  const [filterMod, setFilterMod] = useState<string>('ALL');
  const [filterPob, setFilterPob] = useState<string>('ALL');

  // Selected session for detail modal
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<TrainingSession | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToSept2026 = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      let match = true;

      if (selectedInstitutionFilter !== 'all') {
        // Comparar nombre de institución
        match = match && (s.institution === selectedInstitutionFilter || (s.campus && s.campus.includes(selectedInstitutionFilter)));
      }

      if (filterMuni !== 'ALL' && s.municipality.toUpperCase() !== filterMuni.toUpperCase()) match = false;
      if (filterMod !== 'ALL' && s.modality !== filterMod) match = false;
      if (filterPob !== 'ALL') {
        if (filterPob === 'Docentes' && !s.targetAudience.includes('Docentes')) match = false;
        if (filterPob === 'Estudiantes' && !s.targetAudience.includes('Estudiantes')) match = false;
      }
      return match;
    });
  }, [sessions, selectedInstitutionFilter, filterMuni, filterMod, filterPob]);

  // Map sessions to dates in the active month
  // A session matches a date if:
  // 0. session.specificDates includes dateStr
  // 1. session.specificDate === dateStr
  // 2. OR session.datesScheduled[monthName] includes this day number
  // 3. OR (if no specificDate or datesScheduled) session.daysOfWeek matches the day of week
  const getSessionsForDate = (dateStr: string, dayOfWeekName: string, dayNumber: number) => {
    return filteredSessions.filter(s => {
      // 0. Direct match in specificDates array
      if (s.specificDates && Array.isArray(s.specificDates) && s.specificDates.length > 0) {
        return s.specificDates.includes(dateStr);
      }
      // 1. Direct match on specific date
      if (s.specificDate && s.specificDate === dateStr) {
        return true;
      }
      // 2. Check datesScheduled for current month
      const mName = currentMonth === 8 ? 'september' : currentMonth === 9 ? 'october' : currentMonth === 10 ? 'november' : currentMonth === 11 ? 'december' : null;
      if (mName && s.datesScheduled?.[mName as keyof typeof s.datesScheduled]?.length) {
        const scheduledList = s.datesScheduled[mName as keyof typeof s.datesScheduled] || [];
        const hasDay = scheduledList.some(item => {
          const numMatch = item.match(/\d+/);
          return numMatch && parseInt(numMatch[0]) === dayNumber;
        });
        if (hasDay) return true;
        // If explicit scheduled dates are defined for this month and didn't match, don't fall back to daysOfWeek
        return false;
      }
      // 3. If it has a specific date elsewhere in this month, don't show on other days
      if (s.specificDate && s.specificDate !== dateStr) {
        return false;
      }
      // Fallback: match day of week if within the active year/month
      return Array.isArray(s.daysOfWeek) && s.daysOfWeek.includes(dayOfWeekName);
    });
  };

  // Calendar math
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  return (
    <div className="space-y-4">
      {/* Top Banner & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-xl transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Title & Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                  Calendario de Operaciones
                </h1>
                <span className="bg-amber-400/20 text-amber-800 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded border border-amber-400/40">
                  The Biz Nation
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Haz clic en cualquier día o en el botón <strong className="text-amber-600 dark:text-amber-400">+</strong> para programar; haz clic en una sesión para ver sus detalles.
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAddSessionForDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
              title="Programar una nueva formación"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Sesión</span>
            </button>

            {onExportHTML && (
              <button
                onClick={onExportHTML}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 hover:text-slate-900 dark:hover:text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition"
                title="Descargar archivo HTML interactivo para abrir sin internet"
              >
                <Download className="w-4 h-4" />
                <span>Descargar HTML</span>
              </button>
            )}

            {(onExportExcel || onExportCSV) && (
              <button
                onClick={onExportExcel || onExportCSV}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition"
                title="Descargar a Excel (.xlsx) con formato de celdas y estilos"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Descargar Excel</span>
              </button>
            )}

            {onPrint && (
              <button
                onClick={onPrint}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 hover:text-slate-900 dark:hover:text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition"
                title="Imprimir o guardar como PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Subheader: Filters & Stats */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Municipality Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Municipio</label>
              <select
                value={filterMuni}
                onChange={e => setFilterMuni(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Todos los municipios</option>
                <option value="URIBIA">Uribia</option>
                <option value="RIOHACHA">Riohacha</option>
                <option value="MANAURE">Manaure</option>
              </select>
            </div>

            {/* Institution Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Institución
              </label>
              <select
                value={selectedInstitutionFilter}
                onChange={(e) => setSelectedInstitutionFilter(e.target.value)}
                className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition cursor-pointer"
              >
                <option value="all">Todas las instituciones</option>
                {institutions.map((inst) => (
                  <option key={inst.id || inst.daneCode} value={inst.name}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Modality Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Modalidad</label>
              <select
                value={filterMod}
                onChange={e => setFilterMod(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Todas las modalidades</option>
                <option value="Presencial">Solo Presencial 🏛️</option>
                <option value="Virtual">Solo Virtual 💻</option>
                <option value="Microlearning">Solo Microlearning 📱</option>
              </select>
            </div>

            {/* Target Audience Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Población</label>
              <select
                value={filterPob}
                onChange={e => setFilterPob(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Toda la población</option>
                <option value="Docentes">Solo Docentes</option>
                <option value="Estudiantes">Solo Estudiantes</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Vista</label>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    viewMode === 'month' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    viewMode === 'week' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Semanal
                </button>
              </div>
            </div>
          </div>

          {/* Indicators & Constraints Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-600 dark:text-slate-300">Total Sesiones:</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">{filteredSessions.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/40 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Regla Uribia: <strong>Máx. 2 sedes presenciales/día</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* MONTH VIEW CONTAINER */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-2xl p-4 sm:p-5 text-slate-800 dark:text-white transition-colors">
          {/* Calendar Header with Month Navigation & Legend */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={prevMonth}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
                title="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white capitalize tracking-wide min-w-[200px]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
                title="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={goToSept2026}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition"
              >
                Ir a Sep 2026
              </button>
            </div>

            {/* Visual Color Legend */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/30 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Uribia
              </span>
              <span className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-500/30 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span> Riohacha
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Manaure
              </span>
              <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-500/30 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Virtual
              </span>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-t-xl">
            {DAYS_HEADER.map(day => (
              <div key={day} className="truncate px-1">{day}</div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 border-l border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 rounded-b-xl min-h-[560px]">
            {/* 1. Leading cells from previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[110px] p-2 bg-slate-100/50 dark:bg-slate-950/60 border-r border-b border-slate-200 dark:border-slate-800/40 opacity-40 text-xs text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                >
                  <span className="font-semibold">{dayNum}</span>
                </div>
              );
            })}

            {/* 2. Active month cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              const dayIndex = (firstDayOfWeek + i) % 7;
              const dayName = DAYS_HEADER[dayIndex];

              const daySessions = getSessionsForDate(dateStr, dayName, dayNumber);

              // Para cada día en la cuadrícula del calendario:
              const uribiaSessionsThisDay = daySessions.filter(s => 
                s.modality === 'Presencial' && 
                (s.municipality === 'Uribia' || s.institution?.toLowerCase().includes('uribia') || 
                 ['petsuapa', 'guarerapu', 'puay', 'walakaly', 'apaimana', 'jaipa', 'yotojoroin'].some(name => s.institution?.toLowerCase().includes(name)))
              );

              // Contar instituciones únicas (sedes físicas reales activas ese día)
              const uniqueUribiaSchools = Array.from(new Set(uribiaSessionsThisDay.map(s => s.institution?.trim()))).filter(Boolean);
              const uribiaCount = uniqueUribiaSchools.length;
              const isOvercapacity = uribiaCount > 2;

              const uniqueDaySessions = daySessions.filter((session, index, self) =>
                index === self.findIndex((s) => (s.id ? s.id === session.id : `${s.institution}-${s.date}-${s.startTime}-${s.topic}` === `${session.institution}-${session.date}-${session.startTime}-${session.topic}`))
              );

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={isAdmin ? () => onAddSessionForDate(dateStr) : undefined}
                  className={`min-h-[120px] p-2 border-r border-b border-slate-200 dark:border-slate-800/70 flex flex-col justify-between transition-colors ${
                    isAdmin ? 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 cursor-pointer group' : ''
                  } ${
                    isOvercapacity 
                      ? 'bg-rose-50/70 dark:bg-rose-950/20' 
                      : 'bg-white dark:bg-slate-900/50'
                  }`}
                >
                  {/* Top Day Header inside cell */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-black ${
                      dateStr === '2026-09-11'
                        ? 'bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Uribia Capacity Indicator Badge */}
                      {uribiaCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isOvercapacity ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}
                          title={`Uribia presencial hoy: ${uribiaCount}/2 sedes`}
                        >
                          U: {uribiaCount}/2
                        </span>
                      )}

                      {/* Quick Add Button (Solo Admin) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddSessionForDate(dateStr);
                          }}
                          className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title={`Programar sesión para el ${dayNumber} de ${MONTH_NAMES[currentMonth]}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Event Badges List inside cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5 scrollbar-thin">
                    {uniqueDaySessions.map(session => {
                      // Badge color styling based on Municipality & Modality
                      let badgeClasses = 'border-sky-500/40 bg-sky-950/60 text-sky-200 hover:border-sky-400';
                      if (session.municipality.toUpperCase() === 'URIBIA') {
                        badgeClasses = 'border-amber-500/40 bg-amber-950/60 text-amber-200 hover:border-amber-400';
                      } else if (session.municipality.toUpperCase() === 'MANAURE') {
                        badgeClasses = 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200 hover:border-emerald-400';
                      }
                      if (session.modality === 'Virtual') {
                        badgeClasses = 'border-purple-500/40 bg-purple-950/60 text-purple-200 hover:border-purple-400';
                      }

                      // Short display name
                      const shortInst = (session.institution || 'Formación')
                        .replace('Media Luna Jawou - Sede ', '')
                        .replace('Isidro Ibarra Fernández - Sede ', '')
                        .replace('I.E.I.R. Isidro Ibarra Fernández - Sede ', '')
                        .replace('I.E. ', '')
                        .replace('(Por concertar)', '*(Pdte)');

                      const tType = session.trainingType || '';

                      return (
                        <div
                          key={session.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSessionForDetail(session);
                          }}
                          className={`border ${badgeClasses} rounded-lg p-1 text-[10px] leading-tight hover:scale-[1.02] hover:brightness-110 transition cursor-pointer flex flex-col gap-0.5 shadow-xs`}
                          title="Haz clic para ver todos los detalles de esta sesión"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="truncate max-w-[95px]">{shortInst}</span>
                            <span className="text-[10px] opacity-90">{session.modality === 'Presencial' ? '🏛️' : '💻'}</span>
                          </div>
                          <div className="text-[9px] text-slate-300 truncate flex items-center justify-between">
                            <span>{session.startTime || ''}</span>
                            <span className="font-mono text-[8px] bg-black/40 px-1 rounded">
                              {tType.includes('Técnicas') || tType.includes('CT') ? 'CT' :
                               tType.includes('Blandas') || tType.includes('HB') ? 'HB' :
                               tType.includes('Docente') ? 'Doc' : 'Cap'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 3. Trailing cells to fill the 7-column grid */}
            {(() => {
              const totalRendered = firstDayOfWeek + daysInMonth;
              const nextMonthDays = (7 - (totalRendered % 7)) % 7;
              return Array.from({ length: nextMonthDays }).map((_, i) => (
                <div
                  key={`next-${i}`}
                  className="min-h-[110px] p-2 bg-slate-950/60 border-r border-b border-slate-800/40 opacity-30 text-xs text-slate-600 cursor-not-allowed select-none"
                >
                  <span className="font-semibold">{i + 1}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* WEEK VIEW CONTAINER */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-2xl p-4 sm:p-5 text-slate-800 dark:text-white transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Distribución Semanal de Actividades</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Visualización agrupada por día de la semana con validación de simultaneidad
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => {
              const daySessions = filteredSessions.filter(s => Array.isArray(s.daysOfWeek) && s.daysOfWeek.includes(day));
              const daySessionsUnique = deduplicateSessions(daySessions);
              const uribiaPresencials = daySessionsUnique.filter(
                s => (s.municipality || '').toUpperCase() === 'URIBIA' && s.modality === 'Presencial'
              );
              const uniqueInsts = Array.from(new Set(uribiaPresencials.map(s => s.institution || '')));
              const hasConflict = uniqueInsts.length > 2;

              return (
                <div
                  key={day}
                  className={`bg-slate-50 dark:bg-slate-800/70 rounded-xl border overflow-hidden flex flex-col ${
                    hasConflict ? 'border-rose-400 dark:border-rose-500/80 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Day Column Header */}
                  <div className={`p-3 border-b flex items-center justify-between ${
                    day === 'Sábado' ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-700/40' :
                    hasConflict ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-700/40' :
                    'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">{day}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {daySessionsUnique.length}
                      </span>
                    </div>

                    <button
                      onClick={() => onAddSessionForDate('2026-09-15')}
                      className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>

                  {/* Sessions in day */}
                  <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[350px]">
                    {daySessionsUnique.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
                        Sin formaciones programadas
                      </p>
                    ) : (
                      daySessionsUnique.map(session => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSessionForDetail(session)}
                          className="p-2.5 bg-white dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 transition cursor-pointer space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                              {session.institution}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              session.municipality.toUpperCase() === 'URIBIA' ? 'bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300' :
                              session.municipality.toUpperCase() === 'RIOHACHA' ? 'bg-sky-100 dark:bg-sky-400/20 text-sky-800 dark:text-sky-300' :
                              'bg-emerald-100 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {session.municipality}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                            <span>{session.startTime} - {session.endTime}</span>
                            <span className="font-semibold text-slate-500 dark:text-slate-400">{session.modality}</span>
                          </div>

                          <div className="text-[10px] text-indigo-600 dark:text-indigo-300 truncate font-medium">
                            {session.trainingType}
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

      {/* QUICK OPERATIONAL REFERENCE CARDS (From User's HTML) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Card 1: Uribia Rules */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex flex-col gap-2 shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Reglas Clave de Uribia</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            • Máx. 2 sedes presenciales simultáneas por día.<br/>
            • Formaciones presenciales cada 15 días.<br/>
            • Si Guarerapu rota, moverse solo entre martes y jueves.<br/>
            • <strong>Guarerapu #3:</strong> Container sin energía (llevar baterías cargadas).
          </p>
        </div>

        {/* Card 2: Riohacha & Chonkay */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex flex-col gap-2 shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
            <BookOpen className="w-4 h-4" />
            <span>Denzil Sabatinos & Chonkay</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            • <strong>Denzil Sabatinos:</strong> Sábados completos (Ciclo 4 y 6). Todo el material 100% impreso.<br/>
            • <strong>Chonkay:</strong> Estrictamente ajustado al horario vespertino de Ética y C. Ciudadana (bloques de 50 y 100 min).
          </p>
        </div>

        {/* Card 3: Manaure & Offline Sync */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex flex-col gap-2 shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Microlearning y Modo Offline</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            • <strong>Microlearning:</strong> Despacho continuo Lunes, Miércoles y Viernes.<br/>
            • <strong>Persistencia Local PWA:</strong> Todas las modificaciones y nuevas sesiones se guardan automáticamente en tu dispositivo sin necesidad de conexión a internet.
          </p>
        </div>
      </div>

      {/* SESSION DETAIL MODAL (Opens when clicking any event on calendar) */}
      <SessionDetailModal
        session={selectedSessionForDetail}
        isOpen={Boolean(selectedSessionForDetail)}
        sessionRole={sessionRole}
        onRequestReschedule={onRequestReschedule}
        onClose={() => setSelectedSessionForDetail(null)}
        onEdit={(session) => {
          setSelectedSessionForDetail(null);
          onEditSession(session);
        }}
        onDuplicate={(session) => {
          setSelectedSessionForDetail(null);
          onDuplicateSession(session);
        }}
        onDelete={(id) => {
          setSelectedSessionForDetail(null);
          onDeleteSession(id);
        }}
      />
    </div>
  );
};
