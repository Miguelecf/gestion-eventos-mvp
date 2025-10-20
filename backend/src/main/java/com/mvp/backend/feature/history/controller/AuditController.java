package com.mvp.backend.feature.history.controller;

import com.mvp.backend.feature.history.dto.AuditPageDto;
import com.mvp.backend.feature.history.model.HistoryType;
import com.mvp.backend.feature.history.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/{eventId}")
    public AuditPageDto getEventAudit(@PathVariable Long eventId,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size,
                                      @RequestParam(name = "action", required = false) HistoryType type) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 200);
        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize);
        return auditService.getEventHistory(eventId, type, pageable);
    }
}
