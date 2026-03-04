package com.ovr.oceanview_reservation_api.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {

    @Size(min = 2, max = 80)
    private String fullName;

    // optional: add phone if you store it in User model
    @Size(min = 7, max = 20)
    private String phone;
}