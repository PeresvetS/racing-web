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
import type { DocumentFull, FileData } from '@/types';

interface ReportHeaderProps {
  document: DocumentFull;
  onUpdate: () => void;
}

// Компонент использует key prop для сброса состояния при смене документа
export function ReportHeader({ document, onUpdate }: ReportHeaderProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [driverName, setDriverName] = useState(document.driverName);
  const [trackName, setTrackName] = useState(document.trackName);
  const [shortTrackName, setShortTrackName] = useState(document.shortTrackName);
  const [trackLength, setTrackLength] = useState(document.trackLength);
  const [trackWidth, setTrackWidth] = useState(document.trackWidth);
  const [cornerCount, setCornerCount] = useState(document.cornerCount);
  const [reportDate, setReportDate] = useState(
    format(new Date(document.reportDate), 'yyyy-MM-dd')
  );
  const [trackMapFile, setTrackMapFile] = useState<FileData | null>(document.trackMapFile);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof documentsApi.updateReport>[1]) =>
      documentsApi.updateReport(document.id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    },
  });

  const handleFieldBlur = (field: string, value: string) => {
    const originalValue = field === 'driverName' ? document.driverName :
                         field === 'trackName' ? document.trackName :
                         field === 'shortTrackName' ? document.shortTrackName :
                         field === 'trackLength' ? document.trackLength :
                         field === 'trackWidth' ? document.trackWidth :
                         field === 'cornerCount' ? document.cornerCount :
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
            <Label htmlFor="reportDate">{t('editor.header.reportDate')}</Label>
            <Input
              id="reportDate"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              onBlur={() => handleFieldBlur('reportDate', reportDate)}
              disabled={updateMutation.isPending}
              className="h-12 text-lg px-4 cursor-pointer"
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
          <div className="space-y-2">
            <Label htmlFor="shortTrackName">{t('editor.header.shortTrackName')}</Label>
            <Input
              id="shortTrackName"
              value={shortTrackName}
              onChange={(e) => setShortTrackName(e.target.value)}
              onBlur={() => handleFieldBlur('shortTrackName', shortTrackName)}
              placeholder={t('editor.header.shortTrackNamePlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Track Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.header.trackInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trackLength">{t('editor.header.trackLength')}</Label>
            <Input
              id="trackLength"
              value={trackLength}
              onChange={(e) => setTrackLength(e.target.value)}
              onBlur={() => handleFieldBlur('trackLength', trackLength)}
              placeholder={t('editor.header.trackLengthPlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackWidth">{t('editor.header.trackWidth')}</Label>
            <Input
              id="trackWidth"
              value={trackWidth}
              onChange={(e) => setTrackWidth(e.target.value)}
              onBlur={() => handleFieldBlur('trackWidth', trackWidth)}
              placeholder={t('editor.header.trackWidthPlaceholder')}
              disabled={updateMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cornerCount">{t('editor.header.cornerCount')}</Label>
            <Input
              id="cornerCount"
              value={cornerCount}
              onChange={(e) => setCornerCount(e.target.value)}
              onBlur={() => handleFieldBlur('cornerCount', cornerCount)}
              placeholder={t('editor.header.cornerCountPlaceholder')}
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
        <CardContent className="space-y-2">
          <FileUpload
            value={trackMapFile}
            onChange={handleTrackMapChange}
            fileType="TRACK_MAP"
            context={{ documentId: document.id }}
          />
          <p className="text-sm text-muted-foreground">
            {t('editor.header.trackMapHint')}
          </p>
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
