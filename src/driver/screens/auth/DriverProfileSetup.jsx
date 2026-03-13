import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Calendar, Users, ChevronRight } from 'lucide-react';

export default function DriverProfileSetup() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: ''
  });
  const [photo, setPhoto] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const isValid = formData.firstName && formData.lastName && formData.dob && formData.gender;

  const handleContinue = () => {
    if (isValid) {
      navigate('/setup/vehicle');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  const FormInput = ({ label, icon: Icon, type, value, field, placeholder }) => (
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
        onChange={(e) => setFormData({...formData, [field]: e.target.value})}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-lg font-display font-semibold text-white placeholder-[var(--color-text-muted)]/20 w-full"
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      {/* Step Header */}
      <header className="px-6 pt-safe pt-6 pb-4 sticky top-0 bg-[var(--color-bg)] z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1.5 flex-1 bg-[var(--color-primary)] rounded-full shadow-[0_0_10px_rgba(127,255,0,0.3)]"></div>
          <div className="h-1.5 flex-1 bg-[var(--color-surface-3)] rounded-full"></div>
          <div className="h-1.5 flex-1 bg-[var(--color-surface-3)] rounded-full"></div>
        </div>
        <h1 className="text-3xl font-display font-bold">Your <span className="text-[var(--color-primary)]">Profile</span></h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">Tell us a bit about yourself to get started.</p>
      </header>
      
      <div className="flex-1 px-6 pt-4 pb-32">
        {/* Avatar Setup */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <div className="w-28 h-28 rounded-full bg-[var(--color-surface-2)] border-2 border-[var(--color-primary)]/40 p-1 transition-all duration-300 group-hover:border-[var(--color-primary)]">
              <div className="w-full h-full rounded-full bg-[var(--color-surface-1)] flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img src={URL.createObjectURL(photo)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={42} className="text-[var(--color-text-muted)]" />
                )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-9 h-9 bg-[var(--color-primary)] rounded-full flex items-center justify-center border-4 border-[var(--color-bg)] shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Camera size={16} className="text-[var(--color-on-primary)]" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-3 font-bold uppercase tracking-widest">Profile Photo</p>
        </div>

        <div className="space-y-4">
          <FormInput label="First Name" icon={User} type="text" value={formData.firstName} field="firstName" placeholder="Michael" />
          <FormInput label="Last Name" icon={User} type="text" value={formData.lastName} field="lastName" placeholder="Okon" />
          <FormInput label="Date of Birth" icon={Calendar} type="date" value={formData.dob} field="dob" />
          
          {/* Gender Select with custom style */}
          <div className="bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-lg)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={12} className="text-[var(--color-text-muted)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Gender</span>
            </div>
            <div className="flex gap-3">
              {['Male', 'Female'].map(g => (
                <button
                  key={g}
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`flex-1 h-14 rounded-[var(--radius-md)] font-display font-bold transition-all duration-300 border ${formData.gender === g ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' : 'bg-[var(--color-surface-2)] border-[var(--color-surface-3)] text-[var(--color-text-secondary)]'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
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
