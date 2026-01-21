// ============================================
// QuestModal - Markdown to HTML Utility
// Pfad: src/components/QuestModal/utils/markdownToHtml.ts
// ============================================

/**
 * Konvertiert Markdown-Text zu HTML
 * Unterstützt: Bold, Italic, Blockquotes, Tabellen, HTML-Blöcke
 */
export function markdownToHtml(text: string): string {
  // HTML-Blöcke temporär extrahieren
  const htmlBlocks: string[] = [];
  let processedText = text.replace(/<div[\s\S]*?<\/div>/g, (match) => {
    htmlBlocks.push(match);
    return `__HTML_BLOCK_${htmlBlocks.length - 1}__`;
  });

  let html = processedText
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  // HTML-Blöcke wieder einfügen
  htmlBlocks.forEach((block, idx) => {
    html = html.replace(`__HTML_BLOCK_${idx}__`, block);
  });

  // Tabellen parsen
  const tableRegex = /\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
  html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter((h: string) => h);
    const rows = bodyRows.trim().split('<br/>').filter((r: string) => r.includes('|'));

    let table = '<table><thead><tr>';
    headers.forEach((h: string) => { table += `<th>${h}</th>`; });
    table += '</tr></thead><tbody>';

    rows.forEach((row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter((c: string) => c);
      table += '<tr>';
      cells.forEach((c: string) => { table += `<td>${c}</td>`; });
      table += '</tr>';
    });

    table += '</tbody></table>';
    return table;
  });

  return html;
}
