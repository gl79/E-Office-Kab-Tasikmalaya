import { formatDateShort } from './dateFormatter';

interface ExportPdfOptions<T> {
    title: string;
    columns: { header: string; render: (item: T, index: number) => string }[];
    data: T[];
    filterInfo?: string[];
    userName: string;
}

const escapeHtml = (str: string): string =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Opens a print-ready PDF report in a new browser tab.
 */
export function exportToPrintWindow<T>({ title, columns, data, filterInfo = [], userName }: ExportPdfOptions<T>): void {
    if (data.length === 0) return;

    const headers = columns.map(c => `<th>${c.header}</th>`).join('');
    const rows = data.map((item, index) =>
        `<tr>${columns.map(c => `<td>${c.render(item, index)}</td>`).join('')}</tr>`
    ).join('');

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${title}</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 1cm; }
    body { font-family: Arial, sans-serif; font-size: 10px; padding: 16px; }
    .header { text-align: center; margin-bottom: 14px; border-bottom: 3px double #000; padding-bottom: 10px; }
    .header h1 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { font-size: 14px; text-transform: uppercase; margin-top: 4px; font-weight: bold; }
    .meta { margin-bottom: 10px; font-size: 9px; color: #555; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #555; padding: 5px 7px; text-align: left; vertical-align: top; }
    th { background: #e8e8e8; font-size: 9px; text-transform: uppercase; text-align: center; font-weight: bold; white-space: nowrap; }
    td:first-child { text-align: center; width: 28px; }
    td small { color: #666; font-size: 9px; }
    .footer { margin-top: 14px; font-size: 9px; color: #888; display: flex; justify-content: space-between; }
    @media print { body { padding: 0; } }
</style>
</head><body>
<div class="header">
    <h1>Pemerintah Kabupaten Tasikmalaya</h1>
    <h2>${title}</h2>
</div>
${filterInfo.length > 0 ? `<div class="meta">Filter: ${filterInfo.join(' | ')}</div>` : ''}
<div class="meta">Total: ${data.length} data</div>
<table>
    <thead><tr>${headers}</tr></thead>
    <tbody>${rows}</tbody>
</table>
<div class="footer">
    <span>Dicetak pada: ${new Date().toLocaleString('id-ID')}</span>
    <span>Dicetak oleh: ${userName}</span>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
}

export { escapeHtml };
