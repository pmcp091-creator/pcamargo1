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

  // Regla Uribia (Días con sobrecupo de más de 2 sedes presenciales)
  const uribiaOvercapacityDays = useMemo(() => {
    const countsByDate: Record<string, Set<string>> = {};
    sessions
      .filter(s => s.modality === 'Presencial' && (s.municipality === 'Uribia' || s.institution?.toLowerCase().includes('uribia')))
      .forEach(s => {
        const datesToCheck = s.specificDates && s.specificDates.length > 0 
          ? s.specificDates 
          : [s.date || s.specificDate].filter((d): d is string => Boolean(d));
        datesToCheck.forEach(dateKey => {
          if (!countsByDate[dateKey]) countsByDate[dateKey] = new Set();
          countsByDate[dateKey].add(s.institution);
        });
      });
    return Object.values(countsByDate).filter(institutionsSet => institutionsSet.size > 2).length;
  }, [sessions]);

  return (
    <div className="space-y-6">
      {/* 1. KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print-kpis">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Sesiones Totales</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalSessions}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${totalSessions > 0 ? 100 : 0}%` }} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Regla Uribia (Sobrecupo)</span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{uribiaOvercapacityDays}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Días con más de 2 sedes simultáneas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Colegios Articulados</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{institutions.length}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">12 sedes oficiales en La Guajira</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Modalidad Presencial</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {presencialesCount}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Formaciones concertadas en sede</p>
        </div>
      </div>

      {/* 2. Gráficas Territoriales y de Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-charts">
        {/* Distribución por Municipio */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">Distribución Territorial de Sesiones</h3>
          <div className="space-y-4">
            {[
              { name: 'Uribia (Alta Guajira)', color: 'bg-amber-500', count: uribiaCount },
              { name: 'Riohacha (Distrito)', color: 'bg-blue-600', count: riohachaCount },
              { name: 'Manaure', color: 'bg-emerald-600', count: manaureCount },
            ].map(m => (
              <div key={m.name}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">{m.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{m.count} sesiones</span>
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
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-xl text-emerald-700 dark:text-emerald-400 mx-auto">
                {presencialesCount}
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2 block">🏛️ Presenciales</span>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center font-black text-xl text-blue-700 dark:text-blue-400 mx-auto">
                {virtualesCount}
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2 block">💻 Virtuales</span>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex items-center justify-center font-black text-xl text-amber-700 dark:text-amber-400 mx-auto">
                {microlearningCount}
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2 block">📱 Microlearning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
