import { MASTER_STUDENT_SESSIONS, generateMasterSchedule, getScheduleKpis } from '../utils/scheduleGenerator';
import { TrainingSession } from '../types/schedule';

export const mockSessions: TrainingSession[] = MASTER_STUDENT_SESSIONS;
export { MASTER_STUDENT_SESSIONS, generateMasterSchedule, getScheduleKpis };
export default mockSessions;
