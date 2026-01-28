import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ReportHeader } from './report-header';
import { DaysList } from './days-list';
import { SeeYouSoonSection } from './see-you-soon-section';
import { documentsApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';

interface ReportEditorProps {
  documentId: string;
}

export function ReportEditor({ documentId }: ReportEditorProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentsApi.getFull(documentId),
  });

  const handleUpdate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['document', documentId] });
  }, [queryClient, documentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t('editor.loadError')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with basic info and track map */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t('editor.sections.header')}</h2>
        <ReportHeader document={document} onUpdate={handleUpdate} />
      </section>

      {/* Days */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t('editor.sections.days')}</h2>
        <DaysList
          documentId={documentId}
          days={document.days}
          onUpdate={handleUpdate}
        />
      </section>

      {/* See You Soon */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t('editor.sections.seeYouSoon')}</h2>
        <SeeYouSoonSection document={document} onUpdate={handleUpdate} />
      </section>
    </div>
  );
}
