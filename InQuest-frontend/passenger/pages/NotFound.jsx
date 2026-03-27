import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-display font-semibold text-[var(--color-primary)] mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-[var(--color-text-secondary)] mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/home" 
        className="flex items-center gap-2 bg-[var(--color-surface-2)] text-[var(--color-text-primary)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--color-surface-3)] transition-colors"
      >
        <ArrowLeft size={20} /> Go Home
      </Link>
    </div>
  );
}

