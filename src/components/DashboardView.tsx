import React, { useMemo } from 'react';
import { TrainingSession, InstitutionProfile } from '../types/schedule';

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

  // Balance Presencial vs Virtual
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

  // Regla Uribia (Días con sobrecupo de más de 2 sedes presenciales simultáneas)
  const uribiaOvercapacityDays = useMemo(() => {
    const countsByDate: Record<string, Set<string>> = {};
    sessions
      .filter(s => 
        s.modality === 'Presencial' && 
        (s.municipality === 'Uribia' || s.institution?.toLowerCase().includes('uribia') ||
         ['petsuapa', 'guarerapu', 'puay', 'walakaly', 'apaimana', 'jaipa', 'yotojoroin'].some(name => s.institution?.toLowerCase().includes(name)))
      )
      .forEach(s => {
        const datesToCheck = s.specificDates && s.specificDates.length > 0 
          ? s.specificDates 
          : [s.date || s.specificDate].filter((d): d is string => Boolean(d));
        datesToCheck.forEach(dateKey => {
          if (!countsByDate[dateKey]) countsByDate[dateKey] = new Set();
          countsByDate[dateKey].add((s.campus || s.institution)?.trim());
        });
      });
    return Object.values(countsByDate).filter(institutionsSet => institutionsSet.size > 2).length;
  }, [sessions]);

  return (
    <div className="space-y-6">
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
