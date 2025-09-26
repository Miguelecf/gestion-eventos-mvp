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
                    u.setPassword(pe.encode(p));        // hashear
                    u.setMustChangePassword(false);     // opcional: para que no te bloquee en login
                    repo.save(u);
                    System.out.println("Password hasheada para user " + u.getUsername());
                }
            });
        };
    }

	@Bean
	CommandLineRunner initUsers(UserRepository userRepository) {
		return args -> {
			// Usuario Naruto
			if (userRepository.findByUsername("naruto").isEmpty()) {
				User naruto = User.builder()
						.username("naruto")
						.name("Naruto")
						.lastName("Uzumaki")
						.email("naruto@example.com")
						.password("rasengan123")  // ⚠️ en producción debería ir encriptado (BCrypt)
						.priority(Priority.HIGH)
						.role("ADMIN")
						.build();
				userRepository.save(naruto);
				System.out.println("Usuario Naruto creado ✅");
			}

			// Usuario Sasuke
			if (userRepository.findByUsername("sasuke").isEmpty()) {
				User sasuke = User.builder()
						.username("sasuke")
						.name("Sasuke")
						.lastName("Uchiha")
						.email("sasuke@example.com")
						.password("chidori123")
						.priority(Priority.HIGH)
						.role("ADMIN")
						.build();
				userRepository.save(sasuke);
				System.out.println("Usuario Sasuke creado ✅");
			}
		};
	}
}
