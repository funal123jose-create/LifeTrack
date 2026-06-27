import type { ProjectCaseStudyAsset, ProjectCaseStudySkill, ProjectCaseStudyTask, ProjectCaseStudyTaskDoc } from "@/lib/career"

type ProjectCaseStudyExportDetail = {
  project_title?: string | null
  project_description?: string | null
  project_summary?: string | null
  project_status?: string | null
  project_priority?: string | null
  start_date?: string | null
  total_tasks?: number | null
  completed_tasks?: number | null
  documented_tasks?: number | null
  total_task_skills?: number | null
  total_assets?: number | null
  total_images?: number | null
  total_documents?: number | null
  project_stack?: string | null
  task_stack?: string | null
  documentation_percentage?: number | null
  skill_coverage_percentage?: number | null
  professional_score?: number | null
  tasks_json?: ProjectCaseStudyTask[] | null
}

// --- EXPORTACIÓN PROFESIONAL DEL CASO TÉCNICO ---
// Esta capa no modifica la lógica existente del módulo. Solo toma el caso técnico ya cargado
// desde selectedCaseStudy y genera una versión imprimible/exportable en HTML/PDF desde el navegador.
const escapeCaseStudyText = (value?: string | number | null) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const formatCaseStudyDate = (value?: string | null) => {
  if (!value) return "No definido"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

const renderCaseStudyPlainSection = (label: string, value?: string | null) => {
  const safeValue = String(value || "").trim()
  if (!safeValue) return ""

  return `
    <section class="doc-section">
      <h4>${escapeCaseStudyText(label)}</h4>
      <p>${escapeCaseStudyText(safeValue).replace(/\n/g, "<br />")}</p>
    </section>
  `
}

const renderCaseStudySkillPills = (skills?: ProjectCaseStudySkill[]) => {
  const safeSkills = Array.isArray(skills) ? skills : []
  if (safeSkills.length === 0) return `<p class="muted">Sin skills registradas.</p>`

  return `
    <div class="pill-grid">
      ${safeSkills
        .map((skill) => `<span class="pill">${escapeCaseStudyText(skill.name)}</span>`)
        .join("")}
    </div>
  `
}

const renderCaseStudyAssetList = (assets?: ProjectCaseStudyAsset[]) => {
  const safeAssets = Array.isArray(assets) ? assets : []
  if (safeAssets.length === 0) return ""

  return `
    <section class="evidence-block">
      <h4>Evidencias adjuntas</h4>
      <div class="evidence-list">
        ${safeAssets
          .map((asset) => `
            <a class="evidence-item" href="${escapeCaseStudyText(asset.file_url)}" target="_blank" rel="noopener noreferrer">
              <span class="evidence-type">${escapeCaseStudyText(asset.asset_type || "archivo")}</span>
              <strong>${escapeCaseStudyText(asset.file_name || "Evidencia")}</strong>
              <small>${escapeCaseStudyText(asset.mime_type || "Tipo no identificado")}</small>
            </a>
          `)
          .join("")}
      </div>
    </section>
  `
}

const renderCaseStudyTaskDocumentation = (doc?: ProjectCaseStudyTaskDoc | null) => {
  if (!doc) return `<p class="muted">Subtarea sin documentación detallada.</p>`

  if (doc.document_content_html && doc.document_content_html.trim().length > 0) {
    return `<div class="rich-document">${doc.document_content_html}</div>`
  }

  const fallbackSections = [
    renderCaseStudyPlainSection("Objetivo", doc.objective),
    renderCaseStudyPlainSection("Proceso realizado / bitácora", doc.content),
    renderCaseStudyPlainSection("Notas técnicas", doc.technical_notes),
    renderCaseStudyPlainSection("Problemas encontrados", doc.challenges),
    renderCaseStudyPlainSection("Solución aplicada", doc.solution),
    renderCaseStudyPlainSection("Aprendizajes", doc.learnings),
    renderCaseStudyPlainSection("Resultado final", doc.result_summary),
    renderCaseStudyPlainSection("Links / referencias", doc.reference_links),
  ].filter(Boolean)

  if (fallbackSections.length === 0) {
    return `<p class="muted">Subtarea sin documentación detallada.</p>`
  }

  return fallbackSections.join("")
}

export const generateCaseStudyExportHtml = (caseStudy: ProjectCaseStudyExportDetail) => {
  const plannedStack = (caseStudy.project_stack || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const appliedStack = (caseStudy.task_stack || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  const tasks = Array.isArray(caseStudy.tasks_json) ? caseStudy.tasks_json : []
  const generatedAt = new Date().toLocaleString("es-PE", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  const metrics = [
    ["Score profesional", `${Number(caseStudy.professional_score || 0).toFixed(1)}%`],
    ["Tareas", `${Number(caseStudy.completed_tasks || 0)} / ${Number(caseStudy.total_tasks || 0)}`],
    ["Documentación", `${Number(caseStudy.documentation_percentage || 0)}%`],
    ["Skills aplicadas", `${Number(caseStudy.total_task_skills || 0)}`],
    ["Evidencias", `${Number(caseStudy.total_assets || 0)}`],
    ["Imágenes", `${Number(caseStudy.total_images || 0)}`],
    ["Documentos", `${Number(caseStudy.total_documents || 0)}`],
    ["Cobertura skills", `${Number(caseStudy.skill_coverage_percentage || 0)}%`],
  ]

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeCaseStudyText(caseStudy.project_title || "Caso técnico LifeTrack")}</title>
  <style>
    :root {
      --bg: #f8fafc;
      --ink: #101827;
      --muted: #64748b;
      --line: #dbe3ef;
      --card: #ffffff;
      --orange: #ea580c;
      --amber: #f59e0b;
      --cyan: #0891b2;
      --emerald: #059669;
      --dark: #0f172a;
    }

    * { box-sizing: border-box; }

    html { scroll-behavior: smooth; }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Poppins, Inter, Manrope, "Segoe UI", Arial, sans-serif;
      line-height: 1.65;
    }

    .print-toolbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 14px 22px;
      background: rgba(15, 23, 42, 0.94);
      color: white;
      border-bottom: 1px solid rgba(255,255,255,0.10);
      backdrop-filter: blur(14px);
    }

    .print-toolbar strong {
      font-size: 13px;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .print-toolbar button {
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      background: linear-gradient(135deg, var(--orange), var(--amber));
      color: #111827;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(234, 88, 12, .22);
    }

    .page {
      width: min(1080px, calc(100% - 32px));
      margin: 30px auto 70px;
    }

    .cover {
      overflow: hidden;
      border-radius: 34px;
      background:
        radial-gradient(circle at 10% 0%, rgba(249,115,22,.18), transparent 32%),
        radial-gradient(circle at 88% 12%, rgba(8,145,178,.18), transparent 34%),
        linear-gradient(135deg, #111827, #020617 78%);
      color: white;
      padding: 44px;
      box-shadow: 0 28px 80px rgba(15,23,42,.20);
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 999px;
      padding: 8px 13px;
      color: #fed7aa;
      background: rgba(249,115,22,.08);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .18em;
      text-transform: uppercase;
    }

    h1 {
      max-width: 900px;
      margin: 22px 0 14px;
      font-size: clamp(38px, 6vw, 68px);
      line-height: .96;
      letter-spacing: -.06em;
    }

    .cover-summary {
      max-width: 850px;
      color: #cbd5e1;
      font-size: 15px;
    }

    .meta-grid, .metric-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 28px;
    }

    .meta-card, .metric-card, .stack-card, .task-card {
      border: 1px solid var(--line);
      border-radius: 24px;
      background: var(--card);
      padding: 20px;
      box-shadow: 0 16px 42px rgba(15,23,42,.05);
      break-inside: avoid;
    }

    .cover .meta-card {
      border-color: rgba(255,255,255,.12);
      background: rgba(255,255,255,.06);
      box-shadow: none;
    }

    .label {
      margin: 0;
      color: var(--muted);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .16em;
      text-transform: uppercase;
    }

    .cover .label { color: #94a3b8; }

    .value {
      margin: 8px 0 0;
      font-size: 21px;
      font-weight: 900;
      letter-spacing: -.03em;
    }

    .section {
      margin-top: 34px;
    }

    .section-title {
      margin: 0 0 14px;
      font-size: 23px;
      letter-spacing: -.035em;
    }

    .section-subtitle {
      margin: -7px 0 18px;
      color: var(--muted);
      font-size: 13px;
    }

    .metric-card strong {
      display: block;
      margin-top: 7px;
      font-size: 28px;
      line-height: 1;
      letter-spacing: -.05em;
    }

    .stack-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .pill-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .pill {
      display: inline-flex;
      border: 1px solid rgba(234,88,12,.20);
      border-radius: 999px;
      padding: 7px 11px;
      background: rgba(249,115,22,.07);
      color: #9a3412;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .pill.cyan {
      border-color: rgba(8,145,178,.22);
      background: rgba(8,145,178,.07);
      color: #155e75;
    }

    .task-card {
      margin-top: 18px;
      padding: 28px;
    }

    .task-head {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: flex-start;
      border-bottom: 1px solid var(--line);
      padding-bottom: 18px;
      margin-bottom: 22px;
    }

    .step {
      display: inline-flex;
      border-radius: 999px;
      padding: 6px 10px;
      background: #f1f5f9;
      color: #475569;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .10em;
      text-transform: uppercase;
    }

    .status {
      display: inline-flex;
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(5,150,105,.10);
      color: #047857;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .10em;
      text-transform: uppercase;
    }

    h2 {
      margin: 12px 0 0;
      font-size: 27px;
      line-height: 1.15;
      letter-spacing: -.045em;
    }

    h3 {
      margin: 26px 0 10px;
      color: var(--orange);
      font-size: 15px;
      letter-spacing: .13em;
      text-transform: uppercase;
    }

    .doc-section h4, .evidence-block h4, .rich-document h2 {
      margin: 24px 0 8px;
      border-left: 4px solid var(--orange);
      padding-left: 12px;
      color: #9a3412;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .11em;
      text-transform: uppercase;
    }

    .rich-document h1 {
      color: var(--ink);
      font-size: 30px;
      letter-spacing: -.045em;
    }

    .rich-document p, .doc-section p {
      margin: 10px 0;
      color: #334155;
    }

    .rich-document img {
      max-width: 100%;
      height: auto;
      border-radius: 18px;
      border: 1px solid var(--line);
      margin: 18px 0;
    }

    .rich-document pre {
      overflow-x: auto;
      border-radius: 18px;
      border: 1px solid var(--line);
      background: #0f172a;
      color: #e2e8f0;
      padding: 16px;
    }

    .rich-document blockquote {
      border-left: 4px solid var(--amber);
      margin-left: 0;
      padding: 12px 18px;
      background: #fff7ed;
      color: #7c2d12;
    }

    .evidence-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .evidence-item {
      display: block;
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 14px;
      color: var(--ink);
      text-decoration: none;
      background: #f8fafc;
    }

    .evidence-type {
      display: inline-block;
      margin-bottom: 7px;
      border-radius: 999px;
      padding: 4px 8px;
      background: rgba(8,145,178,.10);
      color: #155e75;
      font-size: 9px;
      font-weight: 900;
      letter-spacing: .10em;
      text-transform: uppercase;
    }

    .evidence-item strong {
      display: block;
      overflow-wrap: anywhere;
    }

    .evidence-item small {
      color: var(--muted);
      overflow-wrap: anywhere;
    }

    .muted { color: var(--muted); }

    .footer-note {
      margin-top: 34px;
      border-top: 1px solid var(--line);
      padding-top: 18px;
      color: var(--muted);
      font-size: 12px;
      text-align: center;
    }

    @media (max-width: 820px) {
      .cover { padding: 28px; border-radius: 26px; }
      .meta-grid, .metric-grid, .stack-grid, .evidence-list { grid-template-columns: 1fr; }
      .task-head { flex-direction: column; }
      .print-toolbar { align-items: flex-start; flex-direction: column; }
    }

    @media print {
      @page {
        size: A4;
        margin: 12mm;
      }

      * {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
      }

      html,
      body {
        width: auto !important;
        min-height: auto !important;
        margin: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        font-size: 11.2pt !important;
        line-height: 1.48 !important;
      }

      .print-toolbar {
        display: none !important;
      }

      .page {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .cover {
        margin: 0 0 10mm !important;
        padding: 20mm 16mm !important;
        border-radius: 16px !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      h1 {
        margin: 12px 0 10px !important;
        font-size: 30pt !important;
        line-height: 1.02 !important;
        letter-spacing: -0.045em !important;
      }

      h2,
      .section-title {
        font-size: 18pt !important;
        line-height: 1.18 !important;
        margin-top: 0 !important;
        page-break-after: avoid;
        break-after: avoid;
      }

      h3,
      .doc-section h4,
      .evidence-block h4,
      .rich-document h2 {
        page-break-after: avoid;
        break-after: avoid;
      }

      .section {
        margin-top: 10mm !important;
        page-break-inside: auto;
        break-inside: auto;
      }

      .meta-grid,
      .metric-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 8px !important;
        margin-top: 14px !important;
      }

      .stack-grid,
      .evidence-list {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }

      .meta-card,
      .metric-card,
      .stack-card,
      .task-card,
      .evidence-item {
        box-shadow: none !important;
        border-color: #cbd5e1 !important;
        background: #ffffff !important;
      }

      .meta-card,
      .metric-card,
      .stack-card {
        padding: 12px !important;
        border-radius: 14px !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .task-card {
        margin-top: 9mm !important;
        padding: 15mm 12mm !important;
        border-radius: 16px !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }

      .task-head {
        display: block !important;
        padding-bottom: 10px !important;
        margin-bottom: 12px !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .step,
      .status,
      .pill,
      .evidence-type {
        border-color: #fed7aa !important;
        background: #fff7ed !important;
        color: #9a3412 !important;
      }

      .pill-grid {
        gap: 6px !important;
      }

      .pill {
        padding: 5px 8px !important;
        font-size: 8.5pt !important;
      }

      .value,
      .metric-card strong {
        font-size: 17pt !important;
      }

      .label {
        font-size: 7.8pt !important;
        letter-spacing: .10em !important;
      }

      .cover-summary,
      .section-subtitle,
      .rich-document p,
      .doc-section p,
      .muted {
        font-size: 10.5pt !important;
        color: #334155 !important;
      }

      .rich-document {
        overflow: visible !important;
      }

      .rich-document h1 {
        font-size: 20pt !important;
        line-height: 1.15 !important;
        color: #0f172a !important;
      }

      .rich-document img {
        display: block !important;
        max-width: 100% !important;
        max-height: 150mm !important;
        width: auto !important;
        height: auto !important;
        margin: 10px auto !important;
        border-radius: 10px !important;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .rich-document pre {
        white-space: pre-wrap !important;
        word-break: break-word !important;
        overflow: visible !important;
        border-radius: 10px !important;
        background: #0f172a !important;
        color: #e2e8f0 !important;
        page-break-inside: auto;
        break-inside: auto;
      }

      .rich-document blockquote {
        background: #fff7ed !important;
        color: #7c2d12 !important;
      }

      .doc-section,
      .evidence-block {
        page-break-inside: auto;
        break-inside: auto;
      }

      .evidence-item,
      .evidence-item strong,
      .evidence-item small,
      a {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
      }

      .footer-note {
        margin-top: 8mm !important;
        font-size: 9pt !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <strong>LifeTrack · Caso técnico exportable</strong>
    <button onclick="window.print()">Imprimir / Guardar como PDF</button>
  </div>

  <main class="page">
    <section class="cover">
      <span class="eyebrow">Caso técnico profesional · Portafolio</span>
      <h1>${escapeCaseStudyText(caseStudy.project_title || "Proyecto LifeTrack")}</h1>
      <p class="cover-summary">
        ${escapeCaseStudyText(caseStudy.project_description || caseStudy.project_summary || "Caso técnico generado desde LifeTrack con subtareas, documentación, skills y evidencias registradas.")}
      </p>

      <div class="meta-grid">
        <div class="meta-card"><p class="label">Estado</p><p class="value">${escapeCaseStudyText(caseStudy.project_status || "No definido")}</p></div>
        <div class="meta-card"><p class="label">Prioridad</p><p class="value">${escapeCaseStudyText(caseStudy.project_priority || "No definida")}</p></div>
        <div class="meta-card"><p class="label">Inicio</p><p class="value">${escapeCaseStudyText(formatCaseStudyDate(caseStudy.start_date))}</p></div>
        <div class="meta-card"><p class="label">Generado</p><p class="value">${escapeCaseStudyText(generatedAt)}</p></div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Resumen ejecutivo</h2>
      <p class="section-subtitle">Indicadores principales del proyecto consolidado como evidencia profesional.</p>
      <div class="metric-grid">
        ${metrics.map(([label, value]) => `
          <div class="metric-card">
            <p class="label">${escapeCaseStudyText(label)}</p>
            <strong>${escapeCaseStudyText(value)}</strong>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Stack tecnológico</h2>
      <p class="section-subtitle">Comparación entre el stack planificado del proyecto y el stack realmente aplicado en subtareas.</p>
      <div class="stack-grid">
        <div class="stack-card">
          <h3>Stack planificado</h3>
          <div class="pill-grid">
            ${plannedStack.length === 0 ? `<p class="muted">Sin stack planificado.</p>` : plannedStack.map((item) => `<span class="pill">${escapeCaseStudyText(item)}</span>`).join("")}
          </div>
        </div>
        <div class="stack-card">
          <h3>Stack aplicado</h3>
          <div class="pill-grid">
            ${appliedStack.length === 0 ? `<p class="muted">Sin stack aplicado.</p>` : appliedStack.map((item) => `<span class="pill cyan">${escapeCaseStudyText(item)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Desarrollo documentado por subtareas</h2>
      <p class="section-subtitle">Detalle del proceso técnico registrado dentro del módulo Data & Carrera.</p>

      ${tasks.length === 0 ? `<div class="task-card"><p class="muted">Este proyecto todavía no tiene subtareas registradas.</p></div>` : tasks.map((task, index) => `
        <article class="task-card">
          <div class="task-head">
            <div>
              <span class="step">Subtarea ${index + 1}</span>
              <h2>${escapeCaseStudyText(task.task_title || "Subtarea")}</h2>
            </div>
            <div>
              <span class="status">${escapeCaseStudyText(task.task_status || "Sin estado")}</span>
            </div>
          </div>

          <section>
            <h3>Skills aplicadas</h3>
            ${renderCaseStudySkillPills(task.skills)}
          </section>

          <section>
            <h3>Documentación técnica</h3>
            ${renderCaseStudyTaskDocumentation(task.documentation)}
          </section>

          ${renderCaseStudyAssetList(task.assets)}
        </article>
      `).join("")}
    </section>

    <p class="footer-note">
      Documento generado desde LifeTrack Personal OS. Este caso técnico consolida información registrada en proyectos, subtareas, documentación, skills y evidencias del módulo Data & Carrera.
    </p>
  </main>
</body>
</html>`
}
