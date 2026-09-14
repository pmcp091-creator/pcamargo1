import ExcelJS from 'exceljs';
import { TrainingSession, InstitutionProfile } from '../types/schedule';
import { getExportFileName } from './filenameUtils';

export async function exportToExcelFile(
  sessions: TrainingSession[],
  institutions?: InstitutionProfile[],
  restrictedInstName?: string | null
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Vocación que Transforma';
  workbook.created = new Date();

  // Hoja 1: Cronograma Principal (o Cronograma de la Sede)
  const sheetName = restrictedInstName ? 'Cronograma Sede' : 'Cronograma Oficial';
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: 1 }] // Congelar encabezados
  });

  sheet.columns = [
    { header: 'Ítem (#)', key: 'itemNumber', width: 10 },
    { header: 'Municipio', key: 'municipality', width: 16 },
    { header: 'Institución Educativa', key: 'institution', width: 36 },
    { header: 'Sede Específica', key: 'campus', width: 24 },
    { header: 'Jornada Académica', key: 'academicShift', width: 20 },
    { header: 'Audiencia', key: 'targetAudience', width: 18 },
    { header: 'Tipo de Formación', key: 'trainingType', width: 32 },
    { header: 'Modalidad', key: 'modality', width: 15 },
    { header: 'Estado', key: 'status', width: 16 },
    { header: 'Días de la Semana', key: 'daysOfWeek', width: 22 },
    { header: 'Fecha Específica', key: 'specificDate', width: 18 },
    { header: 'Fechas del Ciclo (Sept-Nov)', key: 'datesScheduled', width: 34 },
    { header: 'Horario', key: 'scheduleHours', width: 16 },
    { header: 'Duración (Horas)', key: 'durationHours', width: 18 },
    { header: 'Observaciones y Condiciones Técnicas', key: 'observations', width: 45 }
  ];

  // Estilo elegante de encabezados (Fondo azul marino oscuro #0F172A, texto blanco y negrita)
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
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
      top: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FFF59E0B' } }, // Borde inferior ámbar
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Agregar filas con formato de celda específico
  sessions.forEach((s, idx) => {
    const itemNo = s.itemNumber || idx + 1;
    const muni = s.municipality || 'Uribia';
    const inst = s.institution || '';
    const campus = s.campus || 'Sede Principal';
    const shift = s.academicShift || 'Mañana';
    const audience = Array.isArray(s.targetAudience) ? s.targetAudience.join(', ') : (s.targetAudience || 'Estudiantes');
    const trainingType = s.trainingType || '';
    const modality = s.modality || 'Presencial';
    const statusText = s.status === 'APROBADO' ? 'Concertado' : 'Por Concertar';
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

    // Observaciones
    const obsParts: string[] = [];
    if (s.observations) obsParts.push(s.observations);
    if (s.infrastructureNotes) obsParts.push(`[Técnico: ${s.infrastructureNotes}]`);
    const observations = obsParts.join(' ');

    // Convertir specificDate a fecha si es válida
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
      targetAudience: audience,
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

    // Zebra striping para facilitar lectura
    const isEven = idx % 2 === 0;
    const bgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Blanco vs Slate-50

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

      // Columna 1: Ítem (#) - Numérico centrado
      if (colNumber === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.numFmt = '#,##0';
      }

      // Columna 9: Estado - Badge visual de texto
      if (colNumber === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (statusText === 'Concertado') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } }; // Verde
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
        } else {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB45309' } }; // Ámbar
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
        }
      }

      // Columna 11: Fecha Específica - Formato Date nativo
      if (colNumber === 11) {
        if (cell.value instanceof Date) {
          cell.numFmt = 'yyyy-mm-dd';
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }

      // Columna 13: Horario centrado
      if (colNumber === 13) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Columna 14: Duración (Horas) - Numérico con formato decimal/entero
      if (colNumber === 14) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '0.0 "h"';
      }
    });
  });

  // Fila de Totales con fórmula Excel
  const totalRowNumber = sessions.length + 2;
  const totalRow = sheet.addRow({
    itemNumber: '',
    municipality: '',
    institution: 'TOTAL GENERAL DE HORAS FORMACIÓN',
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
    durationHours: { formula: `SUM(N2:N${totalRowNumber - 1})` },
    observations: `${sessions.length} sesiones registradas en La Guajira`
  });

  totalRow.height = 26;
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Ámbar suave
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFF59E0B' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } }
    };
    if (colNumber === 14) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '#,##0.0 "h"';
    }
  });

  // Activar autofiltro para toda la tabla
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: sessions.length + 1, column: 15 }
  };

  // Hoja 2: Directorio de Instituciones y Condiciones Técnicas
  const filteredInstitutions = institutions && institutions.length > 0
    ? (restrictedInstName
        ? institutions.filter(i => 
            i.name.toLowerCase().includes(restrictedInstName.toLowerCase()) || 
            restrictedInstName.toLowerCase().includes(i.name.toLowerCase()) ||
            (i.daneCode && i.daneCode === restrictedInstName)
          )
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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Azul rey
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
  const excelFilename = getExportFileName(restrictedInstName, 'xlsx');
  link.setAttribute('download', excelFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
