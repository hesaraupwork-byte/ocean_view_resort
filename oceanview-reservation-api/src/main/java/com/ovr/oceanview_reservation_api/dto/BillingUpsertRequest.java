package com.ovr.oceanview_reservation_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BillingUpsertRequest {

    @Min(0)
    private double roomRatePerNight;

    // If you don’t send these, service will use defaults
    @Min(0)
    private Double serviceChargeRate;   // 0.10 = 10%

    @Min(0)
    private Double taxRate;             // 0.05 = 5%

    @Min(0)
    private Double discountAmount;      // editable amount

    @NotBlank
    private String currency;            // "LKR"

    private String notes;
}