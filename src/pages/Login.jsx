import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32 bg-surface-1">
      <div className="w-full max-w-md bg-surface-0 rounded-3xl border border-surface-2 shadow-2xl p-8 md:p-12">
        <div className="flex justify-center mb-8">
          <Link to="/" className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-8 h-8 text-on-primary" />
          </Link>
        </div>
        
        <h2 className="text-3xl font-display font-bold text-text-primary text-center mb-2">Welcome back</h2>
        <p className="text-text-secondary text-center mb-8">Log in to your Inquest account</p>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email or Phone Number</label>
            <input 
              type="text" 
              className="w-full bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Enter your email or phone"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-primary">Password</label>
              <a href="#" className="text-sm text-primary hover:underline font-medium">Forgot password?</a>
            </div>
            <input 
              type="password" 
              className="w-full bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dim text-on-primary py-4 rounded-xl font-bold transition-all shadow-[0_4px_14px_rgba(127,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(127,255,0,0.3)] flex items-center justify-center gap-2"
          >
            Log In <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-surface-2 text-center">
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
