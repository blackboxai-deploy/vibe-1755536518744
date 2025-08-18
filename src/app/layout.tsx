import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Website to AI Images Generator',
  description: 'Extract content from any website and generate 5 stunning AI images based on that content using advanced image generation models.',
  keywords: 'AI, image generation, website content, content extraction, artificial intelligence, FLUX, image creator',
  authors: [{ name: 'AI Image Generator' }],
  openGraph: {
    title: 'Website to AI Images Generator',
    description: 'Transform website content into beautiful AI-generated images',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website to AI Images Generator',
    description: 'Transform website content into beautiful AI-generated images',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Website to AI Images
                  </h1>
                </div>
                <div className="text-sm text-gray-500">
                  Powered by Advanced AI
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-sm text-gray-600">
                    Transform any website content into stunning AI-generated images. 
                    Our advanced AI analyzes website content and creates unique, 
                    high-quality images that capture the essence of your content.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Intelligent content extraction</li>
                    <li>• Advanced AI image generation</li>
                    <li>• Multiple artistic styles</li>
                    <li>• High-resolution outputs</li>
                    <li>• Customizable prompts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">How It Works</h3>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Enter a website URL</li>
                    <li>2. AI extracts key content</li>
                    <li>3. Content analyzed for themes</li>
                    <li>4. 5 unique images generated</li>
                    <li>5. Download and enjoy</li>
                  </ol>
                </div>
              </div>
              <div className="border-t mt-8 pt-6 text-center">
                <p className="text-sm text-gray-500">
                  © 2024 Website to AI Images Generator. Transform your content with AI.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}