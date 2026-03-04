package com.ovr.oceanview_reservation_api.service;

import com.ovr.oceanview_reservation_api.dto.ChangePasswordRequest;
import com.ovr.oceanview_reservation_api.dto.ProfileUpdateRequest;
import com.ovr.oceanview_reservation_api.dto.UserProfileResponse;
import com.ovr.oceanview_reservation_api.exception.NotFoundException;
import com.ovr.oceanview_reservation_api.model.User;
import com.ovr.oceanview_reservation_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found."));

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),     // remove if not using phone
                user.getRole(),
                user.isActive()
        );
    }

    public UserProfileResponse updateMyProfile(String email, ProfileUpdateRequest req) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }

        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            user.setPhone(req.getPhone().trim());
        }

        userRepository.save(user);
        return getMyProfile(email);
    }

    public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}