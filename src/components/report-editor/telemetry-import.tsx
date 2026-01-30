import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { telemetryApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { ImportTelemetryResponse } from '@/types';

interface TelemetryImportProps {
  dayId: string;
  onImported: (result: ImportTelemetryResponse) => void;
}

/**
 * Компонент для импорта телеметрии из CSV файла RaceStudio 3
 */
export function TelemetryImport({ dayId, onImported }: TelemetryImportProps) {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportTelemetryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const importResult = await telemetryApi.importCsv(dayId, file);
      setResult(importResult);
      onImported(importResult);
    } catch (err) {
      console.error('Failed to import telemetry:', err);
      setError(t('editor.telemetry.importError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
    // Сбрасываем input для возможности повторной загрузки того же файла
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
              {t('editor.telemetry.import')}
            </>
          )}
        </Button>

        <span className="text-sm text-muted-foreground">
          {t('editor.telemetry.importHint')}
        </span>
      </div>

      {result && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            {t('editor.telemetry.imported', { count: result.lapsImported })}
            {result.dayUpdated.weather && ` • ${result.dayUpdated.weather}`}
          </span>
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
