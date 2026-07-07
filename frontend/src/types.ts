export interface Match {
  filename: string;
  project: string;
  similarity_score: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  file: File;
}