package com.mvp.backend.feature.auth.exception;

public class EmailDeliveryException extends RuntimeException {
    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
