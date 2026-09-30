import React, { useState, useMemo } from 'react';
import { TrainingSession, Municipality, Modality, InstitutionProfile } from '../types/schedule';
import { deduplicateSessions } from '../App';
import { ordenarSesionesDelDia } from '../utils/sorting';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
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
  Info,
  X,
  Lock
} from 'lucide-react';
import { SessionDetailModal } from './SessionDetailModal';
import { esSesionHistorica } from '../utils/uribiaValidator';

export interface CalendarViewProps {
  sessions: TrainingSession[];
  filteredSessions?: TrainingSession[];
  selectedInstitution?: string;
  setSelectedInstitution?: (inst: string) => void;
  selectedMunicipality?: string;
  setSelectedMunicipality?: (mun: string) => void;
  selectedModality?: string;
  setSelectedModality?: (mod: string) => void;
  selectedAudience?: string;
  setSelectedAudience?: (aud: string) => void;
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
  onPrint?: (targetSessions?: TrainingSession[], title?: string, periodLabel?: string, orientation?: 'portrait' | 'landscape') => void;
  sessionRole?: 'admin' | 'viewer';
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const DAYS_HEADER = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const WEEKDAYS_SHORT_7 = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  filteredSessions: propFilteredSessions,
  selectedInstitution: propSelectedInstitution,
  setSelectedInstitution: propSetSelectedInstitution,
  selectedMunicipality: propSelectedMunicipality,
  setSelectedMunicipality: propSetSelectedMunicipality,
  selectedModality: propSelectedModality,
  setSelectedModality: propSetSelectedModality,
  selectedAudience: propSelectedAudience,
  setSelectedAudience: propSetSelectedAudience,
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
  const [isFiltersOpenMobile, setIsFiltersOpenMobile] = useState(false);

  // Active date for weekly view (starts on Sunday of the week containing Sept 1, 2026)
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    const d = new Date(2026, 8, 1);
    const day = d.getDay(); // 0 = Sunday
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Local fallback filters if not passed as props
  const [localInstitution, setLocalInstitution] = useState<string>('all');
  const [localMuni, setLocalMuni] = useState<string>('all');
  const [localMod, setLocalMod] = useState<string>('all');
  const [localPob, setLocalPob] = useState<string>('all');

  const selectedInstitutionFilter = propSelectedInstitution !== undefined ? propSelectedInstitution : localInstitution;
  const setSelectedInstitutionFilter = propSetSelectedInstitution || setLocalInstitution;

  const filterMuni = propSelectedMunicipality !== undefined ? propSelectedMunicipality : localMuni;
  const setFilterMuni = propSetSelectedMunicipality || setLocalMuni;

  const filterMod = propSelectedModality !== undefined ? propSelectedModality : localMod;
  const setFilterMod = propSetSelectedModality || setLocalMod;

  const filterPob = propSelectedAudience !== undefined ? propSelectedAudience : localPob;
  const setFilterPob = propSetSelectedAudience || setLocalPob;

  // Selected session for detail modal
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<TrainingSession | null>(null);

  // Month navigation
  const prevMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth;
    if (currentMonth === 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    } else {
      newMonth = currentMonth - 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // Synchronize weekStartDate to first Sunday of the newly selected month
    const d = new Date(newYear, newMonth, 1);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    setWeekStartDate(d);
  };

  const nextMonth = () => {
    let newYear = currentYear;
    let newMonth = currentMonth;
    if (currentMonth === 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    } else {
      newMonth = currentMonth + 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // Synchronize weekStartDate to first Sunday of the newly selected month
    const d = new Date(newYear, newMonth, 1);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    setWeekStartDate(d);
  };

  const goToSept2026 = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    const d = new Date(2026, 8, 1);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    setWeekStartDate(d);
  };

  // Week navigation (steps by 7 days and syncs currentYear/currentMonth with active week)
  const prevWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStartDate(newDate);

    // Use midweek (Wednesday / 3 days after Sunday) to determine active month/year
    const midWeek = new Date(newDate);
    midWeek.setDate(midWeek.getDate() + 3);
    setCurrentMonth(midWeek.getMonth());
    setCurrentYear(midWeek.getFullYear());
  };

  const nextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStartDate(newDate);

    const midWeek = new Date(newDate);
    midWeek.setDate(midWeek.getDate() + 3);
    setCurrentMonth(midWeek.getMonth());
    setCurrentYear(midWeek.getFullYear());
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (propFilteredSessions) {
      return propFilteredSessions;
    }
    return sessions.filter(s => {
      let match = true;

      if (selectedInstitutionFilter !== 'all') {
        // Comparar nombre de institución
        match = match && (s.institution === selectedInstitutionFilter || (s.campus && s.campus.includes(selectedInstitutionFilter)));
      }

      if (filterMuni !== 'all' && filterMuni !== 'ALL' && s.municipality.toUpperCase() !== filterMuni.toUpperCase()) match = false;
      if (filterMod !== 'all' && filterMod !== 'ALL' && s.modality !== filterMod) match = false;
      if (filterPob !== 'all' && filterPob !== 'ALL') {
        if (filterPob === 'Docentes' && !s.targetAudience.includes('Docentes')) match = false;
        if (filterPob === 'Estudiantes' && !s.targetAudience.includes('Estudiantes')) match = false;
      }
      return match;
    });
  }, [propFilteredSessions, sessions, selectedInstitutionFilter, filterMuni, filterMod, filterPob]);

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

  // Weekly view days: 7 consecutive days starting from weekStartDate
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const dayNum = d.getDate();
      const dayOfWeekIdx = d.getDay(); // 0 = Domingo, 1 = Lunes, ...
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayName = DAYS_HEADER[dayOfWeekIdx];
      const shortDayName = WEEKDAYS_SHORT_7[dayOfWeekIdx];
      const shortMonthName = MONTH_NAMES_SHORT[month];
      const headerLabel = `${shortDayName} ${dayNum} ${shortMonthName}`;

      return {
        date: d,
        dateStr,
        dayNum,
        dayOfWeekIdx,
        dayName,
        shortDayName,
        shortMonthName,
        headerLabel
      };
    });
  }, [weekStartDate]);

  // Fecha activa seleccionada para visualización e impresión (permite deseleccionar con null)
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-09-15');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null;
    const parts = selectedDate.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(currentYear, currentMonth, 15);
  }, [selectedDate, currentYear, currentMonth]);

  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateObj) return '';
    const dayName = DAYS_HEADER[selectedDateObj.getDay()] || 'Día';
    const monthName = MONTH_NAMES[selectedDateObj.getMonth()] || 'Mes';
    return `${dayName}, ${selectedDateObj.getDate()} de ${monthName} de ${selectedDateObj.getFullYear()}`;
  }, [selectedDateObj]);

  // Cálculo del rango Lunes a Sábado de la semana visible
  const { weekDates, weekRangeLabel } = useMemo(() => {
    let monday: Date;
    if (viewMode === 'week') {
      monday = new Date(weekStartDate);
      monday.setDate(monday.getDate() + 1); // Sunday + 1 = Monday
    } else {
      const baseDate = selectedDateObj || new Date(currentYear, currentMonth, 15);
      const dayOfWeek = baseDate.getDay(); // 0 = Domingo, 1 = Lunes, ... 6 = Sábado
      const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday = new Date(baseDate);
      monday.setDate(monday.getDate() + offsetToMonday);
    }
    monday.setHours(0, 0, 0, 0);

    const dates = [0, 1, 2, 3, 4, 5].map(offset => {
      const d = new Date(monday);
      d.setDate(d.getDate() + offset);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return {
        date: d,
        dateStr: `${y}-${m}-${day}`,
        dayName: DAYS_HEADER[d.getDay()],
        dayNumber: d.getDate(),
        monthName: MONTH_NAMES[d.getMonth()]
      };
    });

    const saturday = dates[5];
    const startDay = dates[0].dayNumber;
    const startMonth = dates[0].monthName;
    const endDay = saturday.dayNumber;
    const endMonth = saturday.monthName;
    const endYear = saturday.date.getFullYear();

    const label = startMonth === endMonth
      ? `Lunes ${startDay} al Sábado ${endDay} de ${endMonth} de ${endYear}`
      : `Lunes ${startDay} de ${startMonth} al Sábado ${endDay} de ${endMonth} de ${endYear}`;

    return { weekDates: dates, weekRangeLabel: label };
  }, [viewMode, weekStartDate, selectedDateObj]);

  // Formaciones filtradas del Día Actual seleccionado
  const currentDaySessions = useMemo(() => {
    if (!selectedDate || !selectedDateObj) return [];
    const dayName = DAYS_HEADER[selectedDateObj.getDay()];
    const dayNumber = selectedDateObj.getDate();
    const raw = getSessionsForDate(selectedDate, dayName, dayNumber);
    const daySessions = raw.filter((session, idx, self) => 
      idx === self.findIndex(s => (s.id ? s.id === session.id : `${s.institution}-${s.date}-${s.startTime}-${s.topic}` === `${session.institution}-${session.date}-${session.startTime}-${session.topic}`))
    ).map(s => ({
      ...s,
      specificDate: s.specificDate || selectedDate
    }));
    const sortedDaySessions = [...daySessions].sort((a, b) => getStartMinutes(a) - getStartMinutes(b));
    return sortedDaySessions;
  }, [selectedDate, selectedDateObj, getSessionsForDate]);

  // Formaciones filtradas de la Semana Completa (Lunes a Sábado)
  const currentWeekSessions = useMemo(() => {
    const collected: TrainingSession[] = [];
    weekDates.forEach(wd => {
      const daySessions = getSessionsForDate(wd.dateStr, wd.dayName, wd.dayNumber);
      const sortedDaySessions = [...daySessions].sort((a, b) => getStartMinutes(a) - getStartMinutes(b));
      sortedDaySessions.forEach(s => {
        const exists = collected.some(ex => 
          (ex.id && s.id && ex.id === s.id) || 
          (ex.institution === s.institution && (ex.specificDate || ex.date) === wd.dateStr && ex.startTime === s.startTime && ex.topic === s.topic)
        );
        if (!exists) {
          collected.push({
            ...s,
            specificDate: s.specificDate || wd.dateStr
          });
        }
      });
    });
    return collected;
  }, [weekDates, getSessionsForDate]);

  const handlePrintDay = () => {
    setShowPrintModal(false);
    if (onPrint) {
      onPrint(
        currentDaySessions,
        `AGENDA DIARIA — ${selectedDateFormatted.toUpperCase()}`,
        `Día: ${selectedDateFormatted}`,
        'portrait'
      );
    }
  };

  const handlePrintWeek = () => {
    setShowPrintModal(false);
    if (onPrint) {
      onPrint(
        currentWeekSessions,
        `AGENDA SEMANAL — ${weekRangeLabel.toUpperCase()}`,
        `Semana: ${weekRangeLabel}`,
        'landscape'
      );
    }
  };

  return (
    <div className="space-y-4 pb-14 landscape:pb-12">
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

          {/* Quick Actions Bar (Visible en desktop md+, en móvil las acciones están unificadas en la cabecera) */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAddSessionForDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
              title="Programar una nueva formación"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Sesión</span>
            </button>

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

            <button 
              type="button"
              id="btn-calendar-print-agenda"
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 shadow flex items-center gap-2 transition cursor-pointer"
            >
              🖨️ Imprimir Agenda
            </button>
          </div>
        </div>

        {/* Subheader: Filters & Stats */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
          {/* Botón para colapsar/expandir filtros en móvil */}
          <div className="md:hidden flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setIsFiltersOpenMobile(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer active:scale-95"
            >
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>🔍 Filtros rápidos</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFiltersOpenMobile ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {filteredSessions.length} sesiones
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={`${isFiltersOpenMobile ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-2.5 w-full md:w-auto`}>
            {/* Municipality Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Municipio</label>
              <select
                value={filterMuni}
                onChange={e => setFilterMuni(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
              >
                <option value="all">Todos los municipios</option>
                <option value="Uribia">Uribia</option>
                <option value="Riohacha">Riohacha</option>
                <option value="Manaure">Manaure</option>
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
                className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition cursor-pointer max-w-[220px] truncate"
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
                <option value="all">Todas las modalidades</option>
                <option value="Presencial">Solo Presencial 🏛️</option>
                <option value="Virtual">Solo Virtual 💻</option>
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
                <option value="all">Toda la población</option>
                <option value="Estudiantes">Solo Estudiantes</option>
                <option value="Docentes">Docentes (0 - Pausado)</option>
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
          <div className="grid grid-cols-7 border-l border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 rounded-b-xl min-h-auto md:min-h-[560px]">
            {/* 1. Leading cells from previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[58px] landscape:min-h-[46px] md:min-h-[110px] p-1 md:p-2 bg-slate-100/50 dark:bg-slate-950/60 border-r border-b border-slate-200 dark:border-slate-800/40 opacity-40 text-xs text-slate-400 dark:text-slate-600 cursor-not-allowed select-none overflow-hidden"
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

              // Contar instituciones / sedes físicas únicas reales activas ese día
              const uniqueUribiaSchools = Array.from(new Set(uribiaSessionsThisDay.map(s => (s.campus || s.institution)?.trim()))).filter(Boolean);
              const uribiaCount = uniqueUribiaSchools.length;
              const isOvercapacity = uribiaCount > 2;

              const uniqueDaySessions = daySessions.filter((session, index, self) =>
                index === self.findIndex((s) => (s.id ? s.id === session.id : `${s.institution}-${s.date}-${s.startTime}-${s.topic}` === `${session.institution}-${session.date}-${session.startTime}-${session.topic}`))
              );
              // Orden visual único AM a PM (Paso 2)
              const sortedDaySessions = ordenarSesionesDelDia(uniqueDaySessions);

              const isSelectedDay = dateStr === selectedDate;

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`border-r border-b border-slate-200 dark:border-slate-800/70 flex flex-col justify-between transition-colors cursor-pointer group overflow-hidden p-1 min-h-[58px] landscape:min-h-[46px] md:min-h-[120px] md:p-2 ${
                    isSelectedDay 
                      ? 'ring-2 ring-amber-400 bg-amber-500/10 rounded-lg' 
                      : isOvercapacity 
                      ? 'bg-rose-50/70 dark:bg-rose-950/20' 
                      : 'bg-white dark:bg-slate-900/50'
                  }`}
                >
                  {/* Top Day Header inside cell */}
                  <div className="flex items-center justify-between mb-0.5 md:mb-1.5">
                    <span className={`text-[11px] md:text-xs font-black ${
                      dateStr === '2026-09-11'
                        ? 'bg-amber-400 text-slate-950 px-1.5 md:px-2 py-0.2 md:py-0.5 rounded-full shadow-xs'
                        : isSelectedDay
                        ? 'text-amber-500 dark:text-amber-400 font-black'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Uribia Capacity Indicator Badge */}
                      {uribiaCount > 0 && (
                        <span
                          className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                            isOvercapacity
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                          title={`Uribia presencial hoy: ${uribiaCount}/2 sedes`}
                        >
                          U: {uribiaCount}/2
                        </span>
                      )}

                      {/* Quick Add Button (Solo Admin en desktop) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddSessionForDate(dateStr);
                          }}
                          className="hidden md:block opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title={`Programar sesión para el ${dayNumber} de ${MONTH_NAMES[currentMonth]}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Vista móvil (< md): fila horizontal centrada con puntos indicadores (dots) sin tarjetas de texto ni scroll */}
                  <div className="flex md:hidden items-center justify-center gap-1 my-auto py-0.5 flex-wrap">
                    {sortedDaySessions.slice(0, sortedDaySessions.length > 4 ? 3 : 4).map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className={`w-2 h-2 rounded-full shadow-sm shrink-0 ${
                          s.modality === 'Presencial' ? 'bg-emerald-400' : 'bg-sky-400'
                        }`}
                        title={`${s.modality}: ${s.institution}`}
                      />
                    ))}
                    {sortedDaySessions.length > 4 && (
                      <span className="text-[8px] font-extrabold text-amber-500 dark:text-amber-400 leading-none">
                        +{sortedDaySessions.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Vista escritorio (>= md): Tarjetas de texto completas originales */}
                  <div className="hidden md:block space-y-1 overflow-y-auto max-h-[85px] pr-0.5 scrollbar-thin">
                    {sortedDaySessions.map(session => {
                      const isPast = esSesionHistorica(session.specificDate || session.date);

                      // Badge color styling based on Municipality & Modality
                      let badgeClasses = 'border-sky-500/40 bg-sky-950/60 text-sky-200 hover:border-sky-400';
                      if (isPast) {
                        badgeClasses = 'border-slate-600/50 bg-slate-900/80 text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-500';
                      } else if (session.municipality.toUpperCase() === 'URIBIA') {
                        badgeClasses = 'border-amber-500/40 bg-amber-950/60 text-amber-200 hover:border-amber-400';
                      } else if (session.municipality.toUpperCase() === 'MANAURE') {
                        badgeClasses = 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200 hover:border-emerald-400';
                      }
                      if (!isPast && session.modality === 'Virtual') {
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
                          title={isPast ? "🔒 Sesión histórica (anterior a hoy) - Protegida / Solo Lectura" : "Haz clic para ver todos los detalles de esta sesión"}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="truncate max-w-[85px] flex items-center gap-1">
                              {isPast && <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0 inline" />}
                              <span>{shortInst}</span>
                            </span>
                            <span className="text-[10px] opacity-90">{session.modality === 'Presencial' ? '🏛️' : '💻'}</span>
                          </div>
                          <div className="text-[9px] text-slate-300 truncate flex items-center justify-between">
                            <span>{session.startTime || ''}</span>
                            <span className="font-mono text-[8px] bg-black/40 px-1 rounded">
                              {isPast ? 'HIST' : (tType.includes('Técnicas') || tType.includes('CT') ? 'CT' :
                               tType.includes('Blandas') || tType.includes('HB') ? 'HB' :
                               tType.includes('Docente') ? 'Doc' : 'Cap')}
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
                  className="min-h-[58px] landscape:min-h-[46px] md:min-h-[110px] p-1 md:p-2 bg-slate-950/60 border-r border-b border-slate-800/40 opacity-30 text-xs text-slate-600 cursor-not-allowed select-none overflow-hidden"
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
          {/* Week Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={prevWeek}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
                title="Semana anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    Semana del {weekDays[0].dayNum} {weekDays[0].shortMonthName} al {weekDays[6].dayNum} {weekDays[6].shortMonthName} {weekDays[6].date.getFullYear()}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  Mes activo: {MONTH_NAMES[currentMonth]} {currentYear} • 7 Días sincronizados
                </p>
              </div>
              <button
                onClick={nextWeek}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
                title="Semana siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={goToSept2026}
                className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition"
              >
                Semana Actual (Sep 2026)
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 hidden md:inline">
                Filtro activo aplicado a {filteredSessions.length} formaciones globales
              </span>
            </div>
          </div>

          {/* 7 Columns Grid for Week Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDays.map(dayInfo => {
              const rawSessions = getSessionsForDate(dayInfo.dateStr, dayInfo.dayName, dayInfo.dayNum);
              const daySessionsUnique = ordenarSesionesDelDia(deduplicateSessions(rawSessions));

              const uribiaPresencials = daySessionsUnique.filter(
                s => (s.municipality || '').toUpperCase() === 'URIBIA' && s.modality === 'Presencial'
              );
              const uniqueInsts = Array.from(new Set(uribiaPresencials.map(s => s.institution || '')));
              const hasConflict = uniqueInsts.length > 2;

              const isWeekend = dayInfo.dayOfWeekIdx === 0 || dayInfo.dayOfWeekIdx === 6;
              const isSelectedDay = dayInfo.dateStr === selectedDate;

              return (
                <div
                  key={dayInfo.dateStr}
                  onClick={() => setSelectedDate(dayInfo.dateStr)}
                  className={`bg-slate-50 dark:bg-slate-800/70 rounded-xl border overflow-hidden flex flex-col cursor-pointer transition-all ${
                    isSelectedDay 
                      ? 'ring-2 ring-amber-400 dark:ring-amber-500 shadow-md' 
                      : ''
                  } ${
                    hasConflict
                      ? 'border-rose-400 dark:border-rose-500/80 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Day Column Header */}
                  <div
                    className={`p-2.5 border-b flex items-center justify-between ${
                      dayInfo.dayName === 'Sábado'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-700/40'
                        : dayInfo.dayName === 'Domingo'
                        ? 'bg-slate-200/60 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        : hasConflict
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-700/40'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {dayInfo.headerLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {dayInfo.dayName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          daySessionsUnique.length > 0
                            ? 'bg-amber-400 text-slate-950 shadow-2xs'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {daySessionsUnique.length}
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() => onAddSessionForDate(dayInfo.dateStr)}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 p-1 rounded hover:bg-amber-500/10 transition"
                          title={`Añadir sesión el ${dayInfo.headerLabel}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sessions in day */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[420px]">
                    {daySessionsUnique.length === 0 ? (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center py-6">
                        {isWeekend ? 'Fin de semana' : 'Sin sesiones'}
                      </p>
                    ) : (
                      daySessionsUnique.map(session => {
                        const isPast = esSesionHistorica(session.specificDate || session.date);
                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSessionForDetail(session)}
                            className={`p-2 rounded-lg border transition cursor-pointer space-y-1 shadow-2xs hover:shadow-xs group ${
                              isPast
                                ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800 opacity-65 hover:opacity-100'
                                : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/80 hover:border-amber-400'
                            }`}
                            title={isPast ? "🔒 Sesión histórica (anterior a hoy) - Protegida / Solo Lectura" : "Haz clic para ver detalles"}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition flex items-center gap-1" title={session.institution}>
                                {isPast && <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0 inline" />}
                                <span className="truncate">{session.institution}</span>
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isPast && (
                                  <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    Histórico
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 ${
                                    (session.municipality || '').toUpperCase() === 'URIBIA'
                                      ? 'bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300'
                                      : (session.municipality || '').toUpperCase() === 'RIOHACHA'
                                      ? 'bg-sky-100 dark:bg-sky-400/20 text-sky-800 dark:text-sky-300'
                                      : 'bg-emerald-100 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300'
                                  }`}
                                >
                                  {session.municipality}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                              <span>{session.startTime} - {session.endTime}</span>
                              <span className="font-semibold text-slate-500 dark:text-slate-400">{session.modality}</span>
                            </div>

                            <div className="text-[10px] text-indigo-600 dark:text-indigo-300 truncate font-medium" title={session.trainingType}>
                              {session.trainingType}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. PANEL CONTEXTUAL DEL DÍA ACTIVO SELECCIONADO               */}
      {/*    Visible únicamente cuando hay un día seleccionado          */}
      {/* ------------------------------------------------------------- */}
      {selectedDate && selectedDateObj && (
        <div 
          id="active-day-context-panel"
          className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-500/80 p-3 sm:p-5 landscape:py-1 landscape:px-3 shadow-xl space-y-2 landscape:space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* a) Barra de título y b) Botón contextual "Imprimir Agenda" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 landscape:pb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-xl landscape:text-sm shrink-0">📅</span>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-base landscape:text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {selectedDateFormatted} — {currentDaySessions.length} {currentDaySessions.length === 1 ? 'Formación programada' : 'Formaciones programadas'}
                </h3>
                <p className="text-[10px] sm:text-[11px] landscape:text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                  {currentDaySessions.filter(s => s.modality === 'Presencial').length} Presenciales • {currentDaySessions.filter(s => s.modality === 'Virtual').length} Virtuales
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              {/* Botón Contextual "Imprimir Agenda" */}
              <button
                type="button"
                id="btn-contextual-print-agenda"
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 landscape:py-1 landscape:px-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs landscape:text-[10px] font-bold rounded-xl border border-slate-700 shadow-xs transition active:scale-95 cursor-pointer"
                title="Imprimir la agenda de este día o de la semana completa"
              >
                <span>🖨️</span>
                <span>Imprimir Agenda</span>
              </button>

              {/* Botón de cerrar "✕" que deselecciona el día */}
              <button
                type="button"
                id="btn-close-active-day-panel"
                onClick={() => setSelectedDate(null)}
                className="w-7 h-7 landscape:w-6 landscape:h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="Cerrar panel y deseleccionar día"
                aria-label="Cerrar selección de día"
              >
                <X className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
              </button>
            </div>
          </div>

          {/* c) Lista de formaciones del día: Tarjetas legibles y sin truncamiento */}
          {currentDaySessions.length === 0 ? (
            <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic">
              No hay formaciones programadas para esta fecha.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 landscape:gap-1.5">
              {currentDaySessions.map(session => {
                const isPast = esSesionHistorica(session.specificDate || session.date);
                const isPresencial = session.modality === 'Presencial';

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionForDetail(session)}
                    className={`p-2.5 landscape:py-1.5 landscape:px-2.5 rounded-xl border transition-all cursor-pointer space-y-1.5 landscape:space-y-1 hover:shadow-md ${
                      isPast
                        ? 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        : isPresencial
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400'
                        : 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-800/60 hover:border-sky-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] landscape:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 landscape:py-0.2 rounded-md ${
                          isPresencial
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300'
                        }`}>
                          {isPresencial ? '🏛️ Presencial' : '💻 Virtual'}
                        </span>
                        <span className="text-[10px] landscape:text-[9px] font-bold px-2 py-0.5 landscape:py-0.2 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {session.municipality}
                        </span>
                        {isPast && (
                          <span className="text-[9px] landscape:text-[8px] font-bold px-1.5 py-0.5 landscape:py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Histórico
                          </span>
                        )}
                      </div>
                      <span className="text-xs landscape:text-[10px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 shrink-0 bg-white dark:bg-slate-800 px-2 py-0.5 landscape:py-0.2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Clock className="w-3.5 h-3.5 landscape:w-3 landscape:h-3 text-amber-500" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm landscape:text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                        {session.institution}
                      </h4>
                      {session.campus && session.campus !== session.institution && (
                        <p className="text-[11px] landscape:text-[9px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Sede: <strong>{session.campus}</strong></span>
                        </p>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] landscape:text-[9px] text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                        {session.trainingType || session.topic || 'Formación'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {session.targetAudience || session.targetPopulation || 'Estudiantes'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* MODAL UNIFICADO DE IMPRESIÓN (DÍA / SEMANA) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🖨️</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Imprimir Agenda Oficial
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecciona el alcance para generar el reporte
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector interactivo de fecha activa */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fecha Activa:</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate" title={selectedDateFormatted}>
                  {selectedDateFormatted}
                </span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="mt-4 space-y-3">
              {/* Opción 1: Imprimir Día Actual */}
              <button
                type="button"
                onClick={handlePrintDay}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-500/50 transition group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      📅
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        Imprimir Día Actual
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium block mt-0.5">
                        {selectedDateFormatted}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-semibold">
                        {currentDaySessions.length} {currentDaySessions.length === 1 ? 'formación programada' : 'formaciones programadas'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>

              {/* Opción 2: Imprimir Semana Completa */}
              <button
                type="button"
                onClick={handlePrintWeek}
                className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 hover:border-sky-400 dark:hover:border-sky-500/50 transition group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                      🗓️
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Imprimir Semana Completa
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium block mt-0.5">
                        {weekRangeLabel}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-semibold">
                        {currentWeekSessions.length} {currentWeekSessions.length === 1 ? 'formación en lunes a sábado' : 'formaciones en lunes a sábado'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Formato: Membrete Legado • Pie con 5 logos
              </span>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Acción Flotante (FAB) para Móvil: botón circular amarillo con icono "+" */}
      <button
        id="fab-calendar-new-session"
        onClick={() => onAddSessionForDate(selectedDate || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 w-12 h-12 md:w-11 md:h-11 flex items-center justify-center text-lg shadow-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 rounded-full font-black transition-all border-2 border-amber-300/80 cursor-pointer"
        title="Nueva Sesión"
        aria-label="Nueva Sesión"
      >
        <Plus className="w-6 h-6 md:w-5 md:h-5 stroke-[3]" />
      </button>
    </div>
  );
};
