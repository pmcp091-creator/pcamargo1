import { MASTER_STUDENT_SESSIONS } from './scheduleGenerator';
import { validarLimiteUribia, reportarDiagnosticoUribia } from './validarCronograma';

console.log('================================================================');
console.log('🧪 TEST MANUAL: Validador Determinístico de Uribia');
console.log('================================================================');
console.log(`Total sesiones analizadas: ${MASTER_STUDENT_SESSIONS.length}`);

const resultado = validarLimiteUribia(MASTER_STUDENT_SESSIONS);

console.log(`Estado global de validación: ${resultado.valido ? '✅ VÁLIDO' : '⚠️ CONFLICTOS DETECTADOS'}`);
console.log(`Cantidad de fechas en conflicto: ${resultado.conflictos.length}\n`);

if (resultado.conflictos.length > 0) {
  console.log('Detalle de fechas y sedes simultáneas detectadas:');
  resultado.conflictos.forEach((c, idx) => {
    console.log(`  [${idx + 1}] Fecha: ${c.fecha} (${c.instituciones.length} sedes):`);
    c.instituciones.forEach(inst => {
      console.log(`       - ${inst}`);
    });
  });
} else {
  console.log('No se encontraron conflictos: ninguna fecha supera 2 instituciones físicas en Uribia.');
}

console.log('================================================================\n');

export { resultado };
