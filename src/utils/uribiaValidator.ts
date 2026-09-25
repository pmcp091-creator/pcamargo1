export interface Session {
  id: string;
  institucion: string;
  municipio: string;
  fecha: string; // 'YYYY-MM-DD'
  modalidad: 'Presencial' | 'Virtual';
  audiencia?: string;
}

export interface UribiaConflict {
  fecha: string;
  instituciones: string[];
  total: number;
  sesiones: Session[];
}

const MAX_INSTITUCIONES_URIBIA_POR_DIA = 2;

export function normalizarParaValidador(s: any): Session {
  return {
    id: s.id || '',
    institucion: s.institucion || s.institution || s.campus || '',
    municipio: s.municipio || s.municipality || '',
    fecha: s.fecha || s.specificDate || s.date || '',
    modalidad: (s.modalidad || s.modality || 'Presencial') === 'Virtual' ? 'Virtual' : 'Presencial',
    audiencia: s.audiencia || s.targetAudience || s.targetPopulation || ''
  };
}

export function validarReglaUribia(sesiones: (Session | any)[]): {
  valido: boolean;
  conflictos: UribiaConflict[];
} {
  const normalizadas = sesiones.map(normalizarParaValidador);
  const sesionesUribia = normalizadas.filter((s) => s.municipio === 'Uribia');
  const porFecha = new Map<string, Session[]>();
  for (const s of sesionesUribia) {
    if (!porFecha.has(s.fecha)) porFecha.set(s.fecha, []);
    porFecha.get(s.fecha)!.push(s);
  }
  const conflictos: UribiaConflict[] = [];
  for (const [fecha, grupo] of porFecha.entries()) {
    const instituciones = Array.from(new Set(grupo.map((s) => s.institucion)));
    if (instituciones.length > MAX_INSTITUCIONES_URIBIA_POR_DIA) {
      conflictos.push({ fecha, instituciones, total: instituciones.length, sesiones: grupo });
    }
  }
  conflictos.sort((a, b) => a.fecha.localeCompare(b.fecha));
  return { valido: conflictos.length === 0, conflictos };
}

export function asegurarReglaUribia(sesiones: (Session | any)[]): void {
  const { valido, conflictos } = validarReglaUribia(sesiones);
  if (!valido) {
    const detalle = conflictos
      .map((c) => `  ${c.fecha}: ${c.instituciones.join(', ')} (${c.total})`)
      .join('\n');
    throw new Error(
      `Cronograma inválido: ${conflictos.length} día(s) exceden el máximo de ` +
        `${MAX_INSTITUCIONES_URIBIA_POR_DIA} instituciones en Uribia.\n${detalle}`
    );
  }
}
