package com.ovr.oceanview_reservation_api.service;

import com.ovr.oceanview_reservation_api.model.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    // ================= PENDING EMAIL =================
    public void sendPendingEmail(Reservation r) {
        String subject = "Reservation Pending | OceanView Luxury Resort";
        String content = buildLuxuryTemplate(
                "Reservation Received",
                "Your reservation request has been successfully received and is currently <b style='color:#C9A227;'>PENDING</b> confirmation.",
                r
        );

        sendHtml(r.getCustomerEmail(), subject, content);
    }

    // ================= CONFIRMED EMAIL =================
    public void sendConfirmedEmail(Reservation r) {
        String subject = "Reservation Confirmed | OceanView Luxury Resort";
        String content = buildLuxuryTemplate(
                "Reservation Confirmed",
                "We are delighted to inform you that your reservation has been <b style='color:#2E7D32;'>CONFIRMED</b>. We look forward to welcoming you.",
                r
        );

        sendHtml(r.getCustomerEmail(), subject, content);
    }

    // ================= HTML TEMPLATE =================
    private String buildLuxuryTemplate(String title, String message, Reservation r) {

        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
                
                <table align="center" width="600" style="background:#ffffff;border-collapse:collapse;margin-top:30px;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.1);">
                
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background:#0D1B2A;padding:30px;">
                            <img src="cid:logoImage" width="120" />
                            <h1 style="color:#C9A227;margin-top:15px;font-weight:500;">
                                OceanView Luxury Resort
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color:#0D1B2A;margin-bottom:10px;">%s</h2>
                            
                            <p style="color:#444;font-size:15px;line-height:1.6;">
                                Dear %s,<br><br>
                                %s
                            </p>
                            
                            <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">
                            
                            <h3 style="color:#C9A227;">Reservation Details</h3>
                            
                            <table width="100%%" style="font-size:14px;color:#555;line-height:1.8;">
                                <tr><td><b>Reservation No</b></td><td>%s</td></tr>
                                <tr><td><b>Room Type</b></td><td>%s</td></tr>
                                <tr><td><b>Check-in</b></td><td>%s</td></tr>
                                <tr><td><b>Check-out</b></td><td>%s</td></tr>
                                <tr><td><b>Guests</b></td><td>%d Adults, %d Children</td></tr>
                                <tr><td><b>Special Requests</b></td><td>%s</td></tr>
                            </table>
                            
                            <br><br>
                            
                            <p style="font-size:14px;color:#666;">
                                If you require any assistance, please contact our concierge team. 
                                We are committed to delivering an exceptional luxury experience.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background:#0D1B2A;color:#bbb;padding:20px;font-size:12px;">
                            OceanView Luxury Resort<br>
                            Galle, Sri Lanka<br>
                            Email restinoceanview@gmail.com<br>
                            © 2026 OceanView Resort. All Rights Reserved.
                        </td>
                    </tr>
                
                </table>
                </body>
                </html>
                """.formatted(
                title,
                r.getCustomerName(),
                message,
                r.getReservationNo(),
                r.getRoomType(),
                r.getCheckInDate(),
                r.getCheckOutDate(),
                r.getAdults(),
                r.getChildren(),
                (r.getSpecialRequests() == null || r.getSpecialRequests().isBlank())
                        ? "None"
                        : r.getSpecialRequests()
        );
    }

    // ================= SEND METHOD =================
    private void sendHtml(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Attach logo inline (CID)
            helper.addInline("logoImage",
                    new ClassPathResource("images/logo.png"));

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
    private void sendHtmlWithLogo(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            helper.addInline("logoImage", new ClassPathResource("images/logo.png"));

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendPasswordResetEmail(String to, String otp) {
        String subject = "Your Password Reset OTP | OceanView";

        String html = """
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial;background:#f4f4f4;padding:30px;">
        <table align="center" width="600" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.1);">
            <tr>
                <td style="background:#0D1B2A;padding:25px;text-align:center;">
                    <img src="cid:logoImage" width="110"/>
                    <h2 style="color:#C9A227;margin:10px 0 0;">OceanView Luxury Resort</h2>
                </td>
            </tr>

            <tr>
                <td style="padding:35px;color:#333;">
                    <h3 style="margin-top:0;color:#0D1B2A;">Password Reset OTP</h3>
                    <p style="color:#444;line-height:1.6;">
                        We received a request to reset your password. Use the OTP below to continue:
                    </p>

                    <div style="text-align:center;margin:24px 0;">
                        <span style="display:inline-block;background:#0D1B2A;color:#C9A227;
                                     padding:14px 22px;border-radius:10px;font-size:22px;
                                     letter-spacing:6px;font-weight:bold;">
                            %s
                        </span>
                    </div>

                    <p style="font-size:13px;color:#666;line-height:1.6;">
                        This OTP will expire in <b>15 minutes</b>. If you did not request this, please ignore this email.
                    </p>
                </td>
            </tr>

            <tr>
                <td style="background:#0D1B2A;color:#bbb;padding:18px;font-size:12px;text-align:center;">
                    © 2026 OceanView Resort. All Rights Reserved.
                </td>
            </tr>
        </table>
    </body>
    </html>
    """.formatted(otp);

        sendHtmlWithLogo(to, subject, html);
    }

    public void sendQuestionAnsweredEmail(String to, String customerName, String questionId, String subject, String questionMsg, String answer) {

        String mailSubject = "Answer to Your Question | OceanView Luxury Resort";

        String html = """
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial;background:#f4f4f4;padding:30px;">
            <table align="center" width="600" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.1);">
                <tr>
                    <td style="background:#0D1B2A;padding:25px;text-align:center;">
                        <img src="cid:logoImage" width="110"/>
                        <h2 style="color:#C9A227;margin:10px 0 0;">OceanView Luxury Resort</h2>
                    </td>
                </tr>

                <tr>
                    <td style="padding:35px;color:#333;">
                        <h3 style="margin-top:0;color:#0D1B2A;">Your Question Has Been Answered</h3>

                        <p style="color:#444;line-height:1.6;">
                            Dear %s,<br><br>
                            Thank you for contacting us. Here is the answer to your question.
                        </p>

                        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">

                        <p><b>Question ID </b> %s</p>
                        <p><b>Subject </b> %s</p>

                        <p style="color:#555;"><b>Your Question </b><br>%s</p>

                        <div style="margin-top:18px;padding:16px;border-radius:10px;background:#f8f8f8;">
                            <p style="margin:0;color:#0D1B2A;"><b>Answer </b></p>
                            <p style="margin:10px 0 0;color:#333;line-height:1.6;">%s</p>
                        </div>

                        <p style="margin-top:22px;font-size:13px;color:#666;">
                            If you have more questions, feel free to reply to this email.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="background:#0D1B2A;color:#bbb;padding:18px;font-size:12px;text-align:center;">
                        © 2026 OceanView Resort. All Rights Reserved.
                    </td>
                </tr>
            </table>
        </body>
        </html>
    """.formatted(customerName, questionId, subject, questionMsg, answer);

        // use your existing helper that attaches logo
        sendHtmlWithLogo(to, mailSubject, html);
    }
}