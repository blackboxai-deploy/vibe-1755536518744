'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GeneratedImage, ExtractedContent } from '@/types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  content?: ExtractedContent | null;
  onRetry?: () => void;
  isLoading?: boolean;
}

export function ImageGallery({ images, content, onRetry, isLoading }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (imageId: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const handleImageError = (imageId: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    setFailedImages(prev => new Set(prev).add(imageId));
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const downloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (images.length === 0 && !isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <p className="text-lg font-medium">No images generated yet</p>
            <p className="text-sm">Enter a website URL above to generate AI images</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Content Summary */}
      {content && (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{content.title}</h3>
                  {content.description && (
                    <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-4">
                  {images.length} images
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                Source: <a href={content.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {content.url}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <Card 
              key={image.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gray-100">
                  {!failedImages.has(image.id) ? (
                    <>
                      {loadingImages.has(image.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <Image
                        src={image.url}
                        alt={image.prompt}
                        fill
                        className="object-cover"
                        onLoad={() => handleImageLoad(image.id)}
                        onError={() => handleImageError(image.id)}
                        onLoadStart={() => setLoadingImages(prev => new Set(prev).add(image.id))}
                        unoptimized
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                          ✕
                        </div>
                        <p className="text-sm">Failed to load</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Image number badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-black/80 text-white">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-3" title={image.prompt}>
                    {image.prompt}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(image.timestamp)}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}
                      disabled={failedImages.has(image.id)}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Retry Button */}
        {onRetry && images.length > 0 && (
          <div className="text-center mt-8">
            <Button onClick={onRetry} variant="outline" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate More Images'}
            </Button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <p className="text-sm text-gray-600">{selectedImage.prompt}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm"
                    onClick={() => downloadImage(selectedImage)}
                  >
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedImage(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto relative">
              <Image
                src={selectedImage.url}
                alt={selectedImage.prompt}
                width={800}
                height={600}
                className="w-full h-auto"
                onClick={(e) => e.stopPropagation()}
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}