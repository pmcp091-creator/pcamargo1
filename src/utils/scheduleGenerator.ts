import { 
  TrainingSession, 
  Municipality, 
  Modality, 
  TrainingType, 
  Frequency, 
  ScheduleStatus 
} from '../types/schedule';
import { 
  validarLimiteUribia, 
  reportarDiagnosticoUribia,
  Sesion,
  Conflicto,
  ResultadoValidacion,
  normalizarSesion
} from './validarCronograma';

export {
  validarLimiteUribia,
  reportarDiagnosticoUribia,
  normalizarSesion
};
export type {
  Sesion,
  Conflicto,
  ResultadoValidacion
};

/**
 * Detecta y purga sesiones con fechas viejas de la rotación previa de Uribia:
 * 1. Guarerapu: eliminar todas las fechas de martes desde el 29-sep en adelante (29-sep, 13-oct, 27-oct, 10-nov, 24-nov).
 * 2. Puay (presencial): eliminar todas las fechas de martes desde el 13-oct en adelante (13-oct, 27-oct, 10-nov, 24-nov).
 * 3. Yotojoroin (presencial): eliminar todas las fechas de jueves desde el 1-oct en adelante (1-oct, 15-oct, 29-oct, 12-nov, 26-nov).
 */
export const isObsoleteUribiaSession = (s: TrainingSession | any): boolean => {
  if (!s) return false;
  const inst = (s.institution || s.campus || '').toLowerCase();
  const idStr = (s.id || '').toLowerCase();
  const date = (s.specificDate || s.date || '').trim();
  const mod = (s.modality || '').toLowerCase();

  // 1. Guarerapu: eliminar fechas viejas de martes desde el 29-sep en adelante
  if (inst.includes('guarerapu') || idStr.includes('guarerapu')) {
    const obsoleteGuarerapuDates = ['2026-09-29', '2026-10-13', '2026-10-27', '2026-11-10', '2026-11-24'];
    if (obsoleteGuarerapuDates.includes(date)) return true;
    if (obsoleteGuarerapuDates.some(d => idStr.includes(d) || idStr.includes(d.replace(/-/g, '')))) return true;
  }

  // 2. Puay (presencial): eliminar fechas viejas de martes desde el 13-oct en adelante
  if ((inst.includes('puay') || idStr.includes('puay')) && (mod === 'presencial' || (!idStr.includes('-ct') && !idStr.includes('-hb')))) {
    const obsoletePuayDates = ['2026-10-13', '2026-10-27', '2026-11-10', '2026-11-24'];
    if (obsoletePuayDates.includes(date)) return true;
    if (obsoletePuayDates.some(d => idStr.includes(d) || idStr.includes(d.replace(/-/g, '')))) return true;
  }

  // 3. Yotojoroin (presencial): eliminar fechas viejas de jueves desde el 1-oct en adelante
  if (inst.includes('yotojoroin') || idStr.includes('yotojoroin')) {
    const obsoleteYotojoroinDates = ['2026-10-01', '2026-10-15', '2026-10-29', '2026-11-12', '2026-11-26'];
    if (obsoleteYotojoroinDates.includes(date)) return true;
    if (obsoleteYotojoroinDates.some(d => idStr.includes(d) || idStr.includes(d.replace(/-/g, '')))) return true;
  }

  return false;
};

export const purgeObsoleteUribiaSessions = (sessions: TrainingSession[]): TrainingSession[] => {
  return sessions.filter(s => !isObsoleteUribiaSession(s));
};

// Helper to determine day of week in Spanish
export const getDayOfWeekSpanish = (dateStr: string): string => {
  const parts = dateStr.split('-');
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

// Helper to calculate duration in hours
export const calculateDuration = (startTime: string, endTime: string): number => {
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
export const formatScheduledMonths = (dates: string[]) => {
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

// Clean hour string for unique ID: e.g. "08:00 AM" -> "0800AM"
export const cleanHourForId = (hourStr: string): string => {
  return hourStr.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

export interface MasterRuleGroup {
  instId: string;
  municipality: Municipality;
  institution: string;
  campus: string;
  academicShift: string;
  trainingType: TrainingType;
  topic: string;
  modality: Modality;
  startTime: string;
  endTime: string;
  frequency: Frequency;
  gradeOrCycle?: string;
  observations: string;
  dates: string[];
  subKey?: string;
  sessionNumbers?: number[];
  status?: ScheduleStatus;
}

// ==============================================================================
// FECHAS BASE DE CALENDARIO (SEPTIEMBRE - DICIEMBRE 2026)
// ==============================================================================
// Continuas semanales para Mega Colegio y Chon-Kay
export const MONDAYS_CONTINUOUS = [
  '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19',
  '2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30'
];
export const TUESDAYS_CONTINUOUS = [
  '2026-09-15', '2026-09-22', '2026-09-29', '2026-10-06', '2026-10-13', '2026-10-20',
  '2026-10-27', '2026-11-03', '2026-11-10', '2026-11-17', '2026-11-24', '2026-12-01'
];
export const WEDNESDAYS_CONTINUOUS = [
  '2026-09-16', '2026-09-23', '2026-09-30', '2026-10-07', '2026-10-14', '2026-10-21',
  '2026-10-28', '2026-11-04', '2026-11-11', '2026-11-18', '2026-11-25', '2026-12-02'
];
export const THURSDAYS_CONTINUOUS = [
  '2026-09-17', '2026-09-24', '2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22',
  '2026-10-29', '2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26', '2026-12-03'
];
export const FRIDAYS_CONTINUOUS = [
  '2026-09-18', '2026-09-25', '2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23',
  '2026-10-30', '2026-11-06', '2026-11-13', '2026-11-20', '2026-11-27', '2026-12-04'
];

// ==============================================================================
// DEFINICIÓN DE GRUPOS DE REGLAS MAESTRAS (SOLO FORMACIÓN DE ESTUDIANTES)
// FORMACIÓN DOCENTE: 0 SESIONES (ELIMINADA TOTALMENTE)
// ==============================================================================
export const MASTER_RULES: MasterRuleGroup[] = [
  // ----------------------------------------------------------------------------
  // [URIBIA]
  // ----------------------------------------------------------------------------

  // 1. Petsuapa
  // Presencial: Jueves (inicia 24-Sep), 08:00 AM - 11:00 AM (quincenal, 6 presenciales)
  {
    instId: 'petsuapa',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (8:00 a.m. - 11:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Presencial',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal para estudiantes (inicia 24-Sep).',
    dates: ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'],
    status: 'APROBADO'
  },
  // Virtual HB: Martes (inicia 29-Sep), 07:45 AM - 09:45 AM
  {
    instId: 'petsuapa',
    subKey: 'hb',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (7:45 a.m. - 9:45 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Habilidades Blandas (inicia 29-Sep).',
    dates: ['2026-09-29', '2026-10-13', '2026-10-27', '2026-11-10', '2026-11-24', '2026-12-08'],
    status: 'APROBADO'
  },
  // Virtual CT: Miércoles (inicia 30-Sep), 07:45 AM - 09:45 AM
  {
    instId: 'petsuapa',
    subKey: 'ct',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (7:45 a.m. - 9:45 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Competencias Técnicas (inicia 30-Sep).',
    dates: ['2026-09-30', '2026-10-14', '2026-10-28', '2026-11-11', '2026-11-25', '2026-12-09'],
    status: 'APROBADO'
  },

  // 2. Guarerapu #3
  // Presencial: Jueves impares (inicia 15-Sep; sesiones 2-6: 01-Oct, 15-Oct, 29-Oct, 12-Nov, 26-Nov), 08:00 AM - 11:00 AM
  {
    instId: 'guarerapu',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (8:00 a.m. - 11:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Presencial',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal (inicia 15-Sep; sesiones 2-6 en Jueves impares 8:00am - 11:00am simultáneo con Apaimana). Solo 6 sesiones presenciales en total.',
    dates: ['2026-09-15', '2026-10-01', '2026-10-15', '2026-10-29', '2026-11-12', '2026-11-26'],
    status: 'APROBADO'
  },

  // 3. Sede Puay
  // Presencial: Martes 15-Sep (sesión 1), Lunes 28-Sep (sesión 2), Miércoles quincenales (sesiones 3-6: 07-Oct, 21-Oct, 04-Nov, 18-Nov), 08:00 AM - 11:00 AM
  {
    instId: 'puay',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (8:00 a.m. - 11:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial en sede Puay (inicia 15-Sep, sesión 2 Lunes 28-Sep; sesiones 3-6 en Miércoles simultáneo con bloque virtual).',
    dates: ['2026-09-15', '2026-09-28', '2026-10-07', '2026-10-21', '2026-11-04', '2026-11-18'],
    status: 'APROBADO'
  },
  // Virtual CT: Miércoles (inicia 23-Sep), 07:00 AM - 09:00 AM
  {
    instId: 'puay',
    subKey: 'ct',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (7:00 a.m. - 9:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Competencias Técnicas (inicia 23-Sep).',
    dates: ['2026-09-23', '2026-10-07', '2026-10-21', '2026-11-04', '2026-11-18', '2026-12-02'],
    status: 'APROBADO'
  },
  // Virtual HB: Miércoles (inicia 23-Sep), 09:00 AM - 11:00 AM
  {
    instId: 'puay',
    subKey: 'hb',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Habilidades Blandas (inicia 23-Sep).',
    dates: ['2026-09-23', '2026-10-07', '2026-10-21', '2026-11-04', '2026-11-18', '2026-12-02'],
    status: 'APROBADO'
  },

  // 4. Walakaly #2
  // Presencial: Miércoles (inicia 23-Sep), 08:30 AM - 11:30 AM (quincenal, 6 presenciales)
  {
    instId: 'walakaly',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (8:30 a.m. - 11:30 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Presencial',
    modality: 'Presencial',
    startTime: '08:30 AM',
    endTime: '11:30 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal en sede Walakaly #2 (inicia 23-Sep).',
    dates: ['2026-09-23', '2026-10-07', '2026-10-21', '2026-11-04', '2026-11-18', '2026-12-02'],
    status: 'APROBADO'
  },
  // Virtual HB: Martes (inicia 29-Sep), 07:45 AM - 09:45 AM
  {
    instId: 'walakaly',
    subKey: 'hb',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (7:45 a.m. - 9:45 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Habilidades Blandas (inicia 29-Sep).',
    dates: ['2026-09-29', '2026-10-13', '2026-10-27', '2026-11-10', '2026-11-24', '2026-12-08'],
    status: 'APROBADO'
  },
  // Virtual CT: Martes (inicia 29-Sep), 09:45 AM - 11:45 AM
  {
    instId: 'walakaly',
    subKey: 'ct',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (9:45 a.m. - 11:45 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '09:45 AM',
    endTime: '11:45 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Competencias Técnicas (inicia 29-Sep).',
    dates: ['2026-09-29', '2026-10-13', '2026-10-27', '2026-11-10', '2026-11-24', '2026-12-08'],
    status: 'APROBADO'
  },

  // 5. Apaimana (solo miércoles y jueves)
  // Presencial: Jueves (inicia 17-Sep), 08:30 AM - 12:00 PM (6 presenciales)
  {
    instId: 'apaimana',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Mañana (8:30 a.m. - 12:00 m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Presencial',
    modality: 'Presencial',
    startTime: '08:30 AM',
    endTime: '12:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial quincenal (inicia 17-Sep). Respetando cupo de 2 sedes/día.',
    dates: ['2026-09-17', '2026-10-01', '2026-10-15', '2026-10-29', '2026-11-12', '2026-11-26'],
    status: 'APROBADO'
  },
  // Virtual HB: Jueves (inicia 24-Sep), 08:30 AM - 10:30 AM
  {
    instId: 'apaimana',
    subKey: 'hb',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Mañana (8:30 a.m. - 10:30 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual',
    modality: 'Virtual',
    startTime: '08:30 AM',
    endTime: '10:30 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Habilidades Blandas (inicia 24-Sep).',
    dates: ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'],
    status: 'APROBADO'
  },

  // 6. Jaipa
  // Presencial: Jueves 17-Sep (excepción inicial) y luego Miércoles quincenal (solo 6 sesiones presenciales, 0 virtuales)
  {
    instId: 'jaipa',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Mañana (8:30 a.m. - 11:30 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas y Habilidades Blandas Integradas',
    modality: 'Presencial',
    startTime: '08:30 AM',
    endTime: '11:30 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Inicia Jueves 17-Sep (excepción inicial); retoma Miércoles 30-Sep cada 15 días (solo 6 presenciales).',
    dates: ['2026-09-17', '2026-09-30', '2026-10-14', '2026-10-28', '2026-11-11', '2026-11-25'],
    status: 'APROBADO'
  },

  // 7. Yotojoroin
  // Presencial: Jueves 17-Sep (sesión 1), Lunes quincenales (sesiones 2-6: 28-Sep, 12-Oct, 26-Oct, 09-Nov, 23-Nov), 08:30 AM - 11:30 AM (HB). Solo 6 presenciales, 0 virtuales.
  {
    instId: 'yotojoroin',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Mañana (8:30 a.m. - 11:30 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Presencial',
    modality: 'Presencial',
    startTime: '08:30 AM',
    endTime: '11:30 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Formación presencial (inicia 17-Sep; sesiones 2-6 en Lunes quincenales 8:30am - 11:30am). Solo 6 sesiones presenciales en total.',
    dates: ['2026-09-17', '2026-09-28', '2026-10-12', '2026-10-26', '2026-11-09', '2026-11-23'],
    status: 'APROBADO'
  },

  // ----------------------------------------------------------------------------
  // [RIOHACHA]
  // ----------------------------------------------------------------------------

  // 8. Denzil Escolar - Sede Dividivi Sabatino (Solo 6 presenciales en total, 0 virtuales)
  // CT: 08:30 AM - 12:00 PM | HB: 01:00 PM - 04:00 PM
  {
    instId: 'denzil-sabatino',
    subKey: 'ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina Mañana (8:30 a.m. - 12:00 m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial (Sabatino)',
    modality: 'Presencial',
    startTime: '08:30 AM',
    endTime: '12:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Ciclos 4, 5 y 6',
    observations: 'Formación presencial sabatina quincenal de Competencias Técnicas (inicia 12-Sep).',
    dates: ['2026-09-12', '2026-09-26', '2026-10-10', '2026-10-24', '2026-11-07', '2026-11-21'],
    status: 'APROBADO'
  },
  {
    instId: 'denzil-sabatino',
    subKey: 'hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina Tarde (1:00 p.m. - 4:00 p.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Presencial (Sabatino)',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '04:00 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Ciclos 4, 5 y 6',
    observations: 'Formación presencial sabatina quincenal de Habilidades Blandas (inicia 12-Sep).',
    dates: ['2026-09-12', '2026-09-26', '2026-10-10', '2026-10-24', '2026-11-07', '2026-11-21'],
    status: 'APROBADO'
  },

  // 9. Luis Antonio Robles (Camarones)
  // Modelo semanal intensivo: Presencial CT Martes (inicia 29-Sep) y Virtual CT Jueves (inicia 01-Oct)
  {
    instId: 'camarones',
    subKey: 'pres',
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (8:00 a.m. - 11:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Presencial - Transición Energética',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Ciclo semanal intensivo: Formación presencial los martes (inicia 29-Sep).',
    dates: ['2026-09-29', '2026-10-06', '2026-10-13', '2026-10-20', '2026-10-27', '2026-11-03'],
    status: 'APROBADO'
  },
  {
    instId: 'camarones',
    subKey: 'virt',
    municipality: 'Riohacha',
    institution: 'I.E. Luis Antonio Robles (Camarones)',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Ciclo semanal intensivo: Bloque virtual los jueves (inicia 01-Oct).',
    dates: ['2026-10-01', '2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29', '2026-11-05'],
    status: 'APROBADO'
  },

  // 10. Mega Colegio Denzil Escolar
  // Presenciales continuas de Lunes a Viernes (15-Sep al 04-Dic)
  // Lunes: Grado 11-03 HB (09:00 - 10:00) | Grado 9-02 CT (10:00 - 11:00) | Grado 11-02 HB (01:00 - 02:00)
  {
    instId: 'denzil-mega',
    subKey: '1103-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (9:00 a.m. - 10:00 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-03',
    modality: 'Presencial',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep).',
    dates: MONDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'denzil-mega',
    subKey: '902-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (10:00 a.m. - 11:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-02',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-02',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep).',
    dates: MONDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'denzil-mega',
    subKey: '1102-hb-lun',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (1:00 p.m. - 2:00 p.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-02',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '02:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-02',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep).',
    dates: MONDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Martes: Grado 9-03 CT (06:00 - 07:00) | Grado 11-02 HB (10:00 - 11:00)
  {
    instId: 'denzil-mega',
    subKey: '903-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (6:00 a.m. - 7:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-03',
    modality: 'Presencial',
    startTime: '06:00 AM',
    endTime: '07:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    dates: TUESDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'denzil-mega',
    subKey: '1102-hb-mar',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (10:00 a.m. - 11:00 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-02',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-02',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    dates: TUESDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Miércoles: Grado 9-04 CT (09:00 - 10:00) | Grado 9-01 CT (01:00 - 02:00)
  {
    instId: 'denzil-mega',
    subKey: '904-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (9:00 a.m. - 10:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-04',
    modality: 'Presencial',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 16-Sep).',
    dates: WEDNESDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'denzil-mega',
    subKey: '901-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (1:00 p.m. - 2:00 p.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-01',
    modality: 'Presencial',
    startTime: '01:00 PM',
    endTime: '02:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-01',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 16-Sep).',
    dates: WEDNESDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Jueves: Grado 10-01 HB (07:00 - 08:00) | Grado 11-01 HB (08:00 - 09:00)
  {
    instId: 'denzil-mega',
    subKey: '1001-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (7:00 a.m. - 8:00 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-01',
    modality: 'Presencial',
    startTime: '07:00 AM',
    endTime: '08:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-01',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    dates: THURSDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'denzil-mega',
    subKey: '1101-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (8:00 a.m. - 9:00 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 11-01',
    modality: 'Presencial',
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 11-01',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    dates: THURSDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Viernes: Grado 10-04 HB (10:00 - 11:00) | Grado 10-03 HB (12:00 - 01:00)
  {
    instId: 'denzil-mega',
    subKey: '1004-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Mañana (10:00 a.m. - 11:00 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-04',
    modality: 'Presencial',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 18-Sep).',
    dates: FRIDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'denzil-mega',
    subKey: '1003-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (12:00 m. - 1:00 p.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-03',
    modality: 'Presencial',
    startTime: '12:00 PM',
    endTime: '01:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 18-Sep).',
    dates: FRIDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Virtuales: Miércoles HB (03:30 - 05:30) y Jueves CT (03:30 - 05:30)
  {
    instId: 'denzil-mega',
    subKey: 'virt-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (3:30 p.m. - 5:30 p.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '03:30 PM',
    endTime: '05:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Bloque virtual quincenal en Habilidades Blandas (inicia 23-Sep).',
    dates: ['2026-09-23', '2026-10-07', '2026-10-21', '2026-11-04', '2026-11-18', '2026-12-02'],
    status: 'APROBADO'
  },
  {
    instId: 'denzil-mega',
    subKey: 'virt-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Mega Colegio Denzil Escolar',
    academicShift: 'Tarde (3:30 p.m. - 5:30 p.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '03:30 PM',
    endTime: '05:30 PM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grado 9°',
    observations: 'Bloque virtual quincenal en Competencias Técnicas (inicia 24-Sep).',
    dates: ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'],
    status: 'APROBADO'
  },

  // 11. I.E. Chon-Kay
  // Presenciales continuas semanales (15-Sep al 04-Dic)
  // Martes: Grado 9-03 CT (04:20 - 05:10) | Grado 9-04 CT (05:10 - 05:55)
  {
    instId: 'chonkay',
    subKey: 'mar-903-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (4:20 p.m. - 5:10 p.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-03',
    modality: 'Presencial',
    startTime: '04:20 PM',
    endTime: '05:10 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    dates: TUESDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'chonkay',
    subKey: 'mar-904-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (5:10 p.m. - 5:55 p.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-04',
    modality: 'Presencial',
    startTime: '05:10 PM',
    endTime: '05:55 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 15-Sep).',
    dates: TUESDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Jueves: Grado 9-03 CT (01:20 - 02:10) | Grado 9-04 CT (02:10 - 03:00)
  {
    instId: 'chonkay',
    subKey: 'jue-903-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (1:20 p.m. - 2:10 p.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-03',
    modality: 'Presencial',
    startTime: '01:20 PM',
    endTime: '02:10 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    dates: THURSDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  {
    instId: 'chonkay',
    subKey: 'jue-904-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (2:10 p.m. - 3:00 p.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Grado 09-04',
    modality: 'Presencial',
    startTime: '02:10 PM',
    endTime: '03:00 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 09-04',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 17-Sep).',
    dates: THURSDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Viernes: Grados 10-04 y 11-03 HB (05:10 - 05:55)
  {
    instId: 'chonkay',
    subKey: 'vie-1004-1103-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (5:10 p.m. - 5:55 p.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grados 10-04 y 11-03',
    modality: 'Presencial',
    startTime: '05:10 PM',
    endTime: '05:55 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grados 10-04 y 11-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 18-Sep).',
    dates: FRIDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Lunes: Grado 10-03 HB (05:10 - 05:55)
  {
    instId: 'chonkay',
    subKey: 'lun-1003-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Tarde (5:10 p.m. - 5:55 p.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Grado 10-03',
    modality: 'Presencial',
    startTime: '05:10 PM',
    endTime: '05:55 PM',
    frequency: 'Semanal',
    gradeOrCycle: 'Grado 10-03',
    observations: 'Presencial semanal continuo hasta el 4 de diciembre (inicia 21-Sep).',
    dates: MONDAYS_CONTINUOUS,
    status: 'APROBADO'
  },
  // Virtuales: Lunes CT (09:00 - 11:00) y Jueves HB (09:00 - 11:00)
  {
    instId: 'chonkay',
    subKey: 'virt-ct',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    trainingType: 'Competencias Técnicas',
    topic: 'Competencias Técnicas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Competencias Técnicas (inicia 21-Sep).',
    dates: ['2026-09-21', '2026-10-05', '2026-10-19', '2026-11-02', '2026-11-16', '2026-11-30'],
    status: 'APROBADO'
  },
  {
    instId: 'chonkay',
    subKey: 'virt-hb',
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Mañana (9:00 a.m. - 11:00 a.m.)',
    trainingType: 'Habilidades Blandas',
    topic: 'Habilidades Blandas Virtual Quincenal',
    modality: 'Virtual',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    frequency: 'Quincenal',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Bloque virtual quincenal en Habilidades Blandas (inicia 24-Sep).',
    dates: ['2026-09-24', '2026-10-08', '2026-10-22', '2026-11-05', '2026-11-19', '2026-12-03'],
    status: 'APROBADO'
  }
];

// ==============================================================================
// GENERADOR MAESTRO DE SESIONES INDIVIDUALES
// Asigna IDs unívocos basados estrictamente en institución y fecha:
// FORMATO EXIGIDO: SES-${instId}-${date}-${startHour}
// ==============================================================================
export const generateMasterSchedule = (): TrainingSession[] => {
  const sessions: TrainingSession[] = [];
  const idOccurrenceMap = new Map<string, number>();
  let globalItemNumber = 1;

  MASTER_RULES.forEach((rule) => {
    const duration = calculateDuration(rule.startTime, rule.endTime);
    const cleanHour = cleanHourForId(rule.startTime);

    rule.dates.forEach((dateStr, idx) => {
      const dayOfWeek = getDayOfWeekSpanish(dateStr);
      const scheduledMonths = formatScheduledMonths([dateStr]);
      const sessionNum = rule.sessionNumbers && rule.sessionNumbers[idx] !== undefined 
        ? rule.sessionNumbers[idx] 
        : (idx + 1);

      // Base ID unívoco exigido: SES-${instId}-${date}-${startHour}
      let baseId = `SES-${rule.instId}-${dateStr}-${cleanHour}`;
      if (rule.subKey) {
        baseId += `-${rule.subKey}`;
      }

      // Desempate garantizado si la misma institución tiene 2 bloques a la misma hora en la misma fecha
      const occurrence = (idOccurrenceMap.get(baseId) || 0) + 1;
      idOccurrenceMap.set(baseId, occurrence);
      const uniqueId = occurrence > 1 ? `${baseId}-${occurrence}` : baseId;

      const session: TrainingSession = {
        id: uniqueId,
        itemNumber: globalItemNumber++,
        municipality: rule.municipality,
        institution: rule.institution,
        campus: rule.campus,
        academicShift: rule.academicShift,
        targetAudience: 'Estudiantes',
        targetPopulation: 'Estudiantes',
        trainingType: rule.trainingType,
        topic: rule.topic,
        modality: rule.modality,
        status: rule.status || 'APROBADO',
        daysOfWeek: [dayOfWeek],
        datesScheduled: scheduledMonths,
        specificDate: dateStr,
        date: dateStr,
        specificDates: [dateStr],
        startTime: rule.startTime,
        endTime: rule.endTime,
        durationHours: duration,
        frequency: rule.frequency,
        responsible: 'The Biz Nation',
        gradeOrCycle: rule.gradeOrCycle,
        observations: rule.observations 
          ? `${rule.observations} (Sesión ${sessionNum})` 
          : `Sesión ${sessionNum} de formación (${rule.modality}).`,
        infrastructureNotes: `Parametrización validada (${rule.frequency}). Horario: ${rule.startTime} - ${rule.endTime}.`,
        lastUpdated: '2026-09-24'
      };

      sessions.push(session);
    });
  });

  // Ejecutar validación determinística territorial de Uribia
  const diagnosticoUribia = validarLimiteUribia(sessions);
  reportarDiagnosticoUribia(diagnosticoUribia);

  return sessions;
};

// Sesiones maestras pregeneradas
export const MASTER_STUDENT_SESSIONS: TrainingSession[] = generateMasterSchedule();

// Métricas de validación del nuevo conjunto de datos
export const getScheduleKpis = (sessions: TrainingSession[] = MASTER_STUDENT_SESSIONS) => {
  const total = sessions.length;
  const presenciales = sessions.filter(s => s.modality === 'Presencial').length;
  const virtuales = sessions.filter(s => s.modality === 'Virtual').length;
  const docentes = sessions.filter(s => 
    (s.targetAudience || '').toLowerCase().includes('docente') || 
    (s.targetPopulation || '').toLowerCase().includes('docente') ||
    (s.trainingType || '').toLowerCase().includes('docente')
  ).length;
  const estudiantes = total - docentes;

  return {
    total,
    presenciales,
    virtuales,
    docentes,
    estudiantes,
    pctPresencial: total > 0 ? Math.round((presenciales / total) * 100) : 0,
    pctVirtual: total > 0 ? Math.round((virtuales / total) * 100) : 0
  };
};

export default MASTER_STUDENT_SESSIONS;
