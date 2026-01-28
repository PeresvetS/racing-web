import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from './file-upload';
import { TelemetryTable } from './telemetry-table';
import { RemarksSection } from './remarks-section';
import { daysApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { ReportDay, FileData } from '@/types';

interface DayEditorProps {
  documentId: string;
  day: ReportDay;
  onUpdate: () => void;
}

// Компонент использует key prop для сброса состояния при смене дня
export function DayEditor({ documentId, day, onUpdate }: DayEditorProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [weather, setWeather] = useState(day.weather || '');
  const [trackCondition, setTrackCondition] = useState(day.trackCondition || '');
  const [importantNotes, setImportantNotes] = useState(day.importantNotes || '');
  const [kartCheckingFile, setKartCheckingFile] = useState<FileData | null>(day.kartCheckingFile);
  const [importantNoteFile, setImportantNoteFile] = useState<FileData | null>(day.importantNoteFile);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof daysApi.update>[2]) =>
      daysApi.update(documentId, day.id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    },
  });

  const handleFieldBlur = (field: string, value: string) => {
    const originalValue = field === 'weather' ? day.weather :
                         field === 'trackCondition' ? day.trackCondition :
                         day.importantNotes;

    if (value !== (originalValue || '')) {
      updateMutation.mutate({ [field]: value || undefined });
    }
  };

  const handleFileChange = (field: 'kartCheckingFileId' | 'importantNoteFileId', file: FileData | null) => {
    if (field === 'kartCheckingFileId') {
      setKartCheckingFile(file);
    } else {
      setImportantNoteFile(file);
    }
    updateMutation.mutate({ [field]: file?.id || null });
  };

  const isDay1 = day.dayNumber === 1;

  return (
    <div className="space-y-6">
      {/* Weather & Track Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('editor.day.conditions')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`weather-${day.id}`}>{t('editor.day.weather')}</Label>
            <Input
              id={`weather-${day.id}`}
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              onBlur={() => handleFieldBlur('weather', weather)}
              placeholder={t('editor.day.weatherPlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`track-${day.id}`}>{t('editor.day.trackCondition')}</Label>
            <Input
              id={`track-${day.id}`}
              value={trackCondition}
              onChange={(e) => setTrackCondition(e.target.value)}
              onBlur={() => handleFieldBlur('trackCondition', trackCondition)}
              placeholder={t('editor.day.trackConditionPlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Kart Checking (только для Day 1) */}
      {isDay1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('editor.day.kartChecking')}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              value={kartCheckingFile}
              onChange={(file) => handleFileChange('kartCheckingFileId', file)}
              fileType="KART_CHECKING"
              context={{ documentId, dayId: day.id }}
            />
          </CardContent>
        </Card>
      )}

      {/* Telemetry Table */}
      <Card>
        <CardContent className="pt-6">
          <TelemetryTable
            dayId={day.id}
            sessions={day.sessions}
            onUpdate={onUpdate}
          />
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('editor.day.importantNotes')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={importantNotes}
            onChange={(e) => setImportantNotes(e.target.value)}
            onBlur={() => handleFieldBlur('importantNotes', importantNotes)}
            placeholder={t('editor.day.importantNotesPlaceholder')}
            rows={4}
            disabled={updateMutation.isPending}
          />
          <div>
            <Label className="mb-2 block">{t('editor.day.importantNoteImage')}</Label>
            <FileUpload
              value={importantNoteFile}
              onChange={(file) => handleFileChange('importantNoteFileId', file)}
              fileType="IMPORTANT_NOTE"
              context={{ documentId, dayId: day.id }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Remarks */}
      <Card>
        <CardContent className="pt-6">
          <RemarksSection
            dayId={day.id}
            remarks={day.remarks}
            onUpdate={onUpdate}
          />
        </CardContent>
      </Card>

      {updateMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('common.saving')}
        </div>
      )}
    </div>
  );
}
