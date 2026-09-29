import React from 'react';

export interface PdfFooterProps {
  customLegend?: string;
  hideLegend?: boolean;
}

export const PdfFooter: React.FC<PdfFooterProps> = ({
  customLegend,
  hideLegend = false,
}) => {
  return (
    <footer 
      className="pdf-footer-root print-footer mt-auto pt-2 print:mt-auto print:pt-1 border-t border-slate-300 bg-white print:bg-white w-full print:block"
      style={{
        marginTop: 'auto',
        paddingTop: '6px',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        breakBefore: 'avoid',
        pageBreakBefore: 'avoid',
      }}
    >
      {/* Fila fija con los 5 logos de aliados alineados horizontalmente y centrados (mínimo 30px de alto cada uno) */}
      <div className="flex print:flex items-center justify-between sm:justify-around px-2 sm:px-6 py-1 print:py-0.5 gap-3 sm:gap-6 flex-nowrap w-full bg-white print:bg-white">
        <div className="flex print:flex items-center justify-center shrink-0">
          <img
            src="/logos/grupo_energia_bogota.png"
            alt="Grupo Energía Bogotá"
            className="h-[34px] min-h-[26px] print:h-[22px] print:max-h-[22px] print:min-h-0 w-auto max-w-[130px] object-contain block print:block"
            style={{ height: '34px', minHeight: '26px', opacity: 1, filter: 'none', visibility: 'visible' }}
          />
        </div>

        <div className="flex print:flex items-center justify-center shrink-0">
          <img
            src="/logos/acdi.png"
            alt="ACDI/VOCA"
            className="h-[32px] min-h-[24px] print:h-[22px] print:max-h-[22px] print:min-h-0 w-auto max-w-[120px] object-contain block print:block"
            style={{ height: '32px', minHeight: '24px', opacity: 1, filter: 'none', visibility: 'visible' }}
          />
        </div>

        <div className="flex print:flex items-center justify-center shrink-0">
          <img
            src="/logos/promigas.png"
            alt="Fundación Promigas"
            className="h-[32px] min-h-[24px] print:h-[22px] print:max-h-[22px] print:min-h-0 w-auto max-w-[120px] object-contain block print:block"
            style={{ height: '32px', minHeight: '24px', opacity: 1, filter: 'none', visibility: 'visible' }}
          />
        </div>

        <div className="flex print:flex items-center justify-center shrink-0">
          <img
            src="/logos/enlaza.png"
            alt="Enlaza"
            className="h-[32px] min-h-[24px] print:h-[22px] print:max-h-[22px] print:min-h-0 w-auto max-w-[120px] object-contain block print:block"
            style={{ height: '32px', minHeight: '24px', opacity: 1, filter: 'none', visibility: 'visible' }}
          />
        </div>

        <div className="flex print:flex items-center justify-center shrink-0">
          <img
            src="/logos/biz_nation.png"
            alt="The Biz Nation"
            className="h-[32px] min-h-[24px] print:h-[22px] print:max-h-[22px] print:min-h-0 w-auto max-w-[110px] object-contain block print:block"
            style={{ height: '32px', minHeight: '24px', opacity: 1, filter: 'none', visibility: 'visible' }}
          />
        </div>
      </div>

      {/* Pie de página Legal y Técnico */}
      {!hideLegend && (
        <div className="text-center text-[7.5px] print:text-[7px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
          <p className="font-medium tracking-tight">
            {customLegend ||
              'Documento Técnico Oficial Concertado • Alianza Grupo Energía Bogotá • ACDI/VOCA • Fundación Promigas • Enlaza • The Biz Nation • Sistema de Gestión de Formaciones La Guajira 2026.'}
          </p>
        </div>
      )}
    </footer>
  );
};

export default PdfFooter;
