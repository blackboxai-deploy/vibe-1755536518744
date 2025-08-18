import { ExtractedContent, GeneratedImage, AIApiConfig } from '@/types';

export class ImageGenerator {
  private static readonly API_CONFIG: AIApiConfig = {
    endpoint: 'https://oi-server.onrender.com/chat/completions',
    headers: {
      'CustomerId': 'cus_SGPn4uhjPI0F4w',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer xxx'
    },
    model: 'replicate/black-forest-labs/flux-1.1-pro',
    timeout: 300000 // 5 minutes
  };

  static readonly DEFAULT_SYSTEM_PROMPT = `You are an AI image generation assistant. Based on website content provided, generate high-quality, diverse images that represent the content's themes and concepts. Create visually appealing images that capture the essence of the content while maintaining professional quality and artistic variety.

Instructions:
- Generate exactly 5 unique image prompts based on the content
- Each prompt should have a different visual style or perspective
- Focus on key themes, concepts, and visual elements from the content
- Ensure prompts are detailed and specific for high-quality generation
- Avoid inappropriate or copyrighted content

Return only the image URLs separated by newlines, no additional text.`;

  static async generateImages(
    content: ExtractedContent, 
    systemPrompt?: string
  ): Promise<GeneratedImage[]> {
    try {
      const prompts = this.createDiversePrompts(content);
      const images: GeneratedImage[] = [];

      // Generate images in parallel for better performance
      const imagePromises = prompts.map(async (prompt, index) => {
        try {
          const imageUrl = await this.generateSingleImage(prompt, systemPrompt);
          return {
            id: `img_${Date.now()}_${index}`,
            url: imageUrl,
            prompt,
            timestamp: Date.now()
          };
        } catch (error) {
          console.error(`Failed to generate image ${index + 1}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(imagePromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          images.push(result.value);
        }
      });

      if (images.length === 0) {
        throw new Error('Failed to generate any images');
      }

      return images;
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async generateSingleImage(
    prompt: string, 
    systemPrompt?: string
  ): Promise<string> {
    const requestBody = {
      model: this.API_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt || this.DEFAULT_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Generate a high-quality image: ${prompt}`
        }
      ]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_CONFIG.timeout);

    try {
      const response = await fetch(this.API_CONFIG.endpoint, {
        method: 'POST',
        headers: this.API_CONFIG.headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Extract image URL from response
      const imageUrl = this.extractImageUrl(data);
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      return imageUrl;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Image generation timed out');
      }
      throw error;
    }
  }

  private static extractImageUrl(response: unknown): string | null {
    // Handle different response formats from AI APIs
    const responseObj = response as Record<string, unknown>;
    
    if (responseObj.choices && Array.isArray(responseObj.choices) && responseObj.choices[0]) {
      const choice = responseObj.choices[0] as Record<string, unknown>;
      const message = choice.message as Record<string, unknown> | undefined;
      const content = message?.content || choice.content;
      if (typeof content === 'string') {
        // Look for URLs in the response
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = content.match(urlRegex);
        if (urls && urls.length > 0) {
          return urls[0];
        }
      }
    }

    // Handle direct URL response
    if (typeof responseObj.url === 'string') {
      return responseObj.url;
    }

    // Handle data URL response
    if (responseObj.data && Array.isArray(responseObj.data) && responseObj.data[0]) {
      const firstData = responseObj.data[0] as Record<string, unknown>;
      if (typeof firstData.url === 'string') {
        return firstData.url;
      }
    }

    return null;
  }

  private static createDiversePrompts(content: ExtractedContent): string[] {
    const prompts: string[] = [];
    const title = content.title || 'Website Content';
    const description = content.description || '';
    const keywords = this.extractKeywords(content);

    // Prompt 1: Hero/Banner style
    prompts.push(
      `Modern hero banner design representing "${title}". ${description}. Professional, clean aesthetic with bold typography and stunning visuals. High resolution, web-ready design.`
    );

    // Prompt 2: Artistic interpretation
    prompts.push(
      `Artistic illustration inspired by "${title}". Creative interpretation of ${keywords.slice(0, 3).join(', ')}. Vibrant colors, unique composition, artistic flair.`
    );

    // Prompt 3: Minimal/Corporate
    prompts.push(
      `Minimalist corporate design for "${title}". Clean lines, professional color scheme, modern typography. Focus on ${keywords.slice(3, 6).join(', ')}. Business-appropriate aesthetic.`
    );

    // Prompt 4: Conceptual/Abstract
    prompts.push(
      `Abstract conceptual artwork representing the essence of "${title}". Creative visual metaphors for ${keywords.slice(6, 9).join(', ')}. Thought-provoking, contemporary design.`
    );

    // Prompt 5: Realistic/Photographic
    prompts.push(
      `High-quality photographic composition related to "${title}". Realistic imagery showcasing ${keywords.slice(9, 12).join(', ')}. Professional photography style, excellent lighting and composition.`
    );

    return prompts;
  }

  private static extractKeywords(content: ExtractedContent): string[] {
    const allText = [
      content.title,
      content.description,
      ...content.headings.slice(0, 5),
      ...content.paragraphs.slice(0, 3)
    ].join(' ').toLowerCase();

    // Extract meaningful keywords
    const words = allText
      .split(/[^a-zA-Z0-9]+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word))
      .filter(word => this.isVisualKeyword(word));

    // Remove duplicates and limit
    return [...new Set(words)].slice(0, 15);
  }

  private static isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'was', 'one', 'our', 'had', 
      'words', 'with', 'this', 'that', 'from', 'they', 'were', 'been', 'have', 'your', 'more', 
      'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 
      'other', 'after', 'first', 'well', 'many', 'some', 'what', 'than', 'them', 'very', 'when', 
      'much', 'before', 'right', 'also', 'around', 'form', 'three', 'small', 'here', 'know'
    ];
    return stopWords.includes(word.toLowerCase());
  }

  private static isVisualKeyword(word: string): boolean {
    // Filter out purely technical or non-visual terms
    const nonVisualTerms = [
      'function', 'method', 'class', 'variable', 'return', 'string', 'number', 'boolean',
      'array', 'object', 'null', 'undefined', 'console', 'document', 'window', 'event',
      'click', 'load', 'error', 'success', 'status', 'response', 'request', 'data',
      'type', 'interface', 'component', 'props', 'state', 'hook', 'effect', 'render'
    ];
    
    return !nonVisualTerms.includes(word.toLowerCase()) && word.length <= 20;
  }

  static validateImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}