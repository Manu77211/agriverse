import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

/**
 * Layout Component
 * - Main wrapper for all pages
 * - Provides consistent structure: Navbar → Content → Footer
 * - Flexbox layout ensures footer stays at bottom
 * - All pages import and use this component
 * - No inline HTML/CSS in pages - everything uses this wrapper
 */

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}
