package com.mvp.backend.feature.requests.validation;

import com.mvp.backend.feature.requests.dto.CreateEventRequestDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalTime;

public class TimeRangeValidator implements ConstraintValidator<TimeRange, CreateEventRequestDto> {
    @Override
    public boolean isValid(CreateEventRequestDto value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        LocalTime from = value.scheduleFrom();
        LocalTime to = value.scheduleTo();

        if (from == null || to == null) {
            return true;
        }

        boolean valid = from.isBefore(to);
        if (!valid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                    .addPropertyNode("scheduleFrom")
                    .addConstraintViolation();
        }

        return valid;
    }
}