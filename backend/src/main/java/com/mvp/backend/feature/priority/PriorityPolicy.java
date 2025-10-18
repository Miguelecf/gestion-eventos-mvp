package com.mvp.backend.feature.priority;

import com.mvp.backend.shared.Priority;
import org.springframework.stereotype.Component;

@Component
public class PriorityPolicy {

    public Priority derivePriority(String requestingArea, Priority requested) {
        if (requestingArea != null && requestingArea.equalsIgnoreCase("Rectorado")) {
            return Priority.HIGH;
        }
        return requested != null ? requested : Priority.MEDIUM;
    }

    public boolean isHigher(Priority candidate, Priority other) {
        if (candidate == null || other == null) {
            return false;
        }
        return candidate.ordinal() > other.ordinal();
    }
}