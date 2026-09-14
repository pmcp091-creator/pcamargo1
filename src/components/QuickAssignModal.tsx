import React, { useState } from 'react';
import { TrainingSession } from '../types/schedule';
import { Sparkles, X, Check, Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface QuickAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingSessions: TrainingSession[];
  allSessions: TrainingSession[];
  onConfirmAssignment: (session: TrainingSession) => void;
}

export const QuickAssignModal: React.FC<QuickAssignModalProps> = ({
  isOpen,
  onClose,
  pendingSessions,
  allSessions,
  onConfirmAssignment
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    pendingSessions[0]?.id || ''
  );
  const [chosenDay, setChosenDay] = useState<string>('Martes');
  const [chosenStartTime, setChosenStartTime] = useState<string>('07:00 AM');
  const [chosenEndTime, setChosenEndTime] = useState<string>('11:00 AM');
  const [chosenShift, setChosenShift] = useState<string>('Mañana (6:00 a.m. - 12:00 m.)');

  if (!isOpen) return null;

  const currentSession = pendingSessions.find(s => s.id === selectedSessionId) || pendingSessions[0];

  // Calculate day counts in Uribia
  const uribiaPresencials = allSessions.filter(
    s => s.municipality === 'Uribia' && s.modality === 'Presencial' && s.status !== 'PDTE'
  );

  const dayOptions = ['Martes', 'Miércoles', 'Jueves'].map(day => {
    const daySessions = uribiaPresencials.filter(s => s.daysOfWeek.includes(day));
    const instNames = Array.from(new Set(daySessions.map(s => s.institution)));
    const count = instNames.length;
    const isFull = count >= 2;
    return { day, count, isFull, instNames };
  });

  const handleApply = () => {
    if (!currentSession) return;

    const updated: TrainingSession = {
      ...currentSession,
      status: 'APROBADO',
      daysOfWeek: [chosenDay],
      startTime: chosenStartTime,
      endTime: chosenEndTime,
      academicShift: chosenShift,
      observations: `${currentSession.observations || ''} [Concertado con I.E. en llamada de coordinación].`.trim()
    };

    onConfirmAssignment(updated);
    if (pendingSessions.length <= 1) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold">
                Asignación de Espacios Pendientes (Uribia)
              </h3>
              <p className="text-xs text-amber-100">
                Acomodar Jaipa y Yotojoroin respetando la Regla de Oro (Máx 2 sedes/día)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {pendingSessions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-900">¡Todos los espacios de Uribia están asignados!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Tanto Jaipa como Yotojoroin tienen sus días y horarios debidamente concertados y aprobados.
              </p>
            </div>
          ) : (
            <>
              {/* Select which pending slot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. Selecciona la Institución Pendiente:
                </label>
                <div className="space-y-2">
                  {pendingSessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        selectedSessionId === session.id
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-200'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{session.institution}</div>
                        <div className="text-[11px] text-slate-500">
                          {session.targetAudience} • {session.trainingType} ({session.modality})
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day selection with capacity check */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. Selecciona el Día de la Semana (Consulta de Cupo en Uribia):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {dayOptions.map(opt => (
                    <button
                      key={opt.day}
                      type="button"
                      onClick={() => setChosenDay(opt.day)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        chosenDay === opt.day
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                          : opt.isFull
                          ? 'border-red-200 bg-red-50/40 text-slate-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">{opt.day}</span>
                      <div className="mt-2">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            opt.isFull
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {opt.count} / 2 Ocupados
                        </span>
                        {opt.instNames.length > 0 && (
                          <div className="text-[9px] text-slate-400 mt-1 line-clamp-1">
                            {opt.instNames.join(', ')}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="text"
                    value={chosenStartTime}
                    onChange={e => setChosenStartTime(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="text"
                    value={chosenEndTime}
                    onChange={e => setChosenEndTime(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cerrar
                </button>
                <button
                  id="btn-confirm-quick-assign"
                  type="button"
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Pasar a APROBADO</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
