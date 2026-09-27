import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Database, 
  Lock, 
  X, 
  Loader2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface ResetScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentSessionCount: number;
  historicalCount: number;
  futureCount: number;
  isProcessing?: boolean;
}

export const ResetScheduleModal: React.FC<ResetScheduleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentSessionCount,
  historicalCount,
  futureCount,
  isProcessing = false
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setErrorLocal(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = confirmationInput.trim() === 'RESTABLECER';

  const handleConfirmClick = async () => {
    if (!isConfirmed || isProcessing) return;
    try {
      setErrorLocal(null);
      await onConfirm();
    } catch (err: any) {
      setErrorLocal(err?.message || 'Error al ejecutar el restablecimiento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-rose-500/40 dark:border-rose-500/30 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-reset-title"
      >
        {/* Header */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-5 border-b border-rose-200 dark:border-rose-900/60 flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 id="modal-reset-title" className="text-lg font-bold text-rose-950 dark:text-rose-200 leading-tight">
              Restablecer Matriz Oficial
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-0.5">
              Confirmación de seguridad para coordinación
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 transition disabled:opacity-50"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Main session replacement count info */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-500" />
                Sesiones en Firestore:
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {currentSessionCount} sesiones
              </span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">
              Esto reemplazará {currentSessionCount} sesiones en el sistema.
            </p>
          </div>

          {/* Explicit Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 rounded-xl text-amber-950 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold leading-tight text-amber-900 dark:text-amber-200">
                Esta acción no se puede deshacer y puede afectar sesiones ya programadas.
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                El sistema aplicará los parámetros oficiales de las 12 instituciones. Por seguridad, se creará un respaldo automático en Firestore antes de escribir cualquier cambio.
              </p>
            </div>
          </div>

          {/* Historical Integrity Note */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-600 dark:text-slate-300">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Protección activa:</strong> {historicalCount} sesiones históricas (anteriores a hoy) quedarán blindadas e intactas; solo {futureCount} sesiones futuras serán sincronizadas.
            </span>
          </div>

          {/* Error display if any */}
          {errorLocal && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 rounded-xl text-xs text-rose-800 dark:text-rose-300">
              {errorLocal}
            </div>
          )}

          {/* Confirmation Input Box */}
          <div className="space-y-2 pt-1">
            <label 
              htmlFor="input-confirm-reset" 
              className="block text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Para autorizar el restablecimiento, escribe exactamente <span className="font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 font-black">RESTABLECER</span> a continuación:
            </label>
            <input
              id="input-confirm-reset"
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Escribe RESTABLECER"
              disabled={isProcessing}
              autoComplete="off"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-rose-500 dark:focus:border-rose-500 rounded-xl text-sm font-mono tracking-wider font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition"
            />
            {confirmationInput.length > 0 && !isConfirmed && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Debe coincidir exactamente en mayúsculas: RESTABLECER
              </p>
            )}
            {isConfirmed && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmación validada. Botón desbloqueado.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-reset-matrix"
            onClick={handleConfirmClick}
            disabled={!isConfirmed || isProcessing}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition flex items-center gap-2 shadow-sm ${
              isConfirmed && !isProcessing
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-rose-600/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/50 dark:border-slate-700/50'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creando Respaldo y Validando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Restablecer Matriz Oficial</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetScheduleModal;
