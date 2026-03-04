package com.ovr.oceanview_reservation_api.security;

import com.ovr.oceanview_reservation_api.model.UserRole;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.Base64;

@Service
public class JwtService {

    private final SecretKey key;
    private final int expiresMin;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expires-min}") int expiresMin
    ) {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.expiresMin = expiresMin;
    }

    public String generateToken(String email, UserRole role) {
        Instant now = Instant.now();
        Instant exp = now.plus(expiresMin, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(email)
                .claims(Map.of("role", role.name()))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public String extractRole(String token) {
        Object role = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().get("role");
        return role == null ? null : role.toString();
    }
}