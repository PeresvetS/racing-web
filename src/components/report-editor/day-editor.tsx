import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from './file-upload';
import { TelemetryTable } from './telemetry-table';
import { ReportSlidesSection } from './report-slides-section';
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

  const [dayDate, setDayDate] = useState(day.dayDate ? day.dayDate.split('T')[0] : '');
  const [weather, setWeather] = useState(day.weather || '');
  const [tyres, setTyres] = useState(day.tyres || '');
  const [trackCondition, setTrackCondition] = useState(day.trackCondition || '');
  const [kartCheckingFile, setKartCheckingFile] = useState<FileData | null>(day.kartCheckingFile);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof daysApi.update>[2]) =>
      daysApi.update(documentId, day.id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    },
  });

  const handleFieldBlur = (field: string, value: string) => {
    const originalValue = field === 'dayDate' ? (day.dayDate ? day.dayDate.split('T')[0] : '') :
                         field === 'weather' ? day.weather :
                         field === 'tyres' ? day.tyres :
                         day.trackCondition;

    if (value !== (originalValue || '')) {
      updateMutation.mutate({ [field]: value || undefined });
    }
  };

  const handleFileChange = (file: FileData | null) => {
    setKartCheckingFile(file);
    updateMutation.mutate({ kartCheckingFileId: file?.id || null });
  };

  const isDay1 = day.dayNumber === 1;

  return (
    <div className="space-y-6">
      {/* Date & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('editor.day.conditions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor={`date-${day.id}`}>{t('editor.day.dayDate')}</Label>
            <Input
              id={`date-${day.id}`}
              type="date"
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              onBlur={() => handleFieldBlur('dayDate', dayDate)}
              disabled={updateMutation.isPending}
            />
          </div>
          {/* Weather, Tyres, Track Condition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor={`tyres-${day.id}`}>{t('editor.day.tyres')}</Label>
              <Input
                id={`tyres-${day.id}`}
                value={tyres}
                onChange={(e) => setTyres(e.target.value)}
                onBlur={() => handleFieldBlur('tyres', tyres)}
                placeholder={t('editor.day.tyresPlaceholder')}
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
              onChange={handleFileChange}
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

      {/* Report Slides (DAY N: REPORT) */}
      <Card>
        <CardContent className="pt-6">
          <ReportSlidesSection
            documentId={documentId}
            dayId={day.id}
            slides={day.reportSlides || []}
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
