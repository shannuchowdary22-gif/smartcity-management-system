import React, { useState } from 'react';
import {
  X,
  ThumbsUp,
  Share2,
  CheckCircle2,
  Clock,
  Wrench,
  MessageCircle,
  Camera,
  MapPin,
  Send,
  ShieldCheck,
  User,
  AlertTriangle,
  Check,
  Cpu,
  Zap,
  Activity,
  AlertCircle,
  Truck,
  Timer,
  Shield,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
import { ProblemStatus } from '../types';
import { getEvidenceDisplayUrl, getEvidenceSource, isDemoEvidenceUrl } from '../utils/problemEvidence';
import { EvidenceImage } from './EvidenceImage';

export const ProblemDetailModal: React.FC = () => {
  const {
    selectedProblemId,
    setSelectedProblemId,
    problems,
    currentUser,
    upvoteProblem,
    addComment,
    adminResolveProblem,
  } = useSmartCity();

  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  // Admin inline resolution fields
  const [adminStatus, setAdminStatus] = useState<ProblemStatus>('resolved');
  const [adminNotes, setAdminNotes] = useState('');
  const [adminResolutionPhotoUrl, setAdminResolutionPhotoUrl] = useState('');
  const [showAdminResolver, setShowAdminResolver] = useState(false);

  if (!selectedProblemId) return null;

  const problem = problems.find((p) => p.id === selectedProblemId);
  if (!problem) return null;

  const hasUpvoted = problem.upvotedBy.includes(currentUser.id);
  const ai = problem.aiAnalysis;
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

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(problem.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/#problem-${problem.id}: ${problem.title}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminStatus === 'resolved' && !adminResolutionPhotoUrl.trim()) {
      window.alert('Upload resolution proof before closing this complaint.');
      return;
    }
    const saved = await adminResolveProblem(
      problem.id,
      adminStatus,
      adminNotes,
      adminStatus === 'resolved' ? adminResolutionPhotoUrl : undefined,
      currentUser.name,
      currentUser.department || 'Urban Response Team',
      'needs_review',
      'Inline status update; evidence requires formal municipal review',
      problem.proof?.beforePhotoUrl || problem.beforePhotoUrl || problem.imageUrl,
    );
    if (!saved) return;
    setShowAdminResolver(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0c1630] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8 flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 bg-gradient-to-r from-[#0d1f40] to-[#0f2852] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono-tech text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
              {problem.id}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono-tech ${
                problem.status === 'resolved'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-amber-950 text-amber-300 border border-amber-600/50'
              }`}
            >
              {problem.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300">
              Priority: {problem.priority}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-[#080e22] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
              title="Share Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSelectedProblemId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Title & Reporter Info */}
          <div>
            <h1 className="text-lg font-bold text-white leading-snug">
              {problem.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-400 mt-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <img
                  src={problem.reporter.avatar}
                  alt={problem.reporter.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-slate-300 font-medium">
                  {problem.reporter.name}
                </span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {problem.location.address} ({problem.location.ward})
              </span>
              <span>•</span>
              <span>{new Date(problem.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-[#080f24] border border-slate-800 text-slate-300 leading-relaxed">
            {problem.description}
          </div>

          {/* Photos: Before & After (if resolved) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {beforeUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" /> {beforeIsDemo ? 'Demo illustration · not citizen evidence:' : 'Citizen-provided evidence:'}
                </span>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-800 bg-black relative group">
                  <EvidenceImage
                    src={beforeUrl}
                    alt={beforeIsDemo ? `Demonstration illustration of ${problem.title}` : `Reported issue: ${problem.title}`}
                  />
                  {ai && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-cyan-500/60 text-[10px] font-mono-tech text-cyan-300 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400" /> AI Scanned
                    </div>
                  )}
                </div>
              </div>
            )}

            {afterUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {afterIsDemo ? 'Demo illustration · not verified repair:' : 'Municipal resolution evidence:'}
                </span>
                <div className="h-48 rounded-xl overflow-hidden border border-emerald-600/50 bg-black shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <EvidenceImage
                    src={afterUrl}
                    alt={afterIsDemo ? 'Demonstration repair illustration, not verified evidence' : 'Municipal resolution evidence'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Comprehensive AI Computer Vision Analysis Card */}
          {ai && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1836] via-[#091228] to-[#070e20] border border-cyan-500/40 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                    <Cpu className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">
                      AI Computer Vision & Automated Hazard Diagnostics
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono-tech">
                      Model: UrbanVision-Edge v4.2 • Confidence: {ai.confidence ?? ai.confidenceScore ?? 95.4}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Risk Score:</span>
                  {(() => {
                    const score = ai.riskScore ?? ai.severityRating ?? 65;
                    const sev = (ai.severity || (score >= 80 ? 'critical' : score >= 50 ? 'high' : 'medium')).toString().toUpperCase();
                    return (
                      <span className={`font-mono-tech font-bold text-xs px-2 py-0.5 rounded ${
                        score >= 80 ? 'bg-rose-950 text-rose-300 border border-rose-600' :
                        score >= 50 ? 'bg-amber-950 text-amber-300 border border-amber-600' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      }`}>
                        {score} / 100 ({sev})
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Grid with Hazard Type, Repair Estimates & Required Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#060c1c] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Hazard Classification</span>
                  <span className="font-bold text-white mt-0.5 block">{ai.hazardType}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060c1c] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                    <Timer className="w-3 h-3 text-cyan-400" /> Est. Work Duration
                  </span>
                  <span className="font-bold text-cyan-300 mt-0.5 block">
                    {ai.estimatedRepairHours ?? ai.estimatedFixTimeHours ?? 8} Hours
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060c1c] border border-slate-800">
                  <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-400" /> Equipment Requisition
                  </span>
                  <span className="font-bold text-emerald-300 mt-0.5 block truncate" title={(ai.requiredEquipment || ai.detectedEquipmentNeeded)?.join(', ')}>
                    {(ai.requiredEquipment || ai.detectedEquipmentNeeded)?.slice(0, 2).join(', ') || 'Standard Toolset'}
                  </span>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-xl bg-[#070e22] border border-slate-800/80">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Recommended Action & Protocol:
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {ai.recommendedAction}
                </p>
              </div>

              {/* AI Vision Detected Feature Chips */}
              {(() => {
                const labelList = ai.labels || ai.detectedLabels || [];
                if (labelList.length === 0) return null;
                return (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono-tech mr-1">Vision Labels:</span>
                    {labelList.map((label: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 text-[10px] border border-cyan-800/40 font-mono-tech"
                      >
                        #{label}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Resolution Report Note if Resolved */}
          {problem.status === 'resolved' && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-700/50">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Work Order Solved & Officially Closed
              </span>
              <p className="text-slate-300 leading-relaxed">
                {problem.resolutionNotes || 'Repair crew completed asphalt/sensor/pipe overhaul.'}
              </p>
              {problem.assignedTo && (
                <div className="mt-2 text-[10px] text-slate-400 font-mono-tech">
                  Resolved by {problem.assignedTo.officerName} • {problem.assignedTo.department}
                </div>
              )}
            </div>
          )}

          {/* Status Progress Timeline */}
          <div className="p-3.5 rounded-xl bg-[#080f24] border border-slate-800">
            <span className="text-xs font-bold text-white block mb-3">
              Progress & SLA Lifecycle:
            </span>
            <div className="grid grid-cols-5 gap-1 text-center font-mono-tech text-[10px]">
              {[
                { key: 'submitted', label: '1. Submitted' },
                { key: 'under_review', label: '2. Triaged' },
                { key: 'dispatched', label: '3. Dispatched' },
                { key: 'in_progress', label: '4. In Progress' },
                { key: 'resolved', label: '5. Solved' },
              ].map((step, idx) => {
                const order = ['submitted', 'under_review', 'dispatched', 'in_progress', 'resolved'];
                const currentIdx = order.indexOf(problem.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step.key} className="space-y-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? isCurrent
                            ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                            : 'bg-emerald-500'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span
                      className={`${
                        isPassed ? 'text-white font-semibold' : 'text-slate-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Override Box (if Admin is viewing) */}
          {currentUser.role === 'admin' && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Authority Control: Change Status & Resolve
                </span>
                <button
                  onClick={() => {
                    const opening = !showAdminResolver;
                    if (opening) {
                      const existingPhoto = problem.proof?.afterPhotoUrl || problem.resolutionPhotoUrl || problem.verifiedPhotoUrl || '';
                      setAdminResolutionPhotoUrl(isDemoEvidenceUrl(existingPhoto) ? '' : existingPhoto);
                      setAdminStatus(problem.status === 'resolved' ? 'resolved' : 'in_progress');
                    }
                    setShowAdminResolver(opening);
                  }}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  {showAdminResolver ? 'Hide Solver Form' : 'Open Resolution Form'}
                </button>
              </div>

              {showAdminResolver && (
                <form onSubmit={handleAdminUpdate} className="space-y-3 pt-2">
                  <div className="grid grid-cols-3 gap-2">
                    {(['submitted', 'under_review', 'assigned', 'dispatched', 'in_progress', 'resolved', 'rejected'] as ProblemStatus[]).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setAdminStatus(s)}
                        className={`py-1.5 px-2 rounded-lg font-mono-tech text-[10px] uppercase font-bold border transition-all ${
                          adminStatus === s
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                            : 'bg-[#080f24] text-slate-400 border-slate-700'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Enter official action report (e.g. Dispatched truck #7; replaced main fuse)..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080f24] border border-slate-700 text-white"
                  />
                  {adminStatus === 'resolved' && (
                    <div className="space-y-1">
                      {adminResolutionPhotoUrl && (
                        <img src={adminResolutionPhotoUrl} alt="Resolution proof preview" className="w-36 h-24 object-cover rounded-lg" />
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        required={!adminResolutionPhotoUrl}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                            window.alert('Choose a PNG, JPEG, or WebP image no larger than 5 MB.');
                            event.target.value = '';
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => setAdminResolutionPhotoUrl(String(reader.result));
                          reader.onerror = () => window.alert('The resolution proof image could not be read.');
                          reader.readAsDataURL(file);
                        }}
                      />
                      <p className="text-[10px] text-amber-300">
                        This shortcut records the evidence as needing review; use the Municipal Admin Portal to approve it.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                  >
                    Commit Status Update
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Upvote & Share action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => upvoteProblem(problem.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                hasUpvoted
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#080f24] border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-cyan-400' : ''}`} />
              <span>{hasUpvoted ? 'Endorsed (' + problem.upvotes + ')' : 'Endorse Problem (' + problem.upvotes + ')'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-[#080f24] border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Comments & Discussion Thread */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              Community Updates & Discussion ({problem.comments.length})
            </span>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {problem.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-xl bg-[#080f24] border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span
                        className={`font-semibold ${
                          comment.authorRole === 'admin'
                            ? 'text-indigo-400'
                            : 'text-slate-200'
                        }`}
                      >
                        {comment.authorName}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono-tech">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs pl-5">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder={`Post an update or feedback as ${currentUser.name}...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#080f24] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
