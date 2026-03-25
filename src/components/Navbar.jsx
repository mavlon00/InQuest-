import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Sun, Moon } from 'lucide-react';

export default function Navbar({ isDark, toggleTheme }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-surface-0/90 backdrop-blur-lg border-b border-surface-2 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-on-primary" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight text-text-primary">Inquest</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6 text-sm font-medium text-text-secondary">
            <Link to="/" className="hover:text-text-primary transition-colors">Ride</Link>
            <Link to="/drive" className="hover:text-text-primary transition-colors">Drive</Link>
            <a href="/#how-it-works" className="hover:text-text-primary transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-surface-2 text-text-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-text-primary hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="bg-primary hover:bg-primary-dim text-on-primary px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_4px_14px_rgba(127,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(127,255,0,0.3)] hover:-translate-y-0.5">
              Sign up
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:flex hidden items-center gap-4">
           {/* Hidden on mobile, handled below */}
        </div>
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-2 text-text-secondary transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            className="text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface-0 border-b border-surface-2 p-6 flex flex-col gap-4 shadow-xl">
          <Link to="/" className="text-lg font-medium text-text-primary">Ride</Link>
          <Link to="/drive" className="text-lg font-medium text-text-primary">Drive</Link>
          <a href="/#how-it-works" className="text-lg font-medium text-text-primary">How it works</a>
          <hr className="border-surface-2 my-2" />
          <Link to="/login" className="text-lg font-medium text-text-primary">Log in</Link>
          <Link to="/signup" className="text-lg font-bold text-primary">Sign up</Link>
        </div>
      )}
    </nav>
  );
}
