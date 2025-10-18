package com.mvp.backend.feature.tech.exception;

public class TechCapacityExceededException extends RuntimeException {
    public TechCapacityExceededException(String message) {
        super(message);
    }
}