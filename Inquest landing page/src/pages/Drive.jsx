import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Wallet, ArrowRight, CheckCircle2, Zap, TrendingUp } from 'lucide-react';

import HeroSlider from '../components/HeroSlider';

export default function Drive() {
  const driveSlides = [
    {
      title: "Take control of",
      titleHighlight: "your earnings.",
      desc: "Keep 72% of what you make. Say goodbye to fuel and yes to Electric vehicles. Say goodbye to street harassment and unpredictable daily income.",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4c/The_picture_of_a_nick_man_that_pack_at_the_junction_of_adire_mall_at_abeokuta_looking_happy%2C_waiting_to_take_some_passenger_to_there_destination.jpg",
      badge: "Drive with Inquest",
      primaryCta: { label: "Apply to Drive", link: "/signup" }
    },
    {
      title: "Zero street",
      titleHighlight: "harassment.",
      desc: "We handle the unions and agberos. You drive peacefully from designated parks to destinations without extortion.",
      image: "https://upload.wikimedia.org/wikipedia/commons/1/12/Lagos_Danfo_Bus.jpg",
      badge: "Peace of Mind",
      primaryCta: { label: "Start your application", link: "/signup" }
    },
    {
      title: "Drive modern",
      titleHighlight: "Electric Vehicles.",
      desc: "Access to our fleet of electric vehicles. Lower maintenance, zero fuel costs, and a smoother ride for your passengers.",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200&auto=format&fit=crop",
      badge: "The Future is Electric",
      primaryCta: { label: "Apply to Drive", link: "/signup" }
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSlider slides={driveSlides} />

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-surface-1 border-y border-surface-2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Why drivers choose Inquest</h2>
            <p className="text-text-secondary text-lg">We treat our drivers as partners, not just independent contractors.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Wallet, 
                title: "Keep 72% of Earnings", 
                desc: "The highest take-home percentage in the industry. What you earn is what you keep, paid out daily." 
              },
              { 
                icon: ShieldCheck, 
                title: "Zero Harassment", 
                desc: "We handle the unions and agberos. You drive peacefully from designated parks to destinations." 
              },
              { 
                icon: Zap, 
                title: "Drive Modern EVs", 
                desc: "Access to our fleet of electric vehicles. Lower maintenance, zero fuel costs, and a smoother ride." 
              }
            ].map((feature, i) => (
              <div key={i} className="bg-surface-0 p-8 rounded-3xl border border-surface-2 shadow-sm">
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

      {/* EV Banner Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-0 rounded-3xl p-8 md:p-16 border border-primary/20 shadow-[0_0_40px_rgba(127,255,0,0.05)] flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wider mb-6">
                <Zap className="w-4 h-4" />
                The Future is Electric
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-6 leading-tight">
                Say goodbye to fuel.<br/>
                <span className="text-primary">Say yes to Electric vehicles.</span>
              </h2>
              <p className="text-xl text-text-secondary mb-8 max-w-xl leading-relaxed">
                Stop worrying about fluctuating fuel prices, scarcity, and high maintenance costs. Drive our modern EV fleet and keep more money in your pocket.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Zero fuel costs', 
                  'Lower maintenance', 
                  'Eco-friendly driving', 
                  'Smoother, quieter ride'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-text-primary font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-surface-2 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200&auto=format&fit=crop" 
                  alt="Electric Vehicle Charging" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-surface-0 border border-surface-2 p-4 rounded-2xl shadow-xl flex items-center gap-4 hidden sm:flex">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">Average Savings</p>
                  <p className="text-xl font-bold text-text-primary">₦150k / month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-12 text-center">Requirements to Drive</h2>
          
          <div className="bg-surface-0 border border-surface-2 rounded-3xl p-8 md:p-12 shadow-sm">
            <ul className="space-y-6">
              {[
                "Valid Driver's License (Class E)",
                "LASDRI Certification (for Lagos drivers)",
                "Clean driving record and background check",
                "Minimum of 3 years driving experience",
                "Guarantor verification"
              ].map((req, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-lg text-text-primary font-medium">{req}</p>
                </li>
              ))}
            </ul>
            
            <div className="mt-12 pt-8 border-t border-surface-2 text-center">
              <Link to="/signup" className="inline-block bg-primary hover:bg-primary-dim text-on-primary px-8 py-4 rounded-full font-bold transition-all shadow-[0_4px_14px_rgba(127,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(127,255,0,0.3)] hover:-translate-y-0.5">
                Start your application
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
