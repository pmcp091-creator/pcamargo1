const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');

(async () => {
  let browser;
  try {
    console.log('================================================================');
    console.log('🔍 VERIFICACIÓN COMPLETA DEL DASHBOARD TRAS LA RESTAURACIÓN');
    console.log('================================================================');

    browser = await chromium.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    const consoleLogs = [];

    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    page.on('pageerror', err => {
      console.error('[PAGE ERROR]', err.message);
    });

    console.log('Cargando la aplicación en http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(4000);

    // 1. Activar Modo Coordinador para validar edición y candados
    await page.click('button:has-text("Acceso Coordinación")');
    await page.waitForTimeout(500);
    await page.fill('input[type="password"]', 'ADMIN2026');
    await page.press('input[type="password"]', 'Enter');
    await page.waitForTimeout(1000);

    // 2. Ir a la pestaña Dashboard
    console.log('Navegando a la pestaña Dashboard...');
    const dashBtn = await page.$('button:has-text("Dashboard"), button:has-text("Métricas"), button:has-text("KPIs")');
    if (dashBtn) {
      await dashBtn.click();
    } else {
      // Buscar botón con ícono de gráfico o texto
      await page.click('nav button:has-text("Dashboard"), nav button:has-text("Indicadores")');
    }
    await page.waitForTimeout(1500);

    // 3. Extraer valores del Dashboard
    const dashboardData = await page.evaluate(() => {
      const text = document.body.innerText;
      // Buscar el bloque de total de sesiones
      const cards = Array.from(document.querySelectorAll('div')).filter(d => 
        (d.innerText || '').includes('Total Sesiones') || 
        (d.innerText || '').includes('Gran Total') ||
        (d.innerText || '').includes('Sesiones Programadas')
      );
      
      const totalMatch = text.match(/Total Sesiones[^0-9]*([0-9]+)/i) || 
                         text.match(/Gran Total[^0-9]*([0-9]+)/i) ||
                         text.match(/332/);

      return {
        bodyContains332: text.includes('332'),
        bodyContains49: text.includes('49'),
        bodyContains283: text.includes('283'),
        textSnippet: text.slice(0, 800)
      };
    });

    console.log('\n--- DATOS DE SESIONES EN EL DASHBOARD ---');
    console.log(`¿Texto 332 presente en la vista?: ${dashboardData.bodyContains332 ? '✅ SÍ' : '❌ NO'}`);
    console.log(`¿Texto 49 presente en la vista?: ${dashboardData.bodyContains49 ? '✅ SÍ' : '❌ NO'}`);
    console.log(`¿Texto 283 presente en la vista?: ${dashboardData.bodyContains283 ? '✅ SÍ' : '❌ NO'}`);

    // 4. Cambiar a la vista Matriz Oficial (Tabla)
    console.log('\nNavegando a "Matriz Oficial (Excel)"...');
    await page.click('button:has-text("Matriz Oficial")');
    await page.waitForTimeout(1500);

    const tableData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      let histCount = 0;
      let editableCount = 0;
      let totalRows = rows.length;

      rows.forEach(tr => {
        const text = tr.innerText;
        if (text.includes('Histórico') || text.includes('Solo Lectura') || tr.querySelector('.lucide-lock')) {
          histCount++;
        }
        if (tr.querySelector('button[title*="Modificar"]') || tr.querySelector('button[title*="Editar"]') || text.includes('Editar')) {
          editableCount++;
        }
      });

      // Fechas de las filas
      const dates = rows.map(tr => {
        const match = tr.innerText.match(/\d{4}-\d{2}-\d{2}/);
        return match ? match[0] : null;
      }).filter(Boolean);

      return {
        totalRows,
        histRowsWithLock: histCount,
        editableRows: editableCount,
        firstDate: dates[0],
        lastDate: dates[dates.length - 1],
        datesCount: dates.length
      };
    });

    console.log('\n--- DATOS DE LA MATRIZ OFICIAL ---');
    console.log(`• Total filas renderizadas en tabla: ${tableData.totalRows}`);
    console.log(`• Filas históricas protegidas con candado/solo lectura: ${tableData.histRowsWithLock}`);
    console.log(`• Fecha inicial: ${tableData.firstDate}`);
    console.log(`• Fecha final: ${tableData.lastDate}`);

    console.log('\n================ LOGS LITERALES DE CONSOLA ================');
    consoleLogs.forEach((l, idx) => {
      console.log(`[#${idx + 1}] [${l.type.toUpperCase()}] ${l.text}`);
    });

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Error durante la verificación:', err);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
