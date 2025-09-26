package com.mvp.backend.feature.auth.repository;

import com.mvp.backend.feature.auth.model.RefreshToken;
import com.mvp.backend.feature.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUserAndRevokedFalse(User user);

    @Modifying(clearAutomatically = true)
    @Query("update RefreshToken rt set rt.revoked = true, rt.updatedAt = :now where rt.user = :user and rt.revoked = false")
    int revokeAllActiveForUser(@Param("user") User user, @Param("now") Instant now);
}
