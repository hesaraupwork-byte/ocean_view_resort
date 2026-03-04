package com.ovr.oceanview_reservation_api.controller;

import com.ovr.oceanview_reservation_api.dto.ChangePasswordRequest;
import com.ovr.oceanview_reservation_api.dto.ProfileUpdateRequest;
import com.ovr.oceanview_reservation_api.dto.UserProfileResponse;
import com.ovr.oceanview_reservation_api.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // VIEW MY PROFILE
    @GetMapping
    public UserProfileResponse me(Authentication auth) {
        return profileService.getMyProfile(auth.getName());
    }

    // EDIT MY PROFILE
    @PatchMapping
    public UserProfileResponse update(Authentication auth, @Valid @RequestBody ProfileUpdateRequest req) {
        return profileService.updateMyProfile(auth.getName(), req);
    }

    // CHANGE PASSWORD
    @PatchMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest req) {
        profileService.changePassword(auth.getName(), req);
    }
}