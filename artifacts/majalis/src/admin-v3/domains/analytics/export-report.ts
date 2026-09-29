/** Client-side export of aggregated analytics (no PII). */

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function flattenSection(sectionId: string, section: Record<string, unknown>): string[][] {
  const rows: string[][] = [["section", "field", "status", "value", "note"]];
  const metrics = (section.metrics || {}) as Record<string, { status?: string; value?: unknown; reason?: string; label?: string }>;
  for (const [key, cell] of Object.entries(metrics)) {
    rows.push([
      sectionId,
      key,
      String(cell?.status ?? ""),
      cell?.status === "ok" ? String(cell.value ?? "") : "",
      String(cell?.reason || cell?.label || ""),
    ]);
  }
  const lists = ["top_queries", "zero_result_queries", "top_cities", "top_lessons", "top_topics"] as const;
  for (const listKey of lists) {
    const list = section[listKey];
    if (!Array.isArray(list)) continue;
    list.forEach((item, i) => {
      rows.push([
        sectionId,
        `${listKey}[${i}]`,
        "ok",
        JSON.stringify(item),
        "",
      ]);
    });
  }
  if (rows.length === 1) {
    rows.push([sectionId, "section_status", String(section.status || ""), "", String(section.label || section.reason || "")]);
  }
  return rows;
}

function toCsv(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(","),
    )
    .join("\n");
}

export function exportAnalyticsJson(payload: unknown, sectionId?: string) {
  const data =
    sectionId && payload && typeof payload === "object" && "sections" in (payload as object)
      ? { section: sectionId, data: (payload as { sections: Record<string, unknown> }).sections[sectionId] }
      : payload;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  downloadBlob(
    `sunnah-analytics-${sectionId || "full"}-${stamp}.json`,
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" }),
  );
}

export function exportAnalyticsCsv(payload: { sections?: Record<string, Record<string, unknown>> }, sectionId?: string) {
  const sections = payload.sections || {};
  const ids = sectionId ? [sectionId] : Object.keys(sections);
  const rows: string[][] = [];
  for (const id of ids) {
    const part = flattenSection(id, sections[id] || {});
    if (rows.length === 0) rows.push(...part);
    else rows.push(...part.slice(1));
  }
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const bom = String.fromCharCode(0xfeff);
  downloadBlob(
    `sunnah-analytics-${sectionId || "full"}-${stamp}.csv`,
    new Blob([bom + toCsv(rows)], { type: "text/csv;charset=utf-8" }),
  );
}

/** Excel-friendly workbook via SpreadsheetML (no new dependency). */
export function exportAnalyticsExcel(payload: { sections?: Record<string, Record<string, unknown>> }, sectionId?: string) {
  const sections = payload.sections || {};
  const ids = sectionId ? [sectionId] : Object.keys(sections);
  const rows: string[][] = [];
  for (const id of ids) {
    const part = flattenSection(id, sections[id] || {});
    if (rows.length === 0) rows.push(...part);
    else rows.push(...part.slice(1));
  }
  const xmlRows = rows
    .map(
      (r) =>
        `<Row>${r.map((c) => `<Cell><Data ss:Type="String">${escapeXml(String(c ?? ""))}</Data></Cell>`).join("")}</Row>`,
    )
    .join("");
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Analytics"><Table>${xmlRows}</Table></Worksheet>
</Workbook>`;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  downloadBlob(
    `sunnah-analytics-${sectionId || "full"}-${stamp}.xls`,
    new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" }),
  );
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
