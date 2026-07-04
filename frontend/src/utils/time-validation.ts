export const TIME_FORMAT_ERROR_MESSAGE = 'La hora debe estar en formato HH:mm (ej: 14:30)';
export const START_TIME_REQUIRED_MESSAGE = 'La hora de inicio es obligatoria';
export const END_TIME_REQUIRED_MESSAGE = 'La hora de fin es obligatoria';
export const END_AFTER_START_TIME_MESSAGE = 'La hora de fin debe ser posterior a la hora de inicio';

const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const EMPTY_TIME_VALUES = new Set(['', '--:--']);

export function normalizeTimeInput(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmedValue = value.trim();
  return EMPTY_TIME_VALUES.has(trimmedValue) ? '' : trimmedValue;
}

export function isValidTimeFormat(value: string): boolean {
  return TIME_FORMAT_REGEX.test(value);
}

export function timeToMinutes(value: string): number {
  if (!isValidTimeFormat(value)) {
    throw new Error(TIME_FORMAT_ERROR_MESSAGE);
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isEndAfterStart(startTime: string, endTime: string): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }

  return timeToMinutes(endTime) > timeToMinutes(startTime);
}
