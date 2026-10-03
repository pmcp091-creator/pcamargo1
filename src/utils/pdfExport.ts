/**
 * Módulo de Exportación e Impresión Oficial a PDF.
 * 
 * Se elimina completamente html2pdf.js y html2canvas:
 * El único estándar confiable en navegadores para repetir thead y tfoot (o position: fixed)
 * en cada una de las páginas sin recortar filas es la API nativa de impresión `window.print()`.
 */

export interface GeneratePdfOptions {
  elementId?: string;
  paperFormat?: 'letter' | 'legal';
  paperOrientation?: 'portrait' | 'landscape';
  restrictedInstName?: string | null;
}

/**
 * Función de compatibilidad: redirige cualquier intento de exportación a window.print()
 */
export const generateDirectPDF = async (_options?: GeneratePdfOptions): Promise<void> => {
  window.print();
};

export const printDocument = (): void => {
  window.print();
};
