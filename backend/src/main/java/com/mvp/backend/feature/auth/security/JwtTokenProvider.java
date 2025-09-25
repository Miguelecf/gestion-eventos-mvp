package com.mvp.backend.feature.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final String secret;
    private final long accessTokenExpirationMs;

    private SecretKey key;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token.expiration}") long accessTokenExpirationMs
    ) {
        this.secret = secret;
        this.accessTokenExpirationMs = accessTokenExpirationMs;
    }

    @PostConstruct
    void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Long userId, String username, String role, Set<String> scopes) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(accessTokenExpirationMs);
        Set<String> safeScopes = scopes == null ? Collections.emptySet() : scopes;
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .claim("role", role)
                .claim("scopes", safeScopes)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    @SuppressWarnings("unchecked")
    public Set<String> extractScopes(Claims claims) {
        Object scopes = claims.get("scopes");
        if (scopes instanceof Collection<?> collection) {
            return collection.stream().map(Object::toString).collect(Collectors.toSet());
        }
        return java.util.Collections.emptySet();
    }

    public long getAccessTokenExpirationMs() {
        return accessTokenExpirationMs;
    }
}
