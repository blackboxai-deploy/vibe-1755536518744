import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ImageGenerator } from '@/lib/image-generator';
import { ImageGenerationResponse } from '@/types';

// Input validation schema
const generateImagesSchema = z.object({
  content: z.object({
    title: z.string(),
    description: z.string(),
    headings: z.array(z.string()),
    paragraphs: z.array(z.string()),
    url: z.string(),
    summary: z.string()
  }),
  systemPrompt: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { content, systemPrompt } = generateImagesSchema.parse(body);

    console.log(`Generating images for content: ${content.title}`);

    // Generate images using AI
    const images = await ImageGenerator.generateImages(content, systemPrompt);

    console.log(`Successfully generated ${images.length} images`);

    const response: ImageGenerationResponse = {
      success: true,
      images
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Image generation error:', error);

    let errorMessage = 'Failed to generate images';
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = 'Invalid content data provided';
      statusCode = 400;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      
      // Determine appropriate status code based on error type
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        statusCode = 408;
      } else if (error.message.includes('HTTP 4')) {
        statusCode = 400;
      } else if (error.message.includes('HTTP 5')) {
        statusCode = 502;
      } else if (error.message.includes('Invalid') || error.message.includes('validation')) {
        statusCode = 400;
      }
    }

    const response: ImageGenerationResponse = {
      success: false,
      images: [],
      error: errorMessage
    };

    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image generation API endpoint',
    method: 'POST',
    description: 'Send a POST request with extracted content to generate images',
    systemPrompt: ImageGenerator.DEFAULT_SYSTEM_PROMPT,
    example: {
      content: {
        title: 'Example Website',
        description: 'This is an example website description',
        headings: ['Main Heading', 'Sub Heading'],
        paragraphs: ['This is a paragraph of content from the website.'],
        url: 'https://example.com',
        summary: 'Summary of the website content'
      },
      systemPrompt: 'Optional custom system prompt for AI image generation'
    }
  });
}