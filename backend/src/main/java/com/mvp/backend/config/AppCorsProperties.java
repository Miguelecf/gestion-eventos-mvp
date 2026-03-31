package com.mvp.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.cors")
@Getter
@Setter
public class AppCorsProperties {
    private List<String> allowedOrigins = List.of("http://localhost:5173");
}
