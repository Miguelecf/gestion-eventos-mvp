package com.mvp.backend.feature.priority.controller;

import com.mvp.backend.feature.priority.dto.PriorityConflictDecisionRequest;
import com.mvp.backend.feature.priority.dto.PriorityConflictDecisionResponse;
import com.mvp.backend.feature.priority.dto.PriorityConflictResponse;
import com.mvp.backend.feature.priority.model.PriorityConflict;
import com.mvp.backend.feature.priority.service.PriorityConflictService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/priority")
@RequiredArgsConstructor
public class PriorityConflictController {

    private final PriorityConflictService priorityConflictService;

    @GetMapping("/conflicts")
    public PriorityConflictResponse getOpenConflicts(@RequestParam Long eventId) {
        List<PriorityConflict> conflicts = priorityConflictService.getOpenConflicts(eventId);
        List<PriorityConflictResponse.ConflictDetail> items = conflicts.stream()
                .map(this::toDetail)
                .toList();
        return new PriorityConflictResponse(eventId, items);
    }

    @PostMapping("/decisions")
    @ResponseStatus(HttpStatus.CREATED)
    public PriorityConflictDecisionResponse decide(@Valid @RequestBody PriorityConflictDecisionRequest request) {
        PriorityConflict conflict = priorityConflictService.applyDecision(request);
        return new PriorityConflictDecisionResponse(conflict.getConflictCode(), conflict.getDecision(), conflict.getStatus());
    }

    private PriorityConflictResponse.ConflictDetail toDetail(PriorityConflict conflict) {
        var audit = new PriorityConflictResponse.ConflictDetail.Audit(
                conflict.getCreatedAt(),
                conflict.getCreatedBy() != null ? conflict.getCreatedBy().getId() : null
        );
        return new PriorityConflictResponse.ConflictDetail(
                conflict.getConflictCode(),
                conflict.getDisplacedEvent() != null ? conflict.getDisplacedEvent().getId() : null,
                conflict.getSpaceId(),
                conflict.getFromTime(),
                conflict.getToTime(),
                audit
        );
    }
}