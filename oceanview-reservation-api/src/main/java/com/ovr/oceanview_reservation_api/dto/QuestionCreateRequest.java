package com.ovr.oceanview_reservation_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuestionCreateRequest {

    @NotBlank
    private String customerName;

    @Email
    @NotBlank
    private String customerEmail;

    @NotBlank
    @Size(max = 120)
    private String subject;

    @NotBlank
    @Size(max = 2000)
    private String message;
}