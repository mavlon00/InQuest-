import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import DriverNavBar from '../../app/components/DriverNavBar';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Camera, ChevronRight, CheckCircle, Clock,
  XCircle, AlertTriangle, Star, Zap, TrendingUp,
  Shield, Car, FileText, User, Edit2, Upload
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────
const KYC_CONFIG = {
  APPROVED:    { label: 'Verified',        color: 'var(--color-success)', Icon: CheckCircle  },
  SUBMITTED:   { label: 'Under Review',    color: 'var(--color-warning)', Icon: Clock        },
  REJECTED:    { label: 'Rejected',        color: 'var(--color-error)',   Icon: XCircle      },
  EXPIRED:     { label: 'Expired',         color: 'var(--color-warning)', Icon: AlertTriangle },
  NOT_STARTED: { label: 'Not Started',     color: 'var(--color-text-muted)', Icon: Shield    },
};

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-7 pb-3">
      <Icon size={16} className="text-[var(--color-primary)]" />
      <p className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{title}</p>
    </div>
  );
}

function InfoRow({ label, value, onEdit }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-surface-3)] last:border-0">
      <div>
        <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{value || '—'}</p>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="p-2 rounded-full hover:bg-[var(--color-surface-2)] transition-colors">
          <Edit2 size={14} className="text-[var(--color-text-muted)]" />
        </button>
      )}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="mx-4 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] overflow-hidden">
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 text-center">
      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display font-bold text-lg" style={{ color: color || 'var(--color-text-primary)' }}>{value}</p>
      {sub && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

// Mock documents
const DOCUMENTS = [
  { id: 'nin',        label: 'NIN Slip',              status: 'VERIFIED',  expiry: null             },
  { id: 'bvn',        label: 'BVN Verification',       status: 'VERIFIED',  expiry: null             },
  { id: 'gov_id',     label: 'National ID Card',       status: 'VERIFIED',  expiry: 'Dec 2027'       },
  { id: 'selfie',     label: 'Selfie with ID',         status: 'VERIFIED',  expiry: null             },
  { id: 'licence',    label: "Driver's Licence",       status: 'VERIFIED',  expiry: 'Aug 2026'       },
];

const DOC_STATUS_CONFIG = {
  VERIFIED: { label: 'Verified',    color: 'var(--color-success)', bg: 'rgba(74,222,128,0.12)'  },
  PENDING:  { label: 'Pending',     color: 'var(--color-warning)', bg: 'rgba(250,204,21,0.12)'  },
  REJECTED: { label: 'Rejected',    color: 'var(--color-error)',   bg: 'rgba(239,68,68,0.12)'   },
  EXPIRED:  { label: 'Expired',     color: 'var(--color-error)',   bg: 'rgba(239,68,68,0.12)'   },
  MISSING:  { label: 'Upload',      color: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.05)' },
};

export default function DriverProfile() {
  const navigate  = useNavigate();
  const { driver, kycStatus } = useDriverStore();
  const photoRef  = useRef();

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [editing,   setEditing]   = useState(null); // field being edited
  const [editValue, setEditValue] = useState('');

  const kyc = KYC_CONFIG[kycStatus] || KYC_CONFIG.NOT_STARTED;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setAvatarUrl(URL.createObjectURL(file));
    toast.success('Profile photo updated');
  };

  const openEdit = (field, current) => {
    setEditing(field);
    setEditValue(current || '');
  };

  const saveEdit = () => {
    toast.success(`${editing} updated`);
    setEditing(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-28">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-display font-semibold">Profile</h1>
      </header>

      {/* ── AVATAR HERO ── */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-[var(--color-surface-2)] border-2 border-[var(--color-primary)]/40 overflow-hidden flex items-center justify-center">
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              : <span className="text-4xl font-display font-bold text-[var(--color-primary)]">{driver?.firstName?.charAt(0)}</span>
            }
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <button
            onClick={() => photoRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center border-2 border-[var(--color-bg)] shadow-md"
          >
            <Camera size={14} className="text-[var(--color-on-primary)]" />
          </button>
        </div>

        <h2 className="text-xl font-display font-semibold">{driver?.firstName} {driver?.lastName}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">{driver?.phone}</p>

        {/* KYC badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold"
          style={{ color: kyc.color, borderColor: `${kyc.color}40`, backgroundColor: `${kyc.color}12` }}
        >
          <kyc.Icon size={12} />
          KYC {kyc.label}
        </div>
      </div>

      {/* ── PERSONAL INFO ── */}
      <SectionHeader icon={User} title="Personal Information" />
      <Card>
        <InfoRow label="First Name"    value={driver?.firstName}  onEdit={() => openEdit('First Name', driver?.firstName)} />
        <InfoRow label="Last Name"     value={driver?.lastName}   onEdit={() => openEdit('Last Name', driver?.lastName)} />
        <InfoRow label="Phone Number"  value={driver?.phone} />
        <InfoRow label="Date of Birth" value="15 August 1993"     onEdit={() => openEdit('Date of Birth', '1993-08-15')} />
        <InfoRow label="Gender"        value="Male"               onEdit={() => openEdit('Gender', 'Male')} />
        <InfoRow label="NIN"           value="•••••••••••"        />
        <InfoRow label="BVN"           value="•••••••••••"        />
      </Card>

      {/* ── RESIDENTIAL ADDRESS ── */}
      <SectionHeader icon={Shield} title="Residential Address" />
      <Card>
        <InfoRow label="Street"    value="12 Adeola Odeku Street"   onEdit={() => openEdit('Street', '12 Adeola Odeku Street')} />
        <InfoRow label="LGA"       value="Eti-Osa"                  onEdit={() => openEdit('LGA', 'Eti-Osa')} />
        <InfoRow label="State"     value="Lagos"                    />
        <InfoRow label="Landmark"  value="Opposite Shoprite Ikeja"  onEdit={() => openEdit('Landmark', 'Opposite Shoprite Ikeja')} />
      </Card>

      {/* ── VEHICLE INFO ── */}
      <SectionHeader icon={Car} title="Vehicle Information" />
      <Card>
        <div className="px-4 py-3 border-b border-[var(--color-surface-3)]">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-[var(--color-text-muted)]">Ownership</p>
            <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/12 px-2 py-0.5 rounded-full">INQUEST-OWNED</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">This vehicle is owned and maintained by Inquest Mobility. You operate it as an Inquest partner driver.</p>
        </div>
        <InfoRow label="Vehicle Model"    value={driver?.vehicle?.model}  />
        <InfoRow label="Year"             value={String(driver?.vehicle?.year)}   />
        <InfoRow label="Plate Number"     value={driver?.vehicle?.plate}  />
        <InfoRow label="Colour"           value={driver?.vehicle?.color}  />
        <InfoRow label="Vehicle Category" value="Keke Napep (3-wheeled)"  />
        <InfoRow label="Daily Usage Fee"  value="₦3,500 / day"            />
      </Card>

      {/* ── DOCUMENTS ── */}
      <SectionHeader icon={FileText} title="Documents & KYC" />
      <Card>
        {DOCUMENTS.map((doc) => {
          const cfg = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.MISSING;
          return (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-surface-3)] last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{doc.label}</p>
                {doc.expiry && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Expires {doc.expiry}</p>}
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-3"
                style={{ color: cfg.color, backgroundColor: cfg.bg }}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}

        <button
          onClick={() => navigate('/kyc')}
          className="w-full flex items-center justify-between px-4 py-4 text-sm text-[var(--color-primary)] font-semibold border-t border-[var(--color-surface-3)] active:bg-[var(--color-surface-2)]/50"
        >
          Update Documents
          <ChevronRight size={16} />
        </button>
      </Card>

      {/* ── PERFORMANCE STATS ── */}
      <SectionHeader icon={TrendingUp} title="Performance Stats" />
      <div className="mx-4 space-y-3">
        {/* Rating + Acceptance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-4 border border-[var(--color-surface-3)] text-center">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Rating</p>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star size={16} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
              <p className="font-display font-bold text-2xl">{driver?.rating}</p>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)]">from {driver?.totalTrips} ratings</p>
          </div>
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-4 border border-[var(--color-surface-3)] text-center">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Acceptance</p>
            <p className="font-display font-bold text-2xl text-[var(--color-success)]">94%</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">last 30 days</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Total Trips"  value={driver?.totalTrips?.toLocaleString()} color="var(--color-earnings)" />
          <StatBox label="Completion"   value="98.2%"  color="var(--color-success)" />
          <StatBox label="On Time"      value="91%"    color="var(--color-info)"    />
        </div>

        {/* Green points */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-4 border border-[var(--color-primary)]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center">
              <Zap size={18} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold">Green Points</p>
              <p className="text-xs text-[var(--color-text-muted)]">Eco-driving rewards</p>
            </div>
          </div>
          <p className="font-display font-bold text-xl text-[var(--color-primary)]">12,470</p>
        </div>
      </div>

      {/* ── KYC STATUS SECTION ── */}
      <SectionHeader icon={Shield} title="KYC Status" />
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Identity Verification</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Required to go online</p>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold"
              style={{ color: kyc.color, borderColor: `${kyc.color}40`, backgroundColor: `${kyc.color}12` }}
            >
              <kyc.Icon size={12} />
              {kyc.label}
            </div>
          </div>

          <div className="space-y-2 text-sm mb-4">
            {['BVN Verified', 'NIN Verified', 'Government ID', 'Selfie Match'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle size={14} className="text-[var(--color-success)] shrink-0" />
                <span className="text-[var(--color-text-secondary)]">{item}</span>
              </div>
            ))}
          </div>

          {kycStatus !== 'APPROVED' && (
            <button
              onClick={() => navigate('/kyc')}
              className="w-full h-11 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Upload size={16} /> Complete KYC
            </button>
          )}
        </div>
      </Card>

      <DriverNavBar />

      {/* Inline edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6" onClick={() => setEditing(null)}>
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-6 w-full max-w-sm" onClick={e => e.stopPropagation()} style={{ animation: 'fadeIn 0.2s ease' }}>
            <h3 className="text-lg font-display font-semibold mb-4">Edit {editing}</h3>
            <input
              autoFocus
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-12 px-4 text-white focus:border-[var(--color-primary)] outline-none transition-colors mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 h-11 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-semibold text-sm">Cancel</button>
              <button onClick={saveEdit} className="flex-1 h-11 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-semibold text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
