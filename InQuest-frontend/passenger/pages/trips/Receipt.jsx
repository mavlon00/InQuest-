import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, MapPin , ChevronLeft} from 'lucide-react';

export default function Receipt() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // Mock trip data
  const trip = {
    id: tripId || 'TRP-987654321',
    date: 'Oct 24, 2026 • 2:30 PM',
    type: 'On-Spot Booking',
    pickup: 'Allen Roundabout, Ikeja',
    destination: 'Ikeja City Mall',
    driver: 'Emmanuel Okafor',
    plate: 'ABA-123-KE',
    baseFare: '₦350',
    insurance: '₦100',
    total: '₦450',
    paymentMethod: 'Inquest Wallet',
  };

  const handleDownload = () => {
    // Generate PDF logic here
    console.log('Downloading PDF...');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inquest Trip Receipt',
          text: `Receipt for trip ${trip.id}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-bg)] sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Receipt</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center">
        {/* Receipt Card */}
        <div className="w-full max-w-md bg-white text-black rounded-3xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-8 text-center border-b-2 border-dashed border-gray-300 bg-gray-50">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2 h-6 bg-[#008751] rounded-sm" />
              <span className="font-display font-bold text-2xl tracking-tight text-black">INQUEST</span>
            </div>
            <p className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">Receipt</p>
            <p className="font-mono text-sm text-gray-700">{trip.id}</p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                <p className="font-medium text-sm">{trip.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                <p className="font-medium text-sm">{trip.type}</p>
              </div>
            </div>

            <div className="space-y-4 py-4 border-y border-gray-100">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">From</p>
                  <p className="font-medium text-sm">{trip.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#008751] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">To</p>
                  <p className="font-medium text-sm">{trip.destination}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Driver</p>
                <p className="font-medium text-sm">{trip.driver}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
                <p className="font-mono font-medium text-sm">{trip.plate}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium">{trip.baseFare}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trip Insurance</span>
                <span className="font-medium">{trip.insurance}</span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black flex justify-between items-center">
              <span className="font-bold text-lg">Total Paid</span>
              <span className="font-display font-bold text-2xl text-[#008751]">{trip.total}</span>
            </div>

            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
              <p className="font-medium text-sm">{trip.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-md mt-8 space-y-4">
          <button
            onClick={handleDownload}
            className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Download size={20} /> Download PDF
          </button>
          <button
            onClick={handleShare}
            className="w-full bg-transparent border-2 border-[var(--color-border)] text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-2)] transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Share2 size={20} /> Share Receipt
          </button>
        </div>
      </main>
    </div>
  );
}

