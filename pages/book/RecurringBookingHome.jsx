import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Calendar, Clock, 
  MapPin, ChevronRight, Pause, Info,
  Search, SlidersHorizontal, Map as MapIcon, 
  Trash2, AlertCircle, Play, Zap,
  TrendingUp, ShieldCheck, PiggyBank, RefreshCcw,
  ArrowRight
} from 'lucide-react';
import useRecurringStore from '../../store/recurringStore';
import useSubscriptionStore from '../../store/subscriptionStore';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

export default function RecurringBookingHome() {
  const navigate = useNavigate();
  const { 
    schedules, fetchSchedules, fetchUpcomingRides,
    selectedDate, setSelectedDate, getUpcomingForDate 
  } = useRecurringStore();
  const { 
    subscription, tiers, fetchActiveSubscription, fetchTiers,
    toggleAutoRenewal, savingsThisCycle
  } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'schedules' | 'passes'

  useEffect(() => {
    fetchSchedules();
    fetchUpcomingRides();
    fetchActiveSubscription();
    fetchTiers();
  }, []);

  // Generate next 14 days for the date picker
  const dates = [...Array(14)].map((_, i) => addDays(new Date(), i));

  const todaysRides = getUpcomingForDate(selectedDate);

  return (
    <div className="min-h-screen bg-[#1A2421] pb-24 text-white">
      {/* HEADER */}
      <header className="pt-12 px-5 mb-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="text-white/50">
            <ChevronLeft size={28} />
          </button>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'upcoming' ? 'bg-[var(--color-primary)] text-black' : 'text-white/40'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'schedules' ? 'bg-[var(--color-primary)] text-black' : 'text-white/40'}`}
            >
              Schedules
            </button>
            <button 
              onClick={() => setActiveTab('passes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'passes' ? 'bg-[var(--color-primary)] text-black' : 'text-white/40'}`}
            >
              Passes
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
           <h1 className="font-display text-4xl font-bold text-white leading-tight">
             {activeTab === 'upcoming' ? 'Your Rides' : activeTab === 'schedules' ? 'Routine Trips' : 'Commute Pass'}
           </h1>
           <button 
             onClick={() => navigate('/book/recurring/create')}
             className="w-12 h-12 bg-[var(--color-primary)] text-black rounded-2xl flex items-center justify-center shadow-[var(--shadow-glow)] active:scale-90 transition-transform"
           >
             <Plus size={24} strokeWidth={3} />
           </button>
        </div>
      </header>

      {activeTab === 'upcoming' ? (
        <>
          {/* DATE PICKER */}
          <section className="px-5 mb-8 overflow-x-auto no-scrollbar flex gap-3 pb-2">
            {dates.map((date, i) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate === dateStr;
              const isToday = isSameDay(date, new Date());
              return (
                <button 
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[64px] h-24 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] shadow-[var(--shadow-glow)]' 
                      : 'bg-white/5 border-white/5 text-white/40'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-black/50' : 'text-white/20'}`}>
                    {format(date, 'EEE')}
                  </span>
                  <span className={`text-xl font-display font-bold ${isSelected ? 'text-black' : 'text-white/60'}`}>
                    {format(date, 'd')}
                  </span>
                  {isToday && !isSelected && <div className="w-1 h-1 bg-[var(--color-primary)] rounded-full mt-1" />}
                </button>
              );
            })}
          </section>

          {/* UPCOMING RIDE LIST */}
          <section className="px-5 space-y-4">
             {todaysRides.length > 0 ? (
               todaysRides.map((ride, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   onClick={() => navigate(`/book/recurring/${ride.scheduleId}`)}
                   className="bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/5 shadow-xl relative overflow-hidden group active:scale-[0.98] transition-transform"
                 >
                    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                       <div className="space-y-1">
                          <h4 className="text-white font-bold text-lg">{ride.scheduleName}</h4>
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                             <Clock size={14} /> {format(parseISO(ride.scheduledAt), 'h:mm a')}
                          </div>
                       </div>
                       <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-[10px] text-white/50 font-black uppercase tracking-widest">
                          {ride.status}
                       </div>
                    </div>

                    <div className="flex flex-col gap-4 relative pl-6 mb-6">
                       <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/10" />
                       <div className="relative">
                          <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                          <div className="text-[10px] text-white/30 uppercase font-black mb-0.5">Pickup</div>
                          <div className="text-white/80 text-sm font-medium truncate">{ride.pickup.address}</div>
                       </div>
                       <div className="relative">
                          <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-red-500" />
                          <div className="text-[10px] text-white/30 uppercase font-black mb-0.5">Dropoff</div>
                          <div className="text-white/80 text-sm font-medium truncate">{ride.destination.address}</div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                       <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase">
                          {ride.paymentMethod === 'SUBSCRIPTION' ? (
                            <>
                              <Zap size={10} className="text-[var(--color-primary)]" />
                              <span className="text-[var(--color-primary)]">Subscription Trip</span>
                            </>
                          ) : (
                            <span>Wallet Order</span>
                          )}
                       </div>
                       <ChevronRight size={18} className="text-white/20 group-hover:text-[var(--color-primary)] transition-colors" />
                    </div>
                 </motion.div>
               ))
             ) : (
                <div className="bg-white/5 rounded-[32px] p-10 border border-white/10 text-center space-y-6">
                  <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-3xl flex items-center justify-center mx-auto">
                    <Calendar size={40} className="text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">No rides for this day</h3>
                    <p className="text-white/40 text-sm leading-relaxed px-4">You haven't scheduled any routine trips for this date.</p>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/book/recurring/create')}
                    className="w-full bg-[var(--color-primary)] text-black py-4 rounded-2xl font-bold shadow-[var(--shadow-glow)] active:scale-95 transition-all outline-none"
                  >
                    Book a Routine Trip
                  </button>
                </div>
             )}
          </section>
        </>
      ) : activeTab === 'schedules' ? (
        <section className="px-5 space-y-6">
           {schedules.length > 0 ? (
             schedules.map((schedule, i) => (
               <div 
                 key={i} 
                 onClick={() => navigate(`/book/recurring/${schedule.id}`)}
                 className={`bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/5 shadow-xl relative overflow-hidden active:scale-[0.98] transition-transform ${schedule.status === 'PAUSED' ? 'opacity-60 grayscale-[0.5]' : ''}`}
               >
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h4 className="text-white font-bold text-lg mb-1">{schedule.name}</h4>
                        <div className="flex items-center gap-3">
                           <div className="text-white/60 text-xs font-bold uppercase tracking-wider">{schedule.time}</div>
                           <div className="w-1 h-1 bg-white/10 rounded-full" />
                           <div className="flex gap-1">
                              {[1,2,3,4,5,6,7].map(d => {
                                const active = schedule.daysOfWeek.includes(d);
                                const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                                return (
                                  <span key={d} className={`text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${active ? 'bg-[var(--color-primary)] text-black' : 'text-white/20'}`}>
                                    {dayLabels[d-1]}
                                  </span>
                                );
                              })}
                           </div>
                        </div>
                     </div>
                     {schedule.status === 'PAUSED' ? <Pause size={18} className="text-amber-500" /> : <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(127,255,0,0.5)]" />}
                  </div>

                  <div className="flex items-center gap-3 text-white/40 text-xs mb-6">
                     <MapPin size={14} />
                     <span className="truncate flex-1">{schedule.pickup.address} → {schedule.destination.address}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="text-[10px] text-white/30 flex items-center gap-2">
                        <Info size={12} />
                        <span>{schedule.totalTrips} total trips completed</span>
                     </div>
                     <ChevronRight size={18} className="text-white/20" />
                  </div>
               </div>
             ))
           ) : (
             <div className="py-24 text-center space-y-8 px-10">
                <div className="w-24 h-24 bg-[var(--color-surface-2)] rounded-[40px] flex items-center justify-center mx-auto border border-white/5">
                   <Plus size={48} className="text-white/10" />
                 </div>
                <div className="space-y-4">
                   <h3 className="text-white font-bold text-2xl">Automation is Freedom</h3>
                   <p className="text-white/40 text-sm leading-relaxed">
                      Stop booking every morning. Set a schedule once and our system handles the matching every day at {format(new Date(), 'h:mm a')}.
                   </p>
                </div>
                <button 
                  onClick={() => navigate('/book/recurring/create')}
                  className="bg-[var(--color-primary)] text-black font-bold h-16 w-full rounded-2xl shadow-[var(--shadow-glow)] active:scale-95 transition-all text-lg"
                >
                   Create first schedule
                </button>
             </div>
           )}
        </section>
      ) : (
        <section className="px-5 pb-10">
          {subscription ? (
            <div className="space-y-6">
              {/* Active Plan Detail */}
              <div className="bg-gradient-to-br from-[#1D2A26] to-[#1A2421] rounded-[32px] p-8 border border-[#7FFF00]/30 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-1">{subscription.tierName}</h3>
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-[var(--color-primary)] text-black rounded text-[10px] font-black uppercase tracking-wider w-fit">
                      Active Plan
                    </div>
                  </div>
                  <ShieldCheck size={32} className="text-[var(--color-primary)]" />
                </div>

                <div className="flex flex-col items-center mb-8">
                   <div className="text-7xl font-display font-bold text-white mb-2">{subscription.remainingKm.toFixed(1)}</div>
                   <div className="text-white/40 font-bold uppercase tracking-widest text-xs">km remaining</div>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(subscription.remainingKm / subscription.totalKm) * 100}%` }}
                     className="h-full bg-[var(--color-primary)] shadow-[0_0_15px_rgba(127,255,0,0.5)]"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-white/30 text-[9px] font-black uppercase mb-1">Used</div>
                      <div className="text-white font-bold">{subscription.usedKm.toFixed(1)} km</div>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="text-white/30 text-[9px] font-black uppercase mb-1">Expires</div>
                      <div className="text-white font-bold">{subscription.daysRemaining} days</div>
                   </div>
                </div>
              </div>

              <div className="bg-[#1D2A26] border border-[#22C55E]/30 rounded-[32px] p-6 flex items-center gap-5">
                <div className="w-12 h-12 bg-[#22C55E]/10 rounded-full flex items-center justify-center text-[#22C55E]">
                  <PiggyBank size={24} />
                </div>
                <div>
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-1">You saved</div>
                  <div className="font-display text-3xl font-bold text-[#22C55E]">NGN {savingsThisCycle.toLocaleString()}</div>
                  <div className="text-white/30 text-[10px] italic">this cycle vs standard rate</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-[28px] p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
                    <RefreshCcw size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Auto-Renewal</div>
                    <p className="text-white/40 text-[10px]">{subscription.autoRenew ? 'On — Charges to wallet' : 'Off — Manual renewal'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAutoRenewal(!subscription.autoRenew)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${subscription.autoRenew ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: subscription.autoRenew ? 26 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                  />
                </button>
              </div>

              <button 
                onClick={() => navigate('/subscription/history')}
                className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                View Usage History <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-bold text-white">Choose Your Pass</h3>
                <p className="text-white/40 text-sm">Save up to 40% on your daily commute.</p>
              </div>
              
              <div className="space-y-4">
                {tiers.map(tier => (
                  <div 
                    key={tier.id}
                    className="bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/5 relative overflow-hidden group hover:border-[var(--color-primary)]/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{tier.name}</div>
                        <div className="text-4xl font-display font-bold text-white">{tier.km}<span className="text-base font-normal text-white/40 ml-1">km</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/40 text-[10px] font-black uppercase mb-1">Price</div>
                        <div className="text-xl font-bold text-[var(--color-primary)]">₦{tier.price.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-white/50 mb-6">
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-[var(--color-primary)]" />
                        ₦{tier.ratePerKm}/km
                      </div>
                      <div className="w-1 h-1 bg-white/20 rounded-full" />
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-[#22C55E]" />
                        Save ₦{tier.savingsPerKm}/km
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/subscription/checkout/${tier.id}`)}
                      className="w-full h-14 bg-white/5 group-hover:bg-[var(--color-primary)] group-hover:text-black rounded-2xl font-bold border border-white/10 group-hover:border-[var(--color-primary)] transition-all flex items-center justify-center gap-2"
                    >
                      Purchase Pass <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* FAB (Visible on upcoming tab if not empty) */}
      {activeTab === 'upcoming' && todaysRides.length > 0 && (
        <button 
          onClick={() => navigate('/book/recurring/create')}
          className="fixed bottom-28 right-6 w-16 h-16 bg-[var(--color-primary)] text-black rounded-full flex items-center justify-center shadow-[var(--shadow-lg)] active:scale-90 transition-transform z-50 border-4 border-[#1A2421]"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
