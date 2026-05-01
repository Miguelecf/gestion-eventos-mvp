import type { EventContentArg, MoreLinkContentArg } from '@fullcalendar/core';

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
  const space = getStringValue(eventInfo.event.extendedProps.space);
  const title = eventInfo.event.title;
  const displayTime = isMonthView ? formatStartTime(eventInfo) : eventInfo.timeText;
  const tooltip = [eventInfo.timeText || displayTime, title, space].filter(Boolean).join(' | ');

  return (
    <div
      className={[
        'event-fc-color',
        'calendar-event-content',
        isMonthView ? 'calendar-event-content--month' : 'calendar-event-content--time',
        `fc-bg-${color}`,
      ].join(' ')}
      title={tooltip}
      aria-label={tooltip}
    >
      <div className="calendar-event-main-line">
        {displayTime ? (
          <span className="fc-event-time calendar-event-time">{displayTime}</span>
        ) : null}
        <span className="fc-event-title calendar-event-title">{title}</span>
      </div>

      {space ? (
        <div className="fc-event-location calendar-event-location">{space}</div>
      ) : null}
    </div>
  );
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

function formatStartTime(eventInfo: EventContentArg): string {
  if (!eventInfo.event.start) {
    return eventInfo.timeText;
  }

  return timeFormatter.format(eventInfo.event.start);
}
