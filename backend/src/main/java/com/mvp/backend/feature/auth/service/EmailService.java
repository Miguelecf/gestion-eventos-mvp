package com.mvp.backend.feature.auth.service;

import com.mvp.backend.feature.auth.exception.EmailDeliveryException;
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
    @Value("${app.mail.from:noreply@gestion-eventos.local}")
    private String from;
    @Value("${app.mail.mock-mode:true}")
    private boolean mockMode;
    @Value("${app.mail.fail-on-error:true}")
    private boolean failOnError;

    public void sendNewPassword(String to, String temporaryPassword) {
        if (mockMode) {
            log.info("[MAIL_MOCK] Alta de usuario para {} con password temporal {}", to, temporaryPassword);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Gestion de Eventos - ALTA DE USUARIO");
        message.setText(
                "Hola,\n te informamos que tu usuario ha sido dado de alta y que la contraseña es: " + temporaryPassword
                        + "\nPor favor, cambiala al iniciar sesión.\nSaludos.");
        try {
            emailSender.send(message);
        } catch (Exception e) {
            if (failOnError) {
                throw new EmailDeliveryException("No se pudo enviar el email de credenciales", e);
            }
            log.error("Fallo al enviar email de credenciales a {}. Se continua por fail-on-error=false", to, e);
        }
    }

    public void send(String to, String subject, String textBody) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(textBody);
        emailSender.send(message);
    }
}