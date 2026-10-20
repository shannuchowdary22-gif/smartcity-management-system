export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  badge: string;
  department?: string;
  ward?: string;
  karmaPoints?: number;
  phone?: string;
  password?: string;
}

export type ProblemCategory =
  | 'traffic'
  | 'waste'
  | 'water'
  | 'pollution'
  | 'electricity'
  | 'road_pothole'
  | 'emergency'
  | 'public_safety';

export type ProblemStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'dispatched'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ProblemPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProofVerificationStatus = 'pending' | 'approved' | 'rejected' | 'needs_review';
export type EvidenceSource = 'demo_illustration' | 'citizen_submitted' | 'municipal_submitted';

export interface ProblemComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export interface ProblemProofRecord {
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  additionalPhotoUrls?: string[];
  beforeEvidenceSource?: EvidenceSource;
  afterEvidenceSource?: EvidenceSource;
  verificationStatus?: ProofVerificationStatus;
  proofVerified?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  verifiedAt?: string;
  reviewNotes?: string;
  auditTrail?: Array<{
    actor: string;
    action: string;
    role: 'citizen' | 'admin';
    timestamp: string;
  }>;
}

export interface ProblemItem {
  id: string;
  backendId?: number;
  title: string;
  description: string;
  category: ProblemCategory;
  priority: ProblemPriority;
  status: ProblemStatus;
  location: {
    address: string;
    ward: string;
    coordinates?: [number, number];
  };
  reporter: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  beforePhotoUrl?: string;
  additionalPhotoUrls?: string[];
  upvotes: number;
  upvotedBy: string[]; // user IDs
  assignedTo?: {
    officerName: string;
    department: string;
    assignedAt: string;
  };
  resolutionNotes?: string;
  resolutionPhotoUrl?: string;
  verifiedPhotoUrl?: string;
  resolvedAt?: string;
  proof?: ProblemProofRecord;
  verificationStatus?: ProofVerificationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  verifiedAt?: string;
  reviewNotes?: string;
  auditTrail?: ProblemProofRecord['auditTrail'];
  comments: ProblemComment[];
  linkedSensorId?: string;
  aiAnalysis?: ProblemAiAnalysis;
  workOrder?: WorkOrder;
}

export interface WorkOrder {
  id: string;
  complaintId: string;
  assignedOfficer: string;
  department: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  completionNotes: string | null;
}

export interface ProblemAiAnalysis {
  detectedLabels?: string[];
  labels?: string[];
  severityRating?: number; // 1-100
  severity?: 'low' | 'medium' | 'high' | 'critical' | string;
  hazardType: string;
  structuralImpact?: string;
  recommendedAction: string;
  estimatedFixTimeHours?: number;
  estimatedRepairHours?: number;
  confidenceScore?: number; // 0-100%
  confidence?: number;
  riskScore?: number;
  safetyZoneRequired?: boolean;
  detectedEquipmentNeeded?: string[];
  requiredEquipment?: string[];
}

export interface SmartCityTelemetry {
  // Traffic
  vehicleCount: number;
  trafficDensity: 'Low' | 'Medium' | 'High';
  trafficCongestion: 'Low' | 'Moderate' | 'Heavy';
  avgSpeed: number; // km/h
  trafficSignalState: 'green' | 'yellow' | 'red';
  trafficSignalCountdown: number; // seconds
  trafficHistory: number[];

  // Waste Management
  wasteBinFillLevel: number; // 78%
  fullBinsCount: number; // 2
  totalBins: number; // 10
  wasteCollectionStatus: 'On Track' | 'Delayed' | 'Completed';
  wasteAlertCount: number;

  // Water Management
  waterTankLevel: number; // 68%
  waterFlowRate: number; // 12.5 L/min
  waterPressure: number; // 2.4 bar
  waterLeakageStatus: 'None' | 'Minor Detected' | 'Critical Burst';
  waterPumpActive: boolean;

  // Pollution
  aqi: number; // 102
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  pm25: number; // 32 ug/m3
  pm10: number; // 58 ug/m3
  co2: number; // 421 ppm
  temperature: number; // 28.5 C
  humidity: number; // 62%
  aqiHistory: number[];

  // Emergency
  emergencyStatus: 'Safe' | 'Warning' | 'Critical';
  fireIncidents: number;
  accidentIncidents: number;
  medicalIncidents: number;

  // System Health
  overallHealth: number; // 92%
  networkHealth: number; // 98%
  powerHealth: number; // 94%
  sensorHealth: number; // 88%
  actuatorHealth: number; // 90%

  // High level metrics (Top banner from image)
  totalDevices: number; // 28
  activeDevices: number; // 24
  runningSimulations: number; // 3
  activeAlertsCount: number; // 2
  totalProjects: number; // 5
  simulationTests: number; // 12
}

export interface CityAlert {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: 'info' | 'warning' | 'critical';
  category: ProblemCategory;
  read: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
  type: 'temp' | 'water' | 'aqi' | 'waste' | 'traffic';
}

export interface CircuitNode {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'controller';
  value: string | number;
  unit?: string;
  pin?: string;
  status: 'online' | 'warning' | 'offline';
  voltage?: string;
  current?: string;
}
