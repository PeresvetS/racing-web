import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { telemetryApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { ImportTelemetryResponse, BulkImportResponse } from '@/types';

interface TelemetryImportProps {
  dayId: string;
  onImported: (result: ImportTelemetryResponse | BulkImportResponse) => void;
}

/**
 * Компонент для импорта телеметрии из CSV файлов RaceStudio 3
 * Поддерживает загрузку нескольких файлов (каждый CSV = одна сессия)
 */
export function TelemetryImport({ dayId, onImported }: TelemetryImportProps) {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (files.length === 1) {
        // Один файл — используем обычный импорт
        const result = await telemetryApi.importCsv(dayId, files[0]);
        setSuccessMessage(
          t('editor.telemetry.importedSession', {
            laps: result.summary.totalLaps,
            time: result.summary.bestLapTime,
          }),
        );
        onImported(result);
      } else {
        // Несколько файлов — используем bulk import
        const fileArray = Array.from(files);
        const result = await telemetryApi.importBulk(dayId, fileArray);
        setSuccessMessage(
          t('editor.telemetry.importedSessions', {
            count: result.sessionsImported,
          }),
        );
        onImported(result);
      }
    } catch (err) {
      console.error('Failed to import telemetry:', err);
      setError(t('editor.telemetry.importError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void handleFilesSelect(files);
    }
    // Сбрасываем input для возможности повторной загрузки тех же файлов
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handleClick}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 animate-pulse" />
              {t('editor.telemetry.importing')}
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              {t('editor.telemetry.importSessions')}
            </>
          )}
        </Button>

        <span className="text-sm text-muted-foreground">
          {t('editor.telemetry.importHintMultiple')}
        </span>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
