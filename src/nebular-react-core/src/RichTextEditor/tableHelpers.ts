/**
 * Pure string helpers used by the RichTextEditor table actions.
 *
 * They intentionally work on HTML strings so they can be unit tested without a
 * DOM and reused when a table is edited in place inside the contentEditable
 * element (`table.outerHTML` is passed in and the result replaces the element).
 */

export interface InsertTableOptions {
  /** Total number of rows, including the header row. Defaults to 3. */
  rows?: number;
  /** Number of columns. Defaults to 3. */
  columns?: number;
  /** Character offset where the table should be inserted. Defaults to the end. */
  at?: number;
}

export interface TableRowOptions {
  /** Index of the target table. Negative values count from the end. Defaults to the last table. */
  tableIndex?: number;
  /** Zero-based insertion/removal index inside the table body. */
  rowIndex?: number;
}

export interface TableColumnOptions {
  /** Index of the target table. Negative values count from the end. Defaults to the last table. */
  tableIndex?: number;
  /** Zero-based insertion/removal index of the column. */
  columnIndex?: number;
}

interface TableBounds {
  start: number;
  end: number;
}

interface RowMatch {
  start: number;
  end: number;
  html: string;
}

interface CellMatch {
  start: number;
  end: number;
  html: string;
  tag: 'th' | 'td';
}

const MIN_DIMENSION = 1;
const MAX_DIMENSION = 20;
const ROW_SOURCE = '<tr\\b[^>]*>[\\s\\S]*?<\\/tr\\s*>';
const CELL_SOURCE = '<(th|td)\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>';

function toDimension(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(Math.round(value), MIN_DIMENSION), MAX_DIMENSION);
}

function toIndex(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.round(value);
}

function buildBodyRow(columns: number): string {
  return `<tr>${'<td><br></td>'.repeat(Math.max(columns, 1))}</tr>`;
}

function buildTableHtml(rows: number, columns: number): string {
  const headers = Array.from(
    { length: columns },
    (_, index) => `<th scope="col">Header ${index + 1}</th>`
  ).join('');
  const bodyRows = Math.max(rows - 1, 0);
  const body = Array.from({ length: bodyRows }, () => buildBodyRow(columns)).join('');

  return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
}

function findTableBounds(html: string, tableIndex = -1): TableBounds | null {
  const lower = html.toLowerCase();
  const bounds: TableBounds[] = [];
  let searchFrom = 0;

  while (searchFrom < lower.length) {
    const start = lower.indexOf('<table', searchFrom);

    if (start === -1) {
      break;
    }

    const nextCharacter = lower[start + '<table'.length];

    if (nextCharacter && /[a-z0-9-]/.test(nextCharacter)) {
      searchFrom = start + '<table'.length;
    } else {
      const openEnd = lower.indexOf('>', start);

      if (openEnd === -1) {
        break;
      }

      const end = lower.indexOf('</table>', openEnd + 1);

      if (end === -1) {
        break;
      }

      bounds.push({ start, end: end + '</table>'.length });
      searchFrom = end + '</table>'.length;
    }
  }

  if (bounds.length === 0) {
    return null;
  }

  const index = tableIndex < 0 ? bounds.length + tableIndex : tableIndex;

  return bounds[index] ?? null;
}

function mutateTable(
  html: string,
  tableIndex: number,
  transform: (tableHtml: string) => string
): string {
  const bounds = findTableBounds(html, tableIndex);

  if (!bounds) {
    return html;
  }

  const tableHtml = html.slice(bounds.start, bounds.end);
  const nextTableHtml = transform(tableHtml);

  if (nextTableHtml === tableHtml) {
    return html;
  }

  return `${html.slice(0, bounds.start)}${nextTableHtml}${html.slice(bounds.end)}`;
}

function findRows(html: string): RowMatch[] {
  const pattern = new RegExp(ROW_SOURCE, 'gi');
  const rows: RowMatch[] = [];
  let match = pattern.exec(html);

  while (match) {
    rows.push({ start: match.index, end: match.index + match[0].length, html: match[0] });
    match = pattern.exec(html);
  }

  return rows;
}

function findCells(rowHtml: string): CellMatch[] {
  const pattern = new RegExp(CELL_SOURCE, 'gi');
  const cells: CellMatch[] = [];
  let match = pattern.exec(rowHtml);

  while (match) {
    cells.push({
      start: match.index,
      end: match.index + match[0].length,
      html: match[0],
      tag: match[1].toLowerCase() === 'th' ? 'th' : 'td'
    });
    match = pattern.exec(rowHtml);
  }

  return cells;
}

function mapRows(tableHtml: string, mapper: (rowHtml: string, rowIndex: number) => string): string {
  const rows = findRows(tableHtml);
  let result = tableHtml;

  // Replace from the end so the offsets of the remaining rows stay valid.
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    const nextRowHtml = mapper(row.html, index);

    if (nextRowHtml !== row.html) {
      result = `${result.slice(0, row.start)}${nextRowHtml}${result.slice(row.end)}`;
    }
  }

  return result;
}

function findTbodyBounds(tableHtml: string): TableBounds | null {
  const open = /<tbody\b[^>]*>/i.exec(tableHtml);

  if (!open) {
    return null;
  }

  const start = open.index + open[0].length;
  const close = tableHtml.toLowerCase().indexOf('</tbody', start);

  if (close === -1) {
    return null;
  }

  return { start, end: close };
}

function countColumns(tableHtml: string): number {
  const [firstRow] = findRows(tableHtml);

  return firstRow ? findCells(firstRow.html).length : 0;
}

/**
 * Inserts an accessible table (with a `<thead>` and `scope="col"` headers) into
 * an HTML string. `rows` includes the header row.
 */
export function insertTable(
  html: string,
  options: InsertTableOptions | number = {},
  fallbackColumns?: number
): string {
  let rows = 3;
  let columns = 3;
  let at: number | undefined;

  if (typeof options === 'number') {
    rows = options;
    columns = fallbackColumns ?? 3;
  } else {
    rows = options.rows ?? 3;
    columns = options.columns ?? 3;
    at = options.at;
  }

  const tableHtml = buildTableHtml(toDimension(rows, 3), toDimension(columns, 3));
  const position =
    at === undefined || !Number.isFinite(at)
      ? html.length
      : Math.min(Math.max(Math.round(at), 0), html.length);

  return `${html.slice(0, position)}${tableHtml}${html.slice(position)}`;
}

/**
 * Adds a row to the table body. By default the row is appended; pass `rowIndex`
 * to insert before that body row.
 */
export function addTableRow(html: string, options: TableRowOptions | number = {}): string {
  const { tableIndex = -1, rowIndex } =
    typeof options === 'number' ? { rowIndex: options } : options;

  return mutateTable(html, tableIndex, (tableHtml) => {
    const tbody = findTbodyBounds(tableHtml);
    const rowHtml = buildBodyRow(Math.max(countColumns(tableHtml), 1));

    if (!tbody) {
      const close = tableHtml.toLowerCase().lastIndexOf('</table');

      if (close === -1) {
        return tableHtml;
      }

      return `${tableHtml.slice(0, close)}<tbody>${rowHtml}</tbody>${tableHtml.slice(close)}`;
    }

    const inner = tableHtml.slice(tbody.start, tbody.end);
    const rows = findRows(inner);
    const rawIndex = toIndex(rowIndex, rows.length);
    const index = Math.min(Math.max(rawIndex, 0), rows.length);
    const position = index >= rows.length ? inner.length : rows[index].start;

    return `${tableHtml.slice(0, tbody.start)}${inner.slice(0, position)}${rowHtml}${inner.slice(
      position
    )}${tableHtml.slice(tbody.end)}`;
  });
}

/**
 * Removes a row from the table body. By default the last body row is removed.
 */
export function removeTableRow(html: string, options: TableRowOptions | number = {}): string {
  const { tableIndex = -1, rowIndex } =
    typeof options === 'number' ? { rowIndex: options } : options;

  return mutateTable(html, tableIndex, (tableHtml) => {
    const tbody = findTbodyBounds(tableHtml);

    if (!tbody) {
      return tableHtml;
    }

    const inner = tableHtml.slice(tbody.start, tbody.end);
    const rows = findRows(inner);

    if (rows.length === 0) {
      return tableHtml;
    }

    const rawIndex = rowIndex === undefined ? rows.length - 1 : toIndex(rowIndex, rows.length - 1);
    const index = Math.min(Math.max(rawIndex, 0), rows.length - 1);
    const target = rows[index];

    return `${tableHtml.slice(0, tbody.start)}${inner.slice(0, target.start)}${inner.slice(
      target.end
    )}${tableHtml.slice(tbody.end)}`;
  });
}

/**
 * Adds a column to every row (header included). By default the column is
 * appended; pass `columnIndex` to insert before that column.
 */
export function addTableColumn(html: string, options: TableColumnOptions | number = {}): string {
  const { tableIndex = -1, columnIndex } =
    typeof options === 'number' ? { columnIndex: options } : options;

  return mutateTable(html, tableIndex, (tableHtml) => {
    const columnCount = countColumns(tableHtml);

    if (columnCount === 0) {
      return tableHtml;
    }

    const rawIndex = columnIndex === undefined ? columnCount : toIndex(columnIndex, columnCount);
    const column = Math.min(Math.max(rawIndex, 0), columnCount);

    return mapRows(tableHtml, (rowHtml) => {
      const cells = findCells(rowHtml);

      if (cells.length === 0) {
        return rowHtml;
      }

      const index = Math.min(column, cells.length);
      const isHeader = cells.some((cell) => cell.tag === 'th');
      const cellHtml = isHeader ? '<th scope="col"><br></th>' : '<td><br></td>';
      const position = index < cells.length ? cells[index].start : cells[cells.length - 1].end;

      return `${rowHtml.slice(0, position)}${cellHtml}${rowHtml.slice(position)}`;
    });
  });
}

/**
 * Removes a column from every row (header included). By default the last column
 * is removed. A table always keeps at least one column.
 */
export function removeTableColumn(html: string, options: TableColumnOptions | number = {}): string {
  const { tableIndex = -1, columnIndex } =
    typeof options === 'number' ? { columnIndex: options } : options;

  return mutateTable(html, tableIndex, (tableHtml) => {
    const columnCount = countColumns(tableHtml);

    if (columnCount <= 1) {
      return tableHtml;
    }

    const rawIndex = columnIndex === undefined ? columnCount - 1 : toIndex(columnIndex, 0);
    const column = Math.min(Math.max(rawIndex, 0), columnCount - 1);

    return mapRows(tableHtml, (rowHtml) => {
      const target = findCells(rowHtml)[column];

      if (!target) {
        return rowHtml;
      }

      return `${rowHtml.slice(0, target.start)}${rowHtml.slice(target.end)}`;
    });
  });
}
