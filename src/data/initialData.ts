import { TrainingSession, InstitutionProfile, BrandingSettings } from '../types/schedule';
import { initialValidatedSessions } from './scheduleRulesData';

export const DEFAULT_BRANDING: BrandingSettings = {
  logo1Url: '/logo1.svg',
  logo1Name: 'Biz Nation',
  logo2Url: '/logo2.svg',
  logo2Name: 'The Biz Nation',
  programTitle: 'PROGRAMA VOCACIÓN QUE TRANSFORMA',
  programSubtitle: 'CRONOGRAMA GENERAL DE FORMACIONES - ESTUDIANTES (LA GUAJIRA)',
  organizationName: 'The Biz Nation',
  coordinatorName: 'Andrés Felipe Fernández Morales',
  coordinatorRole: 'Coordinador de Formaciones - The Biz Nation',
  engineerName: 'Pedro Manuel Camargo Pinto',
  engineerRole: 'Ingeniero de Sistemas - The Biz Nation',
  reportNotes: 'Formaciones en competencias técnicas y habilidades blandas para la transición energética en el departamento de La Guajira (Estudiantes).'
};

export const INITIAL_INSTITUTIONS: InstitutionProfile[] = [
  // MANAURE
  {
    id: 'inst-manaure-pajaro',
    name: 'I.E. El Pájaro',
    shortName: 'El Pájaro',
    municipality: 'Manaure',
    daneCode: '244430000201',
    campuses: ['Sede Principal El Pájaro'],
    shifts: ['Mañana (6:00 a.m. - 12:00 m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: false,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: '35 personas por aula',
      generalConditions: 'Zona costera de Manaure. Estado: Por definir / En concertación (0 sesiones programadas por purga institucional).'
    },
    specialAlerts: [
      {
        title: 'Estado: Por definir',
        dates: 'Sep - Dic 2026',
        description: '0 sesiones programadas por purga institucional en Manaure / El Pájaro.',
        level: 'info'
      }
    ]
  },
  // RIOHACHA
  {
    id: 'inst-riohacha-camarones',
    name: 'I.E. Luis Antonio Robles (Camarones)',
    shortName: 'Luis Antonio Robles (Camarones)',
    municipality: 'Riohacha',
    daneCode: '244001001301',
    campuses: ['Sede Principal Camarones', 'I.E. Camarones'],
    shifts: ['Mañana (8:00 a.m. - 11:00 a.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: '40 personas',
      generalConditions: 'Corregimiento de Camarones. Ciclo semanal intensivo: presencial y virtual en la misma semana.'
    },
    specialAlerts: []
  },
  {
    id: 'inst-riohacha-chonkay',
    name: 'I.E. Chon-Kay',
    shortName: 'Chon-Kay',
    municipality: 'Riohacha',
    daneCode: '144001000101',
    campuses: ['Sede Principal Chon-Kay'],
    shifts: ['Jornada Vespertina (12:00 m. - 6:00 p.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: '35 a 45 personas por aula',
      generalConditions: 'Horario según timbre vespertino. Sesiones continuas semanales del 15 de septiembre al 4 de diciembre.'
    },
    specialAlerts: [
      {
        title: 'Articulación Obligatoria de Asignaturas',
        dates: 'Todo el semestre',
        description: 'Las formaciones presenciales se desarrollan continuas semanalmente.',
        level: 'info'
      }
    ]
  },
  {
    id: 'inst-riohacha-denzil-sabatino',
    name: 'I.E. Denzil Escolar - Sabatino',
    shortName: 'Denzil Sabatino',
    municipality: 'Riohacha',
    daneCode: '144001002782',
    campuses: ['Sede Dividivi'],
    shifts: ['Sabatina (8:30 a.m. - 4:00 p.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: 'Salón de biblioteca y sala de informática',
      generalConditions: 'Acceso a internet. Solo 6 sesiones presenciales en total los sábados (CT en la mañana y HB en la tarde).'
    },
    specialAlerts: [
      {
        title: 'Población Vulnerable y Material Impreso',
        dates: 'Jornadas sabatinas',
        description: 'Llevar todo el material impreso. Alta vulnerabilidad de los estudiantes.',
        level: 'warning'
      }
    ]
  },
  {
    id: 'inst-riohacha-denzil-mega',
    name: 'I.E. Denzil Escolar - Mega Colegio',
    shortName: 'Denzil Mega Colegio',
    municipality: 'Riohacha',
    daneCode: '144001002781',
    campuses: ['Sede Mega Colegio'],
    shifts: ['Jornada Mañana y Tarde'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: 'Amplia (40+ por aula)',
      generalConditions: 'Formaciones presenciales continuas semanales de lunes a viernes del 15 de septiembre al 4 de diciembre.'
    },
    specialAlerts: []
  },
  // URIBIA
  {
    id: 'inst-uribia-petsuapa',
    name: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    shortName: 'Petsuapa',
    municipality: 'Uribia',
    daneCode: '244847000301',
    campuses: ['Sede Petsuapa'],
    shifts: ['Mañana (8:00 a.m. - 11:00 a.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: false,
      hasSolarPanels: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: false,
      capacity: '30 o más personas',
      generalConditions: 'Posee salón de reuniones, paneles solares. Presencial quincenal los jueves 08:00 AM - 11:00 AM.'
    },
    specialAlerts: []
  },
  {
    id: 'inst-uribia-guarerapu',
    name: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    shortName: 'Guarerapu #3',
    municipality: 'Uribia',
    daneCode: '244847001402',
    campuses: ['Sede Guarerapu #3'],
    shifts: ['Mañana (8:00 a.m. - 11:00 a.m.)'],
    infrastructure: {
      hasPower: false,
      hasInternet: false,
      hasSolarPanels: false,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Container adaptado (25-30 personas)',
      generalConditions: 'Solo 6 sesiones presenciales en total los martes de 08:00 AM a 11:00 AM.'
    },
    specialAlerts: [
      {
        title: 'Container Sin Energía Eléctrica',
        dates: 'Permanente',
        description: 'Cargar 100% baterías antes de viajar a la sede. Llevar guías impresas de soporte.',
        level: 'critical'
      }
    ]
  },
  {
    id: 'inst-uribia-puay',
    name: 'I.E.I.R. Indígena - Sede Puay',
    shortName: 'Puay',
    municipality: 'Uribia',
    daneCode: '244847002501',
    campuses: ['Sede Puay'],
    shifts: ['Mañana (8:00 a.m. - 11:00 a.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasSolarPanels: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: '60 o más personas con accesibilidad',
      generalConditions: 'Presencial los martes de 08:00 AM a 11:00 AM (2da sesión lunes 28-Sep). 6 sesiones presenciales en total.'
    },
    specialAlerts: []
  },
  {
    id: 'inst-uribia-walakaly',
    name: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    shortName: 'Walakaly #2',
    municipality: 'Uribia',
    daneCode: '244847000302',
    campuses: ['Sede Walakaly #2'],
    shifts: ['Mañana (8:30 a.m. - 11:30 a.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasSolarPanels: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: false,
      capacity: 'Gran capacidad de estudiantes',
      generalConditions: 'Presencial quincenal los miércoles de 08:30 AM a 11:30 AM (inicia 23-Sep).'
    },
    specialAlerts: [
      {
        title: 'Encuentro Étnico Institucional',
        dates: '17 y 18 de Septiembre',
        description: 'No programar formaciones presenciales esos días por celebración étnica comunitaria.',
        level: 'warning'
      }
    ]
  },
  {
    id: 'inst-uribia-apaimana',
    name: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    shortName: 'Apaimana',
    municipality: 'Uribia',
    daneCode: '244847001403',
    campuses: ['Sede Apaimana'],
    shifts: ['Mañana (8:30 a.m. - 12:00 m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Salones amplios',
      generalConditions: 'Presencial quincenal los jueves de 08:30 AM a 12:00 PM (inicia 17-Sep).'
    },
    specialAlerts: []
  },
  {
    id: 'inst-uribia-jaipa',
    name: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    shortName: 'Jaipa',
    municipality: 'Uribia',
    daneCode: '244847001404',
    campuses: ['Sede Jaipa'],
    shifts: ['Mañana (8:30 a.m. - 11:30 a.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: false,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Salones estándar de clase',
      generalConditions: 'Solo 6 sesiones presenciales en total (inicia Jueves 17-Sep y luego Miércoles quincenal).'
    },
    specialAlerts: []
  },
  {
    id: 'inst-uribia-yotojoroin',
    name: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    shortName: 'Yotojoroin',
    municipality: 'Uribia',
    daneCode: '244847003601',
    campuses: ['Sede Principal Yotojoroin'],
    shifts: ['Mañana (8:30 a.m. - 11:30 a.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: false,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Aulas escolares estándar',
      generalConditions: 'Solo 6 sesiones presenciales en total (inicia Jueves 17-Sep, 08:30 AM - 11:30 AM).'
    },
    specialAlerts: []
  }
];

export { initialValidatedSessions } from './scheduleRulesData';
export const INITIAL_SESSIONS: TrainingSession[] = initialValidatedSessions;
export default INITIAL_SESSIONS;
