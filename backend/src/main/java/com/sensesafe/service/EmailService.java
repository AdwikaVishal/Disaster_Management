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
    public void sendEnhancedSOSAlert(List<String> emergencyContacts, String userName, String userEmail, 
                                   String userPhone, String location, Double latitude, Double longitude, 
                                   String message, java.time.LocalDateTime timestamp) {
        String subject = "🆘 URGENT SOS ALERT - " + userName + " Needs Help";
        
        // Create Google Maps link
        String mapsLink = String.format("https://www.google.com/maps?q=%.6f,%.6f", latitude, longitude);
        
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 4px solid #DC2626; border-radius: 15px; background: linear-gradient(135deg, #FEF2F2 0%%, #FFFFFF 100%%);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #DC2626; font-size: 28px; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">🆘 EMERGENCY SOS ALERT</h1>
                        <div style="background: #DC2626; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold;">
                            IMMEDIATE ASSISTANCE REQUIRED
                        </div>
                    </div>
                    
                    <div style="background-color: #FFFFFF; padding: 25px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 6px solid #DC2626;">
                        <h2 style="color: #DC2626; margin-top: 0; font-size: 20px;">👤 Person in Need:</h2>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Name:</strong> %s</p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Email:</strong> %s</p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Phone:</strong> %s</p>
                        </div>
                        
                        <h2 style="color: #DC2626; margin-top: 25px; font-size: 20px;">📍 Location Information:</h2>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Address:</strong> %s</p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Coordinates:</strong> %.6f, %.6f</p>
                            <div style="text-align: center; margin: 15px 0;">
                                <a href="%s" target="_blank" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    📍 View on Google Maps
                                </a>
                            </div>
                        </div>
                        
                        <h2 style="color: #DC2626; margin-top: 25px; font-size: 20px;">💬 Emergency Message:</h2>
                        <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; margin: 10px 0; border: 2px solid #FECACA;">
                            <p style="font-size: 16px; margin: 0; font-weight: 500;">%s</p>
                        </div>
                        
                        <h2 style="color: #DC2626; margin-top: 25px; font-size: 20px;">⏰ Alert Time:</h2>
                        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <p style="margin: 0; font-size: 16px; font-weight: 500;">%s</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0; background: linear-gradient(135deg, #FEE2E2 0%%, #FECACA 100%%); padding: 20px; border-radius: 12px; border: 2px solid #F87171;">
                        <h3 style="color: #991B1B; margin: 0 0 10px 0; font-size: 18px;">🚨 WHAT TO DO NOW:</h3>
                        <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                            <p style="margin: 8px 0; color: #991B1B; font-weight: 500;">• Call emergency services: <strong>911</strong></p>
                            <p style="margin: 8px 0; color: #991B1B; font-weight: 500;">• Contact the person directly if possible</p>
                            <p style="margin: 8px 0; color: #991B1B; font-weight: 500;">• Go to their location if safe to do so</p>
                            <p style="margin: 8px 0; color: #991B1B; font-weight: 500;">• Share this information with other family/friends</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; background: #1F2937; color: white; padding: 15px; border-radius: 8px; margin-top: 30px;">
                        <p style="margin: 0; font-size: 14px;">
                            🛡️ SOS Alert sent via <strong>SenseSafe Emergency Response System</strong><br>
                            This is an automated emergency notification - Please respond immediately
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            userName, 
            userEmail != null ? userEmail : "Not provided", 
            userPhone != null ? userPhone : "Not provided",
            location,
            latitude, 
            longitude,
            mapsLink,
            message != null ? message : "Emergency assistance needed - no additional details provided",
            timestamp.toString().replace("T", " at "));

        for (String contact : emergencyContacts) {
            try {
                sendHtmlEmail(contact, subject, htmlContent);
            } catch (Exception e) {
                // Log error but continue sending to other contacts
                System.err.println("Failed to send SOS alert to " + contact + ": " + e.getMessage());
            }
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
    public void sendEnhancedHospitalAlert(String hospitalEmail, String hospitalName, String patientName, 
                                        String location, Double latitude, Double longitude, String injuries, 
                                        String callbackNumber, String urgency, String additionalInfo, String reporterName) {
        String subject = String.format("🚨 %s PRIORITY - Emergency Patient Alert", urgency);
        
        String urgencyColor = switch (urgency) {
            case "CRITICAL" -> "#DC2626";
            case "HIGH" -> "#EA580C";
            case "MEDIUM" -> "#D97706";
            case "LOW" -> "#059669";
            default -> "#6B7280";
        };
        
        String mapsLink = (latitude != null && longitude != null) ? 
            String.format("https://maps.google.com/?q=%.6f,%.6f", latitude, longitude) : "";
        
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: %s; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h2 style="margin: 0; font-size: 24px;">🏥 %s</h2>
                        <h1 style="margin: 10px 0 0 0; font-size: 28px;">%s PRIORITY ALERT</h1>
                    </div>
                    
                    <div style="background-color: #F9FAFB; padding: 20px; border: 1px solid #E5E7EB; border-top: none;">
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <h3 style="color: #1F2937; margin-top: 0; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">👤 Patient Information</h3>
                            <table style="width: 100%%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 30%%;">Patient Name:</td>
                                    <td style="padding: 8px 0; color: #1F2937;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Callback Number:</td>
                                    <td style="padding: 8px 0; color: #1F2937;"><a href="tel:%s" style="color: #2563EB; text-decoration: none;">%s</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Reported By:</td>
                                    <td style="padding: 8px 0; color: #1F2937;">%s</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <h3 style="color: #1F2937; margin-top: 0; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">📍 Location Details</h3>
                            <p style="margin: 10px 0; color: #1F2937; font-size: 16px;">%s</p>
                            %s
                        </div>
                        
                        %s
                        
                        %s
                        
                        <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; border-left: 4px solid %s;">
                            <h3 style="color: #DC2626; margin-top: 0;">⚠️ Action Required</h3>
                            <ul style="color: #7F1D1D; margin: 10px 0; padding-left: 20px;">
                                <li>Prepare emergency bay for incoming patient</li>
                                <li>Alert on-duty medical staff</li>
                                <li>Contact callback number for coordination</li>
                                <li>Prepare for %s priority treatment</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="background-color: #1F2937; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="margin: 0; font-size: 12px;">
                            Alert sent at %s via SenseSafe Emergency Response System<br>
                            This is an automated emergency notification - Please respond immediately
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            urgencyColor, hospitalName, urgency,
            patientName, callbackNumber, callbackNumber, reporterName,
            location,
            mapsLink.isEmpty() ? "" : String.format("<p style=\"margin: 10px 0;\"><a href=\"%s\" style=\"color: #2563EB; text-decoration: none; font-weight: bold;\">📍 View on Google Maps</a></p>", mapsLink),
            injuries != null && !injuries.trim().isEmpty() ? 
                String.format("""
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="color: #1F2937; margin-top: 0; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">🩺 Medical Information</h3>
                        <p style="margin: 10px 0; color: #1F2937; font-size: 16px; background-color: #FEF2F2; padding: 15px; border-radius: 6px; border-left: 4px solid #EF4444;">%s</p>
                    </div>
                    """, injuries) : "",
            additionalInfo != null && !additionalInfo.trim().isEmpty() ? 
                String.format("""
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="color: #1F2937; margin-top: 0; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">ℹ️ Additional Information</h3>
                        <p style="margin: 10px 0; color: #1F2937; font-size: 16px;">%s</p>
                    </div>
                    """, additionalInfo) : "",
            urgencyColor, urgency.toLowerCase(),
            java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );
        
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