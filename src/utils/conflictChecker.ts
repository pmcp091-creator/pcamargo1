import { TrainingSession, ConflictAlert } from '../types/schedule';

export function analyzeConflictsAndRules(sessions: TrainingSession[]): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];

  // Rule 1: Uribia Max 2 Institutions per day for Presencial sessions
  const uribiaPresencial = sessions.filter(
    s => s.municipality === 'Uribia' && s.modality === 'Presencial' && s.status !== 'PDTE'
  );

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  daysOfWeek.forEach(day => {
    // Find all sessions on this day
    const daySessions = uribiaPresencial.filter(s => Array.isArray(s.daysOfWeek) && s.daysOfWeek.includes(day));
    
    // Group by unique institution name
    const institutionMap = new Map<string, TrainingSession[]>();
    daySessions.forEach(s => {
      const inst = s.institution || 'Sin institución';
      const list = institutionMap.get(inst) || [];
      list.push(s);
      institutionMap.set(inst, list);
    });

    const uniqueInstitutions = Array.from(institutionMap.keys());

    // Separate rural field missions from urban teacher meetings
    const ruralSessions = daySessions.filter(
      s => !s.campus?.toLowerCase().includes('casco urbano') && !(s.institution || '').toLowerCase().includes('casco urbano')
    );
    const ruralInstitutions = Array.from(new Set(ruralSessions.map(s => s.institution || '')));

    // If more than 2 institutions are assigned on this day, verify if they are separated by alternating biweekly weeks (quincenal) or urban location
    if (ruralInstitutions.length > 2) {
      alerts.push({
        id: `uribia-conflict-${day.toLowerCase()}`,
        municipality: 'Uribia',
        dayOfWeek: day,
        severity: 'high',
        title: `Cruce Crítico en Uribia: Más de 2 sedes rurales en día ${day}`,
        description: `Se detectaron ${ruralInstitutions.length} instituciones asignadas de manera presencial en sedes rurales el día ${day} (${ruralInstitutions.join(', ')}). La regla oficial del proyecto establece un máximo de 2 instituciones por día.`,
        affectedSessions: ruralSessions,
        suggestedAction: `Verificar que operen en semanas alternas (rotación quincenal) o que las sesiones docentes se concentren en el casco urbano.`
      });
    }
  });

  // Rule 2: Pending Institutions in Uribia
  const pendingUribia = sessions.filter(
    s => s.municipality === 'Uribia' && (s.status === 'PDTE' || s.status === 'POR CONCERTAR')
  );

  if (pendingUribia.length > 0) {
    const pendingNames = Array.from(new Set(pendingUribia.map(s => s.institution)));
    alerts.push({
      id: 'uribia-pending-slots',
      municipality: 'Uribia',
      dayOfWeek: 'Por definir',
      severity: 'medium',
      title: `${pendingNames.length} Institución(es) con espacio reservado en Uribia (PDTE)`,
      description: `Las instituciones ${pendingNames.join(' y ')} tienen espacios reservados listos para asignación.`,
      affectedSessions: pendingUribia,
      suggestedAction: `Hacer clic en "Asignar Horario" para seleccionar día y horario respetando el tope de 2 instituciones/día.`
    });
  }

  // Rule 3: Cultural weeks Guarerapu
  const guarerapuSessions = sessions.filter(s => (s.institution || '').includes('Guarerapu'));
  if (guarerapuSessions.length > 0) {
    alerts.push({
      id: 'alert-guarerapu-cultural',
      municipality: 'Uribia',
      dayOfWeek: 'Octubre',
      severity: 'info',
      title: 'Guarerapu #3: Semanas Culturales (13 al 26 de Octubre)',
      description: 'Recordatorio logístico: Del 13 al 26 de octubre no hay clases regulares. Las formaciones se retoman puntualmente el 27 de octubre.',
      affectedSessions: guarerapuSessions
    });
  }

  // Rule 4: Walakaly Ethnic Event
  const walakalySessions = sessions.filter(s => (s.institution || '').includes('Walakaly'));
  if (walakalySessions.length > 0) {
    alerts.push({
      id: 'alert-walakaly-ethnic',
      municipality: 'Uribia',
      dayOfWeek: 'Septiembre',
      severity: 'info',
      title: 'Walakaly #2: Encuentro Étnico (17 y 18 de Septiembre)',
      description: 'Fechas de celebración comunitaria y étnica. No programar desplazamientos formativos a la sede durante estos dos días.',
      affectedSessions: walakalySessions
    });
  }

  // Rule 5: Container without power (Guarerapu)
  alerts.push({
    id: 'alert-guarerapu-power',
    municipality: 'Uribia',
    dayOfWeek: 'Permanente',
    severity: 'medium',
    title: 'Guarerapu #3: Container Sin Energía Eléctrica',
    description: 'Asegurar que los facilitadores y docentes lleven sus celulares, tablets y computadores 100% cargados con baterías de respaldo.',
    affectedSessions: guarerapuSessions
  });

  // Rule 6: Jaipa - Internet MINTIC ineficiente y sin cobertura móvil
  const jaipaSessions = sessions.filter(s => (s.institution || '').toLowerCase().includes('jaipa'));
  if (jaipaSessions.length > 0) {
    alerts.push({
      id: 'alert-jaipa-mintic',
      municipality: 'Uribia',
      dayOfWeek: 'Permanente',
      severity: 'medium',
      title: 'Jaipa: Internet Ineficiente y Sin Cobertura Móvil',
      description: 'La institución cuenta con internet MINTIC ineficiente / no funcional y no hay señal de celular. Obligatorio llevar guías físicas y dispositivos con carga completa.',
      affectedSessions: jaipaSessions
    });

    alerts.push({
      id: 'alert-jaipa-start',
      municipality: 'Uribia',
      dayOfWeek: '17 de Septiembre',
      severity: 'info',
      title: 'Jaipa: Inicio Presencial Jueves 17 de Septiembre',
      description: 'Semana de arranque especial el jueves 17 de septiembre (7:00 a 11:00 a.m.). Las semanas subsiguientes el horario presencial regular es miércoles quincenal.',
      affectedSessions: jaipaSessions.filter(s => s.modality === 'Presencial')
    });
  }

  // Rule 7: Yotojoroin - Obligatoriedad de cápsulas pregrabadas offline
  const yotoSessions = sessions.filter(s => (s.institution || '').toLowerCase().includes('yotojoroin'));
  if (yotoSessions.length > 0) {
    alerts.push({
      id: 'alert-yoto-offline',
      municipality: 'Uribia',
      dayOfWeek: 'Permanente',
      severity: 'medium',
      title: 'Yotojoroin: Formaciones Virtuales Pregrabadas Obligatorias',
      description: 'Por la fluctuación del internet MINTIC, traer obligatoriamente cápsulas pregrabadas en memorias USB para las sesiones virtuales de competencias técnicas (martes) y habilidades blandas (jueves).',
      affectedSessions: yotoSessions.filter(s => s.modality === 'Virtual')
    });

    alerts.push({
      id: 'alert-yoto-docentes-walakaly',
      municipality: 'Uribia',
      dayOfWeek: 'Miércoles',
      severity: 'info',
      title: 'Yotojoroin + Walakaly: Docentes en Casco Urbano Unificado',
      description: 'Capacitación docente presencial concentrada en casco urbano de Uribia los miércoles de 2:30 a 5:30 p.m., unificada con la sede Walakaly #2.',
      affectedSessions: yotoSessions.filter(s => s.targetAudience.includes('Docentes') && s.modality === 'Presencial')
    });
  }

  return alerts;
}
