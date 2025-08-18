'use client';

import React, { useState } from 'react';
import { UrlInputForm } from '@/components/url-input-form';
import { ImageGallery } from '@/components/image-gallery';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GeneratedImage, ExtractedContent, LoadingState } from '@/types';

export default function HomePage() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isExtracting: false,
    isGenerating: false,
    progress: 0,
    currentStep: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetState = () => {
    setImages([]);
    setContent(null);
    setError(null);
    setSuccess(null);
    setLoadingState({
      isExtracting: false,
      isGenerating: false,
      progress: 0,
      currentStep: ''
    });
  };

  const extractContent = async (url: string): Promise<ExtractedContent> => {
    setLoadingState(prev => ({
      ...prev,
      isExtracting: true,
      currentStep: 'Extracting content from website...',
      progress: 20
    }));

    const response = await fetch('/api/extract-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to extract content');
    }

    return data.content;
  };

  const generateImages = async (
    content: ExtractedContent,
    systemPrompt?: string
  ): Promise<GeneratedImage[]> => {
    setLoadingState(prev => ({
      ...prev,
      isGenerating: true,
      currentStep: 'Generating AI images...',
      progress: 60
    }));

    const response = await fetch('/api/generate-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, systemPrompt }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate images');
    }

    return data.images;
  };

  const handleSubmit = async (url: string, systemPrompt?: string) => {
    resetState();

    try {
      // Step 1: Extract content
      const extractedContent = await extractContent(url);
      setContent(extractedContent);
      
      setLoadingState(prev => ({
        ...prev,
        isExtracting: false,
        currentStep: 'Content extracted successfully',
        progress: 40
      }));

      // Brief pause to show progress
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Generate images
      const generatedImages = await generateImages(extractedContent, systemPrompt);
      setImages(generatedImages);

      setLoadingState(prev => ({
        ...prev,
        isGenerating: false,
        currentStep: 'Images generated successfully!',
        progress: 100
      }));

      setSuccess(`Successfully generated ${generatedImages.length} images from "${extractedContent.title}"`);

      // Clear loading state after success message
      setTimeout(() => {
        setLoadingState({
          isExtracting: false,
          isGenerating: false,
          progress: 0,
          currentStep: ''
        });
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setLoadingState({
        isExtracting: false,
        isGenerating: false,
        progress: 0,
        currentStep: ''
      });
    }
  };

  const handleRetry = () => {
    if (content) {
      handleSubmit(content.url);
    }
  };

  const isLoading = loadingState.isExtracting || loadingState.isGenerating;
  const currentLoadingMessage = loadingState.currentStep;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Transform Websites into AI Art
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Enter any website URL and watch as our AI extracts the content and creates 5 unique, 
          stunning images that capture the essence of that website.
        </p>
      </div>

      {/* URL Input Form */}
      <UrlInputForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        loadingMessage={currentLoadingMessage}
      />

      {/* Loading Progress */}
      {isLoading && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <LoadingSpinner
              size="lg"
              message={currentLoadingMessage}
              progress={loadingState.progress}
            />
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
            {content && (
              <div className="mt-3">
                <Button onClick={handleRetry} size="sm" variant="outline" className="border-red-300">
                  Try Again
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="max-w-2xl mx-auto border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            <strong>Success:</strong> {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Image Gallery */}
      {(images.length > 0 || (!isLoading && !error && content)) && (
        <ImageGallery
          images={images}
          content={content}
          onRetry={handleRetry}
          isLoading={isLoading}
        />
      )}

      {/* Getting Started Guide */}
      {images.length === 0 && !isLoading && !error && !content && (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="font-semibold">1. Enter URL</h3>
                <p className="text-sm text-gray-600">
                  Paste any website URL you want to transform into AI art
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold">2. AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI extracts key content and analyzes themes automatically
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-semibold">3. Get Images</h3>
                <p className="text-sm text-gray-600">
                  Receive 5 unique AI-generated images based on the content
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}