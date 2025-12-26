package com.mvp.backend.feature.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;
    @Value("${app.mail.from:noreply@example.com}")
    private String fromAddress;

    public void send(String to, String subject, String textBody) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(textBody);
        emailSender.send(message);
    }

    public void sendNewPassword(String to, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Gestion de Eventos - ALTA DE USUARIO");
        message.setText("Hola,\n te informamos que tu usuario ha sido dado de alta y que la contrase\u00f1a es: "
                + temporaryPassword
                + "\nPor favor, cambiala al iniciar sesi\u00f3n.\nSaludos.");
        try {
            emailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("La contrase\u00f1a no pudo ser comunicada" + e.getMessage(), e);
        }
    }
}
