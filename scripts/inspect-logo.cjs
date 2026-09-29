const { chromium } = require('/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  const header = await page.locator('header').first();
  if (header) {
    await header.screenshot({ path: 'header-screenshot.png' });
    console.log('Header screenshot saved to header-screenshot.png');
  }

  // Also check colors of legado.png
  const colors = await page.evaluate(async () => {
    const img = document.querySelector('header img[src*="legado"]');
    if (!img) return null;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let nonTrans = 0;
    let rSum = 0, gSum = 0, bSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 50) {
        nonTrans++;
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }
    }
    return {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      nonTransparentPixels: nonTrans,
      avgR: Math.round(rSum / nonTrans),
      avgG: Math.round(gSum / nonTrans),
      avgB: Math.round(bSum / nonTrans)
    };
  });
  console.log('Image pixel analysis:', colors);

  await browser.close();
  process.exit(0);
})();
