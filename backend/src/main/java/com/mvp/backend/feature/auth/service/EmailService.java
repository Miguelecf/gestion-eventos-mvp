package com.mvp.backend.feature.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    public void sendNewPassword(String to, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@baeldung.com");
        message.setTo(to);
        message.setSubject("Gestion de Eventos - ALTA DE USUARIO");
        message.setText("Hola,\n te informamos que tu usuario ha sido dado de alta y que la contraseña es: " + temporaryPassword
                + "\nPor favor, cambiala al iniciar sesión.\nSaludos.");
        try {
            emailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("La contraseña no pudo ser comunicada" + e.getMessage(), e);
        }
    }
}