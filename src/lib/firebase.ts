import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  query,
  limit,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TrainingSession, ChangeRequest, InstitutionProfile } from '../types/schedule';
import { esSesionHistorica } from '../utils/uribiaValidator';

// Inicializar App y Servicios con Soporte Offline 100% (IndexedDB)
const app = initializeApp(firebaseConfig);

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (error) {
  console.warn('Fallback en inicialización de Firestore con caché:', error);
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

/* CRITICAL: The app will break without this line */
export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validar conectividad con Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Iniciar sesión con Google para Coordinación / Admin
/**
 * Valida si un correo electrónico cuenta con permisos de Coordinación / Admin.
 * Autorizados:
 * - pmcp091@gmail.com
 * - logistica.geb@thebiznation.com
 * - Cualquier cuenta con dominio '@thebiznation.com'
 */
export function isAuthorizedCoordinatorEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === 'pmcp091@gmail.com' ||
    normalized === 'logistica.geb@thebiznation.com' ||
    normalized.endsWith('@thebiznation.com')
  );
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return null;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

// Sincronización en Tiempo Real de Sesiones
export function subscribeToSessions(
  onUpdate: (sessions: TrainingSession[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'sessions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: TrainingSession[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as TrainingSession), id: d.id });
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

// Guardar o Actualizar una Sesión en Firestore
export async function syncSaveSession(session: TrainingSession): Promise<void> {
  const path = `sessions/${session.id}`;
  try {
    // Sanitizar datos para asegurar que no haya undefined
    const cleanSession = JSON.parse(JSON.stringify(session));
    await setDoc(doc(db, 'sessions', session.id), cleanSession);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Eliminar una Sesión en Firestore
export async function syncDeleteSession(sessionId: string): Promise<void> {
  const path = `sessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sincronización en Tiempo Real de Solicitudes de Cambio
export function subscribeToChangeRequests(
  onUpdate: (requests: ChangeRequest[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'changeRequests';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ChangeRequest[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as ChangeRequest), id: d.id });
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

// Guardar Solicitud de Cambio en Firestore
export async function syncSaveChangeRequest(request: ChangeRequest): Promise<void> {
  const path = `changeRequests/${request.id}`;
  try {
    const cleanRequest = JSON.parse(JSON.stringify(request));
    await setDoc(doc(db, 'changeRequests', request.id), cleanRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Inicializar / Sembrar Firestore si la base de datos está vacía
export async function seedFirestoreIfEmpty(initialSessions: TrainingSession[]): Promise<boolean> {
  try {
    const sessionsCol = collection(db, 'sessions');
    const q = query(sessionsCol, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty && initialSessions.length > 0) {
      console.log(`Sembrando ${initialSessions.length} sesiones iniciales en Firestore...`);
      // Escribir en lotes de hasta 450 (Firestore permite 500 por batch)
      const batchSize = 400;
      for (let i = 0; i < initialSessions.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = initialSessions.slice(i, i + batchSize);
        chunk.forEach(s => {
          const docRef = doc(db, 'sessions', s.id);
          batch.set(docRef, JSON.parse(JSON.stringify(s)));
        });
        await batch.commit();
      }
      console.log("Siembra inicial de Firestore completada con éxito.");
      return true;
    }
    return false;
  } catch (error) {
    console.warn("No se pudo sembrar en Firestore o ya existen datos:", error);
    return false;
  }
}

// Restablecer sesiones en Firestore protegiendo íntegramente las sesiones históricas (fecha < hoy)
// y garantizando la UNIÓN completa (332 sesiones en total = históricas intactas + futuras validadas)
export async function resetFirestoreSessions(defaultSessions: TrainingSession[]): Promise<void> {
  try {
    const sessionsCol = collection(db, 'sessions');
    const snapshot = await getDocs(sessionsCol);
    const existingDocsMap = new Map<string, TrainingSession>();
    snapshot.docs.forEach(d => {
      existingDocsMap.set(d.id, d.data() as TrainingSession);
    });

    // 1. Extraer e identificar sesiones históricas y futuras de defaultSessions
    const targetHistorical = defaultSessions.filter(s => esSesionHistorica(s.specificDate || s.date));
    const targetFuture = defaultSessions.filter(s => !esSesionHistorica(s.specificDate || s.date));

    // Si una sesión histórica ya existe en Firestore, conservar exactamente su contenido existente.
    // Si no existe, agregarla para que el histórico nunca quede incompleto.
    const sessionsToWrite: TrainingSession[] = [];

    targetHistorical.forEach(histSession => {
      const existing = existingDocsMap.get(histSession.id);
      if (!existing) {
        // Si falta en Firestore, asegurar su presencia
        sessionsToWrite.push(histSession);
      }
    });

    // Todas las sesiones futuras regeneradas y validadas se deben escribir
    sessionsToWrite.push(...targetFuture);

    // 2. Escribir/Actualizar en lotes (batch) antes de cualquier borrado
    for (let i = 0; i < sessionsToWrite.length; i += 300) {
      const writeBatchInst = writeBatch(db);
      const chunk = sessionsToWrite.slice(i, i + 300);
      chunk.forEach(s => {
        const docRef = doc(db, 'sessions', s.id);
        writeBatchInst.set(docRef, JSON.parse(JSON.stringify(s)));
      });
      await writeBatchInst.commit();
    }

    // 3. Únicamente eliminar documentos que sean huérfanos futuros (fecha >= hoy) que NO existan en defaultSessions
    const validFutureIds = new Set(targetFuture.map(s => s.id));
    const orphanFutureDocsToDelete = snapshot.docs.filter(d => {
      const data = d.data() as TrainingSession;
      const isHist = esSesionHistorica(data.specificDate || data.date);
      // NUNCA eliminar una sesión histórica
      if (isHist) return false;
      // Eliminar solo si no forma parte de las futuras válidas
      return !validFutureIds.has(d.id);
    });

    if (orphanFutureDocsToDelete.length > 0) {
      for (let i = 0; i < orphanFutureDocsToDelete.length; i += 300) {
        const chunk = orphanFutureDocsToDelete.slice(i, i + 300);
        const deleteBatch = writeBatch(db);
        chunk.forEach(d => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }
    }

    console.log(`[FIRESTORE SYNC] Matriz sincronizada exitosamente: ${existingDocsMap.size} previos en Firestore, ${sessionsToWrite.length} escritos, ${orphanFutureDocsToDelete.length} obsoletos eliminados.`);
  } catch (error) {
    console.error('[FIRESTORE SYNC ERROR] Error restableciendo sesiones en Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, 'sessions');
    throw error;
  }
}

export interface SessionsBackupData {
  id: string;
  timestamp: string;
  createdAt: string;
  sessionCount: number;
  sessions: TrainingSession[];
}

// Crear copia de respaldo automática en Firestore antes de reseteos
export async function createSessionsBackup(sessionsToBackup?: TrainingSession[]): Promise<{ backupId: string; timestamp: string; count: number }> {
  try {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const timestamp = `${yyyy}-${mm}-${dd}_${hh}${min}`;
    const backupId = `matriz_${timestamp}`;

    let sessions = sessionsToBackup;
    if (!sessions || sessions.length === 0) {
      const snap = await getDocs(collection(db, 'sessions'));
      sessions = snap.docs.map(d => d.data() as TrainingSession);
    }

    const backupDocRef = doc(db, 'backups', backupId);
    await setDoc(backupDocRef, {
      id: backupId,
      timestamp,
      createdAt: now.toISOString(),
      sessionCount: sessions.length,
      sessions: JSON.parse(JSON.stringify(sessions))
    });

    console.log(`[RESPALDO FIRESTORE] Copia de respaldo guardada en backups/${backupId} (${sessions.length} sesiones).`);
    return { backupId, timestamp, count: sessions.length };
  } catch (error) {
    console.error('[RESPALDO FIRESTORE] Error creando respaldo:', error);
    handleFirestoreError(error, OperationType.WRITE, 'backups');
    throw error;
  }
}

// Restaurar sesiones desde un respaldo específico en caso de conflicto
export async function restoreSessionsFromBackup(backupId: string): Promise<TrainingSession[]> {
  try {
    const backupDocRef = doc(db, 'backups', backupId);
    const snap = await getDoc(backupDocRef);
    if (!snap.exists()) {
      throw new Error(`El respaldo "${backupId}" no existe en Firestore.`);
    }
    const data = snap.data() as SessionsBackupData;
    const restoredSessions = data.sessions;

    const sessionsCol = collection(db, 'sessions');
    const currentSnap = await getDocs(sessionsCol);
    for (let i = 0; i < currentSnap.docs.length; i += 300) {
      const chunk = currentSnap.docs.slice(i, i + 300);
      const deleteBatch = writeBatch(db);
      chunk.forEach(d => deleteBatch.delete(d.ref));
      await deleteBatch.commit();
    }

    for (let i = 0; i < restoredSessions.length; i += 300) {
      const chunk = restoredSessions.slice(i, i + 300);
      const writeBatchInst = writeBatch(db);
      chunk.forEach(s => {
        const docRef = doc(db, 'sessions', s.id);
        writeBatchInst.set(docRef, JSON.parse(JSON.stringify(s)));
      });
      await writeBatchInst.commit();
    }

    console.log(`[RESPALDO FIRESTORE] Restauración completada exitosamente desde backups/${backupId} (${restoredSessions.length} sesiones).`);
    return restoredSessions;
  } catch (error) {
    console.error('[RESPALDO FIRESTORE] Error restaurando desde respaldo:', error);
    handleFirestoreError(error, OperationType.WRITE, 'sessions');
    throw error;
  }
}
