import type { EventContentArg, EventMountArg, MoreLinkContentArg } from '@fullcalendar/core';

type CalendarEventColor = 'danger' | 'success' | 'primary' | 'warning';

const VALID_EVENT_COLORS = new Set<CalendarEventColor>([
  'danger',
  'success',
  'primary',
  'warning',
]);

const timeFormatter = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const calendarEventKeyboardHandlers = new WeakMap<HTMLElement, (event: KeyboardEvent) => void>();

export function getPriorityCalendarColor(priority?: string): CalendarEventColor {
  switch (priority) {
    case 'HIGH':
      return 'danger';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'primary';
    default:
      return 'success';
  }
}

export function getCalendarEventClassNames(eventInfo: EventContentArg): string[] {
  const color = normalizeEventColor(eventInfo.event.extendedProps.calendar);
  const densityClass =
    eventInfo.view.type === 'dayGridMonth'
      ? 'calendar-event-shell--month'
      : 'calendar-event-shell--time';

  return [`fc-bg-${color}`, densityClass];
}

export function renderCalendarMoreLinkContent(moreLinkInfo: MoreLinkContentArg) {
  return <span className="calendar-more-link-content">+{moreLinkInfo.num} más</span>;
}

export function renderCalendarEventContent(eventInfo: EventContentArg) {
  const isMonthView = eventInfo.view.type === 'dayGridMonth';
  const color = normalizeEventColor(eventInfo.event.extendedProps.calendar);
  const { accessibilityLabel, locationLabel, timeRange, titleLabel, tooltip } =
    getCalendarEventDisplayInfo(eventInfo);

  return (
    <div
      className={[
        'event-fc-color',
        'calendar-event-content',
        isMonthView ? 'calendar-event-content--month' : 'calendar-event-content--time',
        `fc-bg-${color}`,
      ].join(' ')}
      title={tooltip}
      aria-label={accessibilityLabel}
    >
      <div className="calendar-event-time-line">
        <span className="fc-event-time calendar-event-time">{timeRange}</span>
      </div>

      <div className="fc-event-location calendar-event-location">{locationLabel}</div>
      <div className="fc-event-title calendar-event-title">{titleLabel}</div>
    </div>
  );
}

export function applyCalendarEventAccessibility(eventInfo: EventMountArg) {
  const { accessibilityLabel, tooltip } = getCalendarEventDisplayInfo(eventInfo);

  eventInfo.el.setAttribute('aria-label', accessibilityLabel);
  eventInfo.el.setAttribute('title', tooltip);
}

export function applyInteractiveCalendarEventAccessibility(eventInfo: EventMountArg) {
  applyCalendarEventAccessibility(eventInfo);
  removeInteractiveCalendarEventAccessibility(eventInfo);

  eventInfo.el.setAttribute('role', 'button');
  eventInfo.el.setAttribute('tabindex', '0');

  const keyboardHandler = (keyboardEvent: KeyboardEvent) => {
    if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') {
      return;
    }

    keyboardEvent.preventDefault();
    eventInfo.el.click();
  };

  calendarEventKeyboardHandlers.set(eventInfo.el, keyboardHandler);
  eventInfo.el.addEventListener('keydown', keyboardHandler);
}

export function removeInteractiveCalendarEventAccessibility(eventInfo: { el: HTMLElement }) {
  const keyboardHandler = calendarEventKeyboardHandlers.get(eventInfo.el);

  if (!keyboardHandler) {
    return;
  }

  eventInfo.el.removeEventListener('keydown', keyboardHandler);
  calendarEventKeyboardHandlers.delete(eventInfo.el);
}

export function getCalendarEventDisplayInfo(eventInfo: {
  event: EventContentArg['event'];
  timeText?: string;
}) {
  const { event } = eventInfo;
  const extendedProps = event.extendedProps;
  const titleLabel =
    getStringValue(event.title) ||
    getStringValue(extendedProps.name) ||
    getStringValue(extendedProps.title) ||
    'Evento sin título';
  const locationLabel =
    getLocationLabel(extendedProps.space) ||
    getLocationLabel(extendedProps.spaceName) ||
    getStringValue(extendedProps.freeLocation) ||
    'Ubicación sin definir';
  const startTime = getDisplayTime(extendedProps.scheduleFrom) || formatDateTime(event.start);
  const endTime = getDisplayTime(extendedProps.scheduleTo) || formatDateTime(event.end);
  const timeRange = getTimeRange({
    allDay: event.allDay,
    endTime,
    fallbackTimeText: eventInfo.timeText,
    startTime,
  });
  const accessibilityLabel = getAccessibilityLabel({
    allDay: event.allDay,
    endTime,
    locationLabel,
    startTime,
    titleLabel,
  });
  const tooltip = getTooltip({
    accessibilityLabel,
    department: getStringValue(extendedProps.department),
    priority: getStringValue(extendedProps.priority),
    status: getStringValue(extendedProps.status),
    audienceType: getStringValue(extendedProps.audienceType),
    requiresTech: getBooleanLabel(extendedProps.requiresTech),
  });

  return {
    accessibilityLabel,
    locationLabel,
    timeRange,
    titleLabel,
    tooltip,
  };
}

function normalizeEventColor(value: unknown): CalendarEventColor {
  if (typeof value === 'string' && VALID_EVENT_COLORS.has(value as CalendarEventColor)) {
    return value as CalendarEventColor;
  }

  return 'success';
}

function getStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getLocationLabel(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (!value || typeof value !== 'object' || !('name' in value)) {
    return '';
  }

  return getStringValue((value as { name?: unknown }).name);
}

function getDisplayTime(value: unknown): string {
  const rawValue = getStringValue(value);

  if (!rawValue) {
    return '';
  }

  const timeMatch = rawValue.match(/^(\d{1,2}):(\d{2})/);

  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }

  return formatDateTime(new Date(rawValue));
}

function formatDateTime(value: Date | null): string {
  if (!value || Number.isNaN(value.getTime())) {
    return '';
  }

  return timeFormatter.format(value);
}

function getTimeRange({
  allDay,
  endTime,
  fallbackTimeText,
  startTime,
}: {
  allDay: boolean;
  endTime: string;
  fallbackTimeText?: string;
  startTime: string;
}): string {
  if (allDay) {
    return 'Todo el día';
  }

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`;
  }

  return startTime || getStringValue(fallbackTimeText) || 'Horario sin definir';
}

function getAccessibilityLabel({
  allDay,
  endTime,
  locationLabel,
  startTime,
  titleLabel,
}: {
  allDay: boolean;
  endTime: string;
  locationLabel: string;
  startTime: string;
  titleLabel: string;
}): string {
  if (allDay) {
    return `Evento ${titleLabel}, durante todo el día, en ${locationLabel}`;
  }

  if (startTime && endTime) {
    return `Evento ${titleLabel}, de ${startTime} a ${endTime}, en ${locationLabel}`;
  }

  if (startTime) {
    return `Evento ${titleLabel}, desde ${startTime}, en ${locationLabel}`;
  }

  return `Evento ${titleLabel}, con horario sin definir, en ${locationLabel}`;
}

function getTooltip({
  accessibilityLabel,
  audienceType,
  department,
  priority,
  requiresTech,
  status,
}: {
  accessibilityLabel: string;
  audienceType: string;
  department: string;
  priority: string;
  requiresTech: string;
  status: string;
}): string {
  return [
    accessibilityLabel,
    status ? `Estado: ${status}` : '',
    department ? `Departamento: ${department}` : '',
    audienceType ? `Tipo de audiencia: ${audienceType}` : '',
    priority ? `Prioridad: ${priority}` : '',
    requiresTech ? `Requiere técnica: ${requiresTech}` : '',
  ]
    .filter(Boolean)
    .join(' | ');
}

function getBooleanLabel(value: unknown): string {
  if (typeof value !== 'boolean') {
    return '';
  }

  return value ? 'Sí' : 'No';
}
