import React, { useState } from 'react';
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
  MoreVertical,
  BarChart3,
  X
} from 'lucide-react';
import { BrandingSettings, InstitutionProfile } from '../types/schedule';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type ActiveTab = 'table' | 'calendar' | 'institutions' | 'validator' | 'branding' | 'requests' | 'dashboard';

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
  onResetMatrix?: () => void;
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
  onResetMatrix,
  restrictedInstName,
  institutionProfile,
  isInstitutionalKiosk = false,
  isDarkMode = false,
  onToggleDarkMode,
  firebaseSyncStatus = 'synced'
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Si está en Modo Kiosco Institucional Exclusivo
  if (isInstitutionalKiosk) {
    const displayName = institutionProfile?.name || restrictedInstName || 'Institución Educativa';
    const municipality = institutionProfile?.municipality || 'La Guajira';
    const mainCampus = institutionProfile?.campuses?.[0] || 'Sede Principal';
    const shifts = institutionProfile?.shifts?.join(' / ') || 'Jornada Mañana';

    return (
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs print:hidden transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-2.5 w-full h-13 landscape:h-11 sm:h-auto mobile-landscape-header">
            {/* Cabecera Limpia con Logo Oficial de Legado */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="flex items-center shrink-0 bg-white p-1 sm:p-2 rounded-lg sm:rounded-xl shadow-xs border border-slate-200/90 dark:border-slate-700/80">
                <img 
                  src="/logos/legado.png" 
                  alt="Legado para los Territorios" 
                  className="h-7 sm:h-20 w-auto object-contain" 
                />
              </div>

              {/* Móvil: Título condensado */}
              <div className="sm:hidden min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">
                  LEGADO
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate block">
                  {displayName}
                </span>
              </div>

              {/* Desktop: Metadatos completos */}
              <div className="hidden sm:flex flex-col min-w-0 justify-center overflow-hidden">
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

            {/* Los botones de acción en la barra superior */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Botón 1: 🖨️ Imprimir / PDF */}
              <button
                id="btn-kiosk-print"
                onClick={onPrint}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg sm:rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Abrir vista de impresión y exportar en PDF"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
                <span className="hidden xs:inline">🖨️ Imprimir</span>
              </button>

              {/* Botón 2: 📊 Descargar en Excel */}
              <button
                id="btn-kiosk-excel"
                onClick={onExportExcel || onExportCSV}
                className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-lg sm:rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Descargar cronograma oficial estructurado en Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden xs:inline">Excel</span>
              </button>

              {/* Toggle Modo Claro / Oscuro discreto */}
              {onToggleDarkMode && (
                <button
                  onClick={onToggleDarkMode}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
                  title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                  aria-label="Alternar tema"
                >
                  {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
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
      {/* 1. CABEZOTE ULTRA COMPACTO EN MÓVIL (< md) Y COMPLETO EN DESKTOP (md+) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 md:py-3">
        <div className="flex items-center justify-between gap-3 w-full h-13 landscape:h-11 md:h-auto mobile-landscape-header">
          {/* LADO IZQUIERDO: Logo compacto y Título condensado en móvil */}
          <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
            {/* Contenedor del Logo Legado */}
            <div className="flex items-center shrink-0 bg-white p-1 md:p-2 rounded-lg md:rounded-xl shadow-xs border border-slate-200/90 dark:border-slate-700/80">
              <img 
                src="/logos/legado.png" 
                alt="Legado para los Territorios" 
                className="h-7 md:h-20 w-auto object-contain" 
              />
            </div>

            {/* Móvil (< md): Título condensado "LEGADO" y oculta textos largos */}
            <div className="md:hidden flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                LEGADO
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-900/60 truncate hidden xs:inline">
                2026
              </span>
            </div>

            {/* Desktop (md+): Textos institucionales completos */}
            <div className="hidden md:flex flex-col min-w-0 justify-center overflow-hidden">
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
                    Modo Offline
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

          {/* LADO DERECHO: 
              En móvil (< md): Una sola fila alineada con Chip Admin/Coord + Menú 3 puntos (⋮).
              En desktop (md+): Barra completa de botones de acción rápida.
          */}
          
          {/* MÓVIL (< md) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* a) Botón / Chip reducido de Coordinador */}
            {sessionRole === 'admin' ? (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-950 bg-amber-400 rounded-lg shadow-xs" title="Modo Coordinador activo">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                  <span className="text-[10px]">Coord</span>
                </span>
                <button
                  id="btn-mobile-logout"
                  onClick={onLogoutAdmin}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Salir del modo coordinador"
                  aria-label="Cerrar sesión de coordinador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-mobile-coordination-access"
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition cursor-pointer"
                title="Acceso exclusivo con clave maestra para el Coordinador"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                <span className="text-[11px]">Coord</span>
              </button>
            )}

            {/* b) Menú desplegable móvil (botón de 3 puntos verticales "⋮") */}
            <button
              id="btn-mobile-tools-menu"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Herramientas y opciones"
              aria-label="Menú desplegable móvil"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* DESKTOP (md+) */}
          <div className="hidden md:flex flex-wrap items-center gap-2 shrink-0">
            {/* Toggle Modo Oscuro / Modo Claro */}
            {onToggleDarkMode && (
              <button
                id="btn-toggle-theme"
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs cursor-pointer"
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition cursor-pointer"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs transition cursor-pointer"
              title="Abrir vista de impresión y reporte oficial en PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span>🖨️ Imprimir / PDF</span>
            </button>

            {/* Export Excel (.xlsx) */}
            <button
              id="btn-export-excel"
              onClick={onExportExcel || onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition cursor-pointer"
              title="Descargar tabla oficial en Excel (.xlsx) con estilos y formato de celdas"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>📥 Descargar Excel</span>
            </button>

            {/* Backup JSON */}
            <button
              id="btn-open-backup"
              onClick={onOpenBackup}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition cursor-pointer"
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

      {/* DROPDOWN FLOTANTE MÓVIL (MENÚ DE 3 PUNTOS VERTICALES) */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-40 md:hidden animate-in fade-in duration-150"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-3 top-14 landscape:top-12 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3.5 space-y-3 md:hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Herramientas Globales
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges de Conexión en el Menú */}
            <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Internet:</span>
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Wifi className="w-3 h-3 text-emerald-500" />
                    En línea
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 animate-pulse">
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    Offline
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Base de Datos:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                  <Cloud className="w-3 h-3 text-amber-500" />
                  {firebaseSyncStatus === 'synced' ? 'Firebase' : 'Local'}
                </span>
              </div>
            </div>

            {/* Acciones principales del menú */}
            <div className="space-y-1.5">
              {/* Descargar Matriz Excel */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onExportExcel) onExportExcel();
                  else onExportCSV();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition cursor-pointer text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Descargar Matriz Excel</span>
              </button>

              {/* Imprimir Reporte General PDF */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onPrint();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer text-left"
              >
                <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <span>Imprimir Reporte General PDF</span>
              </button>

              {/* Cambiar Tema (Claro / Oscuro) */}
              {onToggleDarkMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onToggleDarkMode();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-left"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Cambiar a Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Cambiar a Modo Oscuro</span>
                    </>
                  )}
                </button>
              )}

              {/* Opción Admin: Nueva Sesión */}
              {sessionRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenNewSession();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer text-left shadow-xs"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Programar Nueva Sesión</span>
                </button>
              )}

              {/* Opción Copias de Seguridad */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenBackup();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer text-left"
              >
                <Share2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Copias de Seguridad (Backup)</span>
              </button>

              {/* Opción Instalar PWA si está disponible */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    install();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-xl transition cursor-pointer text-left"
                >
                  <HardDriveDownload className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Instalar App en este Dispositivo</span>
                </button>
              )}

              {/* Cerrar Sesión / Salir de Coordinación (o Entrar si no es admin) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {sessionRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogoutAdmin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Cerrar Sesión / Salir de Coordinación</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl transition cursor-pointer text-left shadow-xs"
                  >
                    <KeyRound className="w-4 h-4 shrink-0" />
                    <span>Acceso Clave Coordinación</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. BARRA DE PESTAÑAS TÁCTIL (Navbar / Tabs) CON SCROLL HORIZONTAL SUAVE */}
      <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 px-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <button
          id="tab-btn-table"
          onClick={() => setActiveTab('table')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'table'
              ? 'text-white bg-blue-600 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Matriz Oficial</span>
        </button>

        <button
          id="tab-btn-calendar"
          onClick={() => setActiveTab('calendar')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'calendar'
              ? 'text-white bg-blue-600 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Calendario & Días</span>
        </button>

        <button
          id="tab-btn-institutions"
          onClick={() => setActiveTab('institutions')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'institutions'
              ? 'text-white bg-blue-600 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Instituciones (12)</span>
        </button>

        <button
          id="tab-btn-validator"
          onClick={() => setActiveTab('validator')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'validator'
              ? 'text-white bg-blue-600 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Reglas Uribia</span>
          {conflictCount > 0 ? (
            <span className="ml-0.5 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {conflictCount}
            </span>
          ) : pendingCount > 0 ? (
            <span className="ml-0.5 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingCount} PDTE
            </span>
          ) : (
            <span className="ml-0.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              OK
            </span>
          )}
        </button>

        <button
          id="tab-btn-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dashboard'
              ? 'text-slate-950 bg-amber-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          id="tab-btn-branding"
          onClick={() => setActiveTab('branding')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'branding'
              ? 'text-white bg-blue-600 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Membrete</span>
        </button>

        {sessionRole === 'admin' && (
          <button
            id="tab-btn-requests"
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1 text-xs rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'requests'
                ? 'text-slate-950 bg-amber-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Solicitudes</span>
            {pendingRequestsCount > 0 && (
              <span className="ml-0.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        )}
      </nav>
    </header>
  );
};

