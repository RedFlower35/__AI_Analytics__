/**
 * 輕量且功能完整的 CSV 解析器，支援雙引號欄位
 */
export function parseCsv(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "\n" && !insideQuotes) {
      lines.push(currentLine);
      currentLine = "";
    } else if (char === "\r" && !insideQuotes) {
      if (nextChar === "\n") {
        i++;
      }
      lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const validLines = lines.filter((line) => line.trim() !== "");
  if (validLines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        result.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    result.push(currentCell.trim());
    return result;
  };

  const headers = parseLine(validLines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < validLines.length; i++) {
    const cells = parseLine(validLines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = cells[index] !== undefined ? cells[index] : "";
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * 格式化檔案大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
