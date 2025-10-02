package com.mvp.backend.feature.requests.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target(TYPE)
@Retention(RUNTIME)
@Documented
@Constraint(validatedBy = XorLocationValidator.class)
public @interface XorLocation {
    String message() default "Either spaceId or freeLocation must be provided, but not both";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}