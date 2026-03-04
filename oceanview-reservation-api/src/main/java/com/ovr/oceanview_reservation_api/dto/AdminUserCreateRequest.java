package com.ovr.oceanview_reservation_api.dto;

import com.ovr.oceanview_reservation_api.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUserCreateRequest {

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    // Admin creates initial password
    @NotBlank
    private String password;

    @NotNull
    private UserRole role; // ADMIN / STAFF / CUSTOMER

    // optional; default true in service if null
    private Boolean active;
}