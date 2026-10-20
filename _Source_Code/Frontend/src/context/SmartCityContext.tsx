import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  ProblemItem,
  ProblemStatus,
  SmartCityTelemetry,
  CityAlert,
  AutomationRule,
  ProblemCategory,
  ProblemPriority,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_TELEMETRY,
  INITIAL_ALERTS,
  INITIAL_PROBLEMS,
  INITIAL_RULES,
} from '../data/initialData';
import { api, ApiError, type ApiResource, type AuthAccount } from '../services/api';
import { getEvidenceSource, isDemoEvidenceUrl } from '../utils/problemEvidence';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const profileFromAccount = (account: AuthAccount): UserProfile => {
  const role = account.role === 'ADMIN' ? 'admin' : 'citizen';
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role,
    avatar: role === 'admin'
      ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    badge: role === 'admin' ? 'Municipal Authority' : 'Registered Citizen',
    department: account.department || undefined,
    ward: account.ward || undefined,
    phone: account.phone || undefined,
  };
};

interface SmartCityContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  switchUserRole: (role: 'citizen' | 'admin') => void;
  registerCitizen: (data: {
    name: string;
    email: string;
    password: string;
    ward: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  registerAdmin: (data: {
    name: string;
    email: string;
    password: string;
    clearanceCode: string;
    department: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (
    email: string,
    password: string,
    portal?: 'citizen' | 'admin'
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  
  telemetry: SmartCityTelemetry;
  updateTelemetry: (updates: Partial<SmartCityTelemetry>) => void;
  sensors: ApiResource[];
  buildings: ApiResource[];
  registerSensor: (data: Record<string, unknown>) => Promise<boolean>;
  
  isSimulationRunning: boolean;
  toggleSimulation: () => void;
  resetAllTelemetry: () => void;
  
  problems: ProblemItem[];
  refreshProblems: () => Promise<void>;
  createProblem: (problem: Omit<ProblemItem, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedBy' | 'comments' | 'reporter'>) => Promise<ProblemItem>;
  upvoteProblem: (problemId: string) => Promise<void>;
  addComment: (problemId: string, text: string) => Promise<void>;
  adminResolveProblem: (
    problemId: string,
    status: ProblemStatus,
    notes?: string,
    photoUrl?: string,
    officerName?: string,
    department?: string,
    verificationStatus?: 'approved' | 'rejected' | 'needs_review',
    reviewNotes?: string,
    beforePhotoUrl?: string,
    priority?: ProblemPriority,
  ) => Promise<boolean>;
  
  alerts: CityAlert[];
  dismissAlert: (id: string) => void;
  triggerEmergencyAlert: (title: string, desc: string, category: ProblemCategory) => Promise<boolean>;
  
  rules: AutomationRule[];
  toggleRule: (id: string) => void;
  addRule: (rule: Omit<AutomationRule, 'id'>) => void;
  
  actuators: {
    fanOn: boolean;
    ledOn: boolean;
    waterPumpOn: boolean;
    lcdMessage: string;
    trafficOverride: 'auto' | 'green' | 'yellow' | 'red';
  };
  toggleActuator: (actuator: 'fanOn' | 'ledOn' | 'waterPumpOn') => void;
  setLcdMessage: (msg: string) => void;
  setTrafficOverride: (state: 'auto' | 'green' | 'yellow' | 'red') => void;
  
  faults: {
    overheating: boolean;
    sensorFailure: boolean;
    communicationFailure: boolean;
    overvoltage: boolean;
    undervoltage: boolean;
    overcurrent: boolean;
    lowBattery: boolean;
  };
  toggleFault: (faultName: keyof SmartCityContextType['faults']) => void;
  
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // UI state for modals
  isCreateProblemOpen: boolean;
  setIsCreateProblemOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  selectedProblemId: string | null;
  setSelectedProblemId: (id: string | null) => void;
}

const SmartCityContext = createContext<SmartCityContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PROBLEMS = 'smartcity_problems_v1';
const DEMO_COMPLAINT_IMAGE_OVERRIDES: Record<string, string> = {
  'PRB-1081': '/images/complaints/prb-1081-water-leak.jpg',
  'PRB-1075': '/images/complaints/streetlight-pole-42.jpg',
  'PRB-1083': '/images/complaints/traffic-signal-malfunction.jpg',
};

const applyDemoComplaintImageOverrides = (savedProblems: ProblemItem[]): ProblemItem[] =>
  savedProblems.map((problem) => {
    const imageUrl = DEMO_COMPLAINT_IMAGE_OVERRIDES[problem.id];
    if (!imageUrl) return problem;

    return {
      ...problem,
      imageUrl,
      beforePhotoUrl: imageUrl,
      proof: {
        ...problem.proof,
        beforePhotoUrl: imageUrl,
        beforeEvidenceSource: 'demo_illustration',
      },
    };
  });

export const SmartCityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[2]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateProblemOpen, setIsCreateProblemOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // Toast notifications system
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastNotification = { id, message, type };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Telemetry state
  const [telemetry, setTelemetry] = useState<SmartCityTelemetry>(INITIAL_TELEMETRY);
  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;
  const [sensors, setSensors] = useState<ApiResource[]>([]);
  const [buildings, setBuildings] = useState<ApiResource[]>([]);
  const persistenceErrorShown = useRef(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);

  // Actuators
  const [actuators, setActuators] = useState({
    fanOn: true,
    ledOn: true,
    waterPumpOn: true,
    lcdMessage: 'Show: 28.5°C',
    trafficOverride: 'auto' as 'auto' | 'green' | 'yellow' | 'red',
  });

  // Faults simulation
  const [faults, setFaults] = useState({
    overheating: true,
    sensorFailure: false,
    communicationFailure: false,
    overvoltage: false,
    undervoltage: false,
    overcurrent: false,
    lowBattery: false,
  });

  // Problems state
  const [problems, setProblems] = useState<ProblemItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROBLEMS);
      if (saved) return applyDemoComplaintImageOverrides(JSON.parse(saved) as ProblemItem[]);
    } catch {
      // fallback
    }
    return INITIAL_PROBLEMS;
  });

  // Alerts
  const [alerts, setAlerts] = useState<CityAlert[]>(INITIAL_ALERTS);

  // Automation rules
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);

  useEffect(() => {
    if (!isAuthenticated || currentUser.role !== 'admin') return;
    let active = true;
    const loadBackendData = async () => {
      const results = await Promise.allSettled([
        api.getDashboard(),
        api.getTraffic(),
        api.getWaste(),
        api.getWater(),
        api.getPollution(),
        api.getEmergencies(),
        api.getSensors(),
        api.getBuildings(),
        api.getIot(),
      ]);
      if (!active) return;

      const [dashboard, , , , , emergencyResult, sensorResult, buildingResult, iotResult] = results;
      if (dashboard.status === 'fulfilled') {
        setTelemetry((previous) => ({ ...previous, ...dashboard.value.latestTelemetry }));
      }
      if (emergencyResult.status === 'fulfilled' && emergencyResult.value.length > 0) {
        setAlerts(emergencyResult.value);
      }
      if (sensorResult.status === 'fulfilled') setSensors(sensorResult.value);
      if (buildingResult.status === 'fulfilled') setBuildings(buildingResult.value);
      if (iotResult.status === 'fulfilled' && iotResult.value.length > 0) {
        setTelemetry((previous) => ({ ...previous, ...iotResult.value[0].data }));
      }

      if (results.some((result) => result.status === 'rejected')) {
        showToast(
          'Some backend data could not be loaded. Local demo content remains available; check that Spring Boot and MySQL are running.',
          'warning',
        );
      }
    };

    void loadBackendData();
    return () => {
      active = false;
    };
  }, [isAuthenticated, currentUser.role]);

  useEffect(() => {
    if (api.hasSessionToken()) {
      let active = true;
      void api.getSession()
        .then((session) => {
          if (!active) return;
          const user = profileFromAccount(session.account);
          setCurrentUser(user);
          setIsAuthenticated(true);
          setActiveTab(user.role === 'admin' ? 'dashboard' : 'grievances');
        })
        .catch((error: unknown) => {
          if (!active) return;
          if (error instanceof ApiError && error.status === 401) {
            api.clearSessionToken();
            showToast('Your session has expired. Sign in again to continue.', 'warning');
          } else {
            showToast(
              error instanceof Error ? `Saved session could not be restored: ${error.message}` : 'Saved session could not be restored.',
              'warning',
            );
          }
        });
      return () => {
        active = false;
      };
    }
    return undefined;
  }, []);

  const refreshProblems = async () => {
    if (!isAuthenticated) return;
    if (currentUser.role === 'admin') {
      const serverProblems = await api.getAdminComplaints();
      setProblems((previous) => [
        ...serverProblems,
        ...previous.filter((problem) => problem.id.startsWith('PRB-')),
      ]);
      return;
    }

    const ownProblems = await api.getCitizenComplaints();
    setProblems((previous) => [
      ...ownProblems,
      ...previous.filter((problem) => problem.id.startsWith('PRB-')),
    ]);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const refresh = () => {
      void refreshProblems().catch((error: unknown) => {
        if (active) {
          if (error instanceof ApiError && error.status === 401) {
            api.clearSessionToken();
            setIsAuthenticated(false);
            setCurrentUser(DEMO_USERS[2]);
            showToast('Your session has expired. Sign in again to continue.', 'warning');
            return;
          }
          showToast(
            error instanceof Error ? `Complaint list could not be refreshed: ${error.message}` : 'Complaint list could not be refreshed.',
            'error',
          );
        }
      });
    };
    refresh();
    const interval = currentUser.role === 'admin'
      ? window.setInterval(refresh, 15000)
      : undefined;
    return () => {
      active = false;
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [isAuthenticated, currentUser.id, currentUser.role]);

  useEffect(() => {
    if (!isAuthenticated || !selectedProblemId) return;
    const problem = problems.find((item) => item.id === selectedProblemId);
    if (!problem?.id.startsWith('CMP-')) return;
    const fetchDetails = currentUser.role === 'admin'
      ? api.getAdminComplaint(problem.id)
      : api.getCitizenComplaintStatus(problem.id);
    void fetchDetails
      .then((freshProblem) => {
        setProblems((previous) => previous.map((item) =>
          item.id === freshProblem.id ? freshProblem : item
        ));
      })
      .catch((error: unknown) => {
        showToast(
          error instanceof Error ? `Grievance details could not be refreshed: ${error.message}` : 'Grievance details could not be refreshed.',
          'error',
        );
      });
  }, [selectedProblemId, currentUser.id, currentUser.role, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || currentUser.role !== 'admin' || !isSimulationRunning) return;

    const interval = window.setInterval(() => {
      void api.createIot(telemetryRef.current)
        .then(() => {
          persistenceErrorShown.current = false;
        })
        .catch((error: unknown) => {
          if (!persistenceErrorShown.current) {
            persistenceErrorShown.current = true;
            showToast(
              error instanceof Error ? `IoT snapshot was not saved: ${error.message}` : 'IoT snapshot was not saved.',
              'error',
            );
          }
        });
    }, 15000);

    return () => window.clearInterval(interval);
  }, [isAuthenticated, currentUser.role, isSimulationRunning]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROBLEMS, JSON.stringify(problems));
    } catch {
      // ignore
    }
  }, [problems]);


  // Live simulation tick engine (runs when isSimulationRunning is true)
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Subtle realistic telemetry fluctuations
        const vehicleDelta = Math.floor(Math.random() * 9) - 4;
        const newVehicleCount = Math.max(500, Math.min(1200, prev.vehicleCount + vehicleDelta));

        // Traffic signal countdown
        let newCountdown = prev.trafficSignalCountdown - 1;
        let newSignal = prev.trafficSignalState;
        if (actuators.trafficOverride !== 'auto') {
          newSignal = actuators.trafficOverride;
          newCountdown = 30;
        } else if (newCountdown <= 0) {
          if (prev.trafficSignalState === 'green') {
            newSignal = 'yellow';
            newCountdown = 5;
          } else if (prev.trafficSignalState === 'yellow') {
            newSignal = 'red';
            newCountdown = 25;
          } else {
            newSignal = 'green';
            newCountdown = 35;
          }
        }

        // AQI slight flutter
        const aqiFlutter = (Math.random() - 0.5) * 1.5;
        const newAqi = Math.round(Math.max(60, Math.min(180, prev.aqi + aqiFlutter)));

        // Water tank slow drain / refill based on pump
        const tankDelta = actuators.waterPumpOn ? 0.1 : -0.2;
        const newTankLevel = Math.max(20, Math.min(100, Math.round((prev.waterTankLevel + tankDelta) * 10) / 10));

        // Temperature
        const tempFlutter = (Math.random() - 0.5) * 0.2;
        const newTemp = Math.round((prev.temperature + tempFlutter) * 10) / 10;

        return {
          ...prev,
          vehicleCount: newVehicleCount,
          trafficSignalCountdown: newCountdown,
          trafficSignalState: newSignal,
          aqi: newAqi,
          waterTankLevel: newTankLevel,
          temperature: newTemp,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulationRunning, actuators.trafficOverride, actuators.waterPumpOn]);

  const switchUserRole = (role: 'citizen' | 'admin') => {
    if (role !== currentUser.role) {
      showToast('Account roles cannot be switched. Sign out and authenticate through the other portal.', 'warning');
    }
  };

  const login = async (
    email: string,
    password: string,
    portal: 'citizen' | 'admin' = 'citizen'
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return { success: false, error: 'Enter your email address and password.' };
    let account: AuthAccount;
    try {
      account = portal === 'admin'
        ? await api.loginAdmin(cleanEmail, password)
        : await api.loginCitizen(cleanEmail, password);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in could not be completed.',
      };
    }
    const user = profileFromAccount(account);
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (user.role === 'citizen') {
      setActiveTab('grievances');
      showToast(`Welcome back, ${user.name}! Citizen Portal unlocked.`, 'success');
    } else {
      setActiveTab('dashboard');
      showToast(`Officer ${user.name} authenticated.`, 'success');
    }
    return { success: true };
  };

  const registerCitizen = async (data: {
    name: string;
    email: string;
    password: string;
    ward: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName) {
      return Promise.resolve({ success: false, error: 'Full name is required.' });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return Promise.resolve({ success: false, error: 'A valid email address is required.' });
    }
    try {
      const account = await api.registerCitizen({
        ...data,
        name: cleanName,
        email: cleanEmail,
        phone: data.phone?.trim() || undefined,
      });
      const newCitizen = profileFromAccount(account);
      setCurrentUser(newCitizen);
      setIsAuthenticated(true);
      setActiveTab('grievances');
      showToast(`Welcome to SmartCity, ${newCitizen.name}! Your citizen profile is active.`, 'success');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Citizen registration could not be completed.',
      };
    }
  };

  const registerAdmin = async (data: {
    name: string;
    email: string;
    password: string;
    clearanceCode: string;
    department: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanName || !cleanEmail.includes('@') || !data.clearanceCode.trim()) {
      return { success: false, error: 'Officer name, valid municipal email, and clearance code are required.' };
    }
    try {
      const account = await api.registerOfficer({
        name: cleanName,
        email: cleanEmail,
        password: data.password,
        clearanceCode: data.clearanceCode,
        department: data.department,
      });
      const user = profileFromAccount(account);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      showToast(`Officer ${user.name} commissioned and authenticated. Municipal dashboard unlocked.`, 'success');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Officer commissioning could not be completed.',
      };
    }
  };

  const logout = () => {
    void api.clearSession().catch((error: unknown) => {
      if (!(error instanceof ApiError && error.status === 401)) {
        showToast(
          error instanceof Error ? `Session could not be revoked: ${error.message}` : 'Session could not be revoked.',
          'error',
        );
      }
    });
    api.clearSessionToken();
    setIsAuthenticated(false);
    setCurrentUser(DEMO_USERS[2]);
    setActiveTab('dashboard');
    showToast('You have been logged out from SmartCity Portal.', 'info');
  };

  const updateTelemetry = (updates: Partial<SmartCityTelemetry>) => {
    setTelemetry((prev) => ({ ...prev, ...updates }));
    const save = (writer: () => Promise<unknown>) => {
      void writer().catch((error: unknown) => {
        showToast(
          error instanceof Error ? `Telemetry was not saved: ${error.message}` : 'Telemetry was not saved.',
          'error',
        );
      });
    };

    if ('vehicleCount' in updates || 'trafficDensity' in updates || 'trafficCongestion' in updates) {
      save(() => api.createTraffic(updates));
    }
    if ('wasteBinFillLevel' in updates || 'fullBinsCount' in updates || 'wasteCollectionStatus' in updates) {
      save(() => api.createWaste(updates));
    }
    if ('waterTankLevel' in updates || 'waterFlowRate' in updates || 'waterPressure' in updates) {
      save(() => api.createWater(updates));
    }
    if ('aqi' in updates || 'pm25' in updates || 'pm10' in updates || 'co2' in updates) {
      save(() => api.createPollution(updates));
    }
  };

  const registerSensor = async (data: Record<string, unknown>) => {
    try {
      const sensor = await api.createSensor(data);
      setSensors((previous) => [sensor, ...previous]);
      showToast('Sensor registered in the city inventory.', 'success');
      return true;
    } catch (error) {
      showToast(
        error instanceof Error ? `Sensor was not registered: ${error.message}` : 'Sensor was not registered.',
        'error',
      );
      return false;
    }
  };

  const toggleSimulation = () => {
    setIsSimulationRunning((prev) => {
      const next = !prev;
      showToast(
        next ? '▶ Real-time IoT Telemetry Engine running' : '⏸ Simulation paused by operator',
        next ? 'success' : 'info'
      );
      return next;
    });
  };

  const resetAllTelemetry = () => {
    setTelemetry(INITIAL_TELEMETRY);
    setActuators({
      fanOn: true,
      ledOn: true,
      waterPumpOn: true,
      lcdMessage: 'Show: 28.5°C',
      trafficOverride: 'auto',
    });
    setFaults({
      overheating: false,
      sensorFailure: false,
      communicationFailure: false,
      overvoltage: false,
      undervoltage: false,
      overcurrent: false,
      lowBattery: false,
    });
    showToast('All municipal sensors and circuit states restored to baseline', 'success');
  };

  const createProblem = async (
    data: Omit<ProblemItem, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedBy' | 'comments' | 'reporter'>
  ): Promise<ProblemItem> => {
    const draftProblem: ProblemItem = {
      ...data,
      id: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 1,
      upvotedBy: [currentUser.id],
      aiAnalysis: data.aiAnalysis || {
        hazardType: data.category === 'road_pothole' ? 'Subsurface Bitumen Depression & Structural Fatigue' :
                    data.category === 'waste' ? 'Overflowing Organic Biomass & Public Health Risk' :
                    data.category === 'water' ? 'Hydraulic Pressure Fracture & Backflow Hazard' :
                    data.category === 'traffic' ? 'Arterial Corridor Bottleneck & Signal Phase Failure' :
                    data.category === 'electricity' ? 'Photocell Circuit Failure & Low-Lux Hazard' :
                    'Public Infrastructure Safety Risk',
        confidence: 95.4,
        severity: data.priority === 'critical' ? 'critical' : data.priority === 'high' ? 'high' : 'medium',
        riskScore: data.priority === 'critical' ? 92 : data.priority === 'high' ? 74 : 45,
        labels: [data.category, 'civic_defect', `${data.priority}_priority`, 'edge_vision_classified'],
        recommendedAction: `Dispatch municipal ${data.category === 'road_pothole' ? 'asphalt paving crew' : data.category === 'waste' ? 'sanitation compaction unit' : data.category === 'water' ? 'hydro-excavation & plumbing team' : 'urban maintenance unit'} to assess perimeter and perform immediate remediation.`,
        estimatedRepairHours: data.priority === 'critical' ? 4 : data.priority === 'high' ? 12 : 24,
        requiredEquipment: data.category === 'road_pothole' ? ['Asphalt Cold-Patch Mixer', 'Vibratory Roller', 'Safety Barricades'] :
                           data.category === 'waste' ? ['Hydraulic Compaction Truck', 'Biocide Sprayer'] :
                           data.category === 'water' ? ['Acoustic Leak Correlator', 'Trench Shoring Box', 'Drain Pump'] :
                           ['Municipal Maintenance Van', 'LED Hazard Flares'],
      },
      reporter: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      comments: [
        {
          id: `cmt-${Date.now()}`,
          authorName: 'SmartCity Civic Bot',
          authorRole: 'admin',
          authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          text: `Grievance registered in ${data.location.ward}. AI Triage assigned Priority: ${data.priority.toUpperCase()}. Municipal dispatch team notified.`,
          timestamp: 'Just now',
        },
      ],
    };

    let newProblem: ProblemItem;
    try {
      const saved = await api.createComplaint(draftProblem);
      newProblem = saved.complaint;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The grievance could not be saved.';
      showToast(message, 'error');
      throw error;
    }

    setProblems((prev) => [newProblem, ...prev]);

    // Add notification alert for admin
    const newAlert: CityAlert = {
      id: `alt-${Date.now()}`,
      title: `New Grievance: ${data.title}`,
      description: `Reported by ${currentUser.name} in ${data.location.ward}. Priority: ${data.priority}`,
      time: 'Just now',
      severity: data.priority === 'critical' ? 'critical' : 'warning',
      category: data.category,
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    // Give karma points to citizen
    if (currentUser.role === 'citizen') {
      setCurrentUser((prev) => ({
        ...prev,
        karmaPoints: (prev.karmaPoints || 0) + 25,
      }));
    }

    showToast(`Grievance #${newProblem.id} saved! +25 Civic Karma awarded to your profile.`, 'success');
    return newProblem;
  };

  const upvoteProblem = async (problemId: string) => {
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return;
    const alreadyUpvoted = problem.upvotedBy.includes(currentUser.id);
    const upvotedBy = alreadyUpvoted
      ? problem.upvotedBy.filter((id) => id !== currentUser.id)
      : [...problem.upvotedBy, currentUser.id];
    if (!await saveProblemUpdate({
      ...problem,
      upvotes: upvotedBy.length,
      upvotedBy,
    })) return;
    showToast(
      alreadyUpvoted
        ? `Upvote removed for "${problem.title}"`
        : `Upvoted! "${problem.title}" priority increased for city council review.`,
      'info',
    );
  };

  const addComment = async (problemId: string, text: string) => {
    if (!text.trim()) return;
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return;
    const newComment = {
      id: `cmt-${Date.now()}`,
      authorName: currentUser.name + (currentUser.role === 'admin' ? ' (Admin)' : ''),
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: 'Just now',
    };

    if (!await saveProblemUpdate({
      ...problem,
      comments: [...problem.comments, newComment],
      updatedAt: new Date().toISOString(),
    })) return;
    showToast('Official note added to incident log.', 'info');
  };

  const adminResolveProblem = async (
    problemId: string,
    status: ProblemStatus,
    notes?: string,
    photoUrl?: string,
    officerName?: string,
    department?: string,
    verificationStatus?: 'approved' | 'rejected' | 'needs_review',
    reviewNotes?: string,
    beforePhotoUrl?: string,
    priority?: ProblemPriority,
  ) => {
    if (currentUser.role !== 'admin') {
      showToast('Only authorized municipal administrators can update resolution evidence.', 'error');
      return false;
    }
    const problem = problems.find((item) => item.id === problemId);
    if (!problem) return false;
    const isNowResolved = status === 'resolved';
    const finalVerificationStatus = verificationStatus || problem.verificationStatus || problem.proof?.verificationStatus || 'needs_review';
    const finalPhotoUrl = photoUrl || problem.resolutionPhotoUrl || problem.verifiedPhotoUrl;
    const finalBeforePhotoUrl = beforePhotoUrl || problem.beforePhotoUrl || problem.imageUrl;
    if (isNowResolved && !finalPhotoUrl) {
      showToast('A resolution evidence URL is required before closing this grievance.', 'error');
      return false;
    }
    if (isNowResolved && finalVerificationStatus === 'approved' && isDemoEvidenceUrl(finalPhotoUrl)) {
      showToast('A demo illustration cannot be approved as verified repair evidence.', 'error');
      return false;
    }
    if (problemId.startsWith('CMP-')) {
      try {
        await api.assignResolver(
          problemId,
          officerName?.trim() || currentUser.name,
          department?.trim() || 'Municipal Operations',
        );
        const workOrder = await api.createWorkOrder(problemId);
        await api.updateAdminComplaint(problemId, {
          ...(priority && priority !== problem.priority ? { priority } : {}),
          verificationStatus: finalVerificationStatus,
          reviewNotes: reviewNotes || '',
          reviewedBy: currentUser.name,
        });
        await api.updateWorkOrder(workOrder.id, {
          status,
          officerName,
          resolutionNotes: notes,
          resolutionProofDataUrl: photoUrl,
        });
        const savedProblem = await api.getAdminComplaint(problemId);
        setProblems((previous) => previous.map((item) =>
          item.id === problemId ? savedProblem : item
        ));
        showToast(`Complaint ${problemId} and its work order were updated.`, 'success');
        return true;
      } catch (error) {
        showToast(
          error instanceof Error ? `Complaint update failed: ${error.message}` : 'Complaint update failed.',
          'error',
        );
        return false;
      }
    }
    const reviewedAt = new Date().toISOString();
    const beforeEvidenceSource = getEvidenceSource(
      problem.proof?.beforeEvidenceSource,
      finalBeforePhotoUrl,
      'citizen_submitted',
    );
    const afterEvidenceSource = photoUrl
      ? isDemoEvidenceUrl(photoUrl)
        ? 'demo_illustration'
        : 'municipal_submitted'
      : getEvidenceSource(
        problem.proof?.afterEvidenceSource,
        finalPhotoUrl,
        'municipal_submitted',
      );
    const auditEntry = {
      actor: currentUser.name,
      action: `Evidence review set to ${finalVerificationStatus}; status updated to ${status}`,
      role: 'admin' as const,
      timestamp: reviewedAt,
    };

    const updatedProblem: ProblemItem = {
      ...problem,
      status,
      priority: priority || problem.priority,
      resolutionNotes: notes || problem.resolutionNotes,
      resolutionPhotoUrl: finalPhotoUrl,
      verifiedPhotoUrl: finalPhotoUrl,
      beforePhotoUrl: finalBeforePhotoUrl,
      imageUrl: finalBeforePhotoUrl || problem.imageUrl,
      verifiedAt: finalVerificationStatus === 'approved' && Boolean(finalPhotoUrl) &&
        afterEvidenceSource !== 'demo_illustration'
        ? reviewedAt
        : undefined,
      verificationStatus: finalVerificationStatus,
      reviewedBy: currentUser.name,
      reviewedAt,
      reviewNotes: reviewNotes || notes || problem.reviewNotes,
      resolvedAt: isNowResolved ? new Date().toISOString() : problem.resolvedAt,
      auditTrail: [...(problem.auditTrail || []), auditEntry],
      proof: {
        ...problem.proof,
        beforePhotoUrl: finalBeforePhotoUrl || problem.proof?.beforePhotoUrl || problem.imageUrl,
        afterPhotoUrl: finalPhotoUrl,
        beforeEvidenceSource,
        afterEvidenceSource,
        verificationStatus: finalVerificationStatus,
        proofVerified: finalVerificationStatus === 'approved' && Boolean(finalPhotoUrl) &&
          afterEvidenceSource !== 'demo_illustration',
        reviewedBy: currentUser.name,
        reviewedAt,
        reviewNotes: reviewNotes || notes || problem.reviewNotes,
        auditTrail: [...(problem.proof?.auditTrail || problem.auditTrail || []), auditEntry],
      },
      assignedTo: officerName
        ? {
            officerName,
            department: department || 'Urban Response Team',
            assignedAt: new Date().toISOString(),
          }
        : problem.assignedTo,
      updatedAt: new Date().toISOString(),
      comments: [
        ...problem.comments,
        {
          id: `cmt-${Date.now()}`,
          authorName: `${currentUser.name} (City Ops)`,
          authorRole: 'admin',
          authorAvatar: currentUser.avatar,
          text: `Status updated to [${status.toUpperCase().replace('_', ' ')}]. ${
            notes ? `Action report: "${notes}"` : ''
          }${reviewNotes ? ` Verification: ${reviewNotes}` : ''}`,
          timestamp: 'Just now',
        },
      ],
    };
    if (!await saveProblemUpdate(updatedProblem)) return false;
    showToast(
      `Incident #${problemId} updated to [${status.toUpperCase().replace('_', ' ')}] with ${finalVerificationStatus} proof verification!`,
      'success'
    );
    return true;
  };

  const saveProblemUpdate = async (problem: ProblemItem): Promise<boolean> => {
    if (!problem.backendId) {
      setProblems((previous) => previous.map((item) =>
        item.id === problem.id ? problem : item
      ));
      showToast('This is a local demo grievance. Its changes are saved in this browser only.', 'warning');
      return true;
    }
    try {
      const savedProblem = await api.updateGrievance(problem);
      setProblems((previous) => previous.map((item) =>
        item.id === problem.id ? savedProblem : item
      ));
      return true;
    } catch (error) {
      showToast(
        error instanceof Error ? `Grievance update failed: ${error.message}` : 'Grievance update failed.',
        'error',
      );
      return false;
    }
  };

  const dismissAlert = async (id: string) => {
    const alert = alerts.find((item) => item.id === id);
    const backendId = Number(id);
    if (!alert || !Number.isInteger(backendId) || backendId < 1) {
      showToast('This alert is local demo data and cannot be dismissed on the server.', 'warning');
      return;
    }
    try {
      await api.updateEmergency(backendId, { ...alert, read: true });
    } catch (error) {
      showToast(
        error instanceof Error ? `Alert could not be updated: ${error.message}` : 'Alert could not be updated.',
        'error',
      );
      return;
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('Alert dismissed from active feed', 'info');
  };

  const triggerEmergencyAlert = async (title: string, desc: string, category: ProblemCategory) => {
    const draftAlert: Omit<CityAlert, 'id' | 'time'> = {
      title,
      description: desc,
      severity: 'critical',
      category,
      read: false,
    };
    let alert: CityAlert;
    try {
      alert = await api.createEmergency(draftAlert);
    } catch (error) {
      showToast(
        error instanceof Error ? `Emergency alert was not saved: ${error.message}` : 'Emergency alert was not saved.',
        'error',
      );
      return false;
    }
    setAlerts((prev) => [alert, ...prev]);
    setTelemetry((prev) => ({
      ...prev,
      emergencyStatus: 'Critical',
      activeAlertsCount: prev.activeAlertsCount + 1,
    }));
    showToast(`🚨 SOS Broadcast sent to citizens & emergency departments!`, 'error');
    return true;
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.enabled;
          showToast(`Rule "${r.name}" ${next ? 'activated' : 'deactivated'}`, 'info');
          return { ...r, enabled: next };
        }
        return r;
      })
    );
  };

  const addRule = (rule: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    };
    setRules((prev) => [...prev, newRule]);
    showToast(`New automation rule "${rule.name}" deployed to ESP32`, 'success');
  };

  const toggleActuator = (actuator: 'fanOn' | 'ledOn' | 'waterPumpOn') => {
    const nextVal = !actuators[actuator];
    setActuators((prev) => {
      const label =
        actuator === 'fanOn'
          ? 'Cooling Fan'
          : actuator === 'ledOn'
          ? 'Status Alert LED'
          : 'Central Reservoir SCADA Pump';
      showToast(`${label} manually switched ${nextVal ? 'ON' : 'OFF'}`, 'info');
      return { ...prev, [actuator]: nextVal };
    });
    if (actuator === 'waterPumpOn') {
      void api.createWater({ waterPumpActive: nextVal }).catch((error: unknown) => {
        showToast(
          error instanceof Error ? `Water system change was not saved: ${error.message}` : 'Water system change was not saved.',
          'error',
        );
      });
    }
  };

  const setLcdMessage = (msg: string) => {
    setActuators((prev) => ({ ...prev, lcdMessage: msg }));
  };

  const setTrafficOverride = (state: 'auto' | 'green' | 'yellow' | 'red') => {
    setActuators((prev) => ({ ...prev, trafficOverride: state }));
    void api.createTraffic({ trafficSignalState: state }).catch((error: unknown) => {
      showToast(
        error instanceof Error ? `Traffic signal change was not saved: ${error.message}` : 'Traffic signal change was not saved.',
        'error',
      );
    });
    showToast(
      state === 'auto'
        ? 'Traffic signal restored to automated adaptive AI mode'
        : `Traffic signal manually overridden to ${state.toUpperCase()}`,
      state === 'red' ? 'warning' : 'success'
    );
  };

  const toggleFault = (faultName: keyof SmartCityContextType['faults']) => {
    setFaults((prev) => {
      const next = !prev[faultName];
      showToast(`Fault simulation [${faultName}] ${next ? 'TRIGGERED' : 'RESOLVED'}`, next ? 'warning' : 'success');
      return { ...prev, [faultName]: next };
    });
  };

  return (
    <SmartCityContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        setIsAuthenticated,
        switchUserRole,
        registerCitizen,
        registerAdmin,
        login,
        logout,
        toasts,
        showToast,
        dismissToast,
        telemetry,
        updateTelemetry,
        sensors,
        buildings,
        registerSensor,
        isSimulationRunning,
        toggleSimulation,
        resetAllTelemetry,
        problems,
        refreshProblems,
        createProblem,
        upvoteProblem,
        addComment,
        adminResolveProblem,
        alerts,
        dismissAlert,
        triggerEmergencyAlert,
        rules,
        toggleRule,
        addRule,
        actuators,
        toggleActuator,
        setLcdMessage,
        setTrafficOverride,
        faults,
        toggleFault,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isCreateProblemOpen,
        setIsCreateProblemOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        selectedProblemId,
        setSelectedProblemId,
      }}
    >
      {children}
    </SmartCityContext.Provider>
  );
};

export const useSmartCity = () => {
  const context = useContext(SmartCityContext);
  if (!context) {
    throw new Error('useSmartCity must be used within a SmartCityProvider');
  }
  return context;
};
