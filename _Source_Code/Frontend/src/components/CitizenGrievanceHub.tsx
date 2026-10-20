import React, { useEffect, useState } from 'react';
import {
  MessageSquareWarning,
  PlusCircle,
  ThumbsUp,
  Share2,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Camera,
  MessageCircle,
  ArrowUpDown,
  Flame,
  ShieldCheck,
  Check,
  User,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
import { ProblemCategory, ProblemStatus, ProblemItem } from '../types';
import {
  getComplaintImageFallbackUrl,
  getComplaintImageUrl,
  getEvidenceDisplayUrl,
  getEvidenceSource,
} from '../utils/problemEvidence';
import { EvidenceImage } from './EvidenceImage';

interface CitizenGrievanceHubProps {
  initialFilterMineOnly?: boolean;
}

export const CitizenGrievanceHub: React.FC<CitizenGrievanceHubProps> = ({
  initialFilterMineOnly = false,
}) => {
  const {
    problems,
    currentUser,
    upvoteProblem,
    setIsCreateProblemOpen,
    setSelectedProblemId,
    searchQuery,
    setSearchQuery,
  } = useSmartCity();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMineOnly, setFilterMineOnly] = useState<boolean>(initialFilterMineOnly);
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'urgency'>('trending');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!imagePreview) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImagePreview(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [imagePreview]);

  // Update filterMineOnly when initialFilterMineOnly prop changes
  React.useEffect(() => {
    setFilterMineOnly(initialFilterMineOnly);
  }, [initialFilterMineOnly]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'waste', label: 'Waste Overflow' },
    { id: 'water', label: 'Water Leak / Supply' },
    { id: 'traffic', label: 'Traffic Congestion' },
    { id: 'road_pothole', label: 'Road & Potholes' },
    { id: 'electricity', label: 'Streetlights & Power' },
    { id: 'pollution', label: 'Air / Smoke Hazard' },
  ];

  // Filtering
  const filteredProblems = problems
    .filter((p) => {
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      if (filterStatus === 'open' && p.status === 'resolved') return false;
      if (filterStatus === 'resolved' && p.status !== 'resolved') return false;
      if (filterMineOnly && p.reporter.id !== currentUser.id) return false;
      if (
        searchQuery &&
        !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.location.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'trending') return b.upvotes - a.upvotes;
      if (sortBy === 'recent')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'urgency') {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return 0;
    });

  const handleShare = (e: React.MouseEvent, problem: ProblemItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/#problem-${problem.id}: ${problem.title}`
    );
    setCopiedId(problem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: ProblemStatus) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono-tech">
            <CheckCircle2 className="w-3 h-3" /> Solved & Verified
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-500/40 flex items-center gap-1 font-mono-tech">
            <Wrench className="w-3 h-3 animate-spin" /> Crew on Site
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-mono-tech">
            <Clock className="w-3 h-3" /> Dispatched
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono-tech">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'submitted':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono-tech">
            <Clock className="w-3 h-3" /> Submitted
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-600/50">
            Critical (SOS)
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-600/50">
            High Urgency
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-600/50">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
            Low
          </span>
        );
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Citizen Profile Focus Notice */}
      {currentUser.role === 'citizen' && (
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              <strong className="text-white">Citizen Profile Mode:</strong> Only community problems and photographic proof can be shared and tracked here. Administrative and SCADA IoT controls are reserved for the Admin profile.
            </span>
          </div>
          <button
            onClick={() => setIsCreateProblemOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shrink-0 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] self-start sm:self-center"
          >
            + Share Problem & Proof
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0d1c3a] via-[#10244c] to-[#0d1c3a] border border-cyan-500/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-tech">
              Citizen Problem & Proof Portal
            </span>
            <span className="text-xs text-slate-400">
              Community Voice & Transparency
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-display font-bold text-white tracking-tight">
            Share City Problems & Track Real-Time Resolution
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Spot a pothole, leaking pipe, or overflowing bin? Report it instantly with photo proof, upvote neighborhood concerns to increase priority, and inspect verified municipal resolution proof.
          </p>
        </div>

        <button
          onClick={() => setIsCreateProblemOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share Problem & Proof</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0b142c] border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Total Community Issues</div>
          <div className="text-xl font-display font-bold text-white mt-0.5">
            {problems.length}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#0b142c] border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Under Action / Crew Dispatched</div>
          <div className="text-xl font-display font-bold text-amber-300 mt-0.5">
            {problems.filter((p) => p.status !== 'resolved').length}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#0b142c] border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Successfully Solved</div>
          <div className="text-xl font-display font-bold text-emerald-400 mt-0.5">
            {problems.filter((p) => p.status === 'resolved').length}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#0b142c] border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Your Citizen Karma</div>
          <div className="text-xl font-display font-bold text-cyan-300 mt-0.5">
            {currentUser.karmaPoints || 340} pts
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0a1226] border border-slate-800/90 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, ward, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-[#0e172f] border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterMineOnly(!filterMineOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMineOnly
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-[#0e172f] border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Reports</span>
            </button>

            <button
              onClick={() =>
                setFilterStatus(
                  filterStatus === 'all'
                    ? 'open'
                    : filterStatus === 'open'
                    ? 'resolved'
                    : 'all'
                )
              }
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0e172f] border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Status:{' '}
                {filterStatus === 'all'
                  ? 'All'
                  : filterStatus === 'open'
                  ? 'Open Only'
                  : 'Resolved Only'}
              </span>
            </button>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0e172f] border border-slate-700 text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="trending">🔥 Most Upvoted</option>
              <option value="recent">⏱️ Newest First</option>
              <option value="urgency">⚠️ Highest Urgency</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0e172f] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProblems.map((problem) => {
          const hasUpvoted = problem.upvotedBy.includes(currentUser.id);
          const beforeUrl = getComplaintImageUrl(
            problem.id,
            getEvidenceDisplayUrl(
              problem.proof?.beforePhotoUrl || problem.beforePhotoUrl || problem.imageUrl,
              problem.category,
              'before',
              problem.title,
            ),
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

          return (
            <div
              key={problem.id}
              onClick={() => setSelectedProblemId(problem.id)}
              className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Card Header: Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(problem.status)}
                    {getPriorityBadge(problem.priority)}
                  </div>
                  <span className="text-[11px] font-mono-tech text-slate-500">
                    {problem.id}
                  </span>
                </div>

                {/* Problem Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {problem.title}
                </h3>

                {/* Problem Description */}
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {problem.description}
                </p>

                {/* Photographic Proof Showcase */}
                <div className="mt-3 space-y-2">
                  {beforeUrl && (
                    <div className="relative h-36 w-full rounded-xl overflow-hidden border border-amber-500/20 bg-[#070e22]">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setImagePreview({
                            src: beforeUrl,
                            alt: `Complaint photograph for ${problem.id}: ${problem.title}`,
                          });
                        }}
                        aria-label={`View complaint photo for ${problem.id}`}
                        className="absolute inset-0 h-full w-full cursor-zoom-in"
                      >
                        <EvidenceImage
                          src={beforeUrl}
                          alt={problem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fallbackSrc={getComplaintImageFallbackUrl(problem.id)}
                        />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-amber-300 flex items-center gap-1 font-mono-tech border border-amber-500/30">
                        <Camera className="w-3 h-3" /> {beforeIsDemo ? 'Demo illustration · not citizen evidence' : 'Citizen-provided evidence'}
                      </span>
                    </div>
                  )}

                  {/* Resolution Proof Photo if available */}
                  {afterUrl && (
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-emerald-500/40 bg-[#070e22] shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      <EvidenceImage
                        src={afterUrl}
                        alt={afterIsDemo ? 'Demonstration repair illustration, not verified proof' : 'Municipal resolution evidence'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-emerald-950/90 backdrop-blur-sm text-emerald-300 flex items-center gap-1 font-mono-tech border border-emerald-500/50">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> {afterIsDemo ? 'Demo illustration · not verified repair' : 'Municipal resolution evidence'}
                      </span>
                    </div>
                  )}

                  {/* Resolution proof note if resolved */}
                  {problem.status === 'resolved' && problem.resolutionNotes && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-0.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" /> Official Resolution Action:
                      </span>
                      <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                        {problem.resolutionNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Location, Author, Upvote, Share, Comments */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                {/* Location & Reporter */}
                <div className="flex items-center gap-2 truncate">
                  <img
                    src={problem.reporter.avatar}
                    alt={problem.reporter.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                  <div className="truncate text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">
                      {problem.reporter.name}
                    </span>{' '}
                    • <span>{problem.location.ward}</span>
                  </div>
                </div>

                {/* Actions: Upvote & Share */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      upvoteProblem(problem.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      hasUpvoted
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-[#0f1933] border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        hasUpvoted ? 'fill-cyan-400 text-cyan-400' : ''
                      }`}
                    />
                    <span>{problem.upvotes}</span>
                  </button>

                  <button
                    onClick={(e) => handleShare(e, problem)}
                    className="p-1.5 rounded-lg bg-[#0f1933] border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer relative"
                    title="Share problem"
                  >
                    {copiedId === problem.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 px-2 py-1 rounded-lg bg-[#0f1933] border border-slate-800">
                    <MessageCircle className="w-3 h-3 text-slate-500" />
                    <span>{problem.comments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProblems.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#0a1226] border border-slate-800">
          <MessageSquareWarning className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No grievances found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or category filters.
          </p>
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
