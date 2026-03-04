package com.ovr.oceanview_reservation_api.dto;

import com.ovr.oceanview_reservation_api.model.ReservationStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationUpdateRequest {

    @NotBlank
    private String customerName;

    @Email
    @NotBlank
    private String customerEmail;

    @NotBlank
    private String customerPhone;

    @NotBlank
    private String roomType;

    @NotNull
    private LocalDate checkInDate;

    @NotNull
    private LocalDate checkOutDate;

    @Min(1)
    private int adults;

    @Min(0)
    private int children;

    @Size(max = 500)
    private String specialRequests;

    @NotNull
    private ReservationStatus status;
}