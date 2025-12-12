package com.mvp.backend;

import com.mvp.backend.feature.users.model.User;
import com.mvp.backend.feature.users.repository.UserRepository;
import com.mvp.backend.shared.Priority;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Autowired
    private UserRepository userRepository;

    @Bean
    CommandLineRunner encodeSeedPasswords(UserRepository repo, PasswordEncoder pe) {
        return args -> {
            repo.findAll().forEach(u -> {
                String p = u.getPassword();
                if (p != null && !p.startsWith("$2")) { // heurística: no es BCrypt
                    u.setPassword(pe.encode(p)); // hashear
                    u.setMustChangePassword(false); // opcional: para que no te bloquee en login
                    repo.save(u);
                    System.out.println("Password hasheada para user " + u.getUsername());
                }
            });
        };
    }
}
