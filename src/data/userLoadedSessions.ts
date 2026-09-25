import { TrainingSession } from '../types/schedule';
import { MASTER_STUDENT_SESSIONS } from '../utils/scheduleGenerator';

// Listado de sesiones cargadas por el usuario (sincronizadas con la matriz maestra oficial de estudiantes)
// Excluye totalmente la formación docente (0 docentes)
export const USER_LOADED_SESSIONS: TrainingSession[] = MASTER_STUDENT_SESSIONS;
export default USER_LOADED_SESSIONS;
