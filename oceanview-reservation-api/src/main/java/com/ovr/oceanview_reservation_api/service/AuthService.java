package com.ovr.oceanview_reservation_api.service;

import com.ovr.oceanview_reservation_api.dto.*;
import com.ovr.oceanview_reservation_api.exception.NotFoundException;
import com.ovr.oceanview_reservation_api.model.PasswordResetToken;
import com.ovr.oceanview_reservation_api.model.User;
import com.ovr.oceanview_reservation_api.model.UserRole;
import com.ovr.oceanview_reservation_api.repository.PasswordResetTokenRepository;
import com.ovr.oceanview_reservation_api.repository.UserRepository;
import com.ovr.oceanview_reservation_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.base-url}")
    private String baseUrl;
    private String generateOtp() {
        int otp = (int)(Math.random() * 900000) + 100000; // 100000-999999
        return String.valueOf(otp);
    }

    public void register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered.");
        }

        User user = User.builder()
                .email(req.getEmail().toLowerCase())
                .fullName(req.getFullName())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(UserRole.CUSTOMER)
                .active(true)
                .createdAt(Instant.now())
                .build();

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (!user.isActive()) {
            throw new IllegalArgumentException("User is disabled.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole());
    }

    public void forgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found."));

        String otp = generateOtp();

        PasswordResetToken prt = PasswordResetToken.builder()
                .email(user.getEmail())
                .otpHash(passwordEncoder.encode(otp))      // store hashed OTP
                .expiresAt(Instant.now().plusSeconds(15 * 60))
                .used(false)
                .build();

        tokenRepository.save(prt);

        emailService.sendPasswordResetEmail(user.getEmail(), otp);
    }

    public void verifyOtp(VerifyOtpRequest req) {

        String email = req.getEmail().toLowerCase();

        PasswordResetToken prt = tokenRepository
                .findTopByEmailOrderByExpiresAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("No OTP request found."));

        if (prt.isUsed()) {
            throw new IllegalArgumentException("OTP already used.");
        }

        if (Instant.now().isAfter(prt.getExpiresAt())) {
            throw new IllegalArgumentException("OTP expired.");
        }

        if (!passwordEncoder.matches(req.getOtp(), prt.getOtpHash())) {
            throw new IllegalArgumentException("Invalid OTP.");
        }

    }

    public void resetPassword(ResetPasswordRequest req) {
        String email = req.getEmail().toLowerCase();

        PasswordResetToken prt = tokenRepository.findTopByEmailOrderByExpiresAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("No OTP request found."));

        if (prt.isUsed()) throw new IllegalArgumentException("OTP already used.");
        if (Instant.now().isAfter(prt.getExpiresAt())) throw new IllegalArgumentException("OTP expired.");

        if (!passwordEncoder.matches(req.getOtp(), prt.getOtpHash())) {
            throw new IllegalArgumentException("Invalid OTP.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found."));

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        prt.setUsed(true);
        tokenRepository.save(prt);
    }
}