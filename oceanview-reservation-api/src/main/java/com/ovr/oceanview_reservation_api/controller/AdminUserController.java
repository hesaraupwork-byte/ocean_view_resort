package com.ovr.oceanview_reservation_api.controller;

import com.ovr.oceanview_reservation_api.dto.*;
import com.ovr.oceanview_reservation_api.model.User;
import com.ovr.oceanview_reservation_api.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    // VIEW ALL
    @GetMapping
    public List<User> list() {
        return adminUserService.listAll();
    }

    // VIEW ONE
    @GetMapping("/{id}")
    public User get(@PathVariable String id) {
        return adminUserService.getById(id);
    }

    // ADD (ADMIN can create CUSTOMER/STAFF/ADMIN)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@Valid @RequestBody AdminUserCreateRequest req) {
        return adminUserService.create(req);
    }

    // EDIT
    @PutMapping("/{id}")
    public User update(@PathVariable String id, @Valid @RequestBody AdminUserUpdateRequest req) {
        return adminUserService.update(id, req);
    }

    // CHANGE PASSWORD (optional)
    @PatchMapping("/{id}/password")
    public User setPassword(@PathVariable String id, @Valid @RequestBody AdminSetPasswordRequest req) {
        return adminUserService.setPassword(id, req);
    }

    // SOFT DELETE (recommended)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDelete(@PathVariable String id) {
        adminUserService.deleteSoft(id);
    }

    // HARD DELETE (optional - enable only if you really want to remove from DB)
    @DeleteMapping("/{id}/hard")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void hardDelete(@PathVariable String id) {
        adminUserService.deleteHard(id);
    }
}