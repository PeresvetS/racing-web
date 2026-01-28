import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from './file-upload';
import { documentsApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { DocumentFull, FileData } from '@/types';

interface SeeYouSoonSectionProps {
  document: DocumentFull;
  onUpdate: () => void;
}

// Компонент использует key prop для сброса состояния при смене документа
export function SeeYouSoonSection({ document, onUpdate }: SeeYouSoonSectionProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [seeYouSoonFile, setSeeYouSoonFile] = useState<FileData | null>(document.seeYouSoonFile);

  const updateMutation = useMutation({
    mutationFn: (fileId: string | null) =>
      documentsApi.updateReport(document.id, { seeYouSoonFileId: fileId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    },
  });

  const handleFileChange = (file: FileData | null) => {
    setSeeYouSoonFile(file);
    updateMutation.mutate(file?.id || null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editor.seeYouSoon.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('editor.seeYouSoon.description', { name: document.driverName })}
        </p>
        <FileUpload
          value={seeYouSoonFile}
          onChange={handleFileChange}
          fileType="SEE_YOU_SOON"
          context={{ documentId: document.id }}
        />
      </CardContent>
    </Card>
  );
}
