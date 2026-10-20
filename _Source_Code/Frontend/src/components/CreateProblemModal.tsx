import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  Trash2,
  Droplets,
  Car,
  Wind,
  Flame,
  Zap,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
import { ProblemCategory, ProblemPriority } from '../types';

export const CreateProblemModal: React.FC = () => {
  const {
    isCreateProblemOpen,
    setIsCreateProblemOpen,
    createProblem,
    currentUser,
    setSelectedProblemId,
  } = useSmartCity();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('waste');
  const [priority, setPriority] = useState<ProblemPriority>('high');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Sector 4, Green Park');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [evidenceError, setEvidenceError] = useState('');
  const [isReadingEvidence, setIsReadingEvidence] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isCreateProblemOpen) return null;

  const wardsList = [
    'Sector 1, Central CBD',
    'Sector 2, Education Hub',
    'Sector 3, Metro Station Plaza',
    'Sector 4, Green Park',
    'Sector 5, Residential Zone B',
    'Sector 6, Industrial Estate',
    'Sector 7, Tech Corridor',
    'Sector 8, Ring Road Cross',
    'Sector 9, Clean Air District',
    'Sector 10, Healthcare District',
    'Sector 11, Outer Ring Road Flyover',
    'Sector 12, Riverfront Boulevard',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isSaving) return;

    if (!customPhotoUrl) {
      setEvidenceError('Attach a PNG, JPEG, or WebP proof image before submitting.');
      return;
    }
    if (isReadingEvidence) {
      setEvidenceError('Wait for the proof image preview to finish loading before submitting.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createProblem({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'submitted',
        location: {
          address: address.trim() || ward,
          ward,
        },
        imageUrl: customPhotoUrl,
        beforePhotoUrl: customPhotoUrl,
        additionalPhotoUrls: [],
        proof: {
          beforePhotoUrl: customPhotoUrl,
          beforeEvidenceSource: 'citizen_submitted',
          additionalPhotoUrls: [],
          verificationStatus: 'pending',
          proofVerified: false,
          auditTrail: [{
            actor: currentUser.name,
            action: 'Citizen submitted before-proof evidence',
            role: 'citizen',
            timestamp: new Date().toISOString(),
          }],
        },
        verificationStatus: 'pending',
        auditTrail: [{
          actor: currentUser.name,
          action: 'Citizen submitted before-proof evidence',
          role: 'citizen',
          timestamp: new Date().toISOString(),
        }],
      });

      setSubmittedComplaintId(created.id);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsCreateProblemOpen(false);
        setSelectedProblemId(created.id);
      }, 1200);
    } catch (error) {
      setIsSuccess(false);
      setEvidenceError(
        error instanceof Error
          ? `Complaint could not be saved: ${error.message}`
          : 'Complaint submission failed. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0c1630] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0d1f40] to-[#0f2852] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Report & Share a City Problem
              </h2>
              <p className="text-[11px] text-slate-300">
                Logged in as <span className="text-cyan-300 font-semibold">{currentUser.name}</span> • Earn +25 Karma Points
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateProblemOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Grievance Registered Successfully!</h3>
            <p className="text-xs text-slate-300">
              Your complaint {submittedComplaintId} is saved for municipal review. +25 Civic Karma Points added.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Select Problem Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'waste', label: 'Waste Overflow', icon: Trash2 },
                  { id: 'water', label: 'Water Leakage', icon: Droplets },
                  { id: 'road_pothole', label: 'Road Pothole', icon: AlertTriangle },
                  { id: 'traffic', label: 'Traffic Bottleneck', icon: Car },
                  { id: 'electricity', label: 'Streetlight / Power', icon: Zap },
                  { id: 'pollution', label: 'Pollution / Smoke', icon: Wind },
                  { id: 'emergency', label: 'Emergency Hazard', icon: Flame },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setCategory(item.id as ProblemCategory)}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'bg-[#080e22] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Problem Title:
              </label>
              <input
                type="text"
                placeholder="E.g., Huge pothole near Sector 4 intersection causing bike accidents"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#080e22] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Detailed Description & Impact:
              </label>
              <textarea
                placeholder="Describe exact details, when it started, hazards, and landmarks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#080e22] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                required
              />
            </div>

            {/* Ward & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  City Ward / District:
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080e22] border border-slate-700 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {wardsList.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Specific Street / Landmark Address:
                </label>
                <input
                  type="text"
                  placeholder="E.g. In front of Metro Gate 3, near bakery"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080e22] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Priority / Urgency */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Urgency Level:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'low', label: 'Low (Cosmetic)' },
                  { id: 'medium', label: 'Medium (Standard)' },
                  { id: 'high', label: 'High (Disruptive)' },
                  { id: 'critical', label: 'Critical (Hazard/SOS)' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPriority(p.id as ProblemPriority)}
                    className={`py-2 px-1 text-center rounded-xl border font-semibold transition-all cursor-pointer text-[11px] ${
                      priority === p.id
                        ? p.id === 'critical'
                          ? 'bg-rose-600 border-rose-400 text-white shadow'
                          : p.id === 'high'
                          ? 'bg-amber-600 border-amber-400 text-white shadow'
                          : 'bg-cyan-600 border-cyan-400 text-white shadow'
                        : 'bg-[#080e22] border-slate-800 text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Attachment Picker */}
            <div>
              <label htmlFor="citizen-proof-image" className="block text-xs font-semibold text-slate-200 mb-1 cursor-pointer">
                Attach Before-Proof Photo (Required):
              </label>
              <div className="relative h-28 w-full mb-2 rounded-lg overflow-hidden border border-amber-500/30 bg-[#080e22]">
                {customPhotoUrl ? (
                  <img src={customPhotoUrl} alt="Citizen-submitted proof preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-slate-500">
                    No proof image attached
                  </span>
                )}
              </div>

              <input
                id="citizen-proof-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required
                disabled={isReadingEvidence || isSaving}
                aria-describedby="citizen-proof-image-help"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setEvidenceError('');
                  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                    setCustomPhotoUrl('');
                    setEvidenceError('Choose a PNG, JPEG, or WebP image no larger than 5 MB.');
                    e.target.value = '';
                    return;
                  }
                  setCustomPhotoUrl('');
                  setIsReadingEvidence(true);
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result !== 'string') {
                      setEvidenceError('The selected proof image could not be read.');
                    } else {
                      setCustomPhotoUrl(reader.result);
                    }
                    setIsReadingEvidence(false);
                  };
                  reader.onerror = () => {
                    setEvidenceError('The selected proof image could not be read.');
                    setIsReadingEvidence(false);
                  };
                  reader.onabort = () => {
                    setEvidenceError('Reading the selected proof image was interrupted. Please select it again.');
                    setIsReadingEvidence(false);
                  };
                  reader.readAsDataURL(file);
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-[#080e22] border border-slate-700 text-white text-xs placeholder-slate-500"
              />
              <p id="citizen-proof-image-help" className="mt-1 text-[10px] text-slate-400">
                {isReadingEvidence ? 'Loading proof image preview…' : 'PNG, JPEG, or WebP · Maximum 5 MB'}
              </p>
              {evidenceError && <p role="alert" className="mt-1 text-[11px] text-rose-300">{evidenceError}</p>}
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono-tech">
                <Sparkles className="w-3.5 h-3.5" /> +25 Citizen Karma upon submission
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProblemOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isReadingEvidence}
                  className="px-5 py-2 text-xs font-bold text-black rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  {isSaving ? 'Saving to City API…' : 'Submit Problem'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
