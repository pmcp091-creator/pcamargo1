import { 
  TrainingSession, 
  Municipality, 
  TargetAudience, 
  Modality, 
  TrainingType, 
  Frequency, 
  ScheduleStatus 
} from '../types/schedule';
import { 
  MASTER_RULES, 
  MasterRuleGroup, 
  generateMasterSchedule, 
  MASTER_STUDENT_SESSIONS, 
  getDayOfWeekSpanish, 
  calculateDuration, 
  formatScheduledMonths,
  cleanHourForId,
  isObsoleteUribiaSession
} from '../utils/scheduleGenerator';

export { getDayOfWeekSpanish, calculateDuration, formatScheduledMonths };

export interface RuleGroupDef {
  key: string;
  municipality: Municipality;
  institution: string;
  campus: string;
  academicShift: string;
  targetPopulation: TargetAudience;
  trainingType: TrainingType;
  topic: string;
  modality: Modality;
  startTime: string;
  endTime: string;
  frequency: Frequency;
  gradeOrCycle?: string;
  observations: string;
  dates: string[];
  sessionNumbers?: number[];
  status?: ScheduleStatus;
}

// Convert MasterRuleGroup into RuleGroupDef for backward compatibility
export const allRuleGroups: RuleGroupDef[] = MASTER_RULES.map(r => ({
  key: `${r.instId}${r.subKey ? `-${r.subKey}` : ''}`,
  municipality: r.municipality,
  institution: r.institution,
  campus: r.campus,
  academicShift: r.academicShift,
  targetPopulation: 'Estudiantes',
  trainingType: r.trainingType,
  topic: r.topic,
  modality: r.modality,
  startTime: r.startTime,
  endTime: r.endTime,
  frequency: r.frequency,
  gradeOrCycle: r.gradeOrCycle,
  observations: r.observations,
  dates: r.dates,
  sessionNumbers: r.sessionNumbers,
  status: r.status
}));

// Expand multiple dates into individual TrainingSession records
export const expandToIndividualSessions = (sessions: TrainingSession[]): TrainingSession[] => {
  const result: TrainingSession[] = [];
  let itemCounter = 1;

  sessions.forEach(s => {
    // Excluir cualquier sesión docente o fecha obsoleta de rotación previa
    const isDocente = 
      (s.targetAudience || '').toLowerCase().includes('docente') ||
      (s.targetPopulation || '').toLowerCase().includes('docente') ||
      (s.trainingType || '').toLowerCase().includes('docente');
    if (isDocente || isObsoleteUribiaSession(s)) return;

    const dates = (s.specificDates && s.specificDates.length > 0)
      ? s.specificDates
      : [s.specificDate || s.date || '2026-09-15'];

    if (dates.length <= 1) {
      result.push({
        ...s,
        itemNumber: itemCounter++,
        specificDate: dates[0],
        date: dates[0],
        specificDates: [dates[0]],
        daysOfWeek: s.daysOfWeek && s.daysOfWeek.length > 0 ? s.daysOfWeek : [getDayOfWeekSpanish(dates[0])],
        datesScheduled: formatScheduledMonths([dates[0]])
      });
    } else {
      dates.forEach((d, idx) => {
        const dayName = getDayOfWeekSpanish(d);
        const sessionNum = idx + 1;
        result.push({
          ...s,
          id: `${s.id}_date_${d}`,
          itemNumber: itemCounter++,
          specificDate: d,
          date: d,
          specificDates: [d],
          daysOfWeek: [dayName],
          datesScheduled: formatScheduledMonths([d]),
          observations: s.observations 
            ? `${s.observations} (Sesión ${sessionNum}/${dates.length})` 
            : `Sesión ${sessionNum} de ${dates.length} (${s.modality}).`
        });
      });
    }
  });

  return result;
};

// Generar exactamente 1 TrainingSession por fecha real de ejecución (Solo Estudiantes)
export const calendarExpandedSessions: TrainingSession[] = generateMasterSchedule();

export const initialValidatedSessions: TrainingSession[] = calendarExpandedSessions;
export const SCHEDULE_RULES_SESSIONS: TrainingSession[] = calendarExpandedSessions;

// Exportación explícita de Camarones (12 sesiones completas de ciclo intensivo semanal)
export const camarones12Sessions: TrainingSession[] = calendarExpandedSessions.filter(
  s => (s.institution || '').toLowerCase().includes('camarones')
);

export default calendarExpandedSessions;
