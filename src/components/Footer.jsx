import { Link } from 'react-router-dom';
import { ShieldCheck, Twitter, Instagram, Linkedin, Apple, Play } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-1 border-t border-surface-2 pt-20 pb-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <span className="text-2xl font-display font-bold tracking-tight text-text-primary">Inquest</span>
          </Link>
          <p className="text-text-secondary mb-8 max-w-sm leading-relaxed">
            The first transport system in Nigeria built entirely around your safety, peace of mind, and driver dignity.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-3 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-3 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface-3 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        {/* Links Columns */}
        <div>
          <h4 className="font-bold text-text-primary mb-6">Company</h4>
          <ul className="space-y-4 text-text-secondary font-medium">
            <li><Link to="/" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Investors</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-text-primary mb-6">Products</h4>
          <ul className="space-y-4 text-text-secondary font-medium">
            <li><Link to="/" className="hover:text-primary transition-colors">Ride</Link></li>
            <li><Link to="/drive" className="hover:text-primary transition-colors">Drive</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Fleet Management</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Inquest for Business</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-text-primary mb-6">Legal</h4>
          <ul className="space-y-4 text-text-secondary font-medium">
            <li><Link to="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
          </ul>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-surface-2 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-text-muted text-sm font-medium">
          © {new Date().getFullYear()} Inquest Transport System. All rights reserved.
        </p>
        
        {/* App Store Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="flex items-center gap-3 bg-surface-2 hover:bg-surface-3 px-5 py-2.5 rounded-xl text-text-primary transition-colors border border-surface-3">
            <Apple className="w-6 h-6" />
            <div className="text-left">
              <div className="text-[10px] leading-none text-text-secondary font-medium mb-0.5">Download on the</div>
              <div className="text-sm font-bold leading-tight">App Store</div>
            </div>
          </button>
          <button className="flex items-center gap-3 bg-surface-2 hover:bg-surface-3 px-5 py-2.5 rounded-xl text-text-primary transition-colors border border-surface-3">
            <Play className="w-5 h-5 ml-1" />
            <div className="text-left">
              <div className="text-[10px] leading-none text-text-secondary font-medium mb-0.5">GET IT ON</div>
              <div className="text-sm font-bold leading-tight">Google Play</div>
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
