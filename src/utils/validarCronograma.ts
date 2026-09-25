import { TrainingSession } from '../types/schedule';
import { 
  validarReglaUribia, 
  asegurarReglaUribia, 
  Session as Sesion, 
  UribiaConflict as Conflicto 
} from './uribiaValidator';

export type { Sesion, Conflicto };

export interface ResultadoValidacion {
  valido: boolean;
  conflictos: Conflicto[];
}

export function normalizarSesion(s: any): Sesion {
  return {
    id: s.id || '',
    institucion: (s.institution || s.institucion || s.campus || '').trim(),
    municipio: (s.municipality || s.municipio || 'Uribia'),
    fecha: (s.specificDate || s.date || s.fecha || '').trim(),
    modalidad: (s.modality || s.modalidad || 'Presencial') === 'Virtual' ? 'Virtual' : 'Presencial',
    audiencia: s.targetAudience || s.targetPopulation || s.audiencia || ''
  };
}

export function validarLimiteUribia(sesiones: (Sesion | TrainingSession | any)[]): ResultadoValidacion {
  return validarReglaUribia(sesiones);
}

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

export { asegurarReglaUribia };
export default validarLimiteUribia;
