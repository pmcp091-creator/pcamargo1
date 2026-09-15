import { TrainingSession } from '../types/schedule';

/**
 * Determina el estado oficial concertado para exportaciones y documentos:
 * - "POR CONCERTAR": Únicamente las sesiones de I.E. El Pájaro y las clases virtuales y presenciales de docentes de Mega Colegio.
 * - "APROBADO": Todos los demás registros concertados previamente.
 */
export function getExportSessionStatus(session: TrainingSession): 'APROBADO' | 'POR CONCERTAR' | 'Programada' {
  if (session.status === 'Programada') {
    return 'Programada';
  }

  const inst = (session.institution || '').toLowerCase();
  const campus = (session.campus || '').toLowerCase();
  const audience = (Array.isArray(session.targetAudience) ? session.targetAudience.join(' ') : (session.targetAudience || '')).toLowerCase();
  const trainingType = (session.trainingType || '').toLowerCase();
  const id = (session.id || '').toLowerCase();

  // 1. I.E. El Pájaro (Manaure) -> POR CONCERTAR
  if (
    inst.includes('pájaro') || 
    inst.includes('pajaro') || 
    campus.includes('pájaro') || 
    campus.includes('pajaro') ||
    id.includes('pajaro')
  ) {
    return 'POR CONCERTAR';
  }

  // 2. I.E. Denzil Escolar - Mega Colegio: Clases virtuales y presenciales de Docentes -> POR CONCERTAR
  const isMegaColegio = inst.includes('mega') || campus.includes('mega') || id.includes('mega');
  const isDocentes = 
    audience.includes('docente') || 
    trainingType.includes('docente') || 
    id.includes('docente') ||
    id.includes('mega_doc') || 
    id.includes('mega-doc');

  if (isMegaColegio && isDocentes) {
    return 'POR CONCERTAR';
  }

  // 3. Todos los demás datos están aprobados y concertados previamente
  return 'APROBADO';
}
