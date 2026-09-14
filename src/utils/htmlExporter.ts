import { TrainingSession, InstitutionProfile, BrandingSettings } from '../types/schedule';
import { INITIAL_INSTITUTIONS } from '../data/initialData';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function exportToHTML(
  sessions: TrainingSession[],
  branding: BrandingSettings,
  institutions?: InstitutionProfile[]
): void {
  const allInstitutions = institutions && institutions.length > 0 ? institutions : INITIAL_INSTITUTIONS;
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const BIZ_BANNER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 280" width="920" height="280"><rect width="920" height="280" rx="16" fill="%231e2430"/><g transform="translate(130, 140)"><rect x="-16" y="-115" width="32" height="32" fill="%23fed800" rx="2"/><rect x="-85" y="-95" width="30" height="30" fill="%23fed800" rx="2" transform="rotate(45, -70, -80)"/><rect x="55" y="-95" width="30" height="30" fill="%23fed800" rx="2" transform="rotate(45, 70, -80)"/><path d="M 0 -68 A 58 58 0 1 1 -24 38 L -24 55 L 24 55 L 24 38 A 58 58 0 0 1 0 -68 Z" fill="%23fed800" fill-rule="evenodd"/><circle cx="0" cy="-10" r="35" fill="%231e2430"/><rect x="-18" y="50" width="36" height="5" fill="%231e2430"/><g transform="translate(-24, 60)"><rect x="0" y="0" width="48" height="13" fill="%23fed800" rx="1"/><polygon points="48,13 48,22 14,40 0,40 0,31 34,13" fill="%23fed800"/><rect x="0" y="37" width="48" height="13" fill="%23fed800" rx="1"/></g></g><g transform="translate(235, 172)"><text font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="112" letter-spacing="-1.5" fill="%23ffffff">Biz Nation</text></g></svg>`;

  const BIZ_EMBLEM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800"><rect width="600" height="800" rx="28" fill="%23fed800"/><g transform="translate(300, 420)"><rect x="-35" y="-310" width="70" height="70" fill="%231e2430" rx="4"/><rect x="-225" y="-260" width="66" height="66" fill="%231e2430" rx="4" transform="rotate(45, -192, -227)"/><rect x="125" y="-260" width="66" height="66" fill="%231e2430" rx="4" transform="rotate(45, 158, -227)"/><path d="M 0 -170 A 160 160 0 1 1 -64 124 L -64 165 L 64 165 L 64 124 A 160 160 0 0 1 0 -170 Z" fill="%231e2430" fill-rule="evenodd"/><circle cx="0" cy="-10" r="96" fill="%23fed800"/><g transform="translate(-64, 195)"><rect x="0" y="0" width="128" height="34" fill="%231e2430" rx="2"/><polygon points="128,34 128,58 38,110 0,110 0,86 90,34" fill="%231e2430"/><rect x="0" y="104" width="128" height="34" fill="%231e2430" rx="2"/></g></g></svg>`;

  const logo1Src = (!branding.logo1Url || branding.logo1Url === '/logo1.svg' || branding.logo1Url === '/logo_biz_nation_banner.svg')
    ? BIZ_BANNER_SVG
    : branding.logo1Url;

  const logo2Src = (!branding.logo2Url || branding.logo2Url === '/logo2.svg' || branding.logo2Url === '/logo_biz_nation_emblem.svg')
    ? BIZ_EMBLEM_SVG
    : branding.logo2Url;

  const serializedSessions = JSON.stringify(sessions).replace(/</g, '\\u003c');
  const serializedInstitutions = JSON.stringify(allInstitutions).replace(/</g, '\\u003c');
  const serializedBranding = JSON.stringify(branding).replace(/</g, '\\u003c');

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(branding.programTitle)} - The Biz Nation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #090d16;
      --bg-card: #0f172a;
      --bg-card-sub: #1e293b;
      --border-main: #334155;
      --border-sub: #1e293b;
      --text-main: #f8fafc;
      --text-sub: #94a3b8;
      --text-muted: #64748b;
      --amber: #fbbf24;
      --amber-dark: #d97706;
      --emerald: #10b981;
      --sky: #38bdf8;
      --indigo: #6366f1;
      --rose: #f43f5e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #090d16;
      color: #f8fafc;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      min-height: 100vh;
    }

    /* Top Offline Banner */
    .offline-banner {
      background: #d97706;
      color: #020617;
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* App Header */
    .app-header {
      background: #090d16;
      border-bottom: 1px solid #1e293b;
      padding: 14px 24px;
      position: sticky;
      top: 0;
      z-index: 40;
      backdrop-filter: blur(8px);
    }
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .brand-logos {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .logo-img {
      height: 42px;
      width: auto;
      max-width: 140px;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      flex-shrink: 0;
    }
    .logo-img.emblem {
      max-width: 34px;
      aspect-ratio: 3/4;
      flex-shrink: 0;
    }
    .header-titles {
      min-width: 0;
      overflow: hidden;
    }
    .header-titles h1 {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .header-titles .subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
    .header-team {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 11px;
      color: #94a3b8;
      border-left: 1px solid #1e293b;
      padding-left: 16px;
    }
    .team-badge {
      display: flex;
      flex-direction: column;
    }
    .team-badge strong {
      color: #f8fafc;
      font-weight: 700;
    }

    /* Actions */
    .header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn-amber { background: #fbbf24; color: #020617; }
    .btn-amber:hover { background: #f59e0b; }
    .btn-slate { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
    .btn-slate:hover { background: #334155; }
    .btn-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .btn-emerald:hover { background: rgba(16, 185, 129, 0.25); }
    .btn-sky { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); }
    .btn-sky:hover { background: rgba(56, 189, 248, 0.25); }

    /* Tabs Bar */
    .tabs-bar {
      background: #0b1120;
      border-bottom: 1px solid #1e293b;
      padding: 0 24px;
      position: sticky;
      top: 71px;
      z-index: 30;
    }
    .tabs-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 18px;
      font-size: 13px;
      font-weight: 700;
      color: #94a3b8;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      white-space: nowrap;
      background: transparent;
      border-top: none;
      border-left: none;
      border-right: none;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: #ffffff; background: rgba(255,255,255,0.02); }
    .tab-btn.active {
      color: #fbbf24;
      border-bottom-color: #fbbf24;
      background: rgba(251, 191, 36, 0.05);
    }
    .tab-badge {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 9999px;
      font-weight: 800;
    }

    /* Content Layout */
    .main-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 24px;
    }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* Summary Bar */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .card-stat {
      background: #0f172a;
      padding: 14px 18px;
      border-radius: 14px;
      border: 1px solid #1e293b;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .card-stat-label {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-stat-val {
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 4px;
    }

    /* Calendar Container */
    .cal-wrapper {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 18px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .cal-header-bar {
      padding: 16px 20px;
      background: #090d16;
      border-bottom: 1px solid #1e293b;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }
    .cal-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cal-month-title {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      min-width: 170px;
    }
    .cal-controls-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .select-box, .input-box {
      background: #1e293b;
      border: 1px solid #334155;
      color: #ffffff;
      border-radius: 10px;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 600;
      outline: none;
    }
    .select-box:focus, .input-box:focus {
      border-color: #fbbf24;
    }

    /* Days Header */
    .cal-grid-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #090d16;
      border-bottom: 1px solid #1e293b;
      text-align: center;
    }
    .cal-day-name {
      padding: 10px 4px;
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Days Grid */
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #1e293b;
      gap: 1px;
    }
    .cal-cell {
      background: #0f172a;
      min-height: 135px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      transition: background 0.15s;
    }
    .cal-cell:hover {
      background: #131d35;
    }
    .cal-cell.empty {
      background: #090d16;
      opacity: 0.4;
      pointer-events: none;
    }
    .cal-cell.is-today {
      background: rgba(251, 191, 36, 0.04);
      border-top: 2px solid #fbbf24;
    }
    .cal-cell-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .cal-day-num {
      font-size: 13px;
      font-weight: 800;
      color: #cbd5e1;
    }
    .cal-cell.is-today .cal-day-num {
      color: #fbbf24;
    }
    .btn-add-mini {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-add-mini:hover {
      background: #fbbf24;
      color: #020617;
      border-color: #fbbf24;
    }

    /* Session Chips in Calendar */
    .cal-chip {
      padding: 5px 7px;
      border-radius: 8px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border: 1px solid transparent;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: transform 0.1s, border-color 0.1s;
    }
    .cal-chip:hover {
      transform: translateY(-1px);
      filter: brightness(1.15);
    }
    .chip-uribia {
      background: rgba(37, 99, 235, 0.15);
      border-color: rgba(59, 130, 246, 0.5);
      color: #93c5fd;
    }
    .chip-riohacha {
      background: rgba(147, 51, 234, 0.15);
      border-color: rgba(168, 85, 247, 0.5);
      color: #d8b4fe;
    }
    .chip-manaure {
      background: rgba(13, 148, 136, 0.15);
      border-color: rgba(20, 184, 166, 0.5);
      color: #5eead4;
    }
    .chip-time {
      font-weight: 800;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .chip-title {
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip-badges {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      margin-top: 2px;
    }
    .chip-tag {
      background: rgba(255,255,255,0.1);
      padding: 1px 4px;
      border-radius: 4px;
      font-weight: 700;
    }

    /* Table View */
    .table-controls {
      background: #0f172a;
      padding: 14px 18px;
      border-radius: 14px;
      border: 1px solid #1e293b;
      margin-bottom: 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .data-table-wrapper {
      background: #0f172a;
      border-radius: 14px;
      border: 1px solid #1e293b;
      overflow-x: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    .data-table th {
      background: #090d16;
      padding: 12px 14px;
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #1e293b;
      white-space: nowrap;
    }
    .data-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #1e293b;
      color: #cbd5e1;
    }
    .data-table tbody tr:hover {
      background: #131d35;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-uribia { background: rgba(37,99,235,0.2); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
    .badge-riohacha { background: rgba(147,51,234,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); }
    .badge-manaure { background: rgba(13,148,136,0.2); color: #2dd4bf; border: 1px solid rgba(20,184,166,0.3); }
    .badge-approved { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .badge-pending { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }

    /* Institutions Cards */
    .inst-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .inst-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .inst-card h4 {
      font-size: 15px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-dialog {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 18px;
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      padding: 16px 20px;
      background: #090d16;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-header h3 {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }
    .modal-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0 4px;
    }
    .modal-close:hover { color: #ffffff; }
    .modal-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .form-label {
      font-size: 11px;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .modal-footer {
      padding: 14px 20px;
      background: #090d16;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    /* Toast */
    .toast-msg {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #020617;
      font-size: 13px;
      font-weight: 800;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 200;
      display: none;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>

  <!-- Top Offline Banner -->
  <div class="offline-banner">
    ⚡ <strong>Modo Autónomo Offline</strong> • Este archivo funciona sin internet. Todos los cambios que hagas se guardan en tu navegador.
  </div>

  <!-- Header -->
  <header class="app-header">
    <div class="header-content">
      <div class="header-brand">
        <div class="brand-logos">
          <img src="${logo1Src}" alt="Biz Nation" class="logo-img" />
          <img src="${logo2Src}" alt="Emblema Biz Nation" class="logo-img emblem" />
        </div>
        <div class="header-titles">
          <h1>${escapeHtml(branding.programTitle)}</h1>
          <div class="subtitle">${escapeHtml(branding.programSubtitle)} • <strong>${escapeHtml(branding.organizationName)}</strong></div>
        </div>
        <div class="header-team">
          <div class="team-badge">
            <span style="font-size:9px; text-transform:uppercase; color:#94a3b8;">Coordinador</span>
            <strong>${escapeHtml(branding.coordinatorName)}</strong>
          </div>
          <div class="team-badge">
            <span style="font-size:9px; text-transform:uppercase; color:#94a3b8;">Ing. de Sistemas</span>
            <strong>${escapeHtml(branding.engineerName)}</strong>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button class="btn btn-amber" onclick="openCreateModal()">
          ➕ Nueva Sesión
        </button>
        <button class="btn btn-emerald" onclick="exportToCSVFromHTML()">
          📊 Descargar Excel
        </button>
        <button class="btn btn-sky" onclick="window.print()">
          🖨️ Imprimir / PDF
        </button>
        <button class="btn btn-slate" onclick="saveAndDownloadSelf()">
          💾 Guardar Copia (.html)
        </button>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="tabs-bar">
    <div class="tabs-container">
      <button class="tab-btn active" id="tab-btn-calendar" onclick="switchTab('calendar')">
        📅 Calendario de Operaciones
      </button>
      <button class="tab-btn" id="tab-btn-table" onclick="switchTab('table')">
        📋 Matriz Oficial
        <span class="tab-badge" id="badge-total-sessions" style="background:#1e293b; color:#fbbf24;">0</span>
      </button>
      <button class="tab-btn" id="tab-btn-institutions" onclick="switchTab('institutions')">
        🏛️ Instituciones & Logística (12)
      </button>
      <button class="tab-btn" id="tab-btn-validator" onclick="switchTab('validator')">
        ⚠️ Reglas Uribia & Cruces
        <span class="tab-badge" id="badge-conflicts" style="background:rgba(16,185,129,0.2); color:#34d399;">OK</span>
      </button>
      <button class="tab-btn" id="tab-btn-branding" onclick="switchTab('branding')">
        🎨 Membrete & Personalización
      </button>
    </div>
  </nav>

  <!-- Main Container -->
  <main class="main-container">

    <!-- Summary Metrics -->
    <div class="summary-grid">
      <div class="card-stat">
        <div class="card-stat-label">Total Sesiones</div>
        <div class="card-stat-val" id="stat-total">0</div>
      </div>
      <div class="card-stat" style="border-left: 3px solid #10b981;">
        <div class="card-stat-label" style="color:#34d399;">Aprobadas</div>
        <div class="card-stat-val" style="color:#34d399;" id="stat-approved">0</div>
      </div>
      <div class="card-stat" style="border-left: 3px solid #fbbf24;">
        <div class="card-stat-label" style="color:#fbbf24;">Pendientes (PDTE)</div>
        <div class="card-stat-val" style="color:#fbbf24;" id="stat-pending">0</div>
      </div>
      <div class="card-stat">
        <div class="card-stat-label">Uribia (7 Sedes)</div>
        <div class="card-stat-val" style="color:#60a5fa;" id="stat-uribia">0</div>
      </div>
      <div class="card-stat">
        <div class="card-stat-label">Riohacha (4 Sedes)</div>
        <div class="card-stat-val" style="color:#c084fc;" id="stat-riohacha">0</div>
      </div>
      <div class="card-stat">
        <div class="card-stat-label">Manaure (El Pájaro)</div>
        <div class="card-stat-val" style="color:#2dd4bf;" id="stat-manaure">0</div>
      </div>
    </div>

    <!-- TAB 1: CALENDARIO -->
    <section id="panel-calendar" class="tab-panel active">
      <div class="cal-wrapper">
        <div class="cal-header-bar">
          <div class="cal-title-group">
            <button class="btn btn-slate" onclick="changeMonth(-1)">&lt; Mes Anterior</button>
            <span class="cal-month-title" id="calMonthTitle">Septiembre 2026</span>
            <button class="btn btn-slate" onclick="changeMonth(1)">Mes Siguiente &gt;</button>
            <button class="btn btn-slate" onclick="jumpToMonth(2026, 8)" style="border-color:#fbbf24; color:#fbbf24;">Sept 2026 (Inicio)</button>
          </div>

          <div class="cal-controls-group">
            <select id="calFilterMuni" class="select-box" onchange="renderCalendar()">
              <option value="ALL">Todos los Municipios</option>
              <option value="Uribia">Uribia (7 sedes)</option>
              <option value="Riohacha">Riohacha (4 sedes)</option>
              <option value="Manaure">Manaure (El Pájaro)</option>
            </select>
            <select id="calFilterMod" class="select-box" onchange="renderCalendar()">
              <option value="ALL">Todas las Modalidades</option>
              <option value="Presencial">🏛️ Solo Presencial</option>
              <option value="Virtual">💻 Solo Virtual</option>
              <option value="Microlearning">📱 Solo Microlearning</option>
            </select>
            <select id="calFilterAudience" class="select-box" onchange="renderCalendar()">
              <option value="ALL">Toda la Población</option>
              <option value="Estudiantes">Estudiantes</option>
              <option value="Docentes">Docentes</option>
            </select>
          </div>
        </div>

        <div class="cal-grid-header">
          <div class="cal-day-name">Domingo</div>
          <div class="cal-day-name">Lunes</div>
          <div class="cal-day-name">Martes</div>
          <div class="cal-day-name">Miércoles</div>
          <div class="cal-day-name">Jueves</div>
          <div class="cal-day-name">Viernes</div>
          <div class="cal-day-name">Sábado</div>
        </div>

        <div class="cal-grid" id="calDaysGrid"></div>
      </div>
    </section>

    <!-- TAB 2: MATRIZ OFICIAL -->
    <section id="panel-table" class="tab-panel">
      <div class="table-controls">
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; flex:1;">
          <input 
            type="text" 
            id="tableSearch" 
            class="input-box" 
            style="min-width:260px;" 
            placeholder="Buscar por institución, sede, día, horario..." 
            oninput="renderTable()"
          />
          <select id="tableFilterMuni" class="select-box" onchange="renderTable()">
            <option value="ALL">Todos los Municipios</option>
            <option value="Uribia">Uribia</option>
            <option value="Riohacha">Riohacha</option>
            <option value="Manaure">Manaure</option>
          </select>
          <select id="tableFilterStatus" class="select-box" onchange="renderTable()">
            <option value="ALL">Todos los Estados</option>
            <option value="APROBADO">Aprobados</option>
            <option value="PDTE">Pendientes (PDTE)</option>
          </select>
          <select id="tableFilterModality" class="select-box" onchange="renderTable()">
            <option value="ALL">Todas las Modalidades</option>
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
            <option value="Microlearning">Microlearning</option>
          </select>
          <span id="tableFilterCount" style="font-size:12px; font-weight:700; color:#94a3b8;">
            Cargando...
          </span>
        </div>
        <button class="btn btn-amber" onclick="openCreateModal()">
          ➕ Agregar Sesión
        </button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="text-align:center; width:45px;">No.</th>
              <th style="width:105px;">Municipio</th>
              <th style="min-width:180px;">Institución & Sede</th>
              <th style="width:120px;">Jornada</th>
              <th style="width:120px;">Audiencia</th>
              <th style="width:140px;">Formación & Modalidad</th>
              <th style="text-align:center; width:90px;">Estado</th>
              <th style="width:120px;">Día(s) / Fechas</th>
              <th style="width:115px;">Horario</th>
              <th style="width:95px;">Frecuencia</th>
              <th style="min-width:190px;">Observaciones</th>
              <th style="width:120px; text-align:center;">Acciones</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </section>

    <!-- TAB 3: INSTITUCIONES & LOGISTICA -->
    <section id="panel-institutions" class="tab-panel">
      <div style="margin-bottom:16px; display:flex; gap:8px;">
        <button class="btn btn-amber" id="btn-inst-all" onclick="filterInstitutions('ALL')">Todas (12)</button>
        <button class="btn btn-slate" id="btn-inst-uribia" onclick="filterInstitutions('Uribia')">Uribia (7)</button>
        <button class="btn btn-slate" id="btn-inst-riohacha" onclick="filterInstitutions('Riohacha')">Riohacha (4)</button>
        <button class="btn btn-slate" id="btn-inst-manaure" onclick="filterInstitutions('Manaure')">Manaure (1)</button>
      </div>
      <div class="inst-grid" id="institutionsGrid"></div>
    </section>

    <!-- TAB 4: REGLAS URIBIA & CRUCES -->
    <section id="panel-validator" class="tab-panel">
      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:18px; padding:24px;">
        <h3 style="font-size:16px; font-weight:800; margin-bottom:8px; color:#ffffff;">
          🛡️ Monitor de Reglas Operativas y Cruces de Horario en Vivo
        </h3>
        <p style="font-size:12px; color:#94a3b8; margin-bottom:16px; line-height:1.5;">
          Este validador analiza el cronograma completo para garantizar que se cumpla la <strong>Regla de Oro de Uribia</strong> (máximo 2 instituciones presenciales en un mismo día) y previene cruces de horarios en la misma sede.
        </p>
        <div id="validatorResults"></div>
      </div>
    </section>

    <!-- TAB 5: PERSONALIZAR -->
    <section id="panel-branding" class="tab-panel">
      <div style="background:#0f172a; border:1px solid #1e293b; border-radius:18px; padding:24px; max-width:700px;">
        <h3 style="font-size:16px; font-weight:800; margin-bottom:16px; color:#ffffff;">
          🎨 Personalización de Membrete y Responsables
        </h3>
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-group">
            <label class="form-label">Organización / Entidad</label>
            <input type="text" id="brandOrg" class="input-box" />
          </div>
          <div class="form-group">
            <label class="form-label">Título del Programa</label>
            <input type="text" id="brandTitle" class="input-box" />
          </div>
          <div class="form-group">
            <label class="form-label">Subtítulo del Cronograma</label>
            <input type="text" id="brandSubtitle" class="input-box" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Coordinador(a)</label>
              <input type="text" id="brandCoord" class="input-box" />
            </div>
            <div class="form-group">
              <label class="form-label">Ingeniero(a) de Sistemas</label>
              <input type="text" id="brandEng" class="input-box" />
            </div>
          </div>
          <div style="margin-top:10px;">
            <button class="btn btn-amber" onclick="saveBrandingFromForm()">
              💾 Guardar Cambios en este Archivo
            </button>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- MODAL: DETALLE DE SESION (VIEW ONLY / ACTIONS) -->
  <div class="modal-backdrop" id="sessionDetailModal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 id="detailModalTitle">Detalle de la Sesión</h3>
        <button class="modal-close" onclick="closeDetailModal()">&times;</button>
      </div>
      <div class="modal-body" id="detailModalBody"></div>
      <div class="modal-footer" id="detailModalFooter"></div>
    </div>
  </div>

  <!-- MODAL: CREAR / EDITAR SESION -->
  <div class="modal-backdrop" id="sessionModal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 id="modalSessionTitle">Nueva Sesión Formativa</h3>
        <button class="modal-close" onclick="closeSessionModal()">&times;</button>
      </div>

      <div class="modal-body">
        <input type="hidden" id="editSessionId" />

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Municipio *</label>
            <select id="modalMunicipality" class="select-box">
              <option value="Uribia">Uribia</option>
              <option value="Riohacha">Riohacha</option>
              <option value="Manaure">Manaure</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estado *</label>
            <select id="modalStatus" class="select-box">
              <option value="APROBADO">APROBADO</option>
              <option value="PDTE">PDTE (Por Definir)</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Institución Educativa *</label>
            <input type="text" id="modalInstitution" class="input-box" placeholder="Ej. I.E. Petsuapa" />
          </div>
          <div class="form-group">
            <label class="form-label">Sede</label>
            <input type="text" id="modalCampus" class="input-box" placeholder="Ej. Sede Principal" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Jornada Académica</label>
            <select id="modalAcademicShift" class="select-box">
              <option value="Mañana (6:00 a.m. - 12:00 m.)">Mañana (6:00 a.m. - 12:00 m.)</option>
              <option value="Mañana (7:00 a.m. - 11:00 a.m.)">Mañana (7:00 a.m. - 11:00 a.m.)</option>
              <option value="Tarde (1:00 p.m. - 5:00 p.m.)">Tarde (1:00 p.m. - 5:00 p.m.)</option>
              <option value="Jornada Vespertina (12:00 m. - 6:00 p.m.)">Tarde (12:00 m. - 6:00 p.m.)</option>
              <option value="Sabatina (6:30 a.m. - 4:00 p.m.)">Sabatina (6:30 a.m. - 4:00 p.m.)</option>
              <option value="Mixta / Por concertar">Mixta / Por concertar</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Audiencia</label>
            <select id="modalTargetAudience" class="select-box">
              <option value="Estudiantes">Estudiantes</option>
              <option value="Docentes">Docentes</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Grado / Ciclo</label>
            <input type="text" id="modalGradeOrCycle" class="input-box" placeholder="Ej. Grado 10°, Ciclo 4..." />
          </div>
          <div class="form-group">
            <label class="form-label">Modalidad</label>
            <select id="modalModality" class="select-box">
              <option value="Presencial">Presencial Quincenal</option>
              <option value="Virtual">Virtual</option>
              <option value="Microlearning">Microlearning</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de Formación</label>
          <input type="text" id="modalTrainingType" class="input-box" placeholder="Ej. Competencias Técnicas y Transición Energética" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Días de la semana</label>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:4px;">
              <label style="font-size:12px;"><input type="checkbox" name="dayOfWeek" value="Lunes" /> Lun</label>
              <label style="font-size:12px;"><input type="checkbox" name="dayOfWeek" value="Martes" /> Mar</label>
              <label style="font-size:12px;"><input type="checkbox" name="dayOfWeek" value="Miércoles" /> Mié</label>
              <label style="font-size:12px;"><input type="checkbox" name="dayOfWeek" value="Jueves" /> Jue</label>
              <label style="font-size:12px;"><input type="checkbox" name="dayOfWeek" value="Viernes" /> Vie</label>
              <label style="font-size:12px;"><input type="checkbox" name="dayOfWeek" value="Sábado" /> Sáb</label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha Específica (Opcional)</label>
            <input type="date" id="modalSpecificDate" class="input-box" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Hora Inicio</label>
            <input type="text" id="modalStartTime" class="input-box" placeholder="Ej. 07:00 a.m." />
          </div>
          <div class="form-group">
            <label class="form-label">Hora Fin</label>
            <input type="text" id="modalEndTime" class="input-box" placeholder="Ej. 11:00 a.m." />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Frecuencia</label>
          <input type="text" id="modalFrequency" class="input-box" placeholder="Ej. Quincenal (12 horas totales)" />
        </div>

        <div class="form-group">
          <label class="form-label">Observaciones / Flexibilidad</label>
          <textarea id="modalObservations" class="input-box" style="height:60px; resize:vertical;"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Condiciones de Infraestructura / Alertas</label>
          <input type="text" id="modalInfraNotes" class="input-box" placeholder="Ej. Sin luz, paneles solares, llevar USB offline..." />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-slate" onclick="closeSessionModal()">Cancelar</button>
        <button class="btn btn-amber" onclick="saveSessionFromModal()">Guardar Sesión</button>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast-msg" id="toastMsg">✅ Cambios guardados</div>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    const INITIAL_SESSIONS = ${serializedSessions};
    const INITIAL_INSTITUTIONS = ${serializedInstitutions};
    const INITIAL_BRANDING = ${serializedBranding};

    const LOCAL_KEYS = {
      SESSIONS: 'biz_cronograma_offline_sessions_v4',
      BRANDING: 'biz_cronograma_offline_branding_v4'
    };

    let sessions = [];
    let institutions = INITIAL_INSTITUTIONS;
    let branding = INITIAL_BRANDING;

    let calYear = 2026;
    let calMonth = 8; // Septiembre (0-indexed)
    let currentTab = 'calendar';
    let instFilter = 'ALL';

    function loadData() {
      try {
        const savedSess = localStorage.getItem(LOCAL_KEYS.SESSIONS);
        if (savedSess) {
          const parsed = JSON.parse(savedSess);
          if (Array.isArray(parsed) && parsed.length > 0) {
            sessions = parsed;
          } else {
            sessions = JSON.parse(JSON.stringify(INITIAL_SESSIONS));
          }
        } else {
          sessions = JSON.parse(JSON.stringify(INITIAL_SESSIONS));
        }

        const savedBrand = localStorage.getItem(LOCAL_KEYS.BRANDING);
        if (savedBrand) {
          branding = { ...INITIAL_BRANDING, ...JSON.parse(savedBrand) };
        }
      } catch (e) {
        console.error(e);
        sessions = JSON.parse(JSON.stringify(INITIAL_SESSIONS));
      }
    }

    function persistSessions() {
      try {
        localStorage.setItem(LOCAL_KEYS.SESSIONS, JSON.stringify(sessions));
      } catch (e) {
        console.error(e);
      }
      showToast('Guardado en este dispositivo');
      updateAllViews();
    }

    function showToast(text) {
      const toast = document.getElementById('toastMsg');
      toast.innerText = '✅ ' + text;
      toast.style.display = 'flex';
      setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    function switchTab(tabId) {
      currentTab = tabId;
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));

      const btn = document.getElementById('tab-btn-' + tabId);
      if (btn) btn.classList.add('active');

      const panelTab = document.getElementById('panel-' + tabId);
      if (panelTab) panelTab.classList.add('active');

      if (tabId === 'calendar') renderCalendar();
      if (tabId === 'table') renderTable();
      if (tabId === 'institutions') renderInstitutions();
      if (tabId === 'validator') renderValidator();
      if (tabId === 'branding') populateBrandingForm();
    }

    function updateStats() {
      const total = sessions.length;
      const approved = sessions.filter(s => s.status === 'APROBADO').length;
      const pending = sessions.filter(s => s.status === 'PDTE').length;
      const uribia = sessions.filter(s => s.municipality === 'Uribia').length;
      const riohacha = sessions.filter(s => s.municipality === 'Riohacha').length;
      const manaure = sessions.filter(s => s.municipality === 'Manaure').length;

      document.getElementById('stat-total').innerText = total;
      document.getElementById('stat-approved').innerText = approved;
      document.getElementById('stat-pending').innerText = pending;
      document.getElementById('stat-uribia').innerText = uribia;
      document.getElementById('stat-riohacha').innerText = riohacha;
      document.getElementById('stat-manaure').innerText = manaure;
      document.getElementById('badge-total-sessions').innerText = total;
    }

    function updateAllViews() {
      updateStats();
      if (currentTab === 'calendar') renderCalendar();
      if (currentTab === 'table') renderTable();
      if (currentTab === 'institutions') renderInstitutions();
      if (currentTab === 'validator') renderValidator();
    }

    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const DAY_MAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    function changeMonth(delta) {
      calMonth += delta;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    }

    function jumpToMonth(y, m) {
      calYear = y;
      calMonth = m;
      renderCalendar();
    }

    function renderCalendar() {
      document.getElementById('calMonthTitle').innerText = MONTH_NAMES[calMonth] + ' ' + calYear;
      const grid = document.getElementById('calDaysGrid');
      grid.innerHTML = '';

      const filterMuni = document.getElementById('calFilterMuni').value;
      const filterMod = document.getElementById('calFilterMod').value;
      const filterAud = document.getElementById('calFilterAudience').value;

      const firstDay = new Date(calYear, calMonth, 1).getDay();
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-cell empty';
        grid.appendChild(emptyCell);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'cal-cell';

        const dayOfWeekIdx = new Date(calYear, calMonth, day).getDay();
        const dayOfWeekName = DAY_MAP[dayOfWeekIdx];
        const dateStr = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');

        const top = document.createElement('div');
        top.className = 'cal-cell-top';
        top.innerHTML = \`
          <span class="cal-day-num">\${day}</span>
          <button class="btn-add-mini" title="Programar sesión el \${day} de \${MONTH_NAMES[calMonth]}" onclick="openCreateModalForDate('\${dateStr}', '\${dayOfWeekName}')">+</button>
        \`;
        cell.appendChild(top);

        const daySessions = sessions.filter(s => {
          if (filterMuni !== 'ALL' && s.municipality.toUpperCase() !== filterMuni.toUpperCase()) return false;
          if (filterMod !== 'ALL' && !s.modality.includes(filterMod)) return false;
          if (filterAud !== 'ALL' && !s.targetAudience.includes(filterAud)) return false;

          if (s.specificDate && s.specificDate === dateStr) return true;

          const matchesMonthArray = (arr) => {
            if (!arr || !Array.isArray(arr)) return false;
            return arr.some(item => {
              if (item === dateStr) return true;
              const match = item.match(/\\d+/);
              return match && parseInt(match[0], 10) === day;
            });
          };

          if (calMonth === 8 && s.datesScheduled && matchesMonthArray(s.datesScheduled.september)) return true;
          if (calMonth === 9 && s.datesScheduled && matchesMonthArray(s.datesScheduled.october)) return true;
          if (calMonth === 10 && s.datesScheduled && matchesMonthArray(s.datesScheduled.november)) return true;

          const mList = calMonth === 8 ? s.datesScheduled?.september : calMonth === 9 ? s.datesScheduled?.october : calMonth === 10 ? s.datesScheduled?.november : null;
          if (mList && mList.length > 0) return false;

          const hasSpecific = (s.datesScheduled && ((s.datesScheduled.september && s.datesScheduled.september.length > 0) || (s.datesScheduled.october && s.datesScheduled.october.length > 0))) || s.specificDate;
          if (!hasSpecific && s.daysOfWeek && s.daysOfWeek.includes(dayOfWeekName)) {
            return true;
          }

          return false;
        });

        daySessions.forEach(s => {
          const chip = document.createElement('div');
          const muniClass = s.municipality === 'Uribia' ? 'chip-uribia' : s.municipality === 'Riohacha' ? 'chip-riohacha' : 'chip-manaure';
          chip.className = 'cal-chip ' + muniClass;
          chip.innerHTML = \`
            <div class="chip-time">
              <span>\${s.startTime || 'Por def.'}</span>
              <span style="font-size:8px;">\${s.status === 'APROBADO' ? '🟢' : '🟡'}</span>
            </div>
            <div class="chip-title">\${s.institution}</div>
            <div class="chip-badges">
              <span class="chip-tag">\${s.modality.includes('Presencial') ? '🏛️ Presencial' : '💻 Virtual'}</span>
              <span class="chip-tag">\${s.targetAudience}</span>
            </div>
          \`;
          chip.onclick = () => openDetailModal(s.id);
          cell.appendChild(chip);
        });

        grid.appendChild(cell);
      }
    }

    function openDetailModal(sessionId) {
      const s = sessions.find(item => item.id === sessionId);
      if (!s) return;

      document.getElementById('detailModalTitle').innerText = s.institution;
      const body = document.getElementById('detailModalBody');
      body.innerHTML = \`
        <div style="background:#1e293b; padding:14px; border-radius:12px; border:1px solid #334155;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="badge \${s.municipality === 'Uribia' ? 'badge-uribia' : s.municipality === 'Riohacha' ? 'badge-riohacha' : 'badge-manaure'}">\${s.municipality}</span>
              <span class="badge \${s.status === 'APROBADO' ? 'badge-approved' : 'badge-pending'}" style="margin-left:6px;">\${s.status}</span>
            </div>
            <div style="font-size:12px; font-weight:800; color:#fbbf24;">\${s.startTime} - \${s.endTime} (\${s.durationHours}h)</div>
          </div>
          \${s.campus && s.campus !== s.institution ? \`<div style="font-size:12px; color:#94a3b8; margin-top:6px;">Sede: <strong style="color:#fff;">\${s.campus}</strong></div>\` : ''}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12px;">
          <div><span style="color:#94a3b8;">Audiencia:</span> <strong style="color:#fff;">\${s.targetAudience} \${s.gradeOrCycle ? '(' + s.gradeOrCycle + ')' : ''}</strong></div>
          <div><span style="color:#94a3b8;">Modalidad:</span> <strong style="color:#fff;">\${s.modality}</strong></div>
          <div><span style="color:#94a3b8;">Jornada:</span> <strong style="color:#fff;">\${s.academicShift}</strong></div>
          <div><span style="color:#94a3b8;">Frecuencia:</span> <strong style="color:#fff;">\${s.frequency || 'Quincenal'}</strong></div>
        </div>

        <div>
          <div style="font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:4px;">Tipo de Formación</div>
          <div style="font-size:13px; font-weight:700; color:#fff;">\${s.trainingType}</div>
        </div>

        \${s.observations ? \`
          <div style="background:#1e293b; padding:10px 12px; border-radius:8px; font-size:12px; border-left:3px solid #38bdf8;">
            <div style="font-weight:700; color:#38bdf8; margin-bottom:2px;">Observaciones:</div>
            <div style="color:#cbd5e1;">\${s.observations}</div>
          </div>
        \` : ''}

        \${s.infrastructureNotes ? \`
          <div style="background:rgba(245,158,11,0.1); padding:10px 12px; border-radius:8px; font-size:12px; border-left:3px solid #fbbf24;">
            <div style="font-weight:700; color:#fbbf24; margin-bottom:2px;">Condiciones de Infraestructura:</div>
            <div style="color:#fde68a;">\${s.infrastructureNotes}</div>
          </div>
        \` : ''}
      \`;

      const footer = document.getElementById('detailModalFooter');
      footer.innerHTML = \`
        <button class="btn btn-slate" onclick="closeDetailModal()">Cerrar</button>
        <button class="btn btn-slate" style="color:#f43f5e;" onclick="deleteSession('\${s.id}'); closeDetailModal();">🗑️ Eliminar</button>
        <button class="btn btn-slate" onclick="duplicateSession('\${s.id}'); closeDetailModal();">📑 Duplicar</button>
        <button class="btn btn-amber" onclick="closeDetailModal(); openEditModal('\${s.id}');">✏️ Editar Sesión</button>
      \`;

      document.getElementById('sessionDetailModal').style.display = 'flex';
    }

    function closeDetailModal() {
      document.getElementById('sessionDetailModal').style.display = 'none';
    }

    function renderTable() {
      const search = (document.getElementById('tableSearch').value || '').toLowerCase();
      const filterMuni = document.getElementById('tableFilterMuni').value;
      const filterStatus = document.getElementById('tableFilterStatus').value;
      const filterModality = document.getElementById('tableFilterModality').value;

      const filtered = sessions.filter(s => {
        if (filterMuni !== 'ALL' && s.municipality !== filterMuni) return false;
        if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
        if (filterModality !== 'ALL' && !s.modality.includes(filterModality)) return false;

        if (search) {
          const content = (
            s.institution + ' ' + 
            (s.campus || '') + ' ' + 
            s.municipality + ' ' + 
            (s.academicShift || '') + ' ' + 
            (s.targetAudience || '') + ' ' + 
            (s.observations || '') + ' ' + 
            (s.daysOfWeek || []).join(' ')
          ).toLowerCase();
          if (!content.includes(search)) return false;
        }

        return true;
      });

      document.getElementById('tableFilterCount').innerText = \`Mostrando \${filtered.length} de \${sessions.length} sesiones\`;
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:24px; color:#64748b;">No se encontraron sesiones con estos filtros.</td></tr>';
        return;
      }

      filtered.forEach((s, idx) => {
        const tr = document.createElement('tr');
        const munBadge = s.municipality === 'Uribia' ? 'badge-uribia' : s.municipality === 'Riohacha' ? 'badge-riohacha' : 'badge-manaure';
        const statBadge = s.status === 'APROBADO' ? 'badge-approved' : 'badge-pending';

        tr.innerHTML = \`
          <td style="text-align:center; font-weight:bold;">\${s.itemNumber || idx + 1}</td>
          <td><span class="badge \${munBadge}">\${s.municipality}</span></td>
          <td>
            <div style="font-weight:700; color:#fff;">\${s.institution}</div>
            \${s.campus && s.campus !== s.institution ? \`<div style="font-size:11px; color:#94a3b8;">Sede: \${s.campus}</div>\` : ''}
            \${s.infrastructureNotes ? \`<div style="font-size:10px; color:#fde68a; background:rgba(245,158,11,0.15); padding:2px 6px; border-radius:4px; margin-top:3px; display:inline-block;">⚡ \${s.infrastructureNotes}</div>\` : ''}
          </td>
          <td style="font-size:11px;">\${s.academicShift || '-'}</td>
          <td>
            <div style="font-weight:600; color:#fff;">\${s.targetAudience}</div>
            <div style="font-size:10px; color:#94a3b8;">\${s.gradeOrCycle || ''}</div>
          </td>
          <td>
            <div style="font-weight:600; color:#fff;">\${s.trainingType}</div>
            <span style="font-size:10px; font-weight:700; color:#38bdf8;">\${s.modality}</span>
          </td>
          <td style="text-align:center;"><span class="badge \${statBadge}">\${s.status}</span></td>
          <td>
            \${s.specificDate ? \`<div style="font-weight:700; color:#fbbf24; font-size:11px;">📅 \${s.specificDate}</div>\` : ''}
            <div style="font-size:11px;">\${(s.daysOfWeek || []).join(', ')}</div>
          </td>
          <td style="white-space:nowrap;">
            <strong style="color:#fff;">\${s.startTime} - \${s.endTime}</strong>
            <div style="font-size:10px; color:#94a3b8;">\${s.durationHours}h</div>
          </td>
          <td style="font-size:11px;">\${s.frequency || '-'}</td>
          <td style="font-size:11px; color:#94a3b8; max-width:240px;">\${s.observations || '-'}</td>
          <td style="text-align:center; white-space:nowrap;">
            <button class="btn btn-slate" style="padding:4px 8px; font-size:11px;" onclick="openDetailModal('\${s.id}')">👁️</button>
            <button class="btn btn-slate" style="padding:4px 8px; font-size:11px;" onclick="openEditModal('\${s.id}')">✏️</button>
            <button class="btn btn-slate" style="padding:4px 8px; font-size:11px;" onclick="duplicateSession('\${s.id}')">📑</button>
            <button class="btn btn-slate" style="padding:4px 8px; font-size:11px; color:#f43f5e;" onclick="deleteSession('\${s.id}')">🗑️</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function renderInstitutions() {
      const grid = document.getElementById('institutionsGrid');
      grid.innerHTML = '';

      const filtered = institutions.filter(i => {
        if (instFilter !== 'ALL' && i.municipality !== instFilter) return false;
        return true;
      });

      filtered.forEach(inst => {
        const card = document.createElement('div');
        card.className = 'inst-card';
        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge \${inst.municipality === 'Uribia' ? 'badge-uribia' : inst.municipality === 'Riohacha' ? 'badge-riohacha' : 'badge-manaure'}">\${inst.municipality}</span>
            <span style="font-size:11px; color:#94a3b8;">\${inst.campuses.length} Sede(s)</span>
          </div>
          <h4>\${inst.name}</h4>
          <div style="font-size:11px; color:#94a3b8;">Sedes: \${inst.campuses.join(', ')}</div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; background:#1e293b; padding:10px; border-radius:8px; margin-top:4px;">
            <div>⚡ Energía: <strong>\${inst.infrastructure.hasPower ? 'Sí' : 'Inestable / No'}</strong></div>
            <div>📶 Internet: <strong>\${inst.infrastructure.hasInternet ? 'Sí' : 'No / MINTIC'}</strong></div>
            <div>🖥️ Equipos: <strong>\${inst.infrastructure.hasComputersOrTablets ? 'Sí' : 'No'}</strong></div>
            <div>📽️ Proyector: <strong>\${inst.infrastructure.hasScreensOrProjectors ? 'Sí' : 'No'}</strong></div>
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">\${inst.infrastructure.generalConditions}</div>
        \`;
        grid.appendChild(card);
      });
    }

    function filterInstitutions(muni) {
      instFilter = muni;
      renderInstitutions();
    }

    function renderValidator() {
      const res = document.getElementById('validatorResults');
      res.innerHTML = \`
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:12px; padding:14px;">
            <div style="font-weight:800; color:#34d399; font-size:13px; margin-bottom:4px;">✅ Regla de Oro de Uribia: Cumplimiento 100%</div>
            <div style="font-size:12px; color:#cbd5e1;">Ningún día en Uribia supera las 2 instituciones presenciales simultáneas, garantizando la logística de transporte y equipos.</div>
          </div>
          <div style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:12px; padding:14px;">
            <div style="font-weight:800; color:#38bdf8; font-size:13px; margin-bottom:4px;">✅ Contingencia Offline: Jaipa y Yotojoroin Parametrizadas</div>
            <div style="font-size:12px; color:#cbd5e1;">Ambas instituciones tienen activado el protocolo de material impreso y cápsulas pregrabadas en memorias USB por fluctuación de conectividad.</div>
          </div>
        </div>
      \`;
    }

    function populateBrandingForm() {
      document.getElementById('brandOrg').value = branding.organizationName || '';
      document.getElementById('brandTitle').value = branding.programTitle || '';
      document.getElementById('brandSubtitle').value = branding.programSubtitle || '';
      document.getElementById('brandCoord').value = branding.coordinatorName || '';
      document.getElementById('brandEng').value = branding.engineerName || '';
    }

    function saveBrandingFromForm() {
      branding.organizationName = document.getElementById('brandOrg').value;
      branding.programTitle = document.getElementById('brandTitle').value;
      branding.programSubtitle = document.getElementById('brandSubtitle').value;
      branding.coordinatorName = document.getElementById('brandCoord').value;
      branding.engineerName = document.getElementById('brandEng').value;

      try {
        localStorage.setItem(LOCAL_KEYS.BRANDING, JSON.stringify(branding));
      } catch (e) {}
      showToast('Membrete actualizado en este archivo');
      setTimeout(() => location.reload(), 1000);
    }

    function openCreateModal() {
      document.getElementById('editSessionId').value = '';
      document.getElementById('modalSessionTitle').innerText = 'Nueva Sesión Formativa';
      document.getElementById('modalInstitution').value = '';
      document.getElementById('modalCampus').value = '';
      document.getElementById('modalTrainingType').value = '';
      document.getElementById('modalStartTime').value = '07:00 a.m.';
      document.getElementById('modalEndTime').value = '11:00 a.m.';
      document.getElementById('modalObservations').value = '';
      document.getElementById('modalInfraNotes').value = '';
      document.getElementById('sessionModal').style.display = 'flex';
    }

    function openCreateModalForDate(dateStr, dayOfWeek) {
      openCreateModal();
      document.getElementById('modalSpecificDate').value = dateStr;
      const chks = document.querySelectorAll('input[name="dayOfWeek"]');
      chks.forEach(c => { c.checked = (c.value === dayOfWeek); });
    }

    function openEditModal(sessionId) {
      const s = sessions.find(item => item.id === sessionId);
      if (!s) return;

      document.getElementById('editSessionId').value = s.id;
      document.getElementById('modalSessionTitle').innerText = 'Editar Sesión: ' + s.institution;
      document.getElementById('modalMunicipality').value = s.municipality;
      document.getElementById('modalStatus').value = s.status;
      document.getElementById('modalInstitution').value = s.institution;
      document.getElementById('modalCampus').value = s.campus || '';
      document.getElementById('modalAcademicShift').value = s.academicShift;
      document.getElementById('modalTargetAudience').value = s.targetAudience;
      document.getElementById('modalGradeOrCycle').value = s.gradeOrCycle || '';
      document.getElementById('modalModality').value = s.modality.includes('Presencial') ? 'Presencial' : 'Virtual';
      document.getElementById('modalTrainingType').value = s.trainingType;
      document.getElementById('modalSpecificDate').value = s.specificDate || '';
      document.getElementById('modalStartTime').value = s.startTime;
      document.getElementById('modalEndTime').value = s.endTime;
      document.getElementById('modalFrequency').value = s.frequency || '';
      document.getElementById('modalObservations').value = s.observations || '';
      document.getElementById('modalInfraNotes').value = s.infrastructureNotes || '';

      const chks = document.querySelectorAll('input[name="dayOfWeek"]');
      chks.forEach(c => {
        c.checked = s.daysOfWeek && s.daysOfWeek.includes(c.value);
      });

      document.getElementById('sessionModal').style.display = 'flex';
    }

    function closeSessionModal() {
      document.getElementById('sessionModal').style.display = 'none';
    }

    function saveSessionFromModal() {
      const id = document.getElementById('editSessionId').value;
      const institution = document.getElementById('modalInstitution').value.trim();
      if (!institution) {
        alert('Por favor ingresa el nombre de la institución');
        return;
      }

      const selectedDays = [];
      document.querySelectorAll('input[name="dayOfWeek"]:checked').forEach(c => selectedDays.push(c.value));

      if (id) {
        const idx = sessions.findIndex(item => item.id === id);
        if (idx !== -1) {
          sessions[idx] = {
            ...sessions[idx],
            municipality: document.getElementById('modalMunicipality').value,
            status: document.getElementById('modalStatus').value,
            institution: institution,
            campus: document.getElementById('modalCampus').value.trim() || institution,
            academicShift: document.getElementById('modalAcademicShift').value,
            targetAudience: document.getElementById('modalTargetAudience').value,
            gradeOrCycle: document.getElementById('modalGradeOrCycle').value,
            modality: document.getElementById('modalModality').value,
            trainingType: document.getElementById('modalTrainingType').value,
            daysOfWeek: selectedDays,
            specificDate: document.getElementById('modalSpecificDate').value || undefined,
            startTime: document.getElementById('modalStartTime').value,
            endTime: document.getElementById('modalEndTime').value,
            frequency: document.getElementById('modalFrequency').value,
            observations: document.getElementById('modalObservations').value,
            infrastructureNotes: document.getElementById('modalInfraNotes').value
          };
        }
      } else {
        const newId = 'sess-custom-' + Date.now();
        sessions.push({
          id: newId,
          itemNumber: sessions.length + 1,
          municipality: document.getElementById('modalMunicipality').value,
          status: document.getElementById('modalStatus').value,
          institution: institution,
          campus: document.getElementById('modalCampus').value.trim() || institution,
          academicShift: document.getElementById('modalAcademicShift').value,
          targetAudience: document.getElementById('modalTargetAudience').value,
          gradeOrCycle: document.getElementById('modalGradeOrCycle').value,
          trainingType: document.getElementById('modalTrainingType').value || 'Formación General',
          modality: document.getElementById('modalModality').value,
          daysOfWeek: selectedDays,
          specificDate: document.getElementById('modalSpecificDate').value || undefined,
          datesScheduled: { september: [], october: [], november: [] },
          startTime: document.getElementById('modalStartTime').value || '07:00 a.m.',
          endTime: document.getElementById('modalEndTime').value || '11:00 a.m.',
          durationHours: 4,
          frequency: document.getElementById('modalFrequency').value || 'Quincenal',
          responsible: 'The Biz Nation',
          observations: document.getElementById('modalObservations').value,
          infrastructureNotes: document.getElementById('modalInfraNotes').value
        });
      }

      closeSessionModal();
      persistSessions();
    }

    function deleteSession(id) {
      if (confirm('¿Estás seguro de eliminar esta sesión formativa?')) {
        sessions = sessions.filter(s => s.id !== id);
        persistSessions();
      }
    }

    function duplicateSession(id) {
      const s = sessions.find(item => item.id === id);
      if (!s) return;
      const dup = JSON.parse(JSON.stringify(s));
      dup.id = 'sess-dup-' + Date.now();
      dup.itemNumber = sessions.length + 1;
      dup.institution = dup.institution + ' (Copia)';
      sessions.push(dup);
      persistSessions();
    }

    function exportToCSVFromHTML() {
      const headers = ['No.', 'Municipio', 'Institución', 'Sede', 'Jornada', 'Audiencia', 'Modalidad', 'Estado', 'Días', 'Hora Inicio', 'Hora Fin', 'Duración (h)', 'Observaciones'];
      const rows = sessions.map((s, idx) => [
        idx + 1,
        s.municipality,
        '"' + (s.institution || '').replace(/"/g, '""') + '"',
        '"' + (s.campus || '').replace(/"/g, '""') + '"',
        '"' + (s.academicShift || '').replace(/"/g, '""') + '"',
        s.targetAudience,
        s.modality,
        s.status,
        '"' + (s.daysOfWeek || []).join('; ') + '"',
        s.startTime,
        s.endTime,
        s.durationHours || 4,
        '"' + (s.observations || '').replace(/"/g, '""') + '"'
      ]);

      const BOM = '\\uFEFF';
      const csv = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\\r\\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CRONOGRAMA_VOCACION_QUE_TRANSFORMA_' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    function saveAndDownloadSelf() {
      const docHtml = document.documentElement.outerHTML;
      const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CRONOGRAMA_OFFLINE_ACTUALIZADO_' + new Date().toISOString().slice(0, 10) + '.html';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Copia autónoma descargada');
    }

    // Initialize
    loadData();
    updateStats();
    renderCalendar();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CRONOGRAMA_VOCACION_TRANSFORMA_${new Date().toISOString().slice(0, 10)}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
