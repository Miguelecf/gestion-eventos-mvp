package com.mvp.backend.feature.requests.controller;

import com.mvp.backend.feature.requests.dto.TrackingResponse;
import com.mvp.backend.feature.requests.service.EventRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/track")
@RequiredArgsConstructor
public class TrackingController {

    private final EventRequestService eventRequestService;

    @GetMapping("/{trackingUuid}")
    public TrackingResponse getTracking(@PathVariable String trackingUuid) {
        return eventRequestService.getTracking(trackingUuid);
    }
}