package com.mvp.backend.feature.requests.validation;

import com.mvp.backend.shared.validation.HasLocationChoice;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class XorLocationValidator implements ConstraintValidator<XorLocation, HasLocationChoice> {
    @Override
    public boolean isValid(HasLocationChoice value, ConstraintValidatorContext context) {
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