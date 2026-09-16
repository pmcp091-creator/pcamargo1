import { TrainingSession } from '../types/schedule';

export type SessionSortField = 'date' | 'institution' | 'modality' | 'status' | 'itemNumber';
export type SortOrder = 'asc' | 'desc';

/**
 * Ordena sesiones de formación respetando los criterios del aplicativo:
 * - Por 'date': compara `specificDate` o `date`. Desempata por `itemNumber`.
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
