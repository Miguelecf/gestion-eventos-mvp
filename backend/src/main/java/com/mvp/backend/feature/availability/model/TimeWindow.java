package com.mvp.backend.feature.availability.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class TimeWindow {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final LocalDate date;
    private final LocalDateTime start;
    private final LocalDateTime end;

    private TimeWindow(LocalDate date, LocalDateTime start, LocalDateTime end) {
        this.date = date;
        this.start = start;
        this.end = end;
    }

    public static TimeWindow of(LocalDate date, LocalTime from, LocalTime to) {
        if (date == null || from == null || to == null) {
            throw new IllegalArgumentException("date, from and to must be non-null");
        }
        return new TimeWindow(date, date.atTime(from), date.atTime(to));
    }

    public TimeWindow withBuffers(int bufferBeforeMin, int bufferAfterMin) {
        LocalDateTime adjustedStart = start.minusMinutes(bufferBeforeMin);
        LocalDateTime adjustedEnd = end.plusMinutes(bufferAfterMin);
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        if (adjustedStart.isBefore(dayStart)) {
            adjustedStart = dayStart;
        }
        if (adjustedEnd.isAfter(dayEnd)) {
            adjustedEnd = dayEnd;
        }
        return new TimeWindow(date, adjustedStart, adjustedEnd);
    }

    public boolean overlaps(TimeWindow other) {
        return this.start.isBefore(other.end) && other.start.isBefore(this.end);
    }

    public String formattedStart() {
        return format(start, false);
    }

    public String formattedEnd() {
        return format(end, true);
    }

    private String format(LocalDateTime value, boolean isEnd) {
        if (isEnd && value.toLocalTime().equals(LocalTime.MIDNIGHT) && value.toLocalDate().isAfter(date)) {
            return "24:00";
        }
        return value.toLocalTime().format(FORMATTER);
    }
}