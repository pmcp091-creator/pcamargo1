import React, { useState, useRef, useEffect } from 'react';
import { TrainingSession, InstitutionProfile, BrandingSettings, BackupSnapshot } from '../types/schedule';
import { 
  exportBackupJSON, 
  exportToExcel,
  exportToCSV, 
  exportToHTML, 
  loadAutoSnapshots, 
  saveAutoSnapshot,
  getEmergencyUndoSnapshot,
  setEmergencyUndoSnapshot
} from '../utils/storage';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  FileSpreadsheet, 
  HardDrive, 
  Check, 
  FileCode,
  History,
  ShieldCheck,
  Clock,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TrainingSession[];
  institutions: InstitutionProfile[];
  branding: BrandingSettings;
  onRestoreData: (data: {
    sessions?: TrainingSession[];
    institutions?: InstitutionProfile[];
    branding?: BrandingSettings;
  }) => void;
  onResetAll: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  sessions,
  institutions,
  branding,
  onRestoreData,
  onResetAll
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'options' | 'history'>('options');
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [emergencySnapshot, setEmergencySnapshot] = useState<BackupSnapshot | null>(null);
  const [justSavedMessage, setJustSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSnapshots(loadAutoSnapshots());
      setEmergencySnapshot(getEmergencyUndoSnapshot());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateManualSnapshot = () => {
    const snap = saveAutoSnapshot(
      sessions,
      institutions,
      branding,
      'Punto de restauración manual guardado por el usuario'
    );
    setSnapshots(loadAutoSnapshots());
    setJustSavedMessage('¡Punto de restauración guardado con éxito!');
    setTimeout(() => setJustSavedMessage(null), 3000);
  };

  const handleRestoreSnapshot = (snap: BackupSnapshot) => {
    if (confirm(`¿Restaurar la versión del ${snap.readableDate} (${snap.sessionCount} sesiones)? Reemplazará los datos actuales.`)) {
      // Create a safety snapshot of current state just in case
      saveAutoSnapshot(sessions, institutions, branding, 'Punto previo a restaurar versión anterior');
      onRestoreData(snap.data);
      alert(`¡Versión restaurada con éxito! (${snap.sessionCount} sesiones cargadas)`);
      onClose();
    }
  };

  const handleUndoEmergency = () => {
    if (!emergencySnapshot) return;
    if (confirm(`¿Deshacer el restablecimiento y recuperar tus ${emergencySnapshot.sessionCount} sesiones previas?`)) {
      onRestoreData(emergencySnapshot.data);
      setEmergencyUndoSnapshot(null);
      setEmergencySnapshot(null);
      alert('¡Tus sesiones anteriores han sido recuperadas por completo!');
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && (parsed.sessions || parsed.institutions)) {
          // Save current state first
          saveAutoSnapshot(sessions, institutions, branding, 'Punto previo a importar archivo JSON');
          onRestoreData(parsed);
          alert('¡Copia de seguridad restaurada con éxito!');
          onClose();
        } else {
          alert('El archivo no contiene un formato de cronograma válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">Copias de Seguridad y Protección</h3>
              <p className="text-[11px] text-slate-400">Protección automática contra pérdidas y restaurador de versiones</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('options')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'options'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargas y Archivos</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Puntos de Restauración ({snapshots.length})</span>
          </button>
        </div>

        {/* Emergency Undo Banner if exists */}
        {emergencySnapshot && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Copia previa a restablecer disponible: </span>
                <span>{emergencySnapshot.readableDate} ({emergencySnapshot.sessionCount} sesiones).</span>
              </div>
            </div>
            <button
              onClick={handleUndoEmergency}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition shrink-0"
            >
              Deshacer Restablecimiento
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'options' ? (
            <div className="space-y-3">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Guardado continuo activado:</strong> Cada cambio que haces en el cronograma se almacena de inmediato en la memoria segura del navegador. Si por accidente presionas «Restablecer», el sistema guarda automáticamente una copia de respaldo previa para que puedas deshacerlo.
                </div>
              </div>

              <div className="space-y-2">
                {/* Export HTML */}
                <button
                  id="modal-btn-export-html"
                  onClick={() => exportToHTML(sessions, branding)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-300 bg-amber-50/40 hover:bg-amber-50 transition text-left shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 text-slate-950 font-black rounded-lg">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-950">Descargar Reporte HTML Offline (.html)</div>
                      <div className="text-[11px] text-amber-900">Abre en cualquier computador o celular sin internet con buscador y filtros</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-amber-600" />
                </button>

                {/* Export Excel (.xlsx) */}
                <button
                  id="modal-btn-export-excel"
                  onClick={() => exportToExcel(sessions, institutions)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition text-left shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 text-white font-black rounded-lg">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Descargar Hoja de Cálculo Oficial (.xlsx)</div>
                      <div className="text-[11px] text-emerald-800">Formato Excel nativo con estilos en encabezados, celdas de fecha y fórmulas de duración</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-600" />
                </button>

                {/* Export JSON */}
                <button
                  id="modal-btn-export-json"
                  onClick={() => exportBackupJSON(sessions, institutions, branding)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Descargar Archivo de Copia Total (JSON)</div>
                      <div className="text-[11px] text-slate-500">Archivo de respaldo completo para transferir a otro equipo</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>

                {/* Restore JSON */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  id="modal-btn-restore-json"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Restaurar desde Archivo JSON</div>
                      <div className="text-[11px] text-slate-500">Cargar una copia de seguridad descargada previamente</div>
                    </div>
                  </div>
                  <Upload className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Manual snapshot trigger */}
              <div className="pt-2">
                <button
                  onClick={handleCreateManualSnapshot}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 text-xs font-bold transition"
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <span>Guardar Punto de Restauración Ahora ({sessions.length} sesiones actuales)</span>
                </button>
                {justSavedMessage && (
                  <p className="text-[11px] text-emerald-600 font-bold text-center mt-1 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{justSavedMessage}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* History of auto snapshots tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Puntos de restauración automáticos guardados en tu navegador:
                </p>
                <button
                  onClick={handleCreateManualSnapshot}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Guardar ahora</span>
                </button>
              </div>

              {snapshots.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 rounded-xl bg-slate-50">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>Aún no hay puntos de restauración adicionales registrados.</p>
                  <button
                    onClick={handleCreateManualSnapshot}
                    className="mt-2 text-xs text-blue-600 font-bold hover:underline"
                  >
                    Crear el primer punto ahora
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {snapshots.map(snap => (
                    <div
                      key={snap.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{snap.readableDate}</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                            {snap.sessionCount} sesiones
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                          {snap.reason}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="px-2.5 py-1.5 bg-white hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 text-xs font-bold rounded-lg shadow-2xs transition shrink-0 flex items-center gap-1"
                        title="Restaurar esta versión exacta"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Safe Reset */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (confirm('¿Restablecer al estado inicial de la matriz oficial (38 sesiones concertadas)?\n\n¡Seguridad garantizada: se creará automáticamente una copia de seguridad previa en el historial para que puedas deshacerlo si fue un accidente!')) {
                onResetAll();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-bold transition"
            title="Vuelve a cargar la matriz oficial de 38 sesiones concertadas guardando una copia previa"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Matriz Inicial</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

