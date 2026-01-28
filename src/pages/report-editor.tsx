import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportEditor } from '@/components/report-editor';
import { useI18n } from '@/context/i18n-context';

export function ReportEditorPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t('editor.noDocument')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/documents')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('editor.backToDocuments')}
        </Button>
        <h1 className="text-2xl font-bold">{t('editor.pageTitle')}</h1>
      </div>
      <ReportEditor documentId={id} />
    </div>
  );
}
