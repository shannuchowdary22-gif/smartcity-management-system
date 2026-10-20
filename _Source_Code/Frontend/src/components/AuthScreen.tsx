import React, { useEffect, useRef, useState } from 'react';
import {
  Shield,
  User,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Camera,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
import { AnimatedBackground } from './AnimatedBackground';
import { api, type OfficerBootstrapStatus } from '../services/api';

const WARDS = [
  'Sector 4, Green Park',
  'Sector 7, Tech Corridor',
  'Ward 1, Central Commercial Zone',
  'Ward 2, Old Heritage District',
  'Ward 9, South Lake Boulevard',
  'Ward 12, Industrial Suburb',
];

const DEPARTMENTS = [
  'Smart City Operations & Command Center',
  'Urban Development & Grievances',
  'Municipal Traffic & Transit Authority',
  'Water Supply & SCADA Hydro Division',
  'Public Sanitation & Waste Logistics',
  'Civil Defense & Disaster Response',
];

export const AuthScreen: React.FC = () => {
  const { registerCitizen, registerAdmin, login, showToast } = useSmartCity();

  // Portal selection: 'citizen' or 'admin'
  const [selectedPortal, setSelectedPortal] = useState<'citizen' | 'admin'>('citizen');

  // Mode: "register" first by default as requested!
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Citizen form states
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [citizenConfirmPassword, setCitizenConfirmPassword] = useState('');
  const [citizenWard, setCitizenWard] = useState(WARDS[0]);
  const [citizenPhone, setCitizenPhone] = useState('');

  // Admin form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [adminClearanceCode, setAdminClearanceCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminDepartment, setAdminDepartment] = useState(DEPARTMENTS[0]);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<OfficerBootstrapStatus | 'LOADING'>('LOADING');
  const [bootstrapStatusError, setBootstrapStatusError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const adminSubmissionInProgress = useRef(false);

  useEffect(() => {
    if (selectedPortal !== 'admin') return;

    let current = true;
    setBootstrapStatus('LOADING');
    setBootstrapStatusError(null);
    void api.getOfficerBootstrapStatus()
      .then(({ status }) => {
        if (current) {
          setBootstrapStatus(status);
          setBootstrapStatusError(null);
        }
      })
      .catch((error: unknown) => {
        if (current) {
          setBootstrapStatus('UNAVAILABLE');
          setBootstrapStatusError(
            error instanceof Error ? error.message : 'Bootstrap eligibility could not be checked.',
          );
        }
      });

    return () => {
      current = false;
    };
  }, [selectedPortal]);

  // Switch portal handler - resets errors
  const handlePortalSwitch = (portal: 'citizen' | 'admin') => {
    setSelectedPortal(portal);
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthMode(portal === 'admin' ? 'login' : 'register');
  };

  const handleAuthModeSwitch = (mode: 'register' | 'login') => {
    if (mode === 'register' && selectedPortal === 'admin' && bootstrapStatus !== 'AVAILABLE') {
      setErrorMessage(
        bootstrapStatus === 'COMPLETED'
          ? 'First-officer bootstrap is closed because a municipal officer already exists. Sign in instead.'
          : bootstrapStatusError || 'First-officer bootstrap is unavailable for this connection.',
      );
      return;
    }
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Submit Citizen Form
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'register') {
      if (!citizenName.trim()) {
        setErrorMessage('Please enter your full legal or display name.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(citizenEmail.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (citizenPassword.length < 8) {
        setErrorMessage('Password must be at least 8 characters.');
        return;
      }
      if (citizenPassword !== citizenConfirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        return;
      }

      setIsSubmitting(true);
      const res = await registerCitizen({
        name: citizenName,
        email: citizenEmail,
        password: citizenPassword,
        ward: citizenWard,
        phone: citizenPhone,
      });
      setIsSubmitting(false);

      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } else {
      // Citizen Login
      if (!citizenEmail.trim()) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }

      setIsSubmitting(true);
      const res = await login(citizenEmail, citizenPassword, 'citizen');
      setIsSubmitting(false);

      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    }
  };

  // Submit Admin Form
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSubmissionInProgress.current) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'login') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
        setErrorMessage('Please enter a valid official municipal officer email.');
        return;
      }
      if (!adminPassword) {
        setErrorMessage('Please enter your officer account password.');
        return;
      }
      adminSubmissionInProgress.current = true;
      setIsSubmitting(true);
      try {
        const res = await login(adminEmail, adminPassword, 'admin');
        if (!res.success && res.error) setErrorMessage(res.error);
      } finally {
        adminSubmissionInProgress.current = false;
        setIsSubmitting(false);
      }
    } else {
      // Admin Register (Staff Commissioning)
      if (bootstrapStatus !== 'AVAILABLE') {
        setErrorMessage('First-officer setup is not available for this connection.');
        return;
      }
      if (!adminName.trim()) {
        setErrorMessage('Officer name is required.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
        setErrorMessage('A valid government/municipal email is required.');
        return;
      }
      if (adminPassword.length < 8) {
        setErrorMessage('Password must be at least 8 characters.');
        return;
      }
      if (adminPassword !== adminPasswordConfirm) {
        setErrorMessage('Passwords do not match. Please verify.');
        return;
      }
      if (!adminClearanceCode.trim()) {
        setErrorMessage('Enter the municipal clearance code supplied by your system administrator.');
        return;
      }
      adminSubmissionInProgress.current = true;
      setIsSubmitting(true);
      try {
        const res = await registerAdmin({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          clearanceCode: adminClearanceCode,
          department: adminDepartment,
        });
        if (res.success) {
          setAdminPassword('');
          setAdminPasswordConfirm('');
          setAdminClearanceCode('');
          setBootstrapStatus('COMPLETED');
        } else if (res.error) {
          setErrorMessage(res.error);
          void api.getOfficerBootstrapStatus()
            .then(({ status }) => setBootstrapStatus(status))
            .catch(() => setBootstrapStatus('UNAVAILABLE'));
        }
      } finally {
        adminSubmissionInProgress.current = false;
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070d1e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Animated Cyber Grid Background */}
      <AnimatedBackground />

      {/* Top Municipal Banner */}
      <header className="border-b border-slate-800/80 bg-[#0a1226]/90 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base tracking-wide text-white">
                SmartCity Portal
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                Civic & SCADA v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unified Municipal Infrastructure & Citizen Grievance Redressal System
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Central SCADA Gateway: ONLINE
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-start md:items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl min-w-0 bg-[#0b142c] border border-slate-800 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row">
          {/* Left Hero / Context Sidebar */}
          <div className="w-full min-w-0 md:w-5/12 md:flex-shrink-0 bg-gradient-to-b from-[#0e1a38] via-[#091328] to-[#060c1c] p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero-Friction Municipal Access</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight leading-tight">
                  Welcome to Your Smart City
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                  Register as a resident citizen to report neighborhood infrastructure defects, upload proof, and earn civic karma points.
                </p>
              </div>

              {/* Portal Highlights */}
              <div className="space-y-3 pt-2">
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    selectedPortal === 'citizen'
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-xs">
                    <User className="w-4 h-4" />
                    <span>Citizen Public Portal</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Report road potholes, pipeline bursts, dead streetlights, and trash overflows with camera photo proof. Track repair SLA progression live.
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    selectedPortal === 'admin'
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-xs">
                    <Shield className="w-4 h-4" />
                    <span>Municipal Command Center</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Restricted to authorized city officers. Controls SCADA water pumps, adaptive traffic phasing, work ticket dispatch, and mist cannons.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Auth Forms Panel */}
          <div className="w-full min-w-0 md:w-7/12 p-5 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Separate Portals Switcher */}
              <div className="flex items-stretch gap-1 sm:gap-2 p-1.5 rounded-2xl bg-[#070e22] border border-slate-800 mb-6 min-w-0">
                <button
                  type="button"
                  onClick={() => handlePortalSwitch('citizen')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPortal === 'citizen'
                      ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Citizen Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePortalSwitch('admin')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPortal === 'admin'
                      ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="min-w-0 text-center leading-tight">Municipal Admin (Restricted)</span>
                </button>
              </div>

              {/* Mode Selector: Register First vs Login */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedPortal === 'citizen' ? (
                      <>
                        <span className="text-emerald-400">
                          {authMode === 'register' ? 'Register New Citizen' : 'Citizen Portal Login'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-indigo-400">
                          {authMode === 'register' ? 'Commission Municipal Officer' : 'Municipal Authority Login'}
                        </span>
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {selectedPortal === 'citizen'
                      ? authMode === 'register'
                        ? 'Create your resident account first to submit grievances with photo evidence'
                        : 'Access your reported issues, civic karma, and community upvotes'
                      : authMode === 'register'
                      ? 'First-officer setup is controlled by backend commissioning policy'
                      : 'Authorized municipal personnel only - citizens are strictly barred'}
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070e22] border border-slate-800 text-xs">
                  {selectedPortal === 'admin' && authMode === 'login' && bootstrapStatus !== 'AVAILABLE' ? (
                    <span role="status" className="px-3 py-1 text-slate-500">
                      {bootstrapStatus === 'LOADING'
                        ? 'Checking bootstrap…'
                        : bootstrapStatus === 'COMPLETED'
                        ? 'Bootstrap closed'
                        : 'Bootstrap unavailable'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAuthModeSwitch('register')}
                      disabled={selectedPortal === 'admin' && bootstrapStatus !== 'AVAILABLE'}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        authMode === 'register'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'text-slate-400 hover:text-white'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {selectedPortal === 'admin' ? 'Bootstrap First Officer →' : 'Register'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAuthModeSwitch('login')}
                    disabled={isSubmitting}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-400 hover:text-white'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {selectedPortal === 'admin' ? 'Sign in' : 'Log In'}
                  </button>
                </div>
              </div>

              {/* Error Message Box (Crucial for displaying "Citizen cannot login to admin") */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{errorMessage}</div>
                </div>
              )}
              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{successMessage}</div>
                </div>
              )}

              {/* ================== CITIZEN FORM ================== */}
              {selectedPortal === 'citizen' && (
                <form onSubmit={handleCitizenSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Resident Name <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={citizenName}
                          onChange={(e) => setCitizenName(e.target.value)}
                          placeholder="e.g. Vikram Rao"
                          className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                        placeholder="e.g. citizen.user@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Residential Ward / Sector
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                          <select
                            value={citizenWard}
                            onChange={(e) => setCitizenWard(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                          >
                            {WARDS.map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Mobile Contact (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            value={citizenPhone}
                            onChange={(e) => setCitizenPhone(e.target.value)}
                            placeholder="+91 98000 00000"
                            className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={authMode === 'register' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password {authMode === 'register' && <span className="text-emerald-400">*</span>}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={authMode === 'register'}
                          minLength={authMode === 'register' ? 8 : undefined}
                          autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                          value={citizenPassword}
                          onChange={(e) => setCitizenPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={citizenConfirmPassword}
                            onChange={(e) => setCitizenConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>
                      {authMode === 'register'
                        ? 'Complete Registration & Enter Citizen Hub'
                        : 'Log In to Citizen Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    {authMode === 'register' ? (
                      <p className="text-xs text-slate-400">
                        Already have a Citizen account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setErrorMessage(null);
                          }}
                          className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                        >
                          Log In here
                        </button>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Need a new Citizen account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('register');
                            setErrorMessage(null);
                          }}
                          className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                        >
                          Register first here
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              )}

              {/* ================== ADMIN FORM ================== */}
              {selectedPortal === 'admin' && (
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      Restricted Municipal Access: Citizens are strictly prohibited from logging into the Admin Command Center.
                    </span>
                  </div>

                  {authMode === 'register' && (
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700 text-[11px] leading-relaxed text-slate-300">
                      <p className="font-semibold text-indigo-200">
                        Secure Municipal Verification — Clearance code is verified by the backend.
                      </p>
                      <p className="mt-2">
                        {bootstrapStatus === 'LOADING'
                          ? 'Checking first-officer setup status…'
                          : bootstrapStatus === 'AVAILABLE'
                          ? 'Setup available for this trusted local commissioning connection.'
                          : bootstrapStatus === 'COMPLETED'
                          ? 'Setup completed. First-officer registration is closed; sign in with an existing officer account.'
                          : bootstrapStatusError
                          ? `Setup status could not be checked: ${bootstrapStatusError}`
                          : 'Setup unavailable. Check that backend first-officer setup and its clearance code are configured.'}
                      </p>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label htmlFor="admin-clearance-code" className="block text-xs font-semibold text-slate-300 mb-1">
                        Municipal Clearance Code <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        id="admin-clearance-code"
                        type="password"
                        required
                        autoComplete="off"
                        value={adminClearanceCode}
                        onChange={(e) => setAdminClearanceCode(e.target.value)}
                        placeholder="Provided by your system administrator"
                        className="w-full px-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Officer Full Name <span className="text-indigo-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="e.g. Inspector Prabhas"
                          className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Official Municipal Email <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="e.g. shannu.iot@smartcity.gov"
                        className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Assigned Municipal Department <span className="text-indigo-400">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <select
                          value={adminDepartment}
                          required
                          onChange={(e) => setAdminDepartment(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password {authMode === 'register' && <span className="text-indigo-400">*</span>}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label htmlFor="officer-password-confirm" className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm Password <span className="text-indigo-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="officer-password-confirm"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={adminPasswordConfirm}
                          onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                          placeholder="Re-enter your password"
                          className="w-full pl-9 pr-3 py-2 bg-[#070e22] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || (authMode === 'register' && bootstrapStatus !== 'AVAILABLE')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>
                      {authMode === 'register'
                        ? isSubmitting ? 'Creating Municipal Officer…' : 'Bootstrap First Officer'
                        : 'Sign In to Municipal Command Center'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    {authMode === 'login' ? (
                      <p className="text-xs text-slate-400">
                        {bootstrapStatus === 'AVAILABLE'
                          ? 'First officer setup is available. Use “Bootstrap First Officer →” above.'
                          : bootstrapStatus === 'COMPLETED'
                          ? 'A municipal officer is already commissioned. Sign in with that account.'
                          : bootstrapStatus === 'LOADING'
                          ? 'Checking whether first-officer setup is available…'
                          : bootstrapStatusError
                          ? `First-officer setup status could not be checked: ${bootstrapStatusError}`
                          : 'First-officer setup is unavailable for this backend configuration.'}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Already commissioned officer?{' '}
                        <button
                          type="button"
                          onClick={() => handleAuthModeSwitch('login')}
                          disabled={isSubmitting}
                          className="text-indigo-400 hover:underline font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Sign in here
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Security Guarantee */}
            <div className="pt-6 border-t border-slate-800 text-center text-[11px] text-slate-400">
              <span className="text-slate-400">
                🔒 Role-based isolation active: Citizen profiles cannot access SCADA actuators or admin work order queues.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer live status */}
      <footer className="border-t border-slate-800/80 bg-[#0a1226]/80 px-6 py-3 text-center text-xs text-slate-400">
        SmartCity Civic & Municipal Operations System • Real-time SLA Resolution & IoT SCADA Gateway
      </footer>
    </div>
  );
};
