import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from './file-upload';
import { documentsApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { DocumentFull, FileData, ReportSettings } from '@/types';

interface ReportHeaderProps {
  document: DocumentFull;
  onUpdate: () => void;
}

// Компонент использует key prop для сброса состояния при смене документа
export function ReportHeader({ document, onUpdate }: ReportHeaderProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [eventName, setEventName] = useState(document.eventName);
  const [driverName, setDriverName] = useState(document.driverName);
  const [trackName, setTrackName] = useState(document.trackName);
  const [reportDate, setReportDate] = useState(
    format(new Date(document.reportDate), 'yyyy-MM-dd')
  );
  const [trackMapFile, setTrackMapFile] = useState<FileData | null>(document.trackMapFile);

  // Settings
  const [lanes, setLanes] = useState(document.settings?.lanes?.toString() || '');
  const [yBit, setYBit] = useState(document.settings?.yBit?.toString() || '');
  const [corner, setCorner] = useState(document.settings?.corner || '');

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof documentsApi.updateReport>[1]) =>
      documentsApi.updateReport(document.id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    },
  });

  const handleFieldBlur = (field: string, value: string) => {
    const originalValue = field === 'eventName' ? document.eventName :
                         field === 'driverName' ? document.driverName :
                         field === 'trackName' ? document.trackName :
                         field === 'reportDate' ? format(new Date(document.reportDate), 'yyyy-MM-dd') :
                         '';

    if (value !== originalValue) {
      if (field === 'reportDate') {
        updateMutation.mutate({ reportDate: new Date(value).toISOString() });
      } else {
        updateMutation.mutate({ [field]: value });
      }
    }
  };

  const handleSettingsBlur = () => {
    const newSettings: ReportSettings = {};
    if (lanes.trim()) newSettings.lanes = parseInt(lanes, 10);
    if (yBit.trim()) newSettings.yBit = parseInt(yBit, 10);
    if (corner.trim()) newSettings.corner = corner.trim();

    const currentSettings = document.settings || {};
    const hasChanges =
      newSettings.lanes !== currentSettings.lanes ||
      newSettings.yBit !== currentSettings.yBit ||
      newSettings.corner !== currentSettings.corner;

    if (hasChanges) {
      updateMutation.mutate({ settings: Object.keys(newSettings).length > 0 ? newSettings : undefined });
    }
  };

  const handleTrackMapChange = (file: FileData | null) => {
    setTrackMapFile(file);
    updateMutation.mutate({ trackMapFileId: file?.id || null });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.header.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventName">{t('editor.header.eventName')}</Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              onBlur={() => handleFieldBlur('eventName', eventName)}
              placeholder={t('editor.header.eventNamePlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportDate">{t('editor.header.reportDate')}</Label>
            <Input
              id="reportDate"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              onBlur={() => handleFieldBlur('reportDate', reportDate)}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driverName">{t('editor.header.driverName')}</Label>
            <Input
              id="driverName"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              onBlur={() => handleFieldBlur('driverName', driverName)}
              placeholder={t('editor.header.driverNamePlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackName">{t('editor.header.trackName')}</Label>
            <Input
              id="trackName"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              onBlur={() => handleFieldBlur('trackName', trackName)}
              placeholder={t('editor.header.trackNamePlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.header.settings')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lanes">{t('editor.header.lanes')}</Label>
            <Input
              id="lanes"
              type="number"
              value={lanes}
              onChange={(e) => setLanes(e.target.value)}
              onBlur={handleSettingsBlur}
              placeholder="8"
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yBit">{t('editor.header.yBit')}</Label>
            <Input
              id="yBit"
              type="number"
              value={yBit}
              onChange={(e) => setYBit(e.target.value)}
              onBlur={handleSettingsBlur}
              placeholder="4"
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corner">{t('editor.header.corner')}</Label>
            <Input
              id="corner"
              value={corner}
              onChange={(e) => setCorner(e.target.value)}
              onBlur={handleSettingsBlur}
              placeholder="Left"
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Track Map */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.header.trackMap')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            value={trackMapFile}
            onChange={handleTrackMapChange}
            fileType="TRACK_MAP"
            context={{ documentId: document.id }}
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
