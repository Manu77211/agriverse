import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

/**
 * Footer Component
 * - Company info and branding
 * - Quick links to pages
 * - Contact information
 * - Copyright and credits
 * - Mobile responsive with grid layout
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-earth-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                Krishi <span className="text-primary-400">Sakhi</span>
              </span>
            </div>
            <p className="text-earth-200 mb-4 max-w-md">
              AI-powered farming assistant helping Indian farmers make data-driven
              decisions for better crop yields and profits.
            </p>
            <div className="flex flex-col space-y-2 text-earth-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Pan-India Coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@krishisakhi.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>1800-XXX-XXXX (Toll Free)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-earth-300 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-earth-300 hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-earth-300 hover:text-primary-400 transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-earth-300 hover:text-primary-400 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-earth-300 hover:text-primary-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-earth-300 hover:text-primary-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-earth-300 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-earth-300 hover:text-primary-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-earth-700 mt-8 pt-8 text-center text-earth-400">
          <p>
            © {currentYear} Krishi Sakhi. All rights reserved. Built with 💚 for Indian farmers.
          </p>
          <p className="text-sm mt-2">
            Powered by OpenAI GPT-4o-mini, OpenWeather, AgriStack, and eNAM APIs
          </p>
        </div>
      </div>
    </footer>
  );
}
