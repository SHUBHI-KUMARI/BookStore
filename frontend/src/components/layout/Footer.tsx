import React from 'react';
import { BookOpen, Twitter, Facebook, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[var(--color-brand-dark-blue)] text-white/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Info */}
          <div className="space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-8 w-8 text-[var(--color-brand-muted-orange)]" />
              <span className="font-serif text-2xl font-black text-white tracking-tight">ReBook</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your community marketplace for discovering new stories, reselling read books, and connecting with fellow book lovers. Sustainable reading made easy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg text-white mb-6">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Fiction & Literature</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Textbooks</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Used Books</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">New Releases</Link></li>
            </ul>
          </div>

          {/* Sell & Support */}
          <div>
            <h3 className="font-bold text-lg text-white mb-6">Sell & Support</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Sell Your Books</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Seller Guidelines</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg text-white mb-6">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe for special offers, new arrivals, and marketplace highlights.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-muted-orange)]"
              />
              <button className="px-4 py-2 bg-[var(--color-brand-muted-orange)] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                <Mail className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ReBook Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
