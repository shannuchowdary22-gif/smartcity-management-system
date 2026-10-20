import React, { useEffect, useState } from 'react';
import {
  Car,
  Trash2,
  Droplets,
  Wind,
  ShieldAlert,
  Flame,
  Ambulance,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Send,
  Zap,
  Volume2,
  RefreshCw,
  Clock,
  Radio,
  Download,
  Activity,
  BarChart3,
  TrendingUp,
  Gauge,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useSmartCity } from '../context/SmartCityContext';
import { api } from '../services/api';

/* ================= TRAFFIC VIEW ================= */
export const TrafficView: React.FC = () => {
  const { telemetry, actuators, setTrafficOverride, updateTelemetry, showToast } = useSmartCity();
  const [selectedJunction, setSelectedJunction] = useState('Cyber Hub & Outer Ring Junction');
  const [trafficTimeRange, setTrafficTimeRange] = useState<'today' | 'weekly'>('today');

  const handleGreenWave = () => {
    setTrafficOverride('green');
    showToast('Green Wave Corridor activated: Signals locked green for priority transit.', 'success');
  };

  const handleSimulateRushHour = () => {
    updateTelemetry({ trafficCongestion: 'Heavy', vehicleCount: 1840, activeAlertsCount: telemetry.activeAlertsCount + 1 });
    showToast('Peak Rush Hour simulated: Induction loops report 1,840 veh/hr.', 'warning');
  };

  // 24-Hour Traffic Flow Data
  const hourlyTrafficData = [
    { time: '00:00', vehicles: 180, speed: 62, queueDelay: 8 },
    { time: '02:00', vehicles: 95, speed: 68, queueDelay: 4 },
    { time: '04:00', vehicles: 120, speed: 66, queueDelay: 6 },
    { time: '06:00', vehicles: 390, speed: 55, queueDelay: 15 },
    { time: '08:00', vehicles: 920, speed: 38, queueDelay: 48 },
    { time: '09:00', vehicles: 1280, speed: 28, queueDelay: 64 },
    { time: '10:00', vehicles: 1140, speed: 32, queueDelay: 52 },
    { time: '12:00', vehicles: 760, speed: 44, queueDelay: 26 },
    { time: '14:00', vehicles: 710, speed: 46, queueDelay: 22 },
    { time: '16:00', vehicles: 890, speed: 40, queueDelay: 38 },
    { time: '18:00', vehicles: 1420, speed: 24, queueDelay: 78 },
    { time: '19:00', vehicles: 1350, speed: 26, queueDelay: 70 },
    { time: '20:00', vehicles: 980, speed: 36, queueDelay: 42 },
    { time: '22:00', vehicles: 510, speed: 52, queueDelay: 18 },
  ];

  // Junction Capacity vs Flow
  const junctionCapacityData = [
    { name: 'Outer Ring Rd', currentFlow: 1420, capacity: 1600, waitSec: 72 },
    { name: 'Cyber Hub Junc', currentFlow: 1180, capacity: 1300, waitSec: 54 },
    { name: 'Central Metro', currentFlow: 890, capacity: 1200, waitSec: 36 },
    { name: 'Tech Park Expwy', currentFlow: 1640, capacity: 1700, waitSec: 88 },
    { name: 'MG Road Junc', currentFlow: 740, capacity: 1000, waitSec: 32 },
  ];

  // Fleet Transit Distribution
  const modalTrafficShare = [
    { name: 'Private Autos / Cars', value: 46, color: '#38bdf8' },
    { name: 'Electric Smart Buses', value: 24, color: '#10b981' },
    { name: 'Two-Wheelers & EV Mopeds', value: 18, color: '#f59e0b' },
    { name: 'Commercial Logistics', value: 8, color: '#818cf8' },
    { name: 'Emergency Services', value: 4, color: '#f43f5e' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-400" />
            Intelligent Traffic Management & Real-Time Flow SCADA
          </h1>
          <p className="text-xs text-slate-400">
            Real-time induction loop sensors, adaptive signal phase timing, corridor speed gradients, and emergency overrides
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGreenWave}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer transition-all active:scale-95"
          >
            Force Green Wave
          </button>
          <button
            type="button"
            onClick={handleSimulateRushHour}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            Simulate Rush Flow
          </button>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Active Hourly Flow</span>
          <span className="text-2xl font-bold font-display text-white mt-1 block">
            {telemetry.vehicleCount} veh/hr
          </span>
          <span className="text-[10px] text-cyan-400 font-mono-tech">18 Induction Loop Arrays</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Corridor Average Speed</span>
          <span className="text-2xl font-bold font-display text-emerald-400 mt-1 block">
            {telemetry.avgSpeed} km/h
          </span>
          <span className="text-[10px] text-emerald-400 font-mono-tech">Target: ≥ 40 km/h</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Intersection Average Delay</span>
          <span className="text-2xl font-bold font-display text-cyan-300 mt-1 block">
            42 sec
          </span>
          <span className="text-[10px] text-slate-400 font-mono-tech">Adaptive Phase Sync</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Congestion Level</span>
          <span className={`text-2xl font-bold font-display mt-1 block ${
            telemetry.trafficCongestion === 'Heavy' ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {telemetry.trafficCongestion}
          </span>
          <span className="text-[10px] text-slate-400 font-mono-tech">Density: {telemetry.trafficDensity}</span>
        </div>
      </div>

      {/* Main Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Primary Area Chart: 24-Hour Traffic Volume & Average Speed */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                24-Hour Vehicular Volume & Speed Velocity Trend
              </span>
              <span className="text-[11px] text-slate-400">
                Continuous optical & induction loop telemetry across arterial corridors
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono-tech">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Vehicular Volume
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Speed (km/h)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#06b6d4', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any, name: any) => [
                    name === 'vehicles' ? `${val} veh/hr` : `${val} km/h`,
                    name === 'vehicles' ? 'Traffic Volume' : 'Corridor Speed'
                  ]}
                />
                <Area type="monotone" dataKey="vehicles" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#trafficGradient)" />
                <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Share Donut Chart */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Corridor Transit Fleet Share
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Automated vehicle classification AI
            </span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalTrafficShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {modalTrafficShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#070e22" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                  formatter={(value: any) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
            {modalTrafficShare.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono-tech font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Corridor Delay Comparison & Signal Phase Actuator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Corridor Capacity & Bottleneck Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Arterial Corridor Volume vs Capacity Ceiling
              </span>
              <span className="text-[11px] text-slate-400">
                Peak load vs designed road throughput capacity
              </span>
            </div>
            <span className="text-[10px] font-mono-tech text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
              High-Congestion Nodes Highlighted
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={junctionCapacityData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#f59e0b', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any, name: any) => [
                    `${val} veh/hr`,
                    name === 'currentFlow' ? 'Current Volume' : 'Max Capacity'
                  ]}
                />
                <Bar dataKey="currentFlow" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Junction Signal Controller */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-white block mb-1">
              Active Intersection Signal Phase Controller
            </span>
            <span className="text-[11px] text-slate-400 block">
              Direct telemetry link to Node TRF-04 Optical Relay
            </span>
          </div>

          <div className="flex items-center justify-center p-4 bg-[#070e22] rounded-2xl border border-slate-800">
            <div className="flex flex-col items-center gap-3 bg-black/80 p-3.5 rounded-3xl border-2 border-slate-700 shadow-2xl">
              <button
                onClick={() => setTrafficOverride('red')}
                className={`w-11 h-11 rounded-full transition-all cursor-pointer ${
                  telemetry.trafficSignalState === 'red'
                    ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e] scale-110'
                    : 'bg-rose-950/40 border border-rose-900'
                }`}
                title="Override Red"
              />
              <button
                onClick={() => setTrafficOverride('yellow')}
                className={`w-11 h-11 rounded-full transition-all cursor-pointer ${
                  telemetry.trafficSignalState === 'yellow'
                    ? 'bg-amber-400 shadow-[0_0_20px_#fbbf24] scale-110'
                    : 'bg-amber-950/40 border border-amber-900'
                }`}
                title="Override Amber"
              />
              <button
                onClick={() => setTrafficOverride('green')}
                className={`w-11 h-11 rounded-full transition-all cursor-pointer ${
                  telemetry.trafficSignalState === 'green'
                    ? 'bg-emerald-400 shadow-[0_0_20px_#34d399] scale-110'
                    : 'bg-emerald-950/40 border border-emerald-900'
                }`}
                title="Override Green"
              />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Controller Mode:</span>
              <span className="font-mono-tech text-cyan-300 font-bold uppercase">
                {actuators.trafficOverride === 'auto' ? 'Auto-Adaptive AI' : 'Manual Lock'}
              </span>
            </div>
            <button
              onClick={() => setTrafficOverride('auto')}
              className="w-full py-2 rounded-xl text-xs font-bold bg-[#0e172f] hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer transition-all"
            >
              Restore Automated AI Cycle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= WASTE VIEW ================= */
export const WasteView: React.FC = () => {
  const { showToast } = useSmartCity();
  const [dispatchedTruck, setDispatchedTruck] = useState(false);
  const [bins, setBins] = useState([
    { id: 'BIN-01', location: 'Commercial Plaza North', fill: 45, status: 'Normal', sector: 'Sector 1' },
    { id: 'BIN-02', location: 'Tech Park Food Court', fill: 68, status: 'Normal', sector: 'Sector 7' },
    { id: 'BIN-03', location: 'Central Metro Gate 2', fill: 95, status: 'Critical', sector: 'Sector 3' },
    { id: 'BIN-04', location: 'Green Park Sector 4', fill: 30, status: 'Normal', sector: 'Sector 4' },
    { id: 'BIN-05', location: 'City Hospital West', fill: 82, status: 'Warning', sector: 'Sector 10' },
    { id: 'BIN-06', location: 'Education Hub Library', fill: 52, status: 'Normal', sector: 'Sector 2' },
    { id: 'BIN-07', location: 'Industrial Estate Gate', fill: 74, status: 'Normal', sector: 'Sector 6' },
    { id: 'BIN-08', location: 'Riverfront Walkway', fill: 38, status: 'Normal', sector: 'Sector 12' },
  ]);

  useEffect(() => {
    let active = true;
    void api.getWaste().then((resources) => {
      if (!active) return;
      const savedBins = resources.flatMap(({ data }) => {
        if (
          typeof data.binId !== 'string' ||
          typeof data.fillLevel !== 'number' ||
          typeof data.status !== 'string'
        ) return [];
        return [{ id: data.binId, fill: data.fillLevel, status: data.status }];
      });
      if (savedBins.length > 0) {
        setBins((previous) => previous.map((bin) => {
          const saved = savedBins.find((item) => item.id === bin.id);
          return saved ? { ...bin, ...saved } : bin;
        }));
      }
    }).catch((error: unknown) => {
      showToast(error instanceof Error ? error.message : 'Waste readings could not be loaded.', 'warning');
    });
    return () => {
      active = false;
    };
  }, []);

  // Weekly Solid Waste vs Recyclables Data (in Metric Tons)
  const weeklyWasteData = [
    { day: 'Mon', organic: 42, plastics: 18, ewaste: 4, divertedRate: 34 },
    { day: 'Tue', organic: 38, plastics: 16, ewaste: 3, divertedRate: 33 },
    { day: 'Wed', organic: 45, plastics: 22, ewaste: 6, divertedRate: 38 },
    { day: 'Thu', organic: 40, plastics: 19, ewaste: 5, divertedRate: 37 },
    { day: 'Fri', organic: 52, plastics: 28, ewaste: 8, divertedRate: 41 },
    { day: 'Sat', organic: 64, plastics: 35, ewaste: 11, divertedRate: 42 },
    { day: 'Sun', organic: 58, plastics: 32, ewaste: 9, divertedRate: 40 },
  ];

  // Route Efficiency & Fuel Savings Trend
  const fleetEfficiencyData = [
    { shift: 'Shift 1', routeKm: 140, fuelSavedLiters: 45, compactionRatio: 4.2 },
    { shift: 'Shift 2', routeKm: 125, fuelSavedLiters: 58, compactionRatio: 4.5 },
    { shift: 'Shift 3', routeKm: 110, fuelSavedLiters: 72, compactionRatio: 4.8 },
    { shift: 'Shift 4', routeKm: 98, fuelSavedLiters: 84, compactionRatio: 5.1 },
    { shift: 'Shift 5', routeKm: 92, fuelSavedLiters: 92, compactionRatio: 5.3 },
  ];

  const handleEmptyBin = async (id: string) => {
    try {
      await api.createWaste({ binId: id, fillLevel: 10, status: 'Normal' });
    } catch (error) {
      showToast(error instanceof Error ? `Bin reading was not saved: ${error.message}` : 'Bin reading was not saved.', 'error');
      return;
    }
    setBins((prev) =>
      prev.map((b) => (b.id === id ? { ...b, fill: 10, status: 'Normal' } : b))
    );
    showToast(`Bin ${id} compacted and emptied by municipal sanitation unit.`, 'success');
  };

  const handleDispatchTruck = async () => {
    const servicedBins = bins.filter((bin) => bin.fill > 60);
    try {
      await Promise.all(servicedBins.map((bin) =>
        api.createWaste({ binId: bin.id, fillLevel: 12, status: 'Normal' })
      ));
    } catch (error) {
      showToast(error instanceof Error ? `Waste readings were not saved: ${error.message}` : 'Waste readings were not saved.', 'error');
      return;
    }
    setDispatchedTruck(true);
    setBins((prev) =>
      prev.map((b) => (b.fill > 60 ? { ...b, fill: 12, status: 'Normal' } : b))
    );
    showToast('Autonomous sanitation compaction truck #07 dispatched to route!', 'success');
    setTimeout(() => setDispatchedTruck(false), 4000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-cyan-400" />
            Autonomous Waste Compaction & Fleet Logistics
          </h1>
          <p className="text-xs text-slate-400">
            Ultrasonic bin fill telemetry, automated compaction relays, landfill diversion rates, and dynamic truck route dispatch
          </p>
        </div>

        <button
          type="button"
          onClick={handleDispatchTruck}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer transition-all active:scale-95 flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {dispatchedTruck ? '✓ Truck #07 Dispatched to Route!' : 'Dispatch Cleanup Truck Now'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Average Fleet Fill Level</span>
          <span className="text-2xl font-bold font-display text-white mt-1 block">
            {Math.round(bins.reduce((acc, b) => acc + b.fill, 0) / bins.length)}%
          </span>
          <span className="text-[10px] text-cyan-400 font-mono-tech">8 Monitored Smart Hubs</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Critical Bins (&gt; 85%)</span>
          <span className="text-2xl font-bold font-display text-rose-400 mt-1 block">
            {bins.filter((b) => b.fill > 85).length} Units
          </span>
          <span className="text-[10px] text-rose-400 font-mono-tech">Immediate Route Flagged</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Landfill Diversion Rate</span>
          <span className="text-2xl font-bold font-display text-emerald-400 mt-1 block">
            41.8%
          </span>
          <span className="text-[10px] text-emerald-400 font-mono-tech">Recycling Target Exceeded</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Compaction Ratio</span>
          <span className="text-2xl font-bold font-display text-cyan-300 mt-1 block">
            5.2 : 1
          </span>
          <span className="text-[10px] text-slate-400 font-mono-tech">Hydraulic Press Active</span>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Graph 1: Weekly Waste Generation & Recycling Breakdown */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                7-Day Municipal Solid Waste vs Recyclables (Metric Tons)
              </span>
              <span className="text-[11px] text-slate-400">
                Segregation of organic compostables, recyclable plastics, and diverted electronic waste
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono-tech">
              <span className="text-cyan-400">■ Organic</span>
              <span className="text-emerald-400">■ Plastics</span>
              <span className="text-amber-400">■ E-Waste</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyWasteData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#10b981', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any, name: any) => [`${val} Tons`, typeof name === 'string' ? name.toUpperCase() : String(name)]}
                />
                <Bar dataKey="organic" fill="#06b6d4" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="plastics" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ewaste" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Smart Bin Fill Level Breakdown by Sector with Threshold Lines */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Ultrasonic Fill Levels Across City Sector Bins
              </span>
              <span className="text-[11px] text-slate-400">
                Red reference line indicates 85% critical dispatch threshold
              </span>
            </div>
            <span className="text-[10px] font-mono-tech text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded">
              85% Threshold Line
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="id" stroke="#64748b" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#06b6d4', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Bin Fill Capacity']}
                />
                <ReferenceLine y={85} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Critical (85%)', fill: '#f43f5e', fontSize: 10 }} />
                <Bar dataKey="fill" radius={[4, 4, 0, 0]}>
                  {bins.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill >= 85 ? '#f43f5e' : entry.fill >= 70 ? '#f59e0b' : '#06b6d4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Bin Node Cards */}
      <div className="pt-2">
        <span className="text-xs font-bold text-white block mb-3">
          Active Municipal Ultrasonic Sensor Nodes (Click "Empty / Compress" to trigger hydraulic cycle):
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bins.map((bin) => (
            <div
              key={bin.id}
              className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-tech text-xs font-bold text-cyan-400">
                  {bin.id}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    bin.status === 'Critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-600'
                      : bin.status === 'Warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                  }`}
                >
                  {bin.status}
                </span>
              </div>

              <h3 className="text-xs font-bold text-white">{bin.location}</h3>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Fill Level</span>
                  <span className="font-mono-tech font-bold text-cyan-300">{bin.fill}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#070e22] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      bin.fill > 85 ? 'bg-rose-500' : bin.fill > 70 ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${bin.fill}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono-tech">{bin.sector}</span>
                <button
                  type="button"
                  onClick={() => handleEmptyBin(bin.id)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium cursor-pointer transition-all active:scale-95"
                >
                  Empty / Compress
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================= WATER VIEW ================= */
export const WaterView: React.FC = () => {
  const { telemetry, actuators, toggleActuator, showToast } = useSmartCity();

  const handleAcousticDiagnostic = () => {
    showToast('Acoustic Leak Scan: 14.8 km hydrophone array reports 0 pipeline breaches. Noise floor 18 dB.', 'success');
  };

  const handlePurgeAirValve = () => {
    showToast('Air release valves purged at Pumping Station #4. Pressure regulated at 3.4 bar.', 'info');
  };

  // 24-Hour SCADA Reservoir Level & Inflow vs Outflow Hydrograph
  const hydrographData = [
    { time: '00:00', tankLevel: 76, inflowRate: 18.2, outflowDemand: 9.4 },
    { time: '03:00', tankLevel: 82, inflowRate: 19.5, outflowDemand: 6.8 },
    { time: '06:00', tankLevel: 84, inflowRate: 18.0, outflowDemand: 16.5 },
    { time: '08:00', tankLevel: 75, inflowRate: 16.5, outflowDemand: 28.4 },
    { time: '10:00', tankLevel: 68, inflowRate: 15.0, outflowDemand: 22.1 },
    { time: '12:00', tankLevel: 65, inflowRate: 16.2, outflowDemand: 18.9 },
    { time: '15:00', tankLevel: 63, inflowRate: 17.5, outflowDemand: 17.2 },
    { time: '18:00', tankLevel: 60, inflowRate: 18.0, outflowDemand: 26.8 },
    { time: '20:00', tankLevel: 64, inflowRate: 19.2, outflowDemand: 21.0 },
    { time: '23:00', tankLevel: 72, inflowRate: 18.8, outflowDemand: 11.2 },
  ];

  // Pressure Gradient across Distribution Nodes (PRV-01 to PRV-06)
  const prvPressureData = [
    { node: 'PRV-01 (Sector 1)', pressure: 3.4, safeMin: 2.0, safeMax: 4.0 },
    { node: 'PRV-02 (Sector 4)', pressure: 2.8, safeMin: 2.0, safeMax: 4.0 },
    { node: 'PRV-03 (Sector 7)', pressure: 3.9, safeMin: 2.0, safeMax: 4.0 },
    { node: 'PRV-04 (Sector 2)', pressure: 2.3, safeMin: 2.0, safeMax: 4.0 },
    { node: 'PRV-05 (Sector 10)', pressure: 3.6, safeMin: 2.0, safeMax: 4.0 },
    { node: 'PRV-06 (Industrial)', pressure: 4.2, safeMin: 2.0, safeMax: 4.0 },
  ];

  // Acoustic Sensor Vibration Frequency Spectrum (Hz vs dB)
  const acousticSpectrumData = [
    { freq: '50 Hz', amp: 14, threshold: 35 },
    { freq: '100 Hz', amp: 18, threshold: 35 },
    { freq: '200 Hz', amp: 22, threshold: 35 },
    { freq: '350 Hz', amp: 26, threshold: 35 },
    { freq: '500 Hz', amp: 20, threshold: 35 },
    { freq: '700 Hz', amp: 16, threshold: 35 },
    { freq: '1000 Hz', amp: 12, threshold: 35 },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            Smart Water Grid & SCADA Telemetry System
          </h1>
          <p className="text-xs text-slate-400">
            Municipal water pipeline monitoring, pressure gradient analysis, acoustic leak detection, and automated pumps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAcousticDiagnostic}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" /> Run Acoustic Leak Scan
          </button>
          <button
            type="button"
            onClick={handlePurgeAirValve}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            Purge Air Valves
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Reservoir Tank Level</span>
          <span className="text-2xl font-bold font-display text-cyan-300 mt-1 block">
            {telemetry.waterTankLevel}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono-tech">120,000 Liters Capacity</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Pumping Flow Rate</span>
          <span className="text-2xl font-bold font-display text-white mt-1 block">
            {telemetry.waterFlowRate} L/min
          </span>
          <span className="text-[10px] text-emerald-400 font-mono-tech">Laminar Regime</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Main Line Pressure</span>
          <span className="text-2xl font-bold font-display text-white mt-1 block">
            {telemetry.waterPressure} bar
          </span>
          <span className="text-[10px] text-cyan-400 font-mono-tech">Safe Band (2.0 - 4.0)</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Acoustic Leakage Status</span>
          <span className="text-2xl font-bold font-display text-emerald-400 mt-1 block">
            {telemetry.waterLeakageStatus}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono-tech">Hydrophones Active</span>
        </div>
      </div>

      {/* Graph 1: 24-Hour SCADA Reservoir Hydrograph & Demand Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                24-Hour SCADA Reservoir Inflow vs Outflow Hydrograph
              </span>
              <span className="text-[11px] text-slate-400">
                Pumping intake rate vs municipal residential and commercial water consumption (MLD)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono-tech">
              <span className="text-blue-400">■ Inflow Rate</span>
              <span className="text-cyan-300">■ Tank Level (%)</span>
              <span className="text-rose-400">■ Outflow Demand</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hydrographData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#38bdf8', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any, name: any) => [
                    name === 'tankLevel' ? `${val}%` : `${val} MLD`,
                    name === 'tankLevel' ? 'Reservoir Volume' : name === 'inflowRate' ? 'Inflow Rate' : 'Outflow Demand'
                  ]}
                />
                <Area type="monotone" dataKey="tankLevel" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#waterLevelGrad)" />
                <Line type="monotone" dataKey="inflowRate" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                <Line type="monotone" dataKey="outflowDemand" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pump Actuator Control */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-white block mb-1">
              Central Submersible Pump Controller
            </span>
            <span className="text-[11px] text-slate-400 block">
              High-pressure SCADA relay module at Station #01
            </span>
          </div>

          <div className="p-5 rounded-xl bg-[#070e22] border border-slate-800 text-center space-y-3">
            <div className="text-4xl font-display font-bold text-cyan-300">
              {telemetry.waterTankLevel}%
            </div>
            <span className="text-xs text-slate-400 block">Current Capacity: 81,600 / 120,000 Liters</span>

            <button
              onClick={() => toggleActuator('waterPumpOn')}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                actuators.waterPumpOn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              {actuators.waterPumpOn ? '● Main Pump Active (Running)' : '○ Main Pump Disabled'}
            </button>
          </div>

          <div className="space-y-2 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Automatic Shutoff:</span>
              <span className="text-emerald-400 font-mono-tech">Armed (≥ 95%)</span>
            </div>
            <div className="flex justify-between">
              <span>Low Level Trigger:</span>
              <span className="text-amber-400 font-mono-tech">Armed (≤ 25%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph 2 & 3: Pressure Gradient & Acoustic Leak Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pressure Gradient across Distribution PRVs */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" />
                Hydraulic Pressure Across Pressure Reducing Valves (PRVs)
              </span>
              <span className="text-[11px] text-slate-400">
                Safe operating target range: 2.0 to 4.0 bar
              </span>
            </div>
            <span className="text-[10px] font-mono-tech text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Optimal 2.0-4.0 Bar Band
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prvPressureData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="node" stroke="#64748b" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 5]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#3b82f6', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any) => [`${val} bar`, 'Line Pressure']}
                />
                <ReferenceLine y={4.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Max (4.0 bar)', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={2.0} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Min (2.0 bar)', fill: '#06b6d4', fontSize: 10 }} />
                <Bar dataKey="pressure" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {prvPressureData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pressure > 4.0 ? '#f59e0b' : entry.pressure < 2.0 ? '#f43f5e' : '#38bdf8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acoustic Hydrophone Spectrum */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Acoustic Hydrophone Leak Detection Spectrum
              </span>
              <span className="text-[11px] text-slate-400">
                Pipe vibration amplitude (dB) vs acoustic frequency (Hz)
              </span>
            </div>
            <span className="text-[10px] font-mono-tech text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Below 35 dB Threshold (No Leak)
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={acousticSpectrumData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="freq" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 45]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1630', borderColor: '#10b981', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any, name: any) => [`${val} dB`, name === 'amp' ? 'Vibration Amplitude' : 'Leak Alarm Limit']}
                />
                <ReferenceLine y={35} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Alarm Limit (35 dB)', fill: '#f43f5e', fontSize: 10 }} />
                <Line type="monotone" dataKey="amp" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= POLLUTION VIEW ================= */
export const PollutionView: React.FC = () => {
  const { telemetry, updateTelemetry, showToast } = useSmartCity();

  const handleMistDrone = () => {
    updateTelemetry({ aqi: Math.max(35, telemetry.aqi - 20), pm25: Math.max(12, telemetry.pm25 - 15) });
    showToast('Smog mist cannons deployed in Sector 4. Ambient PM2.5 reduced by 15 µg/m³.', 'success');
  };

  const handleCalibrateSensors = () => {
    showToast('Multi-spectral laser sensors calibrated against standard gas references.', 'info');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-400" />
            Atmospheric Quality & Pollution Monitoring
          </h1>
          <p className="text-xs text-slate-400">
            Multi-spectral air sensors, particulate matter tracking, and autonomous mist canon scrubbers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMistDrone}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-95"
          >
            Deploy Mist Cannons
          </button>
          <button
            type="button"
            onClick={handleCalibrateSensors}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            Calibrate Laser Sensors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Air Quality Index (AQI)</span>
          <span className="text-3xl font-bold font-display text-amber-300 mt-1 block">
            {telemetry.aqi}
          </span>
          <span className="text-amber-400 text-[11px]">{telemetry.aqiStatus} Category</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[11px]">PM2.5 Concentration</span>
          <span className="text-3xl font-bold font-display text-white mt-1 block">
            {telemetry.pm25} µg/m³
          </span>
          <span className="text-slate-400 text-[11px]">Fine particulate</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Carbon Dioxide (CO₂)</span>
          <span className="text-3xl font-bold font-display text-white mt-1 block">
            {telemetry.co2} ppm
          </span>
          <span className="text-emerald-400 text-[11px]">Normal outdoor level</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Ambient Climate</span>
          <span className="text-3xl font-bold font-display text-cyan-300 mt-1 block">
            {telemetry.temperature}°C
          </span>
          <span className="text-cyan-400 text-[11px]">{telemetry.humidity}% Humidity</span>
        </div>
      </div>
    </div>
  );
};

/* ================= EMERGENCY VIEW ================= */
export const EmergencyView: React.FC = () => {
  const { triggerEmergencyAlert, showToast } = useSmartCity();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sentBroadcast, setSentBroadcast] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const saved = await triggerEmergencyAlert(
      'Municipal Emergency Broadcast',
      broadcastMessage.trim(),
      'emergency'
    );
    if (!saved) return;
    setBroadcastMessage('');
    setSentBroadcast(true);
    setTimeout(() => setSentBroadcast(false), 3000);
  };

  const handleTestSiren = () => {
    showToast('Acoustic Siren Test: Sector 1 audio towers pulsed for 5 seconds. All units operational.', 'warning');
  };

  const handlePresetBroadcast = async (msg: string) => {
    const saved = await triggerEmergencyAlert('Official City Advisory', msg, 'emergency');
    if (saved) showToast(`Emergency alert broadcast: "${msg.slice(0, 45)}..."`, 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Emergency Operations & Disaster Warning Dispatch
          </h1>
          <p className="text-xs text-slate-400">
            Multi-agency integration linking Fire, Police, Ambulance, and Citizen Emergency Broadcast Channels
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestSiren}
          className="px-3.5 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all active:scale-95"
        >
          <Volume2 className="w-4 h-4" /> Sound Test Siren
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Broadcast Form */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-4">
          <span className="text-xs font-bold text-white block">
            Publish Emergency Alert to Citizen Phones & Billboards
          </span>

          <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
            <textarea
              placeholder="E.g., High smog warning in Sector 9. Vulnerable citizens advised to remain indoors."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-[#070e22] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
              required
            />

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 self-center">Presets:</span>
              <button
                type="button"
                onClick={() => handlePresetBroadcast('High Smog Advisory in Sector 9. Use N95 masks.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
              >
                🌫 Smog Advisory
              </button>
              <button
                type="button"
                onClick={() => handlePresetBroadcast('Flash Flood Notice: Underpass at Cyber Hub closed.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
              >
                🌊 Flood Notice
              </button>
              <button
                type="button"
                onClick={() => handlePresetBroadcast('Grid Maintenance in Ward 4. Power will resume at 16:00.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
              >
                ⚡ Power Advisory
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer transition-all active:scale-95"
            >
              Broadcast SOS Alert →
            </button>
            {sentBroadcast && (
              <span className="text-emerald-400 text-xs block text-center">
                ✓ Broadcast dispatched to all citizen dashboards & SMS nodes!
              </span>
            )}
          </form>
        </div>

        {/* Agency Readiness */}
        <div className="p-5 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-4">
          <span className="text-xs font-bold text-white block">
            Emergency Agency Readiness Status
          </span>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#070e22] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Flame className="w-4 h-4" /> Fire Department (Station 1-4)
              </div>
              <button
                type="button"
                onClick={() => showToast('Fire command unit: Engines 1-4 staged and ready.', 'success')}
                className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold cursor-pointer"
              >
                Ready (4 Units)
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#070e22] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Ambulance className="w-4 h-4" /> Trauma Ambulances
              </div>
              <button
                type="button"
                onClick={() => showToast('EMS dispatch: 6 paramedic rigs standing by at city hospital.', 'success')}
                className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold cursor-pointer"
              >
                Ready (6 Units)
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#070e22] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Car className="w-4 h-4" /> Traffic Highway Patrol
              </div>
              <button
                type="button"
                onClick={() => showToast('Highway Patrol: 8 interceptor cruisers maintaining 45 km/h patrol grid.', 'info')}
                className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold cursor-pointer"
              >
                Active Patrol
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SETTINGS VIEW ================= */
export const SettingsView: React.FC = () => {
  const { currentUser, resetAllTelemetry, setIsAuthModalOpen, problems, telemetry, actuators, showToast } = useSmartCity();

  const handleExportAudit = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      user: currentUser,
      telemetry,
      actuators,
      problemsCount: problems.length,
      problems,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartcity-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Municipal Audit Report exported as JSON file.', 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl mx-auto">
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-lg font-bold font-display text-white">
          System & Account Settings
        </h1>
        <p className="text-xs text-slate-400">
          Manage your portal role, device connection keys, and municipal telemetry export
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#0b142c] border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">Current User Profile</span>
            <span className="text-slate-400">{currentUser.name} ({currentUser.email})</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer transition-all active:scale-95"
          >
            Switch Profile
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">Export Municipal Audit Data</span>
            <span className="text-slate-400">Download telemetry, incident records, and actuator states in JSON</span>
          </div>
          <button
            type="button"
            onClick={handleExportAudit}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-white block">Reset System Telemetry</span>
            <span className="text-slate-400">Restore all sensor readings and fault simulations to default values</span>
          </div>
          <button
            type="button"
            onClick={() => {
              resetAllTelemetry();
              showToast('System telemetry and actuator states restored to baseline defaults.', 'info');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer transition-all active:scale-95"
          >
            Reset Baseline
          </button>
        </div>
      </div>
    </div>
  );
};
