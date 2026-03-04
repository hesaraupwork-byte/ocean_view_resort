package com.ovr.oceanview_reservation_api.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "questions")
public class Question {

    @Id
    private String id;

    @Indexed(unique = true)
    private String questionId;     // e.g., QST-20260304-0001

    private String customerName;
    private String customerEmail;

    private String subject;
    private String message;

    private QuestionStatus status;

    private Instant createdAt;

    // Answer fields
    private String answer;
    private Instant answeredAt;
}