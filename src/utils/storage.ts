import { TrainingSession, InstitutionProfile, BrandingSettings, BackupSnapshot } from '../types/schedule';
import { INITIAL_SESSIONS, INITIAL_INSTITUTIONS, DEFAULT_BRANDING } from '../data/initialData';
import { USER_LOADED_SESSIONS } from '../data/userLoadedSessions';
import { exportToExcelFile } from './excelExport';

const STORAGE_KEYS = {
  SESSIONS: 'biz_cronograma_sessions_v4',
  INSTITUTIONS: 'biz_cronograma_institutions_v4',
  BRANDING: 'biz_cronograma_branding_v3',
  SNAPSHOTS: 'biz_cronograma_snapshots_v1',
  EMERGENCY_UNDO: 'biz_cronograma_emergency_undo_v1'
};

const sanitizeSession = (s: any): TrainingSession => {
  return {
    ...s,
    daysOfWeek: Array.isArray(s.daysOfWeek) ? s.daysOfWeek : (s.dayOfWeek ? [s.dayOfWeek] : []),
    institution: s.institution || '',
    municipality: s.municipality || 'Uribia',
    modality: s.modality || 'Presencial',
    trainingType: s.trainingType || '',
    targetAudience: Array.isArray(s.targetAudience) ? s.targetAudience : (s.targetAudience ? [s.targetAudience] : ['Estudiantes']),
    datesScheduled: s.datesScheduled || {}
  };
};

export function loadSessions(): TrainingSession[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizeSession);
      }
    }

    // Migration from v2 if available: replace pending Jaipa & Yotojoroin with the approved sessions
    const savedV2 = localStorage.getItem('biz_cronograma_sessions_v2');
    if (savedV2) {
      const parsedV2 = JSON.parse(savedV2);
      if (Array.isArray(parsedV2) && parsedV2.length > 0) {
        // Keep any custom sessions the user added, but ensure Jaipa and Yotojoroin are the official ones
        const nonJaipaYoto = parsedV2.filter(
          (s: TrainingSession) =>
            !(s.institution || '').toLowerCase().includes('jaipa') &&
            !(s.institution || '').toLowerCase().includes('yotojoroin') &&
            s.id !== 'S37' &&
            s.id !== 'S38'
        );
        const newJaipaYoto = USER_LOADED_SESSIONS.filter(
          s =>
            (s.institution || '').toLowerCase().includes('jaipa') ||
            (s.institution || '').toLowerCase().includes('yotojoroin')
        );
        const merged = [...nonJaipaYoto, ...newJaipaYoto].map(sanitizeSession);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.error('Error loading sessions from storage:', err);
  }
  // Default to the complete 45 sessions from the user's official coordination schedule
  return USER_LOADED_SESSIONS.map(sanitizeSession);
}

export function saveSessions(sessions: TrainingSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Error saving sessions to storage:', err);
  }
}

export function loadInstitutions(): InstitutionProfile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Asegurar que cada institución mantenga o herede su daneCode y specialAlerts actualizadas
        return parsed.map((inst: InstitutionProfile) => {
          const matchInitial = INITIAL_INSTITUTIONS.find(i => i.id === inst.id || i.name === inst.name);
          return {
            ...inst,
            daneCode: inst.daneCode || matchInitial?.daneCode || 'DANE-GUAJIRA',
            specialAlerts: (inst.specialAlerts && inst.specialAlerts.length > 0)
              ? inst.specialAlerts
              : (matchInitial?.specialAlerts || [])
          };
        });
      }
    }
  } catch (err) {
    console.error('Error loading institutions from storage:', err);
  }
  return INITIAL_INSTITUTIONS;
}

export function saveInstitutions(institutions: InstitutionProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
  } catch (err) {
    console.error('Error saving institutions to storage:', err);
  }
}

export function loadBranding(): BrandingSettings {
  try {
    let saved = localStorage.getItem(STORAGE_KEYS.BRANDING);
    if (!saved) {
      // Check v2 or v1 if exists
      saved = localStorage.getItem('biz_cronograma_branding_v2') || localStorage.getItem('biz_cronograma_branding_v1');
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      let coordinatorName = parsed.coordinatorName;
      if (!coordinatorName || coordinatorName === 'Andrés Fernández') {
        coordinatorName = DEFAULT_BRANDING.coordinatorName;
      }
      let engineerName = parsed.engineerName;
      if (!engineerName || engineerName === 'Pedro') {
        engineerName = DEFAULT_BRANDING.engineerName;
      }
      let logo1Url = parsed.logo1Url;
      // Upgrade from old generic data URI or empty string to the official fixed server SVG
      if (!logo1Url || logo1Url.trim() === '' || logo1Url.startsWith('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"')) {
        logo1Url = DEFAULT_BRANDING.logo1Url;
      }
      let logo2Url = parsed.logo2Url;
      if (!logo2Url || logo2Url.trim() === '' || logo2Url.startsWith('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"')) {
        logo2Url = DEFAULT_BRANDING.logo2Url;
      }

      return {
        ...DEFAULT_BRANDING,
        ...parsed,
        coordinatorName,
        engineerName,
        logo1Url,
        logo2Url
      };
    }
  } catch (err) {
    console.error('Error loading branding from storage:', err);
  }
  return DEFAULT_BRANDING;
}

export function saveBranding(branding: BrandingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
  } catch (err) {
    console.error('Error saving branding to storage:', err);
  }
}

export function loadAutoSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading snapshots:', err);
  }
  return [];
}

export function saveAutoSnapshot(
  sessions: TrainingSession[],
  institutions: InstitutionProfile[],
  branding: BrandingSettings,
  reason: string
): BackupSnapshot {
  const now = new Date();
  const readableDate = now.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const snapshot: BackupSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toISOString(),
    readableDate,
    reason,
    sessionCount: sessions.length,
    data: {
      sessions: JSON.parse(JSON.stringify(sessions)),
      institutions: JSON.parse(JSON.stringify(institutions)),
      branding: JSON.parse(JSON.stringify(branding))
    }
  };

  try {
    const existing = loadAutoSnapshots();
    // Keep max 15 snapshots (most recent first)
    const updated = [snapshot, ...existing].slice(0, 15);
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving snapshot:', err);
  }

  return snapshot;
}

export function getEmergencyUndoSnapshot(): BackupSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_UNDO);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading emergency undo snapshot:', err);
  }
  return null;
}

export function setEmergencyUndoSnapshot(snapshot: BackupSnapshot | null): void {
  try {
    if (snapshot) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_UNDO, JSON.stringify(snapshot));
    } else {
      localStorage.removeItem(STORAGE_KEYS.EMERGENCY_UNDO);
    }
  } catch (err) {
    console.error('Error setting emergency undo snapshot:', err);
  }
}

export function resetToDefaults(): {
  sessions: TrainingSession[];
  institutions: InstitutionProfile[];
  branding: BrandingSettings;
  emergencySnapshot?: BackupSnapshot;
} {
  let emergencySnapshot: BackupSnapshot | undefined;
  try {
    // 1. Check current saved state and create an automatic safety backup BEFORE resetting
    const currentSessions = loadSessions();
    const currentInstitutions = loadInstitutions();
    const currentBranding = loadBranding();

    if (currentSessions && currentSessions.length > 0) {
      emergencySnapshot = saveAutoSnapshot(
        currentSessions,
        currentInstitutions,
        currentBranding,
        'Copia automática de seguridad antes de restablecer matriz'
      );
      setEmergencyUndoSnapshot(emergencySnapshot);
    }

    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.INSTITUTIONS);
    localStorage.removeItem(STORAGE_KEYS.BRANDING);
  } catch (err) {
    console.error('Error resetting storage:', err);
  }
  return {
    sessions: USER_LOADED_SESSIONS,
    institutions: INITIAL_INSTITUTIONS,
    branding: DEFAULT_BRANDING,
    emergencySnapshot
  };
}

export const getExportFileName = (instName?: string | null, extension: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
  if (!instName || instName.trim().toLowerCase() === 'general') {
    return `Cronograma_Vocacion_Que_Transforma_Oficial.${extension}`;
  }
  const sanitized = instName
    .replace(/I\.E\.I\.R\.|I\.E\.D\.|I\.E\./gi, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_');
  return `Cronograma_Vocacion_Que_Transforma_${sanitized}.${extension}`;
};

export async function exportToExcel(
  sessions: TrainingSession[],
  institutions?: InstitutionProfile[],
  restrictedInstName?: string | null
): Promise<void> {
  try {
    await exportToExcelFile(sessions, institutions, restrictedInstName);
  } catch (err) {
    console.error('Error exportando archivo Excel (.xlsx), usando respaldo CSV:', err);
    exportToCSV(sessions, restrictedInstName);
  }
}

export function exportToCSV(
  sessions: TrainingSession[],
  restrictedInstName?: string | null,
  customFileName?: string
): void {
  const headers = [
    'Ítem (#)',
    'Municipio',
    'Institución Educativa',
    'Sede Específica',
    'Jornada Académica',
    'Audiencia',
    'Tipo de Formación',
    'Modalidad',
    'Estado',
    'Días de la Semana',
    'Fecha Específica',
    'Horario',
    'Duración (Horas)',
    'Observaciones y Condiciones Técnicas'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sessions.map((s, idx) => {
    // 1. Ítem (#)
    const itemNo = s.itemNumber || idx + 1;
    // 2. Municipio
    const muni = s.municipality || 'Uribia';
    // 3. Institución Educativa
    const inst = s.institution || '';
    // 4. Sede Específica
    const campus = s.campus || 'Sede Principal';
    // 5. Jornada Académica
    const shift = s.academicShift || 'Mañana';
    // 6. Audiencia
    const audience = Array.isArray(s.targetAudience) ? s.targetAudience.join(', ') : (s.targetAudience || 'Estudiantes');
    // 7. Tipo de Formación
    const trainingType = s.trainingType || '';
    // 8. Modalidad
    const modality = s.modality || 'Presencial';
    // 9. Estado (Concertado / Por Concertar)
    const status = s.status === 'APROBADO' ? 'Concertado' : 'Por Concertar';
    // 10. Días de la Semana
    const days = (s.daysOfWeek || []).join(', ');
    
    // 11. Fecha Específica (Consolidadas de sept, oct, nov)
    const datesArr: string[] = [];
    if (s.datesScheduled?.september && s.datesScheduled.september.length > 0) {
      datesArr.push(`Sept: ${s.datesScheduled.september.join(', ')}`);
    }
    if (s.datesScheduled?.october && s.datesScheduled.october.length > 0) {
      datesArr.push(`Oct: ${s.datesScheduled.october.join(', ')}`);
    }
    if (s.datesScheduled?.november && s.datesScheduled.november.length > 0) {
      datesArr.push(`Nov: ${s.datesScheduled.november.join(', ')}`);
    }
    const specificDates = datesArr.length > 0 ? datesArr.join(' | ') : (s.frequency || 'Según calendario');

    // 12. Horario (Inicio - Fin)
    const scheduleHours = (s.startTime && s.endTime) ? `${s.startTime} - ${s.endTime}` : (s.startTime || 'Por definir');

    // 13. Duración (Horas)
    const duration = s.durationHours !== undefined ? s.durationHours : 0;

    // 14. Observaciones y Condiciones Técnicas
    const obsParts: string[] = [];
    if (s.observations) obsParts.push(s.observations);
    if (s.infrastructureNotes) obsParts.push(`[Técnico: ${s.infrastructureNotes}]`);
    const observations = obsParts.join(' ');

    return [
      itemNo,
      escapeCSV(muni),
      escapeCSV(inst),
      escapeCSV(campus),
      escapeCSV(shift),
      escapeCSV(audience),
      escapeCSV(trainingType),
      escapeCSV(modality),
      escapeCSV(status),
      escapeCSV(days),
      escapeCSV(specificDates),
      escapeCSV(scheduleHours),
      duration,
      escapeCSV(observations)
    ];
  });

  // UTF-8 BOM for proper accented character display in Excel (ñ, tildes, etc.)
  // Usar delimitador ';' para que Excel en español/Latinoamérica separe automáticamente las columnas
  const BOM = '\uFEFF';
  const csvLines: string[] = [];

  if (restrictedInstName) {
    csvLines.push(escapeCSV(`CRONOGRAMA OFICIAL DE FORMACIONES - ${restrictedInstName}`));
    csvLines.push(escapeCSV(`Total de actividades programadas: ${sessions.length}`));
    csvLines.push(''); // Línea en blanco separadora
  }

  csvLines.push(headers.map(escapeCSV).join(';'));
  rows.forEach(r => csvLines.push(r.join(';')));

  const csvContent = BOM + csvLines.join('\r\n');

  const filename = customFileName || getExportFileName(restrictedInstName, 'csv');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', customFileName || filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBackupJSON(
  sessions: TrainingSession[],
  institutions: InstitutionProfile[],
  branding: BrandingSettings
): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    sessions,
    institutions,
    branding
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `COPIA_SEGURIDAD_CRONOGRAMA_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { exportToHTML } from './htmlExporter';


