package com.ovr.oceanview_reservation_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DiscountUpdateRequest {
    @NotNull
    @Min(0)
    private Double discountAmount;
}