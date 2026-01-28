export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ===== File Types =====
export type FileType = 'TRACK_MAP' | 'KART_CHECKING' | 'IMPORTANT_NOTE' | 'REMARK' | 'SEE_YOU_SOON';

export interface FileData {
  id: string;
  filename: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  type: FileType;
  createdAt: string;
}

export interface UploadFileDto {
  type: FileType;
  documentId?: string;
  dayId?: string;
  remarkId?: string;
}

// ===== Document Types =====
export type DocumentStatus = 'DRAFT' | 'GENERATED' | 'ARCHIVED';

export interface ReportSettings {
  lanes?: number;
  yBit?: number;
  corner?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  filePath: string | null;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface TelemetrySession {
  id: string;
  station: number;
  bestLaps: number | null;
  lapTime: string | null;
  maxRpm: number | null;
  maxSpeedKmh: number | null;
  minSpeedKmh: number | null;
}

export interface Remark {
  id: string;
  text: string;
  orderIndex: number;
  imageFile: FileData | null;
}

export interface ReportDay {
  id: string;
  dayNumber: number;
  weather: string | null;
  trackCondition: string | null;
  importantNotes: string | null;
  documentId: string;
  kartCheckingFile: FileData | null;
  importantNoteFile: FileData | null;
  sessions: TelemetrySession[];
  remarks: Remark[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFull {
  id: string;
  title: string;
  description: string | null;
  filePath: string | null;
  status: DocumentStatus;
  reportDate: string;
  eventName: string;
  driverName: string;
  trackName: string;
  settings: ReportSettings | null;
  trackMapFile: FileData | null;
  seeYouSoonFile: FileData | null;
  days: ReportDay[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

export interface PaginatedDocuments {
  items: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDocumentDto {
  title: string;
  description?: string;
}

export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  status?: DocumentStatus;
}

export interface UpdateReportDto {
  reportDate?: string;
  eventName?: string;
  driverName?: string;
  trackName?: string;
  settings?: ReportSettings;
  trackMapFileId?: string | null;
  seeYouSoonFileId?: string | null;
}

export interface DocumentsQuery {
  page?: number;
  limit?: number;
  status?: DocumentStatus;
  search?: string;
}

// ===== Report Day Types =====
export interface CreateDayDto {
  dayNumber: number;
  weather?: string;
  trackCondition?: string;
  importantNotes?: string;
  kartCheckingFileId?: string;
  importantNoteFileId?: string;
}

export interface UpdateDayDto {
  dayNumber?: number;
  weather?: string;
  trackCondition?: string;
  importantNotes?: string;
  kartCheckingFileId?: string | null;
  importantNoteFileId?: string | null;
}

// ===== Telemetry Types =====
export interface UpdateTelemetrySessionDto {
  station: number;
  bestLaps?: number | null;
  lapTime?: string | null;
  maxRpm?: number | null;
  maxSpeedKmh?: number | null;
  minSpeedKmh?: number | null;
}

export interface BatchUpdateTelemetryDto {
  sessions: UpdateTelemetrySessionDto[];
}

// ===== Remark Types =====
export interface CreateRemarkDto {
  text: string;
  orderIndex?: number;
  imageFileId?: string;
}

export interface UpdateRemarkDto {
  text?: string;
  orderIndex?: number;
  imageFileId?: string | null;
}

export interface ReorderRemarksDto {
  remarkIds: string[];
}
