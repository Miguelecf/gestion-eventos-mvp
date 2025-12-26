package com.mvp.backend.feature.notifications.event;

import java.time.LocalDate;
import java.time.LocalTime;

public record EventRescheduledEmailEvent(
                Long eventId,
                LocalDate previousDate,
                LocalTime previousFrom,
                LocalTime previousTo,
                Long previousSpaceId,
                String previousFreeLocation) {
}
