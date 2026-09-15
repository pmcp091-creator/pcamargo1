import { TrainingSession, InstitutionProfile, BrandingSettings } from '../types/schedule';

export const DEFAULT_BRANDING: BrandingSettings = {
  logo1Url: '/logo1.svg',
  logo1Name: 'Biz Nation',
  logo2Url: '/logo2.svg',
  logo2Name: 'The Biz Nation',
  programTitle: 'PROGRAMA VOCACIÓN QUE TRANSFORMA',
  programSubtitle: 'CRONOGRAMA GENERAL DE FORMACIONES - ESTUDIANTES Y DOCENTES (LA GUAJIRA)',
  organizationName: 'The Biz Nation',
  coordinatorName: 'Andrés Felipe Fernández Morales',
  coordinatorRole: 'Coordinador de Formaciones - The Biz Nation',
  engineerName: 'Pedro Manuel Camargo Pinto',
  engineerRole: 'Ingeniero de Sistemas - The Biz Nation',
  reportNotes: 'Formaciones en competencias técnicas y habilidades blandas para la transición energética. Modalidades presenciales quincenales y cápsulas microlearning continuas.'
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
    shifts: ['Mañana (6:30 a.m. - 12:30 p.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: '40 personas',
      generalConditions: 'Corregimiento de Camarones. Buena accesibilidad por carretera troncal del Caribe, salón múltiple disponible.'
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
      generalConditions: 'Horario según timbre vespertino: 12:00-12:30 Lectura, 12:30-1:20 1ra h, 1:20-2:10 2da h, 2:10-3:00 3ra h, 3:00-3:30 Receso, 3:30-4:20 4ta h, 4:20-5:10 5ta h, 5:10-6:00 6ta h.'
    },
    specialAlerts: [
      {
        title: 'Articulación Obligatoria de Asignaturas',
        dates: 'Todo el semestre',
        description: 'Las formaciones solo se desarrollan en los tiempos establecidos para las clases de Ética y Competencias Ciudadanas.',
        level: 'warning'
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
    shifts: ['Sabatina (6:30 a.m. - 4:00 p.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: 'Salón de biblioteca y sala de informática',
      generalConditions: 'Acceso a internet. Cuenta con sala de biblioteca para formaciones y sala de informática (capacidad por verificar).'
    },
    specialAlerts: [
      {
        title: 'Población Vulnerable y Material Impreso',
        dates: 'Jornadas sabatinas',
        description: 'Llevar todo el material impreso. Alta vulnerabilidad de los estudiantes. Debe haber acompañamiento constante de más de un orientador del equipo Biz y cuerpo docente.',
        level: 'critical'
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
    shifts: ['Jornada Tarde (12:00 m. - 6:00 p.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: 'Amplia (40+ por aula)',
      generalConditions: 'Horario timbre vespertino: 12:00 a 12:30 Lectura, 12:30 a 3:00 Bloque 1, 3:00 a 3:30 Receso, 3:30 a 6:00 Bloque 2.'
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
    shifts: ['Mañana (6:00 a.m. - 12:00 m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: false,
      hasSolarPanels: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: false,
      capacity: '30 o más personas',
      generalConditions: 'Posee salón de reuniones (digitales), paneles solares. No tiene ventilación (abrir ventanas). Posee un televisor, no posee computador. Señal disponible por cercanía al casco urbano.'
    },
    specialAlerts: [
      {
        title: 'Sin Computadores / Solo TV con Paneles Solares',
        dates: 'Permanente',
        description: 'Dispositivos portátiles del equipo facilitador deben venir con batería cargada. Se usa el televisor para proyección.',
        level: 'warning'
      }
    ]
  },
  {
    id: 'inst-uribia-guarerapu',
    name: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    shortName: 'Guarerapu #3',
    municipality: 'Uribia',
    daneCode: '244847001402',
    campuses: ['Sede Guarerapu #3'],
    shifts: ['Mañana (6:00 a.m. - 12:00 m.)'],
    infrastructure: {
      hasPower: false,
      hasInternet: false,
      hasSolarPanels: false,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Container adaptado (25-30 personas)',
      generalConditions: 'El container de formación NO tiene energía eléctrica. Es imperativo recordar a docentes y facilitadores cargar previamente todos sus dispositivos móviles y baterías externas.'
    },
    specialAlerts: [
      {
        title: 'Container Sin Energía Eléctrica',
        dates: 'Permanente',
        description: 'Cargar 100% baterías antes de viajar a la sede. Llevar guías impresas de soporte.',
        level: 'critical'
      },
      {
        title: 'Semanas Culturales de la Institución',
        dates: '13 al 26 de Octubre',
        description: 'Suspensión temporal de formaciones por semanas culturales. Se retoma puntualmente el 27 de octubre de acuerdo al día asignado.',
        level: 'warning'
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
    shifts: ['Mañana (6:00 a.m. - 12:00 m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasSolarPanels: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: true,
      capacity: '60 o más personas con accesibilidad',
      generalConditions: 'Excelente dotación: internet estable, sala digital equipada con pantallas, proyectores, computadores, tablets y 2 canchas deportivas para dinámicas de habilidades blandas.'
    },
    specialAlerts: [
      {
        title: 'Rotación Semanal de Clases',
        dates: 'Permanente',
        description: 'Rotar las clases semanalmente para no interrumpir el plan académico ordinario de la institución.',
        level: 'info'
      },
      {
        title: 'Formación de Docentes en Casco Urbano',
        dates: 'Martes en la tarde',
        description: 'Docentes se trasladan al casco urbano de Uribia los martes de 2:30 a 5:30 p.m.',
        level: 'info'
      }
    ]
  },
  {
    id: 'inst-uribia-walakaly',
    name: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    shortName: 'Walakaly #2',
    municipality: 'Uribia',
    daneCode: '244847000302',
    campuses: ['Sede Walakaly #2'],
    shifts: ['Mañana (6:00 a.m. - 12:00 m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasSolarPanels: true,
      hasScreensOrProjectors: true,
      hasComputersOrTablets: false,
      capacity: 'Gran capacidad de estudiantes',
      generalConditions: 'Internet intermitente (puede fallar). Salones amplios, una pantalla disponible. Docentes realizan formación presencial en casco urbano.'
    },
    specialAlerts: [
      {
        title: 'Encuentro Étnico Institucional',
        dates: '17 y 18 de Septiembre',
        description: 'No programar formaciones presenciales esos días por celebración étnica comunitaria.',
        level: 'warning'
      },
      {
        title: 'Intercalar Días Semanales',
        dates: 'Permanente',
        description: 'Intercalar días para evitar interferir con las materias de mayor complejidad de los estudiantes.',
        level: 'info'
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
    shifts: ['Mañana (6:00 a.m. - 12:00 m.) y Contra jornada'],
    infrastructure: {
      hasPower: true,
      hasInternet: true,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Salones amplios',
      generalConditions: 'Cuenta con acceso a internet y salones cómodos. NO dispone de videoproyectores ni pantallas para las sesiones presenciales (llevar equipo móvil).'
    },
    specialAlerts: [
      {
        title: 'Sin Dispositivos de Proyección',
        dates: 'Permanente',
        description: 'El facilitador debe llevar proyector portátil o rotafolios didácticos.',
        level: 'warning'
      },
      {
        title: 'Inicio en Día Jueves',
        dates: 'Inicio de ciclo',
        description: 'La formación arranca día jueves dado que el miércoles los estudiantes tienen actividad académica fija.',
        level: 'info'
      }
    ]
  },
  {
    id: 'inst-uribia-jaipa',
    name: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    shortName: 'Jaipa',
    municipality: 'Uribia',
    daneCode: '244847001404',
    campuses: ['Sede Jaipa', 'Casco Urbano Uribia'],
    shifts: ['Mañana (7:00 a.m. - 11:00 a.m.)', 'Tarde (1:00 p.m. - 5:00 p.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: false,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Salones estándar de clase (sin auditorio adaptado)',
      generalConditions: 'La institución cuenta con internet del MINTIC, sin embargo este llega a ser ineficiente e incluso puede decirse que no funciona. Dada la ubicación de la institución, no existe cobertura a señal móvil. La institución no cuenta con salas o salones adaptados para reuniones o eventos; solo los salones que dispone para la realización de las actividades.'
    },
    specialAlerts: [
      {
        title: 'Cronograma Pendiente por Concertar',
        dates: 'Ajuste Territorial',
        description: 'Sesiones iniciales en concertación con autoridades educativas locales.',
        level: 'warning'
      },
      {
        title: 'Internet Ineficiente y Sin Cobertura Móvil',
        dates: 'Permanente',
        description: 'No hay conectividad celular ni internet funcional MINTIC. Es obligatorio llevar todo el material físico impreso y dispositivos previamente cargados con baterías de respaldo.',
        level: 'warning'
      },
      {
        title: 'Arranque Especial de Semana',
        dates: 'Jueves 17 de Septiembre',
        description: 'La formación presencial de estudiantes arranca excepcionalmente el jueves 17 de septiembre (7:00 a 11:00 a.m.); en las semanas subsiguientes el horario oficial es miércoles de 7:00 a 11:00 a.m.',
        level: 'info'
      },
      {
        title: 'Formación Docente en Casco Urbano',
        dates: 'Miércoles (1:00 p.m. - 5:00 p.m.)',
        description: 'La capacitación docente presencial se concentra en el casco urbano de Uribia en jornada vespertina.',
        level: 'info'
      }
    ]
  },
  {
    id: 'inst-uribia-yotojoroin',
    name: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    shortName: 'Yotojoroin',
    municipality: 'Uribia',
    daneCode: '244847003601',
    campuses: ['Sede Principal Yotojoroin', 'Casco Urbano Uribia (con Walakaly)'],
    shifts: ['Mañana (7:30 a.m. - 11:30 a.m.)', 'Tarde (2:30 p.m. - 5:30 p.m.)'],
    infrastructure: {
      hasPower: true,
      hasInternet: false,
      hasScreensOrProjectors: false,
      hasComputersOrTablets: false,
      capacity: 'Aulas escolares estándar',
      generalConditions: 'Internet MINTIC con alta fluctuación e inestabilidad. Es obligatorio llevar las formaciones pregrabadas en memorias USB y material offline para las sesiones de los estudiantes.'
    },
    specialAlerts: [
      {
        title: 'Cronograma Pendiente por Concertar',
        dates: 'Ajuste Territorial',
        description: 'Concertación con autoridades tradicionales Wayuu y directivos.',
        level: 'warning'
      },
      {
        title: 'Obligatoriedad de Formaciones Pregrabadas',
        dates: 'Permanente',
        description: 'Por la fluctuación de internet MINTIC en la sede, las sesiones virtuales de competencias técnicas (martes 10:15-12:15) y habilidades blandas (jueves 7:30-9:30) deben impartirse con cápsulas pregrabadas offline.',
        level: 'warning'
      },
      {
        title: 'Docentes en Casco Urbano (Unificado con Walakaly)',
        dates: 'Miércoles (2:30 p.m. - 5:30 p.m.)',
        description: 'Formación docente presencial unificada los miércoles en el casco urbano de Uribia junto con el equipo docente de Walakaly #2.',
        level: 'info'
      },
      {
        title: 'Inicio Presencial Estudiantes',
        dates: 'Jueves 17 de Septiembre',
        description: 'Sesión presencial de estudiantes arranca el jueves 17 de septiembre de 7:30 a 11:30 a.m. Respetando el tope de 2 instituciones presenciales en Uribia.',
        level: 'info'
      }
    ]
  }
];

export { initialValidatedSessions } from './scheduleRulesData';

export const INITIAL_SESSIONS: TrainingSession[] = [
  // ==========================================
  // URIBIA: PETSUAPA (Aprobado en Excel)
  // ==========================================
  {
    id: 'sess-01',
    itemNumber: 1,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Lunes', 'Miércoles', 'Viernes'],
    datesScheduled: {
      september: ['Lunes 14', 'Miércoles 16', 'Viernes 18', 'Lunes 21', 'Miércoles 23', 'Viernes 25', 'Lunes 28', 'Miércoles 30'],
      october: ['Continuo L-M-V'],
      november: ['Continuo L-M-V']
    },
    startTime: '08:00 AM',
    endTime: '08:15 AM',
    durationHours: 0.3,
    frequency: '3 veces/semana (continuo)',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Envío autónomo fuera del aula; horario referencial de interacción del estudiante con la cápsula.',
    infrastructureNotes: 'Señal celular disponible cerca al casco urbano.'
  },
  {
    id: 'sess-02',
    itemNumber: 2,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 16', 'Miércoles 30'],
      october: ['Miércoles 14', 'Miércoles 28'],
      november: ['Miércoles 11', 'Miércoles 25']
    },
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Competencias técnicas para la transición energética.',
    infrastructureNotes: 'Salón de reuniones digitales, paneles solares.'
  },
  {
    id: 'sess-03',
    itemNumber: 3,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 10', 'Jueves 24'],
      october: ['Jueves 8', 'Jueves 22'],
      november: ['Jueves 5', 'Jueves 19']
    },
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Taller práctico presencial con facilitador en sede.',
    infrastructureNotes: 'Capacidad 30 personas. No posee computadores, llevar material.'
  },
  {
    id: 'sess-04',
    itemNumber: 4,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Liderazgo, comunicación y trabajo en equipo.',
    infrastructureNotes: 'Uso de televisor con paneles solares.'
  },
  {
    id: 'sess-05',
    itemNumber: 5,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 10', 'Jueves 24'],
      october: ['Jueves 8', 'Jueves 22'],
      november: ['Jueves 5', 'Jueves 19']
    },
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Encuentros presenciales en salón comunal/escolar.',
    infrastructureNotes: 'Se combinan horarios con CT para optimizar viaje del facilitador.'
  },
  {
    id: 'sess-06',
    itemNumber: 6,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Cuerpo Docente',
    observations: 'Formación pedagógica docente en contenidos de transición energética.',
    infrastructureNotes: 'Sesión sincrónica virtual.'
  },
  {
    id: 'sess-07',
    itemNumber: 7,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Petsuapa',
    campus: 'Sede Petsuapa',
    academicShift: 'Mañana (10:00 a.m. - 1:00 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 10', 'Jueves 24'],
      october: ['Jueves 8', 'Jueves 22'],
      november: ['Jueves 5', 'Jueves 19']
    },
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Cuerpo Docente',
    observations: 'Acompañamiento situado a docentes en sede Petsuapa.',
    infrastructureNotes: 'Aprovechamiento de la jornada presencial del facilitador.'
  },

  // ==========================================
  // URIBIA: WALAKALY #2 (Aprobado en Excel)
  // ==========================================
  {
    id: 'sess-08',
    itemNumber: 8,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Lunes', 'Miércoles', 'Viernes'],
    datesScheduled: {
      september: ['L-M-V Continuo'],
      october: ['L-M-V Continuo'],
      november: ['L-M-V Continuo']
    },
    startTime: '06:00 AM',
    endTime: '06:15 AM',
    durationHours: 0.3,
    frequency: '3 veces/semana (continuo)',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Envío autónomo fuera del aula; horario referencial de interacción con la cápsula.',
    infrastructureNotes: 'Internet puede llegar a fallar, envío vía WhatsApp/SMS.'
  },
  {
    id: 'sess-09',
    itemNumber: 9,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '09:45 AM',
    endTime: '11:45 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Formación virtual en salón comunal con pantalla.',
    infrastructureNotes: 'Posee una pantalla. Alerta: 17 y 18 sept encuentro étnico.'
  },
  {
    id: 'sess-10',
    itemNumber: 10,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 9', 'Miércoles 23'],
      october: ['Miércoles 7', 'Miércoles 21'],
      november: ['Miércoles 4', 'Miércoles 18']
    },
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Talleres presenciales intercalando días para no saturar.',
    infrastructureNotes: 'Salones amplios para gran número de estudiantes.'
  },
  {
    id: 'sess-11',
    itemNumber: 11,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '07:45 AM',
    endTime: '09:45 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Virtual en la mañana antes de CT.',
    infrastructureNotes: 'Intercalar para no interferir materias complejas.'
  },
  {
    id: 'sess-12',
    itemNumber: 12,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Sede Walakaly #2',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 9', 'Miércoles 23'],
      october: ['Miércoles 7', 'Miércoles 21'],
      november: ['Miércoles 4', 'Miércoles 18']
    },
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Presencial con facilitador en aula.',
    infrastructureNotes: 'Se respeta cupo y espacios de descanso.'
  },
  {
    id: 'sess-13',
    itemNumber: 13,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Media Luna Jawou - Sede Walakaly #2',
    campus: 'Casco Urbano Uribia',
    academicShift: 'Tarde (2:30 p.m. - 5:30 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 9', 'Miércoles 23'],
      october: ['Miércoles 7', 'Miércoles 21'],
      november: ['Miércoles 4', 'Miércoles 18']
    },
    startTime: '02:30 PM',
    endTime: '05:30 PM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Cuerpo Docente',
    observations: 'Docentes se trasladan al casco urbano de Uribia para la sesión.',
    infrastructureNotes: 'Punto de encuentro casco urbano.'
  },

  // ==========================================
  // URIBIA: PUAY (Aprobado en Excel)
  // ==========================================
  {
    id: 'sess-14',
    itemNumber: 14,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Lunes', 'Miércoles', 'Viernes'],
    datesScheduled: {
      september: ['L-M-V Continuo'],
      october: ['L-M-V Continuo'],
      november: ['L-M-V Continuo']
    },
    startTime: '06:00 AM',
    endTime: '06:15 AM',
    durationHours: 0.3,
    frequency: '3 veces/semana (continuo)',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Cápsulas de aprendizaje digital autónomo.',
    infrastructureNotes: 'Internet estable disponible.'
  },
  {
    id: 'sess-15',
    itemNumber: 15,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 23', 'Miércoles 7'],
      october: ['Miércoles 21', 'Miércoles 4'],
      november: ['Miércoles 18', 'Miércoles 2']
    },
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Virtual apoyado en sala digital con tablets.',
    infrastructureNotes: 'Sala digital de 60+ personas.'
  },
  {
    id: 'sess-16',
    itemNumber: 16,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Presencial en sede. Facilitador llega a más tardar 7:30 a.m.',
    infrastructureNotes: 'Se rotan semanas con otros grupos.'
  },
  {
    id: 'sess-17',
    itemNumber: 17,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 23', 'Miércoles 7'],
      october: ['Miércoles 21', 'Miércoles 4'],
      november: ['Miércoles 18', 'Miércoles 2']
    },
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Sesión virtual después de CT.',
    infrastructureNotes: 'Pantallas y proyectores de alta resolución.'
  },
  {
    id: 'sess-18',
    itemNumber: 18,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Sede Puay',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Dinámicas en canchas deportivas y salón.',
    infrastructureNotes: 'Espacio deportivo idóneo para HB.'
  },
  {
    id: 'sess-19',
    itemNumber: 19,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Indígena - Sede Puay',
    campus: 'Casco Urbano Uribia',
    academicShift: 'Tarde (2:30 p.m. - 5:30 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '02:30 PM',
    endTime: '05:30 PM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Cuerpo Docente',
    observations: 'Presenciales en casco urbano de Uribia a partir del 15 de septiembre.',
    infrastructureNotes: 'Facilitación centralizada en Uribia.'
  },

  // ==========================================
  // URIBIA: GUARERAPU #3 (Aprobado en Excel)
  // ==========================================
  {
    id: 'sess-20',
    itemNumber: 20,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Lunes', 'Miércoles', 'Viernes'],
    datesScheduled: {
      september: ['L-M-V Continuo'],
      october: ['Pausa 13-26 Oct (Semana Cultural)', 'Retoma 27 Oct'],
      november: ['L-M-V Continuo']
    },
    startTime: '06:00 AM',
    endTime: '06:15 AM',
    durationHours: 0.3,
    frequency: '3 veces/semana (continuo)',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Cápsulas formativas autónomas.',
    infrastructureNotes: 'Recordar a docentes cargar sus dispositivos con anticipación.'
  },
  {
    id: 'sess-21',
    itemNumber: 21,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 23'],
      october: ['Miércoles 7', 'Miércoles 21', 'Pausa cultural 13 oct'],
      november: ['Miércoles 4', 'Miércoles 18']
    },
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Se mueve semana a semana de martes a jueves según regla.',
    infrastructureNotes: 'El container no tiene energía.'
  },
  {
    id: 'sess-22',
    itemNumber: 22,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13 (Suspende)', 'Martes 27 (Retoma)'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '07:00 AM',
    endTime: '10:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Presencial en container escolar. Máximo 2 instituciones por día en Uribia.',
    infrastructureNotes: 'Llevar baterías portátiles cargadas.'
  },
  {
    id: 'sess-23',
    itemNumber: 23,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 24'],
      october: ['Jueves 8', 'Jueves 22'],
      november: ['Jueves 5', 'Jueves 19']
    },
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Módulo virtual de comunicación y proyecto de vida.',
    infrastructureNotes: 'Recargar celulares y tablets previamente.'
  },
  {
    id: 'sess-24',
    itemNumber: 24,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Guarerapu #3',
    campus: 'Sede Guarerapu #3',
    academicShift: 'Mañana (6:00 a.m. - 12:00 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13 (Suspende)', 'Martes 27 (Retoma)'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '07:00 AM',
    endTime: '10:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Sesión presencial práctica en alternancia.',
    infrastructureNotes: 'Retoma actividades tras semana cultural.'
  },

  // ==========================================
  // URIBIA: APAIMANA (Aprobado en Excel)
  // ==========================================
  {
    id: 'sess-25',
    itemNumber: 25,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Mañana y Tarde',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 17', 'Jueves 24'],
      october: ['Jueves 8', 'Jueves 22'],
      november: ['Jueves 5', 'Jueves 19']
    },
    startTime: '08:00 AM',
    endTime: '12:00 PM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Arrancaría el día jueves, dado que el miércoles tienen actividad académica. Días permitidos: miércoles y jueves.',
    infrastructureNotes: 'No tienen pantallas ni proyectores (llevar proyector portátil).'
  },
  {
    id: 'sess-26',
    itemNumber: 26,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Mañana y Tarde',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 23'],
      october: ['Miércoles 7', 'Miércoles 21'],
      november: ['Miércoles 4', 'Miércoles 18']
    },
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Conexión a internet estable en salones amplios.',
    infrastructureNotes: 'Rotación con docentes en contra jornada.'
  },
  {
    id: 'sess-27',
    itemNumber: 27,
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Apaimana',
    campus: 'Sede Apaimana',
    academicShift: 'Contra jornada (1:00 p.m. - 4:30 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles', 'Jueves'],
    datesScheduled: {
      september: ['Jueves 17', 'Miércoles 23'],
      october: ['Jueves 8', 'Miércoles 21'],
      november: ['Jueves 5', 'Miércoles 18']
    },
    startTime: '01:00 PM',
    endTime: '04:30 PM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Cuerpo Docente',
    observations: 'Docentes en contra jornada. Martes virtual 2:30 a 4:30 p.m.',
    infrastructureNotes: 'Salón amplio para docentes.'
  },

  // ==========================================
  // URIBIA: JAIPA (APROBADO - Sede Jaipa e Isidro Ibarra)
  // ==========================================
  {
    id: 'sess-28',
    itemNumber: 28,
    specificDate: '2026-09-17',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Mañana (7:00 a.m. - 11:00 a.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles', 'Jueves'],
    datesScheduled: {
      september: ['Jueves 17', 'Miércoles 30'],
      october: ['Miércoles 14', 'Miércoles 28'],
      november: ['Miércoles 11', 'Miércoles 25']
    },
    startTime: '07:00 AM',
    endTime: '11:00 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Presenciales: Miércoles de 7:00 a 11:00 a.m. Semana de inicio arranca el jueves 17 de septiembre. Rotación quincenal.',
    infrastructureNotes: 'Internet MINTIC ineficiente/no funcional, sin cobertura celular. Salones convencionales disponibles.'
  },
  {
    id: 'sess-29',
    itemNumber: 29,
    specificDate: '2026-09-16',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Mañana (7:00 a.m. - 9:00 a.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 16', 'Miércoles 23', 'Miércoles 30'],
      october: ['Miércoles 7', 'Miércoles 14', 'Miércoles 21', 'Miércoles 28'],
      november: ['Miércoles 4', 'Miércoles 11', 'Miércoles 18', 'Miércoles 25']
    },
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    durationHours: 2.0,
    frequency: 'Semanal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Virtuales: Impartidas de manera presencial asistida los días miércoles de 7:00 a 9:00 a.m. en el aula.',
    infrastructureNotes: 'Apoyo con facilitador por falta de conectividad móvil e internet.'
  },
  {
    id: 'sess-30',
    itemNumber: 30,
    specificDate: '2026-09-16',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Casco Urbano Uribia',
    academicShift: 'Tarde (1:00 p.m. - 5:00 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Formación Docente',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 16', 'Miércoles 30'],
      october: ['Miércoles 14', 'Miércoles 28'],
      november: ['Miércoles 11', 'Miércoles 25']
    },
    startTime: '01:00 PM',
    endTime: '05:00 PM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Docentes',
    observations: 'Docentes presenciales: Miércoles en casco urbano de 1:00 p.m. hasta las 5:00 p.m.',
    infrastructureNotes: 'Punto de encuentro en casco urbano con condiciones eléctricas óptimas.'
  },
  {
    id: 'sess-30b',
    itemNumber: 30,
    specificDate: '2026-09-14',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isidro Ibarra Fernández - Sede Jaipa',
    campus: 'Sede Jaipa',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Formación Docente',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Lunes'],
    datesScheduled: {
      september: ['Lunes 14', 'Lunes 21', 'Lunes 28'],
      october: ['Lunes 5', 'Lunes 19'],
      november: ['Lunes 9', 'Lunes 23']
    },
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    durationHours: 2.0,
    frequency: 'Quincenal / Acompañamiento',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Docentes',
    observations: 'Docentes virtuales: Lunes de 2:30 a 4:30 p.m.',
    infrastructureNotes: 'Acompañamiento sincrónico/asincrónico según disponibilidad de red.'
  },

  // ==========================================
  // URIBIA: YOTOJOROIN (APROBADO - Isabel Jusayu)
  // ==========================================
  {
    id: 'sess-31',
    itemNumber: 31,
    specificDate: '2026-09-17',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Mañana (7:30 a.m. - 11:30 a.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 17'],
      october: ['Jueves 1', 'Jueves 15', 'Jueves 29'],
      november: ['Jueves 12', 'Jueves 26']
    },
    startTime: '07:30 AM',
    endTime: '11:30 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Presenciales: Jueves 17 de septiembre 7:30 a 11:30 a.m. Cumple Regla de Oro Uribia (máx 2 sedes presenciales simultáneas).',
    infrastructureNotes: 'Fluctuación constante de internet MINTIC. Sesión presencial con kits y guías físicas.'
  },
  {
    id: 'sess-32',
    itemNumber: 32,
    specificDate: '2026-09-15',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Mañana (10:15 a.m. - 12:15 m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 22', 'Martes 29'],
      october: ['Martes 6', 'Martes 13', 'Martes 20', 'Martes 27'],
      november: ['Martes 3', 'Martes 10', 'Martes 17', 'Martes 24']
    },
    startTime: '10:15 AM',
    endTime: '12:15 PM',
    durationHours: 2.0,
    frequency: 'Semanal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Competencias técnicas: Martes 10:15 a 12:15. Obligatorio traer formaciones pregrabadas en USB/offline por fluctuación de internet.',
    infrastructureNotes: 'Contenido pregrabado offline obligatorio por fallas recurrentes de red.'
  },
  {
    id: 'sess-33',
    itemNumber: 33,
    specificDate: '2026-09-17',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Mañana (7:30 a.m. - 9:30 a.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 17', 'Jueves 24'],
      october: ['Jueves 8', 'Jueves 22'],
      november: ['Jueves 5', 'Jueves 19']
    },
    startTime: '07:30 AM',
    endTime: '09:30 AM',
    durationHours: 2.0,
    frequency: 'Quincenal (semanas alternas al presencial)',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9°, 10° y 11°',
    observations: 'Habilidades blandas: Jueves de 7:30 a 9:30 a.m. Traer cápsulas pregrabadas offline para soporte.',
    infrastructureNotes: 'Material multimedia pregrabado en memorias.'
  },
  {
    id: 'sess-33b',
    itemNumber: 33,
    specificDate: '2026-09-16',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Casco Urbano Uribia (Con Walakaly)',
    academicShift: 'Tarde (2:30 p.m. - 5:30 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Formación Docente',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 16', 'Miércoles 30'],
      october: ['Miércoles 14', 'Miércoles 28'],
      november: ['Miércoles 11', 'Miércoles 25']
    },
    startTime: '02:30 PM',
    endTime: '05:30 PM',
    durationHours: 3.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Docentes',
    observations: 'Docentes presenciales: Miércoles de 2:30 a 5:30 p.m. en casco urbano (unificado con Walakaly #2).',
    infrastructureNotes: 'Sede casco urbano con televisor/pantalla disponible.'
  },
  {
    id: 'sess-33c',
    itemNumber: 33,
    specificDate: '2026-09-15',
    municipality: 'Uribia',
    institution: 'I.E.I.R. Isabel Jusayu - Sede Principal Yotojoroin',
    campus: 'Sede Principal Yotojoroin',
    academicShift: 'Tarde (2:30 p.m. - 4:30 p.m.)',
    targetAudience: 'Docentes',
    trainingType: 'Formación Docente',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '02:30 PM',
    endTime: '04:30 PM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Docentes',
    observations: 'Docentes virtuales: Martes de 2:30 a 4:30 p.m.',
    infrastructureNotes: 'Encuentro pedagógico virtual sincrónico.'
  },

  // ==========================================
  // RIOHACHA: DENZIL ESCOLAR SABATINOS
  // ==========================================
  {
    id: 'sess-34',
    itemNumber: 34,
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina (6:30 a.m. - 4:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Sábado'],
    datesScheduled: {
      september: ['Sábado 12', 'Sábado 26'],
      october: ['Sábado 10', 'Sábado 24'],
      november: ['Sábado 7', 'Sábado 21']
    },
    startTime: '08:30 AM',
    endTime: '12:00 PM',
    durationHours: 3.5,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Ciclo 4',
    observations: 'Llevar todo el material impreso. Acompañamiento constante de más de un orientador del equipo Biz y cuerpo docente.',
    infrastructureNotes: 'Biblioteca y sala de informática disponibles.'
  },
  {
    id: 'sess-35',
    itemNumber: 35,
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina (6:30 a.m. - 4:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Sábado'],
    datesScheduled: {
      september: ['Sábado 12', 'Sábado 26'],
      october: ['Sábado 10', 'Sábado 24'],
      november: ['Sábado 7', 'Sábado 21']
    },
    startTime: '06:30 AM',
    endTime: '08:30 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Ciclo 4',
    observations: 'Virtual/apoyo presencial previo al módulo práctico.',
    infrastructureNotes: 'Sala de informática con conectividad.'
  },
  {
    id: 'sess-36',
    itemNumber: 36,
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina (6:30 a.m. - 4:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Sábado'],
    datesScheduled: {
      september: ['Sábado 12', 'Sábado 26'],
      october: ['Sábado 10', 'Sábado 24'],
      november: ['Sábado 7', 'Sábado 21']
    },
    startTime: '01:00 PM',
    endTime: '04:00 PM',
    durationHours: 3.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Ciclo 6',
    observations: 'Atención especial para Ciclo 6 (jóvenes y adultos en alta vulnerabilidad). Material impreso garantizado.',
    infrastructureNotes: 'Acompañamiento psicosocial reforzado.'
  },
  {
    id: 'sess-37',
    itemNumber: 37,
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Sabatino',
    campus: 'Sede Dividivi',
    academicShift: 'Sabatina (6:30 a.m. - 4:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Virtual',
    status: 'APROBADO',
    daysOfWeek: ['Sábado'],
    datesScheduled: {
      september: ['Sábado 12', 'Sábado 26'],
      october: ['Sábado 10', 'Sábado 24'],
      november: ['Sábado 7', 'Sábado 21']
    },
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    durationHours: 2.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Ciclo 6',
    observations: 'Módulo virtual desarrollado en sala presencial guiada.',
    infrastructureNotes: 'Orientadores Biz de soporte.'
  },

  // ==========================================
  // RIOHACHA: CHON-KAY
  // ==========================================
  {
    id: 'sess-38',
    itemNumber: 38,
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Jornada Vespertina (12:00 m. - 6:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Miércoles'],
    datesScheduled: {
      september: ['Miércoles 16', 'Miércoles 30'],
      october: ['Miércoles 14', 'Miércoles 28'],
      november: ['Miércoles 11', 'Miércoles 25']
    },
    startTime: '02:10 PM',
    endTime: '05:10 PM',
    durationHours: 3.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 9° (903 y 904)',
    observations: 'Desarrollado estrictamente en los bloques de Ética y Competencias Ciudadanas (según horario de clases vespertino).',
    infrastructureNotes: 'Timbre: 2:10 a 3:00 (3ra hora), 3:00-3:30 Receso, 3:30-5:10 (4ta y 5ta hora).'
  },
  {
    id: 'sess-39',
    itemNumber: 39,
    municipality: 'Riohacha',
    institution: 'I.E. Chon-Kay',
    campus: 'Sede Principal Chon-Kay',
    academicShift: 'Jornada Vespertina (12:00 m. - 6:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Viernes'],
    datesScheduled: {
      september: ['Viernes 18'],
      october: ['Viernes 2', 'Viernes 16', 'Viernes 30'],
      november: ['Viernes 13', 'Viernes 27']
    },
    startTime: '01:20 PM',
    endTime: '04:20 PM',
    durationHours: 3.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11° (10-03, 10-04, 11-03)',
    observations: 'Integrado en asignaturas de Ética y Valores / Ciudadanía conforme a disposición directiva.',
    infrastructureNotes: 'Uso de salones con ventilación y pantallas.'
  },

  // ==========================================
  // RIOHACHA: DENZIL MEGA COLEGIO
  // ==========================================
  {
    id: 'sess-40',
    itemNumber: 40,
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Sede Mega Colegio',
    academicShift: 'Jornada Vespertina (12:00 m. - 6:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Lunes'],
    datesScheduled: {
      september: ['Lunes 14', 'Lunes 28'],
      october: ['Lunes 12 (Feriado ajustado)', 'Lunes 26'],
      november: ['Lunes 9', 'Lunes 23']
    },
    startTime: '12:30 PM',
    endTime: '04:20 PM',
    durationHours: 3.5,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Ajustado a horario de timbre: 12:00-12:30 Lectura, 12:30-1:20 1ra h, 1:20-2:10 2da h, 2:10-3:00 3ra h, 3:00-3:30 Receso, 3:30-4:20 4ta h.',
    infrastructureNotes: 'Instalaciones del Mega Colegio.'
  },
  {
    id: 'sess-41',
    itemNumber: 41,
    municipality: 'Riohacha',
    institution: 'I.E. Denzil Escolar - Mega Colegio',
    campus: 'Sede Mega Colegio',
    academicShift: 'Jornada Vespertina (12:00 m. - 6:00 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Jueves'],
    datesScheduled: {
      september: ['Jueves 17'],
      october: ['Jueves 1', 'Jueves 15', 'Jueves 29'],
      november: ['Jueves 12', 'Jueves 26']
    },
    startTime: '12:30 PM',
    endTime: '04:20 PM',
    durationHours: 3.5,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Sesiones de habilidades blandas y proyecto ocupacional en transición energética.',
    infrastructureNotes: 'Aulas múltiples equipadas.'
  },

  // ==========================================
  // RIOHACHA: CAMARONES
  // ==========================================
  {
    id: 'sess-42',
    itemNumber: 42,
    municipality: 'Riohacha',
    institution: 'I.E. Camarones',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (6:30 a.m. - 12:30 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Competencias Técnicas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Martes'],
    datesScheduled: {
      september: ['Martes 15', 'Martes 29'],
      october: ['Martes 13', 'Martes 27'],
      november: ['Martes 10', 'Martes 24']
    },
    startTime: '07:30 AM',
    endTime: '11:30 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grado 9°',
    observations: 'Corregimiento de Camarones. Sesión presencial técnica.',
    infrastructureNotes: 'Conexión y energía estables.'
  },
  {
    id: 'sess-43',
    itemNumber: 43,
    municipality: 'Riohacha',
    institution: 'I.E. Camarones',
    campus: 'Sede Principal Camarones',
    academicShift: 'Mañana (6:30 a.m. - 12:30 p.m.)',
    targetAudience: 'Estudiantes',
    trainingType: 'Habilidades Blandas',
    modality: 'Presencial',
    status: 'APROBADO',
    daysOfWeek: ['Viernes'],
    datesScheduled: {
      september: ['Viernes 18'],
      october: ['Viernes 2', 'Viernes 16', 'Viernes 30'],
      november: ['Viernes 13', 'Viernes 27']
    },
    startTime: '07:30 AM',
    endTime: '11:30 AM',
    durationHours: 4.0,
    frequency: 'Quincenal',
    responsible: 'The Biz Nation',
    gradeOrCycle: 'Grados 10° y 11°',
    observations: 'Liderazgo juvenil y habilidades socioemocionales.',
    infrastructureNotes: 'Salón múltiple de la institución.'
  },

];
