import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from './file-upload';
import { reportSlidesApi, filesApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { ReportSlide, FileData } from '@/types';

interface ReportSlideItemProps {
  documentId: string;
  dayId: string;
  slide: ReportSlide;
  onUpdate: () => void;
  onDelete: () => void;
}

export function ReportSlideItem({ documentId, dayId, slide, onUpdate, onDelete }: ReportSlideItemProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [content, setContent] = useState(slide.content);
  const [imageFile, setImageFile] = useState<FileData | null>(slide.imageFile);
  const [hasContentChanges, setHasContentChanges] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: { content?: string; imageFileId?: string | null }) =>
      reportSlidesApi.update(dayId, slide.id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
      setHasContentChanges(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reportSlidesApi.delete(dayId, slide.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onDelete();
    },
  });

  const handleContentBlur = () => {
    if (hasContentChanges && content !== slide.content) {
      updateMutation.mutate({ content });
    }
  };

  const handleImageChange = (file: FileData | null) => {
    setImageFile(file);
    updateMutation.mutate({ imageFileId: file?.id || null });
  };

  const handleDelete = async () => {
    if (imageFile) {
      try {
        await filesApi.delete(imageFile.id);
      } catch {
        // Игнорируем ошибку удаления файла
      }
    }
    deleteMutation.mutate();
  };

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex gap-3 p-4 border rounded-lg bg-card">
      <div className="flex items-start pt-2 cursor-move text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {t('editor.reportSlides.image')}
          </label>
          <FileUpload
            value={imageFile}
            onChange={handleImageChange}
            fileType="REPORT_SLIDE"
            context={{ documentId, dayId }}
            className="h-40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {t('editor.reportSlides.content')}
          </label>
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setHasContentChanges(true);
            }}
            onBlur={handleContentBlur}
            placeholder={t('editor.reportSlides.contentPlaceholder')}
            rows={6}
            disabled={isLoading}
            className="resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t('editor.reportSlides.contentHint')}
          </p>
        </div>
      </div>

      <div className="flex items-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isLoading}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
