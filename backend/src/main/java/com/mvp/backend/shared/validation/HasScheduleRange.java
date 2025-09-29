package com.mvp.backend.shared.validation;

import java.time.LocalTime;

public interface HasScheduleRange {
    LocalTime scheduleFrom();
    LocalTime scheduleTo();
}