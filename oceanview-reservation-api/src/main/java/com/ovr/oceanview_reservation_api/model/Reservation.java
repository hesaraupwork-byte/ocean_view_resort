package com.ovr.oceanview_reservation_api.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reservations")
public class Reservation {

    @Id
    private String id;

    @Indexed(unique = true)
    private String reservationNo; // e.g., OVR-20260302-0001

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private String roomType; // e.g., Standard/Deluxe/Suite

    private LocalDate checkInDate;
    private LocalDate checkOutDate;

    private int adults;
    private int children;

    private String specialRequests;

    private ReservationStatus status;
    private Instant createdAt;
    private Instant confirmedAt;

    private Billing billing;
}