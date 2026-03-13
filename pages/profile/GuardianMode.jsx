import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Plus, User, Trash2, MoreVertical, X, Send, RefreshCw, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';




export default function GuardianMode() {
  const navigate = useNavigate();
  const { setToastMessage } = useStore();

  const [guardians, setGuardians] = useState([
    { id: '1', name: 'Jane Doe', phone: '08012345678', relation: 'Sister', status: 'Active', canWatchTrips: true },
    { id: '2', name: 'John Smith', phone: '08098765432', relation: 'Friend', status: 'Pending', canWatchTrips: false },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Family');

  const [selectedGuardian, setSelectedGuardian] = useState(null);

  const handleAddGuardian = () => {
    if (!newName || !newPhone) return;
    if (guardians.length >= 5) {
      setToastMessage('Maximum of 5 guardians allowed');
      return;
    }

    const newGuardian = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      relation: newRelation,
      status: 'Pending',
      canWatchTrips: false,
    };

    setGuardians([...guardians, newGuardian]);
    setIsAdding(false);
    setNewName('');
    setNewPhone('');
    setNewRelation('Family');
    setToastMessage(`Invitation sent to ${newName}`);
  };

  const removeGuardian = (id) => {
    setGuardians(guardians.filter(g => g.id !== id));
    setSelectedGuardian(null);
    setToastMessage('Guardian removed');
  };

  const handleAction = (action, guardian) => {
    switch (action) {
      case 'resend':
      case 'reinvite':
        setToastMessage(`Invitation resent to ${guardian.name}`);
        break;
      case 'remove':
        removeGuardian(guardian.id);
        break;
      case 'toggleWatch':
        setGuardians(guardians.map(g =>
          g.id === guardian.id ? { ...g, canWatchTrips: !g.canWatchTrips } : g
        ));
        setToastMessage(guardian.canWatchTrips ? 'Watch access revoked' : 'Watch access granted');
        break;
    }
    setSelectedGuardian(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/20';
      case 'Pending': return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20';
      case 'Declined': return 'text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-display font-semibold">Guardian Mode</h1>
        </div>
        {guardians.length < 5 && (
          <button onClick={() => setIsAdding(true)} className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
            <Plus size={24} />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="bg-[var(--color-primary)]/10 p-4 rounded-2xl flex items-start gap-3 border border-[var(--color-primary)]/20">
          <ShieldCheck size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-text-primary)]">
            Guardians are trusted contacts who can track your rides in real-time and receive SOS alerts. You can add up to 5 guardians.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">My Guardians</h2>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">{guardians.length}/5</span>
          </div>

          {guardians.map((guardian) => (
            <motion.div
              key={guardian.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                  <User size={20} className="text-[var(--color-text-secondary)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{guardian.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(guardian.status)}`}>
                      {guardian.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{guardian.phone} • {guardian.relation}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuardian(guardian)}
                className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] rounded-full transition-colors"
              >
                <MoreVertical size={20} />
              </button>
            </motion.div>
          ))}

          {guardians.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--color-text-secondary)] text-sm">You haven't added any guardians yet.</p>
            </div>
          )}
        </div>

        {guardians.length < 5 && (
          <button onClick={() => setIsAdding(true)} className="w-full bg-[var(--color-surface-1)] p-4 rounded-2xl border border-dashed border-[var(--color-border)] flex items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">
            <Plus size={20} />
            <span className="font-medium text-sm">Add New Guardian</span>
          </button>
        )}

        <div className="pt-8">
          <button
            onClick={() => navigate('/profile/guardians/watch')}
            className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} /> Watch a Ride
          </button>
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
            Track a ride for someone who added you  guardian.
          </p>
        </div>
      </main>

      {/* Add Guardian Bottom Sheet */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-[var(--color-surface-1)] rounded-t-3xl border-t border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] p-6 pb-safe z-50"
            >
              <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-display font-semibold mb-6">Add Guardian</h2>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Relationship</label>
                  <select
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow appearance-none"
                  >
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddGuardian}
                disabled={!newName || !newPhone}
                className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
              >
                Send Invitation
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Guardian Menu Bottom Sheet */}
      <AnimatePresence>
        {selectedGuardian && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuardian(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-[var(--color-surface-1)] rounded-t-3xl border-t border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] p-6 pb-safe z-50"
            >
              <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-6" />

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-border-subtle)]">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                  <User size={24} className="text-[var(--color-text-secondary)]" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-semibold">{selectedGuardian.name}</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{selectedGuardian.phone}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {selectedGuardian.status === 'Pending' && (
                  <button
                    onClick={() => handleAction('resend', selectedGuardian)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors text-left"
                  >
                    <Send size={20} className="text-[var(--color-text-primary)]" />
                    <span className="font-medium text-sm">Resend Invitation</span>
                  </button>
                )}

                {selectedGuardian.status === 'Declined' && (
                  <button
                    onClick={() => handleAction('reinvite', selectedGuardian)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors text-left"
                  >
                    <RefreshCw size={20} className="text-[var(--color-text-primary)]" />
                    <span className="font-medium text-sm">Re-invite</span>
                  </button>
                )}

                {selectedGuardian.status === 'Active' && (
                  <button
                    onClick={() => handleAction('toggleWatch', selectedGuardian)}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-[var(--color-text-primary)]" />
                      <span className="font-medium text-sm">Allow to Watch Trips</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${selectedGuardian.canWatchTrips ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)]'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${selectedGuardian.canWatchTrips ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </button>
                )}

                <button
                  onClick={() => handleAction('remove', selectedGuardian)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--color-error)]/10 text-[var(--color-error)] transition-colors text-left"
                >
                  <Trash2 size={20} />
                  <span className="font-medium text-sm">Remove Guardian</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

