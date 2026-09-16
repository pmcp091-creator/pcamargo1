import { getExportFileName } from './filenameUtils';

/**
 * Motor de exportación directa a PDF utilizando html2pdf.js
 */

export const loadHtml2Pdf = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).html2pdf) {
      return resolve((window as any).html2pdf);
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve((window as any).html2pdf);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export interface GeneratePdfOptions {
  elementId?: string;
  paperFormat: 'letter' | 'legal';
  paperOrientation: 'portrait' | 'landscape';
  restrictedInstName?: string | null;
}

export const generateDirectPDF = async ({
  elementId = 'printable-official-document',
  paperFormat,
  paperOrientation,
  restrictedInstName,
}: GeneratePdfOptions): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Contenedor imprimible #${elementId} no encontrado en el DOM.`);
  }

  const html2pdf = await loadHtml2Pdf();

  // Configuración exacta de imprenta según selector (Carta u Oficio)
  const isLegal = paperFormat === 'legal';
  const pdfWidth = 215.9; // mm
  const pdfHeight = isLegal ? 330.2 : 279.4; // mm

  const opt = {
    margin: [8, 8, 8, 8], // márgenes en mm (compactos)
    filename: getExportFileName(restrictedInstName, 'pdf'),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: paperOrientation === 'landscape' ? [pdfHeight, pdfWidth] : [pdfWidth, pdfHeight], 
      orientation: paperOrientation 
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: ['tr', '.avoid-break', '.print-kpis', '.print-header']
    }
  };

  await html2pdf().set(opt).from(element).save();
};
