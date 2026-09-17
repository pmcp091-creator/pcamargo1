import { TrainingSession } from '../types/schedule';

export type SessionSortField = 'date' | 'institution' | 'modality' | 'status' | 'itemNumber';
export type SortOrder = 'asc' | 'desc';

/**
 * Convierte cualquier cadena de hora ('07:00 AM', '2:30 p.m.', '12:00 m.', '14:30', etc.)
 * a minutos exactos desde la medianoche (0 - 1439) para ordenamiento cronológico perfecto.
 * Las horas AM quedan en la mañana (ej. 7:00 AM -> 420 min) y las horas PM en la tarde/noche (ej. 2:30 PM -> 870 min).
 */
export function parseTimeToMinutes(timeStr?: string, academicShift?: string): number {
  let str = (timeStr || '').trim();

  // Si no viene startTime explícito, intentar extraer la primera hora válida de academicShift
  if (!str && academicShift) {
    const matchShift = academicShift.match(/(\d{1,2}:\d{2}\s*(?:[ap]\.?m\.?|m\.?)?)/i);
    if (matchShift) {
      str = matchShift[1];
    }
  }

  if (!str) return 9999; // Sin hora definida -> ubicar al final ordenadamente

  // Normalizar: remover puntos ('p.m.' -> 'PM', 'a.m.' -> 'AM', 'm.' -> 'M'), espacios y pasar a mayúsculas
  const clean = str.replace(/\./g, '').replace(/\s+/g, ' ').trim().toUpperCase();

  // Caso especial: mediodía en español (12:00 m, 12:00 mediodía)
  const isNoon = (clean.includes('12:00 M') || clean.includes('12:00M') || clean.includes('MEDIODIA')) &&
                 !clean.includes('AM') && !clean.includes('PM');

  // Detectar PM (tarde o noche)
  const isPM = clean.includes('PM') || clean.includes('TARDE') || clean.includes('NOCHE') || clean.includes('VESPERTINA');

  // Detectar AM (mañana o sabatina temprana)
  const isAM = clean.includes('AM') || clean.includes('MAÑANA') || clean.includes('SABATINA');

  // Extraer horas y minutos numéricos
  const match = clean.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 9999;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isNoon) {
    hours = 12;
  } else if (isPM) {
    if (hours < 12) hours += 12; // 1:00 PM -> 13:00, 2:30 PM -> 14:30
  } else if (isAM) {
    if (hours === 12) hours = 0;  // 12:00 AM -> 0:00
  } else {
    // Si no trae explícito AM o PM:
    // Si la hora es de 1 a 6 (formato 12 horas escolar sin etiqueta AM/PM), por contexto de jornada escolar corresponde a la tarde (PM)
    if (hours >= 1 && hours <= 6 && (clean.includes('TARDE') || (academicShift && /tarde|vespertina/i.test(academicShift)))) {
      hours += 12;
    }
  }

  return hours * 60 + minutes;
}

/**
 * Resuelve la fecha estricta y timestamp para ordenamiento cronológico riguroso día por día.
 */
export function getSessionDateForSort(session: TrainingSession): { dateStr: string; timestamp: number } {
  if (session.specificDate && /^\d{4}-\d{2}-\d{2}$/.test(session.specificDate)) {
    return { dateStr: session.specificDate, timestamp: new Date(session.specificDate + 'T00:00:00').getTime() };
  }
  if (session.date && /^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
    return { dateStr: session.date, timestamp: new Date(session.date + 'T00:00:00').getTime() };
  }
  if (session.specificDates && Array.isArray(session.specificDates) && session.specificDates.length > 0) {
    const sorted = [...session.specificDates].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    if (sorted.length > 0) {
      return { dateStr: sorted[0], timestamp: new Date(sorted[0] + 'T00:00:00').getTime() };
    }
  }
  if (session.datesScheduled) {
    const monthMap: Record<string, string> = {
      september: '2026-09',
      october: '2026-10',
      november: '2026-11',
      december: '2026-12'
    };
    for (const [mName, mPrefix] of Object.entries(monthMap)) {
      const days = session.datesScheduled[mName as keyof typeof session.datesScheduled];
      if (days && days.length > 0) {
        const sortedDays = [...days].map(d => {
          const match = d.match(/\d+/);
          return match ? parseInt(match[0], 10) : NaN;
        }).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (sortedDays.length > 0) {
          const dStr = `${mPrefix}-${String(sortedDays[0]).padStart(2, '0')}`;
          return { dateStr: dStr, timestamp: new Date(dStr + 'T00:00:00').getTime() };
        }
      }
    }
  }
  if (session.daysOfWeek && session.daysOfWeek.length > 0) {
    const dayMap: Record<string, string> = {
      'lunes': '2026-09-14',
      'martes': '2026-09-15',
      'miércoles': '2026-09-16',
      'miercoles': '2026-09-16',
      'jueves': '2026-09-17',
      'viernes': '2026-09-18',
      'sábado': '2026-09-19',
      'sabado': '2026-09-19',
      'domingo': '2026-09-20'
    };
    const key = session.daysOfWeek[0].toLowerCase();
    if (dayMap[key]) {
      return { dateStr: dayMap[key], timestamp: new Date(dayMap[key] + 'T00:00:00').getTime() };
    }
  }
  return { dateStr: '9999-99-99', timestamp: 9999999999999 };
}

/**
 * Ordena sesiones de formación respetando los criterios del aplicativo:
 * - Por 'date': primero fecha cronológica (día a día), luego hora (AM temprano arriba, PM tarde abajo), desempata por ítem.
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
      const dateA = getSessionDateForSort(a);
      const dateB = getSessionDateForSort(b);
      if (dateA.timestamp !== dateB.timestamp) {
        return sortOrder === 'desc' 
          ? dateB.timestamp - dateA.timestamp 
          : dateA.timestamp - dateB.timestamp;
      }
      // Horario dentro del mismo día: temprano AM arriba, tarde PM abajo
      const timeA = parseTimeToMinutes(a.startTime, a.academicShift);
      const timeB = parseTimeToMinutes(b.startTime, b.academicShift);
      if (timeA !== timeB) {
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
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
