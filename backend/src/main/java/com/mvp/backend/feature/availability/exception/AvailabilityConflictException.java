package com.mvp.backend.feature.availability.exception;

import com.mvp.backend.feature.availability.model.AvailabilityResult;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AvailabilityConflictException extends RuntimeException {

    private final AvailabilityResult result;
    private final HttpStatus status;
    private final boolean publicView;

    private AvailabilityConflictException(AvailabilityResult result, HttpStatus status, boolean publicView) {
        super("Availability conflict");
        this.result = result;
        this.status = status;
        this.publicView = publicView;
    }

    public static AvailabilityConflictException internalConflict(AvailabilityResult result) {
        return new AvailabilityConflictException(result, HttpStatus.CONFLICT, false);
    }

    public static AvailabilityConflictException publicConflict(AvailabilityResult result) {
        return new AvailabilityConflictException(result, HttpStatus.CONFLICT, true);
    }
}