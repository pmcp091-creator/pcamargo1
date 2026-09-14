import React, { useState, useEffect, useId } from 'react';
import { TrainingSession, RescheduleRequest } from '../types/schedule';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Building2, 
  ShieldAlert, 
  Info,
  MapPin,
  CalendarDays,
  FileText
} from 'lucide-react';

export interface RequestRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession | null;
  sessions: TrainingSession[];
  restrictedInstName?: string;
  onSubmitRequest: (request: RescheduleRequest) => void;
}

// Convert 24h string ("14:30") to 12h AM/PM ("02:30 PM")
const formatTo12Hour = (time24: string): string => {
  if (!time24) return '';
  if (time24.toUpperCase().includes('AM') || time24.toUpperCase().includes('PM')) {
    return time24;
  }
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
};

// Convert 12h AM/PM string to 24h string ("08:00")
const convertTo24Hour = (timeStr: string = ''): string => {
  if (!timeStr) return '08:00';
  const clean = timeStr.trim();
  if (!clean.toUpperCase().includes('AM') && !clean.toUpperCase().includes('PM')) {
    const parts = clean.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].slice(0, 2)}`;
    }
    return '08:00';
  }
  const isPM = clean.toUpperCase().includes('PM');
  const numbersOnly = clean.toUpperCase().replace('AM', '').replace('PM', '').trim();
  const parts = numbersOnly.split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parts[1] ? parts[1].slice(0, 2) : '00';
  if (isPM && h !== 12) h += 12;
  if (!isPM && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
};

export const RequestRescheduleModal: React.FC<RequestRescheduleModalProps> = ({
  isOpen,
  onClose,
  session,
  sessions,
  restrictedInstName,
  onSubmitRequest,
}) => {
  const formId = useId();
  const [newDate, setNewDate] = useState<string>('');
  const [newStartTime24, setNewStartTime24] = useState<string>('08:00');
  const [newEndTime24, setNewEndTime24] = useState<string>('12:00');
  const [reason, setReason] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Initialize form fields when session opens or changes
  useEffect(() => {
    if (session && isOpen) {
      const initialDate = session.date || session.specificDate || '';
      setNewDate(initialDate);
      setNewStartTime24(convertTo24Hour(session.startTime || '08:00 AM'));
      setNewEndTime24(convertTo24Hour(session.endTime || '12:00 PM'));
      setReason('');
      setIsSubmitted(false);
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  // Validation 1: Check if session is 'Presencial' and in 'Uribia'
  const isEligible = session.modality === 'Presencial' && session.municipality === 'Uribia';

  // Find concurrent presenciales in Uribia on the new selected date (excluding current session)
  const sessionsOnNewDate = sessions.filter(
    (s) =>
      (s.date === newDate || s.specificDate === newDate) &&
      s.modality === 'Presencial' &&
      s.municipality === 'Uribia' &&
      s.id !== session.id
  );

  const presencialesEseDia = sessionsOnNewDate.length;
  const isCupoCompleto = presencialesEseDia >= 2;

  // Date formatted for friendly reading
  const currentDateDisplay = session.date || session.specificDate || 'Fecha no definida';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible) return;
    if (isCupoCompleto) return;
    if (!newDate || !reason.trim()) return;

    const formattedStartTime = formatTo12Hour(newStartTime24);
    const formattedEndTime = formatTo12Hour(newEndTime24);

    const request: RescheduleRequest = {
      id: `req_${Date.now()}`,
      sessionId: session.id,
      institution: session.institution,
      currentDate: session.date || session.specificDate || '',
      proposedDate: newDate,
      proposedStartTime: formattedStartTime,
      proposedEndTime: formattedEndTime,
      reason: reason.trim(),
      status: 'Pendiente',
      coordinatorFeedback: '',
      createdAt: new Date().toISOString(),
    };

    onSubmitRequest(request);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div 
      id="request-reschedule-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reschedule-title"
    >
      <div 
        id="request-reschedule-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="modal-reschedule-title" className="text-lg font-bold tracking-tight">
                Solicitud de Reprogramación de Clase
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Reglamentación Operativa Uribia &bull; Máximo 2 sedes presenciales/día
              </p>
            </div>
          </div>
          <button
            id="btn-close-reschedule-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ineligible State Notification (If not Presencial or not Uribia) */}
        {!isEligible ? (
          <div id="reschedule-ineligible-notice" className="p-6 space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-amber-900">
                  Solicitud no aplicable para esta sesión
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  El protocolo de solicitud de reprogramación mediante validación estricta de cupos aplica exclusivamente para clases con modalidad <strong className="font-semibold text-amber-950">Presencial</strong> en el municipio de <strong className="font-semibold text-amber-950">Uribia</strong> (debido a la capacidad operativa de campo de máximo 2 clases simultáneas por día).
                </p>
                <div className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-amber-100 space-y-1">
                  <div><strong>Institución:</strong> {session.institution}</div>
                  <div><strong>Municipio actual:</strong> {session.municipality}</div>
                  <div><strong>Modalidad actual:</strong> {session.modality}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="btn-ineligible-close"
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        ) : (
          /* Eligible Form Flow */
          <form id={`reschedule-form-${formId}`} onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Session Summary Card */}
            <div id="session-summary-box" className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {session.institution}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {session.modality}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {session.municipality}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 block font-medium">Tema / Asignatura:</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{session.topic || session.trainingType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Fecha Programada Actual:</span>
                  <span className="font-semibold text-slate-800">{currentDateDisplay}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Horario Actual:</span>
                  <span className="font-semibold text-slate-800">{session.startTime} - {session.endTime}</span>
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nueva Fecha */}
              <div className="sm:col-span-1">
                <label 
                  htmlFor="input-new-date" 
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Nueva Fecha *
                </label>
                <input
                  id="input-new-date"
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 font-medium shadow-sm transition-all"
                />
              </div>

              {/* Nueva Hora Inicio */}
              <div>
                <label 
                  htmlFor="input-new-start-time" 
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Nueva Hora Inicio *
                </label>
                <input
                  id="input-new-start-time"
                  type="time"
                  required
                  value={newStartTime24}
                  onChange={(e) => setNewStartTime24(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 font-medium shadow-sm transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Formato: {formatTo12Hour(newStartTime24)}
                </span>
              </div>

              {/* Nueva Hora Fin */}
              <div>
                <label 
                  htmlFor="input-new-end-time" 
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Nueva Hora Fin *
                </label>
                <input
                  id="input-new-end-time"
                  type="time"
                  required
                  value={newEndTime24}
                  onChange={(e) => setNewEndTime24(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 font-medium shadow-sm transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Formato: {formatTo12Hour(newEndTime24)}
                </span>
              </div>
            </div>

            {/* Validation Rule UI Status (Uribia: Máximo 2 presenciales/día) */}
            {newDate ? (
              isCupoCompleto ? (
                /* Alerta de Cupo Diario Completo */
                <div 
                  id="alert-cupo-completo"
                  className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl space-y-2 animate-fadeIn"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-900">
                        ⚠️ Cupo diario completo: Ya existen 2 clases presenciales programadas en Uribia para esta fecha. Por favor selecciona otro día.
                      </h4>
                      <p className="text-xs text-red-700 mt-1">
                        Fecha consultada: <strong className="font-semibold">{newDate}</strong> &bull; Clases presenciales detectadas en Uribia: <strong className="font-semibold">{presencialesEseDia}</strong> de 2 máximas permitidas.
                      </p>
                    </div>
                  </div>

                  {/* List of existing sessions occupying slots */}
                  <div className="mt-2 pt-2 border-t border-red-100 text-xs text-red-800 space-y-1">
                    <span className="font-semibold text-red-900 block">Sedes con clase programada ese día:</span>
                    {sessionsOnNewDate.map((s, idx) => (
                      <div key={s.id || idx} className="flex items-center gap-1.5 pl-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        <span className="font-medium">{s.institution}</span>
                        <span className="text-red-600">({s.startTime} - {s.endTime})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Cupo Disponible */
                <div 
                  id="alert-cupo-disponible"
                  className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 animate-fadeIn"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-900">
                      Cupo disponible para Uribia en esta fecha
                    </div>
                    <div>
                      Actualmente hay <strong className="font-semibold">{presencialesEseDia}</strong> de 2 clases presenciales agendadas para el {newDate}. (Espacios restantes: {2 - presencialesEseDia}).
                    </div>
                    {presencialesEseDia === 1 && sessionsOnNewDate[0] && (
                      <div className="mt-1 text-emerald-700 font-medium">
                        Sede ya asignada: {sessionsOnNewDate[0].institution} ({sessionsOnNewDate[0].startTime} - {sessionsOnNewDate[0].endTime}).
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Selecciona una nueva fecha en el calendario para verificar automáticamente la disponibilidad de cupos en Uribia.</span>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label 
                htmlFor="textarea-reason" 
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Motivo de la Solicitud *
              </label>
              <textarea
                id="textarea-reason"
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explica detalladamente la justificación de la reprogramación (ej. actividad cultural comunitaria, asamblea de autoridades wayuu, día cívico, cruce de calendario escolar)..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 placeholder:text-slate-400 shadow-sm transition-all resize-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Esta justificación será revisada y dictaminada por la Coordinación General del programa.
              </span>
            </div>

            {/* Success Message Banner */}
            {isSubmitted && (
              <div 
                id="reschedule-success-banner" 
                className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>¡Solicitud radicada con éxito! Estado: Pendiente de aprobación del Coordinador.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                id="btn-cancel-reschedule"
                type="button"
                onClick={onClose}
                disabled={isSubmitted}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                id="btn-submit-reschedule"
                type="submit"
                disabled={isCupoCompleto || !newDate || !reason.trim() || isSubmitted}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all ${
                  isCupoCompleto || !newDate || !reason.trim() || isSubmitted
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25 hover:shadow-md'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Enviar Solicitud al Coordinador</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestRescheduleModal;
