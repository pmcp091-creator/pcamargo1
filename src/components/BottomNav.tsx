import React, { useState } from 'react';
import { 
  FileText, Calendar, Building, BarChart3, MoreHorizontal, 
  ShieldAlert, Settings, Printer, FileSpreadsheet, Share2, Sun, Moon, KeyRound, LogOut, X 
} from 'lucide-react';
import { ActiveTab } from './Navbar';

export interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  conflictCount?: number;
  isInstitutionalKiosk?: boolean;
  onPrint?: () => void;
  onExportExcel?: () => void;
  onOpenBackup?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  sessionRole?: 'admin' | 'viewer';
  onOpenAdminLogin?: () => void;
  onLogoutAdmin?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  conflictCount = 0,
  isInstitutionalKiosk = false,
  onPrint,
  onExportExcel,
  onOpenBackup,
  isDarkMode = false,
  onToggleDarkMode,
  sessionRole = 'viewer',
  onOpenAdminLogin,
  onLogoutAdmin,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  if (isInstitutionalKiosk) return null;

  return (
    <>
      {/* Barra de Navegación Inferior Fija Exclusiva para Móvil (Bottom Nav Dock) */}
      <nav 
        aria-label="Navegación móvil inferior"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b1739]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex justify-around items-center md:hidden safe-area-pb print:hidden"
      >
        <button 
          type="button"
          onClick={() => setActiveTab('table')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'table' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5"/>
          <span>Matriz</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'calendar' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5"/>
          <span>Agenda</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('institutions')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'institutions' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-5 h-5"/>
          <span>Sedes</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5"/>
          <span>Métricas</span>
        </button>

        <button 
          type="button"
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer relative ${
            activeTab === 'validator' || activeTab === 'branding' || isMoreMenuOpen
              ? 'text-amber-400 bg-amber-400/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5"/>
            {conflictCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-red-600 text-white rounded-full text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center">
                {conflictCount}
              </span>
            )}
          </div>
          <span>Más</span>
        </button>
      </nav>

      {/* Modal / Menú Desplegable "Más" en Móvil */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:hidden animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="w-full sm:max-w-sm bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom-6 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Opciones Adicionales
              </span>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {/* Opción Reglas Uribia */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('validator');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'validator'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Reglas Uribia (Validación)</span>
                </div>
                {conflictCount > 0 ? (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {conflictCount}
                  </span>
                ) : (
                  <span className="text-emerald-500 font-bold text-[10px]">OK</span>
                )}
              </button>

              {/* Opción Membrete y Parámetros */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('branding');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'branding'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Membrete y Parámetros Oficiales</span>
              </button>

              {/* Opción Imprimir / PDF */}
              {onPrint && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onPrint();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Imprimir / Reporte PDF</span>
                </button>
              )}

              {/* Opción Excel */}
              {onExportExcel && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onExportExcel();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Exportar Matriz a Excel (.xlsx)</span>
                </button>
              )}

              {/* Opción Backup */}
              {onOpenBackup && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenBackup();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Copia de Seguridad y Restauración</span>
                </button>
              )}

              {/* Opción Tema Oscuro/Claro */}
              {onToggleDarkMode && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleDarkMode();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                    <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isDarkMode ? 'Oscuro' : 'Claro'}
                  </span>
                </button>
              )}

              {/* Opción Acceso Coordinador */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {sessionRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      if (onLogoutAdmin) onLogoutAdmin();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión de Coordinación</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      if (onOpenAdminLogin) onOpenAdminLogin();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-amber-950 dark:text-amber-200 bg-amber-400/90 hover:bg-amber-400 transition cursor-pointer font-bold shadow-xs"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Ingreso Administrativo (Coordinador)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
