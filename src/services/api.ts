import axios from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  Document,
  DocumentFull,
  PaginatedDocuments,
  CreateDocumentDto,
  UpdateDocumentDto,
  UpdateReportDto,
  DocumentsQuery,
  User,
  FileData,
  FileType,
  ReportDay,
  CreateDayDto,
  UpdateDayDto,
  TelemetrySession,
  BatchUpdateTelemetryDto,
  ReportSlide,
  CreateReportSlideDto,
  UpdateReportSlideDto,
  ReorderReportSlidesDto,
} from '@/types';

// В production используем VITE_API_URL, в development — прокси через /api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена авторизации
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерсептор для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Documents API
export const documentsApi = {
  getAll: async (query?: DocumentsQuery): Promise<PaginatedDocuments> => {
    const { data } = await api.get<PaginatedDocuments>('/documents', { params: query });
    return data;
  },

  getOne: async (id: string): Promise<Document> => {
    const { data } = await api.get<Document>(`/documents/${id}`);
    return data;
  },

  getFull: async (id: string): Promise<DocumentFull> => {
    const { data } = await api.get<DocumentFull>(`/documents/${id}/full`);
    return data;
  },

  create: async (dto: CreateDocumentDto): Promise<Document> => {
    const { data } = await api.post<Document>('/documents', dto);
    return data;
  },

  update: async (id: string, dto: UpdateDocumentDto): Promise<Document> => {
    const { data } = await api.patch<Document>(`/documents/${id}`, dto);
    return data;
  },

  updateReport: async (id: string, dto: UpdateReportDto): Promise<DocumentFull> => {
    const { data } = await api.patch<DocumentFull>(`/documents/${id}/report`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  downloadPptx: async (id: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/documents/${id}/download-pptx`, {
      responseType: 'blob',
    });
    return data;
  },
};

// Files API
export const filesApi = {
  upload: async (
    file: File,
    type: FileType,
    context?: { documentId?: string; dayId?: string },
  ): Promise<FileData> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (context?.documentId) formData.append('documentId', context.documentId);
    if (context?.dayId) formData.append('dayId', context.dayId);

    const { data } = await api.post<FileData>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getOne: async (id: string): Promise<FileData> => {
    const { data } = await api.get<FileData>(`/files/${id}`);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
};

// Report Days API
export const daysApi = {
  getAll: async (documentId: string): Promise<ReportDay[]> => {
    const { data } = await api.get<ReportDay[]>(`/documents/${documentId}/days`);
    return data;
  },

  getOne: async (documentId: string, dayId: string): Promise<ReportDay> => {
    const { data } = await api.get<ReportDay>(`/documents/${documentId}/days/${dayId}`);
    return data;
  },

  create: async (documentId: string, dto: CreateDayDto): Promise<ReportDay> => {
    const { data } = await api.post<ReportDay>(`/documents/${documentId}/days`, dto);
    return data;
  },

  update: async (documentId: string, dayId: string, dto: UpdateDayDto): Promise<ReportDay> => {
    const { data } = await api.patch<ReportDay>(`/documents/${documentId}/days/${dayId}`, dto);
    return data;
  },

  delete: async (documentId: string, dayId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}/days/${dayId}`);
  },
};

// Telemetry API
export const telemetryApi = {
  getAll: async (dayId: string): Promise<TelemetrySession[]> => {
    const { data } = await api.get<TelemetrySession[]>(`/days/${dayId}/telemetry`);
    return data;
  },

  batchUpdate: async (dayId: string, dto: BatchUpdateTelemetryDto): Promise<TelemetrySession[]> => {
    const { data } = await api.patch<TelemetrySession[]>(`/days/${dayId}/telemetry/batch`, dto);
    return data;
  },

  delete: async (dayId: string, sessionId: string): Promise<void> => {
    await api.delete(`/days/${dayId}/telemetry/${sessionId}`);
  },
};

// Report Slides API
export const reportSlidesApi = {
  getAll: async (dayId: string): Promise<ReportSlide[]> => {
    const { data } = await api.get<ReportSlide[]>(`/days/${dayId}/report-slides`);
    return data;
  },

  getOne: async (dayId: string, slideId: string): Promise<ReportSlide> => {
    const { data } = await api.get<ReportSlide>(`/days/${dayId}/report-slides/${slideId}`);
    return data;
  },

  create: async (dayId: string, dto: CreateReportSlideDto): Promise<ReportSlide> => {
    const { data } = await api.post<ReportSlide>(`/days/${dayId}/report-slides`, dto);
    return data;
  },

  update: async (dayId: string, slideId: string, dto: UpdateReportSlideDto): Promise<ReportSlide> => {
    const { data } = await api.put<ReportSlide>(`/days/${dayId}/report-slides/${slideId}`, dto);
    return data;
  },

  delete: async (dayId: string, slideId: string): Promise<void> => {
    await api.delete(`/days/${dayId}/report-slides/${slideId}`);
  },

  reorder: async (dayId: string, dto: ReorderReportSlidesDto): Promise<void> => {
    await api.put(`/days/${dayId}/report-slides/reorder`, dto);
  },
};

export default api;
