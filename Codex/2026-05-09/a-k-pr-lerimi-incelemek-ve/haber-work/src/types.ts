export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  date: string;
  image: string | null;
  source: string;
  url: string;
  isNew?: boolean;
  hasImageError?: boolean;
  isAiSummarized?: boolean;
}
