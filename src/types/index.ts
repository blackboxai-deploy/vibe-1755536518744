// TypeScript type definitions for the website content to AI images generator

export interface ExtractedContent {
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  url: string;
  summary: string;
}

export interface ImageGenerationRequest {
  content: ExtractedContent;
  systemPrompt?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
}

export interface ContentExtractionResponse {
  success: boolean;
  content?: ExtractedContent;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface LoadingState {
  isExtracting: boolean;
  isGenerating: boolean;
  progress: number;
  currentStep: string;
}

// AI API configuration types
export interface AIApiConfig {
  endpoint: string;
  headers: {
    CustomerId: string;
    'Content-Type': string;
    Authorization: string;
  };
  model: string;
  timeout: number;
}

// Form validation schemas
export interface UrlFormData {
  url: string;
  systemPrompt?: string;
}