package com.ovr.oceanview_reservation_api.service;

import com.ovr.oceanview_reservation_api.dto.*;
import com.ovr.oceanview_reservation_api.exception.NotFoundException;
import com.ovr.oceanview_reservation_api.model.User;
import com.ovr.oceanview_reservation_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> listAll() {
        return userRepository.findAll();
    }

    public User getById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }

    public User create(AdminUserCreateRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered.");
        }

        boolean active = (req.getActive() == null) ? true : req.getActive();

        User user = User.builder()
                .fullName(req.getFullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .active(active)
                .createdAt(Instant.now())
                .build();

        return userRepository.save(user);
    }

    public User update(String id, AdminUserUpdateRequest req) {
        User user = getById(id);

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String newEmail = req.getEmail().trim().toLowerCase();

            // prevent using another user’s email
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email already registered.");
            }
            user.setEmail(newEmail);
        }

        if (req.getRole() != null) {
            user.setRole(req.getRole());
        }

        if (req.getActive() != null) {
            user.setActive(req.getActive());
        }

        return userRepository.save(user);
    }

    public void deleteHard(String id) {
        User user = getById(id);
        userRepository.delete(user);
    }

    public User deleteSoft(String id) {
        User user = getById(id);
        user.setActive(false);
        return userRepository.save(user);
    }

    public User setPassword(String id, AdminSetPasswordRequest req) {
        User user = getById(id);
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        return userRepository.save(user);
    }
}