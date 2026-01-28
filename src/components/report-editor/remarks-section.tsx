import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RemarkItem } from './remark-item';
import { remarksApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { Remark } from '@/types';

interface RemarksSectionProps {
  dayId: string;
  remarks: Remark[];
  onUpdate: () => void;
}

export function RemarksSection({ dayId, remarks, onUpdate }: RemarksSectionProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => remarksApi.create(dayId, { text: '' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    },
  });

  const handleAddRemark = () => {
    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('editor.remarks.title')}</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddRemark}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {t('editor.remarks.add')}
        </Button>
      </div>

      {remarks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
          <p>{t('editor.remarks.empty')}</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddRemark}
            disabled={createMutation.isPending}
            className="mt-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {t('editor.remarks.addFirst')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {remarks.map((remark) => (
            <RemarkItem
              key={remark.id}
              dayId={dayId}
              remark={remark}
              onUpdate={onUpdate}
              onDelete={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
