'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineSpinner } from '@/components/loading-spinner';
import { ImageGenerator } from '@/lib/image-generator';

interface UrlInputFormProps {
  onSubmit: (url: string, systemPrompt?: string) => void;
  isLoading: boolean;
  loadingMessage?: string;
}

export function UrlInputForm({ onSubmit, isLoading, loadingMessage }: UrlInputFormProps) {
  const [url, setUrl] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(ImageGenerator.DEFAULT_SYSTEM_PROMPT);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; systemPrompt?: string }>({});

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: { url?: string; systemPrompt?: string } = {};

    if (!url.trim()) {
      newErrors.url = 'Please enter a website URL';
    } else if (!validateUrl(url.trim())) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (systemPrompt.trim().length < 10) {
      newErrors.systemPrompt = 'System prompt must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit(url.trim(), systemPrompt.trim());
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    // Clear URL error when user starts typing
    if (errors.url && value.trim()) {
      setErrors(prev => ({ ...prev, url: undefined }));
    }
  };

  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSystemPrompt(value);
    
    // Clear system prompt error when user starts typing
    if (errors.systemPrompt && value.trim().length >= 10) {
      setErrors(prev => ({ ...prev, systemPrompt: undefined }));
    }
  };

  const resetForm = () => {
    setUrl('');
    setSystemPrompt(ImageGenerator.DEFAULT_SYSTEM_PROMPT);
    setErrors({});
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Website to AI Images Generator
        </CardTitle>
        <CardDescription className="text-center">
          Enter a website URL to extract content and generate 5 AI images based on that content
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              Website URL
            </Label>
            <Input
              id="url"
              type="text"
              placeholder="https://example.com or example.com"
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
              className={errors.url ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.url && (
              <p className="text-sm text-red-600">{errors.url}</p>
            )}
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt" className="text-sm font-medium">
                  AI System Prompt
                </Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Enter custom instructions for AI image generation..."
                  value={systemPrompt}
                  onChange={handleSystemPromptChange}
                  disabled={isLoading}
                  rows={6}
                  className={`resize-none ${errors.systemPrompt ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.systemPrompt && (
                  <p className="text-sm text-red-600">{errors.systemPrompt}</p>
                )}
                <p className="text-xs text-gray-500">
                  Customize how the AI interprets your content to generate images. 
                  The default prompt works well for most websites.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <InlineSpinner className="mr-2" />
                  {loadingMessage || 'Processing...'}
                </>
              ) : (
                'Generate Images'
              )}
            </Button>
            
            {!isLoading && (url || systemPrompt !== ImageGenerator.DEFAULT_SYSTEM_PROMPT) && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Reset
              </Button>
            )}
          </div>

          {/* Loading Message */}
          {isLoading && loadingMessage && (
            <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              {loadingMessage}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}