import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Gift, ShieldAlert, CreditCard, CheckCircle2, Navigation, MessageCircle, X, ChevronRight, Smartphone, UserCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllNotificationsAsRead, deleteNotification } = useStore();

  const handleNotificationTap = (notification) => {
    markAsRead(notification.id);

    switch (notification.type) {
      case 'TRIP_CONFIRMED':
      case 'DRIVER_ASSIGNED':
      case 'DRIVER_EN_ROUTE':
      case 'DRIVER_ARRIVED':
      case 'TRIP_COMPLETED':
        navigate(`/trips/${notification.tripId || 'current'}`);
        break;
      case 'WALLET_TOPUP':
      case 'TRANSFER_RECEIVED':
      case 'TRANSFER_SENT':
        navigate('/wallet/history');
        break;
      case 'SUBSCRIPTION_REMINDER':
      case 'DRIVER_ASSIGNED_SUBSCRIPTION':
      case 'SUBSCRIPTION_RENEWED':
        navigate('/book/recurring/manage');
        break;
      case 'REFERRAL_REWARD':
      case 'FRIEND_JOINED':
        navigate('/profile/referrals');
        break;
      case 'GREEN_POINTS_EARNED':
        navigate('/profile/green-rewards');
        break;
      case 'SOS_TRIGGERED':
        if (notification.tripId) {
          navigate(`/tracking/${notification.tripId}`);
        } else {
          navigate('/trips');
        }
        break;
      case 'GUARDIAN_ALERT':
        navigate('/profile/guardians');
        break;
      case 'PROMOTIONAL':
      default:
        navigate('/profile/help');
        break;
    }
  };

  const deleteNotif = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'REFERRAL_REWARD':
      case 'FRIEND_JOINED': return <Gift size={20} className="text-purple-500" />;
      case 'WALLET_TOPUP':
      case 'TRANSFER_RECEIVED':
      case 'TRANSFER_SENT': return <CreditCard size={20} className="text-blue-500" />;
      case 'SOS_TRIGGERED': return <ShieldAlert size={20} className="text-[var(--color-error)]" />;
      case 'TRIP_CONFIRMED':
      case 'DRIVER_ASSIGNED':
      case 'DRIVER_EN_ROUTE':
      case 'DRIVER_ARRIVED':
      case 'TRIP_COMPLETED': return <Navigation size={20} className="text-[var(--color-primary)]" />;
      case 'GREEN_POINTS_EARNED': return <Heart size={20} className="text-[var(--color-success)]" />;
      case 'SUBSCRIPTION_REMINDER':
      case 'DRIVER_ASSIGNED_SUBSCRIPTION': return <Smartphone size={20} className="text-amber-500" />;
      case 'GUARDIAN_ALERT': return <ShieldCheck size={20} className="text-[var(--color-success)]" />;
      default: return <Bell size={20} className="text-[var(--color-text-muted)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-xl font-display font-semibold">Notifications</h1>
        <div className="flex items-center gap-2">
          {notifications.some(n => n.unread) && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-bold text-[var(--color-primary)] px-3 py-1.5 hover:bg-[var(--color-primary)]/5 rounded-full transition-colors uppercase tracking-wider"
            >
              Mark all read
            </button>
          )}
          <button onClick={() => navigate('/notifications/settings')} className="p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => handleNotificationTap(notif)}
              className={`group relative bg-[var(--color-surface-1)] p-5 rounded-3xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:bg-[var(--color-surface-3)] ${notif.unread
                ? 'border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/[0.03] to-transparent'
                : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-2)]'
                }`}
            >
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${notif.unread ? 'bg-[var(--color-primary)]/10' : 'bg-[var(--color-surface-2)]'
                  }`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm truncate ${notif.unread ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                      {notif.title}
                    </h3>
                  </div>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${notif.unread ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
                    {notif.desc}
                  </p>
                  <span className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-2 block">
                    {notif.time}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {notif.unread && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(127,255,0,0.6)]" />
                  )}
                  <ChevronRight size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                </div>
              </div>

              <button
                onClick={(e) => deleteNotif(e, notif.id)}
                className="absolute -right-2 -top-2 w-8 h-8 bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] z-10"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mb-6 text-[var(--color-text-muted)]">
              <Bell size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">All caught up!</h2>
            <p className="text-sm text-[var(--color-text-muted)]">No new notifications for you right now.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
