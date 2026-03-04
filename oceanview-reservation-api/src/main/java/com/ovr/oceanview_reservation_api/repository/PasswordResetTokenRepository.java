package com.ovr.oceanview_reservation_api.repository;


import com.ovr.oceanview_reservation_api.model.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findTopByEmailOrderByExpiresAtDesc(String email);
}