package com.mvp.backend.feature.tech.controller;

import com.mvp.backend.feature.tech.dto.TechCapacityResponse;
import com.mvp.backend.feature.tech.dto.TechEventResponse;
import com.mvp.backend.feature.tech.service.TechCapacityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/internal/tech")
@RequiredArgsConstructor
public class TechCapacityController {

    private final TechCapacityService techCapacityService;

    @GetMapping("/capacity")
    public TechCapacityResponse getCapacity(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return techCapacityService.getCapacity(date);
    }

    @GetMapping("/events")
    public List<TechEventResponse> getEvents(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return techCapacityService.getEvents(date);
    }
}