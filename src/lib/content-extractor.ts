import * as cheerio from 'cheerio';
import { ExtractedContent } from '@/types';

export class ContentExtractor {
  private static readonly MAX_CONTENT_LENGTH = 5000;
  private static readonly MIN_PARAGRAPH_LENGTH = 50;

  static async extractFromUrl(url: string): Promise<ExtractedContent> {
    try {
      // Validate URL
      const validUrl = this.validateAndNormalizeUrl(url);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Fetch the webpage
      const response = await fetch(validUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.extractContentFromHtml(html, validUrl);
    } catch (error) {
      throw new Error(`Failed to extract content from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static extractContentFromHtml(html: string, url: string): ExtractedContent {
    const $ = cheerio.load(html);
    
    // Remove unwanted elements
    $('script, style, nav, footer, aside, .advertisement, .ads, .cookie-banner').remove();
    
    // Extract title
    const title = this.extractTitle($);
    
    // Extract meta description
    const description = this.extractDescription($);
    
    // Extract headings
    const headings = this.extractHeadings($);
    
    // Extract paragraphs
    const paragraphs = this.extractParagraphs($);
    
    // Create summary
    const summary = this.createSummary(title, description, headings, paragraphs);

    return {
      title,
      description,
      headings,
      paragraphs,
      url,
      summary
    };
  }

  private static validateAndNormalizeUrl(url: string): string {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  private static extractTitle($: cheerio.CheerioAPI): string {
    // Try multiple selectors for title
    const titleSelectors = [
      'title',
      'h1',
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      '.title',
      '.page-title'
    ];

    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = selector.includes('meta') 
          ? element.attr('content') 
          : element.text();
        if (text && text.trim().length > 0) {
          return text.trim().substring(0, 200);
        }
      }
    }

    return 'Website Content';
  }

  private static extractDescription($: cheerio.CheerioAPI): string {
    // Try multiple selectors for description
    const descSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      '.description',
      '.summary'
    ];

    for (const selector of descSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = selector.includes('meta') 
          ? element.attr('content') 
          : element.text();
        if (text && text.trim().length > 0) {
          return text.trim().substring(0, 500);
        }
      }
    }

    return '';
  }

  private static extractHeadings($: cheerio.CheerioAPI): string[] {
    const headings: string[] = [];
    
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 0 && text.length < 200) {
        headings.push(text);
      }
    });

    return headings.slice(0, 10); // Limit to top 10 headings
  }

  private static extractParagraphs($: cheerio.CheerioAPI): string[] {
    const paragraphs: string[] = [];
    
    $('p, .content p, article p, main p').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length >= this.MIN_PARAGRAPH_LENGTH && text.length < 1000) {
        paragraphs.push(text);
      }
    });

    return paragraphs.slice(0, 15); // Limit to top 15 paragraphs
  }

  private static createSummary(
    title: string, 
    description: string, 
    headings: string[], 
    paragraphs: string[]
  ): string {
    const parts: string[] = [];
    
    if (title) parts.push(title);
    if (description) parts.push(description);
    
    // Add top headings
    headings.slice(0, 3).forEach(heading => parts.push(heading));
    
    // Add key paragraphs
    paragraphs.slice(0, 2).forEach(paragraph => {
      // Truncate long paragraphs
      const truncated = paragraph.length > 300 
        ? paragraph.substring(0, 300) + '...' 
        : paragraph;
      parts.push(truncated);
    });

    const summary = parts.join(' ').substring(0, this.MAX_CONTENT_LENGTH);
    return summary || 'No meaningful content extracted';
  }

  static generateImagePrompts(content: ExtractedContent): string[] {
    const baseThemes = [
      'modern minimalist design',
      'vibrant colorful illustration',
      'professional corporate style',
      'artistic creative interpretation',
      'natural organic aesthetic'
    ];

    const prompts: string[] = [];
    const contentKeywords = this.extractKeywords(content);

    baseThemes.forEach((theme, index) => {
      const keywords = contentKeywords.slice(index * 3, (index * 3) + 3).join(', ');
      const prompt = `${theme} inspired by: ${content.title}. ${keywords}. High quality, detailed, professional composition.`;
      prompts.push(prompt);
    });

    return prompts;
  }

  private static extractKeywords(content: ExtractedContent): string[] {
    const text = [content.title, content.description, ...content.headings].join(' ').toLowerCase();
    
    // Simple keyword extraction (in real app, you might use NLP libraries)
    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word))
      .slice(0, 20);

    return [...new Set(words)]; // Remove duplicates
  }

  private static isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'by', 'words', 'with', 'this', 'that', 'from', 'they', 'were', 'been', 'have', 'your', 'more', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'many', 'some', 'what', 'than', 'them', 'very', 'when', 'much', 'before', 'right', 'too', 'any', 'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'also', 'around', 'form', 'three', 'small', 'set', 'put', 'end', 'why', 'again', 'turn', 'here', 'how', 'go', 'see', 'get', 'may', 'say', 'part', 'over', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'year', 'live', 'me', 'back', 'give', 'most', 'very', 'good', 'just', 'name', 'sentence', 'man', 'think', 'where', 'help', 'through', 'much', 'before', 'line', 'right', 'too', 'mean', 'old', 'any', 'same', 'tell', 'boy', 'follow', 'came', 'want', 'show'
    ];
    return stopWords.includes(word.toLowerCase());
  }
}