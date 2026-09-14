import React, { useState, useMemo } from 'react';
import { 
  TrainingSession, 
  Municipality, 
  TargetAudience, 
  Modality, 
  ScheduleStatus 
} from '../types/schedule';
import { 
  Search, 
  Filter, 
  Edit3, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  MapPin,
  Calendar,
  CalendarDays,
  Layers,
  ArrowUpDown,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';

interface TableViewProps {
  sessions: TrainingSession[];
  setSessions?: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
  onEditSession: (session: TrainingSession) => void;
  onDuplicateSession: (session: TrainingSession) => void;
  onDeleteSession: (id: string) => void;
  onRequestReschedule?: (session: TrainingSession) => void;
  onOpenQuickAssign: (institutionName?: string) => void;
  onOpenNewSession: () => void;
  onExportHTML?: () => void;
  onExportExcel?: () => void;
  sessionRole?: 'admin' | 'viewer';
}

export const TableView: React.FC<TableViewProps> = ({
  sessions,
  setSessions,
  onEditSession,
  onDuplicateSession,
  onDeleteSession,
  onRequestReschedule,
  onOpenQuickAssign,
  onOpenNewSession,
  onExportHTML,
  onExportExcel,
  sessionRole = 'viewer'
}) => {
  const isAdmin = sessionRole === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'itemNumber' | 'municipality' | 'institution' | 'status'>('itemNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered and sorted sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => {
        const matchesSearch =
          s.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.campus || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.trainingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.observations.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.daysOfWeek.join(' ').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMunicipality =
          selectedMunicipality === 'all' || s.municipality === selectedMunicipality;

        const matchesAudience =
          selectedAudience === 'all' || s.targetAudience === selectedAudience;

        const matchesModality =
          selectedModality === 'all' || s.modality === selectedModality;

        const matchesStatus =
          selectedStatus === 'all' || s.status === selectedStatus;

        return (
          matchesSearch &&
          matchesMunicipality &&
          matchesAudience &&
          matchesModality &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        let valA: string | number = a[sortBy] ?? '';
        let valB: string | number = b[sortBy] ?? '';

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        }
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [sessions, searchTerm, selectedMunicipality, selectedAudience, selectedModality, selectedStatus, sortBy, sortOrder]);

  // Key stats
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const approved = sessions.filter(s => s.status === 'APROBADO').length;
    const pending = sessions.filter(s => s.status === 'PDTE').length;
    const totalHours = sessions.reduce((acc, curr) => acc + (curr.durationHours || 0), 0);
    const uribiaCount = sessions.filter(s => s.municipality === 'Uribia').length;
    const riohachaCount = sessions.filter(s => s.municipality === 'Riohacha').length;
    const manaureCount = sessions.filter(s => s.municipality === 'Manaure').length;

    return { totalSessions, approved, pending, totalHours, uribiaCount, riohachaCount, manaureCount };
  }, [sessions]);

  // Check if Jaipa and Yotojoroin have pending entries
  const pendingUribia = sessions.filter(s => s.municipality === 'Uribia' && s.status === 'PDTE');

  const handleSort = (field: 'itemNumber' | 'municipality' | 'institution' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Notice Banner: Pending spaces for Uribia (Jaipa & Yotojoroin) */}
      {pendingUribia.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Espacios Reservados para Coordinación Uribia (Jaipa y Yotojoroin)
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                  Hay {pendingUribia.length} sesiones en estado <strong>PDTE</strong> guardadas con su espacio listo para acomodar en cuanto se concreten las llamadas del fin de semana.
                </p>
              </div>
            </div>
            {isAdmin && (
              <button
                id="btn-quick-assign-pending"
                onClick={() => onOpenQuickAssign()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Asignar Días Pendientes</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Sesiones</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalSessions}</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">En cronograma general</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs transition-colors">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Aprobadas</span>
          <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
            {stats.approved}
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500">Listas para ejecución</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs transition-colors">
          <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wide">Por Definir (PDTE)</span>
          <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
            {stats.pending}
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 inline" />
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-500">Espacios listos</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs transition-colors">
          <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Uribia (7 Sedes)</span>
          <div className="text-xl font-extrabold text-blue-900 dark:text-blue-300 mt-1">{stats.uribiaCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">sesiones</span></div>
          <span className="text-[10px] text-blue-600 dark:text-blue-500">Regla máx 2/día</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/40 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs transition-colors">
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">Riohacha (4 Sedes)</span>
          <div className="text-xl font-extrabold text-indigo-900 dark:text-indigo-300 mt-1">{stats.riohachaCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">sesiones</span></div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-500">Sabatina y vespertina</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-teal-100 dark:border-teal-800/40 bg-teal-50/20 dark:bg-teal-950/20 shadow-xs transition-colors">
          <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Manaure (El Pájaro)</span>
          <div className="text-xl font-extrabold text-teal-900 dark:text-teal-300 mt-1">{stats.manaureCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">sesiones</span></div>
          <span className="text-[10px] text-teal-600 dark:text-teal-500">Costa y rural</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              id="input-search-sessions"
              type="text"
              placeholder="Buscar por institución, grado, día, tema, o condiciones..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden sm:block">
              Mostrando <strong>{filteredSessions.length}</strong> de {sessions.length}
            </div>
            {onExportExcel && (
              <button
                id="btn-table-export-excel"
                onClick={onExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700/50 rounded-lg transition"
                title="Descargar a Excel (.xlsx) con celdas formateadas y diseño profesional"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Descargar Excel</span>
              </button>
            )}
            {onExportHTML && (
              <button
                id="btn-table-export-html"
                onClick={onExportHTML}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 rounded-lg transition"
                title="Descargar el cronograma en un archivo HTML independiente para abrir en cualquier celular o PC"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Descargar en HTML</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Municipio / Zona
            </label>
            <select
              id="select-filter-municipality"
              value={selectedMunicipality}
              onChange={e => setSelectedMunicipality(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">Todos los Municipios</option>
              <option value="Uribia">Uribia (7 Instituciones)</option>
              <option value="Riohacha">Riohacha (4 Instituciones)</option>
              <option value="Manaure">Manaure (El Pájaro)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Audiencia
            </label>
            <select
              id="select-filter-audience"
              value={selectedAudience}
              onChange={e => setSelectedAudience(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">Todas las Audiencias</option>
              <option value="Estudiantes">Estudiantes (9°, 10°, 11°, Ciclos)</option>
              <option value="Docentes">Docentes</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Modalidad
            </label>
            <select
              id="select-filter-modality"
              value={selectedModality}
              onChange={e => setSelectedModality(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">Todas las Modalidades</option>
              <option value="Presencial">Presencial (En sede o casco)</option>
              <option value="Virtual">Virtual (Sincrónica)</option>
              <option value="Microlearning">Microlearning (Cápsulas autónomas)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Estado / Fase
            </label>
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              <option value="APROBADO">APROBADO</option>
              <option value="PDTE">PDTE (Pendiente)</option>
              <option value="EN_REVISION">En Revisión</option>
            </select>
          </div>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => handleSort('itemNumber')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 w-12 text-center"
                >
                  <span className="flex items-center justify-center gap-1">
                    No.
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('municipality')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 w-28"
                >
                  <span className="flex items-center gap-1">
                    Zona / Municipio
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('institution')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 min-w-[180px]"
                >
                  <span className="flex items-center gap-1">
                    Institución / Sede
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="py-3 px-3 min-w-[120px]">Jornada & Audiencia</th>
                <th className="py-3 px-3 min-w-[150px]">Formación & Modalidad</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 text-center w-24"
                >
                  <span className="flex items-center justify-center gap-1">
                    Estado
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="py-3 px-3 min-w-[130px]">Día(s) Programado(s)</th>
                <th className="py-3 px-3 min-w-[110px]">Horario (Duración)</th>
                <th className="py-3 px-3 min-w-[90px]">Frecuencia</th>
                <th className="py-3 px-3 min-w-[200px]">Observaciones & Condiciones</th>
                <th className="py-3 px-3 text-center w-28 print:hidden">
                  {isAdmin ? 'Acciones' : 'Modalidad'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold">No se encontraron sesiones con estos filtros</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Prueba limpiando la búsqueda o cambiando los filtros seleccionados</p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, idx) => {
                  const isPending = session.status === 'PDTE';
                  const isUribia = session.municipality === 'Uribia';
                  const isPresencial = session.modality === 'Presencial';

                  return (
                    <tr
                      key={session.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isPending 
                          ? 'bg-amber-50/30 dark:bg-amber-950/20' 
                          : idx % 2 === 0 
                          ? 'bg-white dark:bg-slate-900' 
                          : 'bg-slate-50/40 dark:bg-slate-900/40'
                      }`}
                    >
                      {/* Item number */}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600 dark:text-slate-400">
                        {session.itemNumber || idx + 1}
                      </td>

                      {/* Municipality */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                            session.municipality === 'Uribia'
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : session.municipality === 'Riohacha'
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                              : 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                          }`}
                        >
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          {session.municipality}
                        </span>
                      </td>

                      {/* Institution & Campus */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {session.institution}
                        </div>
                        {session.campus && session.campus !== session.institution && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="font-medium text-slate-400 dark:text-slate-500">Sede:</span> {session.campus}
                          </div>
                        )}
                        {session.infrastructureNotes && (
                          <div className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-700/50 mt-1 inline-block">
                            ⚡ {session.infrastructureNotes}
                          </div>
                        )}
                      </td>

                      {/* Academic shift & Audience */}
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                          {session.academicShift}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            session.targetAudience === 'Docentes'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}>
                            {session.targetAudience}
                          </span>
                          {session.gradeOrCycle && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                              ({session.gradeOrCycle})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Training type & Modality */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {session.trainingType}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              session.modality === 'Presencial'
                                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                                : session.modality === 'Virtual'
                                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {session.modality}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {session.responsible}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                            session.status === 'APROBADO'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : session.status === 'PDTE'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-600 animate-pulse'
                              : session.status === 'COMPLETADO'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                          }`}
                        >
                          {session.status === 'APROBADO' && <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />}
                          {session.status === 'PDTE' && <Clock className="w-3 h-3 text-amber-700 dark:text-amber-400" />}
                          {session.status}
                        </span>
                      </td>

                      {/* Days of week & Scheduled dates */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white flex flex-wrap gap-1">
                          {session.daysOfWeek.map(d => (
                            <span
                              key={d}
                              className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                                isPending
                                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                        {/* Dates info */}
                        {session.datesScheduled && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight flex flex-col gap-0.5" title="Fechas programadas">
                            {session.datesScheduled.september && session.datesScheduled.september.length > 0 && (
                              <span className="truncate"><strong className="text-slate-600 dark:text-slate-300">Sep:</strong> {session.datesScheduled.september.join(', ')}</span>
                            )}
                            {session.datesScheduled.october && session.datesScheduled.october.length > 0 && (
                              <span className="truncate"><strong className="text-slate-600 dark:text-slate-300">Oct:</strong> {session.datesScheduled.october.join(', ')}</span>
                            )}
                            {session.datesScheduled.november && session.datesScheduled.november.length > 0 && (
                              <span className="truncate"><strong className="text-slate-600 dark:text-slate-300">Nov:</strong> {session.datesScheduled.november.join(', ')}</span>
                            )}
                            {session.datesScheduled.december && session.datesScheduled.december.length > 0 && (
                              <span className="truncate"><strong className="text-slate-600 dark:text-slate-300">Dic:</strong> {session.datesScheduled.december.join(', ')}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Hours and Duration */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {session.durationHours} hrs por sesión
                        </div>
                      </td>

                      {/* Frequency */}
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {session.frequency}
                        </span>
                      </td>

                      {/* Observations & Infrastructure */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        <p>{session.observations}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center print:hidden">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              id={`btn-edit-${session.id}`}
                              onClick={() => onEditSession(session)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition cursor-pointer"
                              title="Modificar sesión"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-duplicate-${session.id}`}
                              onClick={() => onDuplicateSession(session)}
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
                              title="Duplicar sesión"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-${session.id}`}
                              onClick={() => onDeleteSession(session.id)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition cursor-pointer"
                              title="Suprimir sesión"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {session.municipality === 'Uribia' && session.modality === 'Presencial' && onRequestReschedule ? (
                              <button
                                type="button"
                                id={`btn-reschedule-table-${session.id}`}
                                onClick={() => onRequestReschedule(session)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-bold rounded-lg shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                                title="Solicitar cambio de fecha al Coordinador"
                              >
                                <CalendarDays className="w-3 h-3" />
                                <span>Solicitar Cambio</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                Solo Lectura
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
