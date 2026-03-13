import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Upload, X, CheckCircle, AlertCircle,
  FileText, RotateCcw, Loader
} from 'lucide-react';

const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_LABELS = 'JPG, PNG or PDF — max 10MB';

// All required documents the driver must upload during onboarding
const REQUIRED_DOCS = [
  {
    id: 'driver_licence',
    label: "Driver's Licence",
    sublabel: 'Front of your valid driver\'s licence',
    required: true,
  },
  {
    id: 'vehicle_licence',
    label: 'Vehicle Licence',
    sublabel: 'Current vehicle registration certificate',
    required: true,
  },
  {
    id: 'roadworthiness',
    label: 'Roadworthiness Certificate',
    sublabel: 'Current roadworthiness certificate',
    required: true,
  },
  {
    id: 'insurance',
    label: 'Vehicle Insurance',
    sublabel: 'Third-party or comprehensive insurance',
    required: true,
  },
  {
    id: 'passport_photo',
    label: 'Passport Photograph',
    sublabel: 'Clear, white-background passport photo',
    required: true,
  },
  {
    id: 'utility_bill',
    label: 'Utility Bill (Proof of Residence)',
    sublabel: 'Not older than 3 months',
    required: false,
  },
];

// ── Single file upload box component ─────────────────────────────
function DocUploadBox({ doc, file, uploadState, onFile, onRemove, onRetry }) {
  const ref = useRef();

  const validate = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error(`${doc.label}: Only JPG, PNG or PDF allowed.`);
      return false;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error(`${doc.label}: File too large. Max 10MB.`);
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f && validate(f)) onFile(doc.id, f);
    e.target.value = '';
  };

  const isImage = file && file.type?.startsWith('image/');
  const isPDF   = file && file.type === 'application/pdf';

  return (
    <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] overflow-hidden">
      {/* Doc header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{doc.label}</p>
            {!doc.required && (
              <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">Optional</span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{doc.sublabel}</p>
        </div>
        {/* Status badge */}
        {uploadState === 'success' && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-success)] shrink-0 ml-2">
            <CheckCircle size={12} /> Uploaded
          </div>
        )}
        {uploadState === 'error' && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-error)] shrink-0 ml-2">
            <AlertCircle size={12} /> Failed
          </div>
        )}
        {uploadState === 'uploading' && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] shrink-0 ml-2">
            <Loader size={12} className="animate-spin" /> Uploading
          </div>
        )}
      </div>

      {/* Upload / Preview area */}
      <div className="px-4 pb-4">
        <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={handleChange} />

        {!file ? (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="w-full h-[100px] rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-surface-3)] hover:border-[var(--color-primary)]/50 bg-[var(--color-surface-2)] flex flex-col items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <Upload size={22} className="text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">Tap to upload</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">{ALLOWED_LABELS}</span>
          </button>
        ) : (
          <div>
            {/* Preview */}
            <div className="relative h-[100px] rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-surface-3)] bg-[var(--color-surface-2)] flex items-center justify-center mb-2">
              {isImage && (
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
              )}
              {isPDF && (
                <div className="flex flex-col items-center gap-1">
                  <FileText size={32} className="text-[var(--color-primary)]" />
                  <p className="text-xs text-[var(--color-text-secondary)] truncate max-w-[180px] px-2">{file.name}</p>
                </div>
              )}
              {/* Remove button */}
              <button
                onClick={() => onRemove(doc.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center"
              >
                <X size={12} className="text-white" />
              </button>

              {/* Upload progress overlay */}
              {uploadState === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader size={24} className="text-[var(--color-primary)] animate-spin mx-auto mb-1" />
                    <p className="text-xs text-white">Uploading…</p>
                  </div>
                </div>
              )}
            </div>

            {/* File info bar */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[var(--color-text-muted)] truncate flex-1 mr-3">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)}MB
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {uploadState === 'error' && (
                  <button
                    onClick={() => onRetry(doc.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-warning)] hover:text-white transition-colors"
                  >
                    <RotateCcw size={11} /> Retry
                  </button>
                )}
                <button
                  onClick={() => ref.current?.click()}
                  className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Replace
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {uploadState === 'uploading' && (
              <div className="mt-2 h-1 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] rounded-full animate-[progress_1.8s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function DriverDocumentUpload() {
  const navigate = useNavigate();

  // files: { [docId]: File }
  const [files,        setFiles]        = useState({});
  // uploadStates: { [docId]: 'idle' | 'uploading' | 'success' | 'error' }
  const [uploadStates, setUploadStates] = useState({});
  const [submitting,   setSubmitting]   = useState(false);

  const setFileForDoc = (id, file) => {
    setFiles(prev => ({ ...prev, [id]: file }));
    setUploadStates(prev => ({ ...prev, [id]: 'idle' }));
    // Auto-upload immediately on selection
    simulateUpload(id, file);
  };

  const removeFile = (id) => {
    setFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
    setUploadStates(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const simulateUpload = async (id, file) => {
    setUploadStates(prev => ({ ...prev, [id]: 'uploading' }));
    try {
      // Simulate upload — in production: POST /driver/documents with FormData
      await new Promise((resolve, reject) => setTimeout(
        // Simulate 10% failure rate for demo
        Math.random() < 0.1 ? reject : resolve,
        1200 + Math.random() * 800
      ));
      setUploadStates(prev => ({ ...prev, [id]: 'success' }));
    } catch {
      setUploadStates(prev => ({ ...prev, [id]: 'error' }));
      toast.error(`Upload failed for ${REQUIRED_DOCS.find(d => d.id === id)?.label}. Tap Retry.`);
    }
  };

  const retryUpload = (id) => {
    const file = files[id];
    if (file) simulateUpload(id, file);
  };

  // All required docs must have status 'success' to enable submit
  const allRequiredUploaded = REQUIRED_DOCS
    .filter(d => d.required)
    .every(d => uploadStates[d.id] === 'success');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      toast.success('Documents submitted for review!');
      navigate('/setup/pending', { replace: true });
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const successCount = REQUIRED_DOCS.filter(d => uploadStates[d.id] === 'success').length;
  const requiredCount = REQUIRED_DOCS.filter(d => d.required).length;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-32">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-semibold">Upload Documents</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Step 3 of 3</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-text-muted)]">Required</p>
          <p className="text-sm font-bold text-[var(--color-primary)]">{successCount}/{requiredCount}</p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--color-surface-3)]">
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-500"
          style={{ width: `${(successCount / requiredCount) * 100}%` }}
        />
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Info banner */}
        <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 flex gap-3 items-start border border-[var(--color-surface-3)]">
          <AlertCircle size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Ensure all documents are <strong className="text-white">clear, unblurred, and not expired</strong>. Files must be JPG, PNG, or PDF and under 10MB. Uploaded files are encrypted and stored securely.
          </p>
        </div>

        {/* Document upload boxes */}
        {REQUIRED_DOCS.map(doc => (
          <DocUploadBox
            key={doc.id}
            doc={doc}
            file={files[doc.id] || null}
            uploadState={uploadStates[doc.id] || 'idle'}
            onFile={setFileForDoc}
            onRemove={removeFile}
            onRetry={retryUpload}
          />
        ))}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg)] border-t border-[var(--color-surface-3)] p-4 pb-safe z-20">
        {!allRequiredUploaded && (
          <p className="text-xs text-[var(--color-text-muted)] text-center mb-3">
            Upload all {requiredCount} required documents to continue ({requiredCount - successCount} remaining)
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allRequiredUploaded || submitting}
          className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all shadow-[var(--shadow-glow)]"
        >
          {submitting ? (
            <><Loader size={18} className="animate-spin" /> Submitting…</>
          ) : (
            'Submit Documents'
          )}
        </button>
      </div>

      <style>{`
        @keyframes progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
