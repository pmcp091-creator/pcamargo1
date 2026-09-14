export const getExportFileName = (
  instName?: string | null,
  extension: 'xlsx' | 'csv' | 'pdf' = 'xlsx'
): string => {
  if (!instName || instName.trim().toLowerCase() === 'general') {
    return `Cronograma_Vocacion_Que_Transforma_Oficial.${extension}`;
  }

  // Limpiar prefijos institucionales y caracteres especiales para un nombre de archivo seguro
  const sanitized = instName
    .replace(/I\.E\.I\.R\.|I\.E\.D\.|I\.E\.|IEIR|IED|IE/gi, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // Quitar signos como #, :, etc.
    .trim()
    .replace(/[\s-]+/g, '_'); // Reemplazar espacios y guiones por guiones bajos

  return `Cronograma_Vocacion_Que_Transforma_${sanitized || 'Institucional'}.${extension}`;
};
