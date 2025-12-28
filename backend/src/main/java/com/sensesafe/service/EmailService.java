package com.sensesafe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    @Async
    public void sendOtpEmail(String to, String otp, String firstName) {
        String subject = "SenseSafe Admin Login - OTP Verification";
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3B82F6;">SenseSafe Admin Login</h2>
                    <p>Hello %s,</p>
                    <p>Your One-Time Password (OTP) for admin login is:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                        <h1 style="color: #3B82F6; font-size: 32px; margin: 0; letter-spacing: 5px;">%s</h1>
                    </div>
                    <p><strong>This OTP will expire in 10 minutes.</strong></p>
                    <p>If you didn't request this login, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated message from SenseSafe Emergency Response System.
                    </p>
                </div>
            </body>
            </html>
            """, firstName, otp);
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    public void sendEmergencyAlert(String to, String incidentDetails, String location) {
        String subject = "🚨 EMERGENCY ALERT - SenseSafe";
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #EF4444; border-radius: 10px;">
                    <h1 style="color: #EF4444; text-align: center;">🚨 EMERGENCY ALERT</h1>
                    <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #DC2626; margin-top: 0;">Incident Details:</h3>
                        <p style="font-size: 16px;"><strong>%s</strong></p>
                        <h3 style="color: #DC2626;">Location:</h3>
                        <p style="font-size: 16px;"><strong>%s</strong></p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="font-size: 18px; color: #DC2626;"><strong>Please take immediate action if you are in the area.</strong></p>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        Emergency Alert from SenseSafe - Stay Safe!
                    </p>
                </div>
            </body>
            </html>
            """, incidentDetails, location);
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    public void sendSOSAlert(List<String> emergencyContacts, String userInfo, String location, String message) {
        String subject = "🆘 SOS ALERT - Emergency Assistance Needed";
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #DC2626; border-radius: 10px;">
                    <h1 style="color: #DC2626; text-align: center;">🆘 SOS EMERGENCY ALERT</h1>
                    <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #DC2626; margin-top: 0;">Emergency Contact Information:</h3>
                        <p style="font-size: 16px;"><strong>%s</strong></p>
                        <h3 style="color: #DC2626;">Current Location:</h3>
                        <p style="font-size: 16px;"><strong>%s</strong></p>
                        <h3 style="color: #DC2626;">Message:</h3>
                        <p style="font-size: 16px;"><strong>%s</strong></p>
                    </div>
                    <div style="text-align: center; margin: 30px 0; background-color: #FEE2E2; padding: 15px; border-radius: 8px;">
                        <p style="font-size: 18px; color: #DC2626; margin: 0;"><strong>IMMEDIATE ASSISTANCE REQUIRED</strong></p>
                        <p style="font-size: 14px; color: #991B1B; margin: 5px 0 0 0;">Please contact emergency services: 911</p>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666; text-align: center;">
                        SOS Alert sent via SenseSafe Emergency Response System
                    </p>
                </div>
            </body>
            </html>
            """, userInfo, location, message);

        for (String contact : emergencyContacts) {
            sendHtmlEmail(contact, subject, htmlContent);
        }
    }

    @Async
    public void sendHospitalAlert(String hospitalEmail, String incidentDetails, String location, String contactNumber) {
        String subject = "🏥 Hospital Alert - Emergency Incident Reported";
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #EF4444;">🏥 Hospital Emergency Alert</h2>
                    <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
                        <h3 style="color: #DC2626; margin-top: 0;">Incident Details:</h3>
                        <p style="font-size: 16px;">%s</p>
                        <h3 style="color: #DC2626;">Location:</h3>
                        <p style="font-size: 16px;">%s</p>
                        <h3 style="color: #DC2626;">Contact Number:</h3>
                        <p style="font-size: 16px;">%s</p>
                    </div>
                    <div style="background-color: #FEF9C3; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #92400E;"><strong>Please prepare for potential incoming patients.</strong></p>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        Alert sent via SenseSafe Emergency Response System
                    </p>
                </div>
            </body>
            </html>
            """, incidentDetails, location, contactNumber);
        
        sendHtmlEmail(hospitalEmail, subject, htmlContent);
    }

    @Async
    public void sendVolunteerApplicationUpdate(String to, String firstName, String status, String notes) {
        String subject = "SenseSafe Volunteer Application - Status Update";
        String statusColor = status.equals("APPROVED") ? "#10B981" : "#EF4444";
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3B82F6;">SenseSafe Volunteer Program</h2>
                    <p>Hello %s,</p>
                    <p>We have an update regarding your volunteer application:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border-left: 4px solid %s;">
                        <h2 style="color: %s; margin: 0;">Application %s</h2>
                    </div>
                    %s
                    <p>Thank you for your interest in helping your community through SenseSafe.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        SenseSafe Emergency Response System - Building Safer Communities
                    </p>
                </div>
            </body>
            </html>
            """, firstName, statusColor, statusColor, status, 
            notes != null ? "<p><strong>Notes:</strong> " + notes + "</p>" : "");
        
        sendHtmlEmail(to, subject, htmlContent);
    }
}