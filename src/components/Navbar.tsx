import React from 'react';
import { 
  Printer, 
  Plus, 
  FileSpreadsheet, 
  CalendarDays, 
  Building2, 
  ShieldAlert, 
  Settings, 
  Wifi, 
  WifiOff, 
  HardDriveDownload,
  Share2,
  KeyRound,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Inbox,
  Cloud
} from 'lucide-react';
import { BrandingSettings, InstitutionProfile } from '../types/schedule';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type ActiveTab = 'table' | 'calendar' | 'institutions' | 'validator' | 'branding' | 'requests';

interface NavbarProps {
  branding: BrandingSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOnline: boolean;
  onOpenNewSession: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onExportExcel?: () => void;
  onExportHTML: () => void;
  onOpenBackup: () => void;
  onOpenGuide: () => void;
  conflictCount: number;
  pendingCount: number;
  pendingRequestsCount?: number;
  sessionRole: 'admin' | 'viewer';
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  restrictedInstName?: string | null;
  institutionProfile?: InstitutionProfile | null;
  isInstitutionalKiosk?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  firebaseSyncStatus?: 'synced' | 'connecting' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({
  branding,
  activeTab,
  setActiveTab,
  isOnline,
  onOpenNewSession,
  onPrint,
  onExportCSV,
  onExportExcel,
  onExportHTML,
  onOpenBackup,
  onOpenGuide,
  conflictCount,
  pendingCount,
  pendingRequestsCount = 0,
  sessionRole,
  onOpenAdminLogin,
  onLogoutAdmin,
  restrictedInstName,
  institutionProfile,
  isInstitutionalKiosk = false,
  isDarkMode = false,
  onToggleDarkMode,
  firebaseSyncStatus = 'synced'
}) => {
  const { isInstallable, install } = usePWAInstall();

  // Si está en Modo Kiosco Institucional Exclusivo
  if (isInstitutionalKiosk) {
    const displayName = institutionProfile?.name || restrictedInstName || 'Institución Educativa';
    const municipality = institutionProfile?.municipality || 'La Guajira';
    const mainCampus = institutionProfile?.campuses?.[0] || 'Sede Principal';
    const shifts = institutionProfile?.shifts?.join(' / ') || 'Jornada Mañana';

    return (
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs print:hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            {/* Cabecera Limpia con Logo Oficial de Legado */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex items-center shrink-0">
                <img 
                  src="/logos/legado.png" 
                  alt="Legado para los Territorios" 
                  className="h-10 md:h-12 w-auto object-contain" 
                />
              </div>

              <div className="flex flex-col min-w-0 justify-center overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60 truncate">
                    {branding.organizationName || 'THE BIZ NATION'}
                  </span>
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <Wifi className="w-3 h-3 text-emerald-500" />
                      En línea
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shrink-0">
                      <WifiOff className="w-3 h-3 text-amber-600" />
                      Offline
                    </span>
                  )}
                </div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate leading-tight mt-0.5">
                  Cronograma Oficial de Formaciones: <span className="text-amber-600 dark:text-amber-400">{displayName}</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Municipio: <strong>{municipality}</strong> • Sede: <strong>{mainCampus}</strong> • Jornada: <strong>{shifts}</strong>
                  {institutionProfile?.daneCode && ` • DANE: ${institutionProfile.daneCode}`}
                </p>
              </div>
            </div>

            {/* Los ÚNICOS DOS botones de acción en la barra superior */}
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
              {/* Botón 1: 🖨️ Imprimir / PDF */}
              <button
                id="btn-kiosk-print"
                onClick={onPrint}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Abrir vista de impresión y exportar en PDF"
              >
                <Printer className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>🖨️ Imprimir / PDF</span>
              </button>

              {/* Botón 2: 📊 Descargar en Excel */}
              <button
                id="btn-kiosk-excel"
                onClick={onExportExcel || onExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Descargar cronograma oficial estructurado en Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>📊 Descargar en Excel</span>
              </button>

              {/* Toggle Modo Claro / Oscuro discreto */}
              {onToggleDarkMode && (
                <button
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer ml-1"
                  title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                  aria-label="Alternar tema"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs print:hidden transition-colors">
      {/* Top Bar with Logos, Titles, Offline status and actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          {/* Logo Legado, Titles con contenedor aislado */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Contenedor estricto para Logo Legado */}
            <div className="flex items-center shrink-0">
              <img 
                src="/logos/legado.png" 
                alt="Legado para los Territorios" 
                className="h-10 md:h-12 w-auto object-contain" 
              />
            </div>

            {/* Contenedor estricto para Textos */}
            <div className="flex flex-col min-w-0 justify-center overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60 truncate">
                  {branding.organizationName || 'THE BIZ NATION'}
                </span>
                {/* Offline Status Badge */}
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                    <Wifi className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    En línea
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 animate-pulse shrink-0">
                    <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Modo Offline (Sin señal)
                  </span>
                )}
                {/* Firebase Cloud Sync Badge */}
                <span 
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    firebaseSyncStatus === 'synced'
                      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                      : firebaseSyncStatus === 'connecting'
                      ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 animate-pulse'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Sincronización en la nube con Google Firebase Firestore"
                >
                  <Cloud className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{firebaseSyncStatus === 'synced' ? 'Firebase Conectado' : firebaseSyncStatus === 'connecting' ? 'Conectando...' : 'Firebase Local'}</span>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate leading-tight mt-0.5">
                {branding.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA'}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {branding.programSubtitle} • Coord. {branding.coordinatorName}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Toggle Modo Oscuro / Modo Claro */}
            {onToggleDarkMode && (
              <button
                id="btn-toggle-theme"
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs"
                title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                aria-label="Alternar tema"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* PWA Install Button if available */}
            {isInstallable && (
              <button
                id="btn-pwa-install"
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition"
                title="Instalar como app en tu computadora o celular para usar siempre sin internet"
              >
                <HardDriveDownload className="w-3.5 h-3.5 text-blue-400" />
                <span>Instalar App</span>
              </button>
            )}

            {/* Print button */}
            <button
              id="btn-print-schedule"
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs transition"
              title="Abrir vista de impresión y reporte oficial en PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>🖨️ Imprimir / PDF</span>
            </button>

            {/* Export Excel (.xlsx) */}
            <button
              id="btn-export-excel"
              onClick={onExportExcel || onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition"
              title="Descargar tabla oficial en Excel (.xlsx) con estilos y formato de celdas"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>📥 Descargar Excel</span>
            </button>

            {/* Backup JSON */}
            <button
              id="btn-open-backup"
              onClick={onOpenBackup}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition"
              title="Copia de seguridad y restaurar"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Acceso Coordinador vs Modo Administrador */}
            {sessionRole === 'admin' ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 border border-amber-500 rounded-lg shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modo Coordinador</span>
                  <span className="sm:hidden">Admin</span>
                </span>
                <button
                  id="btn-logout-admin"
                  onClick={onLogoutAdmin}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 rounded-lg transition"
                  title="Salir del modo coordinador (volver a vista pública)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
                <button
                  id="btn-add-new-session"
                  onClick={onOpenNewSession}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nueva Sesión</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-coordination-access"
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 border border-amber-500/40 rounded-lg shadow-xs transition active:scale-95"
                title="Acceso exclusivo con clave maestra para el Coordinador"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-950" />
                <span>Acceso Coordinación</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
          <button
            id="tab-btn-table"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 ${
              activeTab === 'table'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Matriz Oficial (Excel)</span>
          </button>

          <button
            id="tab-btn-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 ${
              activeTab === 'calendar'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendario & Días</span>
          </button>

          <button
            id="tab-btn-institutions"
            onClick={() => setActiveTab('institutions')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 ${
              activeTab === 'institutions'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Instituciones & Logística (12)</span>
          </button>

          <button
            id="tab-btn-validator"
            onClick={() => setActiveTab('validator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 ${
              activeTab === 'validator'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Reglas Uribia & Cruces</span>
            {conflictCount > 0 ? (
              <span className="ml-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {conflictCount}
              </span>
            ) : pendingCount > 0 ? (
              <span className="ml-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount} PDTE
              </span>
            ) : (
              <span className="ml-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                OK
              </span>
            )}
          </button>

          <button
            id="tab-btn-branding"
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 ${
              activeTab === 'branding'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configuración de Membrete</span>
          </button>

          {sessionRole === 'admin' && (
            <button
              id="tab-btn-requests"
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 ${
                activeTab === 'requests'
                  ? 'text-amber-700 dark:text-amber-400 border-amber-500 bg-amber-50/70 dark:bg-amber-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>📬 Solicitudes ({pendingRequestsCount})</span>
              {pendingRequestsCount > 0 && (
                <span className="ml-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
