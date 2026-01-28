import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DayEditor } from './day-editor';
import { daysApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { ReportDay } from '@/types';

interface DaysListProps {
  documentId: string;
  days: ReportDay[];
  onUpdate: () => void;
}

export function DaysList({ documentId, days, onUpdate }: DaysListProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeDay, setActiveDay] = useState(days[0]?.id || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<ReportDay | null>(null);

  const createMutation = useMutation({
    mutationFn: () => {
      const nextDayNumber = days.length > 0
        ? Math.max(...days.map(d => d.dayNumber)) + 1
        : 1;
      return daysApi.create(documentId, { dayNumber: nextDayNumber });
    },
    onSuccess: (newDay) => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
      setActiveDay(newDay.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (dayId: string) => daysApi.delete(documentId, dayId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
      setDeleteDialogOpen(false);
      setDayToDelete(null);
      // Переключаемся на первый оставшийся день
      const remainingDays = days.filter(d => d.id !== dayToDelete?.id);
      if (remainingDays.length > 0) {
        setActiveDay(remainingDays[0].id);
      }
    },
  });

  const handleAddDay = () => {
    createMutation.mutate();
  };

  const handleDeleteClick = (day: ReportDay, e: React.MouseEvent) => {
    e.stopPropagation();
    setDayToDelete(day);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (dayToDelete) {
      deleteMutation.mutate(dayToDelete.id);
    }
  };

  if (days.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">{t('editor.days.empty')}</p>
        <Button onClick={handleAddDay} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {t('editor.days.addFirst')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Tabs value={activeDay} onValueChange={setActiveDay} className="space-y-4">
        <div className="flex items-center gap-2">
          <TabsList className="flex-1 h-auto flex-wrap justify-start">
            {days.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className="relative group"
              >
                <span>{t('editor.days.dayNumber', { number: day.dayNumber })}</span>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(day, e)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddDay}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {days.map((day) => (
          <TabsContent key={day.id} value={day.id} className="mt-4">
            <DayEditor
              key={`day-editor-${day.id}-${day.updatedAt}`}
              documentId={documentId}
              day={day}
              onUpdate={onUpdate}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editor.days.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {t('editor.days.deleteConfirm', { number: dayToDelete?.dayNumber })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
