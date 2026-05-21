export interface CsvTemplate {
  id: string;
  name: string;
  description: string;
  data: string;
  customPrompt?: string;
  category: string;
}

export interface AnalysisHistory {
  id: string;
  timestamp: string;
  name: string;
  csvSize: number;
  csvData: string;
  result: string;
  customInstructions?: string;
}

export interface CsvParsedData {
  headers: string[];
  rows: Record<string, string>[];
}
