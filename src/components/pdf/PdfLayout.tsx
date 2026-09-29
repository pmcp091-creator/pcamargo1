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
  id = 'printable-official-document',
  headerProps,
  footerProps,
  showHeader = true,
  showFooter = true,
  children,
  className = '',
  repeatOnEveryPage = true,
}) => {
  return (
    <div
      id={id}
      className={`pdf-layout-root bg-white text-slate-900 w-full max-w-[1280px] mx-auto p-4 sm:p-6 print:p-0 print:m-0 print:max-w-none ${className}`}
    >
      {repeatOnEveryPage ? (
        <table className="w-full border-collapse border-0 print-layout-table">
          {showHeader && (
            <thead className="print-layout-thead print:table-header-group">
              <tr>
                <td className="p-0 border-0">
                  <PdfHeader {...headerProps} />
                </td>
              </tr>
            </thead>
          )}

          <tbody className="print-layout-tbody">
            <tr>
              <td className="p-0 border-0">
                {children}
              </td>
            </tr>
          </tbody>

          {showFooter && (
            <tfoot className="print-layout-tfoot print:table-footer-group">
              <tr>
                <td className="p-0 border-0">
                  <PdfFooter {...footerProps} />
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      ) : (
        <div className="pdf-layout-standard flex flex-col w-full min-h-full">
          {showHeader && <PdfHeader {...headerProps} />}
          <div className="flex-1 w-full">{children}</div>
          {showFooter && <PdfFooter {...footerProps} />}
        </div>
      )}
    </div>
  );
};

export default PdfLayout;
