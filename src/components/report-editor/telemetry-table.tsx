import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { telemetryApi } from '@/services/api';
import { useI18n } from '@/context/i18n-context';
import type { TelemetrySession, UpdateTelemetrySessionDto } from '@/types';

interface TelemetryTableProps {
  dayId: string;
  sessions: TelemetrySession[];
  onUpdate: () => void;
}

interface SessionRow {
  station: number;
  bestLaps: string;
  lapTime: string;
  maxRpm: string;
  maxSpeedKmh: string;
  minSpeedKmh: string;
}

const STATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function parseInteger(value: string): number | null {
  if (!value.trim()) return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}

function createInitialRows(sessions: TelemetrySession[]): SessionRow[] {
  return STATIONS.map((station) => {
    const existing = sessions.find((s) => s.station === station);
    return {
      station,
      bestLaps: existing?.bestLaps?.toString() || '',
      lapTime: existing?.lapTime || '',
      maxRpm: existing?.maxRpm?.toString() || '',
      maxSpeedKmh: existing?.maxSpeedKmh?.toString() || '',
      minSpeedKmh: existing?.minSpeedKmh?.toString() || '',
    };
  });
}

export function TelemetryTable({ dayId, sessions, onUpdate }: TelemetryTableProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<SessionRow[]>(() => createInitialRows(sessions));
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (sessionsData: UpdateTelemetrySessionDto[]) =>
      telemetryApi.batchUpdate(dayId, { sessions: sessionsData }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
      setHasChanges(false);
    },
  });

  const handleChange = (station: number, field: keyof Omit<SessionRow, 'station'>, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.station === station ? { ...row, [field]: value } : row)),
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    const sessionsToSave: UpdateTelemetrySessionDto[] = rows
      .filter((row) => {
        // Сохраняем только заполненные строки
        return (
          row.bestLaps.trim() ||
          row.lapTime.trim() ||
          row.maxSpeedKmh.trim() ||
          row.minSpeedKmh.trim()
        );
      })
      .map((row) => ({
        station: row.station,
        bestLaps: parseInteger(row.bestLaps),
        lapTime: row.lapTime.trim() || null,
        maxRpm: parseInteger(row.maxRpm),
        maxSpeedKmh: parseNumber(row.maxSpeedKmh),
        minSpeedKmh: parseNumber(row.minSpeedKmh),
      }));

    updateMutation.mutate(sessionsToSave);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {t('common.save')}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border px-3 py-2 text-left text-sm font-medium">
                {t('editor.telemetry.station')}
              </th>
              <th className="border px-3 py-2 text-left text-sm font-medium">
                {t('editor.telemetry.bestLaps')}
              </th>
              <th className="border px-3 py-2 text-left text-sm font-medium">
                {t('editor.telemetry.lapTime')}
              </th>
              <th className="border px-3 py-2 text-left text-sm font-medium">
                {t('editor.telemetry.maxSpeed')}
              </th>
              <th className="border px-3 py-2 text-left text-sm font-medium">
                {t('editor.telemetry.minSpeed')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.station} className="hover:bg-muted/50">
                <td className="border px-3 py-2 text-sm font-medium">{row.station}</td>
                <td className="border p-1">
                  <Input
                    type="number"
                    value={row.bestLaps}
                    onChange={(e) => handleChange(row.station, 'bestLaps', e.target.value)}
                    className="h-8"
                    placeholder="0"
                  />
                </td>
                <td className="border p-1">
                  <Input
                    type="text"
                    value={row.lapTime}
                    onChange={(e) => handleChange(row.station, 'lapTime', e.target.value)}
                    className="h-8"
                    placeholder="0:00.000"
                  />
                </td>
                <td className="border p-1">
                  <Input
                    type="number"
                    step="0.1"
                    value={row.maxSpeedKmh}
                    onChange={(e) => handleChange(row.station, 'maxSpeedKmh', e.target.value)}
                    className="h-8"
                    placeholder="0.0"
                  />
                </td>
                <td className="border p-1">
                  <Input
                    type="number"
                    step="0.1"
                    value={row.minSpeedKmh}
                    onChange={(e) => handleChange(row.station, 'minSpeedKmh', e.target.value)}
                    className="h-8"
                    placeholder="0.0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
