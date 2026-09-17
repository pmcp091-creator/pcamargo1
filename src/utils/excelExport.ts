import ExcelJS from 'exceljs';
import { TrainingSession, InstitutionProfile, BrandingSettings } from '../types/schedule';
import { getExportFileName } from './filenameUtils';
import { getExportSessionStatus } from './scheduleStatusHelper';

/**
 * Carga un logo desde una ruta estática y lo devuelve en formato Base64 para ExcelJS
 */
async function loadLogoBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1] || null;
        resolve(base64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`No se pudo cargar imagen para Excel desde ${url}:`, err);
    return null;
  }
}

export interface ExcelExportConfig {
  sessions: TrainingSession[];
  institutions?: InstitutionProfile[];
  branding?: BrandingSettings;
  restrictedInstName?: string | null;
  selectedInstitutions?: string[];
}

export async function exportToExcelFile(
  sessionsOrConfig: TrainingSession[] | ExcelExportConfig,
  legacyInstitutions?: InstitutionProfile[],
  legacyRestrictedInstName?: string | null,
  legacyBranding?: BrandingSettings
): Promise<void> {
  let sessions: TrainingSession[];
  let institutions: InstitutionProfile[] | undefined;
  let restrictedInstName: string | null | undefined;
  let branding: BrandingSettings | undefined;
  let selectedInstitutions: string[] | undefined;

  if (Array.isArray(sessionsOrConfig)) {
    sessions = sessionsOrConfig;
    institutions = legacyInstitutions;
    restrictedInstName = legacyRestrictedInstName;
    branding = legacyBranding;
  } else {
    sessions = sessionsOrConfig.sessions;
    institutions = sessionsOrConfig.institutions;
    restrictedInstName = sessionsOrConfig.restrictedInstName;
    branding = sessionsOrConfig.branding;
    selectedInstitutions = sessionsOrConfig.selectedInstitutions;
  }

  // Filtrado de sesiones según instituciones seleccionadas
  let exportSessions = [...sessions];
  if (restrictedInstName) {
    exportSessions = exportSessions.filter(s =>
      s.institution.toLowerCase().includes(restrictedInstName.toLowerCase()) ||
      restrictedInstName.toLowerCase().includes(s.institution.toLowerCase())
    );
  } else if (selectedInstitutions && selectedInstitutions.length > 0) {
    exportSessions = exportSessions.filter(s => selectedInstitutions.includes(s.institution));
  }

  // Cargar logos de membrete oficial
  const [
    legadoLogoBase64,
    gebLogoBase64,
    acdiLogoBase64,
    promigasLogoBase64,
    enlazaLogoBase64,
    bizNationLogoBase64
  ] = await Promise.all([
    loadLogoBase64('/logos/legado.png'),
    loadLogoBase64('/logos/grupo_energia_bogota.png'),
    loadLogoBase64('/logos/acdi.png'),
    loadLogoBase64('/logos/promigas.png'),
    loadLogoBase64('/logos/enlaza.png'),
    loadLogoBase64('/logos/biz_nation.png')
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = branding?.organizationName || 'The Biz Nation - Legado para los Territorios';
  workbook.created = new Date();

  const isSingleInst = restrictedInstName || (selectedInstitutions && selectedInstitutions.length === 1);
  const mainSheetTitle = isSingleInst 
    ? `Cronograma ${(restrictedInstName || selectedInstitutions?.[0] || 'Sede').slice(0, 20)}` 
    : 'Matriz Oficial Cronograma';

  const sheet = workbook.addWorksheet(mainSheetTitle, {
    views: [{ state: 'frozen', ySplit: 6 }] // Congelar encabezado y membrete superior
  });

  // Configurar columnas con anchos profesionales
  sheet.columns = [
    { header: 'Ítem (#)', key: 'itemNumber', width: 9 },
    { header: 'Municipio', key: 'municipality', width: 15 },
    { header: 'Institución Educativa', key: 'institution', width: 34 },
    { header: 'Sede Específica', key: 'campus', width: 24 },
    { header: 'Jornada Académica', key: 'academicShift', width: 22 },
    { header: 'Audiencia / Grado', key: 'targetAudience', width: 28 },
    { header: 'Tipo de Formación', key: 'trainingType', width: 30 },
    { header: 'Modalidad', key: 'modality', width: 14 },
    { header: 'Estado', key: 'status', width: 18 },
    { header: 'Días de la Semana', key: 'daysOfWeek', width: 22 },
    { header: 'Fecha Específica', key: 'specificDate', width: 16 },
    { header: 'Fechas del Ciclo (Sept-Nov)', key: 'datesScheduled', width: 32 },
    { header: 'Horario', key: 'scheduleHours', width: 17 },
    { header: 'Duración (Horas)', key: 'durationHours', width: 17 },
    { header: 'Observaciones y Condiciones Técnicas', key: 'observations', width: 48 }
  ];

  // =========================================================================
  // MEMBRETE OFICIAL SUPERIOR (FILAS 1 A 5)
  // Alianza oficial y encabezado institucional
  // =========================================================================
  sheet.spliceRows(1, 0, [], [], [], [], []);

  // Fila 1: "PROGRAMA VOCACIÓN QUE TRANSFORMA" (Negrita, centrado)
  sheet.mergeCells('A1:O1');
  const titleRow1 = sheet.getCell('A1');
  titleRow1.value = 'PROGRAMA VOCACIÓN QUE TRANSFORMA';
  titleRow1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } };
  titleRow1.alignment = { vertical: 'middle', horizontal: 'center' };

  // Fila 2: "ALIANZA: GRUPO ENERGÍA BOGOTÁ • ACDI/VOCA • FUNDACIÓN PROMIGAS • ENLAZA • THE BIZ NATION"
  sheet.mergeCells('A2:O2');
  const titleRow2 = sheet.getCell('A2');
  titleRow2.value = 'ALIANZA: GRUPO ENERGÍA BOGOTÁ • ACDI/VOCA • FUNDACIÓN PROMIGAS • ENLAZA • THE BIZ NATION';
  titleRow2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF2563EB' } };
  titleRow2.alignment = { vertical: 'middle', horizontal: 'center' };

  // Fila 3: CRONOGRAMA GENERAL DE FORMACIONES - LA GUAJIRA (EMISIÓN: ${new Date().toLocaleDateString()})
  sheet.mergeCells('A3:O3');
  const titleRow3 = sheet.getCell('A3');
  titleRow3.value = `CRONOGRAMA GENERAL DE FORMACIONES - LA GUAJIRA (EMISIÓN: ${new Date().toLocaleDateString('es-CO')})`;
  titleRow3.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF334155' } };
  titleRow3.alignment = { vertical: 'middle', horizontal: 'center' };

  // Fila 4: Alcance dinámico
  sheet.mergeCells('A4:O4');
  const titleRow4 = sheet.getCell('A4');
  const hasInstFilter = isSingleInst && (restrictedInstName || (selectedInstitutions && selectedInstitutions.length > 0));
  const activeInstName = restrictedInstName || selectedInstitutions?.[0] || '';
  const firstMunicipality = exportSessions[0]?.municipality || '';
  const dynamicScopeText = hasInstFilter
    ? `Alcance: ${activeInstName} (${firstMunicipality}) - Total: ${exportSessions.length} sesiones`
    : `Alcance: Todas las Instituciones (12 Sedes Territoriales) - Total: ${exportSessions.length} sesiones`;
  titleRow4.value = dynamicScopeText;
  titleRow4.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  titleRow4.alignment = { vertical: 'middle', horizontal: 'center' };

  // Fila 5: [Fila en blanco de separación]
  // Dejamos la fila 5 vacía sin combinar o con formato neutral
  sheet.getRow(5).height = 12;

  // Fondo y alturas del encabezado institucional
  sheet.getRow(1).height = 24;
  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 20;
  sheet.getRow(4).height = 20;

  for (let r = 1; r <= 4; r++) {
    sheet.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' } // Fondo suave Slate 50
      };
    });
  }

  // =========================================================================
  // ENCABEZADOS DE LA TABLA DE DATOS (FILA 6)
  // =========================================================================
  const headerRow = sheet.getRow(6);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' } // Slate 900
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FFF59E0B' } }, // Borde inferior ámbar
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // =========================================================================
  // FILAS DE DATOS DE FORMACIÓN
  // =========================================================================
  exportSessions.forEach((s, idx) => {
    const itemNo = idx + 1;
    const muni = s.municipality || 'Uribia';
    const inst = s.institution || '';
    const campus = s.campus || 'Sede Principal';
    const shift = s.academicShift || 'Mañana';
    const audience = Array.isArray(s.targetAudience) ? s.targetAudience.join(', ') : (s.targetAudience || 'Estudiantes');
    const trainingType = s.trainingType || '';
    const modality = s.modality || 'Presencial';

    // Estado concertado según directriz:
    // El Pájaro y Mega Colegio Docentes = "POR CONCERTAR"
    // Todas las demás = "APROBADO"
    const finalStatus = s.status || getExportSessionStatus(s);
    const statusText = finalStatus;

    const days = (s.daysOfWeek || []).join(', ');

    // Fechas consolidadas
    const datesArr: string[] = [];
    if (s.datesScheduled?.september && s.datesScheduled.september.length > 0) {
      datesArr.push(`Sept: ${s.datesScheduled.september.join(', ')}`);
    }
    if (s.datesScheduled?.october && s.datesScheduled.october.length > 0) {
      datesArr.push(`Oct: ${s.datesScheduled.october.join(', ')}`);
    }
    if (s.datesScheduled?.november && s.datesScheduled.november.length > 0) {
      datesArr.push(`Nov: ${s.datesScheduled.november.join(', ')}`);
    }
    const datesSummary = datesArr.length > 0 ? datesArr.join(' | ') : (s.frequency || 'Según calendario');

    // Horario y Duración
    const scheduleHours = (s.startTime && s.endTime) ? `${s.startTime} - ${s.endTime}` : (s.startTime || 'Por definir');
    const durationNum = typeof s.durationHours === 'number' ? s.durationHours : Number(s.durationHours) || 0;

    // Observaciones y Notas técnicas
    const obsParts: string[] = [];
    if (s.observations) obsParts.push(s.observations);
    if (s.infrastructureNotes) obsParts.push(`[Técnico: ${s.infrastructureNotes}]`);
    const observations = obsParts.join(' ');

    let parsedDate: Date | string = '';
    if (s.specificDate) {
      const parts = s.specificDate.split('-');
      if (parts.length === 3) {
        parsedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        parsedDate = s.specificDate;
      }
    }

    const row = sheet.addRow({
      itemNumber: itemNo,
      municipality: muni,
      institution: inst,
      campus: campus,
      academicShift: shift,
      targetAudience: s.gradeOrCycle ? `${audience} (${s.gradeOrCycle})` : audience,
      trainingType: trainingType,
      modality: modality,
      status: statusText,
      daysOfWeek: days,
      specificDate: parsedDate,
      datesScheduled: datesSummary,
      scheduleHours: scheduleHours,
      durationHours: durationNum,
      observations: observations
    });

    row.height = 22;

    const isEven = idx % 2 === 0;
    const bgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor }
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      cell.font = {
        name: 'Calibri',
        size: 10,
        color: { argb: 'FF1E293B' }
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left'
      };

      // Columna 1: Ítem (#)
      if (colNumber === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '#,##0';
      }

      // Columna 9: Estado
      if (colNumber === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (statusText === 'APROBADO') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Verde esmeralda suave
        } else if (statusText === 'Programada') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }; // Azul suave
        } else {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF92400E' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Ámbar suave
        }
      }

      // Columna 11: Fecha Específica
      if (colNumber === 11) {
        if (cell.value instanceof Date) {
          cell.numFmt = 'yyyy-mm-dd';
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }

      // Columna 13: Horario
      if (colNumber === 13) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Columna 14: Duración (Horas)
      if (colNumber === 14) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '0.0 "h"';
      }
    });
  });

  // =========================================================================
  // FILA DE TOTALES
  // =========================================================================
  const dataStartRow = 7;
  const dataEndRow = dataStartRow + exportSessions.length - 1;
  const totalRowNumber = dataEndRow + 1;

  const totalRow = sheet.addRow({
    itemNumber: '',
    municipality: '',
    institution: 'TOTAL GENERAL DE HORAS FORMACIÓN CONCERTADAS',
    campus: '',
    academicShift: '',
    targetAudience: '',
    trainingType: '',
    modality: '',
    status: '',
    daysOfWeek: '',
    specificDate: '',
    datesScheduled: '',
    scheduleHours: '',
    durationHours: { formula: `SUM(N${dataStartRow}:N${dataEndRow})` },
    observations: `${exportSessions.length} registros oficiales procesados`
  });

  totalRow.height = 26;
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFF59E0B' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } }
    };
    if (colNumber === 14) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '#,##0.0 "h"';
    }
  });

  // Habilitar autofiltro en la tabla de datos
  sheet.autoFilter = {
    from: { row: 6, column: 1 },
    to: { row: totalRowNumber, column: 15 }
  };

  // =========================================================================
  // BLOQUE DE FIRMAS OFICIALES (DEBAJO DE LA TABLA)
  // =========================================================================
  const sigStartRow = totalRowNumber + 3;
  sheet.getRow(sigStartRow).height = 25;
  sheet.getRow(sigStartRow + 1).height = 20;
  sheet.getRow(sigStartRow + 2).height = 18;

  sheet.mergeCells(`B${sigStartRow}:F${sigStartRow}`);
  const sigCoordLine = sheet.getCell(`B${sigStartRow}`);
  sigCoordLine.value = '____________________________________________________';
  sigCoordLine.alignment = { horizontal: 'center' };

  sheet.mergeCells(`B${sigStartRow + 1}:F${sigStartRow + 1}`);
  const sigCoordName = sheet.getCell(`B${sigStartRow + 1}`);
  sigCoordName.value = branding?.coordinatorName || 'Pompilio Camargo';
  sigCoordName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  sigCoordName.alignment = { horizontal: 'center' };

  sheet.mergeCells(`B${sigStartRow + 2}:F${sigStartRow + 2}`);
  const sigCoordRole = sheet.getCell(`B${sigStartRow + 2}`);
  sigCoordRole.value = `${branding?.coordinatorRole || 'Coordinador del Programa'} • ${branding?.organizationName || 'The Biz Nation'}`;
  sigCoordRole.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
  sigCoordRole.alignment = { horizontal: 'center' };

  sheet.mergeCells(`I${sigStartRow}:N${sigStartRow}`);
  const sigRectorLine = sheet.getCell(`I${sigStartRow}`);
  sigRectorLine.value = '____________________________________________________';
  sigRectorLine.alignment = { horizontal: 'center' };

  sheet.mergeCells(`I${sigStartRow + 1}:N${sigStartRow + 1}`);
  const sigRectorName = sheet.getCell(`I${sigStartRow + 1}`);
  sigRectorName.value = isSingleInst ? 'Rector / Coordinador Académico' : 'Directivos / Rectores Institucionales';
  sigRectorName.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  sigRectorName.alignment = { horizontal: 'center' };

  sheet.mergeCells(`I${sigStartRow + 2}:N${sigStartRow + 2}`);
  const sigRectorRole = sheet.getCell(`I${sigStartRow + 2}`);
  sigRectorRole.value = isSingleInst 
    ? `${restrictedInstName || selectedInstitutions?.[0]} • Concertación y Aprobación`
    : 'Validación Oficial de Sedes Educativas Concertadas';
  sigRectorRole.font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };
  sigRectorRole.alignment = { horizontal: 'center' };

  // =========================================================================
  // PIE DE PÁGINA CON LOS 5 LOGOS RESTANTES (FILAS sigStartRow + 5 EN ADELANTE)
  // =========================================================================
  const footerRowLabel = sigStartRow + 5;
  sheet.mergeCells(`A${footerRowLabel}:O${footerRowLabel}`);
  const footerTitleCell = sheet.getCell(`A${footerRowLabel}`);
  footerTitleCell.value = 'ALIADOS ESTRATÉGICOS OFICIALES (PIE DE PÁGINA OFICIAL)';
  footerTitleCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF475569' } };
  footerTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  footerTitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }
  };
  sheet.getRow(footerRowLabel).height = 20;

  // Fila para albergar los 5 logos aliados
  const footerLogoRow = footerRowLabel + 1;
  sheet.getRow(footerLogoRow).height = 55;
  sheet.getRow(footerLogoRow + 1).height = 18;

  // Insertar los 5 logos restantes distribuidos horizontalmente
  const partnerLogos = [
    { base64: gebLogoBase64, col: 1, name: 'Grupo Energía Bogotá', span: 'B-D' },
    { base64: acdiLogoBase64, col: 4, name: 'ACDI/VOCA LA', span: 'E-G' },
    { base64: promigasLogoBase64, col: 7, name: 'Fundación Promigas', span: 'H-J' },
    { base64: enlazaLogoBase64, col: 10, name: 'Enlaza', span: 'K-L' },
    { base64: bizNationLogoBase64, col: 13, name: 'The Biz Nation', span: 'M-O' }
  ];

  partnerLogos.forEach((p, pIdx) => {
    if (p.base64) {
      try {
        const imgId = workbook.addImage({
          base64: p.base64,
          extension: 'png'
        });
        sheet.addImage(imgId, {
          tl: { col: p.col - 0.2, row: footerLogoRow - 1 + 0.1 },
          ext: { width: 110, height: 42 }
        });
      } catch (e) {
        console.warn(`Error incrustando logo aliado ${p.name} en Excel:`, e);
      }
    }
  });

  // =========================================================================
  // HOJA 2: DIRECTORIO DE INSTITUCIONES Y CONDICIONES TÉCNICAS
  // =========================================================================
  const filteredInstitutions = institutions && institutions.length > 0
    ? (restrictedInstName
        ? institutions.filter(i => 
            i.name.toLowerCase().includes(restrictedInstName.toLowerCase()) || 
            restrictedInstName.toLowerCase().includes(i.name.toLowerCase()) ||
            (i.daneCode && i.daneCode === restrictedInstName)
          )
        : (selectedInstitutions && selectedInstitutions.length > 0)
          ? institutions.filter(i => selectedInstitutions.includes(i.name))
          : institutions)
    : [];

  if (filteredInstitutions.length > 0) {
    const instSheet = workbook.addWorksheet('Sedes y Condiciones Técnicas', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    instSheet.columns = [
      { header: 'Municipio', key: 'municipality', width: 16 },
      { header: 'Código DANE', key: 'daneCode', width: 18 },
      { header: 'Institución Educativa', key: 'name', width: 38 },
      { header: 'Sedes', key: 'campuses', width: 28 },
      { header: 'Jornadas', key: 'shifts', width: 26 },
      { header: 'Energía Eléctrica', key: 'hasPower', width: 20 },
      { header: 'Conectividad Internet', key: 'hasInternet', width: 22 },
      { header: 'Pantalla / Proyector', key: 'hasScreens', width: 20 },
      { header: 'Equipos Digitales', key: 'hasComputers', width: 20 },
      { header: 'Capacidad Aulas', key: 'capacity', width: 18 },
      { header: 'Condiciones de Acceso y Logística', key: 'generalConditions', width: 45 }
    ];

    const instHeaderRow = instSheet.getRow(1);
    instHeaderRow.height = 28;
    instHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF1E40AF' } },
        bottom: { style: 'medium', color: { argb: 'FF3B82F6' } }
      };
    });

    filteredInstitutions.forEach((inst, idx) => {
      const infra = inst.infrastructure || {
        hasPower: true,
        hasInternet: false,
        hasScreensOrProjectors: false,
        hasComputersOrTablets: false,
        capacity: '30 personas',
        generalConditions: ''
      };

      const powerStatus = !infra.hasPower ? 'Sin Energía (Cargar Equipos)' : (infra.hasSolarPanels ? 'Paneles Solares' : 'Red Eléctrica');
      const netStatus = infra.hasInternet ? 'Internet Operativo' : 'Sin Internet / Limitado';
      const screenStatus = infra.hasScreensOrProjectors ? 'Pantalla/TV Disponible' : 'Sin Proyección';
      const compStatus = infra.hasComputersOrTablets ? 'Sala de Cómputo Disponible' : 'Sin Equipos';

      const row = instSheet.addRow({
        municipality: inst.municipality,
        daneCode: inst.daneCode || '',
        name: inst.name,
        campuses: (inst.campuses || []).join(', '),
        shifts: (inst.shifts || []).join(', '),
        hasPower: powerStatus,
        hasInternet: netStatus,
        hasScreens: screenStatus,
        hasComputers: compStatus,
        capacity: infra.capacity || '30-40 personas',
        generalConditions: infra.generalConditions || ''
      });

      row.height = 20;
      const isEven = idx % 2 === 0;
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    instSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: filteredInstitutions.length + 1, column: 11 }
    };
  }

  // Generar buffer y descargar archivo XLSX
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);

  const customScope = isSingleInst 
    ? (restrictedInstName || selectedInstitutions?.[0]) 
    : (selectedInstitutions && selectedInstitutions.length > 0 ? `${selectedInstitutions.length}_Instituciones` : null);

  const excelFilename = getExportFileName(customScope, 'xlsx');
  link.setAttribute('download', excelFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
