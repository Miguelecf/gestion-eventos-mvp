package com.mvp.backend.feature.users.service;

import com.mvp.backend.feature.auth.dto.RegisterRequest;
import com.mvp.backend.feature.users.model.User;
import com.mvp.backend.feature.users.repository.UserRepository;
import com.mvp.backend.shared.Priority;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import java.util.Locale;

import static org.springframework.http.HttpStatus.CONFLICT;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User register(RegisterRequest request, String encodedPassword) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(CONFLICT, "El nombre de usuario ya está en uso");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "El email ya está en uso");
        }

        String role = request.getRole() != null ? request.getRole().toUpperCase(Locale.ROOT) : "USER";

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .name(request.getName())
                .lastName(request.getLastName())
                .password(encodedPassword)
                .priority(Priority.LOW)
                .role(role)
                .mustChangePassword(true)
                .failedLoginAttempts(0)
                .build();

        return userRepository.save(user);
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public int updatePassword(Long id, String passwordHash){
        return userRepository.updatePassword(id, passwordHash);
    }
}