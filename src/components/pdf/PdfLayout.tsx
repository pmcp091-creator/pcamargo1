import React from 'react';
import { PdfHeader, PdfHeaderProps } from './PdfHeader';
import { PdfFooter, PdfFooterProps } from './PdfFooter';

export interface PdfLayoutProps {
  id?: string;
  headerProps?: PdfHeaderProps;
  footerProps?: PdfFooterProps;
  showHeader?: boolean;
  showFooter?: boolean;
  children: React.ReactNode;
  className?: string;
  repeatOnEveryPage?: boolean;
}

/**
 * PdfLayout: Componente envolvente global para TODOS los documentos imprimibles y descargables en PDF.
 * Garantiza:
 * 1. Logo LEGADO grande (>= 60px) en encabezado con contraste óptimo.
 * 2. Pie de página unificado con los 5 aliados institucionales (>= 30px cada uno) alineados horizontalmente.
 * 3. Repetición estructural en páginas impresas mediante display: table-header-group / table-footer-group.
 */
export const PdfLayout: React.FC<PdfLayoutProps> = ({
  id = 'printable-agenda',
  headerProps,
  footerProps,
  showHeader = true,
  showFooter = true,
  children,
  className = '',
}) => {
  return (
    <div
      id={id || 'printable-agenda'}
      className={`pdf-layout-root print-sheet bg-white text-slate-900 w-full min-w-[760px] md:min-w-0 max-w-[1280px] mx-auto p-4 sm:p-6 print:p-0 print:m-0 print:max-w-none print:min-w-0 print:w-full flex flex-col justify-between min-h-[calc(100vh-12mm)] print:min-h-[calc(100vh-12mm)] print:h-auto print:max-h-full box-border ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {showHeader && <PdfHeader {...headerProps} />}
      <div className="flex-1 w-full print-content-body flex flex-col">
        {children}
      </div>
      {showFooter && <PdfFooter {...footerProps} />}
    </div>
  );
};

export default PdfLayout;
