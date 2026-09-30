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
    <header 
      className="pdf-header-root print-header border-b-2 border-slate-900 pb-2 mb-2 print:pb-1 print:mb-1.5 print:mt-0 print:pt-0.5 bg-white print:bg-white print:block w-full max-w-full box-border overflow-hidden"
      style={{
        marginTop: 0,
        paddingTop: '2px',
        marginBottom: '6px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div className="flex print:flex items-center justify-between w-full max-w-full gap-2 sm:gap-3 box-border">
        {/* Columna Izquierda: Logo LEGADO Oficial (Mínimo 60px de alto, sin opacidad reducida, alto contraste) */}
        <div className="w-44 sm:w-52 print:w-44 shrink-0 flex print:flex items-center justify-start py-0.5">
          <img
            src="/logos/legado.png"
            alt="Legado para los Territorios"
            className="h-[60px] min-h-[56px] print:h-[58px] print:min-h-[56px] w-auto max-w-full object-contain block print:block"
            style={{
              height: '58px',
              minHeight: '56px',
              opacity: 1,
              filter: 'none',
              transform: 'none',
              visibility: 'visible',
            }}
          />
        </div>

        {/* Columna Central: Jerarquía Institucional y Metadatos de Concertación */}
        <div className="flex-1 text-center min-w-0 px-1 sm:px-2 print:block">
          <p className="text-[8px] print:text-[7.5px] font-extrabold tracking-wider uppercase text-slate-700 leading-tight truncate">
            ALIANZA: GRUPO ENERGÍA BOGOTÁ • ACDI/VOCA • FUNDACIÓN PROMIGAS • ENLAZA • THE BIZ NATION
          </p>
          <h1 className="text-xs sm:text-sm print:text-[11px] font-black text-slate-950 uppercase tracking-tight leading-snug mt-0.5">
            {programTitle}
          </h1>
          <p className="text-[10.5px] print:text-[9.5px] font-bold text-amber-700 dark:text-amber-800 leading-tight mt-0.5">
            {docTitle}
          </p>
          <div className="text-[7.5px] print:text-[7px] text-slate-600 mt-0.5 flex items-center justify-center flex-wrap gap-x-1.5 gap-y-0.5 font-medium leading-tight">
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
          <div className="w-24 sm:w-32 print:w-26 shrink-0 flex print:flex flex-col items-end justify-center text-right">
            <span className="inline-flex items-center gap-1 text-[8px] print:text-[7.5px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              Concertado 2026
            </span>
            <span className="text-[7px] text-slate-500 font-semibold mt-0.5">
              La Guajira, Colombia
            </span>
            <span className="text-[6.5px] text-slate-400 font-mono">
              Vigencia Oficial
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default PdfHeader;
