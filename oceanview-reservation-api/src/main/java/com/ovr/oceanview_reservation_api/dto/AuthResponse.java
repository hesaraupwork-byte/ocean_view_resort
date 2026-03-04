package com.ovr.oceanview_reservation_api.dto;

import com.ovr.oceanview_reservation_api.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private UserRole role;
}