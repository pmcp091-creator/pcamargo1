import React from 'react';
import { TrainingSession, ConflictAlert } from '../types/schedule';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Info, 
  Sparkles,
  Calendar,
  ZapOff,
  Building
} from 'lucide-react';

interface ValidatorViewProps {
  sessions: TrainingSession[];
  alerts: ConflictAlert[];
  onOpenQuickAssign: (institutionName?: string) => void;
  onEditSession: (session: TrainingSession) => void;
}

const URIBIA_DAYS = ['Martes', 'Miércoles', 'Jueves'];

export const ValidatorView: React.FC<ValidatorViewProps> = ({
  sessions,
  alerts,
  onOpenQuickAssign,
  onEditSession
}) => {
  // Compute Uribia in-person distribution by day
  const uribiaPresencials = sessions.filter(
    s => s.municipality === 'Uribia' && s.modality === 'Presencial' && s.status !== 'PDTE'
  );

  const uribiaDayStats = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => {
    const daySessions = uribiaPresencials.filter(s => Array.isArray(s.daysOfWeek) && s.daysOfWeek.includes(day));
    const instNames = Array.from(new Set(daySessions.map(s => s.institution || '')));
    // Filter rural terrain visits vs urban teacher sessions
    const ruralSessions = daySessions.filter(
      s => !s.campus?.toLowerCase().includes('casco urbano') && !(s.institution || '').toLowerCase().includes('casco urbano')
    );
    const ruralInstNames = Array.from(new Set(ruralSessions.map(s => s.institution)));
    // Real conflict only occurs if rural simultaneous visits exceed 2
    const hasConflict = ruralInstNames.length > 2;
    const isAlternatedOrUrban = instNames.length > 2 && ruralInstNames.length <= 2;
    return { day, sessions: daySessions, institutions: instNames, ruralCount: ruralInstNames.length, count: instNames.length, hasConflict, isAlternatedOrUrban };
  });

  const highAlerts = alerts.filter(a => a.severity === 'high');
  const mediumAlerts = alerts.filter(a => a.severity === 'medium');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${highAlerts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {highAlerts.length > 0 ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Panel de Validación y Reglas de Coordinación
                </h2>
                {highAlerts.length === 0 ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Regla de Oro Cumplida
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    {highAlerts.length} Conflicto(s) Detectado(s)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Supervisión automática de la regla de Uribia (máximo 2 instituciones presenciales por día), rotación quincenal, semanas culturales y slots pendientes.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenQuickAssign()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Asignar Instituciones Pendientes</span>
          </button>
        </div>
      </div>

      {/* Regla de Oro Uribia: Daily Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Regla de Uribia: Límite de Simultaneidad Presencial (Máx 2 por día)
            </h3>
            <p className="text-xs text-slate-500">
              Por logística de transporte y facilitadores, solo se pueden atender 2 instituciones por día en Uribia.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
            Alternancia Quincenal (Cada 15 días)
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {uribiaDayStats.map(({ day, institutions, count, ruralCount, hasConflict, isAlternatedOrUrban }) => (
            <div key={day} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${hasConflict ? 'bg-red-50/50' : 'hover:bg-slate-50/60'}`}>
              <div className="flex items-center gap-3">
                <div className="w-24 font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {day}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {institutions.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Sin sedes presenciales</span>
                    ) : (
                      institutions.map(name => (
                        <span
                          key={name}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
                            hasConflict
                              ? 'bg-red-100 text-red-900 border-red-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Status and count */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">
                    {ruralCount} Sedes Rurales / {count} Total
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {hasConflict
                      ? '¡Excede el límite rural!'
                      : isAlternatedOrUrban
                      ? 'Rotación quincenal / Casco urbano'
                      : 'Dentro del cupo permitido'}
                  </div>
                </div>

                {hasConflict ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-md border border-red-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Conflicto
                  </span>
                ) : isAlternatedOrUrban ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200" title="Cumple la Regla de Oro mediante alternancia quincenal y concentración docente en casco urbano">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Coordinado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Válido
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Critical & Medium Alerts */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Alertas de Operación y Logística ({highAlerts.length + mediumAlerts.length})
          </h3>

          {alerts.filter(a => a.severity !== 'info').map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border shadow-xs ${
                alert.severity === 'high'
                  ? 'bg-red-50 border-red-200 text-red-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {alert.severity === 'high' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold">{alert.title}</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/70">
                      {alert.municipality}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-1 leading-relaxed">{alert.description}</p>
                  {alert.suggestedAction && (
                    <div className="text-[11px] font-semibold mt-2 pt-2 border-t border-black/10 flex items-center gap-1">
                      <span>💡 Sugerencia:</span> {alert.suggestedAction}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informative alerts & Calendar reminders */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fechas Especiales & Novedades Institucionales ({infoAlerts.length})
          </h3>

          {infoAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-4 rounded-xl border border-blue-100 bg-blue-50/60 shadow-xs text-blue-950"
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold">{alert.title}</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {alert.dayOfWeek}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-1 leading-relaxed">{alert.description}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Quick instructions for Coordinator */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              📌 Resumen de Reglas para el Coordinador Andrés Fernández
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4 leading-relaxed">
              <li>Formaciones presenciales: Frecuencia quincenal (cada 15 días) para docentes y estudiantes.</li>
              <li>Microlearning: Días fijos Lunes, Miércoles y Viernes en cápsulas digitales de 15 a 20 minutos.</li>
              <li>Chonkay: Formaciones articuladas a las horas de Ética y Competencias Ciudadanas.</li>
              <li>Denzil Sabatinos: Ciclo 4 y 6 en fines de semana con material 100% impreso.</li>
              <li>Guarerapu: Recordar carga previa de baterías al no disponer de energía eléctrica en el container.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
