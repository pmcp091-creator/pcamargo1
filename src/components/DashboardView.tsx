import React, { useMemo } from 'react';
import { TrainingSession, InstitutionProfile } from '../types/schedule';
import { MASTER_SCHEDULE_VERSION, MASTER_SCHEDULE_TIMESTAMP } from '../utils/scheduleGenerator';
import { validarReglaUribia } from '../utils/uribiaValidator';
import { CheckCircle2, ShieldCheck, Calendar, Clock, Database } from 'lucide-react';

interface DashboardViewProps {
  sessions: TrainingSession[];
  setSessions?: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
  institutions: InstitutionProfile[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  setSessions,
  institutions,
}) => {
  // Métricas Totales
  const totalSessions = sessions.length;

  // Balance Presencial vs Virtual (calculado dinámicamente)
  const presencialesCount = useMemo(
    () => sessions.filter(s => s.modality === 'Presencial').length,
    [sessions]
  );
  const virtualesCount = useMemo(
    () => sessions.filter(s => s.modality === 'Virtual').length,
    [sessions]
  );
  const microlearningCount = useMemo(
    () => sessions.filter(s => s.modality === 'Microlearning').length,
    [sessions]
  );

  // Distribución Territorial
  const uribiaCount = useMemo(
    () => sessions.filter(s => s.municipality === 'Uribia' || s.institution?.toLowerCase().includes('uribia')).length,
    [sessions]
  );
  const riohachaCount = useMemo(
    () => sessions.filter(s => s.municipality === 'Riohacha' || s.institution?.toLowerCase().includes('riohacha')).length,
    [sessions]
  );
  const manaureCount = useMemo(
    () => sessions.filter(s => s.municipality === 'Manaure' || s.institution?.toLowerCase().includes('pajaro') || s.institution?.toLowerCase().includes('manaure')).length,
    [sessions]
  );

  // Regla Uribia (Validación determinística según uribiaValidator: máx. 2 sedes/día)
  const uribiaConflicts = useMemo(() => {
    return validarReglaUribia(sessions).conflictos;
  }, [sessions]);
  const uribiaOvercapacityDays = uribiaConflicts.length;

  return (
    <div className="space-y-6">
      {/* Banner de Sincronización y Versión Oficial (Paso 6) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Fuente Única de Verdad Sincronizada
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  ID Versión: {MASTER_SCHEDULE_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Todas las pestañas (Dashboard, Matriz, Calendario y PDF) leen el mismo arreglo maestro regenerado de {totalSessions} sesiones.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 self-end sm:self-center shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Generación: {MASTER_SCHEDULE_TIMESTAMP.replace('T', ' ')}</span>
          </div>
        </div>
      </div>

      {/* 1. KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 print-kpis">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Gran Total Sesiones</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalSessions}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${totalSessions > 0 ? 100 : 0}%` }} 
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Sep - Dic 2026 (Oficial)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Modalidad Presencial</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {presencialesCount}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${totalSessions > 0 ? (presencialesCount / totalSessions) * 100 : 0}%` }} 
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">En sede ({totalSessions > 0 ? Math.round((presencialesCount / totalSessions) * 100) : 0}%)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Modalidad Virtual</span>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {virtualesCount}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${totalSessions > 0 ? (virtualesCount / totalSessions) * 100 : 0}%` }} 
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Sincrónicas ({totalSessions > 0 ? Math.round((virtualesCount / totalSessions) * 100) : 0}%)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Regla Sobrecupo Uribia</span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{uribiaOvercapacityDays}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: '100%' }} 
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Días con &gt; 2 sedes simultáneas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Instituciones</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{institutions.length}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-500" 
              style={{ width: '100%' }} 
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Sedes oficiales en La Guajira</p>
        </div>
      </div>

      {/* 2. Gráficas Territoriales y de Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-charts">
        {/* Distribución por Municipio */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">Distribución Territorial de Sesiones</h3>
          <div className="space-y-4">
            {[
              { name: 'Riohacha (Distrito)', color: 'bg-blue-600', count: riohachaCount },
              { name: 'Uribia (Alta Guajira)', color: 'bg-amber-500', count: uribiaCount },
              { name: 'Manaure (El Pájaro)', color: 'bg-emerald-600', count: manaureCount, note: manaureCount === 0 ? 'Por definir' : undefined },
            ].map(m => (
              <div key={m.name}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">{m.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {m.count} sesiones {m.note ? `(${m.note})` : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${m.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${totalSessions > 0 ? (m.count / totalSessions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Presencial vs Virtual */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">Balance Presencial vs. Virtual</h3>
          <div className="flex items-center justify-around h-44">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center mx-auto shadow-xs">
                <span className="font-black text-2xl text-emerald-700 dark:text-emerald-400">{presencialesCount}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-semibold">
                  {totalSessions > 0 ? `${Math.round((presencialesCount / totalSessions) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2 block">🏛️ Presenciales</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block">En aula física</span>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center mx-auto shadow-xs">
                <span className="font-black text-2xl text-blue-700 dark:text-blue-400">{virtualesCount}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold">
                  {totalSessions > 0 ? `${Math.round((virtualesCount / totalSessions) * 100)}%` : '0%'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-2 block">💻 Virtuales</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Sincrónicas Teams/Meet</span>
            </div>

            {microlearningCount > 0 && (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center mx-auto shadow-xs">
                  <span className="font-black text-2xl text-amber-700 dark:text-amber-400">{microlearningCount}</span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2 block">📱 Microlearning</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
