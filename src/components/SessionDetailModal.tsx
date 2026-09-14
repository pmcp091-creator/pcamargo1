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
  AlertCircle
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

  const isApproved = session.status === 'APROBADO';
  const isPending = session.status === 'POR CONCERTAR' || session.status === 'PDTE';
  const isAdmin = sessionRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header with Municipality & Status */}
        <div className={`p-5 text-white flex items-start justify-between ${
          session.municipality === 'Uribia' ? 'bg-amber-700' :
          session.municipality === 'Riohacha' ? 'bg-sky-800' :
          'bg-emerald-800'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                {session.municipality}
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isApproved ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'
              }`}>
                {session.status}
              </span>
              <span className="text-xs text-white/80 font-medium">
                {session.modality === 'Presencial' ? '🏛️ Presencial' : '💻 Virtual'}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white leading-snug">
              {session.institution}
            </h3>
            {session.campus && session.campus !== session.institution && (
              <p className="text-xs text-white/80 mt-0.5">Sede: {session.campus}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Date & Time Highlight Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Fecha / Días</span>
                <span className="text-xs font-bold text-slate-900">
                  {session.specificDate ? session.specificDate : session.daysOfWeek.join(', ')}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {session.daysOfWeek.join(', ')} ({session.frequency})
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Franja Horaria</span>
                <span className="text-xs font-bold text-slate-900">
                  {session.startTime} - {session.endTime}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {session.durationHours}h por jornada
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Actividad / Formación</span>
              </div>
              <div className="text-xs font-bold text-indigo-950">
                {session.trainingType}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Modalidad: <strong>{session.modality}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Población Objetivo</span>
              </div>
              <div className="text-xs font-bold text-blue-950">
                {session.targetAudience}
              </div>
              {session.gradeOrCycle && (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {session.gradeOrCycle}
                </div>
              )}
            </div>
          </div>

          {/* Infrastructure Notes */}
          {session.infrastructureNotes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Condiciones de Infraestructura</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {session.infrastructureNotes}
              </p>
            </div>
          )}

          {/* Observations */}
          {session.observations && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Observaciones Logísticas
              </span>
              <p className="text-slate-700 text-xs leading-relaxed">
                {session.observations}
              </p>
            </div>
          )}

          {/* Responsible */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Operador: <strong>{session.responsible}</strong></span>
            <span>Jornada: <strong>{session.academicShift}</strong></span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  onDelete(session.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => {
                    onEdit(session);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>📅 Solicitar Cambio de Fecha</span>
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
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
