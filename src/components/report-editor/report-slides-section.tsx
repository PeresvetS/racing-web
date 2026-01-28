import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportSlideItem } from './report-slide-item';
import { reportSlidesApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { ReportSlide } from '@/types';

interface ReportSlidesSectionProps {
  documentId: string;
  dayId: string;
  slides: ReportSlide[];
  onUpdate: () => void;
}

export function ReportSlidesSection({ documentId, dayId, slides, onUpdate }: ReportSlidesSectionProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => reportSlidesApi.create(dayId, { content: '## New Slide\n\nYour content here...' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    },
  });

  const handleAddSlide = () => {
    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('editor.reportSlides.title')}</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddSlide}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {t('editor.reportSlides.add')}
        </Button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
          <p>{t('editor.reportSlides.empty')}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddSlide}
            disabled={createMutation.isPending}
            className="mt-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {t('editor.reportSlides.addFirst')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <ReportSlideItem
              key={slide.id}
              documentId={documentId}
              dayId={dayId}
              slide={slide}
              onUpdate={onUpdate}
              onDelete={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
