package com.ovr.oceanview_reservation_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminSetPasswordRequest {
    @NotBlank
    private String newPassword;
}