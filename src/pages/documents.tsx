import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, Pencil, Trash2, FileText, FileEdit, Archive, ArchiveRestore } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { documentsApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import { useDebounce } from '@/hooks/use-debounce';
import type { Document, DocumentStatus } from '@/types';
import { DocumentDialog } from '@/components/document-dialog';

const statusColors: Record<DocumentStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  GENERATED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function DocumentsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', debouncedSearch, page],
    queryFn: () => documentsApi.getAll({ search: debouncedSearch || undefined, page, limit: 9 }),
  });

  const deleteMutation = useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DocumentStatus }) =>
      documentsApi.update(id, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await documentsApi.downloadPptx(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Обновить статус если документ был DRAFT
      if (doc.status === 'DRAFT') {
        updateStatusMutation.mutate({ id: doc.id, status: 'GENERATED' });
      }
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const handleArchive = (id: string) => {
    if (window.confirm(t('documents.archiveConfirm'))) {
      updateStatusMutation.mutate({ id, status: 'ARCHIVED' });
    }
  };

  const handleUnarchive = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'GENERATED' });
  };

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('documents.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDocument(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getStatusLabel = (status: DocumentStatus): string => {
    return t(`documents.status.${status}` as const);
  };

  const formatDate = (dateString: string): string => {
    const localeMap: Record<string, string> = {
      ru: 'ru-RU',
      en: 'en-US',
      ee: 'et-EE',
    };
    return new Date(dateString).toLocaleDateString(localeMap[locale] || 'ru-RU');
  };

  return (
    <div className="flex flex-col">
      <Header title={t('documents.title')} />
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder={t('documents.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:max-w-sm"
          />
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t('documents.createDocument')}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground">{t('common.loading')}</div>
        ) : !data?.items.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t('documents.noDocuments')}</p>
              <Button variant="outline" className="mt-4" onClick={handleCreate}>
                {t('documents.createFirst')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((doc) => (
              <Card key={doc.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[doc.status]}`}
                    >
                      {getStatusLabel(doc.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {doc.description || t('documents.noDescription')}
                  </p>
                  <p className="mb-4 text-xs text-muted-foreground">
                    {t('documents.createdAt')}: {formatDate(doc.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/documents/${doc.id}/edit`)}
                      className="flex-1 sm:flex-none"
                    >
                      <FileEdit className="mr-1 h-4 w-4" />
                      <span className="hidden xs:inline">{t('documents.editReport')}</span>
                      <span className="xs:hidden">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDownload(doc)}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      <span className="hidden xs:inline">{t('documents.download')}</span>
                      <span className="xs:hidden">PPTX</span>
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {doc.status === 'ARCHIVED' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnarchive(doc.id)}
                          disabled={updateStatusMutation.isPending}
                          title={t('documents.unarchive')}
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchive(doc.id)}
                          disabled={updateStatusMutation.isPending}
                          title={t('documents.archive')}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <DocumentDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        document={editingDocument}
      />
    </div>
  );
}
