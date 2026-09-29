import React from 'react';
import { FileSpreadsheet, CalendarDays, BarChart3, Building2, ShieldAlert } from 'lucide-react';
import { ActiveTab } from './Header';

export interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  conflictCount: number;
  isInstitutionalKiosk?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  conflictCount,
  isInstitutionalKiosk = false
}) => {
  if (isInstitutionalKiosk) return null;

  return (
    <>
      <style>{`
        @media (max-width: 1024px) and (max-height: 550px) {
          .mobile-bottom-nav {
            display: flex !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 50 !important;
            height: 36px !important;
            padding-top: 2px !important;
            padding-bottom: 2px !important;
          }
        }
        @media (min-width: 1025px), ((min-width: 768px) and (min-height: 551px)) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
      <nav 
        aria-label="Navegación móvil inferior"
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-[#0a1128]/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center h-10 landscape:h-9 py-0.5 px-1 shadow-lg pb-[env(safe-area-inset-bottom,2px)] print:hidden"
      >
      <button
        type="button"
        onClick={() => setActiveTab('table')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 landscape:py-0 gap-0.5 text-[9px] font-medium transition cursor-pointer ${
          activeTab === 'table'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <FileSpreadsheet className="w-4 h-4 shrink-0" />
        <span>Matriz</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('calendar')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 landscape:py-0 gap-0.5 text-[9px] font-medium transition cursor-pointer ${
          activeTab === 'calendar'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <CalendarDays className="w-4 h-4 shrink-0" />
        <span>Calendario</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 landscape:py-0 gap-0.5 text-[9px] font-medium transition cursor-pointer ${
          activeTab === 'dashboard'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <BarChart3 className="w-4 h-4 shrink-0" />
        <span>Dashboard</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('institutions')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 landscape:py-0 gap-0.5 text-[9px] font-medium transition cursor-pointer ${
          activeTab === 'institutions'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Building2 className="w-4 h-4 shrink-0" />
        <span>Sedes (12)</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('validator')}
        className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 landscape:py-0 gap-0.5 text-[9px] font-medium transition relative cursor-pointer ${
          activeTab === 'validator'
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {conflictCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-red-600 text-white rounded-full text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center">
              {conflictCount}
            </span>
          )}
        </div>
        <span>Uribia</span>
      </button>
    </nav>
    </>
  );
};

export default BottomNav;
