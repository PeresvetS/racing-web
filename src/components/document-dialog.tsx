import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { documentsApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { Document } from '@/types';

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

function DocumentDialogContent({
  document,
  onOpenChange,
}: {
  document: Document | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(document?.title || '');
  const [description, setDescription] = useState(document?.description || '');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: documentsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      onOpenChange(false);
    },
    onError: () => {
      setError(t('documents.dialog.createError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string } }) =>
      documentsApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      onOpenChange(false);
    },
    onError: () => {
      setError(t('documents.dialog.updateError'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('documents.dialog.titleRequired'));
      return;
    }

    if (document) {
      updateMutation.mutate({
        id: document.id,
        data: { title: title.trim(), description: description.trim() || undefined },
      });
    } else {
      createMutation.mutate({
        title: title.trim(),
        description: description.trim() || undefined,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {document ? t('documents.dialog.editTitle') : t('documents.dialog.createTitle')}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('documents.dialog.titleLabel')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('documents.dialog.titlePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('documents.dialog.descriptionLabel')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('documents.dialog.descriptionPlaceholder')}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t('documents.dialog.saving')
              : document
                ? t('common.save')
                : t('common.create')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function DocumentDialog({ open, onOpenChange, document }: DocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <DocumentDialogContent document={document} onOpenChange={onOpenChange} />}
    </Dialog>
  );
}
