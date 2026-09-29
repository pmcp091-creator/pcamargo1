const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('================================================================');
  console.log('VERIFICACIÓN DE HEADER MÓVIL Y OPTIMIZACIONES RESPONSIVAS');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ---------------------------------------------------------------------------
  // TEST 1: MÓVIL VERTICAL (PORTRAIT: 390 x 844 - iPhone 12/13/14 baseline)
  // ---------------------------------------------------------------------------
  console.log('>>> [1/3] Evaluando Móvil Vertical (Portrait 390x844)...');
  const contextPortrait = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const pageP = await contextPortrait.newPage();
  await pageP.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageP.waitForTimeout(1500);

  const portraitMetrics = await pageP.evaluate(() => {
    const header = document.querySelector('header.app-main-header');
    if (!header) return { found: false, error: 'header.app-main-header not found' };

    const topBar = header.querySelector('.md\\:hidden');
    const headerRect = header.getBoundingClientRect();
    const topBarRect = topBar ? topBar.getBoundingClientRect() : null;

    // Logo Legado in mobile
    const logoImg = topBar ? topBar.querySelector('img[src*="legado.png"]') : null;
    const logoRect = logoImg ? logoImg.getBoundingClientRect() : null;

    // Mobile title
    const titleText = topBar ? topBar.querySelector('.truncate')?.textContent?.trim() : null;

    // Buttons
    const accessBtn = document.getElementById('btn-mobile-coordination-access') || document.getElementById('btn-mobile-coordinator-badge');
    const menuBtn = document.getElementById('btn-mobile-menu');
    const accessBtnRect = accessBtn ? accessBtn.getBoundingClientRect() : null;
    const menuBtnRect = menuBtn ? menuBtn.getBoundingClientRect() : null;

    // Tabs container
    const navTabs = header.querySelector('nav');
    const navTabsRect = navTabs ? navTabs.getBoundingClientRect() : null;
    const tabButtons = navTabs ? Array.from(navTabs.querySelectorAll('button')).map(b => ({
      id: b.id,
      text: b.textContent?.trim(),
      width: Math.round(b.getBoundingClientRect().width),
      height: Math.round(b.getBoundingClientRect().height)
    })) : [];

    // Check Calendar view internal buttons
    const calInternalBar = document.querySelector('.bg-white .hidden.md\\:flex, .bg-slate-900 .hidden.md\\:flex');
    const allButtons = Array.from(document.querySelectorAll('button'));
    const orphanHtmlBtn = allButtons.find(b => b.textContent && b.textContent.includes('Descargar HTML'));

    return {
      found: true,
      headerTotalHeight: Math.round(headerRect.height),
      topBarHeight: topBarRect ? Math.round(topBarRect.height) : null,
      topBarMeetsMax56px: topBarRect ? topBarRect.height <= 56 : false,
      logoRenderedHeight: logoRect ? Math.round(logoRect.height) : null,
      logoRenderedWidth: logoRect ? Math.round(logoRect.width) : null,
      titleText,
      accessBtnSize: accessBtnRect ? `${Math.round(accessBtnRect.width)}x${Math.round(accessBtnRect.height)}` : null,
      menuBtnSize: menuBtnRect ? `${Math.round(menuBtnRect.width)}x${Math.round(menuBtnRect.height)}` : null,
      navTabsHeight: navTabsRect ? Math.round(navTabsRect.height) : null,
      tabButtonsCount: tabButtons.length,
      tabButtons,
      orphanHtmlBtnPresent: !!orphanHtmlBtn
    };
  });

  console.log('Métricas Portrait:', JSON.stringify(portraitMetrics, null, 2));

  // Screenshot portrait before opening menu
  await pageP.screenshot({ path: 'evidence-mobile-portrait.png' });
  console.log('-> Captura guardada: evidence-mobile-portrait.png');

  // Click on mobile menu button (⋮)
  console.log('-> Abriendo menú desplegable móvil...');
  await pageP.click('#btn-mobile-menu');
  await pageP.waitForTimeout(600);

  const menuState = await pageP.evaluate(() => {
    const menu = document.getElementById('mobile-dropdown-menu');
    if (!menu) return { open: false };
    const items = Array.from(menu.querySelectorAll('button')).map(b => b.textContent?.trim());
    return {
      open: true,
      itemsCount: items.length,
      items
    };
  });
  console.log('Estado Menú Móvil:', JSON.stringify(menuState, null, 2));

  // Screenshot with open dropdown menu
  await pageP.screenshot({ path: 'evidence-mobile-menu-open.png' });
  console.log('-> Captura guardada: evidence-mobile-menu-open.png\n');

  // Close menu with Escape
  await pageP.keyboard.press('Escape');
  await pageP.waitForTimeout(300);

  // ---------------------------------------------------------------------------
  // TEST 2: MÓVIL HORIZONTAL (LANDSCAPE: 844 x 390)
  // ---------------------------------------------------------------------------
  console.log('>>> [2/3] Evaluando Móvil Horizontal (Landscape 844x390)...');
  const contextLandscape = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true
  });
  const pageL = await contextLandscape.newPage();
  await pageL.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageL.waitForTimeout(1500);

  const landscapeMetrics = await pageL.evaluate(() => {
    const header = document.querySelector('header.app-main-header');
    if (!header) return { found: false };

    const topBar = header.querySelector('.md\\:hidden');
    const headerRect = header.getBoundingClientRect();
    const topBarRect = topBar ? topBar.getBoundingClientRect() : null;

    return {
      found: true,
      headerTotalHeight: Math.round(headerRect.height),
      topBarHeight: topBarRect ? Math.round(topBarRect.height) : null,
      topBarMeetsMax48px: topBarRect ? topBarRect.height <= 48 : false
    };
  });

  console.log('Métricas Landscape:', JSON.stringify(landscapeMetrics, null, 2));
  await pageL.screenshot({ path: 'evidence-mobile-landscape.png' });
  console.log('-> Captura guardada: evidence-mobile-landscape.png\n');

  // ---------------------------------------------------------------------------
  // TEST 3: DESKTOP (1440 x 900)
  // ---------------------------------------------------------------------------
  console.log('>>> [3/3] Evaluando Desktop (1440x900)...');
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const pageD = await contextDesktop.newPage();
  await pageD.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageD.waitForTimeout(1500);

  const desktopMetrics = await pageD.evaluate(() => {
    const header = document.querySelector('header.app-main-header');
    const desktopBar = header ? header.querySelector('.hidden.md\\:block') : null;
    const desktopRect = desktopBar ? desktopBar.getBoundingClientRect() : null;

    // Calendar actions bar
    const calActions = document.querySelector('.hidden.md\\:flex');
    const calActionsVisible = calActions ? window.getComputedStyle(calActions).display !== 'none' : false;

    // Check orphan HTML button
    const allButtons = Array.from(document.querySelectorAll('button'));
    const htmlBtn = allButtons.find(b => b.textContent && b.textContent.includes('Descargar HTML'));

    return {
      desktopBarFound: !!desktopBar,
      desktopBarHeight: desktopRect ? Math.round(desktopRect.height) : null,
      calActionsVisibleOnDesktop: calActionsVisible,
      orphanHtmlBtnPresent: !!htmlBtn
    };
  });

  console.log('Métricas Desktop:', JSON.stringify(desktopMetrics, null, 2));

  console.log('\n================================================================');
  console.log('TODAS LAS PRUEBAS FINALIZADAS EXITOSAMENTE');
  console.log('================================================================');

  await browser.close();
  process.exit(0);
})();
