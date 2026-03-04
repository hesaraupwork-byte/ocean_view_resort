package com.ovr.oceanview_reservation_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuestionAnswerRequest {

    @NotBlank
    @Size(max = 4000)
    private String answer;
}