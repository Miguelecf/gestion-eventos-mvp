package com.mvp.backend.feature.comments.controller;

import com.mvp.backend.feature.comments.dto.CommentCreateDto;
import com.mvp.backend.feature.comments.dto.CommentPageDto;
import com.mvp.backend.feature.comments.dto.CommentResponseDto;
import com.mvp.backend.feature.comments.dto.CommentUpdateDto;
import com.mvp.backend.feature.comments.service.EventCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/comments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN_FULL','ADMIN_CEREMONIAL','ADMIN_TECNICA')")
public class EventCommentController {

    private final EventCommentService commentService;

    @GetMapping
    public CommentPageDto list(@PathVariable Long eventId,
                               @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        return commentService.list(eventId, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponseDto create(@PathVariable Long eventId,
                                     @Valid @RequestBody CommentCreateDto dto) {
        return commentService.create(eventId, dto);
    }

    @PatchMapping("/{commentId}")
    public CommentResponseDto update(@PathVariable Long eventId,
                                     @PathVariable Long commentId,
                                     @Valid @RequestBody CommentUpdateDto dto) {
        return commentService.update(eventId, commentId, dto);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long eventId,
                       @PathVariable Long commentId) {
        commentService.softDelete(eventId, commentId);
    }
}
