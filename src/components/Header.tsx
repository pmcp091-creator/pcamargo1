import React, { useState, useEffect } from 'react';
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
  Cloud,
  Menu,
  X,
  BarChart3,
  RefreshCw,
  Check
} from 'lucide-react';
import { BrandingSettings, InstitutionProfile } from '../types/schedule';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BottomNav } from './BottomNav';

export type ActiveTab = 'table' | 'calendar' | 'institutions' | 'validator' | 'branding' | 'requests' | 'dashboard';

export interface HeaderProps {
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
  onResetMatrix?: () => void;
  restrictedInstName?: string | null;
  institutionProfile?: InstitutionProfile | null;
  isInstitutionalKiosk?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  firebaseSyncStatus?: 'synced' | 'connecting' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
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
  onResetMatrix,
  restrictedInstName,
  institutionProfile,
  isInstitutionalKiosk = false,
  isDarkMode = false,
  onToggleDarkMode,
  firebaseSyncStatus = 'synced'
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close drawer on Escape or window resize to desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: branding.programTitle || 'Cronograma Vocación que Transforma',
      text: 'Cronograma Oficial de Formaciones Territoriales La Guajira 2026',
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setIsDrawerOpen(false);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Error al compartir:', err);
        }
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setIsDrawerOpen(false);
      onOpenBackup();
    }
  };

  // =========================================================================
  // MODO KIOSCO INSTITUCIONAL EXCLUSIVO
  // =========================================================================
  if (isInstitutionalKiosk) {
    const displayName = institutionProfile?.name || restrictedInstName || 'Institución Educativa';
    const municipality = institutionProfile?.municipality || 'La Guajira';
    const mainCampus = institutionProfile?.campuses?.[0] || 'Sede Principal';
    const shifts = institutionProfile?.shifts?.join(' / ') || 'Jornada Mañana';

    return (
      <header className="app-main-header fixed top-0 left-0 right-0 z-50 bg-[#0a1128]/95 backdrop-blur-md border-b border-slate-800 md:sticky md:top-0 print:hidden transition-colors">
        {/* Cabecera Móvil Kiosco */}
        <div className="md:hidden mobile-compact-bar h-14 landscape:h-11 max-h-14 landscape:max-h-11 px-3 landscape:px-2 py-1 landscape:py-0.5 flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img 
              src="/logos/legado.png" 
              alt="Legado" 
              className="h-7 w-auto object-contain block shrink-0" 
            />
            <span className="text-sm font-bold tracking-tight text-white truncate">
              LEGADO <span className="text-amber-400 font-semibold">• {displayName}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onPrint}
              className="w-9 h-9 landscape:w-8 landscape:h-8 flex items-center justify-center bg-slate-800 text-slate-200 rounded-lg border border-slate-700 transition active:scale-95 cursor-pointer"
              title="🖨️ Imprimir / PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onExportExcel || onExportCSV}
              className="w-9 h-9 landscape:w-8 landscape:h-8 flex items-center justify-center bg-emerald-950/60 text-emerald-300 rounded-lg border border-emerald-800 transition active:scale-95 cursor-pointer"
              title="📊 Descargar Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </button>
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="w-9 h-9 landscape:w-8 landscape:h-8 flex items-center justify-center bg-slate-800 text-amber-400 rounded-lg border border-slate-700 transition active:scale-95 cursor-pointer"
                title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Cabecera Desktop Kiosco */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex items-center shrink-0 bg-white p-2 rounded-xl shadow-xs border border-slate-200/90 dark:border-slate-700/80">
                <img 
                  src="/logos/legado.png" 
                  alt="Legado para los Territorios" 
                  className="h-16 sm:h-20 md:h-22 w-auto object-contain" 
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

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                id="btn-kiosk-print"
                onClick={onPrint}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Abrir vista de impresión y exportar en PDF"
              >
                <Printer className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>🖨️ Imprimir / PDF</span>
              </button>

              <button
                id="btn-kiosk-excel"
                onClick={onExportExcel || onExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Descargar cronograma oficial estructurado en Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>📊 Descargar en Excel</span>
              </button>

              {onToggleDarkMode && (
                <button
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer ml-1"
                  title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
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

  // =========================================================================
  // MODO ESTÁNDAR GENERAL (HEADER RESPONSIVO)
  // =========================================================================
  return (
    <>
      <header className="app-main-header fixed top-0 left-0 right-0 z-50 bg-[#0a1128]/95 backdrop-blur-md border-b border-slate-800 md:sticky md:top-0 print:hidden transition-colors">
        {/* ----------------------------------------------------------------- */}
        {/* 1. CABECERA MÓVIL ULTRA COMPACTA (block md:hidden)               */}
        {/*    h-14 (56px) en vertical y h-11 en horizontal (landscape)       */}
        {/* ----------------------------------------------------------------- */}
        <div className="md:hidden mobile-compact-bar h-14 landscape:h-11 max-h-14 landscape:max-h-11 px-3 landscape:px-2 py-1 landscape:py-0.5 flex items-center justify-between gap-2 w-full">
          {/* Lado izquierdo: Logo oficial compacto (h-7 w-auto) y texto "LEGADO" en negrita */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img 
              src="/logos/legado.png" 
              alt="Legado" 
              className="h-7 w-auto object-contain block shrink-0" 
            />
            <span className="text-sm font-bold tracking-tight text-white truncate">
              LEGADO
            </span>
          </div>

          {/* Lado derecho: Rol ("Admin" o escudo/llave) + Botón Menú hamburguesa (☰ / ⋮) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 1. Icono o pastilla compacta de rol */}
            {sessionRole === 'admin' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-400 border border-amber-500 rounded-lg shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </span>
            ) : (
              <button
                id="btn-mobile-coordination-access"
                onClick={onOpenAdminLogin}
                className="w-9 h-9 landscape:w-8 landscape:h-8 flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                title="Acceso Coordinación"
                aria-label="Acceso Coordinación"
              >
                <KeyRound className="w-4 h-4 text-amber-950" />
              </button>
            )}

            {/* 2. Botón menú hamburguesa ("☰" / "⋮") para Drawer lateral */}
            <button
              id="btn-mobile-drawer-toggle"
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 landscape:w-8 landscape:h-8 flex items-center justify-center bg-slate-800 text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-700 active:scale-95 transition cursor-pointer"
              title="Menú de opciones"
              aria-label="Menú principal"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 2. CABECERA DESKTOP COMPLETA (hidden md:block)                    */}
        {/*    Mantiene layout original con pastillas, logos de aliados y     */}
        {/*    botones completos sin alteraciones                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="desktop-full-bar hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
            {/* Logo Legado Ampliado y Textos Institucionales */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center shrink-0 bg-white p-2 rounded-xl shadow-xs border border-slate-200/90 dark:border-slate-700/80">
                <img 
                  src="/logos/legado.png" 
                  alt="Legado para los Territorios" 
                  className="h-16 sm:h-20 md:h-22 w-auto object-contain" 
                />
              </div>

              <div className="flex flex-col min-w-0 justify-center overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60 truncate">
                    {branding.organizationName || 'THE BIZ NATION'}
                  </span>
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

            {/* Botones de Acción Desktop */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onToggleDarkMode && (
                <button
                  id="btn-toggle-theme"
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs cursor-pointer"
                  title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {isInstallable && (
                <button
                  id="btn-pwa-install"
                  onClick={install}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition cursor-pointer"
                  title="Instalar como app en tu computadora o celular para usar siempre sin internet"
                >
                  <HardDriveDownload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Instalar App</span>
                </button>
              )}

              <button
                id="btn-print-schedule"
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs transition cursor-pointer"
                title="Abrir vista de impresión y reporte oficial en PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>🖨️ Imprimir / PDF</span>
              </button>

              <button
                id="btn-export-excel"
                onClick={onExportExcel || onExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition cursor-pointer"
                title="Descargar tabla oficial en Excel (.xlsx) con estilos y formato de celdas"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>📥 Descargar Excel</span>
              </button>

              <button
                id="btn-open-backup"
                onClick={onOpenBackup}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition cursor-pointer"
                title="Copia de seguridad y restaurar"
              >
                <Share2 className="w-4 h-4" />
              </button>

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
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 rounded-lg transition cursor-pointer"
                    title="Salir del modo coordinador (volver a vista pública)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id="btn-add-new-session"
                    onClick={onOpenNewSession}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Nueva Sesión</span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-coordination-access"
                  onClick={onOpenAdminLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 border border-amber-500/40 rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
                  title="Acceso exclusivo con clave maestra para el Coordinador"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-950" />
                  <span>Acceso Coordinación</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación Superiores (Desktop: visibles, Móvil: usa Bottom Nav) */}
        <nav 
          aria-label="Pestañas de navegación escritorio"
          className="hidden md:flex overflow-x-auto whitespace-nowrap scrollbar-none no-scrollbar gap-1 px-4 sm:px-6 lg:px-8 pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          <button
            id="tab-btn-table"
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'table'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Matriz Oficial</span>
          </button>

          <button
            id="tab-btn-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendario & Días</span>
          </button>

          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            id="tab-btn-institutions"
            onClick={() => setActiveTab('institutions')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'institutions'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Instituciones (12)</span>
          </button>

          <button
            id="tab-btn-validator"
            onClick={() => setActiveTab('validator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'validator'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Reglas Uribia</span>
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
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'branding'
                ? 'text-blue-700 dark:text-blue-400 border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Config. Membrete</span>
          </button>

          {sessionRole === 'admin' && (
            <button
              id="tab-btn-requests"
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-lg transition border-b-2 cursor-pointer ${
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
        </nav>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* 3. BARRA DE NAVEGACIÓN INFERIOR FIJA EN MÓVIL (BOTTOM NAVIGATION) */}
      {/*    Siempre visible en móvil portrait y landscape                  */}
      {/* ----------------------------------------------------------------- */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conflictCount={conflictCount}
        isInstitutionalKiosk={isInstitutionalKiosk}
      />

      {/* ----------------------------------------------------------------- */}
      {/* 4. DRAWER LATERAL / MODAL MÓVIL                                   */}
      {/*    Acciones secundarias: Excel, PDF, Restablecer Matriz, Tema, etc */}
      {/* ----------------------------------------------------------------- */}
      {isDrawerOpen && (
        <div className="md:hidden">
          {/* Backdrop con desenfoque suave */}
          <div 
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-2xs animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Panel Lateral Deslizante */}
          <div 
            id="mobile-side-drawer"
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0a1128] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col p-4 text-slate-800 dark:text-slate-100 animate-in slide-in-from-right duration-200"
          >
            {/* Cabecera del Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <img src="/logos/legado.png" alt="Legado" className="h-6 w-auto object-contain" />
                <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                  Menú y Acciones
                </span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Acciones Secundarias */}
            <div className="flex-1 overflow-y-auto py-3 space-y-1.5 text-xs">
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Documentos y Datos
              </p>

              {/* 1. Descargar Excel */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  (onExportExcel || onExportCSV)();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/40 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>📊 Descargar Excel (.xlsx)</span>
              </button>

              {/* 2. Imprimir / PDF */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onPrint();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400 shrink-0" />
                <span>🖨️ Imprimir / PDF</span>
              </button>

              {/* 3. Restablecer Matriz Oficial */}
              {onResetMatrix && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onResetMatrix();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300/80 dark:border-amber-800/40 transition cursor-pointer"
                >
                  <RefreshCw className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>🔄 Restablecer Matriz Oficial</span>
                </button>
              )}

              {/* 4. Compartir */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                  <span>{copiedLink ? '¡Enlace copiado!' : '🔗 Compartir'}</span>
                </div>
                {copiedLink && <Check className="w-4 h-4 text-emerald-500" />}
              </button>

              {/* 5. Cambiar Tema (Claro / Oscuro) */}
              {onToggleDarkMode && (
                <button
                  onClick={onToggleDarkMode}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400 shrink-0" /> : <Moon className="w-4.5 h-4.5 text-slate-600 shrink-0" />}
                    <span>{isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
                  </span>
                </button>
              )}

              {/* 6. Copia de Seguridad */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenBackup();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Settings className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                <span>💾 Respaldo y Restauración</span>
              </button>

              {/* 7. Instalar App PWA */}
              {isInstallable && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    install();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900 transition cursor-pointer"
                >
                  <HardDriveDownload className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                  <span>📥 Instalar App (PWA)</span>
                </button>
              )}

              {/* Sección de Estado de Red y Base de Datos */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 px-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Estado del Sistema
                </p>

                <div className="flex items-center gap-2.5 text-[11px]">
                  {isOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Conexión: En línea (Internet activo)
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        Conexión: Modo Offline (Sin señal)
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-[11px]">
                  <Cloud className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {firebaseSyncStatus === 'synced'
                      ? 'Base de datos: Firebase Conectado'
                      : firebaseSyncStatus === 'connecting'
                      ? 'Base de datos: Sincronizando...'
                      : 'Base de datos: Almacenamiento Local'}
                  </span>
                </div>
              </div>

              {/* Botón Cerrar Sesión si es Admin */}
              {sessionRole === 'admin' && (
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onLogoutAdmin();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión de Coordinador</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
