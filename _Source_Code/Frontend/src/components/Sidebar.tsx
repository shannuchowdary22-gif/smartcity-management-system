import React from 'react';
import {
  LayoutDashboard,
  Car,
  Trash2,
  Droplets,
  Wind,
  ShieldAlert,
  Cpu,
  MapPin,
  Settings,
  MessageSquareWarning,
  Wrench,
  X,
  PlusCircle,
  FolderKanban,
  ShieldCheck,
  Camera,
  Award,
  User,
  LogOut,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | null;
  badgeColor?: string;
  action?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    problems,
    currentUser,
    setIsCreateProblemOpen,
    logout,
  } = useSmartCity();

  const openProblemsCount = problems.filter((p) => p.status !== 'resolved').length;
  const underReviewCount = problems.filter((p) => p.status === 'under_review' || p.status === 'submitted').length;
  const myProblemsCount = problems.filter((p) => p.reporter.id === currentUser.id).length;
  const resolvedCount = problems.filter((p) => p.status === 'resolved').length;

  const isCitizen = currentUser.role === 'citizen';

  // Strict separation: Citizen profile ONLY has problems and proof!
  const citizenNavItems: NavItem[] = [
    {
      id: 'grievances',
      label: 'Community Problems & Proof',
      icon: MessageSquareWarning,
      badge: openProblemsCount > 0 ? `${openProblemsCount} Active` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'share_problem',
      label: 'Share Problem & Proof',
      icon: PlusCircle,
      badge: '+25 Karma',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      action: () => setIsCreateProblemOpen(true),
    },
    {
      id: 'my_problems',
      label: 'My Reported Problems',
      icon: FolderKanban,
      badge: myProblemsCount > 0 ? `${myProblemsCount}` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'proof_gallery',
      label: 'Verified Proof Gallery',
      icon: ShieldCheck,
      badge: `${resolvedCount} Fixed`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
  ];

  // Admin profile has ALL municipal and IoT features
  const adminNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'grievances',
      label: 'Citizen Grievances & Feed',
      icon: MessageSquareWarning,
      badge: openProblemsCount > 0 ? `${openProblemsCount}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'admin_queue',
      label: 'Admin Resolver & Orders',
      icon: Wrench,
      badge: underReviewCount > 0 ? `${underReviewCount} pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'proof_gallery',
      label: 'Verified Proof Showcase',
      icon: ShieldCheck,
      badge: `${resolvedCount} Solved`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'traffic',
      label: 'Traffic Monitoring (ITMS)',
      icon: Car,
      badge: null,
    },
    {
      id: 'waste',
      label: 'Waste Management (Fleet)',
      icon: Trash2,
      badge: 'Alert',
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'water',
      label: 'Water SCADA & Hydraulics',
      icon: Droplets,
      badge: null,
    },
    {
      id: 'pollution',
      label: 'Pollution Monitoring (AQI)',
      icon: Wind,
      badge: 'Live',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'emergency',
      label: 'Emergency & SOS Broadcast',
      icon: ShieldAlert,
      badge: 'Ready',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'iot_simulator',
      label: 'IoT Design Studio',
      icon: Cpu,
      badge: 'Breadboard',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'city_map',
      label: 'Smart City Geospatial Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const currentNavItems = isCitizen ? citizenNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#090f20] border-r border-cyan-950/40 flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="py-4 px-3 space-y-1">
          <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono-tech">
            <span>{isCitizen ? 'Citizen Civic Portal' : 'Smart City Command'}</span>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? isCitizen
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1933]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? isCitizen
                          ? 'text-emerald-400'
                          : 'text-cyan-400'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate font-medium">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono-tech font-semibold ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Status Card matching Persona */}
        <div className="p-3 border-t border-cyan-950/50">
          {isCitizen ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#0c2233] to-[#091522] border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-300 tracking-tight flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Citizen Profile Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Only problems and proof can be shared and tracked here. Upload photos to earn civic karma.
              </p>

              <div className="pt-2 border-t border-emerald-950/80 flex items-center justify-between text-[10px] text-slate-300">
                <span className="font-mono-tech">Civic Karma:</span>
                <span className="font-bold text-cyan-300 font-mono-tech bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  {currentUser.karmaPoints || 340} pts
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#0c1833] to-[#091124] border border-cyan-900/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-semibold text-white tracking-tight">
                  Admin Authority Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                All features enabled: IoT breadboard, SCADA controls, work order dispatch, and telemetry.
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono-tech">Role:</span>
                <span className="font-semibold capitalize px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300">
                  Admin Command
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="mt-2.5 w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/50 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Switch Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
