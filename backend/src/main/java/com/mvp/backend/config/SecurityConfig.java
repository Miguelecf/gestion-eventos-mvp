package com.mvp.backend.config;

import com.mvp.backend.feature.auth.security.CustomUserDetailsService;
import com.mvp.backend.feature.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/event-requests").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/catalogs/spaces/public").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/catalogs/**").hasAnyRole("ADMIN_FULL","ADMIN_CEREMONIAL","ADMIN_TECNICA")
                        .requestMatchers(HttpMethod.POST, "/api/catalogs/**").hasAnyRole("ADMIN_FULL","ADMIN_CEREMONIAL","ADMIN_TECNICA")
                        .requestMatchers(HttpMethod.PATCH, "/api/catalogs/**").hasAnyRole("ADMIN_FULL","ADMIN_CEREMONIAL","ADMIN_TECNICA")
                        .requestMatchers(HttpMethod.POST, "/auth/register", "/auth/login", "/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/change-password", "/auth/logout").authenticated()
                        .requestMatchers(HttpMethod.GET,"/auth/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/events/**").hasAnyRole("ADMIN_FULL","ADMIN_CEREMONIAL","ADMIN_TECNICA","USUARIO")
                        .requestMatchers("/api/events/**").hasRole("ADMIN_FULL")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
