import React, { useState } from 'react';
import { ChangeRequest } from '../types/schedule';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Building2, 
  MessageSquare, 
  AlertCircle,
  Filter,
  Check,
  X
} from 'lucide-react';

interface ChangeRequestsViewProps {
  changeRequests: ChangeRequest[];
  onApprove: (requestId: string, feedback: string) => void;
  onReject: (requestId: string, feedback: string) => void;
}

export const ChangeRequestsView: React.FC<ChangeRequestsViewProps> = ({
  changeRequests,
  onApprove,
  onReject,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Pendiente' | 'Aprobada' | 'Rechazada'>('ALL');
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const handleFeedbackChange = (id: string, text: string) => {
    setFeedbackMap(prev => ({ ...prev, [id]: text }));
  };

  const filtered = changeRequests.filter(req => {
    if (filterStatus === 'ALL') return true;
    return req.status === filterStatus;
  });

  const pendingCount = changeRequests.filter(r => r.status === 'Pendiente').length;
  const approvedCount = changeRequests.filter(r => r.status === 'Aprobada').length;
  const rejectedCount = changeRequests.filter(r => r.status === 'Rechazada').length;

  return (
    <div id="change-requests-view-container" className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Buzón de Solicitudes de Reprogramación (Uribia)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Peticiones de cambio de fecha remitidas por las instituciones educativas de Uribia sujeta a validación de cupos
              </p>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas ({changeRequests.length})
            </button>
            <button
              onClick={() => setFilterStatus('Pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'Pendiente'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('Aprobada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'Aprobada'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobadas ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('Rechazada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'Rechazada'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-100/50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Rechazadas ({rejectedCount})
            </button>
          </div>
        </div>
      </div>

      {/* List of Requests */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No hay solicitudes {filterStatus !== 'ALL' ? `con estado "${filterStatus}"` : 'registradas'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Las instituciones de Uribia con rol de consulta pueden radicar solicitudes de cambio de fecha desde su portal institucional.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => {
            const currentFeedback = feedbackMap[req.id] !== undefined ? feedbackMap[req.id] : (req.coordinatorFeedback || '');
            const isPending = req.status === 'Pendiente';

            return (
              <div 
                key={req.id}
                id={`request-card-${req.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all ${
                  isPending 
                    ? 'border-amber-300 dark:border-amber-500/40 shadow-amber-100/20 dark:shadow-none' 
                    : req.status === 'Aprobada'
                    ? 'border-emerald-200 dark:border-emerald-900/40 opacity-95'
                    : 'border-rose-200 dark:border-rose-900/40 opacity-95'
                }`}
              >
                {/* Header row: Institution + Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {req.institution}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      • Radicado: {new Date(req.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {req.status === 'Pendiente' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Pendiente de Coordinación
                      </span>
                    ) : req.status === 'Aprobada' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Aprobada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Rechazada
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details: Comparativa de Fechas + Horarios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                  {/* Fecha Actual vs Propuesta */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Reprogramación de Fecha
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 line-through">
                        {req.currentDate || 'No definida'}
                      </span>
                      <span className="text-amber-500 font-bold">&rarr;</span>
                      <span className="font-extrabold text-slate-900 dark:text-white bg-amber-100/70 dark:bg-amber-950/50 px-2 py-0.5 rounded text-xs border border-amber-300/60 dark:border-amber-700/50">
                        {req.proposedDate}
                      </span>
                    </div>
                  </div>

                  {/* Horario Propuesto */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Horario Propuesto
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{req.proposedStartTime} - {req.proposedEndTime}</span>
                    </div>
                  </div>

                  {/* Motivo de la Institución */}
                  <div className="bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block">
                      Motivo de la Institución
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{req.reason}"
                    </p>
                  </div>
                </div>

                {/* Sección de Respuesta del Coordinador */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div>
                    <label 
                      htmlFor={`feedback-input-${req.id}`}
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>Mensaje / Motivo de respuesta del Coordinador</span>
                    </label>
                    <textarea
                      id={`feedback-input-${req.id}`}
                      rows={2}
                      disabled={!isPending}
                      value={currentFeedback}
                      onChange={(e) => handleFeedbackChange(req.id, e.target.value)}
                      placeholder={
                        isPending 
                          ? "Escribe las observaciones o justificación para la institución (ej. Aprobado de acuerdo con cupos en campo / Rechazado por evento simultáneo)..." 
                          : "Sin observaciones adicionales registradas."
                      }
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 dark:text-white placeholder:text-slate-400 disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:cursor-not-allowed resize-none"
                    />
                  </div>

                  {/* Acciones para solicitudes pendientes */}
                  {isPending ? (
                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        id={`btn-reject-${req.id}`}
                        type="button"
                        onClick={() => onReject(req.id, currentFeedback)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-300 dark:border-rose-800/60 rounded-xl transition active:scale-95 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Rechazar Solicitud</span>
                      </button>

                      <button
                        id={`btn-approve-${req.id}`}
                        type="button"
                        onClick={() => onApprove(req.id, currentFeedback)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprobar y Actualizar Cronograma</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Dictamen concluido por la Coordinación.</span>
                      {req.coordinatorFeedback && (
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          Mensaje enviado al colegio: "{req.coordinatorFeedback}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
