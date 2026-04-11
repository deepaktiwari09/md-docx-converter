export interface ConversionResult {
  input: string;
  output: string;
  success: boolean;
  error: string | null;
}

export interface HistoryEntry {
  id: string;
  input_path: string;
  output_path: string;
  direction: 'md_to_docx' | 'docx_to_md';
  success: boolean;
  error: string | null;
  timestamp: string;
  input_filename: string;
  output_filename: string;
}

export type QueueItemStatus = 'pending' | 'converting' | 'done' | 'error';

export interface QueueItem {
  id: string;
  inputPath: string;
  outputPath: string;
  toDocx: boolean;
  status: QueueItemStatus;
  result: ConversionResult | null;
  error: string | null;
}
