import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Upload } from 'lucide-react';
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
  maxLatG: string;
  maxLonG: string;
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
      maxLatG: existing?.maxLatG?.toString() || '',
      maxLonG: existing?.maxLonG?.toString() || '',
    };
  });
}

export function TelemetryTable({ dayId, sessions, onUpdate }: TelemetryTableProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<SessionRow[]>(() => createInitialRows(sessions));
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingStation, setUploadingStation] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetStationRef = useRef<number | null>(null);

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
          row.minSpeedKmh.trim() ||
          row.maxLatG.trim() ||
          row.maxLonG.trim()
        );
      })
      .map((row) => ({
        station: row.station,
        bestLaps: parseInteger(row.bestLaps),
        lapTime: row.lapTime.trim() || null,
        maxRpm: parseInteger(row.maxRpm),
        maxSpeedKmh: parseNumber(row.maxSpeedKmh),
        minSpeedKmh: parseNumber(row.minSpeedKmh),
        maxLatG: parseNumber(row.maxLatG),
        maxLonG: parseNumber(row.maxLonG),
      }));

    updateMutation.mutate(sessionsToSave);
  };

  const handleImportClick = (station: number) => {
    targetStationRef.current = station;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const station = targetStationRef.current;
    if (!file || !station) return;

    e.target.value = '';
    setUploadingStation(station);

    try {
      const result = await telemetryApi.importCsv(dayId, file, station);
      // Обновляем локальную строку всеми полями из response
      setRows((prev) =>
        prev.map((row) =>
          row.station === station
            ? {
                ...row,
                bestLaps: result.summary.totalLaps.toString(),
                lapTime: result.summary.bestLapTime,
                maxSpeedKmh: result.summary.maxSpeedKmh.toString(),
                minSpeedKmh: result.summary.minSpeedKmh.toString(),
                maxLatG: result.summary.maxLatG.toString(),
                maxLonG: result.summary.maxLonG.toString(),
              }
            : row,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ['document'] });
      onUpdate();
    } catch (err) {
      console.error('Failed to import:', err);
    } finally {
      setUploadingStation(null);
      targetStationRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

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
              <th className="border px-3 py-2 text-left text-sm font-medium w-16">
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
              <th className="border px-3 py-2 text-left text-sm font-medium">
                {t('editor.telemetry.maxLatG')}
              </th>
              <th className="border px-3 py-2 text-left text-sm font-medium">
                {t('editor.telemetry.maxLonG')}
              </th>
              <th className="border px-3 py-2 text-center text-sm font-medium w-16">
                CSV
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
                <td className="border p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={row.maxLatG}
                    onChange={(e) => handleChange(row.station, 'maxLatG', e.target.value)}
                    className="h-8"
                    placeholder="0.00"
                  />
                </td>
                <td className="border p-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={row.maxLonG}
                    onChange={(e) => handleChange(row.station, 'maxLonG', e.target.value)}
                    className="h-8"
                    placeholder="0.00"
                  />
                </td>
                <td className="border p-1 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleImportClick(row.station)}
                    disabled={uploadingStation !== null}
                    title={t('editor.telemetry.importToRow')}
                  >
                    {uploadingStation === row.station ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
