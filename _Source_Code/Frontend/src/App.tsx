/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SmartCityProvider, useSmartCity } from './context/SmartCityContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { CitizenGrievanceHub } from './components/CitizenGrievanceHub';
import { AdminResolutionHub } from './components/AdminResolutionHub';
import { IoTSimulatorStudio } from './components/IoTSimulatorStudio';
import { CityMapModal } from './components/CityMapModal';
import {
  TrafficView,
  WasteView,
  WaterView,
  PollutionView,
  EmergencyView,
  SettingsView,
} from './components/ServiceViews';
import { VerifiedProofGallery } from './components/VerifiedProofGallery';
import { CreateProblemModal } from './components/CreateProblemModal';
import { ProblemDetailModal } from './components/ProblemDetailModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { ToastContainer } from './components/ToastContainer';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, isAuthenticated } = useSmartCity();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If not authenticated, render the Register/Login AuthScreen first!
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  const renderActiveView = () => {
    // Strict separation: Citizen profile ONLY accesses problems and proof!
    if (currentUser.role === 'citizen') {
      switch (activeTab) {
        case 'proof_gallery':
          return <VerifiedProofGallery />;
        case 'my_problems':
          return <CitizenGrievanceHub initialFilterMineOnly={true} />;
        case 'grievances':
          return <CitizenGrievanceHub />;
        default:
          // Citizen attempted to access an admin area
          return (
            <div className="p-8 max-w-2xl mx-auto my-12 text-center">
              <div className="p-8 rounded-2xl bg-[#0c1630] border border-rose-500/40 shadow-2xl space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Access Restricted: Municipal Command Center
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are signed in with a <strong className="text-emerald-400">Citizen Profile</strong>.
                  Municipal SCADA actuators, engineering telemetry, and admin order resolution are strictly restricted to verified city officials.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('grievances')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Citizen Grievance Hub</span>
                  </button>
                </div>
              </div>
            </div>
          );
      }
    }

    // Admin profile has access to ALL features
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'grievances':
        return <CitizenGrievanceHub />;
      case 'admin_queue':
        return <AdminResolutionHub />;
      case 'proof_gallery':
        return <VerifiedProofGallery />;
      case 'iot_simulator':
      case 'iot_studio':
        return <IoTSimulatorStudio />;
      case 'city_map':
      case 'map':
        return <CityMapModal />;
      case 'traffic':
        return <TrafficView />;
      case 'waste':
        return <WasteView />;
      case 'water':
        return <WaterView />;
      case 'pollution':
        return <PollutionView />;
      case 'emergency':
        return <EmergencyView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070d1e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* High-tech animated cyber grid and ambient glow */}
      <AnimatedBackground />

      {/* Top Header with live ticker, role selector, simulation speed */}
      <Header onOpenMobileSidebar={() => setIsSidebarOpen(true)} />

      {/* Main App Layout: Sidebar + Dynamic Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto min-w-0 bg-gradient-to-b from-[#070d1e] to-[#050914]">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CreateProblemModal />
      <ProblemDetailModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SmartCityProvider>
      <AppContent />
    </SmartCityProvider>
  );
}
