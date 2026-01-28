import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from './file-upload';
import { remarksApi, filesApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { Remark, FileData } from '@/types';

interface RemarkItemProps {
  dayId: string;
  remark: Remark;
  onUpdate: () => void;
  onDelete: () => void;
}

export function RemarkItem({ dayId, remark, onUpdate, onDelete }: RemarkItemProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [text, setText] = useState(remark.text);
  const [imageFile, setImageFile] = useState<FileData | null>(remark.imageFile);
  const [hasTextChanges, setHasTextChanges] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: { text?: string; imageFileId?: string | null }) =>
      remarksApi.update(dayId, remark.id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
      setHasTextChanges(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => remarksApi.delete(dayId, remark.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onDelete();
    },
  });

  const handleTextBlur = () => {
    if (hasTextChanges && text.trim() !== remark.text) {
      updateMutation.mutate({ text: text.trim() });
    }
  };

  const handleImageChange = (file: FileData | null) => {
    setImageFile(file);
    updateMutation.mutate({ imageFileId: file?.id || null });
  };

  const handleDelete = async () => {
    // Если есть изображение, удаляем его сначала
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

      <div className="flex-1 space-y-3">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setHasTextChanges(true);
          }}
          onBlur={handleTextBlur}
          placeholder={t('editor.remarks.textPlaceholder')}
          rows={3}
          disabled={isLoading}
        />

        <FileUpload
          value={imageFile}
          onChange={handleImageChange}
          fileType="REMARK"
          context={{ dayId, remarkId: remark.id }}
          className="h-32"
        />
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
