package com.mvp.backend.feature.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String bearerToken = resolveToken(request);

        if (StringUtils.hasText(bearerToken)) {
            try {
                Claims claims = tokenProvider.parseToken(bearerToken).getBody();
                Long userId = Long.parseLong(claims.getSubject());
                UserDetails userDetails = userDetailsService.loadUserById(userId);

                if (userDetails.isEnabled()) {
                    Set<GrantedAuthority> authorities = new HashSet<>();
                    Set<String> scopes = tokenProvider.extractScopes(claims);
                    scopes.forEach(scope -> authorities.add(new SimpleGrantedAuthority("SCOPE_" + scope)));

                    String role = claims.get("role", String.class);
                    if (StringUtils.hasText(role) && !scopes.contains("password:update")) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    }

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities.isEmpty() ? userDetails.getAuthorities() : authorities
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (ExpiredJwtException ex) {
                request.setAttribute("jwt_expired", true);
            } catch (UsernameNotFoundException ex) {
                request.setAttribute("jwt_invalid", true);
            } catch (JwtException | IllegalArgumentException ex) {
                request.setAttribute("jwt_invalid", true);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String p = req.getServletPath();
        return p != null && (
                p.startsWith("/auth/") ||
                        p.startsWith("/public/") ||
                        p.startsWith("/v3/api-docs") || p.startsWith("/swagger") || p.startsWith("/swagger-ui")
        ) || "OPTIONS".equalsIgnoreCase(req.getMethod());
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}