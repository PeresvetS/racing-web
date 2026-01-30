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
export type FileType = 'TRACK_MAP' | 'KART_CHECKING' | 'SEE_YOU_SOON' | 'REPORT_SLIDE';

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

export interface ReportSlide {
  id: string;
  content: string;
  orderIndex: number;
  imageFile: FileData | null;
}

export interface ReportDay {
  id: string;
  dayNumber: number;
  dayDate: string | null;
  weather: string | null;
  tyres: string | null;
  trackCondition: string | null;
  documentId: string;
  kartCheckingFile: FileData | null;
  sessions: TelemetrySession[];
  reportSlides: ReportSlide[];
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
  shortTrackName: string;
  trackLength: string;
  trackWidth: string;
  cornerCount: string;
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
  shortTrackName?: string;
  trackLength?: string;
  trackWidth?: string;
  cornerCount?: string;
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
  kartCheckingFileId?: string;
}

export interface UpdateDayDto {
  dayNumber?: number;
  dayDate?: string;
  weather?: string;
  tyres?: string;
  trackCondition?: string;
  kartCheckingFileId?: string | null;
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

export interface ImportTelemetryResponse {
  lapsImported: number;
  dayUpdated: {
    dayDate: string | null;
    weather: string | null;
  };
  metadata: {
    session: string;
    racer: string;
    venue: string;
  };
}

// ===== Report Slide Types =====
export interface CreateReportSlideDto {
  content: string;
  orderIndex?: number;
  imageFileId?: string;
}

export interface UpdateReportSlideDto {
  content?: string;
  orderIndex?: number;
  imageFileId?: string | null;
}

export interface ReorderReportSlidesDto {
  slideIds: string[];
}
