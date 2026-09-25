import React from 'react';
import { TrainingSession } from '../types/schedule';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  Laptop, 
  Building2, 
  AlertTriangle, 
  Edit3, 
  Copy, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Tag,
  FileText
} from 'lucide-react';

interface SessionDetailModalProps {
  session: TrainingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (session: TrainingSession) => void;
  onDuplicate: (session: TrainingSession) => void;
  onDelete: (id: string) => void;
  onRequestReschedule?: (session: TrainingSession) => void;
  sessionRole?: 'admin' | 'viewer';
}

// Función segura de formateo de fecha sin desvío de zona horaria (UTC-safe)
const formatSessionDateSafe = (dateStr?: string, daysFallback: string[] = []): string => {
  if (!dateStr || !dateStr.includes('-')) {
    return daysFallback.length > 0 ? daysFallback.join(', ') : 'Fecha por concertar';
  }
  const [yStr, mStr, dStr] = dateStr.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const d = parseInt(dStr, 10);
  const dateObj = new Date(y, m, d, 12, 0, 0);
  
  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const dayName = DAYS[dateObj.getDay()] || 'Día';
  const monthName = MONTHS[dateObj.getMonth()] || 'Mes';
  return `${dayName}, ${d} de ${monthName} de ${y}`;
};

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onRequestReschedule,
  sessionRole = 'viewer'
}) => {
  if (!isOpen || !session) return null;

  const isApproved = session.status === 'APROBADO' || session.status === 'Programada';
  const isAdmin = sessionRole === 'admin';
  const formattedDate = formatSessionDateSafe(session.specificDate || session.date, session.daysOfWeek);
  const rawDateStr = session.specificDate || session.date || '';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Municipality & Status */}
        <div className={`p-5 text-white flex items-start justify-between ${
          (session.municipality || '').toUpperCase() === 'URIBIA' ? 'bg-amber-600 dark:bg-amber-700' :
          (session.municipality || '').toUpperCase() === 'RIOHACHA' ? 'bg-sky-600 dark:bg-sky-700' :
          'bg-emerald-600 dark:bg-emerald-700'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-black px-2.5 py-0.5 rounded-full bg-black/20 text-white border border-white/30">
                {session.municipality}
              </span>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                isApproved ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'
              }`}>
                {session.status}
              </span>
              <span className="text-xs text-white/90 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                {session.modality === 'Presencial' ? '🏛️ Presencial' : '💻 Virtual'}
              </span>
              {session.itemNumber && (
                <span className="text-[10px] font-mono font-bold text-white/80">
                  Item #{session.itemNumber}
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white leading-snug">
              {session.institution}
            </h3>
            {session.campus && session.campus !== session.institution && (
              <p className="text-xs text-white/90 mt-0.5 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Sede: {session.campus}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-slate-800 dark:text-slate-100">
          {/* Date & Time Highlight Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Fecha Oficial de Calendario
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                  {formattedDate}
                </span>
                {rawDateStr && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    ISO: {rawDateStr}
                  </span>
                )}
                {session.daysOfWeek && session.daysOfWeek.length > 0 && (
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Día programado: {session.daysOfWeek.join(', ')} ({session.frequency || 'Quincenal'})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Franja Horaria y Duración
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                  {session.startTime} - {session.endTime}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {session.durationHours ? `${session.durationHours}h por jornada` : 'Duración estándar'}
                </span>
                <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                  Jornada: {session.academicShift || 'Mañana'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Formación / Actividad</span>
              </div>
              <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                {session.trainingType}
              </div>
              {session.topic && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  Módulo: <strong>{session.topic}</strong>
                </div>
              )}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Modalidad: <strong className="text-slate-700 dark:text-slate-200">{session.modality}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Población Objetivo</span>
              </div>
              <div className="text-xs font-bold text-blue-950 dark:text-blue-200">
                {session.targetAudience}
              </div>
              {session.gradeOrCycle && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  Grupo / Nivel: <strong>{session.gradeOrCycle}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Infrastructure Notes */}
          {session.infrastructureNotes && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Condiciones de Infraestructura</span>
              </div>
              <p className="text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
                {session.infrastructureNotes}
              </p>
            </div>
          )}

          {/* Observations */}
          {session.observations && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase text-[10px] tracking-wider">Observaciones Logísticas</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {session.observations}
              </p>
            </div>
          )}

          {/* Responsible and ID info */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Operador: <strong className="text-slate-700 dark:text-slate-300">{session.responsible || 'The Biz Nation'}</strong></span>
            <span className="font-mono text-[10px] text-slate-400">ID: {session.id}</span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  onDelete(session.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onDuplicate(session);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => {
                    onEdit(session);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modificar / Editar</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              {session.municipality === 'Uribia' && session.modality === 'Presencial' && onRequestReschedule ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestReschedule(session);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>📅 Solicitar Cambio de Fecha</span>
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
