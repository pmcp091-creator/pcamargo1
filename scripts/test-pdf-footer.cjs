const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Set test HTML with multi-page print content and fixed footer
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @page {
            size: landscape;
            margin: 10mm 10mm 22mm 10mm;
          }
          body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
          }
          .content {
            padding: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 6px;
            font-size: 11px;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .fixed-footer {
            display: none;
          }
          @media print {
            .fixed-footer {
              display: block !important;
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              height: 18mm !important;
              background: white !important;
              border-top: 1px solid #000 !important;
              text-align: center;
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="fixed-footer">
          <strong>PIE DE PAGINA REPETIDO EN TODAS LAS PAGINAS - 5 LOGOS</strong>
        </div>
        <div class="content">
          <h1>Documento de Prueba Multi-página</h1>
          <table>
            <thead>
              <tr><th>#</th><th>Institución</th><th>Fecha</th><th>Modalidad</th></tr>
            </thead>
            <tbody>
              ${Array.from({ length: 80 }).map((_, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>Institución Educativa ${i + 1}</td>
                  <td>2026-10-${String((i % 28) + 1).padStart(2, '0')}</td>
                  <td>Presencial</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `);

  const pdfBuffer = await page.pdf({
    format: 'Letter',
    landscape: true,
    printBackground: true,
    displayHeaderFooter: false
  });

  fs.writeFileSync('test-multi-page.pdf', pdfBuffer);
  console.log('PDF generated, size bytes:', pdfBuffer.length);

  // Let's count pages in PDF by searching for /Type /Page
  const pdfStr = pdfBuffer.toString('latin1');
  const pageMatches = pdfStr.match(/\/Type\s*\/Page\b/g);
  console.log('Total pages in generated PDF:', pageMatches ? pageMatches.length : 'unknown');

  await browser.close();
  process.exit(0);
})();
