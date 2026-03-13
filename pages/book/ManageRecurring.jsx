import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ManageRecurring() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-semibold">Manage Subscriptions</h1>
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-display font-semibold mb-4">View Subscriptions</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">This feature is coming soon.</p>
        <Link
          to="/home"
          className="flex items-center gap-2 bg-[var(--color-surface-2)] text-[var(--color-text-primary)] px-6 py-3 rounded-full font-semibold hover:bg-[var(--color-surface-3)] transition-colors"
        >
          <ArrowLeft size={20} /> Go Home
        </Link>
      </main>
    </div>
  );
}
