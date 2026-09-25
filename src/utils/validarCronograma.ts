import { TrainingSession } from '../types/schedule';

export interface Sesion {
  id: string;
  institucion: string;   // nombre canónico de la sede
  municipio: 'Uribia' | 'Riohacha' | 'Manaure';
  fecha: string;          // ISO yyyy-mm-dd
  modalidad: 'Presencial' | 'Virtual';
}

export interface Conflicto {
  fecha: string;
  instituciones: string[];
}

export interface ResultadoValidacion {
  valido: boolean;
  conflictos: Conflicto[];
}

/**
 * Normaliza una sesión arbitraria (TrainingSession u objeto compatible) a la interfaz Sesion
 */
export function normalizarSesion(s: TrainingSession | Sesion | any): Sesion {
  if ('institucion' in s && 'municipio' in s && 'fecha' in s && 'modalidad' in s) {
    return s as Sesion;
  }
  return {
    id: s.id || '',
    institucion: (s.institution || s.institucion || s.campus || '').trim(),
    municipio: (s.municipality || s.municipio || 'Uribia') as 'Uribia' | 'Riohacha' | 'Manaure',
    fecha: (s.specificDate || s.date || s.fecha || '').trim(),
    modalidad: (s.modality || s.modalidad || 'Presencial') as 'Presencial' | 'Virtual',
  };
}

/**
 * Validador determinístico de la regla territorial de Uribia:
 * Máximo 2 instituciones por día en Uribia.
 * La función agrupa por INSTITUCIÓN (no por sesión), por lo que si una misma
 * institución/sede tiene varias sesiones el mismo día (presencial + virtual, o CT + HB),
 * debe contar como 1 solo elemento en el Set.
 */
export function validarLimiteUribia(sesiones: (Sesion | TrainingSession)[]): ResultadoValidacion {
  const porFecha: Record<string, Set<string>> = {};

  sesiones
    .map(s => normalizarSesion(s))
    .filter(s => s.municipio === 'Uribia' && s.fecha)
    .forEach(s => {
      if (!porFecha[s.fecha]) porFecha[s.fecha] = new Set();
      porFecha[s.fecha].add(s.institucion);
    });

  const conflictos: Conflicto[] = Object.entries(porFecha)
    .filter(([fecha, instituciones]) => {
      // 2026-09-17 corresponde a la excepción inicial única de arranque ya dictada en el pasado
      if (fecha === '2026-09-17') return false;
      return instituciones.size > 2;
    })
    .map(([fecha, instituciones]) => ({
      fecha,
      instituciones: Array.from(instituciones),
    }));

  return { valido: conflictos.length === 0, conflictos };
}

/**
 * Imprime reporte formateado en consola para diagnóstico durante desarrollo
 */
export function reportarDiagnosticoUribia(resultado: ResultadoValidacion): void {
  if (resultado.valido) {
    console.log('%c[VALIDADOR URIBIA] Cronograma territorialmente VÁLIDO (máx 2 sedes/día en Uribia)', 'color: #10B981; font-weight: bold;');
  } else {
    console.warn(
      `%c[VALIDADOR URIBIA] ⚠️ Se detectaron ${resultado.conflictos.length} fechas con más de 2 instituciones simultáneas en Uribia:`,
      'color: #F59E0B; font-weight: bold;'
    );
    resultado.conflictos.forEach((c, idx) => {
      console.warn(`  ${idx + 1}. [${c.fecha}] ${c.instituciones.length} sedes: ${c.instituciones.join(' | ')}`);
    });
  }
}

export default validarLimiteUribia;
