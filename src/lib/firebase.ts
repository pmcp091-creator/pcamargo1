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

// Restablecer todas las sesiones en Firestore
export async function resetFirestoreSessions(defaultSessions: TrainingSession[]): Promise<void> {
  try {
    // 1. Obtener todas las existentes
    const sessionsCol = collection(db, 'sessions');
    const snapshot = await getDocs(sessionsCol);
    
    // 2. Eliminar en lotes
    let deleteBatch = writeBatch(db);
    let count = 0;
    for (const docSnap of snapshot.docs) {
      deleteBatch.delete(docSnap.ref);
      count++;
      if (count % 400 === 0) {
        await deleteBatch.commit();
        deleteBatch = writeBatch(db);
      }
    }
    if (count % 400 !== 0) {
      await deleteBatch.commit();
    }

    // 3. Escribir las por defecto
    const batchSize = 400;
    for (let i = 0; i < defaultSessions.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = defaultSessions.slice(i, i + batchSize);
      chunk.forEach(s => {
        const docRef = doc(db, 'sessions', s.id);
        batch.set(docRef, JSON.parse(JSON.stringify(s)));
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'sessions');
  }
}
