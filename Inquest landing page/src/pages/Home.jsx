import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Car,
  Wallet,
  Smartphone,
  UserCheck,
  TrendingUp
} from 'lucide-react';

import HeroSlider from '../components/HeroSlider';

export default function Home() {
  const [activeTab, setActiveTab] = useState('passengers');

  const tabs = [
    { id: 'passengers', label: 'Passengers' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'investors', label: 'Investors' }
  ];

  const homeSlides = [
    {
      title: "Verify your safety",
      titleHighlight: "before you enter.",
      desc: "No guesswork. No agberos. No one-chance. The first transport system in Nigeria where every vehicle is tracked and every driver is verified.",
      image: "/images/happy-lady.jpg",
      badge: "A verified transport system",
      primaryCta: { label: "Ride with Inquest", link: "/signup" },
      secondaryCta: { label: "Drive & Keep 72%", link: "/drive" }
    },
    {
      title: "Distance-based,",
      titleHighlight: "predictable pricing.",
      desc: "Fares are calculated by distance, not by weather or mood. No haggling, no sudden price hikes. Just fair pricing.",
      image: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=1200&auto=format&fit=crop",
      badge: "Fair Fares",
      primaryCta: { label: "Start riding safely", link: "/signup" }
    },
    {
      title: "Clean, modern",
      titleHighlight: "transport.",
      desc: "Experience a smoother, quieter ride while reducing your carbon footprint. The future of transport in Lagos.",
      image: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?q=80&w=1200&auto=format&fit=crop",
      badge: "Eco-Friendly",
      primaryCta: { label: "Join the future", link: "/signup" }
    }
  ];

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION - SWIPEABLE */}
      <HeroSlider slides={homeSlides} />

      {/* 2. THE PROBLEM -> THE SOLUTION (Clean Grid) */}
      <section className="py-24 px-6 bg-surface-1 border-y border-surface-2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Bringing order to chaos.</h2>
            <p className="text-text-secondary text-lg">We are replacing the uncertainty of everyday transport with a structured, verifiable system.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserCheck,
                title: "Verified Identity",
                desc: "No more 'one-chance' fears. Every driver and vehicle is registered, tracked, and verified before you enter."
              },
              {
                icon: Wallet,
                title: "Distance-Based Pricing",
                desc: "Fares are calculated by distance, not by weather or mood. No haggling, no sudden price hikes."
              },
              {
                icon: ShieldCheck,
                title: "Zero Harassment",
                desc: "We shield our drivers from agberos and street-level extortion, allowing them to focus on safe driving."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-surface-0 p-8 rounded-3xl border border-surface-2 hover:border-primary/30 transition-colors shadow-sm">
                <div className="w-12 h-12 rounded-full bg-surface-1 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS - NEAT TIMELINE */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-6">How Inquest works</h2>
              <p className="text-text-secondary text-lg mb-12">Four simple steps to a safer, more predictable journey.</p>

              <div className="space-y-8">
                {[
                  { step: "01", title: "Find a Vehicle", desc: "Locate an Inquest vehicle at our designated parks or along defined routes." },
                  { step: "02", title: "Verify Before Entry", desc: "Scan or enter the vehicle ID in your app. We instantly prove it's genuine." },
                  { step: "03", title: "Board Calmly", desc: "Enter the vehicle. No dragging, no overloading. Just take your seat." },
                  { step: "04", title: "Ride Safely", desc: "Move to your destination with distance-based, predictable pricing." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-surface-1 border border-surface-2 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {item.step}
                      </div>
                      {i !== 3 && <div className="w-px h-full bg-surface-2 my-2"></div>}
                    </div>
                    <div className="pb-6">
                      <h4 className="text-xl font-bold text-text-primary mb-2">{item.title}</h4>
                      <p className="text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[600px] bg-surface-1 rounded-3xl border border-surface-2 overflow-hidden flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/9e/Traffic_in_Lagos_City.jpg"
                alt="Lagos Traffic Danfo"
                className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-luminosity"
              />
              {/* Abstract Phone Mockup */}
              <div className="relative z-10 w-[280px] h-[580px] bg-surface-0 rounded-[40px] border-[8px] border-surface-2 shadow-2xl flex flex-col overflow-hidden">
                <div className="h-1/2 bg-surface-1 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-primary/30 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-2 border-primary/60 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center text-center">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Scan Vehicle</h3>
                  <p className="text-sm text-text-secondary mb-6">Point your camera at the Inquest QR code on the vehicle.</p>
                  <button className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20">
                    Open Camera
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AUDIENCE TABS - BEAUTIFULLY ORGANIZED */}
      <section className="py-24 px-6 bg-surface-1 border-y border-surface-2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Built for everyone.</h2>
            <p className="text-text-secondary text-lg">A system that works for the entire transport ecosystem.</p>
          </div>

          {/* Custom Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-surface-0 p-1 rounded-full border border-surface-2 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === tab.id
                      ? 'bg-surface-2 text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-surface-0 rounded-3xl border border-surface-2 p-8 md:p-12 min-h-[400px] flex items-center shadow-sm">
            <AnimatePresence mode="wait">
              {activeTab === 'passengers' && (
                <motion.div
                  key="passengers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2 gap-12 items-center w-full"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-text-primary mb-4">Peace of mind on every trip.</h3>
                    <p className="text-text-secondary leading-relaxed mb-8">
                      Safety, comfort, and trust. Know your driver before you enter. No shouting, no dragging, just a calm, organized ride to your destination.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Anti-impersonation system</li>
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Strict no-overloading policy</li>
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Clean, modern EV vehicles</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl overflow-hidden h-64 md:h-full border border-surface-2">
                    <img src="/images/passenger-smiling.jpg" alt="Smiling Nigerian passenger in a car" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              )}

              {activeTab === 'drivers' && (
                <motion.div
                  key="drivers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2 gap-12 items-center w-full"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-text-primary mb-4">Drive with dignity. Keep 72%.</h3>
                    <p className="text-text-secondary leading-relaxed mb-8">
                      Income, structure, and respect. Drive our modern EVs. We handle the agberos and union stress so you can focus entirely on your work and earnings.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Zero street harassment</li>
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Keep 72% of your earnings</li>
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Professional status & training</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl overflow-hidden h-64 md:h-full border border-surface-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Danfo_Driver%2C_Lagos-Nigeria.jpg" alt="Nigerian Driver" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              )}

              {activeTab === 'investors' && (
                <motion.div
                  key="investors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid md:grid-cols-2 gap-12 items-center w-full"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-text-primary mb-4">Scale and earn passively.</h3>
                    <p className="text-text-secondary leading-relaxed mb-8">
                      Returns, tracking, and scale. Fund vehicles in a high-demand, structured system and earn passive income daily with full transparency.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Fully managed assets</li>
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Transparent daily tracking</li>
                      <li className="flex items-center gap-3 text-text-primary font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> High-demand ecosystem</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl overflow-hidden h-64 md:h-full border border-surface-2">
                    <img src="https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?q=80&w=800&auto=format&fit=crop" alt="Data" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION - CLEAN & PREMIUM */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface-0"></div>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-text-primary mb-6 tracking-tight">
            Ready to move differently?
          </h2>
          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Join the first transport system in Nigeria built entirely around your safety and peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-primary hover:bg-primary-dim text-on-primary px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_4px_14px_rgba(127,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(127,255,0,0.3)] hover:-translate-y-0.5">
              Start riding safely
            </Link>
            <Link to="/drive" className="bg-surface-1 hover:bg-surface-2 text-text-primary border border-surface-2 px-8 py-4 rounded-full font-bold text-lg transition-all">
              Apply to drive
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
