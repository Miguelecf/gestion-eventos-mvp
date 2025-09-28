package com.mvp.backend.feature.requests.validation;

import com.mvp.backend.feature.requests.dto.CreateEventRequestDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class XorLocationValidator implements ConstraintValidator<XorLocation, CreateEventRequestDto> {
    @Override
    public boolean isValid(CreateEventRequestDto value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        boolean hasSpaceId = value.spaceId() != null;
        boolean hasFreeLocation = value.freeLocation() != null && !value.freeLocation().isBlank();

        boolean valid = hasSpaceId ^ hasFreeLocation;
        if (!valid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                    .addPropertyNode(hasSpaceId ? "free_location" : "space_id")
                    .addConstraintViolation();
        }
        return valid;
    }
}