package com.ovr.oceanview_reservation_api.dto;

import com.ovr.oceanview_reservation_api.model.UserRole;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    private String fullName;

    @Email
    private String email;

    private UserRole role;

    private Boolean active;
}