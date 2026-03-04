package com.ovr.oceanview_reservation_api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationDatesUpdateRequest {

    @NotNull
    private LocalDate checkInDate;

    @NotNull
    private LocalDate checkOutDate;
}