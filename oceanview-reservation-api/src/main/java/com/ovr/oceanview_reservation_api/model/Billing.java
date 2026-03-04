package com.ovr.oceanview_reservation_api.model;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Billing {

    // ====== Customer details snapshot ======
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // ====== Reservation reference ======
    private String reservationNo;

    // ====== Pricing inputs ======
    private double roomRatePerNight;     // required input
    private String currency;             // e.g., "LKR"

    // % rates (auto calculation)
    private double serviceChargeRate;    // e.g., 0.10 = 10%
    private double taxRate;              // e.g., 0.05 = 5%

    // Discount is editable (amount)
    private double discountAmount;       // editable amount

    // ====== Calculated values ======
    private int nights;
    private double roomSubtotal;

    private double serviceChargeAmount;
    private double taxAmount;

    private double total;

    private String notes;
    private Instant updatedAt;
}