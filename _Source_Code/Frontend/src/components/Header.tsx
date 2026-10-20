import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bell,
  Search,
  Shield,
  User,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Radio,
  PlusCircle,
  LogOut,
  Sliders,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const {
    currentUser,
    switchUserRole,
    telemetry,
    isSimulationRunning,
    toggleSimulation,
    resetAllTelemetry,
    alerts,
    dismissAlert,
    searchQuery,
    setSearchQuery,
    setIsCreateProblemOpen,
    setIsAuthModalOpen,
    setActiveTab,
    problems,
    setSelectedProblemId,
    logout,
  } = useSmartCity();

  // Clock state
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSimDropdownOpen, setIsSimDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateString(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <header className="sticky top-0 z-40 bg-[#0a1226]/95 backdrop-blur-md border-b border-cyan-900/30 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 min-w-fit">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="p-1.5 rounded-lg bg-[#0e172f] border border-slate-700 text-slate-300 hover:text-white lg:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          {currentUser.role === 'citizen' ? (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-600/30 to-teal-600/20 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-wide text-white">
                {currentUser.role === 'citizen' ? 'Citizen Grievance Hub' : 'IoT Lab Simulator'}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono-tech ${
                  currentUser.role === 'citizen'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                }`}
              >
                {currentUser.role === 'citizen' ? 'Public Portal' : 'v2.6'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              {currentUser.role === 'citizen'
                ? 'Share Problems & Photographic Proof'
                : 'Design • Simulate • Build'}
            </p>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                currentUser.role === 'citizen'
                  ? 'Search problems, photo proof, wards...'
                  : 'Search devices, projects, or problems...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-9 pr-9 py-1.5 text-xs rounded-lg bg-[#0e172f]/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Dropdown */}
          {searchQuery.trim().length > 1 && isSearchFocused && (
            <div
              id="header-search-results"
              className="absolute top-full left-0 right-0 mt-2 bg-[#091124] border border-slate-700/80 rounded-xl shadow-2xl p-2.5 z-50 max-h-80 overflow-y-auto space-y-2 backdrop-blur-md"
            >
              <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider px-2">
                Search Results ({problems.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.ward.toLowerCase().includes(searchQuery.toLowerCase())).length} found)
              </div>

              {/* Matching problems */}
              <div className="space-y-1">
                {problems
                  .filter(
                    (p) =>
                      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.location.ward.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 4)
                  .map((prob) => (
                    <div
                      key={prob.id}
                      onClick={() => {
                        setSelectedProblemId(prob.id);
                        setIsSearchFocused(false);
                        if (currentUser.role === 'admin') {
                          setActiveTab('admin_queue');
                        } else {
                          setActiveTab('grievances');
                        }
                      }}
                      className="p-2 rounded-lg bg-[#0d1733] hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between gap-2 cursor-pointer transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                          {prob.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {prob.location.ward} • {prob.category}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono-tech ${
                          prob.status === 'resolved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : prob.status === 'in_progress'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {prob.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}

                {/* If no problems found */}
                {problems.filter(
                  (p) =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.location.ward.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="py-3 text-center text-xs text-slate-500">
                    No matching incidents found for "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Quick Jump Options for Admin */}
              {currentUser.role === 'admin' && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Direct Navigation Jump
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('traffic');
                        setIsSearchFocused(false);
                      }}
                      className="text-left px-2 py-1 rounded bg-[#0d1733] hover:bg-slate-800 text-slate-300 hover:text-white truncate cursor-pointer"
                    >
                      🚦 Traffic ITMS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('water');
                        setIsSearchFocused(false);
                      }}
                      className="text-left px-2 py-1 rounded bg-[#0d1733] hover:bg-slate-800 text-slate-300 hover:text-white truncate cursor-pointer"
                    >
                      💧 Water SCADA
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('waste');
                        setIsSearchFocused(false);
                      }}
                      className="text-left px-2 py-1 rounded bg-[#0d1733] hover:bg-slate-800 text-slate-300 hover:text-white truncate cursor-pointer"
                    >
                      🗑 Waste Fleet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('iot_simulator');
                        setIsSearchFocused(false);
                      }}
                      className="text-left px-2 py-1 rounded bg-[#0d1733] hover:bg-slate-800 text-slate-300 hover:text-white truncate cursor-pointer"
                    >
                      ⚡ IoT Lab Breadboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 lg:gap-4">
          {/* Date & Time display */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono-tech text-slate-300 bg-[#0f1933] px-3 py-1.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400">{dateString}</span>
            <span className="text-cyan-400 font-semibold">{timeString}</span>
          </div>

          {/* Citizen Karma Badge (visible only in Citizen profile) */}
          {currentUser.role === 'citizen' && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono-tech">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{currentUser.karmaPoints || 340} pts</span>
            </div>
          )}

          {/* Quick Problem Report Button */}
          <button
            onClick={() => setIsCreateProblemOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-md transition-all cursor-pointer active:scale-95 ${
              currentUser.role === 'citizen'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{currentUser.role === 'citizen' ? 'Share Problem & Proof' : 'Report Problem'}</span>
          </button>

          {/* Simulation Controls Dropdown - ONLY FOR ADMIN */}
          {currentUser.role === 'admin' && (
            <div className="relative">
              <button
                onClick={() => setIsSimDropdownOpen(!isSimDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSimulationRunning
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSimulationRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isSimulationRunning ? 'Simulation Running' : 'Simulation Paused'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSimDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0d1730] border border-slate-700/80 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      toggleSimulation();
                      setIsSimDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                  >
                    {isSimulationRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Telemetry
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" /> Resume Simulation
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      resetAllTelemetry();
                      setIsSimDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800/70 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset to Defaults
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('iot_simulator');
                      setIsSimDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800/70 flex items-center gap-2 border-t border-slate-800 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Open Circuit Simulator
                  </button>
                </div>
              )}
            </div>
          )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="p-2 rounded-lg bg-[#0f1933] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 relative transition-all"
            aria-label="City Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold flex items-center justify-center text-white border-2 border-[#0a1226] animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d1730] border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" /> Live City Alerts ({alerts.length})
                </span>
                <span className="text-[10px] text-cyan-400 hover:underline cursor-pointer" onClick={() => setActiveTab('emergency')}>
                  Emergency Hub
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-lg bg-[#142040] border border-slate-800/80 text-xs flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 shrink-0 ${
                            alert.severity === 'critical'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        />
                        <span className="font-medium text-slate-200">{alert.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {alert.description}
                      </p>
                      <span className="text-[9px] text-slate-500">{alert.time}</span>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-slate-500 hover:text-slate-300 text-[10px] shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-[#0f1933] border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-400/50"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a1226] ${
                  currentUser.role === 'admin' ? 'bg-indigo-400' : 'bg-emerald-400'
                }`}
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <span>{currentUser.name}</span>
                {currentUser.role === 'admin' ? (
                  <Shield className="w-3 h-3 text-indigo-400" />
                ) : (
                  <User className="w-3 h-3 text-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono-tech">
                {currentUser.role === 'admin' ? 'Admin / IoT Lead' : 'Citizen'}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0d1730] border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-cyan-500/40"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{currentUser.name}</h4>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                  <span
                    className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                      currentUser.role === 'admin'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'Admin Authority' : 'Verified Citizen'}
                  </span>
                </div>
              </div>

              {/* Account details & separation */}
              <div className="py-2.5 space-y-2">
                <div className="p-2 rounded-lg bg-[#090f20] border border-slate-800 text-xs">
                  {currentUser.role === 'citizen' ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Assigned Ward:</span>
                        <span className="text-white font-medium">{currentUser.ward || 'Sector 4'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Civic Karma:</span>
                        <span className="text-emerald-400 font-bold">{currentUser.karmaPoints || 100} pts</span>
                      </div>
                      <div className="pt-1 text-[10px] text-slate-400">
                        Citizen Portal is restricted to civic grievance reporting. Admin operations are strictly isolated.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Clearance:</span>
                        <span className="text-indigo-400 font-bold">Level 3 Municipal Authority</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Department:</span>
                        <span className="text-white font-medium truncate max-w-[120px]">{currentUser.department || 'Operations'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                {currentUser.role === 'citizen' ? (
                  <button
                    onClick={() => {
                      setIsCreateProblemOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/40 rounded flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Share Problem & Photo Proof
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab('admin_queue');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-indigo-300 hover:bg-indigo-950/40 rounded flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-400" /> View Admin Resolution Queue
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-rose-300 hover:bg-rose-950/50 rounded flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" /> Sign Out / Switch Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
