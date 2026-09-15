import { TrainingSession, Municipality, TargetAudience, Modality, TrainingType, Frequency, ScheduleStatus } from '../types/schedule';

// Helper to determine day of week in Spanish
const getDayOfWeekSpanish = (dateStr: string): string => {
  const parts = dateStr.split('-');
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

// Helper to calculate duration in hours
const calculateDuration = (startTime: string, endTime: string): number => {
  const parseTimeToMinutes = (t: string) => {
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  const diffMinutes = parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
  return Math.max(0.5, Math.round((diffMinutes / 60) * 100) / 100);
};

// Helper to format date list into months
const formatScheduledMonths = (dates: string[]) => {
  const months: { september: string[]; october: string[]; november: string[]; december?: string[] } = {
    september: [],
    october: [],
    november: [],
    december: []
  };
  dates.forEach(d => {
    const parts = d.split('-');
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const dayName = getDayOfWeekSpanish(d);
    const label = `${dayName} ${day}`;
    if (month === 9) months.september.push(label);
    else if (month === 10) months.october.push(label);
    else if (month === 11) months.november.push(label);
    else if (month === 12 && months.december) months.december.push(label);
  });
  return months;
};

interface RuleGroupDef {
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

// ==============================================================================
// FECHAS OFICIALES DE CICLO QUINCENAL (SEPTIEMBRE - DICIEMBRE 2026: 6 SESIONES POR MODALIDAD)
// ==============================================================================
export const MARTES_PRESENCIAL_DATES = ['2026-09-15', '2026-09-29', '2026-10-13', '2026-10-27', '2026-11-10', '2026-11-24'];
export const MARTES_VIRTUAL_DATES = ['2026-09-22', '2026-10-06', '2026-10-20', '2026-11-03', '2026-11-17', '2026-12-01'];
export const MIERCOLES_PRESENCIAL_DATES = ['2026-09-16', '2026-09-30', '2026-10-14', '2026-10-28', '2026-11-11', '2026-11-25'];
export const MIERCOLES_VIRTUAL_DATES = ['2026-09-23', '2026-10-07', '2026-10-21', '2026-11-04', '2026-11-18', '2026-12-02'];
export const JUEVES_PRESENCIAL_DATES = ['2026-09-17', '2026-10-01', '2026-10-15', '2026-10-29', '2026-11-12', '2026-11-26'];
export const JUEVES_VIRTUAL_DATES = ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'];
export const LUNES_VIRTUAL_JAIPA_DATES = ['2026-09-21', '2026-10-05', '2026-10-19', '2026-11-02', '2026-11-16', '2026-11-30'];
export const JAIPA_EST_PRESENCIAL_DATES = ['2026-09-17', '2026-09-30', '2026-10-14', '2026-10-28', '2026-11-11', '2026-11-25'];
export const SABADO_PRESENCIAL_DATES = ['2026-09-12', '2026-09-26', '2026-10-10', '2026-10-24', '2026-11-07', '2026-11-21'];
export const SABADO_VIRTUAL_DATES = ['2026-09-19', '2026-10-03', '2026-10-17', '2026-10-31', '2026-11-14', '2026-11-28'];
export const STANDARD_CYCLE_SESSION_NUMBERS = [1, 2, 3, 4, 5, 6];

// ==============================================================================
// 1. URIBIA: PETSUAPA
// Presencial (Semanas 1, 3, 5, 7, 9, 11 - Jueves): 17-Sep, 01-Oct, 15-Oct, 29-Oct, 12-Nov, 26-Nov
// Virtual (Semanas 2, 4, 6, 8, 10, 12 - Martes / Miércoles)
// ==============================================================================
const petsuapaRules: RuleGroupDef[] = [
  {
    key: 'petsuapa-doc-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (10:00 a.m. - 2:00 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial - Transición Energética',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Sesión presencial quincenal para docentes de Petsuapa.',
    dates: JUEVES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'petsuapa-doc-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Virtual - Transición Energética',
    modality: 'Virtual',
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Bloque virtual de 2 horas exactas para docentes.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'petsuapa-est-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (7:00 a.m. - 10:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Transición Energética',
    modality: 'Presencial',
    startTime: '07:00 AM',
    endTime: '10:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal para estudiantes.',
    dates: JUEVES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'petsuapa-est-hb-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (7:45 a.m. - 9:45 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Habilidades Blandas.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'petsuapa-est-ct-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (7:45 a.m. - 9:45 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas.',
    dates: MIERCOLES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 2. URIBIA: GUARERAPU #3
// Presencial (Semanas 1, 3, 5, 7, 9, 11 - Martes): 15-Sep, 29-Sep, 13-Oct, 27-Oct, 10-Nov, 24-Nov
// Virtual (Semanas 2, 4, 6, 8, 10, 12): Martes / Miércoles / Jueves
// ==============================================================================
const guarerapuRules: RuleGroupDef[] = [
  {
    key: 'guarerapu-doc-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (10:00 a.m. - 1:00 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Sesión presencial quincenal para docentes de Guarerapu.',
    dates: MARTES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'guarerapu-doc-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Virtual',
    modality: 'Virtual',
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Bloque virtual de 2 horas para docentes de Guarerapu.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'guarerapu-est-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (7:00 a.m. - 10:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Presencial',
    modality: 'Presencial',
    startTime: '07:00 AM',
    endTime: '10:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal para estudiantes.',
    dates: MARTES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'guarerapu-est-ct-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (7:00 a.m. - 9:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas de Competencias Técnicas.',
    dates: MIERCOLES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'guarerapu-est-hb-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (7:00 a.m. - 9:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas de Habilidades Blandas.',
    dates: JUEVES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 3. URIBIA: PUAY
// Corrección de horario: Docentes Presencial 02:30 PM - 05:30 PM (Martes quincenal desde 15-Sep)
// Presencial (Semanas 1, 3, 5, 7, 9, 11): 15-Sep, 29-Sep, 13-Oct, 27-Oct, 10-Nov, 24-Nov
// Virtual (Semanas 2, 4, 6, 8, 10, 12): Martes / Miércoles
// ==============================================================================
const puayRules: RuleGroupDef[] = [
  {
    key: 'puay-doc-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Tarde (2:30 p.m. - 5:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial (Casco Urbano Uribia)',
    modality: 'Presencial',
    startTime: '02:30 PM',
    endTime: '05:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Docentes se trasladan al casco urbano para formación (02:30 PM - 05:30 PM).',
    dates: MARTES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'puay-doc-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Virtual',
    modality: 'Virtual',
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Bloque virtual quincenal de 2 horas para docentes.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'puay-est-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (7:00 a.m. - 10:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial',
    modality: 'Presencial',
    startTime: '07:00 AM',
    endTime: '10:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Puay.',
    dates: MARTES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'puay-est-ct-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (7:00 a.m. - 9:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual de 2 horas en Competencias Técnicas.',
    dates: MIERCOLES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'puay-est-hb-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual de 2 horas en Habilidades Blandas.',
    dates: MIERCOLES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 4. URIBIA: WALAKALY #2
// Corrección de horario: Docentes Presencial 02:30 PM - 05:30 PM (Miércoles quincenal desde 16-Sep)
// Presencial (Semanas 1, 3, 5, 7, 9, 11): 16-Sep, 30-Sep, 14-Oct, 28-Oct, 11-Nov, 25-Nov
// Virtual (Semanas 2, 4, 6, 8, 10, 12): Martes
// ==============================================================================
const walakalyRules: RuleGroupDef[] = [
  {
    key: 'walakaly-doc-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Tarde (2:30 p.m. - 5:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial (Casco Urbano)',
    modality: 'Presencial',
    startTime: '02:30 PM',
    endTime: '05:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Formación presencial de docentes en casco urbano de Uribia (02:30 PM - 05:30 PM).',
    dates: MIERCOLES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'walakaly-doc-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Virtual',
    modality: 'Virtual',
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Bloque virtual quincenal de 2 horas para docentes.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'walakaly-est-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (7:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Presencial',
    modality: 'Presencial',
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal de 4 horas en sede Walakaly #2.',
    dates: MIERCOLES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'walakaly-est-hb-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (7:45 a.m. - 9:45 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual de 2 horas en Habilidades Blandas.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'walakaly-est-ct-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (9:45 a.m. - 11:45 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '09:45 AM',
    endTime: '11:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual de 2 horas en Competencias Técnicas.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 5. URIBIA: APAIMANA
// Corrección de horario: Docentes Presencial 01:00 PM - 04:30 PM (Jueves quincenal desde 17-Sep)
// Presencial (Semanas 1, 3, 5, 7, 9, 11): 17-Sep, 01-Oct, 15-Oct, 29-Oct, 12-Nov, 26-Nov
// Virtual (Semanas 2, 4, 6, 8, 10, 12): Martes / Jueves
// ==============================================================================
const apaimanaRules: RuleGroupDef[] = [
  {
    key: 'apaimana-doc-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Tarde (1:00 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Formación presencial quincenal en jornada de la tarde (01:00 PM - 04:30 PM).',
    dates: JUEVES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'apaimana-doc-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Virtual',
    modality: 'Virtual',
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Bloque virtual quincenal de 2 horas para docentes.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'apaimana-est-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Mañana (8:00 a.m. - 12:00 m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Presencial',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '12:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal los jueves.',
    dates: JUEVES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'apaimana-est-hb-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Habilidades Blandas.',
    dates: JUEVES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 6. URIBIA: JAIPA
// Presencial (Semanas 1, 3, 5, 7, 9, 11): 16-Sep (Doc) / 17-Sep (Est), 30-Sep, 14-Oct, 28-Oct, 11-Nov, 25-Nov
// Virtual (Semanas 2, 4, 6, 8, 10, 12): 21-Sep (Doc), 23-Sep (Est), etc.
// ==============================================================================
const jaipaRules: RuleGroupDef[] = [
  {
    key: 'jaipa-doc-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Tarde (1:00 p.m. - 5:00 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '05:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Formación presencial quincenal para docentes de Jaipa en casco urbano.',
    dates: MIERCOLES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'jaipa-doc-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Virtual',
    modality: 'Virtual',
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Bloque virtual quincenal de 2 horas para docentes.',
    dates: LUNES_VIRTUAL_JAIPA_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'jaipa-est-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Mañana (7:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial',
    modality: 'Presencial',
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Inicia presencial Jueves 17-Sep y luego Miércoles cada 15 días (30-Sep, 14-Oct, 28-Oct, 11-Nov, 25-Nov).',
    dates: JAIPA_EST_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'jaipa-est-hb-ct-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Mañana (7:00 a.m. - 9:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Habilidades Blandas y Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual integrado quincenal de 2 horas.',
    dates: MIERCOLES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 7. URIBIA: YOTOJOROIN
// Corrección de horario: Grado 9 Virtual HB 10:15 AM - 12:15 PM (Martes quincenal desde 22-Sep)
// Presencial (Semanas 1, 3, 5, 7, 9, 11): 16-Sep (Doc) / 17-Sep (Est), 30-Sep (Doc) / 01-Oct (Est), etc.
// Virtual (Semanas 2, 4, 6, 8, 10, 12): Martes / Jueves
// ==============================================================================
const yotojoroinRules: RuleGroupDef[] = [
  {
    key: 'yotojoroin-doc-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Tarde (2:30 p.m. - 5:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial',
    modality: 'Presencial',
    startTime: '02:30 PM',
    endTime: '05:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Formación presencial quincenal para docentes de Yotojoroin.',
    dates: MIERCOLES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'yotojoroin-doc-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Virtual',
    modality: 'Virtual',
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Docentes',
    observations: 'Bloque virtual quincenal de 2 horas para docentes.',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'yotojoroin-est-pres',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Mañana (7:30 a.m. - 11:30 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial',
    modality: 'Presencial',
    startTime: '07:30 AM',
    endTime: '11:30 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal de 4 horas.',
    dates: JUEVES_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'yotojoroin-est-hb-g9-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Mañana (10:15 a.m. - 12:15 m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 9° Virtual',
    modality: 'Virtual',
    startTime: '10:15 AM',
    endTime: '12:15 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grado 9°',
    observations: 'Bloque virtual de 2 horas (Grado 9 HB Virtual Martes 10:15 AM - 12:15 PM quincenal desde 22-Sep).',
    dates: MARTES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'yotojoroin-est-hb-g10-11-virt',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Mañana (7:30 a.m. - 9:30 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grados 10° y 11° Virtual',
    modality: 'Virtual',
    startTime: '07:30 AM',
    endTime: '09:30 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas para grados 10 y 11.',
    dates: JUEVES_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 8. RIOHACHA: DENZIL ESCOLAR SABATINO
// Sábados desde 12-Sep presencial / 19-Sep virtual (alternando quincenal, 6 sesiones de cada tipo)
// Presencial: 12-Sep, 26-Sep, 10-Oct, 24-Oct, 07-Nov, 21-Nov
// Virtual: 19-Sep, 03-Oct, 17-Oct, 31-Oct, 14-Nov, 28-Nov
// ==============================================================================
const denzilSabatinoRules: RuleGroupDef[] = [
  {
    key: 'denzil-sab-pres-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina (8:30 a.m. - 12:00 m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial (Sabatino)',
    modality: 'Presencial',
    startTime: '08:30 AM',
    endTime: '12:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Ciclos 4, 5 y 6',
    observations: 'Formación presencial sabatina quincenal de Competencias Técnicas desde el 12-Sep.',
    dates: SABADO_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'denzil-sab-pres-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina Tarde (1:00 p.m. - 4:00 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Presencial (Sabatino)',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '04:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Ciclos 4, 5 y 6',
    observations: 'Formación presencial sabatina quincenal de Habilidades Blandas desde el 12-Sep.',
    dates: SABADO_PRESENCIAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'denzil-sab-virt-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina Temprano (6:30 a.m. - 8:30 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual (Sabatino)',
    modality: 'Virtual',
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Ciclos 4, 5 y 6',
    observations: 'Bloque virtual quincenal sabatino de 2 horas en Competencias Técnicas desde el 19-Sep.',
    dates: SABADO_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  },
  {
    key: 'denzil-sab-virt-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina Mañana (9:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual (Sabatino)',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Ciclos 4, 5 y 6',
    observations: 'Bloque virtual quincenal sabatino de 2 horas en Habilidades Blandas desde el 19-Sep.',
    dates: SABADO_VIRTUAL_DATES,
    sessionNumbers: STANDARD_CYCLE_SESSION_NUMBERS,
    status: 'Programada'
  }
];

// ==============================================================================
// 9. RIOHACHA: LUIS ANTONIO ROBLES (CAMARONES)
// Presencial: 6 sesiones quincenales los miércoles de 08:00 AM a 10:00 AM iniciando el 16-Sep-2026
// (16-Sep, 30-Sep, 14-Oct, 28-Oct, 11-Nov, 25-Nov)
// Virtual: 6 sesiones quincenales de 2 horas los jueves de 09:00 AM a 11:00 AM iniciando el 24-Sep-2026
// (24-Sep, 08-Oct, 22-Oct, 05-Nov, 19-Nov, 03-Dic)
// Total: 12 sesiones completas para Estudiantes en Competencias Técnicas
// ==============================================================================
const camaronesRules: RuleGroupDef[] = [
  {
    key: 'camarones-est-pres-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Luis Antonio Robles (Camarones) los miércoles de 08:00 AM a 10:00 AM.',
    dates: ['2026-09-16', '2026-09-30', '2026-10-14', '2026-10-28', '2026-11-11', '2026-11-25'],
    sessionNumbers: [1, 2, 3, 4, 5, 6],
    status: 'Programada'
  },
  {
    key: 'camarones-est-virt-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas los jueves de 09:00 AM a 11:00 AM.',
    dates: ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'],
    sessionNumbers: [1, 2, 3, 4, 5, 6],
    status: 'Programada'
  }
];

// Explicit export of the 12 complete individual sessions for I.E. Luis Antonio Robles (Camarones)
export const camarones12Sessions: TrainingSession[] = [
  // 6 Sesiones Presenciales Quincenales (Miércoles 08:00 AM - 10:00 AM)
  {
    id: 'sess_camarones-est-pres-ct_2026-09-16',
    itemNumber: 1,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    status: 'Programada',
    daysOfWeek: ['Miércoles'],
    datesScheduled: { september: ['Miércoles 16'] },
    specificDate: '2026-09-16',
    date: '2026-09-16',
    specificDates: ['2026-09-16'],
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Luis Antonio Robles (Camarones) los miércoles de 08:00 AM a 10:00 AM. (Sesión 1)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 08:00 AM - 10:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-pres-ct_2026-09-30',
    itemNumber: 2,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    status: 'Programada',
    daysOfWeek: ['Miércoles'],
    datesScheduled: { september: ['Miércoles 30'] },
    specificDate: '2026-09-30',
    date: '2026-09-30',
    specificDates: ['2026-09-30'],
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Luis Antonio Robles (Camarones) los miércoles de 08:00 AM a 10:00 AM. (Sesión 2)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 08:00 AM - 10:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-pres-ct_2026-10-14',
    itemNumber: 3,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    status: 'Programada',
    daysOfWeek: ['Miércoles'],
    datesScheduled: { october: ['Miércoles 14'] },
    specificDate: '2026-10-14',
    date: '2026-10-14',
    specificDates: ['2026-10-14'],
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Luis Antonio Robles (Camarones) los miércoles de 08:00 AM a 10:00 AM. (Sesión 3)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 08:00 AM - 10:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-pres-ct_2026-10-28',
    itemNumber: 4,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    status: 'Programada',
    daysOfWeek: ['Miércoles'],
    datesScheduled: { october: ['Miércoles 28'] },
    specificDate: '2026-10-28',
    date: '2026-10-28',
    specificDates: ['2026-10-28'],
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Luis Antonio Robles (Camarones) los miércoles de 08:00 AM a 10:00 AM. (Sesión 4)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 08:00 AM - 10:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-pres-ct_2026-11-11',
    itemNumber: 5,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    status: 'Programada',
    daysOfWeek: ['Miércoles'],
    datesScheduled: { november: ['Miércoles 11'] },
    specificDate: '2026-11-11',
    date: '2026-11-11',
    specificDates: ['2026-11-11'],
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Luis Antonio Robles (Camarones) los miércoles de 08:00 AM a 10:00 AM. (Sesión 5)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 08:00 AM - 10:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-pres-ct_2026-11-25',
    itemNumber: 6,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 10:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    status: 'Programada',
    daysOfWeek: ['Miércoles'],
    datesScheduled: { november: ['Miércoles 25'] },
    specificDate: '2026-11-25',
    date: '2026-11-25',
    specificDates: ['2026-11-25'],
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Luis Antonio Robles (Camarones) los miércoles de 08:00 AM a 10:00 AM. (Sesión 6)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 08:00 AM - 10:00 AM.',
    lastUpdated: '2026-09-14'
  },

  // 6 Sesiones Virtuales Quincenales (Jueves 09:00 AM - 11:00 AM)
  {
    id: 'sess_camarones-est-virt-ct_2026-09-24',
    itemNumber: 7,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    status: 'Programada',
    daysOfWeek: ['Jueves'],
    datesScheduled: { september: ['Jueves 24'] },
    specificDate: '2026-09-24',
    date: '2026-09-24',
    specificDates: ['2026-09-24'],
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas los jueves de 09:00 AM a 11:00 AM. (Sesión 1)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 09:00 AM - 11:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-virt-ct_2026-10-08',
    itemNumber: 8,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    status: 'Programada',
    daysOfWeek: ['Jueves'],
    datesScheduled: { october: ['Jueves 08'] },
    specificDate: '2026-10-08',
    date: '2026-10-08',
    specificDates: ['2026-10-08'],
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas los jueves de 09:00 AM a 11:00 AM. (Sesión 2)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 09:00 AM - 11:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-virt-ct_2026-10-22',
    itemNumber: 9,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    status: 'Programada',
    daysOfWeek: ['Jueves'],
    datesScheduled: { october: ['Jueves 22'] },
    specificDate: '2026-10-22',
    date: '2026-10-22',
    specificDates: ['2026-10-22'],
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas los jueves de 09:00 AM a 11:00 AM. (Sesión 3)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 09:00 AM - 11:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-virt-ct_2026-11-05',
    itemNumber: 10,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    status: 'Programada',
    daysOfWeek: ['Jueves'],
    datesScheduled: { november: ['Jueves 05'] },
    specificDate: '2026-11-05',
    date: '2026-11-05',
    specificDates: ['2026-11-05'],
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas los jueves de 09:00 AM a 11:00 AM. (Sesión 4)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 09:00 AM - 11:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-virt-ct_2026-11-19',
    itemNumber: 11,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    status: 'Programada',
    daysOfWeek: ['Jueves'],
    datesScheduled: { november: ['Jueves 19'] },
    specificDate: '2026-11-19',
    date: '2026-11-19',
    specificDates: ['2026-11-19'],
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas los jueves de 09:00 AM a 11:00 AM. (Sesión 5)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 09:00 AM - 11:00 AM.',
    lastUpdated: '2026-09-14'
  },
  {
    id: 'sess_camarones-est-virt-ct_2026-12-03',
    itemNumber: 12,
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetAudience: 'Estudiantes',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    status: 'Programada',
    daysOfWeek: ['Jueves'],
    datesScheduled: { december: ['Jueves 03'] },
    specificDate: '2026-12-03',
    date: '2026-12-03',
    specificDates: ['2026-12-03'],
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas en Competencias Técnicas los jueves de 09:00 AM a 11:00 AM. (Sesión 6)',
    infrastructureNotes: 'Parametrización validada (Quincenal). Horario: 09:00 AM - 11:00 AM.',
    lastUpdated: '2026-09-14'
  }
];

// ==============================================================================
// 10. MANAURE: EL PÁJARO
// Estado 'POR CONCERTAR' / Pendiente por definir (0 sesiones programadas por purga institucional)
// ==============================================================================
const pajaroRules: RuleGroupDef[] = [];

// ==============================================================================
// 11. EXCEPCIÓN CONTINUA SEMANAL: DENZIL ESCOLAR MEGA COLEGIO (Hasta el 4 de diciembre de 2026)
// Clases presenciales semanales de lunes a viernes según distribución por grados (APROBADAS)
// Lunes: 11-03, 09-02, 11-02
// Martes: 09-03, 11-02
// Miércoles: 09-04, 09-01
// Jueves: 10-01, 11-01
// Viernes: 10-04, 10-03
// Virtuales quincenales estudiantes (6 sesiones): Miércoles HB (03:30 PM - 05:30 PM) y Jueves CT (03:30 PM - 05:30 PM) (APROBADAS)
// Docentes: Clases virtuales y presenciales pendientes por definir (POR CONCERTAR)
// ==============================================================================
const mondaysMega = [
  '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19',
  '2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30'
];
const tuesdaysMega = [
  '2026-09-15', '2026-09-22', '2026-09-29', '2026-10-06', '2026-10-13', '2026-10-20',
  '2026-10-27', '2026-11-03', '2026-11-10', '2026-11-17', '2026-11-24', '2026-12-01'
];
const wednesdaysMega = [
  '2026-09-16', '2026-09-23', '2026-09-30', '2026-10-07', '2026-10-14', '2026-10-21',
  '2026-10-28', '2026-11-04', '2026-11-11', '2026-11-18', '2026-11-25', '2026-12-02'
];
const thursdaysMega = [
  '2026-09-17', '2026-09-24', '2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22',
  '2026-10-29', '2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26', '2026-12-03'
];
const fridaysMega = [
  '2026-09-18', '2026-09-25', '2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23',
  '2026-10-30', '2026-11-06', '2026-11-13', '2026-11-20', '2026-11-27', '2026-12-04'
];

const denzilMegaRules: RuleGroupDef[] = [
  // A. Docentes: Clases Presenciales y Virtuales pendientes por definir (POR CONCERTAR)
  {
    key: 'mega-doc-pres',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Por Definir (Semana 5-9 Octubre)',
    targetPopulation: 'Docentes',
    trainingType: 'Formación Docente',
    topic: 'Formación Docente Presencial - Pendiente por definir',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '12:00 PM',
    frequency: 'Por Definir',
    gradeOrCycle: 'Docentes',
    observations: 'Semana del 5 al 9 de octubre de 2026, Jornada Pedagógica Docente Presencial. Estado: Por concertar con directivos.',
    status: 'POR CONCERTAR',
    dates: ['2026-10-05']
  },

  // B. Estudiantes Presenciales Semanales (Lunes a Viernes hasta el 4 de diciembre)
  // Lunes: 11-03, 09-02, 11-02
  {
    key: 'mega-lun-1103-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (9:00 a.m. - 10:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-03',
    modality: 'Presencial',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep; 5-Oct reservado para Jornada Docente).',
    status: 'Programada',
    dates: mondaysMega.filter(d => d !== '2026-10-05')
  },
  {
    key: 'mega-lun-902-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (10:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-02',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-02',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep).',
    status: 'Programada',
    dates: mondaysMega
  },
  {
    key: 'mega-lun-1102-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (1:00 p.m. - 2:00 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-02',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '02:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-02',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep).',
    status: 'Programada',
    dates: mondaysMega
  },

  // Martes: 09-03, 11-02
  {
    key: 'mega-mar-903-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (6:00 a.m. - 7:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-03',
    modality: 'Presencial',
    startTime: '06:00 AM',
    endTime: '07:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    status: 'Programada',
    dates: tuesdaysMega
  },
  {
    key: 'mega-mar-1102-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (10:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-02',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-02',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    status: 'Programada',
    dates: tuesdaysMega
  },

  // Miércoles: 09-04, 09-01
  {
    key: 'mega-mie-904-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (9:00 a.m. - 10:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-04',
    modality: 'Presencial',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 16-Sep).',
    status: 'Programada',
    dates: wednesdaysMega
  },
  {
    key: 'mega-mie-901-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (1:00 p.m. - 2:00 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-01',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '02:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-01',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 16-Sep).',
    status: 'Programada',
    dates: wednesdaysMega
  },

  // Jueves: 10-01, 11-01
  {
    key: 'mega-jue-1001-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (7:00 a.m. - 8:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-01',
    modality: 'Presencial',
    startTime: '07:00 AM',
    endTime: '08:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-01',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    status: 'Programada',
    dates: thursdaysMega
  },
  {
    key: 'mega-jue-1101-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (8:00 a.m. - 9:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-01',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-01',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    status: 'Programada',
    dates: thursdaysMega
  },

  // Viernes: 10-04, 10-03
  {
    key: 'mega-vie-1004-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (10:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-04',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 18-Sep).',
    status: 'Programada',
    dates: fridaysMega
  },
  {
    key: 'mega-vie-1003-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (12:00 m. - 1:00 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-03',
    modality: 'Presencial',
    startTime: '12:00 PM',
    endTime: '01:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 18-Sep).',
    status: 'Programada',
    dates: fridaysMega
  },

  // C. Estudiantes Virtuales (Quincenales, 2 horas exactas, 6 sesiones)
  // Miércoles HB (03:30 PM - 05:30 PM): 23-Sep, 07-Oct, 21-Oct, 04-Nov, 18-Nov, 02-Dic
  {
    key: 'mega-virt-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (3:30 p.m. - 5:30 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '03:30 PM',
    endTime: '05:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas exactas (Miércoles HB 03:30 PM - 05:30 PM, 6 sesiones).',
    status: 'Programada',
    dates: ['2026-09-23', '2026-10-07', '2026-10-21', '2026-11-04', '2026-11-18', '2026-12-02'],
    sessionNumbers: [1, 2, 3, 4, 5, 6]
  },
  // Jueves CT (03:30 PM - 05:30 PM): 24-Sep, 08-Oct, 22-Oct, 05-Nov, 19-Nov, 03-Dic
  {
    key: 'mega-virt-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (3:30 p.m. - 5:30 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '03:30 PM',
    endTime: '05:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grado 9°',
    observations: 'Bloque virtual quincenal de 2 horas exactas (Jueves CT 03:30 PM - 05:30 PM, 6 sesiones).',
    status: 'Programada',
    dates: ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'],
    sessionNumbers: [1, 2, 3, 4, 5, 6]
  }
];

// ==============================================================================
// 12. EXCEPCIÓN CONTINUA SEMANAL: CHON-KAY (Hasta el 4 de diciembre de 2026)
// Presenciales semanales los días Martes, Jueves, Viernes y Lunes (Sep 15 a Dic 4):
// Martes: 09-03 y 09-04
// Jueves: 09-03 y 09-04
// Viernes: Grados 10-04 y 11-03 (Conjunto)
// Lunes: 10-03
// Virtuales quincenales (6 sesiones):
// Lunes CT (09:00 AM - 11:00 AM)
// Jueves HB (09:00 AM - 11:00 AM)
// ==============================================================================
const chonkayRules: RuleGroupDef[] = [
  // Martes (inicia 15-Sep): 09-03 y 09-04
  {
    key: 'chonkay-mar-903-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (4:20 p.m. - 5:10 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-03',
    modality: 'Presencial',
    startTime: '04:20 PM',
    endTime: '05:10 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    status: 'Programada',
    dates: tuesdaysMega
  },
  {
    key: 'chonkay-mar-904-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (5:10 p.m. - 5:55 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-04',
    modality: 'Presencial',
    startTime: '05:10 PM',
    endTime: '05:55 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    status: 'Programada',
    dates: tuesdaysMega
  },

  // Jueves (inicia 17-Sep): 09-03 y 09-04
  {
    key: 'chonkay-jue-903-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (1:20 p.m. - 2:10 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-03',
    modality: 'Presencial',
    startTime: '01:20 PM',
    endTime: '02:10 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    status: 'Programada',
    dates: thursdaysMega
  },
  {
    key: 'chonkay-jue-904-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (2:10 p.m. - 3:00 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-04',
    modality: 'Presencial',
    startTime: '02:10 PM',
    endTime: '03:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    status: 'Programada',
    dates: thursdaysMega
  },

  // Viernes (inicia 18-Sep): Grados 10-04 y 11-03
  {
    key: 'chonkay-vie-1004-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (4:20 p.m. - 5:10 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-04',
    modality: 'Presencial',
    startTime: '04:20 PM',
    endTime: '05:10 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 18-Sep).',
    status: 'Programada',
    dates: fridaysMega
  },
  {
    key: 'chonkay-vie-1103-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (5:10 p.m. - 5:55 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-03',
    modality: 'Presencial',
    startTime: '05:10 PM',
    endTime: '05:55 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 18-Sep).',
    status: 'Programada',
    dates: fridaysMega
  },

  // Lunes (inicia 21-Sep): 10-03
  {
    key: 'chonkay-lun-1003-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (5:10 p.m. - 5:55 p.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-03',
    modality: 'Presencial',
    startTime: '05:10 PM',
    endTime: '05:55 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep).',
    status: 'Programada',
    dates: mondaysMega
  },

  // Virtuales Quincenales (6 sesiones)
  // Lunes CT (09:00 AM - 11:00 AM): 21-Sep, 05-Oct, 19-Oct, 02-Nov, 16-Nov, 30-Nov
  {
    key: 'chonkay-virt-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas exactas (Lunes CT 09:00 AM - 11:00 AM, 6 sesiones).',
    status: 'Programada',
    dates: ['2026-09-21', '2026-10-05', '2026-10-19', '2026-11-02', '2026-11-16', '2026-11-30'],
    sessionNumbers: [1, 2, 3, 4, 5, 6]
  },
  // Jueves HB (09:00 AM - 11:00 AM): 24-Sep, 08-Oct, 22-Oct, 05-Nov, 19-Nov, 03-Dic
  {
    key: 'chonkay-virt-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    targetPopulation: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal de 2 horas exactas (Jueves HB 09:00 AM - 11:00 AM, 6 sesiones).',
    status: 'Programada',
    dates: ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'],
    sessionNumbers: [1, 2, 3, 4, 5, 6]
  }
];

// All rule groups combined
const allRuleGroups: RuleGroupDef[] = [
  ...petsuapaRules,
  ...guarerapuRules,
  ...puayRules,
  ...walakalyRules,
  ...apaimanaRules,
  ...jaipaRules,
  ...yotojoroinRules,
  ...denzilSabatinoRules,
  ...camaronesRules,
  ...pajaroRules,
  ...denzilMegaRules,
  ...chonkayRules
];

// Export all rule groups
export { allRuleGroups };

// Expand multiple dates into individual TrainingSession records
export const expandToIndividualSessions = (sessions: TrainingSession[]): TrainingSession[] => {
  const result: TrainingSession[] = [];
  let itemCounter = 1;

  sessions.forEach(s => {
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

// Generate EXACTLY 1 TrainingSession per real execution date in the Calendar
export const calendarExpandedSessions: TrainingSession[] = (() => {
  const sessionsList: TrainingSession[] = [];
  let counter = 1;

  allRuleGroups.forEach((group) => {
    const isPajaro = group.institution.toLowerCase().includes('pájaro') || 
                     group.institution.toLowerCase().includes('pajaro') ||
                     group.key.includes('pajaro');
    const isMegaDoc = (group.institution.toLowerCase().includes('mega') || (group.campus && group.campus.toLowerCase().includes('mega'))) &&
                      (group.targetPopulation === 'Docentes' || group.trainingType.includes('Docente') || group.key.includes('mega-doc'));

    const resolvedStatus: ScheduleStatus = group.status 
      ? group.status 
      : ((isPajaro || isMegaDoc) ? 'POR CONCERTAR' : 'APROBADO');
    const duration = calculateDuration(group.startTime, group.endTime);

    group.dates.forEach((dateStr, idx) => {
      const dayOfWeek = getDayOfWeekSpanish(dateStr);
      const scheduledMonths = formatScheduledMonths([dateStr]);
      const sessionNum = group.sessionNumbers && group.sessionNumbers[idx] !== undefined 
        ? group.sessionNumbers[idx] 
        : (idx + 1);

      const session: TrainingSession = {
        id: `sess_${group.key}_${dateStr}`,
        itemNumber: counter++,
        municipality: group.municipality,
        institution: group.institution,
        campus: group.campus,
        academicShift: group.academicShift,
        targetAudience: group.targetPopulation,
        targetPopulation: group.targetPopulation,
        trainingType: group.trainingType,
        topic: group.topic,
        modality: group.modality,
        status: resolvedStatus,
        daysOfWeek: [dayOfWeek],
        datesScheduled: scheduledMonths,
        specificDate: dateStr,
        date: dateStr,
        specificDates: [dateStr],
        startTime: group.startTime,
        endTime: group.endTime,
        durationHours: duration,
        frequency: group.frequency,
        responsible: 'The Biz Nation',
        gradeOrCycle: group.gradeOrCycle,
        observations: group.observations 
          ? `${group.observations} (Sesión ${sessionNum})` 
          : `Sesión ${sessionNum} de formación (${group.modality}).`,
        infrastructureNotes: `Parametrización validada (${group.frequency}). Horario: ${group.startTime} - ${group.endTime}.`,
        lastUpdated: '2026-09-14'
      };

      sessionsList.push(session);
    });
  });

  return sessionsList;
})();

export const initialValidatedSessions: TrainingSession[] = calendarExpandedSessions;
export const SCHEDULE_RULES_SESSIONS: TrainingSession[] = calendarExpandedSessions;
export default calendarExpandedSessions;
