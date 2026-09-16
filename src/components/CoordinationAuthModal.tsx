import React, { useState } from 'react';
import { KeyRound, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface CoordinationAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (displayName?: string) => void;
  setIsCoordinator?: (val: boolean) => void;
}

export const CoordinationAuthModal: React.FC<CoordinationAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  setIsCoordinator,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanKey = passwordInput.trim().toUpperCase();

    // Verificación de clave maestra (sin exponer en UI)
    if (cleanKey === 'ADMIN2026') {
      setPasswordInput('');
      setError('');
      if (setIsCoordinator) setIsCoordinator(true);
      if (onSuccess) onSuccess();
      onClose();
      return;
    }

    setError('Acceso denegado: Credenciales no autorizadas');
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsSubmitting(true);

      const userCredential = await signInWithPopup(auth, googleProvider);
      const userEmail = userCredential.user.email?.toLowerCase() || '';

      // Regla de acceso: cuenta específica autorizada o cualquier cuenta del dominio @thebiznation.com
      const isSpecificAllowed =
        userEmail === 'pmcp091@gmail.com' ||
        userEmail === 'logistica.geb@thebiznation.com';
      const isDomainAllowed = userEmail.endsWith('@thebiznation.com');

      if (isSpecificAllowed || isDomainAllowed) {
        setPasswordInput('');
        setError('');
        if (setIsCoordinator) setIsCoordinator(true);
        if (onSuccess) onSuccess(userCredential.user.displayName || userEmail);
        onClose();
      } else {
        await signOut(auth);
        setError('Acceso denegado: Esta cuenta de Google no tiene permisos de coordinación.');
      }
    } catch (err: any) {
      console.warn('Error al iniciar sesión con Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Inicio de sesión cancelado por el usuario.');
      } else {
        setError('Acceso denegado: Credenciales no autorizadas');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPasswordInput('');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coordination-auth-title"
    >
      <div className="bg-slate-900 border border-slate-700 text-white p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Cerrar"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <KeyRound className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 id="coordination-auth-title" className="text-lg font-bold">
              Acceso de Coordinación
            </h3>
            <p className="text-xs text-slate-400">The Biz Nation • Vocación que Transforma</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Ingrese sus credenciales de Coordinación para desbloquear las funciones de edición
          (crear y modificar sesiones, validar cruces y editar sedes).
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="master-password-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Clave Maestra
            </label>
            <input
              id="master-password-input"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm font-mono placeholder:font-normal placeholder:text-slate-500"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (error) setError('');
              }}
            />
          </div>

          {error && (
            <div
              className="p-3 bg-rose-950/60 border border-rose-600/60 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs font-medium animate-in fade-in"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/2 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !passwordInput.trim()}
              className="w-1/2 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-2.5 rounded-xl transition shadow-lg text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Desbloquear</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-slate-700"></div>
            <span className="shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              o continuar con
            </span>
            <div className="grow border-t border-slate-700"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl border border-slate-600 transition shadow-xs text-xs cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isSubmitting ? 'Verificando cuenta...' : 'Acceder con Google (Coordinador)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoordinationAuthModal;
