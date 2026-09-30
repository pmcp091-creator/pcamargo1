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
  const isMulti = className.includes('print-multi-page') || className.includes('print-weekly');

  return (
    <div
      id={id || 'printable-agenda'}
      className={`pdf-layout-root print-sheet bg-white text-slate-900 w-full min-w-0 max-w-[1280px] mx-auto p-2 sm:p-5 print:p-0 print:m-0 print:max-w-none print:min-w-0 print:w-full box-border ${
        isMulti
          ? 'print-multi-page print:block print:h-auto print:min-h-0'
          : 'print-single-page print:flex print:flex-col print:justify-between print:h-full print:min-h-full'
      } ${className}`}
      style={
        isMulti
          ? { boxSizing: 'border-box', width: '100%', maxWidth: '100%' }
          : {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '100%',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '100%',
            }
      }
    >
      {showHeader && <PdfHeader {...headerProps} />}
      <div className="flex-1 w-full print-content-body flex flex-col grow">
        {children}
      </div>
      {showFooter && <PdfFooter {...footerProps} />}
    </div>
  );
};

export default PdfLayout;
