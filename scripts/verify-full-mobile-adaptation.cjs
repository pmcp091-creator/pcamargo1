const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('================================================================');
  console.log('VERIFICACIÓN INTEGRAL DE ADAPTACIÓN MÓVIL PROFESIONAL Y RESPONSIVA');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ---------------------------------------------------------------------------
  // 1. EVALUACIÓN DE PWA SERVICE WORKER
  // ---------------------------------------------------------------------------
  console.log('>>> [1/4] Verificando Service Worker (public/sw.js)...');
  const swContent = fs.readFileSync('public/sw.js', 'utf8');
  const hasNewCacheName = swContent.includes("legado-cache-mobile-v1");
  const hasSkipWaiting = swContent.includes("self.skipWaiting()");
  const hasClientsClaim = swContent.includes("clients.claim()");
  console.log(`- Cache Version legado-cache-mobile-v1: ${hasNewCacheName ? '✓ SÍ' : '✗ NO'}`);
  console.log(`- self.skipWaiting(): ${hasSkipWaiting ? '✓ SÍ' : '✗ NO'}`);
  console.log(`- clients.claim(): ${hasClientsClaim ? '✓ SÍ' : '✗ NO'}\n`);

  // ---------------------------------------------------------------------------
  // 2. MÓVIL VERTICAL (PORTRAIT: 390 x 844)
  // ---------------------------------------------------------------------------
  console.log('>>> [2/4] Evaluando Móvil Vertical (Portrait 390x844)...');
  const contextP = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const pageP = await contextP.newPage();
  await pageP.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageP.waitForTimeout(1500);

  const evalPortrait = await pageP.evaluate(() => {
    // 1. Root & Body
    const bodyStyle = window.getComputedStyle(document.body);
    const rootContainer = document.querySelector('#root > div');

    // 2. Header Mobile
    const header = document.querySelector('header.app-main-header');
    const headerRect = header ? header.getBoundingClientRect() : null;
    const mobileBar = header ? header.querySelector('.mobile-compact-bar') : null;
    const mobileBarRect = mobileBar ? mobileBar.getBoundingClientRect() : null;

    const logoImg = mobileBar ? mobileBar.querySelector('img[src*="legado.png"]') : null;
    const logoRect = logoImg ? logoImg.getBoundingClientRect() : null;
    const legadoTitle = mobileBar ? mobileBar.querySelector('span.font-bold')?.textContent?.trim() : null;

    const desktopPills = header ? header.querySelector('.desktop-full-bar') : null;
    const desktopPillsVisible = desktopPills ? window.getComputedStyle(desktopPills).display !== 'none' : false;

    // 3. Bottom Navigation
    const bottomNav = document.querySelector('.mobile-bottom-nav');
    const bottomNavVisible = bottomNav ? window.getComputedStyle(bottomNav).display !== 'none' : false;
    const bottomNavButtons = bottomNav ? Array.from(bottomNav.querySelectorAll('button')).map(b => b.textContent?.trim()) : [];

    // 4. Calendar View mobile optimizations
    const orphanHtml = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Descargar HTML'));
    const internalActionsBar = document.querySelector('.hidden.md\\:flex');
    const internalActionsVisible = internalActionsBar ? window.getComputedStyle(internalActionsBar).display !== 'none' : false;
    const fabButton = document.getElementById('fab-calendar-new-session');
    const fabVisible = fabButton ? window.getComputedStyle(fabButton).display !== 'none' : false;
    const quickFiltersBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Filtros rápidos'));

    return {
      bodyOverflowXHidden: bodyStyle.overflowX === 'hidden',
      rootHasDvh: rootContainer ? rootContainer.className.includes('100dvh') : false,
      headerHeight: headerRect ? Math.round(headerRect.height) : null,
      mobileBarHeight: mobileBarRect ? Math.round(mobileBarRect.height) : null,
      mobileBarMeets56px: mobileBarRect ? mobileBarRect.height <= 56 : false,
      logoHeight: logoRect ? Math.round(logoRect.height) : null,
      legadoTitle,
      desktopPillsHiddenOnMobile: !desktopPillsVisible,
      bottomNavVisible,
      bottomNavButtons,
      orphanHtmlRemoved: !orphanHtml,
      internalActionsHiddenOnMobile: !internalActionsVisible,
      fabButtonVisible: fabVisible,
      quickFiltersBtnFound: !!quickFiltersBtn
    };
  });

  console.log('Evaluación Móvil Vertical:', JSON.stringify(evalPortrait, null, 2));
  await pageP.screenshot({ path: 'evidence-mobile-portrait-clean.png' });
  console.log('-> Captura guardada: evidence-mobile-portrait-clean.png');

  // Open lateral Drawer
  console.log('-> Abriendo Drawer lateral...');
  await pageP.click('#btn-mobile-drawer-toggle');
  await pageP.waitForTimeout(600);

  const evalDrawer = await pageP.evaluate(() => {
    const drawer = document.getElementById('mobile-side-drawer');
    if (!drawer) return { open: false };
    const buttons = Array.from(drawer.querySelectorAll('button')).map(b => b.textContent?.trim());
    const hasExcel = buttons.some(b => b.includes('Descargar Excel'));
    const hasPdf = buttons.some(b => b.includes('Imprimir / PDF'));
    const hasReset = buttons.some(b => b.includes('Restablecer Matriz Oficial'));
    const hasTheme = buttons.some(b => b.includes('Modo Claro') || b.includes('Modo Oscuro') || b.includes('Cambiar a'));
    const hasSystemStatus = !!drawer.textContent && drawer.textContent.includes('Estado del Sistema');

    return {
      open: true,
      hasExcel,
      hasPdf,
      hasReset,
      hasTheme,
      hasSystemStatus,
      buttons
    };
  });

  console.log('Evaluación Drawer Lateral:', JSON.stringify(evalDrawer, null, 2));
  await pageP.screenshot({ path: 'evidence-mobile-drawer-open.png' });
  console.log('-> Captura guardada: evidence-mobile-drawer-open.png\n');

  // Close drawer
  await pageP.keyboard.press('Escape');
  await pageP.waitForTimeout(400);

  // ---------------------------------------------------------------------------
  // 3. MÓVIL HORIZONTAL (LANDSCAPE: 844 x 390)
  // ---------------------------------------------------------------------------
  console.log('>>> [3/4] Evaluando Móvil Horizontal (Landscape 844x390)...');
  const contextL = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true
  });
  const pageL = await contextL.newPage();
  await pageL.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageL.waitForTimeout(1500);

  const evalLandscape = await pageL.evaluate(() => {
    const header = document.querySelector('header.app-main-header');
    const headerRect = header ? header.getBoundingClientRect() : null;
    const mobileBar = header ? header.querySelector('.mobile-compact-bar') : null;
    const mobileBarRect = mobileBar ? mobileBar.getBoundingClientRect() : null;

    const bottomNav = document.querySelector('.mobile-bottom-nav');
    const bottomNavVisible = bottomNav ? window.getComputedStyle(bottomNav).display !== 'none' : false;

    return {
      headerTotalHeight: headerRect ? Math.round(headerRect.height) : null,
      mobileBarHeight: mobileBarRect ? Math.round(mobileBarRect.height) : null,
      meets40pxRequirement: headerRect ? headerRect.height <= 42 : false,
      bottomNavHiddenInLowHeight: !bottomNavVisible
    };
  });

  console.log('Evaluación Móvil Landscape:', JSON.stringify(evalLandscape, null, 2));
  await pageL.screenshot({ path: 'evidence-mobile-landscape-clean.png' });
  console.log('-> Captura guardada: evidence-mobile-landscape-clean.png\n');

  // ---------------------------------------------------------------------------
  // 4. ESCRITORIO (1440 x 900)
  // ---------------------------------------------------------------------------
  console.log('>>> [4/4] Evaluando Escritorio (1440x900) - Garantizando versión intacta...');
  const contextD = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pageD = await contextD.newPage();
  await pageD.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageD.waitForTimeout(1500);

  const evalDesktop = await pageD.evaluate(() => {
    const header = document.querySelector('header.app-main-header');
    const desktopBar = header ? header.querySelector('.desktop-full-bar') : null;
    const desktopRect = desktopBar ? desktopBar.getBoundingClientRect() : null;

    const topNav = header ? header.querySelector('nav[aria-label="Pestañas de navegación escritorio"]') : null;
    const topNavVisible = topNav ? window.getComputedStyle(topNav).display !== 'none' : false;

    const bottomNav = document.querySelector('.mobile-bottom-nav');
    const bottomNavVisible = bottomNav ? window.getComputedStyle(bottomNav).display !== 'none' : false;

    const calActions = document.querySelector('.hidden.md\\:flex');
    const calActionsVisible = calActions ? window.getComputedStyle(calActions).display !== 'none' : false;

    const fabButton = document.getElementById('fab-calendar-new-session');
    const fabVisible = fabButton ? window.getComputedStyle(fabButton).display !== 'none' : false;

    return {
      desktopBarFound: !!desktopBar,
      desktopBarHeight: desktopRect ? Math.round(desktopRect.height) : null,
      desktopBarVisible: desktopBar ? window.getComputedStyle(desktopBar).display !== 'none' : false,
      topNavVisibleOnDesktop: topNavVisible,
      bottomNavHiddenOnDesktop: !bottomNavVisible,
      calActionsVisibleOnDesktop: calActionsVisible,
      fabHiddenOnDesktop: !fabVisible
    };
  });

  console.log('Evaluación Escritorio:', JSON.stringify(evalDesktop, null, 2));

  console.log('\n================================================================');
  console.log('EVALUACIÓN COMPLETADA EXITOSAMENTE');
  console.log('================================================================');

  await browser.close();
  process.exit(0);
})();
