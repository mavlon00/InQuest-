import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, User, Car } from 'lucide-react';

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32 bg-surface-1">
      <div className="w-full max-w-2xl bg-surface-0 rounded-3xl border border-surface-2 shadow-2xl p-8 md:p-12">
        <div className="flex justify-center mb-8">
          <Link to="/" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-8 h-8 text-on-primary" />
          </Link>
        </div>

        <h2 className="text-3xl font-display font-bold text-text-primary text-center mb-2">Join Inquest</h2>
        <p className="text-text-secondary text-center mb-12">Choose how you want to use the platform</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Passenger */}
          <Link
            to="/signup/passenger"
            className="bg-surface-1 border border-surface-2 rounded-2xl p-6 hover:border-primary/50 hover:shadow-[0_0_24px_rgba(127,255,0,0.08)] transition-all cursor-pointer group block"
          >
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <User className="w-6 h-6 text-text-primary group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Sign up to Ride</h3>
            <p className="text-sm text-text-secondary mb-6">Create a passenger account to book rides and travel safely across the city.</p>
            <div className="w-full bg-surface-2 hover:bg-surface-3 text-text-primary py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              Create Passenger Account <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Driver */}
          <Link
            to="/signup/driver"
            className="bg-surface-1 border border-surface-2 rounded-2xl p-6 hover:border-primary/50 hover:shadow-[0_0_24px_rgba(127,255,0,0.08)] transition-all cursor-pointer group block"
          >
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Car className="w-6 h-6 text-text-primary group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Apply to Drive</h3>
            <p className="text-sm text-text-secondary mb-6">Start your application to become a verified Inquest driver and earn more.</p>
            <div className="w-full bg-primary hover:bg-primary-dim text-on-primary py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_rgba(127,255,0,0.2)] flex items-center justify-center gap-2">
              Start Driver Application <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <div className="pt-8 border-t border-surface-2 text-center">
          <p className="text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
