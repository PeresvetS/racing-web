import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { filesApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { FileData, FileType } from '@/types';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value: FileData | null;
  onChange: (file: FileData | null) => void;
  fileType: FileType;
  context?: { documentId?: string; dayId?: string };
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  fileType,
  context,
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
}: FileUploadProps) {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => filesApi.upload(file, fileType, context),
    onSuccess: (data) => {
      onChange(data);
      setError(null);
    },
    onError: () => {
      setError(t('editor.fileUpload.uploadError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      onChange(null);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setError(null);
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
    [uploadMutation],
  );

  const onDropRejected = useCallback(() => {
    setError(t('editor.fileUpload.invalidFile'));
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxSize,
    multiple: false,
    disabled: uploadMutation.isPending,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      deleteMutation.mutate(value.id);
    }
  };

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  if (value) {
    return (
      <div className={cn('relative rounded-lg border border-border overflow-hidden', className)}>
        <img
          src={value.url}
          alt={value.filename}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                {t('common.remove')}
              </>
            )}
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
          {value.filename}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
        isLoading && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">{t('editor.fileUpload.uploading')}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <ImageIcon className="h-10 w-10 text-primary" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? t('editor.fileUpload.dropHere') : t('editor.fileUpload.dragOrClick')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('editor.fileUpload.maxSize', { size: '10MB' })}
            </p>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
