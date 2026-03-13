import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Palette, Calendar, Hash, ChevronRight, ChevronDown } from 'lucide-react';

export default function DriverVehicleSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    plateNumber: '',
    color: '',
    model: '',
    year: ''
  });
  const [focusedField, setFocusedField] = useState(null);

  const isValid = formData.plateNumber && formData.color && formData.model && formData.year;

  const handleContinue = () => {
    if (isValid) {
      navigate('/setup/documents');
    }
  };

  const FormInput = ({ label, icon: Icon, type, value, field, placeholder, uppercase = false }) => (
    <div 
      className={`relative h-20 px-6 rounded-[var(--radius-lg)] bg-[var(--color-surface-1)] border transition-all duration-300 flex flex-col justify-center cursor-text ${focusedField === field ? 'border-[var(--color-primary)] shadow-[0_0_20px_rgba(127,255,0,0.1)] bg-[var(--color-surface-2)]' : 'border-[var(--color-surface-3)]'}`}
      onClick={() => document.getElementById(field)?.focus()}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className={focusedField === field ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${focusedField === field ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
          {label}
        </span>
      </div>
      <input 
        id={field}
        type={type} 
        value={value}
        onFocus={() => setFocusedField(field)}
        onBlur={() => setFocusedField(null)}
        onChange={(e) => {
          let val = e.target.value;
          if (uppercase) val = val.toUpperCase();
          setFormData({...formData, [field]: val});
        }}
        placeholder={placeholder}
        className={`bg-transparent border-none outline-none text-lg font-display font-semibold text-white placeholder-[var(--color-text-muted)]/20 w-full ${uppercase ? 'uppercase' : ''}`}
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      {/* Step Header */}
      <header className="px-6 pt-safe pt-6 pb-4 sticky top-0 bg-[var(--color-bg)] z-10">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-2)]">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-3 flex-1">
            <div className="h-1.5 flex-1 bg-[var(--color-primary)] rounded-full"></div>
            <div className="h-1.5 flex-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_rgba(127,255,0,0.3)]"></div>
            <div className="h-1.5 flex-1 bg-[var(--color-surface-3)] rounded-full"></div>
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold">Your <span className="text-[var(--color-primary)]">Keke</span></h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">Register the vehicle you'll be using.</p>
      </header>
      
      <div className="flex-1 px-6 pt-6 pb-32">
        <div className="space-y-4">
          <FormInput 
            label="Plate Number" 
            icon={Hash} 
            type="text" 
            value={formData.plateNumber} 
            field="plateNumber" 
            placeholder="KJA-123XY" 
            uppercase 
          />
          
          <FormInput 
            label="Vehicle Color" 
            icon={Palette} 
            type="text" 
            value={formData.color} 
            field="color" 
            placeholder="Yellow" 
          />

          {/* Custom Dropdown for Model */}
          <div className={`relative h-20 px-6 rounded-[var(--radius-lg)] bg-[var(--color-surface-1)] border transition-all duration-300 flex flex-col justify-center cursor-pointer ${focusedField === 'model' ? 'border-[var(--color-primary)] shadow-[0_0_20px_rgba(127,255,0,0.1)] bg-[var(--color-surface-2)]' : 'border-[var(--color-surface-3)]'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Car size={12} className={focusedField === 'model' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${focusedField === 'model' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                Vehicle Model
              </span>
            </div>
            <div className="relative">
              <select 
                value={formData.model}
                onFocus={() => setFocusedField('model')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                className="w-full bg-transparent border-none outline-none text-lg font-display font-semibold text-white appearance-none cursor-pointer"
              >
                <option value="" disabled className="bg-[var(--color-surface-1)]">Select Model</option>
                <option value="Bajaj RE" className="bg-[var(--color-surface-1)]">Bajaj RE</option>
                <option value="TVS King" className="bg-[var(--color-surface-1)]">TVS King</option>
                <option value="Piaggio Ape" className="bg-[var(--color-surface-1)]">Piaggio Ape</option>
                <option value="Other" className="bg-[var(--color-surface-1)]">Other</option>
              </select>
              <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          </div>

          <FormInput 
            label="Year of Manufacture" 
            icon={Calendar} 
            type="number" 
            value={formData.year} 
            field="year" 
            placeholder="2022" 
          />
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-[var(--radius-md)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex gap-3">
          <Hash size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Ensure the <strong className="text-white">plate number</strong> matches your vehicle exactly as shown on your licence.
          </p>
        </div>
      </div>
      
      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-all-safe bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pt-8">
        <button 
          onClick={handleContinue}
          disabled={!isValid}
          className={`
            w-full h-16 rounded-[var(--radius-pill)] font-display font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
            ${isValid 
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[0_0_30px_rgba(127,255,0,0.2)] active:scale-[0.98]' 
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'}
          `}
        >
          CONTINUE
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
