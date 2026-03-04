package com.ovr.oceanview_reservation_api.dto;

import com.ovr.oceanview_reservation_api.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String email;
    private String fullName;
    private String phone;   // if you use it
    private UserRole role;
    private boolean active;
}