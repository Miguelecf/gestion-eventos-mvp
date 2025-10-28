package com.mvp.backend.feature.comments.mapper;

import com.mvp.backend.feature.comments.dto.CommentResponseDto;
import com.mvp.backend.feature.comments.model.EventComment;
import com.mvp.backend.feature.users.model.User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class EventCommentMapper {

    public CommentResponseDto toResponse(EventComment comment) {
        return new CommentResponseDto(
                comment.getId(),
                toUserRef(comment.getAuthor()),
                comment.getBody(),
                comment.getVisibility(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                toUserRef(comment.getEditedBy())
        );
    }

    private CommentResponseDto.UserRef toUserRef(User user) {
        if (user == null) {
            return null;
        }
        return new CommentResponseDto.UserRef(
                user.getId(),
                buildDisplayName(user)
        );
    }

    private String buildDisplayName(User user) {
        StringBuilder builder = new StringBuilder();
        if (StringUtils.hasText(user.getName())) {
            builder.append(user.getName().trim());
        }
        if (StringUtils.hasText(user.getLastName())) {
            if (builder.length() > 0) {
                builder.append(" ");
            }
            builder.append(user.getLastName().trim());
        }
        if (builder.length() == 0 && StringUtils.hasText(user.getUsername())) {
            builder.append(user.getUsername());
        }
        return builder.toString();
    }
}
