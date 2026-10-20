import React, { useEffect, useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  UserCheck,
  Building,
  Check,
  Filter,
  Search,
  Camera,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Link as LinkIcon,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
import { ProblemItem, ProblemStatus, ProblemPriority } from '../types';
import {
  getComplaintImageFallbackUrl,
  getComplaintImageUrl,
  getDemoEvidenceImage,
  isDemoEvidenceUrl,
} from '../utils/problemEvidence';
import { EvidenceImage } from './EvidenceImage';

export const AdminResolutionHub: React.FC = () => {
  const {
    problems,
    refreshProblems,
    adminResolveProblem,
    currentUser,
    setSelectedProblemId,
    searchQuery,
    setSearchQuery,
  } = useSmartCity();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selected problem to resolve
  const [resolvingProblem, setResolvingProblem] = useState<ProblemItem | null>(null);
  const [newStatus, setNewStatus] = useState<ProblemStatus>('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [officerName, setOfficerName] = useState(currentUser.name);
  const [department, setDepartment] = useState('Municipal Civil Works & Response');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [priority, setPriority] = useState<ProblemPriority>('medium');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ src: string; alt: string } | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'approved' | 'rejected' | 'needs_review'>('needs_review');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  useEffect(() => {
    if (!imagePreview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImagePreview(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [imagePreview]);

  const filteredProblems = problems.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (
      searchQuery &&
      !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.location.ward.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const openCount = problems.filter((p) => p.status !== 'resolved').length;
  const criticalCount = problems.filter((p) => p.priority === 'critical' && p.status !== 'resolved').length;
  const resolvedCount = problems.filter((p) => p.status === 'resolved').length;

  const handleOpenResolveModal = (problem: ProblemItem) => {
    setResolvingProblem(problem);
    setNewStatus(problem.status === 'resolved' ? 'resolved' : 'in_progress');
    setPriority(problem.priority);
    setResolutionNotes(problem.resolutionNotes || '');
    setReviewNotes(problem.reviewNotes || '');
    const savedVerificationStatus = problem.verificationStatus || problem.proof?.verificationStatus;
    setVerificationStatus(savedVerificationStatus === 'approved' || savedVerificationStatus === 'rejected'
      ? savedVerificationStatus
      : 'needs_review');
    const savedAfterPhoto = problem.proof?.afterPhotoUrl || problem.resolutionPhotoUrl || problem.verifiedPhotoUrl || '';
    setResolutionPhotoUrl(isDemoEvidenceUrl(savedAfterPhoto) ? '' : savedAfterPhoto);
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingProblem) return;

    if (newStatus === 'resolved' && !resolutionPhotoUrl.trim()) {
      window.alert('Upload genuine resolution evidence before closing the complaint.');
      return;
    }
    if (newStatus === 'resolved' && verificationStatus === 'approved' && isDemoEvidenceUrl(resolutionPhotoUrl)) {
      window.alert('A demonstration illustration cannot be approved as verified repair evidence. Provide genuine municipal evidence or select Needs Review.');
      return;
    }

    const saved = await adminResolveProblem(
      resolvingProblem.id,
      newStatus,
      resolutionNotes,
      newStatus === 'resolved' ? resolutionPhotoUrl : undefined,
      officerName,
      department,
      verificationStatus,
      reviewNotes,
      resolvingProblem.proof?.beforePhotoUrl || resolvingProblem.imageUrl,
      priority,
    );
    if (!saved) return;

    setIsSuccessToast(true);
    setResolvingProblem(null);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProblems();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Complaint list could not be refreshed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const departmentsList = [
    'Municipal Solid Waste Operations',
    'Urban Water Supply & Sewerage Board',
    'Smart Roads & Civil Infrastructure',
    'Traffic Police & Transit Management',
    'Smart Grid & Lighting Authority',
    'Pollution Control Board & Environmental Monitoring',
    'Emergency Disaster Response Force',
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Admin Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#121b3b] via-[#16234f] to-[#121b3b] border border-indigo-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono-tech">
              Admin Incident Command Center
            </span>
            <span className="text-xs text-slate-400">
              Clearance Level: City Authority
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-display font-bold text-white tracking-tight">
            Citizen Grievance Resolution & Dispatch Work Orders
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Triage public problem reports, assign field technicians, monitor service level agreements (SLAs), and publish verified photographic resolution proof to citizens.
          </p>
        </div>

        {/* Status Toast */}
        {isSuccessToast && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Work Order & Citizen Status Updated Successfully!</span>
          </div>
        )}
      </div>

      {/* Municipal SLA Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0b142c] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Pending Resolution</span>
          <div className="text-2xl font-display font-bold text-amber-300 mt-1">
            {openCount} tickets
          </div>
          <span className="text-[10px] text-slate-500 font-mono-tech">
            Requires field action
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0b142c] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Critical (SOS) Priority</span>
          <div className="text-2xl font-display font-bold text-rose-400 mt-1">
            {criticalCount} active
          </div>
          <span className="text-[10px] text-rose-400 font-mono-tech">
            1 hr SLA threshold
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0b142c] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Solved & Verified</span>
          <div className="text-2xl font-display font-bold text-emerald-400 mt-1">
            {resolvedCount} tickets
          </div>
          <span className="text-[10px] text-emerald-400 font-mono-tech">
            Citizen confirmed
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0b142c] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Average Response Time</span>
          <div className="text-2xl font-display font-bold text-cyan-300 mt-1">
            3.4 Hours
          </div>
          <span className="text-[10px] text-emerald-400 font-mono-tech">
            ↓ 18% improvement
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0a1226] border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, IDs, or wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-[#0e172f] border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0e172f] text-cyan-300 border border-slate-800 hover:border-cyan-700 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1"><RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh</span>
          </button>
          {[
            { id: 'all', label: `All (${problems.length})` },
            { id: 'submitted', label: 'Submitted' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'bg-[#0e172f] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Queue Cards / Table */}
      <div className="space-y-3">
        {filteredProblems.map((problem) => {
          const complaintImageUrl = getComplaintImageUrl(
            problem.id,
            problem.imageUrl,
            problem.proof?.beforePhotoUrl,
            problem.beforePhotoUrl,
          );
          return (
            <div
              key={problem.id}
              className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 hover:border-indigo-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg"
            >
            <button
              type="button"
              onClick={() => setImagePreview({
                src: complaintImageUrl || '/images/complaints/complaint-image-unavailable.svg',
                alt: `Complaint photograph for ${problem.id}`,
              })}
              className="w-24 h-20 overflow-hidden rounded-xl border border-slate-700 shrink-0 cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
              aria-label={`View complaint image for ${problem.id}`}
            >
              <EvidenceImage
                src={complaintImageUrl || '/images/complaints/complaint-image-unavailable.svg'}
                alt={`Complaint photograph for ${problem.id}`}
                className="w-full h-full object-cover rounded-xl"
                fallbackClassName="w-full h-full flex items-center justify-center rounded-xl border border-slate-700 bg-[#080f24] px-2 text-center text-[10px] text-slate-500"
                fallbackSrc={getComplaintImageFallbackUrl(problem.id)}
              />
            </button>
            {/* Left: Problem Details */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-tech text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                  {problem.id}
                </span>

                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono-tech ${
                    problem.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                      : problem.status === 'in_progress'
                      ? 'bg-blue-950 text-blue-300 border border-blue-600/50'
                      : problem.status === 'dispatched'
                      ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                  }`}
                >
                  {problem.status.replace('_', ' ')}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    problem.priority === 'critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-600'
                      : problem.priority === 'high'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Priority: {problem.priority}
                </span>

                {problem.linkedSensorId && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 font-mono-tech flex items-center gap-1">
                    <LinkIcon className="w-2.5 h-2.5" />
                    Sensor: {problem.linkedSensorId}
                  </span>
                )}
              </div>

              <div>
                <h3
                  onClick={() => setSelectedProblemId(problem.id)}
                  className="text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {problem.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {problem.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span>📍 {problem.location.address} ({problem.location.ward})</span>
                <span>👤 Reporter: {problem.reporter.name}</span>
                <span>🕒 {new Date(problem.createdAt).toLocaleString()}</span>
                <span>👍 {problem.upvotes} Citizens Endorsed</span>
                {problem.assignedTo && (
                  <span className="text-cyan-300 font-medium">
                    🛠️ Assigned: {problem.assignedTo.officerName} ({problem.assignedTo.department})
                  </span>
                )}
                {problem.workOrder && (
                  <span className="text-indigo-300 font-medium">
                    📋 {problem.workOrder.id} · {problem.workOrder.status.replace('_', ' ')} ·
                    {' '}{problem.workOrder.assignedOfficer} · Created {new Date(problem.workOrder.createdAt).toLocaleDateString()}
                    {problem.workOrder.completedAt && ` · Completed ${new Date(problem.workOrder.completedAt).toLocaleDateString()}`}
                  </span>
                )}
                {problem.workOrder?.completionNotes && (
                  <span className="basis-full text-slate-300">
                    Completion: {problem.workOrder.completionNotes}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Quick Resolution Controls */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
              <button
                onClick={() => handleOpenResolveModal(problem)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Manage & Solve</span>
              </button>

              <button
                onClick={() => setSelectedProblemId(problem.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0f1933] hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>View Full Audit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            </div>
          );
        })}

        {filteredProblems.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0a1226] border border-slate-800 text-slate-400">
            No incidents matching filter.
          </div>
        )}
      </div>

      {/* Solve & Track Modal */}
      {resolvingProblem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#0d1733] border border-indigo-500/40 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono-tech text-cyan-400 font-bold uppercase">
                  Incident Action Order • {resolvingProblem.id}
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  Update Status & Log Resolution
                </h2>
              </div>
              <button
                onClick={() => setResolvingProblem(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#080f24] border border-slate-800 text-xs">
              <h4 className="font-semibold text-white">{resolvingProblem.title}</h4>
              <p className="text-slate-400 mt-1">{resolvingProblem.description}</p>
              <div className="mt-2 text-[11px] text-cyan-300">
                📍 {resolvingProblem.location.address} ({resolvingProblem.location.ward})
              </div>
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-300 mb-1">Citizen Submitted Before-Proof</p>
                {(() => {
                  const beforeProof = resolvingProblem.proof?.beforePhotoUrl
                    || resolvingProblem.beforePhotoUrl
                    || resolvingProblem.imageUrl;
                  return beforeProof ? (
                    <EvidenceImage
                      src={beforeProof}
                      alt={`Citizen-submitted before-proof for ${resolvingProblem.id}`}
                      className="max-h-56 w-full rounded-lg border border-slate-700 bg-[#080f24] object-contain"
                      fallbackClassName="flex min-h-20 items-center justify-center rounded-lg border border-slate-700 bg-[#080f24] px-3 text-xs text-slate-500"
                    />
                  ) : (
                    <p className="rounded-lg border border-slate-700 bg-[#080f24] px-3 py-4 text-xs text-slate-500">
                      No citizen proof image attached.
                    </p>
                  );
                })()}
              </div>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Update Progress Status:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'submitted', label: 'Submitted' },
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'assigned', label: 'Assigned' },
                    { id: 'dispatched', label: 'Dispatched' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'resolved', label: 'Resolved' },
                    { id: 'rejected', label: 'Rejected' },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setNewStatus(s.id as ProblemStatus)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        newStatus === s.id
                          ? s.id === 'resolved'
                            ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow'
                            : 'bg-indigo-600 border-indigo-400 text-white font-bold shadow'
                          : 'bg-[#080f24] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Urgency / Priority:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ProblemPriority)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#080f24] border border-slate-700 text-white"
                >
                  {(['low', 'medium', 'high', 'critical'] as const).map((value) => (
                    <option key={value} value={value}>{value.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Assign Officer & Dept */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assigned Field Officer:
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#080f24] border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Municipal Department:
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#080f24] border border-slate-700 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Official Resolution Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Action / Resolution Log (Visible to Citizens):
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="E.g., Valve #12 repaired. Asphalt compaction finished. Streetlight driver re-programmed..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#080f24] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  required={newStatus === 'resolved'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Proof Verification Outcome:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'approved', label: 'Approved' },
                    { id: 'needs_review', label: 'Needs Review' },
                    { id: 'rejected', label: 'Rejected' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setVerificationStatus(option.id as 'approved' | 'rejected' | 'needs_review')}
                      className={`py-2 rounded-xl text-xs font-medium border ${
                        verificationStatus === option.id
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-[#080f24] border-slate-700 text-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verification Notes / Audit Detail:
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2}
                  placeholder="Record the review decision, evidence checks, and approval notes..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#080f24] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Photo Proof URL if resolving */}
              {newStatus === 'resolved' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Upload Resolution Proof (PNG, JPEG, WebP · max 5 MB):
                  </label>
                  {resolutionPhotoUrl && (
                    <img src={resolutionPhotoUrl} alt="Resolution proof preview" className="mb-2 w-36 h-24 object-cover rounded-lg" />
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    required={!resolutionPhotoUrl}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                        window.alert('Choose a PNG, JPEG, or WebP image no larger than 5 MB.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setResolutionPhotoUrl(String(reader.result));
                      reader.onerror = () => window.alert('The resolution proof image could not be read.');
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-xs text-slate-300"
                  />
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingProblem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer"
                >
                  Save & Notify Citizen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imagePreview && (
        <div
          role="presentation"
          onClick={() => setImagePreview(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={imagePreview.alt}
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0b142c] p-2 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              aria-label="Close image preview"
              className="absolute right-4 top-4 z-10 rounded-lg bg-black/70 px-3 py-2 text-sm font-bold text-white hover:bg-black"
            >
              ×
            </button>
            <EvidenceImage
              src={imagePreview.src}
              alt={imagePreview.alt}
              className="max-h-[82vh] max-w-full rounded-xl object-contain"
              fallbackClassName="flex min-h-48 min-w-64 items-center justify-center rounded-xl bg-[#080f24] px-4 text-center text-sm text-slate-400"
              fallbackSrc={getComplaintImageFallbackUrl(
                imagePreview.alt.match(/PRB-\d+/)?.[0] || '',
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
