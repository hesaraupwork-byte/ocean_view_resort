package com.ovr.oceanview_reservation_api.service;

import com.ovr.oceanview_reservation_api.dto.QuestionAnswerRequest;
import com.ovr.oceanview_reservation_api.dto.QuestionCreateRequest;
import com.ovr.oceanview_reservation_api.exception.NotFoundException;
import com.ovr.oceanview_reservation_api.model.Question;
import com.ovr.oceanview_reservation_api.model.QuestionStatus;
import com.ovr.oceanview_reservation_api.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final EmailService emailService;

    public Question submit(QuestionCreateRequest req) {
        String questionId = generateQuestionId();

        Question q = Question.builder()
                .questionId(questionId)
                .customerName(req.getCustomerName())
                .customerEmail(req.getCustomerEmail())
                .subject(req.getSubject())
                .message(req.getMessage())
                .status(QuestionStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        return questionRepository.save(q);
    }

    public List<Question> getAll() {
        return questionRepository.findAll();
    }

    public Question getOne(String questionId) {
        return questionRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new NotFoundException("Question not found: " + questionId));
    }

    public Question answer(String questionId, QuestionAnswerRequest req) {
        Question q = getOne(questionId);

        q.setAnswer(req.getAnswer());
        q.setStatus(QuestionStatus.ANSWERED);
        q.setAnsweredAt(Instant.now());

        Question saved = questionRepository.save(q);

        // ✅ Send answer email
        emailService.sendQuestionAnsweredEmail(
                saved.getCustomerEmail(),
                saved.getCustomerName(),
                saved.getQuestionId(),
                saved.getSubject(),
                saved.getMessage(),
                saved.getAnswer()
        );

        return saved;
    }

    private String generateQuestionId() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // YYYYMMDD
        int counter = 1;

        String candidate;
        do {
            candidate = String.format("QST-%s-%04d", datePart, counter);
            counter++;
        } while (questionRepository.existsByQuestionId(candidate));

        return candidate;
    }
}