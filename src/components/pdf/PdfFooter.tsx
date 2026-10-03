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
      className="pdf-footer-root print-footer print-footer-fixed flex flex-col justify-center items-center w-full bg-white border-t border-slate-300 pt-1.5 pb-1 box-border"
    >
      {/* Nivel 1: Logos de aliados distribuidos de extremo a extremo cubriendo el ancho disponible */}
      <div className="w-full flex items-center justify-between px-3 print-logos-row">
        <img
          src="/logos/grupo_energia_bogota.png"
          alt="Grupo Energía Bogotá"
          className="print-partner-logo h-5 max-h-[20px] w-auto object-contain block shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <img
          src="/logos/acdi.png"
          alt="ACDI/VOCA"
          className="print-partner-logo h-5 max-h-[20px] w-auto object-contain block shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <img
          src="/logos/promigas.png"
          alt="Fundación Promigas"
          className="print-partner-logo h-5 max-h-[20px] w-auto object-contain block shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <img
          src="/logos/enlaza.png"
          alt="Enlaza"
          className="print-partner-logo h-5 max-h-[20px] w-auto object-contain block shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <img
          src="/logos/biz_nation.png"
          alt="The Biz Nation"
          className="print-partner-logo h-5 max-h-[20px] w-auto object-contain block shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      {/* Nivel 2: Texto legal y técnico centrado debajo de los logos */}
      {!hideLegend && (
        <div className="w-full text-center mt-1">
          <span className="text-[7.5px] leading-tight text-slate-500 font-medium block">
            {customLegend ||
              'Documento Técnico Oficial Concertado • Alianza Grupo Energía Bogotá • ACDI/VOCA • Fundación Promigas • Enlaza • The Biz Nation • Sistema de Gestión de Formaciones La Guajira 2026.'}
          </span>
        </div>
      )}
    </footer>
  );
};

export default PdfFooter;
