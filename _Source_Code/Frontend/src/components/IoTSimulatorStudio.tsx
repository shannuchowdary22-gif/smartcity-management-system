import React, { useState } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Save,
  Plus,
  Sliders,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Wind,
  Droplets,
  Car,
  Trash2,
  Sparkles,
  Layers,
  Power,
  Tv,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';

export const IoTSimulatorStudio: React.FC = () => {
  const {
    telemetry,
    registerSensor,
    isSimulationRunning,
    toggleSimulation,
    resetAllTelemetry,
    actuators,
    toggleActuator,
    setLcdMessage,
    setTrafficOverride,
    rules,
    toggleRule,
    addRule,
    faults,
    toggleFault,
  } = useSmartCity();

  const [selectedNode, setSelectedNode] = useState<string>('temp_sensor');
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('IF AQI > 120');
  const [newRuleAction, setNewRuleAction] = useState('THEN Activate Air Scrubber Drone');

  const handleRegisterSensor = async () => {
    const type = selectedNode === 'temp_sensor'
      ? 'temperature'
      : selectedNode === 'humidity_sensor' ? 'humidity' : 'traffic';
    const value = type === 'temperature'
      ? telemetry.temperature
      : type === 'humidity' ? telemetry.humidity : telemetry.vehicleCount;
    const unit = type === 'temperature' ? '°C' : type === 'humidity' ? '%' : 'vehicles/hour';
    await registerSensor({
      sensorCode: selectedNode,
      name: selectedNode.replace(/_/g, ' '),
      type,
      value,
      unit,
      status: 'online',
    });
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName) return;
    addRule({
      name: newRuleName,
      condition: newRuleCondition,
      action: newRuleAction,
      enabled: true,
      type: 'aqi',
    });
    setNewRuleName('');
    setIsAddRuleModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Top Header matching reference image: "IoT Design Studio - Design • Connect • Simulate • Build" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display text-white">
                IoT Design Studio
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono-tech">
                Live Breadboard
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Design • Connect • Simulate • Build Smart City Node Architecture
            </p>
          </div>
        </div>

        {/* Toolbar buttons matching image: Smart City Project, Save, Run, Pause, Reset */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#0e172f] border border-slate-700 text-xs font-semibold text-slate-300 font-mono-tech">
            Smart City Project (Rev 4)
          </div>

          <button
            onClick={() => void handleRegisterSensor()}
            className="px-3 py-1.5 rounded-lg bg-[#0e172f] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" /> Register Sensor
          </button>

          <button
            onClick={toggleSimulation}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulationRunning
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Run Sim
              </>
            )}
          </button>

          <button
            onClick={resetAllTelemetry}
            className="px-3 py-1.5 rounded-lg bg-[#0e172f] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Layout: Component Library | Canvas | Properties & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 2 Cols: Component Library matching image */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-3 rounded-xl bg-[#0a1226] border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-1.5">
              Component Library
            </span>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-800/60 text-slate-300 cursor-pointer">
                <span>Controllers</span>
                <span className="text-[10px] font-mono-tech text-cyan-400">3</span>
              </div>
              <div className="pl-4 space-y-1 text-[11px] text-slate-400">
                <div className="p-1.5 rounded bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" /> ESP32 (Active)
                </div>
                <div className="p-1 text-slate-500">Arduino Uno</div>
                <div className="p-1 text-slate-500">Raspberry Pi 4</div>
              </div>

              <div className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-800/60 text-slate-300 cursor-pointer pt-2">
                <span>Sensors</span>
                <span className="text-[10px] font-mono-tech text-cyan-400">14</span>
              </div>
              <div className="pl-4 space-y-1 text-[11px] text-slate-400">
                <div className="p-1 text-slate-300 hover:text-white">Temperature (DS18B20)</div>
                <div className="p-1 text-slate-300 hover:text-white">Humidity (DHT22)</div>
                <div className="p-1 text-slate-300 hover:text-white">Traffic Radar Camera</div>
                <div className="p-1 text-slate-300 hover:text-white">Ultrasonic Waste Bin</div>
                <div className="p-1 text-slate-300 hover:text-white">Water Level Hydrostatic</div>
              </div>

              <div className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-800/60 text-slate-300 cursor-pointer pt-2">
                <span>Actuators</span>
                <span className="text-[10px] font-mono-tech text-cyan-400">7</span>
              </div>
              <div className="pl-4 space-y-1 text-[11px] text-slate-400">
                <div className="p-1 text-slate-300">Brushless Fan</div>
                <div className="p-1 text-slate-300">Status Alert LED</div>
                <div className="p-1 text-slate-300">Traffic Signal Relay</div>
                <div className="p-1 text-slate-300">I2C LCD Display</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle 7 Cols: Interactive Circuit Node Canvas matching image */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-2xl bg-[#070e22] border-2 border-slate-800/90 relative min-h-[420px] flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Grid blueprint background */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Circuit Nodes Layout matching screenshot */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center my-auto">
              {/* Left Column: SENSORS */}
              <div className="space-y-4">
                {/* 1. Temp Sensor */}
                <div
                  onClick={() => setSelectedNode('temp_sensor')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'temp_sensor'
                      ? 'bg-blue-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0d1733] border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Temperature Sensor</span>
                    <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-blue-900 text-blue-300">
                      OUT
                    </span>
                  </div>
                  <div className="text-sm font-display font-bold text-cyan-300 mt-1">
                    Temp: {telemetry.temperature}°C
                  </div>
                </div>

                {/* 2. Humidity Sensor */}
                <div
                  onClick={() => setSelectedNode('humidity_sensor')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'humidity_sensor'
                      ? 'bg-blue-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0d1733] border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Humidity Sensor</span>
                    <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-blue-900 text-blue-300">
                      OUT
                    </span>
                  </div>
                  <div className="text-sm font-display font-bold text-cyan-300 mt-1">
                    Humidity: {telemetry.humidity}%
                  </div>
                </div>

                {/* 3. Traffic Sensor */}
                <div
                  onClick={() => setSelectedNode('traffic_sensor')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedNode === 'traffic_sensor'
                      ? 'bg-blue-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0d1733] border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Traffic Sensor</span>
                    <span className="text-[9px] font-mono-tech px-1.5 py-0.5 rounded bg-blue-900 text-blue-300">
                      OUT
                    </span>
                  </div>
                  <div className="text-sm font-display font-bold text-cyan-300 mt-1">
                    Vehicles: {telemetry.vehicleCount}
                  </div>
                </div>
              </div>

              {/* Middle Column: ESP32 CONTROLLER HUB */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 p-4 rounded-2xl bg-gradient-to-b from-[#132047] to-[#0a122c] border-2 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)] text-center relative">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 mx-auto mb-2 animate-ping" />
                  <span className="font-display font-bold text-sm text-white tracking-wide block">
                    ESP32 Hub
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono-tech block">
                    Dual-Core 240MHz
                  </span>

                  <div className="mt-3 pt-2 border-t border-slate-700/80 space-y-1 text-[10px] font-mono-tech text-slate-300 text-left">
                    <div className="flex justify-between">
                      <span className="text-cyan-400">GPIO 4</span>
                      <span className="text-emerald-400">● Temp IN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400">GPIO 2</span>
                      <span className="text-amber-400">● LED OUT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400">GPIO 5</span>
                      <span className="text-cyan-300">● Fan PWM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: ACTUATORS */}
              <div className="space-y-4">
                {/* 1. Fan Actuator */}
                <div
                  onClick={() => toggleActuator('fanOn')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    actuators.fanOn
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-[#0d1733] border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Wind
                        className={`w-3.5 h-3.5 text-cyan-400 ${
                          actuators.fanOn ? 'animate-spin' : ''
                        }`}
                      />
                      Cooling Fan
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono-tech ${
                        actuators.fanOn
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {actuators.fanOn ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* 2. LED Actuator */}
                <div
                  onClick={() => toggleActuator('ledOn')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    actuators.ledOn
                      ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-[#0d1733] border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Zap
                        className={`w-3.5 h-3.5 ${
                          actuators.ledOn
                            ? 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b]'
                            : 'text-slate-500'
                        }`}
                      />
                      Alert LED
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono-tech ${
                        actuators.ledOn
                          ? 'bg-amber-900 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {actuators.ledOn ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* 3. LCD Display */}
                <div className="p-3 rounded-xl bg-[#04100c] border-2 border-emerald-500/50 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono-tech mb-1">
                    <span>I2C LCD 16x2</span>
                    <span>ONLINE</span>
                  </div>
                  <div className="font-mono-tech text-xs text-emerald-300 tracking-wider">
                    {telemetry.temperature > 30 ? 'ALERT: HIGH TEMP!' : `CITY TEMP: ${telemetry.temperature}°C`}
                  </div>
                </div>

                {/* 4. Traffic Light Node */}
                <div className="p-2.5 rounded-xl bg-[#080e22] border border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Traffic Signal</span>
                  <div className="flex gap-1.5 bg-black/60 px-2 py-1 rounded-full border border-slate-800">
                    <span
                      onClick={() => setTrafficOverride('red')}
                      className={`w-3 h-3 rounded-full cursor-pointer ${
                        telemetry.trafficSignalState === 'red'
                          ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          : 'bg-rose-950 opacity-30'
                      }`}
                    />
                    <span
                      onClick={() => setTrafficOverride('yellow')}
                      className={`w-3 h-3 rounded-full cursor-pointer ${
                        telemetry.trafficSignalState === 'yellow'
                          ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                          : 'bg-amber-950 opacity-30'
                      }`}
                    />
                    <span
                      onClick={() => setTrafficOverride('green')}
                      className={`w-3 h-3 rounded-full cursor-pointer ${
                        telemetry.trafficSignalState === 'green'
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-emerald-950 opacity-30'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Live Monitor Bar matching screenshot */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tech">
              <span className="text-slate-400 font-bold">Live Monitor:</span>
              <span className="text-cyan-300">Temp: {telemetry.temperature}°C</span>
              <span className="text-cyan-300">Humidity: {telemetry.humidity}%</span>
              <span className="text-amber-300">AQI: {telemetry.aqi}</span>
              <span className="text-emerald-300">Traffic: {telemetry.vehicleCount}</span>
              <span className="text-blue-300">Water: {telemetry.waterTankLevel}%</span>
              <span className="text-purple-300">Waste: {telemetry.wasteBinFillLevel}%</span>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Properties, Rules & Faults matching image */}
        <div className="lg:col-span-3 space-y-3">
          {/* Component Properties */}
          <div className="p-3.5 rounded-xl bg-[#0a1226] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Component Properties</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono-tech">
                ● Online
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Node:</span>
                <span className="font-semibold text-white capitalize">
                  {selectedNode.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Value:</span>
                <span className="font-mono-tech text-cyan-300 font-bold">
                  {telemetry.temperature}°C
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Min / Max Range:</span>
                <span className="font-mono-tech text-slate-300">-10 to 50°C</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Voltage / Current:</span>
                <span className="font-mono-tech text-slate-300">5.0V / 0.02A</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Failure Probability:</span>
                <span className="font-mono-tech text-emerald-400">1.0%</span>
              </div>
            </div>
          </div>

          {/* Automation Rules matching image */}
          <div className="p-3.5 rounded-xl bg-[#0a1226] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Automation Rules</span>
              <button
                onClick={() => setIsAddRuleModalOpen(true)}
                className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 hover:bg-indigo-900 cursor-pointer flex items-center gap-1 font-bold"
              >
                <Plus className="w-3 h-3" /> Add Rule
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => toggleRule(rule.id)}
                  className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                    rule.enabled
                      ? 'bg-[#0f1933] border-cyan-900/60 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300">{rule.condition}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono-tech ${
                        rule.enabled
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rule.enabled ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rule.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fault Simulation matching image */}
          <div className="p-3.5 rounded-xl bg-[#0a1226] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Fault Simulation
              </span>
              <span className="text-[10px] text-slate-500 font-mono-tech">Stress Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'overheating', label: 'Overheating' },
                { key: 'sensorFailure', label: 'Sensor Failure' },
                { key: 'overvoltage', label: 'Overvoltage' },
                { key: 'undervoltage', label: 'Undervoltage' },
                { key: 'overcurrent', label: 'Overcurrent' },
                { key: 'communicationFailure', label: 'Comm Failure' },
              ].map((fault) => {
                const isActive = faults[fault.key as keyof typeof faults];
                return (
                  <button
                    key={fault.key}
                    onClick={() => toggleFault(fault.key as keyof typeof faults)}
                    className={`p-1.5 rounded-lg border text-left text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        : 'bg-[#0e172f] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-rose-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span className="truncate">{fault.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Automation Rule Modal */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1733] border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Create IoT Automation Trigger</h3>
            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Rule Name:</label>
                <input
                  type="text"
                  placeholder="E.g. Flood Gate Auto-Lift"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080f24] border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Trigger Condition (IF):</label>
                <input
                  type="text"
                  value={newRuleCondition}
                  onChange={(e) => setNewRuleCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080f24] border border-slate-700 text-white font-mono-tech"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Automated Action (THEN):</label>
                <input
                  type="text"
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080f24] border border-slate-700 text-white font-mono-tech"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  Deploy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
