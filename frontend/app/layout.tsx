import type { Metadata } from 'next';
import './globals.css';

/**
 * Root Layout
 * - Applies to all pages in the app
 * - Sets up HTML structure, metadata, fonts
 * - Imports global Tailwind CSS
 * - No UI components here - just configuration
 */

export const metadata: Metadata = {
  title: 'Krishi Sakhi - AI Farming Assistant',
  description: 'AI-powered crop recommendations for Indian farmers based on weather, soil, and market data',
  keywords: 'farming, agriculture, AI, crop recommendation, India, farmers',
  authors: [{ name: 'Krishi Sakhi Team' }],
  openGraph: {
    title: 'Krishi Sakhi - AI Farming Assistant',
    description: 'Get AI-powered crop recommendations for better profits',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
