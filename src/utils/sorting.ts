import { TrainingSession } from '../types/schedule';

export type SessionSortField = 'date' | 'institution' | 'modality' | 'status' | 'itemNumber';
export type SortOrder = 'asc' | 'desc';

/**
 * Convierte cualquier formato de hora (ej: "07:00 AM", "14:30", "01:00 PM")
 * a minutos transcurridos desde la medianoche (0 - 1440) para orden cronológico real AM a PM.
 */
export function getStartMinutes(item: any): number {
  if (!item) return 9999;
  const raw = item.startTime || item.time || item.horario || item.timeRange || '';
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = (match[3] || '').toUpperCase();
  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * ORDEN VISUAL E IMPRESO ÚNICO — AM A PM (PASO 2):
 * En TODAS las vistas (calendario, matriz, PDF), dentro de un mismo día las sesiones
 * deben listarse ordenadas ascendentemente por hora de inicio (00:00 → 23:59, de la mañana hacia la noche).
 */
export function ordenarSesionesDelDia<T extends { startTime?: string; itemNumber?: number }>(sesiones: T[]): T[] {
  return [...sesiones].sort((a, b) => {
    const minA = getStartMinutes(a);
    const minB = getStartMinutes(b);
    if (minA !== minB) return minA - minB;
    return (a.itemNumber || 0) - (b.itemNumber || 0);
  });
}

/**
 * Ordena sesiones de formación respetando los criterios del aplicativo:
 * - Por 'date': compara `specificDate` o `date`. Desempata por hora de inicio (AM a PM) y luego por `itemNumber`.
 * - Por 'itemNumber': orden numérico de ítem.
 * - Por cualquier otro campo ('institution', 'modality', 'status'): comparación alfabética en español.
 */
export function sortSessions(
  sessions: TrainingSession[],
  sortBy: SessionSortField = 'date',
  sortOrder: SortOrder = 'asc'
): TrainingSession[] {
  return [...sessions].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.specificDate || a.date || '';
      const dateB = b.specificDate || b.date || '';
      if (!dateA && !dateB) return (a.itemNumber || 0) - (b.itemNumber || 0);
      if (!dateA) return 1;
      if (!dateB) return -1;
      const dateCmp = sortOrder === 'desc' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
      if (dateCmp !== 0) return dateCmp;
      // Dentro del mismo día, orden ascendente AM a PM
      const timeCmp = getStartMinutes(a) - getStartMinutes(b);
      if (timeCmp !== 0) return timeCmp;
      return (a.itemNumber || 0) - (b.itemNumber || 0);
    }
    if (sortBy === 'itemNumber') {
      const numA = a.itemNumber || 0;
      const numB = b.itemNumber || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    }
    const valA = (a[sortBy] || '').toString();
    const valB = (b[sortBy] || '').toString();
    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });
}

