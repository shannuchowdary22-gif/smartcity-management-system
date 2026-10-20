import React from 'react';
import {
  Car,
  Trash2,
  Droplets,
  Wind,
  ShieldAlert,
  Flame,
  Ambulance,
  Activity,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Wrench,
  Cpu,
  Layers,
  FileText,
  BarChart3,
  Building2,
  Wifi,
  Zap,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';

export const DashboardOverview: React.FC = () => {
  const {
    telemetry,
    currentUser,
    isSimulationRunning,
    toggleSimulation,
    resetAllTelemetry,
    alerts,
    problems,
    actuators,
    toggleActuator,
    setTrafficOverride,
    setActiveTab,
    setIsCreateProblemOpen,
    setSelectedProblemId,
    showToast,
  } = useSmartCity();

  const recentProblems = problems.slice(0, 3);
  const unresolvedCount = problems.filter((p) => p.status !== 'resolved').length;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Smart City Dashboard Banner matching reference screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/10 border border-cyan-500/30">
            <Building2 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Smart City Dashboard
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-mono-tech font-normal">
                Live Feed
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time monitoring and control of smart city systems
            </p>
          </div>
        </div>

        {/* Quick Action Button Group */}
        <div className="flex items-center gap-2">
          {currentUser.role === 'citizen' ? (
            <button
              onClick={() => setIsCreateProblemOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Civic Grievance</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('admin_queue')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Incident Resolution Queue ({unresolvedCount})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('city_map')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[#0f1933] hover:bg-[#152347] border border-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards matching reference image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total IoT Devices */}
        <button
          type="button"
          onClick={() => setActiveTab('city_map')}
          className="p-3.5 rounded-xl bg-[#0d162e] border border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#111e40] transition-all text-left cursor-pointer group"
          title="Click to view full city geospatial sensor grid"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono-tech text-emerald-400 flex items-center gap-0.5">
              ↑ 12%
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[11px] text-slate-400 font-medium group-hover:text-cyan-300 transition-colors">
              Total IoT Devices
            </div>
            <div className="text-xl font-display font-bold text-white mt-0.5">
              {telemetry.totalDevices}
            </div>
          </div>
        </button>

        {/* Card 2: Active Devices */}
        <button
          type="button"
          onClick={() => setActiveTab('city_map')}
          className="p-3.5 rounded-xl bg-[#0d162e] border border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#111e40] transition-all text-left cursor-pointer group"
          title="Click to inspect active sensor arrays"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Wifi className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono-tech text-emerald-400 flex items-center gap-0.5">
              ↑ 86%
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[11px] text-slate-400 font-medium group-hover:text-cyan-300 transition-colors">
              Active Devices
            </div>
            <div className="text-xl font-display font-bold text-white mt-0.5">
              {telemetry.activeDevices}
            </div>
          </div>
        </button>

        {/* Card 3: Running Simulations */}
        <button
          type="button"
          onClick={() => setActiveTab('iot_simulator')}
          className="p-3.5 rounded-xl bg-[#0d162e] border border-slate-800/80 hover:border-indigo-500/50 hover:bg-[#111e40] transition-all text-left cursor-pointer group"
          title="Click to enter IoT Design & Breadboard Simulator"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-indigo-400" />
            </div>
            <span className="text-[10px] font-mono-tech text-cyan-400 flex items-center gap-0.5">
              ↑ 2 active
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[11px] text-slate-400 font-medium group-hover:text-indigo-300 transition-colors">
              Running Simulations
            </div>
            <div className="text-xl font-display font-bold text-white mt-0.5">
              {telemetry.runningSimulations}
            </div>
          </div>
        </button>

        {/* Card 4: Active Alerts */}
        <button
          type="button"
          onClick={() => setActiveTab('emergency')}
          className="p-3.5 rounded-xl bg-[#0d162e] border border-slate-800/80 hover:border-rose-500/50 hover:bg-[#111e40] transition-all text-left cursor-pointer group"
          title="Click to view Active Alerts & Emergency Dispatch"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono-tech text-rose-400 flex items-center gap-0.5">
              ↑ {telemetry.activeAlertsCount} new
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[11px] text-slate-400 font-medium group-hover:text-rose-300 transition-colors">
              Active Alerts
            </div>
            <div className="text-xl font-display font-bold text-rose-300 mt-0.5">
              {telemetry.activeAlertsCount}
            </div>
          </div>
        </button>

        {/* Card 5: Total Projects */}
        <button
          type="button"
          onClick={() => setActiveTab('iot_simulator')}
          className="p-3.5 rounded-xl bg-[#0d162e] border border-slate-800/80 hover:border-cyan-500/50 hover:bg-[#111e40] transition-all text-left cursor-pointer group"
          title="Click to open IoT Projects Studio"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono-tech text-cyan-400 flex items-center gap-0.5">
              ↑ 1 new
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[11px] text-slate-400 font-medium group-hover:text-cyan-300 transition-colors">
              Total Projects
            </div>
            <div className="text-xl font-display font-bold text-white mt-0.5">
              {telemetry.totalProjects}
            </div>
          </div>
        </button>

        {/* Card 6: Simulation Tests */}
        <button
          type="button"
          onClick={() => setActiveTab('iot_simulator')}
          className="p-3.5 rounded-xl bg-[#0d162e] border border-slate-800/80 hover:border-emerald-500/50 hover:bg-[#111e40] transition-all text-left cursor-pointer group"
          title="Click to run Simulation Stress Tests"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono-tech text-emerald-400 flex items-center gap-0.5">
              ↑ 3 today
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[11px] text-slate-400 font-medium group-hover:text-emerald-300 transition-colors">
              Simulation Tests
            </div>
            <div className="text-xl font-display font-bold text-white mt-0.5">
              {telemetry.simulationTests}
            </div>
          </div>
        </button>
      </div>

      {/* Main Service 4-Grid matching reference image */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Traffic Monitoring Card */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Traffic Monitoring
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Normal
            </div>
          </div>

          <div className="py-3 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Vehicle Count</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-display font-bold text-white">
                    {telemetry.vehicleCount}
                  </span>
                  <span className="text-[11px] font-mono-tech text-emerald-400">
                    ↑ 12%
                  </span>
                </div>
              </div>

              {/* Traffic Signal Graphic */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-mono-tech mb-1">
                  Traffic Signal
                </span>
                <div className="flex items-center gap-2 bg-[#080e21] px-2 py-1 rounded-lg border border-slate-800">
                  <div className="flex gap-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        telemetry.trafficSignalState === 'red'
                          ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          : 'bg-rose-950 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        telemetry.trafficSignalState === 'yellow'
                          ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                          : 'bg-amber-950 opacity-40'
                      }`}
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        telemetry.trafficSignalState === 'green'
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-emerald-950 opacity-40'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-mono-tech font-semibold text-emerald-400">
                    {telemetry.trafficSignalState.toUpperCase()} ({telemetry.trafficSignalCountdown}s)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-[#070e22] border border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Density</span>
                <span className="font-semibold text-slate-200">
                  {telemetry.trafficDensity}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Congestion</span>
                <span className="font-semibold text-emerald-400">
                  {telemetry.trafficCongestion}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Avg Speed</span>
                <span className="font-semibold text-slate-200">
                  {telemetry.avgSpeed} km/h
                </span>
              </div>
            </div>

            {/* Vehicle Count Wave Graph */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Vehicle Count (Last 1 Hour)</span>
                <span className="font-mono-tech text-cyan-400">1.5k max</span>
              </div>
              <div className="h-16 w-full bg-[#080f24] rounded-lg p-1.5 border border-slate-800/60 relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 32 Q 15 28, 30 20 T 60 14 T 80 18 T 100 8 L 100 40 L 0 40 Z"
                    fill="url(#trafficGrad)"
                  />
                  <path
                    d="M 0 32 Q 15 28, 30 20 T 60 14 T 80 18 T 100 8"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono-tech mt-1 px-1">
                <span>10:00</span>
                <span>10:15</span>
                <span>10:30</span>
                <span>10:45</span>
                <span>11:00</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              onClick={() => setActiveTab('traffic')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              Control Signals <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-500 font-mono-tech">Node: TRF-04</span>
          </div>
        </div>

        {/* 2. Waste Management Card */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Waste Management
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Normal • Live
            </div>
          </div>

          <div className="py-3 space-y-3">
            {/* Circular Fill Level Gauge */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Bin Fill Level</span>
                <div className="text-xl font-display font-bold text-white mt-0.5">
                  {telemetry.wasteBinFillLevel}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Full Bins: <span className="font-semibold text-amber-400">{telemetry.fullBinsCount}</span> / {telemetry.totalBins}
                </div>
              </div>

              {/* Radial Gauge */}
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#06b6d4"
                    strokeDasharray={`${telemetry.wasteBinFillLevel}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xs font-bold text-cyan-300 font-display">
                    {telemetry.wasteBinFillLevel}%
                  </span>
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-2 p-2.5 rounded-xl bg-[#070e22] border border-slate-800/80 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Collection Status:</span>
                <span className="font-medium text-emerald-400">
                  {telemetry.wasteCollectionStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Smart Bins Active:</span>
                <span className="font-medium text-slate-200">10 Compactor Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alerts:</span>
                <span className="font-medium text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Bin #3 (95% full)
                </span>
              </div>
            </div>

            {/* Smart Compactor Status */}
            <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-900/40 flex items-center justify-between text-[11px]">
              <span className="text-cyan-300">Fleet Dispatch Route</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono-tech">
                Truck #07 en route
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              onClick={() => setActiveTab('waste')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              View Details <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-500 font-mono-tech">Zone 3</span>
          </div>
        </div>

        {/* 3. Water Management Card */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Water Management
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Normal • Live
            </div>
          </div>

          <div className="py-3 space-y-3">
            {/* Water Tank Level Gauge */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Tank Level</span>
                <div className="text-xl font-display font-bold text-white mt-0.5">
                  {telemetry.waterTankLevel}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Capacity: <span className="font-semibold text-slate-200">120,000 L</span>
                </div>
              </div>

              {/* Water Tank Graphic */}
              <div className="relative w-14 h-16 rounded-lg bg-[#070e22] border-2 border-blue-500/40 p-1 flex flex-col justify-end overflow-hidden shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded transition-all duration-500 flex items-center justify-center"
                  style={{ height: `${telemetry.waterTankLevel}%` }}
                >
                  <span className="text-[10px] font-bold text-white font-mono-tech drop-shadow">
                    {Math.round(telemetry.waterTankLevel)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics List */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-[#070e22] border border-slate-800/80 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Flow Rate:</span>
                <span className="font-semibold text-slate-200">
                  {telemetry.waterFlowRate} L/min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pressure:</span>
                <span className="font-semibold text-slate-200">
                  {telemetry.waterPressure} bar
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Leakage:</span>
                <span className="font-semibold text-emerald-400">
                  {telemetry.waterLeakageStatus}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400">Pump Status:</span>
                <button
                  onClick={() => toggleActuator('waterPumpOn')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    actuators.waterPumpOn
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {actuators.waterPumpOn ? '● ON (Active)' : '○ OFF'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              onClick={() => setActiveTab('water')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              SCADA Controls <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-500 font-mono-tech">Valve #12</span>
          </div>
        </div>

        {/* 4. Pollution Monitoring Card */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Wind className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Pollution Monitoring
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-[10px] text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Moderate • Live
            </div>
          </div>

          <div className="py-3 space-y-3">
            {/* AQI Gauge & Number */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-slate-400 font-mono-tech">AQI</span>
                  <span className="text-xs text-amber-400 font-medium">Moderate</span>
                </div>
                <div className="text-2xl font-display font-bold text-amber-300 mt-0.5">
                  {telemetry.aqi}
                </div>
                <div className="text-[10px] text-slate-400">
                  Sector 9 Station
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeDasharray={`${(telemetry.aqi / 300) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xs font-bold text-amber-300 font-display">
                    {telemetry.aqi}
                  </span>
                </div>
              </div>
            </div>

            {/* Sensor Array readings */}
            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#070e22] border border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px]">PM2.5</span>
                <span className="font-semibold text-slate-200">{telemetry.pm25} µg/m³</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">PM10</span>
                <span className="font-semibold text-slate-200">{telemetry.pm10} µg/m³</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">CO₂</span>
                <span className="font-semibold text-slate-200">{telemetry.co2} ppm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">Temp / Hum</span>
                <span className="font-semibold text-slate-200">
                  {telemetry.temperature}°C / {telemetry.humidity}%
                </span>
              </div>
            </div>

            {/* Mini trend line */}
            <div className="h-6 w-full flex items-center gap-1">
              <span className="text-[9px] text-slate-500">Trend:</span>
              <div className="flex-1 h-2 bg-[#091124] rounded-full overflow-hidden flex">
                <div className="w-1/3 bg-emerald-500/70" />
                <div className="w-1/2 bg-amber-500/80" />
                <div className="w-1/6 bg-rose-500/70" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <button
              onClick={() => setActiveTab('pollution')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              Clean Air Grid <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-500 font-mono-tech">ENV-09</span>
          </div>
        </div>
      </div>

      {/* Second Row: Emergency Management, Recent Alerts, System Health, Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Emergency Management */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Emergency Management
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Safe
            </div>
          </div>

          <div className="py-3 grid grid-cols-3 gap-2">
            {/* Fire */}
            <button
              type="button"
              onClick={() => {
                showToast('Fire sensor telemetry verified: Thermal optical detectors 100% clear across all wards.', 'success');
              }}
              className="p-2 rounded-xl bg-[#070e22] hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 text-center flex flex-col items-center justify-between cursor-pointer transition-all group"
              title="Click to run sensor diagnostic"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 mb-1 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">Fire</span>
              <span className="text-[11px] font-bold text-emerald-400">Clear</span>
              <span className="text-[9px] text-cyan-400 mt-1 font-mono-tech group-hover:underline">Run Diagnostic</span>
            </button>

            {/* Accident */}
            <button
              type="button"
              onClick={() => {
                showToast('Highway radar loop check: Flow speed 42 km/h, 0 roadway collision flags.', 'info');
              }}
              className="p-2 rounded-xl bg-[#070e22] hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 text-center flex flex-col items-center justify-between cursor-pointer transition-all group"
              title="Click to check highway radar telemetry"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1 group-hover:scale-110 transition-transform">
                <Car className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">Accident</span>
              <span className="text-[11px] font-bold text-emerald-400">Normal</span>
              <span className="text-[9px] text-cyan-400 mt-1 font-mono-tech group-hover:underline">Scan Radar</span>
            </button>

            {/* Medical */}
            <button
              type="button"
              onClick={() => {
                showToast('City trauma EMS network: 14 ambulances on active patrol, response ETA < 4 min.', 'success');
              }}
              className="p-2 rounded-xl bg-[#070e22] hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 text-center flex flex-col items-center justify-between cursor-pointer transition-all group"
              title="Click to inspect paramedic readiness"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1 group-hover:scale-110 transition-transform">
                <Ambulance className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-slate-300">Medical</span>
              <span className="text-[11px] font-bold text-emerald-400">Ready</span>
              <span className="text-[9px] text-cyan-400 mt-1 font-mono-tech group-hover:underline">EMS Standby</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('emergency')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
            >
              Broadcast SOS Alert →
            </button>
            <span className="text-[10px] text-slate-500 font-mono-tech">911 Link Active</span>
          </div>
        </div>

        {/* Card 2: Recent Alerts */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Recent Alerts
              </span>
            </div>
            <button
              onClick={() => setActiveTab('emergency')}
              className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
            >
              View All &gt;
            </button>
          </div>

          <div className="py-2 space-y-2">
            {alerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className="p-2.5 rounded-xl bg-[#070e22] border border-slate-800/80 flex items-start gap-2.5 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-tech shrink-0">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Critical Notifications</span>
            <span className="text-emerald-400 font-mono-tech">Live Gateway</span>
          </div>
        </div>

        {/* Card 3: System Health */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                System Health
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono-tech">
              ● Good
            </div>
          </div>

          <div className="py-2 flex items-center gap-4">
            {/* Health Radial */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeDasharray={`${telemetry.overallHealth}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-bold text-emerald-300 font-display">
                  {telemetry.overallHealth}%
                </span>
              </div>
            </div>

            {/* Health Bars */}
            <div className="flex-1 space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Network</span>
                  <span className="font-mono-tech">{telemetry.networkHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#070e22] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${telemetry.networkHealth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Power</span>
                  <span className="font-mono-tech">{telemetry.powerHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#070e22] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${telemetry.powerHealth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Sensors</span>
                  <span className="font-mono-tech">{telemetry.sensorHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#070e22] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${telemetry.sensorHealth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Actuators</span>
                  <span className="font-mono-tech">{telemetry.actuatorHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#070e22] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${telemetry.actuatorHealth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>Overall System Health</span>
            <span className="text-emerald-400 font-semibold">● Good</span>
          </div>
        </div>

        {/* Card 4: Quick Actions matching reference image */}
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800/90 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Quick Actions
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 py-2">
            <button
              onClick={toggleSimulation}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isSimulationRunning
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/50'
              }`}
            >
              {isSimulationRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Sim</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Sim</span>
                </>
              )}
            </button>

            <button
              onClick={resetAllTelemetry}
              className="p-2 rounded-xl bg-[#070e22] border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset All</span>
            </button>

            <button
              onClick={() => setActiveTab('iot_simulator')}
              className="p-2 rounded-xl bg-[#070e22] border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>IoT Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('grievances')}
              className="p-2 rounded-xl bg-[#070e22] border border-slate-800 hover:border-emerald-500/40 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grievances</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>Fast Commands</span>
            <span className="text-cyan-400">All Modules Ready</span>
          </div>
        </div>
      </div>

      {/* Citizen Grievances & Problem Sharing Spotlight Banner */}
      <div className="p-4 lg:p-5 rounded-2xl bg-gradient-to-r from-[#0c1836] via-[#0f2147] to-[#0c1836] border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono-tech">
                Citizen Portal & Community Voice
              </span>
              <span className="text-xs text-slate-400 font-mono-tech">
                {problems.length} Community Reports
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">
              Public Problems & Civic Grievance Tracker
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Citizens report potholes, waste overflow, and water leaks. Municipal authorities resolve, dispatch teams, and update live status.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateProblemOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Share a Problem</span>
            </button>
            <button
              onClick={() => setActiveTab('grievances')}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#091124] border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <span>View All ({problems.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Latest Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentProblems.map((problem) => (
            <div
              key={problem.id}
              onClick={() => setSelectedProblemId(problem.id)}
              className="p-3.5 rounded-xl bg-[#070e22]/90 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      problem.status === 'resolved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : problem.status === 'in_progress'
                        ? 'bg-blue-950 text-blue-300 border border-blue-700/50'
                        : problem.status === 'dispatched'
                        ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                    }`}
                  >
                    {problem.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-tech">
                    {problem.id}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {problem.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {problem.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[130px]">📍 {problem.location.ward}</span>
                <span className="text-cyan-400 font-mono-tech font-semibold">
                  👍 {problem.upvotes} upvotes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
