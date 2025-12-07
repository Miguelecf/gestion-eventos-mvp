package com.mvp.backend.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiGroupsConfig {

    /**
     * Endpoints expuestos al publico (public + auth) para consultar disponibilidad
     * y autenticarse.
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch("/public/**", "/auth/**")
                .build();
    }

    /**
     * API principal usada por backoffice/admin para gestionar catalogos y eventos.
     */
    @Bean
    public GroupedOpenApi coreApi() {
        return GroupedOpenApi.builder()
                .group("api")
                .pathsToMatch("/api/**")
                .build();
    }
}
