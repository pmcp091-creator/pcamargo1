const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '..', 'public', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// 1. LEGADO PARA LOS TERRITORIOS
// High-contrast official deep teal + emerald green branding for light and dark backgrounds
const legadoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 220" width="760" height="220">
  <defs>
    <filter id="soft-glow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.1" />
    </filter>
  </defs>
  <g filter="url(#soft-glow)">
    <!-- Main LEGADO typography: thick display sans-serif -->
    <text x="380" y="130" 
          text-anchor="middle" 
          font-family="'Plus Jakarta Sans', 'Montserrat', 'Inter', system-ui, sans-serif" 
          font-weight="900" 
          font-size="124" 
          letter-spacing="1" 
          fill="#004d5a">
      LEGADO
    </text>
    <!-- Subtitle: • para los Territorios • -->
    <g transform="translate(380, 185)">
      <circle cx="-175" cy="-6" r="4.5" fill="#008850" />
      <text x="0" y="0" 
            text-anchor="middle" 
            font-family="'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif" 
            font-weight="700" 
            font-size="34" 
            letter-spacing="0.5" 
            fill="#004d5a">
        para los Territorios
      </text>
      <circle cx="175" cy="-6" r="4.5" fill="#008850" />
    </g>
  </g>
</svg>
`;

// 2. GRUPO ENERGÍA BOGOTÁ (con 130 Años Mejorando Vidas)
const grupoEnergiaBogotaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" width="720" height="200">
  <!-- Energy Nodes / Orbital Bubbles on Left -->
  <g transform="translate(10, 10)">
    <!-- Orbits -->
    <circle cx="90" cy="90" r="68" fill="none" stroke="#009640" stroke-width="2.5" opacity="0.6"/>
    <path d="M 35 60 A 85 85 0 0 1 155 35" fill="none" stroke="#0085ca" stroke-width="2.5" opacity="0.8"/>
    
    <!-- Bubble Nodes -->
    <circle cx="100" cy="38" r="26" fill="#8cb811"/>
    <circle cx="75" cy="80" r="35" fill="#009640"/>
    <circle cx="140" cy="118" r="30" fill="#0085ca"/>
    <circle cx="48" cy="135" r="21" fill="#006bb6"/>
    <circle cx="95" cy="158" r="14" fill="#009640"/>
    <circle cx="18" cy="140" r="7" fill="#009640"/>
    <circle cx="48" cy="35" r="9" fill="#0085ca"/>
    <circle cx="150" cy="45" r="18" fill="#0085ca"/>
  </g>

  <!-- Text: Grupo Energía Bogotá -->
  <g transform="translate(195, 30)">
    <text x="0" y="38" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-weight="700" font-size="44" fill="#2d3138" letter-spacing="-0.5">Grupo</text>
    <text x="0" y="86" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-weight="800" font-size="52" fill="#009640" letter-spacing="-0.5">Energía</text>
    <text x="0" y="140" font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" font-weight="800" font-size="54" fill="#009640" letter-spacing="-0.5">Bogotá</text>
  </g>

  <!-- Divider -->
  <line x1="425" y1="25" x2="425" y2="175" stroke="#1a1a1a" stroke-width="3"/>

  <!-- 130 Años Mejorando Vidas -->
  <g transform="translate(445, 25)">
    <!-- Stylized 130 -->
    <g fill="#1a1a1a">
      <!-- 1 -->
      <path d="M 12 18 L 40 18 L 40 115 L 26 115 L 26 34 L 12 34 Z"/>
      <!-- 3 and 0 interwoven -->
      <text x="44" y="112" font-family="'Plus Jakarta Sans', 'Montserrat', sans-serif" font-weight="900" font-size="112" letter-spacing="-4">130</text>
    </g>
    <!-- Años Mejorando vidas -->
    <text x="75" y="136" font-family="'Plus Jakarta Sans', 'Inter', sans-serif" font-weight="800" font-size="24" fill="#1a1a1a">Años</text>
    <line x1="140" y1="130" x2="255" y2="130" stroke="#1a1a1a" stroke-width="2.5"/>
    <text x="145" y="152" font-family="'Plus Jakarta Sans', 'Inter', sans-serif" font-style="italic" font-weight="800" font-size="20" fill="#1a1a1a">Mejorando vidas</text>
  </g>
</svg>
`;

// 3. FUNDACIÓN ACDI/VOCA LA
const acdiSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 180" width="680" height="180">
  <!-- Globe Americas Icon on Left -->
  <g transform="translate(90, 90)">
    <!-- Globe Circle Outer Arc -->
    <path d="M -15 -75 A 75 75 0 1 0 75 25" fill="none" stroke="#00838f" stroke-width="12" stroke-linecap="round"/>
    
    <!-- Americas Continent Silhouette (North, Central, South) -->
    <path d="M -20 -60 
             C -8 -60, 5 -45, 2 -30 
             C 0 -15, -15 -5, -8 10 
             C -2 22, -10 40, -10 60 
             C -15 65, -28 40, -26 25 
             C -24 10, -45 -5, -45 -25 
             C -45 -45, -35 -60, -20 -60 Z" 
          fill="#00838f"/>
    <!-- Central America & Caribbean isthmus connection -->
    <circle cx="-10" cy="2" r="3.5" fill="#00838f"/>
    <circle cx="-4" cy="-2" r="3" fill="#00838f"/>
    <!-- South America bulk -->
    <path d="M -10 18 
             C 10 22, 20 40, 15 55 
             C 10 70, -2 80, -5 85 
             C -12 85, -18 68, -18 50 
             C -18 35, -20 22, -10 18 Z" 
          fill="#00838f"/>
  </g>

  <!-- Text on Right -->
  <g transform="translate(195, 45)">
    <!-- FUNDACIÓN -->
    <text x="0" y="32" 
          font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" 
          font-weight="700" 
          font-size="34" 
          letter-spacing="4" 
          fill="#00838f">
      FUNDACIÓN
    </text>
    
    <!-- ACDI/VOCA LA -->
    <g transform="translate(0, 96)">
      <text x="0" y="0" 
            font-family="'Plus Jakarta Sans', 'Montserrat', system-ui, sans-serif" 
            font-weight="900" 
            font-size="68" 
            letter-spacing="-1" 
            fill="#00838f">
        ACDI/VOCA
      </text>
      <text x="390" y="0" 
            font-family="'Plus Jakarta Sans', 'Montserrat', system-ui, sans-serif" 
            font-weight="400" 
            font-size="68" 
            letter-spacing="1" 
            fill="#00838f">
        LA
      </text>
    </g>
  </g>
</svg>
`;

// 4. FUNDACIÓN PROMIGAS
const promigasSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 180" width="680" height="180">
  <!-- Tri-color Community Spiral Icon on Left -->
  <g transform="translate(95, 90)">
    <!-- Cyan ribbon (top right) -->
    <path d="M 0 -25 C 25 -30, 45 -10, 40 25 C 36 48, 15 55, -5 65 C 10 45, 18 20, 10 -5 C 5 -18, -5 -22, 0 -25 Z" fill="#0088cc"/>
    <circle cx="36" cy="-28" r="18" fill="#00a8e8"/>

    <!-- Magenta ribbon (left) -->
    <path d="M -22 -15 C -45 5, -50 35, -25 50 C -5 62, 5 55, 15 70 C -10 65, -30 45, -35 25 C -40 5, -28 -10, -22 -15 Z" fill="#b01f68"/>
    <circle cx="-52" cy="15" r="18" fill="#d81b60"/>

    <!-- Lime green ribbon (bottom) -->
    <path d="M -5 35 C 10 32, 28 40, 35 55 C 42 70, 30 78, 15 80 C -5 82, -22 68, -25 50 C -20 40, -12 36, -5 35 Z" fill="#8cb811"/>
    <circle cx="-2" cy="88" r="18" fill="#a4cf2a"/>
  </g>

  <!-- Text on Right -->
  <g transform="translate(205, 55)">
    <!-- FUNDACIÓN -->
    <text x="0" y="34" 
          font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" 
          font-weight="800" 
          font-size="46" 
          letter-spacing="0.5" 
          fill="#474747">
      FUNDACIÓN
    </text>

    <!-- PROMIGAS -->
    <g transform="translate(0, 95)">
      <text x="0" y="0" 
            font-family="'Plus Jakarta Sans', 'Montserrat', system-ui, sans-serif" 
            font-weight="900" 
            font-size="64" 
            letter-spacing="-0.5" 
            fill="#474747">
        PROMI
      </text>
      <text x="210" y="0" 
            font-family="'Plus Jakarta Sans', 'Montserrat', system-ui, sans-serif" 
            font-weight="900" 
            font-size="64" 
            letter-spacing="-0.5" 
            fill="#8cb811">
        GAS
      </text>
    </g>
  </g>
</svg>
`;

// 5. ENLAZA Grupo Energía Bogotá
const enlazaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 180" width="680" height="180">
  <!-- Fingerprint e-loop Icon on Left -->
  <g transform="translate(10, 10)">
    <!-- Loop 1 (outer yellow/orange) -->
    <path d="M 25 110 C 20 85, 30 50, 60 30 C 95 10, 135 25, 145 65 C 150 85, 140 110, 120 125 C 95 140, 55 135, 40 105" 
          fill="none" stroke="#f59e0b" stroke-width="11" stroke-linecap="round"/>
    
    <!-- Loop 2 (ruby/magenta) -->
    <path d="M 45 125 C 35 105, 45 75, 70 50 C 95 30, 125 40, 135 70 C 140 95, 125 120, 105 130 C 85 140, 60 135, 50 120" 
          fill="none" stroke="#c026d3" stroke-width="9" stroke-linecap="round"/>

    <!-- Loop 3 (teal loop forming the core 'e') -->
    <path d="M 25 88 L 130 55 C 145 75, 135 110, 105 135 C 70 160, 30 135, 45 95 C 55 70, 85 55, 115 65" 
          fill="none" stroke="#0097a7" stroke-width="12" stroke-linecap="round"/>

    <!-- Accent dots -->
    <circle cx="20" cy="115" r="5" fill="#f59e0b"/>
    <circle cx="30" cy="132" r="5.5" fill="#c026d3"/>
  </g>

  <!-- enlaza typography -->
  <g transform="translate(170, 30)">
    <text x="0" y="92" 
          font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" 
          font-weight="900" 
          font-size="108" 
          letter-spacing="-3" 
          fill="#0097a7">
      enlaza
    </text>
    <!-- (R) registered mark -->
    <circle cx="340" cy="28" r="9" fill="none" stroke="#0097a7" stroke-width="1.8"/>
    <text x="340" y="32" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="10" fill="#0097a7">R</text>

    <!-- Subtitle: Grupo Energía Bogotá -->
    <g transform="translate(5, 125)">
      <text x="0" y="0" 
            font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" 
            font-weight="800" 
            font-size="28" 
            fill="#1e2430">
        Grupo
      </text>
      <text x="85" y="0" 
            font-family="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" 
            font-weight="800" 
            font-size="28" 
            fill="#00853f">
        Energía Bogotá
      </text>
    </g>
  </g>
</svg>
`;

// 6. BIZ NATION
const bizNationSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 180" width="620" height="180">
  <!-- Yellow Bulb Icon on Left -->
  <g transform="translate(65, 88)">
    <!-- Top Center Ray -->
    <rect x="-10" y="-76" width="20" height="20" fill="#fed800" rx="2"/>
    <!-- Left tilted Ray -->
    <rect x="-56" y="-62" width="18" height="18" fill="#fed800" rx="2" transform="rotate(45, -47, -53)"/>
    <!-- Right tilted Ray -->
    <rect x="38" y="-62" width="18" height="18" fill="#fed800" rx="2" transform="rotate(45, 47, -53)"/>

    <!-- Bulb Ring Head -->
    <path d="M 0 -44
             A 38 38 0 1 1 -16 25
             L -16 36
             L 16 36
             L 16 25
             A 38 38 0 0 1 0 -44 Z"
          fill="#fed800" fill-rule="evenodd"/>
    
    <!-- Bulb Ring Inner Hollow -->
    <circle cx="0" cy="-6" r="23" fill="#ffffff"/>

    <!-- Base Z-screw / N in bright yellow -->
    <g transform="translate(-16, 40)">
      <rect x="0" y="0" width="32" height="8.5" fill="#fed800" rx="1"/>
      <polygon points="32,8.5 32,15 9,27 0,27 0,21 23,8.5" fill="#fed800"/>
      <rect x="0" y="25" width="32" height="8.5" fill="#fed800" rx="1"/>
    </g>
  </g>

  <!-- Text "Biz Nation" in high-contrast institutional dark navy (so it shows clearly in light footer) -->
  <g transform="translate(145, 115)">
    <text font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" 
          font-weight="900" 
          font-size="76" 
          letter-spacing="-1.5" 
          fill="#1e2430">
      Biz Nation
    </text>
  </g>
</svg>
`;

async function generateLogos() {
  console.log('Generating high-resolution PNG logos in public/logos/ ...');
  
  const logos = [
    { name: 'legado.png', svg: legadoSvg },
    { name: 'grupo_energia_bogota.png', svg: grupoEnergiaBogotaSvg },
    { name: 'acdi.png', svg: acdiSvg },
    { name: 'promigas.png', svg: promigasSvg },
    { name: 'enlaza.png', svg: enlazaSvg },
    { name: 'biz_nation.png', svg: bizNationSvg }
  ];

  for (const item of logos) {
    const filePath = path.join(logosDir, item.name);
    // Render at high density (300 dpi equivalent) for sharp display on retina screens
    await sharp(Buffer.from(item.svg))
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(filePath);
    console.log(`✓ Created: public/logos/${item.name}`);
  }
  console.log('All 6 logos successfully generated!');
}

generateLogos().catch(err => {
  console.error('Error generating logos:', err);
  process.exit(1);
});
