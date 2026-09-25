import React, { useState, useMemo, useEffect } from 'react';
import { TrainingSession } from '../types/schedule';
import { sortSessions, SessionSortField, SortOrder } from '../utils/sorting';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Printer,
  Edit3, 
  Copy, 
  Trash2, 
  Plus, 
  Sparkles,
  CalendarDays,
  Layers,
  ArrowUpDown,
  ChevronDown,
  Check
} from 'lucide-react';

export interface SessionsTableViewProps {
  sessions: TrainingSession[];
  filteredSessions: TrainingSession[];
  selectedInstitution: string;
  setSelectedInstitution: (inst: string) => void;
  selectedMunicipality: string;
  setSelectedMunicipality: (mun: string) => void;
  selectedModality: string;
  setSelectedModality: (mod: string) => void;
  selectedAudience?: string;
  setSelectedAudience?: (aud: string) => void;
  sessionRole?: 'admin' | 'viewer';
  onEditSession: (session: TrainingSession) => void;
  onDuplicateSession: (session: TrainingSession) => void;
  onDeleteSession: (id: string) => void;
  onRequestReschedule?: (session: TrainingSession) => void;
  onOpenQuickAssign?: () => void;
  onOpenNewSession?: () => void;
  onExportHTML?: () => void;
  onExportExcel?: (selectedInsts?: string[], sortBy?: SessionSortField, sortOrder?: SortOrder) => void;
  onPrint?: (sessionsToPrint?: TrainingSession[], title?: string, period?: string) => void;
  onDisplayedSessionsChange?: (sessions: TrainingSession[]) => void;
}

export const SessionsTableView: React.FC<SessionsTableViewProps> = ({
  sessions,
  filteredSessions,
  selectedInstitution,
  setSelectedInstitution,
  selectedMunicipality,
  setSelectedMunicipality,
  selectedModality,
  setSelectedModality,
  selectedAudience = 'all',
  setSelectedAudience,
  sessionRole = 'viewer',
  onEditSession,
  onDuplicateSession,
  onDeleteSession,
  onRequestReschedule,
  onOpenQuickAssign,
  onOpenNewSession,
  onExportHTML,
  onExportExcel,
  onPrint,
  onDisplayedSessionsChange
}) => {
  const isAdmin = sessionRole === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'institution' | 'modality' | 'status' | 'itemNumber'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Opciones dinámicas de instituciones según el municipio seleccionado
  const institutionOptions = useMemo(() => {
    const list = selectedMunicipality === 'all'
      ? sessions
      : sessions.filter(s => s.municipality.toLowerCase() === selectedMunicipality.toLowerCase());
    return Array.from(new Set(list.map(s => s.institution))).filter(Boolean).sort();
  }, [sessions, selectedMunicipality]);

  // Si se cambia de municipio y la institución ya no pertenece, resetearla a 'all'
  useEffect(() => {
    if (selectedInstitution !== 'all' && institutionOptions.length > 0 && !institutionOptions.includes(selectedInstitution)) {
      setSelectedInstitution('all');
    }
  }, [selectedMunicipality, institutionOptions, selectedInstitution, setSelectedInstitution]);

  // Sesiones con búsqueda de texto y ordenamiento aplicados sobre filteredSessions
  const displayedSessions = useMemo(() => {
    const filtered = filteredSessions.filter(s => {
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      return (
        s.institution.toLowerCase().includes(term) ||
        (s.campus || '').toLowerCase().includes(term) ||
        s.trainingType.toLowerCase().includes(term) ||
        (s.topic || '').toLowerCase().includes(term) ||
        (s.specificDate || '').includes(term) ||
        (s.observations || '').toLowerCase().includes(term) ||
        s.daysOfWeek.join(' ').toLowerCase().includes(term)
      );
    });

    return sortSessions(filtered, sortBy, sortOrder);
  }, [filteredSessions, searchTerm, selectedStatus, sortBy, sortOrder]);

  // Notificar al contenedor principal sobre las sesiones filtradas en pantalla
  useEffect(() => {
    onDisplayedSessionsChange?.(displayedSessions);
  }, [displayedSessions, onDisplayedSessionsChange]);

  // Métricas calculadas sobre displayedSessions (reflejan estrictamente los filtros de pantalla)
  const totalCount = displayedSessions.length;
  const presencialCount = displayedSessions.filter(s => s.modality === 'Presencial').length;
  const virtualCount = displayedSessions.filter(s => s.modality === 'Virtual').length;
  const approvedCount = displayedSessions.filter(s => s.status === 'APROBADO').length;

  const handleResetFilters = () => {
    setSelectedMunicipality('all');
    setSelectedInstitution('all');
    setSelectedModality('all');
    if (setSelectedAudience) setSelectedAudience('all');
    setSelectedStatus('all');
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('asc');
  };

  const hasActiveFilters = 
    selectedMunicipality !== 'all' || 
    selectedInstitution !== 'all' || 
    selectedModality !== 'all' || 
    selectedAudience !== 'all' || 
    selectedStatus !== 'all' || 
    searchTerm !== '' ||
    sortBy !== 'date' ||
    sortOrder !== 'asc';

  return (
    <div className="space-y-4">
      {/* Barra de Título y Métricas Centralizadas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Fuente Única de Verdad
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Matriz Oficial de Formación
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Despliegue sincrónico de sesiones con fechas reales de ejecución. Sin recortes ni límites forzados.
            </p>
          </div>

          {/* Acciones de exportación y gestión */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenNewSession && isAdmin && (
              <button
                type="button"
                id="btn-table-new-session"
                onClick={onOpenNewSession}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nueva Sesión</span>
              </button>
            )}

            {onOpenQuickAssign && isAdmin && (
              <button
                type="button"
                id="btn-table-quick-assign"
                onClick={onOpenQuickAssign}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Asignación Masiva</span>
              </button>
            )}

            {onExportExcel && (
              <button
                type="button"
                id="btn-table-export-excel"
                onClick={() => onExportExcel(undefined, sortBy, sortOrder)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Exporta estrictamente las sesiones filtradas en pantalla con membrete y logos oficiales"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Excel ({totalCount})</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                id="btn-table-print-pdf"
                onClick={() => {
                  const title = selectedInstitution !== 'all'
                    ? `CRONOGRAMA OFICIAL CONCERTADO — ${selectedInstitution.toUpperCase()}`
                    : undefined;
                  onPrint(displayedSessions, title);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Imprimir o generar PDF oficial con las sesiones filtradas en pantalla"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir / PDF ({totalCount})</span>
              </button>
            )}

            {onExportHTML && (
              <button
                type="button"
                id="btn-table-export-html"
                onClick={onExportHTML}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>HTML Oficial</span>
              </button>
            )}
          </div>
        </div>

        {/* Tarjetas KPI de Resumen Sincronizado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase">Total Sesiones</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">{totalCount}</span>
            <span className="text-[10px] text-slate-400">Coincidencias en matriz</span>
          </div>
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">Presenciales</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5 block">{presencialCount}</span>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400">Talleres en sede</span>
          </div>
          <div className="bg-sky-50/70 dark:bg-sky-950/30 p-3 rounded-xl border border-sky-200/60 dark:border-sky-800/40">
            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 block uppercase">Virtuales</span>
            <span className="text-xl sm:text-2xl font-black text-sky-900 dark:text-sky-200 mt-0.5 block">{virtualCount}</span>
            <span className="text-[10px] text-sky-700/80 dark:text-sky-400">Conexión sincrónica</span>
          </div>
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block uppercase">Aprobadas</span>
            <span className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5 block">{approvedCount}</span>
            <span className="text-[10px] text-amber-700/80 dark:text-amber-400">Concertación al 100%</span>
          </div>
        </div>

        {/* Notificación de Cohorte Institucional Completa */}
        {selectedInstitution !== 'all' && (
          <div className="mt-3 p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <Building2 className="w-4 h-4 shrink-0 text-blue-700 dark:text-blue-400" />
              <span>
                <strong>Cohorte Institucional Activa:</strong> {selectedInstitution} — Mostrando <strong>{totalCount} sesiones completas</strong> ({presencialCount} presenciales, {virtualCount} virtuales) con fechas individuales de calendario.
              </span>
            </div>
            <button
              onClick={() => setSelectedInstitution('all')}
              className="text-blue-700 hover:text-blue-900 dark:text-blue-300 font-bold underline shrink-0 cursor-pointer text-[11px]"
            >
              Ver todas las sedes
            </button>
          </div>
        )}
      </div>

      {/* Barra de Filtros Centralizados Compartidos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Campo de búsqueda rápida */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="input-search-sessions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por institución, sede, fecha (AAAA-MM-DD), tema u observaciones..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Selectores de Filtro Centralizado */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Municipio */}
            <select
              id="select-municipality-filter"
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">📍 Todos los Municipios</option>
              <option value="Uribia">Uribia</option>
              <option value="Riohacha">Riohacha</option>
              <option value="Manaure">Manaure</option>
            </select>

            {/* Filtro Institución */}
            <select
              id="select-institution-filter"
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="max-w-[220px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 truncate cursor-pointer"
            >
              <option value="all">🏫 Todas las Instituciones ({institutionOptions.length})</option>
              {institutionOptions.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>

            {/* Filtro Modalidad */}
            <select
              id="select-modality-filter"
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">🎯 Todas las Modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
            </select>

            {/* Filtro Población/Audiencia */}
            {setSelectedAudience && (
              <select
                id="select-audience-filter"
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">👥 Toda Audiencia</option>
                <option value="Estudiantes">Estudiantes</option>
                <option value="Docentes">Docentes (0 - Pausado)</option>
              </select>
            )}

            {/* Filtro Estado */}
            <select
              id="select-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Estado: Todos</option>
              <option value="APROBADO">APROBADO</option>
              <option value="Programada">Programada</option>
              <option value="POR CONCERTAR">POR CONCERTAR</option>
              <option value="PDTE">PDTE</option>
              <option value="COMPLETADO">COMPLETADO</option>
            </select>

            {/* Filtro y Ordenamiento por Ítem o Fecha */}
            <select
              id="select-sort-filter"
              value={
                sortBy === 'itemNumber'
                  ? (sortOrder === 'asc' ? 'item-asc' : 'item-desc')
                  : sortBy === 'date'
                    ? (sortOrder === 'desc' ? 'date-desc' : 'date-asc')
                    : 'date-asc'
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'item-asc') {
                  setSortBy('itemNumber');
                  setSortOrder('asc');
                } else if (val === 'item-desc') {
                  setSortBy('itemNumber');
                  setSortOrder('desc');
                } else if (val === 'date-desc') {
                  setSortBy('date');
                  setSortOrder('desc');
                } else if (val === 'date-asc') {
                  setSortBy('date');
                  setSortOrder('asc');
                }
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              title="Ordenar por fecha o por ítem"
            >
              <option value="date-asc">📅 Fecha: más lejana a reciente (Por defecto)</option>
              <option value="date-desc">📅 Fecha: más reciente a más lejana</option>
              <option value="item-asc">🔢 Ordenar por ítem (1 → {totalCount})</option>
              <option value="item-desc">🔢 Ordenar por ítem ({totalCount} → 1)</option>
            </select>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Restablecer filtros globales"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla Oficial Completa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th 
                  className="py-3 px-3 text-center min-w-[85px] relative select-none"
                  title="Ordenar por ítem o por fecha"
                >
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'itemNumber') {
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('itemNumber');
                          setSortOrder('asc');
                        }
                      }}
                      className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                      title={sortBy === 'itemNumber' ? `Ítem: ${sortOrder === 'asc' ? `1 a ${totalCount}` : `${totalCount} a 1`}` : 'Ordenar por ítem'}
                    >
                      <span>#</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'itemNumber' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      {sortBy === 'itemNumber' && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {sortOrder === 'asc' ? '1→N' : 'N→1'}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSortMenuOpen(prev => !prev);
                      }}
                      className="p-1 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                      title="Menú de ordenamiento: Ítem o Fecha"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Menú flotante de opciones de ordenamiento */}
                  {isSortMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-20 cursor-default" 
                        onClick={() => setIsSortMenuOpen(false)} 
                      />
                      <div 
                        className="absolute top-full left-0 mt-1 z-30 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-left text-xs font-normal"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
                          Opciones de Ordenamiento
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('itemNumber');
                            setSortOrder('asc');
                            setIsSortMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer ${sortBy === 'itemNumber' && sortOrder === 'asc' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          <span>🔢 Por ítem (1 a {totalCount})</span>
                          {sortBy === 'itemNumber' && sortOrder === 'asc' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('itemNumber');
                            setSortOrder('desc');
                            setIsSortMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer ${sortBy === 'itemNumber' && sortOrder === 'desc' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          <span>🔢 Por ítem ({totalCount} a 1)</span>
                          {sortBy === 'itemNumber' && sortOrder === 'desc' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('date');
                            setSortOrder('desc');
                            setIsSortMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer ${sortBy === 'date' && sortOrder === 'desc' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          <span>📅 Fecha: Más reciente a más lejana</span>
                          {sortBy === 'date' && sortOrder === 'desc' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('date');
                            setSortOrder('asc');
                            setIsSortMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer ${sortBy === 'date' && sortOrder === 'asc' ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          <span>📅 Fecha: Más lejana a reciente</span>
                          {sortBy === 'date' && sortOrder === 'asc' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </>
                  )}
                </th>
                <th className="py-3 px-3 min-w-[90px]">Municipio</th>
                <th 
                  className="py-3 px-3 min-w-[200px] cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition"
                  onClick={() => {
                    setSortBy('institution');
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}
                  title="Ordenar por institución"
                >
                  <div className="flex items-center gap-1">
                    <span>Institución / Sede</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 min-w-[130px] cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition select-none"
                  onClick={() => {
                    if (sortBy === 'date') {
                      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortBy('date');
                      setSortOrder('desc'); // Por defecto más reciente a más lejana
                    }
                  }}
                  title={sortBy === 'date'
                    ? (sortOrder === 'desc' 
                        ? 'Fecha: Más reciente a más lejana (clic para ordenar de más lejana a reciente)' 
                        : 'Fecha: Más lejana a reciente (clic para ordenar de más reciente a más lejana)')
                    : 'Ordenar por fecha: Más reciente a más lejana'}
                >
                  <div className="flex items-center gap-1">
                    <span>Fecha Real</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === 'date' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    {sortBy === 'date' && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {sortOrder === 'desc' ? '↓ Reciente' : '↑ Lejana'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[130px]">Jornada & Audiencia</th>
                <th className="py-3 px-3 min-w-[160px]">Tipo de Formación</th>
                <th 
                  className="py-3 px-3 min-w-[90px] text-center cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition"
                  onClick={() => {
                    setSortBy('modality');
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Modalidad</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 min-w-[100px] text-center cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition"
                  onClick={() => {
                    setSortBy('status');
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Estado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 min-w-[120px]">Horario</th>
                <th className="py-3 px-3 min-w-[180px]">Observaciones</th>
                <th className="py-3 px-3 text-center min-w-[100px] print:hidden">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {displayedSessions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-semibold">No se encontraron sesiones con los filtros activos</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Prueba restableciendo los filtros o ampliando los términos de búsqueda.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Restablecer Todos los Filtros
                    </button>
                  </td>
                </tr>
              ) : (
                displayedSessions.map((session, idx) => {
                  const isApproved = session.status === 'APROBADO';
                  const isPending = session.status === 'PDTE';
                  const isPresencial = session.modality === 'Presencial';
                  const executionDate = session.specificDate || session.date || '2026-09-15';

                  return (
                    <tr
                      key={session.id || `row-${idx}`}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isPending
                          ? 'bg-amber-50/40 dark:bg-amber-950/20'
                          : idx % 2 === 0
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-slate-50/40 dark:bg-slate-900/40'
                      }`}
                    >
                      {/* Ítem */}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600 dark:text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Municipio */}
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

                      {/* Institución & Sede */}
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

                      {/* Fecha Real de Calendario */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{executionDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {session.daysOfWeek && session.daysOfWeek.length > 0 ? session.daysOfWeek.join(', ') : 'Día programado'}
                        </div>
                      </td>

                      {/* Jornada & Audiencia */}
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
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-[120px]" title={session.gradeOrCycle}>
                              ({session.gradeOrCycle})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tipo de Formación */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {session.trainingType}
                        </div>
                        {session.topic && session.topic !== session.trainingType && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]" title={session.topic}>
                            {session.topic}
                          </div>
                        )}
                      </td>

                      {/* Modalidad */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            isPresencial
                              ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                              : 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                          }`}
                        >
                          {session.modality}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isApproved
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : isPending
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-600 animate-pulse'
                              : session.status === 'Programada'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isApproved ? <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : null}
                          {session.status === 'Programada' ? <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" /> : null}
                          {session.status}
                        </span>
                      </td>

                      {/* Horario */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {session.durationHours} hrs ({session.frequency})
                        </div>
                      </td>

                      {/* Observaciones */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        <p className="line-clamp-2" title={session.observations}>
                          {session.observations}
                        </p>
                      </td>

                      {/* Acciones */}
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

export default SessionsTableView;
