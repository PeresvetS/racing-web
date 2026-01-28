import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportEditor } from '@/components/report-editor';
import { useI18n } from '@/context/i18n-context';
import { documentsApi } from '@/services/api';

export function ReportEditorPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPptx = async () => {
    if (!id) return;

    setIsExporting(true);
    try {
      const blob = await documentsApi.downloadPptx(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'report.pptx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

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
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('editor.backToDocuments')}
          </Button>
          <Button
            onClick={() => void handleExportPptx()}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t('editor.exportPptx')}
          </Button>
        </div>
        <h1 className="text-2xl font-bold">{t('editor.pageTitle')}</h1>
      </div>
      <ReportEditor documentId={id} />
    </div>
  );
}
