import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Bell, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[var(--color-bg)]/80 border-b border-[var(--color-border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[var(--color-primary)] rounded-sm" />
            <span className="font-display font-semibold text-xl tracking-tight">INQUEST</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
            <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">Features</a>
            <a href="#trust" className="hover:text-[var(--color-text-primary)] transition-colors">Trust</a>
            <a href="#green" className="hover:text-[var(--color-text-primary)] transition-colors">Green Impact</a>
          </div>
          <Link
            to="/splash"
            className="bg-[var(--color-primary)] text-[var(--color-primary-text)] px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[var(--color-primary)]/90 transition-colors shadow-[var(--shadow-glow)]"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-primary)] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
            </span>
            Now live in Abia State
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-semibold leading-[1.1] tracking-tight mb-6">
            Urban mobility built on <span className="text-[var(--color-primary)]">trust.</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-md leading-relaxed">
            Inquest brings structure, safety, and accountability to everyday transport. Verified drivers, live tracking, and real-time support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/splash"
              className="bg-[var(--color-primary)] text-[var(--color-primary-text)] px-8 py-4 rounded-full font-semibold text-center hover:bg-[var(--color-primary)]/90 transition-colors shadow-[var(--shadow-glow)]"
            >
              Book a Ride
            </Link>
            <a
              href="#features"
              className="bg-[var(--color-surface-2)] text-[var(--color-text-primary)] px-8 py-4 rounded-full font-semibold text-center hover:bg-[var(--color-surface-3)] transition-colors"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] shadow-2xl"
        >
          {/* Abstract representation of the app */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-bg)]" />
          <div className="absolute inset-x-8 top-8 bottom-24 rounded-3xl bg-[var(--color-surface-1)] shadow-lg border border-[var(--color-border-subtle)] overflow-hidden flex flex-col">
            <div className="h-1/2 bg-[var(--color-surface-2)] relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div className="h-12 rounded-xl bg-[var(--color-surface-2)]" />
              <div className="h-24 rounded-xl bg-[var(--color-surface-2)]" />
            </div>
          </div>
          <div className="absolute bottom-8 inset-x-8 h-16 rounded-2xl bg-[var(--color-primary)] shadow-[var(--shadow-glow)]" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[var(--color-surface-1)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Safety by design.</h2>
            <p className="text-[var(--color-text-secondary)]">Every feature is built to protect you and your journey.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Verified Drivers', desc: 'Every driver is vetted, registered, and tracked.' },
              { icon: MapPin, title: 'Live Tracking', desc: 'Share your real-time location with trusted contacts.' },
              { icon: Bell, title: 'Destination Alarm', desc: 'Never miss your stop. We alert you when you are close.' },
              { icon: Zap, title: 'IoT Safety', desc: 'Connected vehicles for immediate emergency response.' }
            ].map((f, i) => (
              <div key={i} className="bg-[var(--color-surface-2)] p-8 rounded-3xl border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-primary)] mb-6">
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--color-border-subtle)] text-center text-[var(--color-text-muted)] text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-1.5 h-4 bg-[var(--color-primary)] rounded-sm" />
          <span className="font-display font-semibold text-lg tracking-tight text-[var(--color-text-primary)]">INQUEST</span>
        </div>
        <p>© 2026 Inquest Mobility Service. All rights reserved.</p>
      </footer>
    </div>
  );
}

