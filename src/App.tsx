import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrainingSession, 
  InstitutionProfile, 
  BrandingSettings, 
  ConflictAlert,
  BackupSnapshot,
  ChangeRequest,
  RescheduleRequest
} from './types/schedule';
import { 
  loadSessions, 
  saveSessions, 
  loadInstitutions, 
  saveInstitutions, 
  loadBranding, 
  saveBranding, 
  resetToDefaults, 
  exportToExcel,
  exportToCSV, 
  exportToHTML, 
  saveAutoSnapshot, 
  getEmergencyUndoSnapshot, 
  setEmergencyUndoSnapshot 
} from './utils/storage';
import { analyzeConflictsAndRules } from './utils/conflictChecker';
import { sortSessions, SessionSortField, SortOrder } from './utils/sorting';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { loadHtml2Pdf } from './utils/pdfExport';
import { initialValidatedSessions, expandToIndividualSessions } from './data/scheduleRulesData';
import { DEFAULT_BRANDING } from './data/initialData';
import { 
  testConnection, 
  subscribeToSessions, 
  subscribeToChangeRequests, 
  syncSaveSession, 
  syncDeleteSession, 
  syncSaveChangeRequest, 
  seedFirestoreIfEmpty, 
  resetFirestoreSessions,
  auth,
  signInWithGoogle,
  logoutUser,
  isAuthorizedCoordinatorEmail
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Components
import { Navbar, ActiveTab } from './components/Navbar';
import { TableView, SessionsTableView } from './components/TableView';
import { CalendarView } from './components/CalendarView';
import { InstitutionsView } from './components/InstitutionsView';
import { ValidatorView } from './components/ValidatorView';
import { BrandingView } from './components/BrandingView';
import { ChangeRequestsView } from './components/ChangeRequestsView';
import { PrintView, PrintScheduleView } from './components/PrintView';
import { ScheduleModal } from './components/ScheduleModal';
import { QuickAssignModal } from './components/QuickAssignModal';
import { BackupModal } from './components/BackupModal';
import { PedroGuideModal } from './components/PedroGuideModal';
import { RequestRescheduleModal } from './components/RequestRescheduleModal';
import { DashboardView } from './components/DashboardView';
import { InstitutionalKioskView } from './components/InstitutionalKioskView';
import { 
  WifiOff, AlertTriangle, RotateCcw, 
  KeyRound, BarChart3, Printer, Building2, X, Loader2, CheckCircle2, Trash2,
  FileSpreadsheet, Download, Check
} from 'lucide-react';

const normalizeText = (text: string = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(i\.?e\.?i\.?r\.?|i\.?e\.?d\.?|i\.?e\.?|sede|principal|institucion|educativa)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const deduplicateSessions = (rawSessions: TrainingSession[]): TrainingSession[] => {
  const seen = new Set<string>();
  return rawSessions.filter(s => {
    if (!s) return false;
    const cleanInst = (s.institution || '').trim().toLowerCase();
    const cleanCampus = (s.campus || '').trim().toLowerCase();
    const cleanPop = (s.targetAudience || s.targetPopulation || '').trim().toLowerCase();
    const cleanMod = (s.modality || '').trim().toLowerCase();
    const cleanTime = `${s.startTime}_${s.endTime}`.trim().toLowerCase();
    const cleanTopic = (s.topic || '').trim().toLowerCase();
    const cleanDate = (s.specificDate || s.date || '').trim().toLowerCase();
    const signature = `${cleanInst}_${cleanCampus}_${cleanPop}_${cleanMod}_${cleanTime}_${cleanTopic}_${cleanDate}`;
    if (seen.has(signature)) {
      return false; // Descartar repetición idéntica en la misma fecha y hora
    }
    seen.add(signature);
    return true;
  });
};

export default function App() {
  const isOnline = useOnlineStatus();

  const STORAGE_KEY = 'cronograma_oficial_470_sep_dic_2026';

  // App State with Persistence: sesiones individuales reales de calendario (Sep - Dic 2026)
  const [sessions, setSessions] = useState<TrainingSession[]>(() => {
    try {
      // Limpiar versiones anteriores que contenían datos antiguos o inconsistencias
      localStorage.removeItem('cronograma_completo_sep_dic_2026');
      localStorage.removeItem('cronograma_full_463_sep_dic_2026');
      localStorage.removeItem('cronograma_official_sep_dic_2026');
      localStorage.removeItem('cronograma_sessions_v8_camarones12');
      localStorage.removeItem('cronograma_sessions_v7_calendar_sync');
      localStorage.removeItem('cronograma_sessions_v5_single');
      localStorage.removeItem('cronograma_sessions_v3_dedup');
      localStorage.removeItem('cronograma_sessions_v2');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) && 
          parsed.length === 470 &&
          !parsed.some(s => s.modality === 'Microlearning' || (s.institution || '').toLowerCase().includes('pajaro'))
        ) {
          const expanded = expandToIndividualSessions(parsed);
          return deduplicateSessions(expanded).map((s, idx) => ({
            ...s,
            itemNumber: s.itemNumber || idx + 1
          }));
        }
      }
      const source = initialValidatedSessions && initialValidatedSessions.length > 0 
        ? initialValidatedSessions 
        : [];
      const expanded = expandToIndividualSessions(source);
      const cleanData = deduplicateSessions(expanded).map((s, idx) => ({
        ...s,
        itemNumber: idx + 1
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
      return cleanData;
    } catch (e) {
      return [];
    }
  });
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>(() => loadInstitutions());
  const [branding, setBranding] = useState<BrandingSettings>(() => loadBranding());

  // Security & RBAC State (Por defecto Acceso Público en modo 'viewer')
  const [sessionRole, setSessionRole] = useState<'admin' | 'viewer'>(() => {
    return (localStorage.getItem('auth_role') === 'admin') ? 'admin' : 'viewer';
  });
  const [restrictedInstName, setRestrictedInstName] = useState<string | null>(() => {
    return localStorage.getItem('restricted_inst_name') || null;
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [adminKeyError, setAdminKeyError] = useState('');

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab | 'dashboard'>('calendar');
  const [isPrintView, setIsPrintView] = useState<boolean>(false);
  const [printCustomSessions, setPrintCustomSessions] = useState<TrainingSession[] | null>(null);
  const [printCustomTitle, setPrintCustomTitle] = useState<string | null>(null);
  const [printPeriodLabel, setPrintPeriodLabel] = useState<string | null>(null);

  // Print Setup State (Imprenta: Carta vs Oficio + Selección de Bloques)
  const [showPrintOptionsModal, setShowPrintOptionsModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [paperFormat, setPaperFormat] = useState<'letter' | 'legal'>('letter');
  const [paperOrientation, setPaperOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [printScopeMode, setPrintScopeMode] = useState<'all' | 'custom'>('all');
  const [selectedInstsForPrint, setSelectedInstsForPrint] = useState<string[]>([]);
  const [printSections, setPrintSections] = useState({
    header: true,
    dashboardKpis: true,
    territorialCharts: true,
    scheduleGrid: true,
    signatures: true
  });

  // Schedule Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [initialDateForModal, setInitialDateForModal] = useState<string | undefined>(undefined);
  const [isQuickAssignModalOpen, setIsQuickAssignModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Solicitudes de cambio de fecha (Uribia)
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(() => {
    const saved = localStorage.getItem('change_requests');
    return saved ? JSON.parse(saved) : [];
  });
  const [rescheduleSessionTarget, setRescheduleSessionTarget] = useState<TrainingSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<TrainingSession | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark Mode Theme State & Persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Undo Banner State
  const [undoBanner, setUndoBanner] = useState<{
    show: boolean;
    message: string;
    snapshot: BackupSnapshot;
  } | null>(() => {
    const existing = getEmergencyUndoSnapshot();
    if (existing) {
      return {
        show: true,
        message: 'Existe una copia de seguridad creada automáticamente antes del último restablecimiento.',
        snapshot: existing
      };
    }
    return null;
  });

  // URL Query Reader for Direct Protected Links (?inst=DANE o ?inst=Nombre)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const instParam = params.get('inst');
    if (instParam && institutions.length > 0) {
      const cleanParam = instParam.trim();
      const targetNorm = normalizeText(cleanParam);

      const match = institutions.find(i => 
        i.daneCode === cleanParam ||
        normalizeText(i.name).includes(targetNorm) ||
        targetNorm.includes(normalizeText(i.name)) ||
        i.campuses?.some(c => normalizeText(c).includes(targetNorm))
      );

      if (match) {
        setSessionRole('viewer');
        setRestrictedInstName(match.name);
      } else {
        // Si no encuentra coincidencia en el catálogo, usa el parámetro directo para no vaciar
        setSessionRole('viewer');
        setRestrictedInstName(cleanParam);
      }
    }
  }, [institutions]);

  useEffect(() => {
    if (restrictedInstName) {
      localStorage.setItem('restricted_inst_name', restrictedInstName);
    }
  }, [restrictedInstName]);

  // Firebase State & Sync
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'connecting' | 'offline'>('connecting');

  // Inicialización y Sincronización en Tiempo Real con Firebase Firestore
  useEffect(() => {
    // 1. Probar conectividad con Firestore
    testConnection();

    // 2. Escuchar estado de autenticación (Google Auth / Admin)
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && isAuthorizedCoordinatorEmail(user.email)) {
        setSessionRole('admin');
        localStorage.setItem('auth_role', 'admin');
      }
    });

    // 3. Suscripción en Tiempo Real a la colección 'sessions' de Firestore
    let hasAttemptedSeed = false;
    const initialClean = deduplicateSessions(initialValidatedSessions || []).map((s, idx) => ({
      ...s,
      itemNumber: idx + 1
    }));

    // Garantía Offline Inmediata: Si Firestore no responde en 1.5s por falta de red,
    // asegurar inmediatamente la carga de las 470 sesiones oficiales sin esperas infinitas
    const offlineGraceTimer = setTimeout(() => {
      setFirebaseSyncStatus((prev) => (prev === 'connecting' ? 'offline' : prev));
      setSessions((prev) => {
        if (prev && prev.length >= 400) return prev;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch (e) {}
        }
        return initialClean;
      });
    }, 1500);

    const unsubscribeSessions = subscribeToSessions((firestoreSessions) => {
      clearTimeout(offlineGraceTimer);
      if (firestoreSessions.length > 0) {
        // Filtrar localmente registros no deseados (El Pájaro o Microlearning)
        const cleanSessions = firestoreSessions.filter(
          s => s.modality !== 'Microlearning' &&
               !(s.institution || '').toLowerCase().includes('pajaro') &&
               !(s.institution || '').toLowerCase().includes('pájaro')
        );

        const clean = deduplicateSessions(cleanSessions);
        // Si hay sesiones válidas en Firestore, utilizarlas como estado de la aplicación
        if (clean.length > 0) {
          setSessions(clean);
        } else {
          setSessions(initialClean);
        }
        setFirebaseSyncStatus('synced');
      } else if (!hasAttemptedSeed) {
        hasAttemptedSeed = true;
        // Si Firestore está vacío, sembramos la matriz oficial inicial completa Sep - Dic 2026
        seedFirestoreIfEmpty(initialClean).then((seeded) => {
          if (seeded) {
            setFirebaseSyncStatus('synced');
          }
        }).catch(err => console.warn('Aviso en seed inicial:', err));
      }
    }, (err) => {
      clearTimeout(offlineGraceTimer);
      console.warn('Firestore offline o sin conectividad en sesiones:', err);
      setFirebaseSyncStatus('offline');
      // En modo sin conexión, garantizar carga instantánea desde memoria local
      setSessions((prev) => {
        if (prev && prev.length >= 400) return prev;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch (e) {}
        }
        return initialClean;
      });
    });

    // 4. Suscripción en Tiempo Real a las solicitudes de cambio
    const unsubscribeRequests = subscribeToChangeRequests((firestoreRequests) => {
      if (firestoreRequests.length > 0) {
        setChangeRequests(firestoreRequests);
      }
    }, (err) => {
      console.warn('Firestore offline o error de conexión en solicitudes:', err);
    });

    return () => {
      clearTimeout(offlineGraceTimer);
      unsubscribeAuth();
      unsubscribeSessions();
      unsubscribeRequests();
    };
  }, []);

  // Auto-saves
  useEffect(() => { 
    saveSessions(sessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Error guardando sesiones en STORAGE_KEY", e);
    }
  }, [sessions]);
  useEffect(() => { saveInstitutions(institutions); }, [institutions]);
  useEffect(() => { saveBranding(branding); }, [branding]);
  useEffect(() => {
    try {
      localStorage.setItem('change_requests', JSON.stringify(changeRequests));
    } catch (e) {
      console.warn('Error saving change requests to localStorage:', e);
    }
  }, [changeRequests]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (sessions.length > 0) {
      const timer = setTimeout(() => {
        saveAutoSnapshot(sessions, institutions, branding, 'Auto-guardado de seguridad');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessions.length]);

  // Obtener perfil institucional activo para contrastar sedes, municipios y código DANE
  const currentInstProfile = useMemo(() => {
    if (!restrictedInstName) return null;
    const targetNorm = normalizeText(restrictedInstName);
    return institutions.find(i => 
      i.daneCode === restrictedInstName ||
      normalizeText(i.name).includes(targetNorm) ||
      targetNorm.includes(normalizeText(i.name)) ||
      i.campuses?.some(c => normalizeText(c).includes(targetNorm))
    ) || null;
  }, [restrictedInstName, institutions]);

  // Sesiones de la institución restringida (filtrado estricto para el colegio)
  const institutionalSessions = useMemo(() => {
    if (!restrictedInstName) return sessions;
    const targetNorm = normalizeText(restrictedInstName);

    return sessions.filter(session => {
      const sessInstNorm = normalizeText(session.institution);
      const sessCampusNorm = normalizeText(session.campus || '');

      // 1. Coincidencia directa por nombre normalizado (bidireccional)
      if (sessInstNorm.includes(targetNorm) || targetNorm.includes(sessInstNorm)) {
        return true;
      }

      // 2. Coincidencia por sede o campus
      if (sessCampusNorm && (sessCampusNorm.includes(targetNorm) || targetNorm.includes(sessCampusNorm))) {
        return true;
      }

      // 3. Coincidencia contra el perfil oficial de la institución (campuses o nombres alternativos)
      if (currentInstProfile) {
        const profileNorm = normalizeText(currentInstProfile.name);
        if (sessInstNorm.includes(profileNorm) || profileNorm.includes(sessInstNorm)) {
          return true;
        }
        if (currentInstProfile.campuses?.some(c => {
          const cNorm = normalizeText(c);
          return sessInstNorm.includes(cNorm) || sessCampusNorm.includes(cNorm);
        })) {
          return true;
        }
      }

      return false;
    });
  }, [sessions, restrictedInstName, currentInstProfile]);

  // Modo Kiosco Institucional Exclusivo: activo cuando entra un usuario viewer vía ?inst=...
  const isInstitutionalKiosk = sessionRole === 'viewer' && Boolean(restrictedInstName);

  const visibleSessions = useMemo(() => {
    if (!restrictedInstName || sessionRole === 'admin') {
      return sessions;
    }

    const targetNorm = normalizeText(restrictedInstName);

    const currentInstProfile = institutions.find(i => 
      normalizeText(i.name).includes(targetNorm) || 
      targetNorm.includes(normalizeText(i.name)) ||
      i.daneCode === restrictedInstName
    );

    return sessions.filter(session => {
      const sessInstNorm = normalizeText(session.institution);
      const sessCampusNorm = normalizeText(session.campus || '');

      // Coincidencia con nombre o sede
      if (sessInstNorm.includes(targetNorm) || targetNorm.includes(sessInstNorm)) return true;
      if (sessCampusNorm && (sessCampusNorm.includes(targetNorm) || targetNorm.includes(sessCampusNorm))) return true;

      // Coincidencia con el catálogo de instituciones
      if (currentInstProfile) {
        const profileNorm = normalizeText(currentInstProfile.name);
        if (sessInstNorm.includes(profileNorm) || profileNorm.includes(sessInstNorm)) return true;
        if (currentInstProfile.campuses?.some(c => {
          const cNorm = normalizeText(c);
          return sessInstNorm.includes(cNorm) || sessCampusNorm.includes(cNorm);
        })) {
          return true;
        }
      }

      return false;
    });
  }, [sessions, sessionRole, restrictedInstName, institutions]);

  // CENTRALIZACIÓN DE FILTROS EN src/App.tsx (Única fuente de verdad)
  const [selectedInstitution, setSelectedInstitution] = useState<string>(() => {
    return restrictedInstName || 'all';
  });
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');

  useEffect(() => {
    if (restrictedInstName) {
      setSelectedInstitution(restrictedInstName);
    }
  }, [restrictedInstName]);

  // Lista única computada filteredSessions que aplica los filtros sobre las sesiones activas del Calendario
  const filteredSessions = useMemo(() => {
    return visibleSessions.filter(s => {
      const matchInst = selectedInstitution === 'all' || 
        s.institution === selectedInstitution || 
        (s.campus && s.campus === selectedInstitution) ||
        (selectedInstitution.toLowerCase().includes('camarones') && 
          (s.institution.toLowerCase().includes('camarones') || (s.campus && s.campus.toLowerCase().includes('camarones'))));

      const matchMun = selectedMunicipality === 'all' || 
        s.municipality.toLowerCase() === selectedMunicipality.toLowerCase();

      const matchMod = selectedModality === 'all' || 
        s.modality.toLowerCase() === selectedModality.toLowerCase();

      const matchAud = selectedAudience === 'all' || 
        (s.targetAudience && s.targetAudience.toLowerCase().includes(selectedAudience.toLowerCase())) || 
        (s.targetPopulation && s.targetPopulation.toLowerCase().includes(selectedAudience.toLowerCase()));

      return matchInst && matchMun && matchMod && matchAud;
    });
  }, [visibleSessions, selectedInstitution, selectedMunicipality, selectedModality, selectedAudience]);

  // Rule Analysis
  const alerts = useMemo<ConflictAlert[]>(() => {
    return analyzeConflictsAndRules(visibleSessions);
  }, [visibleSessions]);

  const highAlertCount = useMemo(() => alerts.filter(a => a.severity === 'high').length, [alerts]);
  const pendingSessions = useMemo(() => visibleSessions.filter(s => s.status === 'PDTE'), [visibleSessions]);

  // Manejo de Acceso de Coordinador y Desbloqueo
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminKeyError('');
    const cleanKey = adminKeyInput.trim().toUpperCase();

    if (cleanKey === 'ADMIN2026') {
      setSessionRole('admin');
      localStorage.setItem('auth_role', 'admin');
      setShowAdminLoginModal(false);
      setAdminKeyInput('');
      setAdminKeyError('');
      return;
    }

    setAdminKeyError('Clave incorrecta. Ingrese la clave maestra de Coordinación.');
  };

  const handleGoogleSignIn = async () => {
    try {
      setAdminKeyError('');
      const user = await signInWithGoogle();
      if (user) {
        if (isAuthorizedCoordinatorEmail(user.email)) {
          setSessionRole('admin');
          localStorage.setItem('auth_role', 'admin');
          setShowAdminLoginModal(false);
          setToastMessage(`Bienvenido Coordinador: ${user.displayName || user.email}`);
        } else {
          // Desconectar al usuario de Firebase ya que no cuenta con autorización
          await logoutUser();
          setSessionRole('viewer');
          localStorage.removeItem('auth_role');
          setAdminKeyError(`Acceso denegado: El correo "${user.email}" no tiene permisos de Coordinación. Únicamente cuentas autorizadas (@thebiznation.com, logistica.geb@thebiznation.com o pmcp091@gmail.com).`);
        }
      }
    } catch (err: any) {
      console.warn("Error en inicio de sesión con Google:", err);
      setAdminKeyError(err.message || "Error al autenticar con Google.");
    }
  };

  const handleLogout = () => {
    setSessionRole('viewer');
    localStorage.removeItem('auth_role');
    logoutUser().catch(console.warn);
  };

  const handleClearRestrictedInst = () => {
    setRestrictedInstName(null);
    localStorage.removeItem('restricted_inst_name');
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Session CRUD
  const handleOpenNewSession = (dateStr?: string) => {
    if (sessionRole !== 'admin') return;
    setEditingSession(null);
    setInitialDateForModal(dateStr);
    setIsScheduleModalOpen(true);
  };

  const handleEditSession = (session: TrainingSession) => {
    if (sessionRole !== 'admin') return;
    setEditingSession(session);
    setInitialDateForModal(session.specificDate);
    setIsScheduleModalOpen(true);
  };

  const handleDuplicateSession = (session: TrainingSession) => {
    if (sessionRole !== 'admin') return;
    const duplicated: TrainingSession = {
      ...session,
      id: `sess-${Date.now()}`,
      itemNumber: sessions.length + 1,
      institution: `${session.institution} (Copia)`,
      status: 'PDTE',
      observations: `${session.observations || ''} [Duplicado]`.trim()
    };
    setSessions(prev => deduplicateSessions([duplicated, ...prev]));
    syncSaveSession(duplicated).catch(err => console.warn('Error guardando en Firestore:', err));
  };

  const handleDeleteSession = (id: string) => {
    if (sessionRole !== 'admin') return;
    const target = sessions.find(s => s.id === id);
    if (target) {
      setSessionToDelete(target);
    }
  };

  const handleConfirmDeleteSession = () => {
    if (!sessionToDelete) return;
    const deletedInst = sessionToDelete.institution;
    const deletedId = sessionToDelete.id;
    setSessions(prev => prev.filter(s => s.id !== deletedId));
    syncDeleteSession(deletedId).catch(err => console.warn('Error eliminando en Firestore:', err));
    setSessionToDelete(null);
    setToastMessage(`Sesión de "${deletedInst}" eliminada correctamente.`);
  };

  const handleSaveSession = (savedSession: TrainingSession, newInstitution?: InstitutionProfile) => {
    if (newInstitution) {
      setInstitutions(prev => prev.some(i => i.name.toLowerCase() === newInstitution.name.toLowerCase()) ? prev : [...prev, newInstitution]);
    }
    setSessions(prev => {
      const exists = prev.some(s => s.id === savedSession.id);
      const updated = exists 
        ? prev.map(s => s.id === savedSession.id ? savedSession : s) 
        : [savedSession, ...prev];
      return updated;
    });
    syncSaveSession(savedSession).catch(err => console.warn('Error guardando en Firestore:', err));
    setToastMessage(`Sesión de "${savedSession.institution}" guardada exitosamente.`);
  };

  // Guardar, Agregar y Eliminar Instituciones (Coordinador)
  const handleUpdateInstitution = (updated: InstitutionProfile) => {
    setInstitutions(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleAddInstitution = (newInst: InstitutionProfile) => {
    setInstitutions(prev => [...prev, newInst]);
  };

  const handleDeleteInstitution = (id: string) => {
    const target = institutions.find(i => i.id === id);
    setInstitutions(prev => prev.filter(i => i.id !== id));
    if (target) {
      const sessionsToDelete = sessions.filter(s => s.institution.toLowerCase() === target.name.toLowerCase());
      sessionsToDelete.forEach(s => syncDeleteSession(s.id).catch(console.warn));
      setSessions(prev => prev.filter(s => s.institution.toLowerCase() !== target.name.toLowerCase()));
    }
  };

  // Manejo de Solicitudes de Reprogramación (Uribia)
  const handleOpenRescheduleModal = (session: TrainingSession) => {
    setRescheduleSessionTarget(session);
    setIsRescheduleModalOpen(true);
  };

  const handleSubmitRescheduleRequest = (req: RescheduleRequest) => {
    setChangeRequests(prev => [req, ...prev]);
    syncSaveChangeRequest(req).catch(err => console.warn('Error guardando solicitud en Firestore:', err));
    setIsRescheduleModalOpen(false);
    setRescheduleSessionTarget(null);
    setToastMessage('Solicitud enviada al Coordinador con éxito');
  };

  const handleApproveRequest = (requestId: string, feedback: string) => {
    const targetReq = changeRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedReq: ChangeRequest = { ...targetReq, status: 'Aprobada' as const, coordinatorFeedback: feedback };

    // 1. Actualizar el estado de la solicitud a 'Aprobada'
    setChangeRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
    syncSaveChangeRequest(updatedReq).catch(err => console.warn('Error actualizando solicitud en Firestore:', err));

    // 2. Modificar la sesión en el cronograma con la nueva fecha y horas
    setSessions(prev => prev.map(s => {
      const isTarget = s.id === targetReq.sessionId || 
        (s.institution === targetReq.institution && (s.date === targetReq.currentDate || s.specificDate === targetReq.currentDate));

      if (isTarget) {
        // Calcular día de la semana para la nueva fecha
        const dateParts = targetReq.proposedDate.split('-').map(Number);
        const dayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const newDayName = dayNames[dayDate.getDay()];

        const monthMap: Record<number, 'september' | 'october' | 'november' | 'december'> = {
          8: 'september',
          9: 'october',
          10: 'november',
          11: 'december'
        };
        const mKey = monthMap[dayDate.getMonth()];
        const updatedDatesScheduled = { ...(s.datesScheduled || {}) };
        if (mKey) {
          updatedDatesScheduled[mKey] = [targetReq.proposedDate];
        }

        const updatedSession: TrainingSession = {
          ...s,
          specificDate: targetReq.proposedDate,
          date: targetReq.proposedDate,
          specificDates: [targetReq.proposedDate],
          startTime: targetReq.proposedStartTime,
          endTime: targetReq.proposedEndTime,
          daysOfWeek: [newDayName],
          datesScheduled: updatedDatesScheduled,
          status: 'APROBADO' as const,
          observations: s.observations 
            ? `${s.observations} [Aprobado por Coordinación: ${targetReq.proposedDate}]` 
            : `Aprobado por Coordinación: ${targetReq.proposedDate}`
        };
        syncSaveSession(updatedSession).catch(err => console.warn('Error actualizando sesión en Firestore:', err));
        return updatedSession;
      }
      return s;
    }));

    setToastMessage(`Solicitud aprobada. La sesión de ${targetReq.institution} fue actualizada.`);
  };

  const handleRejectRequest = (requestId: string, feedback: string) => {
    const targetReq = changeRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedReq: ChangeRequest = { ...targetReq, status: 'Rechazada' as const, coordinatorFeedback: feedback };
    setChangeRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
    syncSaveChangeRequest(updatedReq).catch(err => console.warn('Error actualizando solicitud rechazada en Firestore:', err));

    setToastMessage(`Solicitud de ${targetReq.institution} rechazada.`);
  };

  const pendingRequestsCount = useMemo(() => {
    return changeRequests.filter(r => r.status === 'Pendiente').length;
  }, [changeRequests]);

  const allInstitutionNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(s => { if (s.institution) names.add(s.institution); });
    return Array.from(names).sort();
  }, [sessions]);

  useEffect(() => {
    if (allInstitutionNames.length > 0 && selectedInstsForPrint.length === 0) {
      setSelectedInstsForPrint([...allInstitutionNames]);
    }
  }, [allInstitutionNames]);

  const handleExportExcel = (
    selectedInsts?: string[],
    sortBy: SessionSortField = 'date',
    sortOrder: SortOrder = 'asc'
  ) => {
    const targetInsts = selectedInsts !== undefined 
      ? selectedInsts 
      : (selectedInstitution !== 'all' ? [selectedInstitution] : (printScopeMode === 'custom' && selectedInstsForPrint.length > 0 ? selectedInstsForPrint : undefined));
    const sortedToExport = sortSessions(filteredSessions, sortBy, sortOrder);
    exportToExcel(
      sortedToExport,
      institutions,
      restrictedInstName || (selectedInstitution !== 'all' ? selectedInstitution : null),
      branding,
      targetInsts
    );
  };

  const handleUpdateBranding = (updated: BrandingSettings) => {
    setBranding(updated);
    saveBranding(updated);
    setToastMessage('Configuración de membrete oficial guardada exitosamente.');
  };

  const handleGenerateDocument = () => {
    // 1. Cerrar el modal de configuración de impresión
    setShowPrintOptionsModal(false);
    setPrintCustomSessions(null);
    setPrintCustomTitle(null);
    setPrintPeriodLabel(null);
    
    // 2. Activar la vista dedicada de impresión
    setIsPrintView(true);
    
    // 3. Esperar 400ms a que React monte el DOM de la vista imprimible y disparar window.print()
    setTimeout(() => {
      window.focus();
      window.print();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Estilos CSS Dinámicos para Imprenta */}
      <style>{`
        @page {
          size: ${paperFormat === 'letter' ? '215.9mm 279.4mm' : '215.9mm 330.2mm'} ${paperOrientation};
          margin: 15mm;
        }
        @media print {
          nav, header, footer, .no-print, button { display: none !important; }
          html, body, #root, .min-h-screen { 
            background: white !important; 
            color: black !important; 
          }
          * {
            color-scheme: light !important;
          }
          .print-clean { border: 1px solid #ccc !important; box-shadow: none !important; }
          ${!printSections.header ? '.print-header { display: none !important; }' : ''}
          ${!printSections.dashboardKpis ? '.print-kpis { display: none !important; }' : ''}
          ${!printSections.territorialCharts ? '.print-charts { display: none !important; }' : ''}
          ${!printSections.scheduleGrid ? '.print-schedule { display: none !important; }' : ''}
        }
      `}</style>

      {/* Barra de Conectividad */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-1 text-center flex items-center justify-center gap-1.5 shadow-xs no-print">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo sin conexión (datos guardados en memoria local)</span>
        </div>
      )}

      {/* Banner Superior de Estado solo para el Coordinador en modo Admin */}
      {sessionRole === 'admin' && (
        <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex justify-between items-center border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>
              Sesión Activa: <strong className="text-amber-400">Coordinador General (Edición y Parámetros Habilitados)</strong>
              {restrictedInstName && (
                <span className="ml-2 text-slate-400">
                  (Filtro de Sede: {currentInstProfile?.name || restrictedInstName})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {restrictedInstName && (
              <button 
                onClick={handleClearRestrictedInst} 
                className="text-amber-400 hover:underline font-bold text-xs cursor-pointer"
              >
                ✕ Ver las 12 Instituciones
              </button>
            )}
            <button 
              onClick={() => setShowPrintOptionsModal(true)} 
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
            </button>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">
              Salir de Coordinación
            </button>
            <button
              onClick={async () => {
                if (window.confirm("¿Estás seguro? Se restablecerá el cronograma a la matriz oficial validada y se sincronizará con Firebase.")) {
                  localStorage.removeItem(STORAGE_KEY);
                  const clean = deduplicateSessions(initialValidatedSessions).map((s, idx) => ({ ...s, itemNumber: idx + 1 }));
                  setSessions(clean);
                  await resetFirestoreSessions(clean).catch(err => console.warn(err));
                  setToastMessage("Cronograma restablecido a la matriz oficial y sincronizado con Firebase.");
                }
              }}
              className="text-xs text-amber-400 hover:text-amber-300 underline font-medium ml-2 cursor-pointer"
            >
              🔄 Restablecer Matriz Oficial
            </button>
          </div>
        </div>
      )}

      {/* Navbar Modular */}
      <Navbar
        branding={branding}
        activeTab={activeTab as ActiveTab}
        setActiveTab={tab => {
          setIsPrintView(false);
          setActiveTab(tab);
        }}
        isOnline={isOnline}
        onOpenNewSession={handleOpenNewSession}
        onPrint={() => setShowPrintOptionsModal(true)}
        onExportCSV={() => exportToCSV(visibleSessions, restrictedInstName)}
        onExportExcel={() => handleExportExcel()}
        onExportHTML={() => exportToHTML(visibleSessions, branding, institutions)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        conflictCount={highAlertCount}
        pendingCount={pendingSessions.length}
        pendingRequestsCount={pendingRequestsCount}
        sessionRole={sessionRole}
        onOpenAdminLogin={() => {
          setAdminKeyInput('');
          setAdminKeyError('');
          setShowAdminLoginModal(true);
        }}
        onLogoutAdmin={handleLogout}
        restrictedInstName={restrictedInstName}
        institutionProfile={currentInstProfile}
        isInstitutionalKiosk={isInstitutionalKiosk}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        firebaseSyncStatus={firebaseSyncStatus}
      />

      {/* Pestaña Accesible para Dashboard (Solo para administradores o vista universal) */}
      {!isInstitutionalKiosk && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3 no-print flex gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-amber-400 text-slate-950 shadow-xs' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> 📊 Dashboard Ejecutivo
          </button>
        </div>
      )}

      {/* Área de Contenido */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {isInstitutionalKiosk ? (
          isPrintView ? (
            <PrintView
              sessions={visibleSessions}
              branding={branding}
              onBack={() => setIsPrintView(false)}
              onExportHTML={() => exportToHTML(visibleSessions, branding, institutions)}
              onExportExcel={(selectedInsts) => handleExportExcel(selectedInsts)}
              paperFormat={paperFormat}
              paperOrientation={paperOrientation}
              sectionsConfig={printSections}
              restrictedInstName={restrictedInstName}
            />
          ) : (
            <InstitutionalKioskView
              institutionName={currentInstProfile?.name || restrictedInstName!}
              institutionProfile={currentInstProfile}
              sessions={visibleSessions}
              onPrint={() => setShowPrintOptionsModal(true)}
              onExportExcel={() => handleExportExcel()}
              onRequestReschedule={handleOpenRescheduleModal}
              changeRequests={changeRequests}
            />
          )
        ) : restrictedInstName && visibleSessions.length === 0 && sessions.length > 0 && activeTab !== 'institutions' && activeTab !== 'branding' ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-300 dark:border-amber-500/30 p-8 sm:p-12 text-center shadow-md space-y-4 max-w-xl mx-auto my-12">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mx-auto text-amber-700 dark:text-amber-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                No hay formaciones programadas aún para esta institución
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                No se encontraron actividades registradas para <strong>"{restrictedInstName}"</strong> en el cronograma actual. Puedes consultar el cronograma universal de todas las instituciones.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleClearRestrictedInst}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition cursor-pointer"
              >
                <span>✕ Ver Cronograma Universal (12 Instituciones)</span>
              </button>
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          <DashboardView sessions={sessions} institutions={institutions} />
        ) : isPrintView ? (
          <PrintScheduleView
            sessions={printCustomSessions || filteredSessions}
            allSessions={sessions}
            branding={branding}
            selectedInstitution={selectedInstitution}
            selectedMunicipality={selectedMunicipality}
            selectedModality={selectedModality}
            customTitle={printCustomTitle}
            periodLabel={printPeriodLabel}
            onBack={() => {
              setIsPrintView(false);
              setPrintCustomSessions(null);
              setPrintCustomTitle(null);
              setPrintPeriodLabel(null);
            }}
            onExportHTML={() => exportToHTML(printCustomSessions || filteredSessions, branding, institutions)}
            onExportExcel={(selectedInsts) => handleExportExcel(selectedInsts)}
            paperFormat={paperFormat}
            paperOrientation={paperOrientation}
            sectionsConfig={printSections}
            restrictedInstName={restrictedInstName || (selectedInstitution !== 'all' ? selectedInstitution : null)}
          />
        ) : (
          <>
            {activeTab === 'table' && (
              <SessionsTableView
                sessions={visibleSessions}
                filteredSessions={filteredSessions}
                selectedInstitution={selectedInstitution}
                setSelectedInstitution={setSelectedInstitution}
                selectedMunicipality={selectedMunicipality}
                setSelectedMunicipality={setSelectedMunicipality}
                selectedModality={selectedModality}
                setSelectedModality={setSelectedModality}
                selectedAudience={selectedAudience}
                setSelectedAudience={setSelectedAudience}
                sessionRole={sessionRole}
                onEditSession={handleEditSession}
                onDuplicateSession={handleDuplicateSession}
                onDeleteSession={handleDeleteSession}
                onRequestReschedule={handleOpenRescheduleModal}
                onOpenQuickAssign={() => setIsQuickAssignModalOpen(true)}
                onOpenNewSession={handleOpenNewSession}
                onExportHTML={() => exportToHTML(filteredSessions, branding)}
                onExportExcel={(selectedInsts, sortBy, sortOrder) => handleExportExcel(selectedInsts, sortBy, sortOrder)}
                onPrint={(targetSessions, title, period) => {
                  if (targetSessions) {
                    setPrintCustomSessions(targetSessions);
                    setPrintCustomTitle(title || null);
                    setPrintPeriodLabel(period || null);
                    setIsPrintView(true);
                  } else {
                    setShowPrintOptionsModal(true);
                  }
                }}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                sessions={visibleSessions}
                filteredSessions={filteredSessions}
                selectedInstitution={selectedInstitution}
                setSelectedInstitution={setSelectedInstitution}
                selectedMunicipality={selectedMunicipality}
                setSelectedMunicipality={setSelectedMunicipality}
                selectedModality={selectedModality}
                setSelectedModality={setSelectedModality}
                selectedAudience={selectedAudience}
                setSelectedAudience={setSelectedAudience}
                institutions={institutions}
                sessionRole={sessionRole}
                onEditSession={handleEditSession}
                onAddSessionForDate={(dateStr) => handleOpenNewSession(dateStr)}
                onDeleteSession={handleDeleteSession}
                onDuplicateSession={handleDuplicateSession}
                onRequestReschedule={handleOpenRescheduleModal}
                onExportExcel={() => handleExportExcel()}
                onExportCSV={() => exportToCSV(filteredSessions, restrictedInstName || (selectedInstitution !== 'all' ? selectedInstitution : null))}
                onExportHTML={() => exportToHTML(filteredSessions, branding)}
                onPrint={(targetSessions, title, period) => {
                  if (targetSessions) {
                    setPrintCustomSessions(targetSessions);
                    setPrintCustomTitle(title || null);
                    setPrintPeriodLabel(period || null);
                    setIsPrintView(true);
                    setTimeout(() => {
                      window.focus();
                      window.print();
                    }, 400);
                  } else {
                    setShowPrintOptionsModal(true);
                  }
                }}
              />
            )}

            {/* Pestaña Instituciones & Logística de Terreno */}
            {activeTab === 'institutions' && (
              <InstitutionsView
                institutions={institutions}
                isAdmin={sessionRole === 'admin'}
                onUpdateInstitution={handleUpdateInstitution}
                onDeleteInstitution={handleDeleteInstitution}
                onAddInstitution={handleAddInstitution}
                onSelectInstitutionForFilter={(instName) => setRestrictedInstName(instName)}
              />
            )}

            {activeTab === 'validator' && (
              <ValidatorView
                sessions={visibleSessions}
                alerts={alerts}
                onOpenQuickAssign={() => setIsQuickAssignModalOpen(true)}
                onEditSession={handleEditSession}
              />
            )}

            {activeTab === 'branding' && (
              <BrandingView
                branding={branding}
                onUpdateBranding={handleUpdateBranding}
                onResetBranding={() => handleUpdateBranding(DEFAULT_BRANDING)}
              />
            )}

            {activeTab === 'requests' && sessionRole === 'admin' && (
              <ChangeRequestsView
                changeRequests={changeRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Configuración y Selección para Imprenta / PDF / Excel */}
      {showPrintOptionsModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Exportación e Impresión Oficial
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Membrete institucional (1 logo superior y 5 al pie de página)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintOptionsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selección de Alcance de Instituciones */}
            <div>
              <label className="text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider block mb-1.5">
                Instituciones a Incluir en el Documento:
              </label>

              {restrictedInstName ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Enlace de institución exclusiva activa:
                  </p>
                  <p className="mt-0.5 text-amber-800 dark:text-amber-300 font-medium">
                    {restrictedInstName} (Este reporte solo mostrará los datos de su sede).
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPrintScopeMode('all')}
                      className={`p-2.5 rounded-xl text-left text-xs transition cursor-pointer border ${
                        printScopeMode === 'all'
                          ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-950 dark:text-amber-300 font-bold'
                          : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-bold">Todas las Instituciones</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        12 sedes de La Guajira
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintScopeMode('custom')}
                      className={`p-2.5 rounded-xl text-left text-xs transition cursor-pointer border ${
                        printScopeMode === 'custom'
                          ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-950 dark:text-amber-300 font-bold'
                          : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-bold">Escoger en concreto</span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        {selectedInstsForPrint.length} de {allInstitutionNames.length} seleccionada(s)
                      </span>
                    </button>
                  </div>

                  {printScopeMode === 'custom' && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          Seleccione las sedes a exportar:
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedInstsForPrint([...allInstitutionNames])}
                            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            Marcar Todas
                          </button>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <button
                            type="button"
                            onClick={() => setSelectedInstsForPrint([])}
                            className="text-[10px] font-medium text-slate-500 hover:underline cursor-pointer"
                          >
                            Desmarcar
                          </button>
                        </div>
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
                        {allInstitutionNames.map(inst => {
                          const isChecked = selectedInstsForPrint.includes(inst);
                          return (
                            <label
                              key={inst}
                              className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition text-xs ${
                                isChecked
                                  ? 'bg-amber-100/60 dark:bg-amber-950/40 text-slate-900 dark:text-amber-200 font-bold'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedInstsForPrint(prev =>
                                    prev.includes(inst)
                                      ? prev.filter(i => i !== inst)
                                      : [...prev, inst]
                                  );
                                }}
                                className="accent-amber-500 rounded cursor-pointer"
                              />
                              <span className="truncate text-[11px]">{inst}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Formato de Hoja y Orientación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                  Formato de Hoja
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaperFormat('letter')}
                    className={`p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      paperFormat === 'letter'
                        ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-slate-900 dark:text-amber-300 font-bold'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <span>Carta</span>
                    <span className="block text-slate-400 text-[9px] font-normal">21.59 x 27.94 cm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperFormat('legal')}
                    className={`p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      paperFormat === 'legal'
                        ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-slate-900 dark:text-amber-300 font-bold'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <span>Oficio</span>
                    <span className="block text-slate-400 text-[9px] font-normal">21.59 x 33.02 cm</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                  Orientación
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaperOrientation('portrait')}
                    className={`p-2 rounded-xl text-center text-xs transition cursor-pointer ${
                      paperOrientation === 'portrait'
                        ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-slate-900 dark:text-amber-300 font-bold'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    Vertical
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperOrientation('landscape')}
                    className={`p-2 rounded-xl text-center text-xs transition cursor-pointer ${
                      paperOrientation === 'landscape'
                        ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-slate-900 dark:text-amber-300 font-bold'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    Horizontal
                  </button>
                </div>
              </div>
            </div>

            {/* Selección de Contenido a Imprimir */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-1.5">
              <label className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                Secciones en Vista Imprimible / PDF:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={printSections.header}
                    onChange={e => setPrintSections({ ...printSections, header: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>Membrete y Encabezado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={printSections.dashboardKpis}
                    onChange={e => setPrintSections({ ...printSections, dashboardKpis: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>Métricas y Conteo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={printSections.territorialCharts}
                    onChange={e => setPrintSections({ ...printSections, territorialCharts: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>Gráficas Territoriales</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={printSections.scheduleGrid}
                    onChange={e => setPrintSections({ ...printSections, scheduleGrid: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>Grilla Cronológica</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={printSections.signatures}
                    onChange={e => setPrintSections({ ...printSections, signatures: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>Bloque Oficial de Firmas y Validación</span>
                </label>
              </div>
            </div>

            {/* Botones de Acción Oficiales */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPrintOptionsModal(false)}
                className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center"
              >
                Cancelar
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Botón Descargar Excel */}
                <button
                  type="button"
                  id="btn-modal-export-excel"
                  onClick={() => {
                    setShowPrintOptionsModal(false);
                    handleExportExcel(
                      printScopeMode === 'all' || restrictedInstName 
                        ? undefined 
                        : selectedInstsForPrint
                    );
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
                  title="Descargar archivo Excel oficial con los 6 logos y las instituciones seleccionadas"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Descargar Excel (.xlsx)</span>
                </button>

                {/* Botón Vista Previa / Imprimir PDF */}
                <button
                  type="button"
                  id="btn-modal-print-pdf"
                  onClick={handleGenerateDocument}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-xs transition cursor-pointer"
                  title="Abrir vista imprimible y generar documento PDF oficial"
                >
                  <Printer className="w-4 h-4 text-slate-950" />
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador Flotante de Preparación y Descarga de PDF */}
      {isGeneratingPDF && !showPrintOptionsModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-50 no-print animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl px-6 py-5 shadow-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 max-w-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Generando archivo PDF...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Compilando documento en alta resolución e iniciando descarga.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Acceso Exclusivo para Coordinador */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowAdminLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
              title="Cerrar"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <KeyRound className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Acceso de Coordinación</h3>
                <p className="text-xs text-slate-400">The Biz Nation • Vocación que Transforma</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Ingrese la clave de Coordinador para desbloquear las funciones de edición (crear/modificar sesiones, validar cruces y editar sedes).
            </p>
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Clave Maestra
                </label>
                <input 
                  type="password"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 transition text-sm"
                  placeholder="Ingrese clave"
                  value={adminKeyInput}
                  onChange={e => setAdminKeyInput(e.target.value)}
                />
              </div>
              {adminKeyError && <p className="text-rose-400 text-xs font-medium">{adminKeyError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(false)}
                  className="w-1/2 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl transition shadow-lg text-xs cursor-pointer"
                >
                  Desbloquear
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-700"></div>
                <span className="shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">o continuar con</span>
                <div className="grow border-t border-slate-700"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl border border-slate-600 transition shadow-xs text-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Acceder con Google (Coordinador)</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-snug">
                Acceso restringido a <span className="text-slate-300 font-medium">pmcp091@gmail.com</span>, <span className="text-slate-300 font-medium">logistica.geb@thebiznation.com</span> y cuentas <span className="text-slate-300 font-medium">@thebiznation.com</span>.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Footer Membretado con los 5 Aliados Estratégicos */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 no-print mt-auto transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          {/* Fila Horizontal de los 5 Aliados */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-6 md:gap-8 flex-wrap py-2">
              <img
                src="/logos/grupo_energia_bogota.png"
                alt="Grupo Energía Bogotá"
                className="h-7 md:h-8 w-auto object-contain"
              />
              <img
                src="/logos/acdi.png"
                alt="ACDI/VOCA LA"
                className="h-7 md:h-8 w-auto object-contain"
              />
              <img
                src="/logos/promigas.png"
                alt="Fundación Promigas"
                className="h-7 md:h-8 w-auto object-contain"
              />
              <img
                src="/logos/enlaza.png"
                alt="Enlaza"
                className="h-7 md:h-8 w-auto object-contain"
              />
              <img
                src="/logos/biz_nation.png"
                alt="Biz Nation"
                className="h-7 md:h-8 w-auto object-contain"
              />
            </div>

            {sessionRole === 'viewer' && (
              <button
                type="button"
                onClick={() => {
                  setAdminKeyInput('');
                  setAdminKeyError('');
                  setShowAdminLoginModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer shrink-0"
                title="Acceso restringido para Coordinador General"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Ingreso Administrativo</span>
              </button>
            )}
          </div>

          {/* Bloque informativo institucional */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {branding.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA'}
            </span>
            <div className="text-slate-500 dark:text-slate-400 text-center sm:text-right">
              Coord. <strong className="text-slate-700 dark:text-slate-300">{branding.coordinatorName}</strong> • Ing. <strong className="text-slate-700 dark:text-slate-300">{branding.engineerName}</strong>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals Operativos */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
        editingSession={editingSession}
        institutions={institutions}
        allSessions={sessions}
        initialDate={initialDateForModal}
      />

      {/* Modal de Confirmación de Seguridad al Eliminar */}
      {sessionToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-150 transition-colors">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-lg font-black text-slate-900 dark:text-white">
                  ¿Estás seguro?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confirmación de seguridad para eliminación
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar esta sesión de formación? Esta acción no se puede deshacer y suprimirá la programación seleccionada del cronograma general.
            </p>

            {/* Ficha Resumen de la sesión a eliminar */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-white leading-tight">
                  {sessionToDelete.institution}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold shrink-0">
                  {sessionToDelete.modality}
                </span>
              </div>
              
              {sessionToDelete.campus && sessionToDelete.campus !== sessionToDelete.institution && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Sede:</span> {sessionToDelete.campus}
                </div>
              )}

              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Actividad:</span> {sessionToDelete.topic || sessionToDelete.trainingType}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>Horario: <strong className="text-slate-700 dark:text-slate-200">{sessionToDelete.startTime} - {sessionToDelete.endTime}</strong></span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{sessionToDelete.daysOfWeek?.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                id="btn-cancel-delete"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={handleConfirmDeleteSession}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <QuickAssignModal
        isOpen={isQuickAssignModalOpen}
        onClose={() => setIsQuickAssignModalOpen(false)}
        pendingSessions={pendingSessions}
        allSessions={sessions}
        onConfirmAssignment={handleSaveSession}
      />
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        sessions={sessions}
        institutions={institutions}
        branding={branding}
        onRestoreData={data => {
          if (data.sessions) setSessions(data.sessions);
          if (data.institutions) setInstitutions(data.institutions);
          if (data.branding) setBranding(data.branding);
        }}
        onResetAll={async () => {
          const res = resetToDefaults();
          setSessions(res.sessions);
          setInstitutions(res.institutions);
          setBranding(res.branding);
          await resetFirestoreSessions(res.sessions).catch(console.warn);
          setToastMessage('Cronograma restablecido y sincronizado con Firebase.');
        }}
      />
      <PedroGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Modal de Solicitud de Reprogramación para Uribia */}
      <RequestRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setRescheduleSessionTarget(null);
        }}
        session={rescheduleSessionTarget}
        sessions={sessions}
        restrictedInstName={restrictedInstName || undefined}
        onSubmitRequest={handleSubmitRescheduleRequest}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-semibold text-sm rounded-xl shadow-2xl border border-slate-700 dark:border-amber-300 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 hover:bg-slate-800 dark:hover:bg-amber-300 rounded-lg text-slate-400 dark:text-slate-800 hover:text-white dark:hover:text-slate-950 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Indicador Flotante de Conexión en Esquina Inferior */}
      {!isOnline ? (
        <aside
          id="offline-floating-badge"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/95 dark:bg-slate-950/95 text-amber-300 border border-amber-500/50 rounded-xl shadow-2xl text-xs font-semibold backdrop-blur-md no-print animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Modo sin conexión (datos guardados en memoria local)</span>
        </aside>
      ) : (
        <aside
          id="online-status-dot"
          className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/60 dark:bg-slate-950/60 border border-slate-800/80 rounded-full text-[11px] text-slate-300 backdrop-blur-xs opacity-60 hover:opacity-100 transition-opacity no-print"
          title="Conexión en línea activa"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
          <span className="text-[10px] font-medium hidden sm:inline text-slate-300">En línea</span>
        </aside>
      )}
    </div>
  );
}
