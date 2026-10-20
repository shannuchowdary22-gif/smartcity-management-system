import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Mail,
  MapPin,
  Building2,
  Phone,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
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
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    registerCitizen,
    registerAdmin,
    login,
  } = useSmartCity();

  // Portal selection: 'citizen' or 'admin'
  const [selectedPortal, setSelectedPortal] = useState<'citizen' | 'admin'>('citizen');

  // Mode: "register" first by default
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Citizen form states
  const [citizenName, setCitizenName] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [citizenPasswordConfirm, setCitizenPasswordConfirm] = useState('');
  const [citizenWard, setCitizenWard] = useState(WARDS[0]);
  const [citizenPhone, setCitizenPhone] = useState('');

  // Admin form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [adminClearanceCode, setAdminClearanceCode] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminDepartment, setAdminDepartment] = useState(DEPARTMENTS[0]);

  // UI status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<OfficerBootstrapStatus | 'LOADING'>('LOADING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const adminSubmissionInProgress = useRef(false);

  useEffect(() => {
    if (!isAuthModalOpen || selectedPortal !== 'admin' || authMode !== 'register') return;

    let current = true;
    setBootstrapStatus('LOADING');
    void api.getOfficerBootstrapStatus()
      .then(({ status }) => {
        if (current) setBootstrapStatus(status);
      })
      .catch(() => {
        if (current) setBootstrapStatus('UNAVAILABLE');
      });

    return () => {
      current = false;
    };
  }, [authMode, isAuthModalOpen, selectedPortal]);

  if (!isAuthModalOpen) return null;

  const handlePortalSwitch = (portal: 'citizen' | 'admin') => {
    setSelectedPortal(portal);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'register') {
      if (!citizenName.trim() || !citizenEmail.trim()) {
        setErrorMessage('Name and email are required.');
        return;
      }
      if (citizenPassword.length < 8) {
        setErrorMessage('Password must be at least 8 characters.');
        return;
      }
      if (citizenPassword !== citizenPasswordConfirm) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      const res = await registerCitizen({
        name: citizenName,
        email: citizenEmail,
        password: citizenPassword,
        ward: citizenWard,
        phone: citizenPhone,
      });
      if (res.success) {
        setIsAuthModalOpen(false);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } else {
      const res = await login(citizenEmail, citizenPassword, 'citizen');
      if (res.success) {
        setIsAuthModalOpen(false);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSubmissionInProgress.current) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'login') {
      if (!adminEmail.trim() || !adminPassword) {
        setErrorMessage('Enter your municipal email and officer account password.');
        return;
      }
      adminSubmissionInProgress.current = true;
      setIsSubmitting(true);
      try {
        const res = await login(adminEmail, adminPassword, 'admin');
        if (res.success) {
          setIsAuthModalOpen(false);
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      } finally {
        adminSubmissionInProgress.current = false;
        setIsSubmitting(false);
      }
    } else {
      if (bootstrapStatus !== 'AVAILABLE') {
        setErrorMessage('First-officer setup is not available for this connection.');
        return;
      }
      if (adminPassword.length < 8 || adminPassword !== adminPasswordConfirm) {
        setErrorMessage(adminPassword.length < 8
          ? 'Password must be at least 8 characters.'
          : 'Passwords do not match.');
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
          setIsAuthModalOpen(false);
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0c1630] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#0d1f40] to-[#0f2852] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">SmartCity Access & Authentication</h2>
              <p className="text-[11px] text-slate-300">
                Register first or log in with verified role separation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Portal Switch: Citizen vs Admin */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#070e22] rounded-xl border border-slate-800">
            <button
              onClick={() => handlePortalSwitch('citizen')}
              className={`py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedPortal === 'citizen'
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => handlePortalSwitch('admin')}
              className={`py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedPortal === 'admin'
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Municipal Admin (Restricted)</span>
            </button>
          </div>

          {/* Mode Switch: Register First vs Login */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-semibold text-white">
              {selectedPortal === 'citizen'
                ? authMode === 'register'
                  ? 'Register as Resident Citizen'
                  : 'Citizen Account Login'
                : authMode === 'register'
                ? 'Register Municipal Staff'
                : 'Municipal Officer Login'}
            </span>

            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#070e22] border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
            </div>
          </div>

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* Dedicated Forms */}
          {selectedPortal === 'citizen' ? (
            <form onSubmit={handleCitizenSubmit} className="space-y-3 pt-2 border-t border-slate-800">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. citizen@example.com"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Ward / Neighborhood</label>
                  <select
                    value={citizenWard}
                    onChange={(e) => setCitizenWard(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs cursor-pointer"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={authMode === 'register' ? 8 : undefined}
                  placeholder="••••••••"
                  value={citizenPassword}
                  onChange={(e) => setCitizenPassword(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                />
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={citizenPasswordConfirm}
                    onChange={(e) => setCitizenPasswordConfirm(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow transition-all cursor-pointer"
              >
                {authMode === 'register' ? 'Register Citizen & Enter' : 'Log In to Citizen Hub'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-3 pt-2 border-t border-slate-800">
              <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300">
                Notice: Citizen credentials will be rejected by the Municipal Admin Command Center.
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
                      : 'Setup unavailable. Check that backend first-officer setup and its clearance code are configured.'}
                  </p>
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Municipal Clearance Code *</label>
                  <input
                    type="password"
                    required
                    autoComplete="off"
                    value={adminClearanceCode}
                    onChange={(e) => setAdminClearanceCode(e.target.value)}
                    placeholder="Provided by your system administrator"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                  />
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Officer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Officer V. Rao"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Municipal Officer Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. shannu.iot@smartcity.gov"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                />
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminPasswordConfirm}
                    onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#080f24] border border-slate-700 text-white text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (authMode === 'register' && bootstrapStatus !== 'AVAILABLE')}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow transition-all cursor-pointer"
              >
                {authMode === 'register'
                  ? isSubmitting ? 'Creating Municipal Officer…' : 'Bootstrap First Officer'
                  : isSubmitting ? 'Signing In…' : 'Sign In to Municipal Command Center'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
