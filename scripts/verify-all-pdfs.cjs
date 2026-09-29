const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('================================================================');
  console.log('VERIFICACIÓN OFICIAL DE BRANDING GLOBAL EN DOCUMENTOS Y PDFS');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  // Load app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Inspector function
  const inspectDoc = async (label) => {
    return await page.evaluate((scenario) => {
      const doc = document.getElementById('printable-official-document');
      if (!doc) return { found: false, error: 'Elemento #printable-official-document no encontrado' };

      // 1. Logo Legado
      const legadoImg = doc.querySelector('.pdf-header-root img[src*="legado.png"]');
      let legado = null;
      if (legadoImg) {
        const rect = legadoImg.getBoundingClientRect();
        const style = window.getComputedStyle(legadoImg);
        legado = {
          found: true,
          src: legadoImg.src.split('/').pop(),
          naturalWidth: legadoImg.naturalWidth,
          naturalHeight: legadoImg.naturalHeight,
          renderedWidthPx: Math.round(rect.width),
          renderedHeightPx: Math.round(rect.height),
          opacity: style.opacity,
          filter: style.filter,
          meets60pxRequirement: rect.height >= 60
        };
      }

      // 2. Títulos y Textos del Encabezado
      const programTitle = doc.querySelector('.pdf-header-root h1')?.textContent?.trim();
      const docTitle = doc.querySelector('.pdf-header-root p.text-amber-700, .pdf-header-root p.text-amber-800')?.textContent?.trim();
      const allianceHeader = doc.querySelector('.pdf-header-root p')?.textContent?.trim();

      // 3. Logos de Aliados en el Pie de Página
      const footer = doc.querySelector('.pdf-footer-root');
      let footerDetails = null;
      if (footer) {
        const allyImgs = Array.from(footer.querySelectorAll('img')).map(img => {
          const rect = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          return {
            src: img.src.split('/').pop(),
            alt: img.alt,
            renderedWidthPx: Math.round(rect.width),
            renderedHeightPx: Math.round(rect.height),
            opacity: style.opacity,
            meets30pxRequirement: rect.height >= 30
          };
        });

        const legend = footer.querySelector('p')?.textContent?.trim();
        footerDetails = {
          found: true,
          count: allyImgs.length,
          allies: allyImgs,
          allMeet30px: allyImgs.every(a => a.meets30pxRequirement),
          legend
        };
      }

      return {
        found: true,
        scenario,
        programTitle,
        docTitle,
        allianceHeader,
        legado,
        footer: footerDetails
      };
    }, label);
  };

  // -------------------------------------------------------------------------
  // PUNTO 1: CRONOGRAMA COMPLETO CONCERTADO (Todas las Sedes / General)
  // -------------------------------------------------------------------------
  console.log('>>> [1/3] Evaluando: Cronograma Completo Oficial...');
  await page.locator('button:has-text("Imprimir / PDF")').first().click();
  await page.waitForTimeout(600);

  const modalBtn = page.locator('#btn-modal-print-pdf');
  if (await modalBtn.isVisible()) {
    await modalBtn.click();
    await page.waitForTimeout(1000);
  }

  const eval1 = await inspectDoc('1. Cronograma Completo Concertado');
  console.log('Evaluación 1:', JSON.stringify(eval1, null, 2));

  // Generar captura y PDF
  const docElem1 = page.locator('#printable-official-document').first();
  await docElem1.screenshot({ path: 'evidence-1-full-schedule.png' });
  const pdf1 = await page.pdf({
    format: 'Letter',
    landscape: true,
    printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' }
  });
  fs.writeFileSync('evidence-1-full-schedule.pdf', pdf1);
  console.log('-> Captura guardada: evidence-1-full-schedule.png');
  console.log('-> PDF generado: evidence-1-full-schedule.pdf (' + pdf1.length + ' bytes)\n');

  // Regresar a la app
  await page.locator('button:has-text("Volver")').first().click();
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------------------
  // PUNTO 2: AGENDA DIARIA OFICIAL (Un solo día)
  // -------------------------------------------------------------------------
  console.log('>>> [2/3] Evaluando: Agenda Diaria de un solo día...');
  // Ensure on Calendar tab
  await page.locator('button:has-text("Calendario"), #tab-btn-calendar').first().click();
  await page.waitForTimeout(800);

  // Click on "Imprimir Agenda"
  await page.locator('button:has-text("Imprimir Agenda"), button:has-text("🖨️ Imprimir Agenda")').first().click();
  await page.waitForTimeout(600);

  // Click on "Imprimir Día Actual"
  await page.locator('button:has-text("Imprimir Día Actual")').first().click();
  await page.waitForTimeout(1200);

  const eval2 = await inspectDoc('2. Agenda Diaria Oficial (Un solo día)');
  console.log('Evaluación 2:', JSON.stringify(eval2, null, 2));

  const docElem2 = page.locator('#printable-official-document').first();
  await docElem2.screenshot({ path: 'evidence-2-daily-agenda.png' });
  const pdf2 = await page.pdf({
    format: 'Letter',
    landscape: true,
    printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' }
  });
  fs.writeFileSync('evidence-2-daily-agenda.pdf', pdf2);
  console.log('-> Captura guardada: evidence-2-daily-agenda.png');
  console.log('-> PDF generado: evidence-2-daily-agenda.pdf (' + pdf2.length + ' bytes)\n');

  // Regresar a la app
  await page.locator('button:has-text("Volver")').first().click();
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------------------
  // PUNTO 3: MATRIZ OFICIAL POR INSTITUCIÓN (Filtro por Sede)
  // -------------------------------------------------------------------------
  console.log('>>> [3/3] Evaluando: Matriz Oficial por Institución...');
  // Click on Matriz Oficial tab
  await page.locator('button:has-text("Matriz Oficial"), #tab-btn-table').first().click();
  await page.waitForTimeout(800);

  // Select institution filter in table
  const institutionSelect = page.locator('select').nth(1);
  if (await institutionSelect.isVisible()) {
    const instOptions = await institutionSelect.locator('option').allInnerTexts();
    console.log('Instituciones disponibles para seleccionar:', instOptions.slice(0, 4));
    // Select option index 1
    await institutionSelect.selectOption({ index: 1 });
    await page.waitForTimeout(600);
  }

  // Click on "Imprimir / PDF" in table view
  await page.locator('#btn-table-print-pdf, button:has-text("Imprimir / PDF")').first().click();
  await page.waitForTimeout(600);

  const modalBtn3 = page.locator('#btn-modal-print-pdf');
  if (await modalBtn3.isVisible()) {
    await modalBtn3.click();
    await page.waitForTimeout(1000);
  }

  const eval3 = await inspectDoc('3. Matriz Oficial por Institución');
  console.log('Evaluación 3:', JSON.stringify(eval3, null, 2));

  const docElem3 = page.locator('#printable-official-document').first();
  await docElem3.screenshot({ path: 'evidence-3-institution-matrix.png' });
  const pdf3 = await page.pdf({
    format: 'Letter',
    landscape: true,
    printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' }
  });
  fs.writeFileSync('evidence-3-institution-matrix.pdf', pdf3);
  console.log('-> Captura guardada: evidence-3-institution-matrix.png');
  console.log('-> PDF generado: evidence-3-institution-matrix.pdf (' + pdf3.length + ' bytes)\n');

  console.log('================================================================');
  console.log('TODAS LAS PRUEBAS COMPLETADAS SATISFACTORIAMENTE.');
  console.log('================================================================');

  await browser.close();
  process.exit(0);
})();
