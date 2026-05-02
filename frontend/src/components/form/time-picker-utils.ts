const TIME_VALUE_REGEX = /^(\d{1,2}):([0-5]\d)$/;

export type GenerateTimeOptionsParams = {
  minTime?: string | null;
  maxTime?: string | null;
  stepMinutes?: number;
};

function getSafeStepMinutes(stepMinutes?: number): number {
  if (!Number.isFinite(stepMinutes) || !stepMinutes || stepMinutes <= 0) {
    return 15;
  }

  return Math.max(1, Math.floor(stepMinutes));
}

export function normalizeTimeValue(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(TIME_VALUE_REGEX);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function parseTimeToMinutes(value?: string | null): number | null {
  const normalizedValue = normalizeTimeValue(value);
  if (!normalizedValue) {
    return null;
  }

  const [hours, minutes] = normalizedValue.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesAsTime(value: number): string {
  const boundedValue = Math.max(0, Math.min(1439, Math.floor(value)));
  const hours = Math.floor(boundedValue / 60);
  const minutes = boundedValue % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function generateTimeOptions({
  minTime = '00:00',
  maxTime = '23:59',
  stepMinutes = 15,
}: GenerateTimeOptionsParams = {}): string[] {
  const minMinutes = parseTimeToMinutes(minTime) ?? 0;
  const maxMinutes = parseTimeToMinutes(maxTime) ?? 1439;
  const safeStepMinutes = getSafeStepMinutes(stepMinutes);

  if (minMinutes > maxMinutes) {
    return [];
  }

  const options: string[] = [];

  for (let minutes = minMinutes; minutes <= maxMinutes; minutes += safeStepMinutes) {
    options.push(formatMinutesAsTime(minutes));
  }

  return options;
}

export function getNextTimeOption(value?: string | null, stepMinutes = 15): string | undefined {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) {
    return undefined;
  }

  const safeStepMinutes = getSafeStepMinutes(stepMinutes);
  const nextMinutes = Math.floor(minutes / safeStepMinutes) * safeStepMinutes + safeStepMinutes;

  return nextMinutes <= 1439 ? formatMinutesAsTime(nextMinutes) : undefined;
}

export function getTimeRangeDurationLabel(start?: string | null, end?: string | null): string | null {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }

  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}
