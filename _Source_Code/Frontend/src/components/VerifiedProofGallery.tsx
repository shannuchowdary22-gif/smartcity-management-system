import React, { useState } from 'react';
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  MapPin,
  Calendar,
  ThumbsUp,
  Share2,
  Check,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
import { ProblemItem } from '../types';
import { getEvidenceDisplayUrl, getEvidenceSource } from '../utils/problemEvidence';
import { EvidenceImage } from './EvidenceImage';

export const VerifiedProofGallery: React.FC = () => {
  const { problems, setSelectedProblemId, upvoteProblem, currentUser } = useSmartCity();
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter only resolved problems that have both before or after proof
  const resolvedWithProof = problems.filter(
    (p) => p.status === 'resolved' || Boolean(p.resolutionPhotoUrl)
  );
  const verifiedProofCount = resolvedWithProof.filter((problem) =>
    problem.status === 'resolved' &&
    problem.verificationStatus === 'approved' &&
    problem.proof?.proofVerified === true &&
    Boolean(problem.proof?.beforePhotoUrl || problem.beforePhotoUrl || problem.imageUrl) &&
    Boolean(problem.proof?.afterPhotoUrl || problem.resolutionPhotoUrl || problem.verifiedPhotoUrl) &&
    getEvidenceSource(
      problem.proof?.beforeEvidenceSource,
      problem.proof?.beforePhotoUrl || problem.beforePhotoUrl || problem.imageUrl,
      'citizen_submitted',
    ) !== 'demo_illustration' &&
    getEvidenceSource(
      problem.proof?.afterEvidenceSource,
      problem.proof?.afterPhotoUrl || problem.resolutionPhotoUrl || problem.verifiedPhotoUrl,
      'municipal_submitted',
    ) !== 'demo_illustration'
  ).length;

  const filtered = resolvedWithProof.filter((p) => {
    if (selectedWard !== 'all' && p.location.ward !== selectedWard) return false;
    return true;
  });

  const wards = Array.from(new Set(resolvedWithProof.map((p) => p.location.ward)));

  const handleShare = (e: React.MouseEvent, problem: ProblemItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/#proof-${problem.id}: Resolved ${problem.title}`
    );
    setCopiedId(problem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d2238] via-[#10304a] to-[#0d2238] border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-tech flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Civic Evidence Showcase
            </span>
            <span className="text-xs text-slate-400">Public Accountability</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-display font-bold text-white tracking-tight">
            Before & After Evidence
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Browse civic evidence and municipal action records. Demonstration illustrations are clearly marked and do not represent citizen submissions or verified repairs.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#081326] px-4 py-2.5 rounded-xl border border-emerald-500/30 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Verified evidence records</div>
            <div className="text-lg font-bold font-mono-tech text-emerald-400">
            {verifiedProofCount} Issues
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      {/* Ward Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold shrink-0">Filter Ward:</span>
        <button
          onClick={() => setSelectedWard('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
            selectedWard === 'all'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-[#0b142c] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Sectors ({resolvedWithProof.length})
        </button>
        {wards.map((ward) => (
          <button
            key={ward}
            onClick={() => setSelectedWard(ward)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
              selectedWard === ward
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-[#0b142c] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {ward}
          </button>
        ))}
      </div>

      {/* Proof Gallery Cards */}
      <div className="space-y-6">
        {filtered.map((problem) => {
          const hasUpvoted = problem.upvotedBy.includes(currentUser.id);
          const beforeUrl = getEvidenceDisplayUrl(
            problem.proof?.beforePhotoUrl || problem.beforePhotoUrl || problem.imageUrl,
            problem.category,
            'before',
            problem.title,
          );
          const afterUrl = getEvidenceDisplayUrl(
            problem.proof?.afterPhotoUrl || problem.resolutionPhotoUrl || problem.verifiedPhotoUrl,
            problem.category,
            'after',
            problem.title,
          );
          const beforeIsDemo = getEvidenceSource(
            problem.proof?.beforeEvidenceSource,
            beforeUrl,
            'citizen_submitted',
          ) === 'demo_illustration';
          const afterIsDemo = getEvidenceSource(
            problem.proof?.afterEvidenceSource,
            afterUrl,
            'municipal_submitted',
          ) === 'demo_illustration';
          const hasDemoEvidence = beforeIsDemo || afterIsDemo;
          const isVerified = problem.status === 'resolved' &&
            problem.verificationStatus === 'approved' &&
            problem.proof?.proofVerified === true &&
            Boolean(beforeUrl) &&
            Boolean(afterUrl) &&
            !hasDemoEvidence;

          return (
            <div
              key={problem.id}
              onClick={() => setSelectedProblemId(problem.id)}
              className="p-5 rounded-2xl bg-[#0b142c] border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer shadow-lg space-y-4 group"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-tech text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
                      {problem.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 font-mono-tech ${
                      isVerified
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border-amber-500/40'
                    }`}>
                      {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                      {isVerified
                        ? 'Verified resolution'
                        : hasDemoEvidence
                          ? 'Sample record · not verified'
                          : problem.verificationStatus === 'rejected'
                            ? 'Evidence rejected'
                            : 'Not verified'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono-tech bg-slate-800 text-slate-300 uppercase">
                      {problem.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {problem.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {problem.location.ward}
                  </span>
                  {problem.resolvedAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        {new Date(problem.resolvedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Side-by-Side Photographic Proof (BEFORE vs AFTER) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE: Citizen Photo Proof */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1 font-mono-tech">
                      <Camera className="w-3.5 h-3.5" /> BEFORE: Issue Evidence
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Reported by {problem.reporter.name}
                    </span>
                  </div>
                  <div className="relative h-56 rounded-xl overflow-hidden border border-amber-500/30 bg-black">
                    {beforeUrl ? (
                      <EvidenceImage
                        src={beforeUrl}
                        alt={beforeIsDemo ? `Demonstration illustration of ${problem.title}` : `Issue evidence for ${problem.title}`}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        No initial image submitted
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-amber-300 border border-amber-500/40 font-mono-tech">
                      {beforeIsDemo ? 'DEMO ILLUSTRATION · NOT CITIZEN EVIDENCE' : 'Citizen-provided evidence'}
                    </span>
                  </div>
                </div>

                {/* AFTER: Municipal Resolution Proof */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1 font-mono-tech">
                      <ShieldCheck className="w-3.5 h-3.5" /> AFTER: Resolution Evidence
                    </span>
                    <span className="text-[11px] text-emerald-300 font-mono-tech">
                      {problem.assignedTo?.officerName || 'Municipal Field Team'}
                    </span>
                  </div>
                  <div className={`relative h-56 rounded-xl overflow-hidden border bg-black ${
                    isVerified ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-slate-700'
                  }`}>
                    {afterUrl ? (
                      <EvidenceImage
                        src={afterUrl}
                        alt={afterIsDemo ? `Demonstration illustration of a possible repair for ${problem.title}` : `Resolution evidence for ${problem.title}`}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        No resolution evidence submitted
                      </div>
                    )}
                    <span className={`absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded backdrop-blur-sm border font-mono-tech ${
                      isVerified
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                        : 'bg-black/90 text-amber-300 border-amber-500/50'
                    }`}>
                      {afterIsDemo ? 'DEMO ILLUSTRATION · NOT VERIFIED REPAIR' : isVerified ? 'Verified municipal evidence' : 'Unverified resolution evidence'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Action Report Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider font-mono-tech">
                    <ShieldCheck className="w-3.5 h-3.5" /> {hasDemoEvidence
                      ? 'Sample action report · not independently verified'
                      : 'Municipal Action Report'}
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {problem.resolutionNotes ||
                      'Field crew completed civil repair, sensor re-calibration, and site clearance.'}
                  </p>
                  {problem.assignedTo && (
                    <div className="text-[10px] text-slate-400 font-mono-tech">
                      Department: {problem.assignedTo.department} • Closed on{' '}
                      {problem.resolvedAt
                        ? new Date(problem.resolvedAt).toLocaleDateString()
                        : 'Recent'}
                    </div>
                  )}
                </div>

                {/* Upvote & Share Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      upvoteProblem(problem.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      hasUpvoted
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-[#0f1933] border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-cyan-400 text-cyan-400' : ''}`}
                    />
                    <span>{problem.upvotes}</span>
                  </button>

                  <button
                    onClick={(e) => handleShare(e, problem)}
                    className="p-1.5 rounded-lg bg-[#0f1933] border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Share Proof Link"
                  >
                    {copiedId === problem.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0b142c] border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No proof records found in this ward</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select "All Sectors" or check back as more work orders are completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
