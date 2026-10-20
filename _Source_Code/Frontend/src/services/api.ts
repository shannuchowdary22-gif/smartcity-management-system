import type {
  CityAlert,
  ProblemItem,
  SmartCityTelemetry,
  WorkOrder,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiResource<T = Record<string, unknown>> {
  id: number;
  createdAt: string;
  updatedAt: string;
  data: T;
}

export interface DashboardResponse {
  totals: Record<string, number>;
  latestTelemetry: Partial<SmartCityTelemetry>;
  lastUpdated: string | null;
}

export interface ComplaintSubmissionResult {
  complaint: ProblemItem;
  receiptToken: string;
}

const ACCESS_TOKEN_KEY = 'smartcity_access_token_v1';

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN';
  department?: string | null;
  ward?: string | null;
  phone?: string | null;
}

export type OfficerBootstrapStatus = 'AVAILABLE' | 'COMPLETED' | 'UNAVAILABLE';

interface AuthSession {
  accessToken: string;
  expiresAt: string;
  account: AuthAccount;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type GrievancePayload = Omit<ProblemItem, 'id' | 'backendId'>;
type EmergencyPayload = Omit<CityAlert, 'id' | 'time'>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(sessionStorage.getItem(ACCESS_TOKEN_KEY)
          ? { Authorization: `Bearer ${sessionStorage.getItem(ACCESS_TOKEN_KEY)}` }
          : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Could not reach the Smart City API at ${API_BASE_URL}. Start the Spring Boot backend and check CORS.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const responseText = await response.text();
    let message: string | undefined;
    try {
      const body = JSON.parse(responseText) as {
        message?: string;
        detail?: string;
        title?: string;
      };
      message = body.message || body.detail || body.title;
    } catch {
      message = undefined;
    }
    if (response.status === 401) sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    throw new ApiError(message || `Smart City API returned HTTP ${response.status}`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const resourceRequest = <T extends object>(
  path: string,
  method: 'POST' | 'PUT',
  data: T,
) => request<ApiResource<T>>(path, {
  method,
  body: JSON.stringify({ data }),
});

function mapProblem(resource: ApiResource<GrievancePayload>): ProblemItem {
  return {
    ...resource.data,
    id: `PRB-${resource.id}`,
    backendId: resource.id,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

function toProblemData(problem: ProblemItem): GrievancePayload {
  const { id: _id, backendId: _backendId, ...data } = problem;
  return data;
}

function mapEmergency(resource: ApiResource<EmergencyPayload>): CityAlert {
  const data = resource.data;
  return {
    ...data,
    id: String(resource.id),
    time: resource.createdAt,
  };
}

export const api = {
  loginCitizen: async (email: string, password: string) => {
    const session = await request<AuthSession>('/api/auth/citizen-session', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    return session.account;
  },
  loginAdmin: async (email: string, password: string) => {
    const session = await request<AuthSession>('/api/auth/admin-session', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    return session.account;
  },
  registerCitizen: async (data: {
    name: string;
    email: string;
    password: string;
    ward: string;
    phone?: string;
  }) => {
    const session = await request<AuthSession>('/api/auth/citizens', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    return session.account;
  },
  getOfficerBootstrapStatus: () =>
    request<{ status: OfficerBootstrapStatus }>('/api/auth/officers/bootstrap-status', {
      headers: { Authorization: '' },
    }),
  registerOfficer: async (data: {
    name: string;
    email: string;
    password: string;
    clearanceCode: string;
    department: string;
  }) => {
    const session = await request<AuthSession>('/api/auth/officers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    return session.account;
  },
  getSession: () => request<AuthSession>('/api/auth/session'),
  clearSessionToken: () => sessionStorage.removeItem(ACCESS_TOKEN_KEY),
  clearSession: () => {
    const result = request<void>('/api/auth/session', { method: 'DELETE' });
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return result;
  },
  hasSessionToken: () => Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY)),
  getAdminComplaints: async () =>
    (await request<ProblemItem[]>('/api/admin/complaints')).map((problem) => ({
      ...problem,
      backendId: problem.backendId ?? Number(problem.id.replace(/^CMP-/, '')),
    })),
  getAdminComplaint: (id: string) => request<ProblemItem>(`/api/admin/complaints/${encodeURIComponent(id)}`),
  createComplaint: async (problem: Omit<ProblemItem, 'id' | 'backendId'>) => {
    const response = await request<{ complaint: ProblemItem; receiptToken: string }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify({
        title: problem.title,
        description: problem.description,
        category: problem.category,
        priority: problem.priority,
        address: problem.location.address,
        ward: problem.location.ward,
        reporterId: problem.reporter.id,
        reporterName: problem.reporter.name,
        reporterAvatar: problem.reporter.avatar,
        imageUrl: problem.imageUrl,
      }),
    });
    return {
      complaint: {
        ...response.complaint,
        backendId: response.complaint.backendId,
      },
      receiptToken: response.receiptToken,
    };
  },
  getCitizenComplaints: () => request<ProblemItem[]>('/api/complaints'),
  getCitizenComplaintStatus: (id: string, receiptToken?: string) =>
    request<ProblemItem>(`/api/complaints/${encodeURIComponent(id)}/status`, {
      headers: receiptToken ? { 'X-Complaint-Receipt': receiptToken } : {},
    }),
  assignResolver: (id: string, officerName: string, department: string) =>
    request<ProblemItem>(`/api/admin/complaints/${encodeURIComponent(id)}/assign`, {
      method: 'POST',
      body: JSON.stringify({ officerName, department }),
    }),
  createWorkOrder: (id: string) =>
    request<WorkOrder>(`/api/admin/complaints/${encodeURIComponent(id)}/work-orders`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getWorkOrders: () => request<WorkOrder[]>('/api/admin/work-orders'),
  updateAdminComplaint: (id: string, updates: {
    status?: string;
    priority?: string;
    resolutionNotes?: string;
    resolutionProofDataUrl?: string;
    verificationStatus?: string;
    reviewNotes?: string;
    reviewedBy?: string;
  }) =>
    request<ProblemItem>(`/api/admin/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  updateWorkOrder: (id: string, updates: {
    status?: string;
    officerName?: string;
    resolutionNotes?: string;
    resolutionProofDataUrl?: string;
  }) =>
    request<WorkOrder>(`/api/admin/work-orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  getDashboard: () => request<DashboardResponse>('/api/dashboard'),
  getTraffic: () => request<ApiResource[]>('/api/traffic'),
  createTraffic: (data: object) =>
    resourceRequest('/api/traffic', 'POST', data),
  getWaste: () => request<ApiResource[]>('/api/waste'),
  createWaste: (data: object) =>
    resourceRequest('/api/waste', 'POST', data),
  getWater: () => request<ApiResource[]>('/api/water'),
  createWater: (data: object) =>
    resourceRequest('/api/water', 'POST', data),
  getPollution: () => request<ApiResource[]>('/api/pollution'),
  createPollution: (data: object) =>
    resourceRequest('/api/pollution', 'POST', data),
  getEmergencies: async () =>
    (await request<ApiResource<EmergencyPayload>[]>('/api/emergencies')).map(mapEmergency),
  createEmergency: async (data: EmergencyPayload) =>
    mapEmergency(await resourceRequest('/api/emergencies', 'POST', data)),
  updateEmergency: async (id: number, alert: CityAlert) => {
    const { id: _id, time: _time, ...data } = alert;
    return mapEmergency(await resourceRequest(`/api/emergencies/${id}`, 'PUT', data));
  },
  getGrievances: async () =>
    (await request<ApiResource<GrievancePayload>[]>('/api/grievances')).map(mapProblem),
  getGrievance: async (id: number) =>
    mapProblem(await request<ApiResource<GrievancePayload>>(`/api/grievances/${id}`)),
  createGrievance: async (problem: ProblemItem) =>
    mapProblem(await resourceRequest('/api/grievances', 'POST', toProblemData(problem))),
  updateGrievance: async (problem: ProblemItem) => {
    const id = problem.backendId ?? Number(problem.id.replace(/^PRB-/, ''));
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('This grievance has no database ID and cannot be updated on the server.');
    }
    return mapProblem(await resourceRequest(`/api/grievances/${id}`, 'PUT', toProblemData(problem)));
  },
  getSensors: () => request<ApiResource[]>('/api/sensors'),
  getSensor: (id: number) => request<ApiResource>(`/api/sensors/${id}`),
  createSensor: (data: Record<string, unknown>) =>
    resourceRequest('/api/sensors', 'POST', data),
  updateSensor: (id: number, data: Record<string, unknown>) =>
    resourceRequest(`/api/sensors/${id}`, 'PUT', data),
  getBuildings: () => request<ApiResource[]>('/api/buildings'),
  getIot: () => request<ApiResource<Partial<SmartCityTelemetry>>[]>('/api/iot'),
  createIot: (data: SmartCityTelemetry) =>
    resourceRequest('/api/iot', 'POST', data),
};
