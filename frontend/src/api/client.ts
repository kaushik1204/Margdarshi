import {
  AuthUser,
  StudentProfile,
  Company,
  PlacementDrive,
  EligibilityCriteria,
  ApplicationRecord,
  StageProgressRecord,
  PlacementResultRecord,
} from '../types/placement';

const API_BASE = '/api';
const TOKEN_KEY = 'margdarshi_auth_token';

interface ApiErrorResponse {
  error?: string;
  reasons?: string[];
  message?: string;
}

export class ApiError extends Error {
  public status: number;
  public reasons?: string[];

  constructor(message: string, status: number, reasons?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.reasons = reasons;
  }
}

function normalizeStudent(s?: any): StudentProfile | undefined {
  if (!s || !s.id) return undefined;
  let skillsArr: string[] = ['Java', 'Python', 'React', 'Spring Boot'];
  if (Array.isArray(s.skills)) {
    skillsArr = s.skills;
  } else if (typeof s.skills === 'string') {
    skillsArr = s.skills.split(',').map((item: string) => item.trim()).filter(Boolean);
  }
  return {
    ...s,
    skills: skillsArr,
    tenthPercentage: typeof s.tenthPercentage === 'number' ? s.tenthPercentage : (parseFloat(s.tenthPercentage) || 85.0),
    twelfthPercentage: typeof s.twelfthPercentage === 'number' ? s.twelfthPercentage : (parseFloat(s.twelfthPercentage) || 82.0),
    graduationYear: typeof s.graduationYear === 'number' ? s.graduationYear : (parseInt(s.graduationYear, 10) || 2026),
    resumePath: s.resumePath || `resumes/${s.rollNumber || 'student'}_Resume.pdf`,
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    try {
      this.token = localStorage.getItem(TOKEN_KEY);
    } catch {
      this.token = null;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null): void {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  }

  public clearToken(): void {
    this.setToken(null);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear invalid/expired token
      this.clearToken();
    }

    if (!response.ok) {
      let errBody: ApiErrorResponse = {};
      try {
        errBody = await response.json();
      } catch {}
      const message = errBody.error || errBody.message || `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, errBody.reasons);
    }

    return response.json();
  }

  // ==================== AUTH ====================
  public auth = {
    signIn: async (email: string, password: string): Promise<{ token: string; user: AuthUser; student?: StudentProfile }> => {
      const data = await this.request<{ token: string; user: AuthUser; student?: StudentProfile }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(data.token);
      return {
        ...data,
        student: normalizeStudent(data.student),
      };
    },

    register: async (payload: {
      email: string;
      password: string;
      name: string;
      rollNumber: string;
      branch: string;
      cgpa: number;
      backlogs?: number;
      tenthPercentage?: number;
      twelfthPercentage?: number;
      graduationYear?: number;
      phone?: string;
      skills?: string[];
      resumePath?: string;
    }): Promise<{ token: string; user: AuthUser; student: StudentProfile }> => {
      const data = await this.request<{ token: string; user: AuthUser; student: StudentProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.setToken(data.token);
      return {
        ...data,
        student: normalizeStudent(data.student)!,
      };
    },

    getMe: async (): Promise<{ user: AuthUser; student?: StudentProfile }> => {
      const data = await this.request<{ user: AuthUser; student?: StudentProfile }>('/auth/me');
      return {
        ...data,
        student: normalizeStudent(data.student),
      };
    },

    signOut: (): void => {
      this.clearToken();
    },
  };

  // ==================== DRIVES ====================
  public drives = {
    getAll: async (): Promise<PlacementDrive[]> => {
      return this.request<PlacementDrive[]>('/drives');
    },

    getById: async (id: string): Promise<PlacementDrive> => {
      return this.request<PlacementDrive>(`/drives/${id}`);
    },

    create: async (driveData: Partial<PlacementDrive>): Promise<PlacementDrive> => {
      return this.request<PlacementDrive>('/drives', {
        method: 'POST',
        body: JSON.stringify(driveData),
      });
    },

    update: async (id: string, driveData: Partial<PlacementDrive>): Promise<PlacementDrive> => {
      return this.request<PlacementDrive>(`/drives/${id}`, {
        method: 'PUT',
        body: JSON.stringify(driveData),
      });
    },

    updateCriteria: async (driveId: string, criteriaData: Partial<EligibilityCriteria>): Promise<EligibilityCriteria> => {
      return this.request<EligibilityCriteria>(`/drives/${driveId}/criteria`, {
        method: 'PUT',
        body: JSON.stringify(criteriaData),
      });
    },

    getStageCandidates: async (driveId: string, stageId: string): Promise<any[]> => {
      return this.request<any[]>(`/drives/${driveId}/stages/${stageId}/candidates`);
    },
  };

  // ==================== APPLICATIONS ====================
  public applications = {
    getAll: async (params?: { driveId?: string; studentId?: string }): Promise<ApplicationRecord[]> => {
      const query = new URLSearchParams();
      if (params?.driveId) query.set('driveId', params.driveId);
      if (params?.studentId) query.set('studentId', params.studentId);
      const q = query.toString() ? `?${query.toString()}` : '';
      return this.request<ApplicationRecord[]>(`/applications${q}`);
    },

    apply: async (driveId: string, companyApplicationId: string, studentId?: string): Promise<ApplicationRecord> => {
      return this.request<ApplicationRecord>('/applications', {
        method: 'POST',
        body: JSON.stringify({ driveId, companyApplicationId, studentId }),
      });
    },

    updateSelfReport: async (id: string, data: { companyApplicationId?: string; selfReportStatus?: string }): Promise<ApplicationRecord> => {
      return this.request<ApplicationRecord>(`/applications/${id}/self-report`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    updateStageProgress: async (
      applicationId: string,
      stageId: string,
      status?: 'PENDING' | 'COMPLETED' | 'FAILED',
      extra?: Record<string, any>
    ): Promise<StageProgressRecord> => {
      return this.request<StageProgressRecord>(`/applications/${applicationId}/stages`, {
        method: 'POST',
        body: JSON.stringify({ stageId, status, ...(extra || {}) }),
      });
    },
  };

  // ==================== STUDENTS ====================
  public students = {
    getAll: async (): Promise<StudentProfile[]> => {
      const list = await this.request<any[]>('/students');
      return list.map((s) => normalizeStudent(s)!).filter(Boolean);
    },

    getById: async (id: string): Promise<StudentProfile> => {
      const s = await this.request<any>(`/students/${id}`);
      return normalizeStudent(s)!;
    },

    update: async (id: string, data: Partial<StudentProfile>): Promise<StudentProfile> => {
      const s = await this.request<any>(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return normalizeStudent(s)!;
    },
  };

  // ==================== COMPANIES ====================
  public companies = {
    getAll: async (): Promise<Company[]> => {
      return this.request<Company[]>('/companies');
    },

    create: async (companyData: Partial<Company>): Promise<Company> => {
      return this.request<Company>('/companies', {
        method: 'POST',
        body: JSON.stringify(companyData),
      });
    },
  };

  // ==================== RESULTS ====================
  public results = {
    getAll: async (): Promise<PlacementResultRecord[]> => {
      return this.request<PlacementResultRecord[]>('/results');
    },

    publish: async (data: { studentId: string; driveId: string; result: 'SELECTED' | 'REJECTED'; ctcPackage?: string; package?: string }): Promise<PlacementResultRecord> => {
      return this.request<PlacementResultRecord>('/results', {
        method: 'POST',
        body: JSON.stringify({
          studentId: data.studentId,
          driveId: data.driveId,
          result: data.result,
          ctcPackage: data.ctcPackage || data.package,
        }),
      });
    },
  };

  // ==================== LIVE STATS ====================
  public stats = {
    get: async (): Promise<{
      activeDrivesCount: number;
      totalStudentsCount: number;
      placedStudentsCount: number;
      totalApplicationsCount: number;
      highestPackage: string;
    }> => {
      return this.request<{
        activeDrivesCount: number;
        totalStudentsCount: number;
        placedStudentsCount: number;
        totalApplicationsCount: number;
        highestPackage: string;
      }>('/stats');
    },
  };
}

export const api = new ApiClient();
