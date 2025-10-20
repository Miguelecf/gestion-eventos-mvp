package com.mvp.backend.feature.events.controller;

import com.mvp.backend.feature.events.dto.ChangeStatusRequest;
import com.mvp.backend.feature.events.dto.StatusChangeResponse;
import com.mvp.backend.feature.events.dto.StatusOptionsResponse;
import com.mvp.backend.feature.events.service.EventStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventStatusController {

    private final EventStatusService eventStatusService;

    @GetMapping("/{id}/status")
    public StatusOptionsResponse getStatusOptions(@PathVariable Long id) {
        return eventStatusService.getStatusOptions(id);
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<StatusChangeResponse> changeStatus(@PathVariable Long id,
                                                              @Valid @RequestBody ChangeStatusRequest request) {
        StatusChangeResponse response = eventStatusService.changeStatus(id, request);
        if (response.approvalPending()) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
