import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BrandingSettings } from '../../types/schedule';

export interface PdfHeaderProps {
  branding?: BrandingSettings;
  docTitle?: string;
  scopeLabel?: string;
  effectivePeriod?: string;
  customSubtitle?: string;
  showSeal?: boolean;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
  branding,
  docTitle = 'CRONOGRAMA OFICIAL CONCERTADO DE FORMACIONES',
  scopeLabel = '12 Instituciones Educativas (Universal)',
  effectivePeriod = 'Septiembre - Diciembre 2026',
  showSeal = true,
}) => {
  const programTitle = branding?.programTitle || 'PROGRAMA VOCACIÓN QUE TRANSFORMA';
  const coordinatorName = branding?.coordinatorName || 'Pompilio Camargo';
  const engineerName = branding?.engineerName || 'Luis Ángel Camargo';
  const todayFormatted = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="pdf-header-root print-header border-b-2 border-slate-900 pb-2 mb-2 print:pb-1 print:mb-1.5 bg-white print:bg-white print:block">
      <div className="flex print:flex items-center justify-between w-full gap-3">
        {/* Columna Izquierda: Logo LEGADO Oficial (Mínimo 60px de alto, sin opacidad reducida, alto contraste) */}
        <div className="w-52 sm:w-60 print:w-56 shrink-0 flex print:flex items-center justify-start py-0.5">
          <img
            src="/logos/legado.png"
            alt="Legado para los Territorios"
            className="h-[64px] min-h-[60px] print:h-[62px] print:min-h-[60px] w-auto object-contain block print:block"
            style={{
              height: '64px',
              minHeight: '60px',
              opacity: 1,
              filter: 'none',
              transform: 'none',
              visibility: 'visible',
            }}
          />
        </div>

        {/* Columna Central: Jerarquía Institucional y Metadatos de Concertación */}
        <div className="flex-1 text-center min-w-0 px-2 print:block">
          <p className="text-[8.5px] print:text-[8px] font-extrabold tracking-wider uppercase text-slate-700 leading-tight">
            ALIANZA: GRUPO ENERGÍA BOGOTÁ • ACDI/VOCA • FUNDACIÓN PROMIGAS • ENLAZA • THE BIZ NATION
          </p>
          <h1 className="text-xs sm:text-sm print:text-[11.5px] font-black text-slate-950 uppercase tracking-tight leading-snug mt-0.5">
            {programTitle}
          </h1>
          <p className="text-[11px] print:text-[10px] font-bold text-amber-700 dark:text-amber-800 leading-tight mt-0.5">
            {docTitle}
          </p>
          <div className="text-[8px] print:text-[7.5px] text-slate-600 mt-1 flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 font-medium leading-tight">
            <span><strong>Alcance:</strong> {scopeLabel}</span>
            <span className="text-slate-400">•</span>
            <span><strong>Periodo:</strong> {effectivePeriod}</span>
            <span className="text-slate-400">•</span>
            <span><strong>Emisión:</strong> {todayFormatted}</span>
            <span className="text-slate-400">•</span>
            <span><strong>Coord:</strong> {coordinatorName}</span>
            <span className="text-slate-400">•</span>
            <span><strong>Ing:</strong> {engineerName}</span>
          </div>
        </div>

        {/* Columna Derecha: Sello Oficial de Concertación Técnica */}
        {showSeal && (
          <div className="w-28 sm:w-36 print:w-32 shrink-0 flex print:flex flex-col items-end justify-center text-right">
            <span className="inline-flex items-center gap-1 text-[8.5px] print:text-[8px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Concertado 2026
            </span>
            <span className="text-[7.5px] text-slate-500 font-semibold mt-0.5">
              La Guajira, Colombia
            </span>
            <span className="text-[7px] text-slate-400 font-mono">
              Vigencia Oficial
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default PdfHeader;
