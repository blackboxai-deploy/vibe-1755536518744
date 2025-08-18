import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ContentExtractor } from '@/lib/content-extractor';
import { ContentExtractionResponse } from '@/types';

// Input validation schema
const extractContentSchema = z.object({
  url: z.string().url('Please provide a valid URL')
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { url } = extractContentSchema.parse(body);

    console.log(`Extracting content from URL: ${url}`);

    // Extract content from the URL
    const content = await ContentExtractor.extractFromUrl(url);

    console.log(`Successfully extracted content: ${content.title}`);

    const response: ContentExtractionResponse = {
      success: true,
      content
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Content extraction error:', error);

    let errorMessage = 'Failed to extract content from the provided URL';
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = error.errors[0]?.message || 'Invalid input';
      statusCode = 400;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      
      // Determine appropriate status code based on error type
      if (error.message.includes('HTTP 4')) {
        statusCode = 400;
      } else if (error.message.includes('HTTP 5')) {
        statusCode = 502;
      } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        statusCode = 408;
      } else if (error.message.includes('Invalid URL')) {
        statusCode = 400;
      }
    }

    const response: ContentExtractionResponse = {
      success: false,
      error: errorMessage
    };

    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Content extraction API endpoint',
    method: 'POST',
    description: 'Send a POST request with a URL to extract content',
    example: {
      url: 'https://example.com'
    }
  });
}