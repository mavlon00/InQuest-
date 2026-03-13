import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, Camera, Upload, X, CheckCircle,
  ChevronDown, AlertCircle, Shield, FileText, User
} from 'lucide-react';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT – Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

const ID_TYPES = [
  { value: 'NATIONAL_ID',   label: 'National ID Card',       hasFront: true, hasBack: true  },
  { value: 'VOTERS_CARD',   label: "Voter's Card",           hasFront: true, hasBack: true  },
  { value: 'PASSPORT',      label: 'International Passport', hasFront: true, hasBack: false },
  { value: 'DRIVERS_LICENCE', label: "Driver's Licence",    hasFront: true, hasBack: true  },
];

const STEPS = ['Identity', 'ID Document', 'Selfie', 'Address'];

function Step({ current, total, labels }) {
  return (
    <div className="px-6 pt-4 pb-2">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < current ? 'bg-[var(--color-primary)]' : i === current ? 'bg-[var(--color-primary)]/50' : 'bg-[var(--color-surface-3)]'}`} />
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-secondary)]">
        Step {current + 1} of {total} — <span className="text-[var(--color-text-primary)] font-medium">{labels[current]}</span>
      </p>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', maxLength, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={type === 'tel' || type === 'number' ? 'numeric' : 'text'}
        className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-14 px-4 text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
      />
      {hint && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
}

function UploadBox({ label, sublabel, file, onFile, onRemove, accept = 'image/*,.pdf' }) {
  const ref = useRef();

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }
    const valid = ['image/jpeg','image/png','application/pdf'];
    if (!valid.includes(f.type)) { toast.error('Only JPG, PNG or PDF allowed.'); return; }
    onFile(f);
  };

  const isImage = file && file.type?.startsWith('image/');
  const isPDF   = file && file.type === 'application/pdf';

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</label>
      {sublabel && <p className="text-xs text-[var(--color-text-muted)]">{sublabel}</p>}
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />

      {!file ? (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full h-[120px] rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-surface-3)] hover:border-[var(--color-primary)]/60 bg-[var(--color-surface-2)] flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <Upload size={24} className="text-[var(--color-primary)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">Tap to upload</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">JPG · PNG · PDF — Max 10MB</p>
        </button>
      ) : (
        <div className="relative rounded-[var(--radius-md)] border border-[var(--color-primary)]/40 bg-[var(--color-surface-2)] overflow-hidden h-[120px] flex items-center justify-center">
          {isImage && (
            <img src={URL.createObjectURL(file)} alt="Upload preview" className="w-full h-full object-cover" />
          )}
          {isPDF && (
            <div className="flex flex-col items-center gap-2">
              <FileText size={40} className="text-[var(--color-primary)]" />
              <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[180px] px-2">{file.name}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center"
          >
            <X size={14} className="text-white" />
          </button>
          <div className="absolute bottom-2 left-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle size={10} /> Uploaded
          </div>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full"
          >
            Replace
          </button>
        </div>
      )}
    </div>
  );
}

export default function DriverKYC() {
  const navigate = useNavigate();
  const { setKycStatus, kycStatus } = useDriverStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 — Identity
  const [bvn, setBvn]           = useState('');
  const [nin, setNin]           = useState('');

  // Step 1 — ID Document
  const [idType, setIdType]     = useState('');
  const [idFront, setIdFront]   = useState(null);
  const [idBack, setIdBack]     = useState(null);

  // Step 2 — Selfie
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive]   = useState(false);
  const [selfieBlob, setSelfieBlob]       = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [cameraError, setCameraError]     = useState('');

  // Step 3 — Address
  const [street, setStreet]       = useState('');
  const [lga, setLga]             = useState('');
  const [state, setState]         = useState('');
  const [landmark, setLandmark]   = useState('');

  const selectedIdType = ID_TYPES.find(t => t.value === idType);

  // — Camera helpers —
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      setSelfieBlob(blob);
      setSelfiePreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.92);
  }, [stopCamera]);

  const retakeSelfie = () => {
    setSelfieBlob(null);
    setSelfiePreview(null);
    startCamera();
  };

  // — Validation per step —
  const canProceed = () => {
    if (step === 0) return bvn.length === 11 && nin.length === 11;
    if (step === 1) {
      if (!idType) return false;
      if (!idFront) return false;
      if (selectedIdType?.hasBack && !idBack) return false;
      return true;
    }
    if (step === 2) return !!selfieBlob;
    if (step === 3) return street.trim() && lga.trim() && state;
    return false;
  };

  const next = () => {
    if (!canProceed()) { toast.error('Please complete all fields.'); return; }
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mock API call — POST /driver/kyc
      await new Promise(r => setTimeout(r, 2000));
      setKycStatus('SUBMITTED');
      toast.success('KYC submitted successfully!');
      navigate('/kyc/pending', { replace: true });
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // — Render steps —
  const renderStep0 = () => (
    <div className="space-y-5">
      <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 flex gap-3 items-start border border-[var(--color-primary)]/20">
        <Shield size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Your BVN and NIN are required by CBN regulations to verify your identity. They are encrypted and never shared.
        </p>
      </div>
      <InputField
        label="Bank Verification Number (BVN)"
        value={bvn}
        onChange={setBvn}
        placeholder="Enter 11-digit BVN"
        type="tel"
        maxLength={11}
        hint={bvn.length > 0 ? `${bvn.length}/11 digits` : 'Dial *565*0# on your bank number to get your BVN'}
      />
      <InputField
        label="National Identification Number (NIN)"
        value={nin}
        onChange={setNin}
        placeholder="Enter 11-digit NIN"
        type="tel"
        maxLength={11}
        hint={nin.length > 0 ? `${nin.length}/11 digits` : 'Check your NIN slip or dial *346# on MTN'}
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* ID Type Selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Government-issued ID Type</label>
        <div className="grid grid-cols-2 gap-2">
          {ID_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setIdType(t.value); setIdFront(null); setIdBack(null); }}
              className={`p-3 rounded-[var(--radius-md)] border text-left transition-all ${idType === t.value ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
            >
              <p className="text-xs font-semibold">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {idType && (
        <>
          <UploadBox
            label="Front of ID"
            sublabel="Clear photo showing your name and photo"
            file={idFront}
            onFile={setIdFront}
            onRemove={() => setIdFront(null)}
          />
          {selectedIdType?.hasBack && (
            <UploadBox
              label="Back of ID"
              sublabel="Reverse side of your ID card"
              file={idBack}
              onFile={setIdBack}
              onRemove={() => setIdBack(null)}
            />
          )}
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 flex gap-3 items-start border border-[var(--color-primary)]/20">
        <AlertCircle size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Hold your ID beside your face and take a clear photo in good lighting.
          <strong className="text-white block mt-1">Camera only — no gallery uploads permitted.</strong>
        </p>
      </div>

      {!cameraActive && !selfiePreview && (
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-[var(--color-surface-2)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[var(--color-surface-3)]">
            <User size={48} className="text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-secondary)]">Camera preview will appear here</p>
          </div>
          {cameraError && (
            <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-[var(--radius-md)] p-3">
              <p className="text-[var(--color-error)] text-sm">{cameraError}</p>
            </div>
          )}
          <button
            type="button"
            onClick={startCamera}
            className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold flex items-center justify-center gap-2"
          >
            <Camera size={20} /> Open Camera
          </button>
        </div>
      )}

      {cameraActive && !selfiePreview && (
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-black rounded-[var(--radius-lg)] overflow-hidden relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-4 border-[var(--color-primary)]/40 rounded-[var(--radius-lg)] pointer-events-none" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 h-12 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-[2] h-12 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold flex items-center justify-center gap-2"
            >
              <Camera size={18} /> Capture Photo
            </button>
          </div>
        </div>
      )}

      {selfiePreview && (
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden relative border-2 border-[var(--color-primary)]">
            <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={12} /> Selfie captured
            </div>
          </div>
          <button
            type="button"
            onClick={retakeSelfie}
            className="w-full h-12 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-semibold"
          >
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <InputField
        label="Street Address"
        value={street}
        onChange={setStreet}
        placeholder="e.g. 12 Adeola Odeku Street"
      />
      <InputField
        label="Local Government Area (LGA)"
        value={lga}
        onChange={setLga}
        placeholder="e.g. Eti-Osa"
      />
      {/* State Dropdown */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">State</label>
        <div className="relative">
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-14 px-4 pr-10 text-white focus:border-[var(--color-primary)] outline-none appearance-none transition-colors"
          >
            <option value="" className="bg-[var(--color-surface-2)]">Select state</option>
            {NIGERIAN_STATES.map(s => (
              <option key={s} value={s} className="bg-[var(--color-surface-2)]">{s}</option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
      </div>
      <InputField
        label="Nearest Landmark"
        value={landmark}
        onChange={setLandmark}
        placeholder="e.g. Opposite Shoprite Ikeja"
        hint="Optional but helps with verification"
      />
    </div>
  );

  const renderCurrentStep = () => {
    if (step === 0) return renderStep0();
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-2">
        {step > 0 ? (
          <button
            onClick={() => { stopCamera(); setStep(s => s - 1); }}
            className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-2)] mr-2"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-10 mr-2" />
        )}
        <div>
          <h1 className="text-xl font-display font-semibold">Identity Verification</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Required to go online</p>
        </div>
      </header>

      <Step current={step} total={STEPS.length} labels={STEPS} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-8">
        {renderCurrentStep()}
      </div>

      {/* Footer CTA */}
      <div className="p-6 border-t border-[var(--color-surface-3)] bg-[var(--color-bg)] pb-safe">
        <button
          onClick={next}
          disabled={!canProceed() || loading}
          className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-[var(--shadow-glow)]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Submitting…
            </span>
          ) : step === STEPS.length - 1 ? (
            'Submit KYC'
          ) : (
            <>Continue <ArrowRight size={18} /></>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
