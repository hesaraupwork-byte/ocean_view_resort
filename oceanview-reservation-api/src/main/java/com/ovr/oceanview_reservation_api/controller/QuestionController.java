package com.ovr.oceanview_reservation_api.controller;

import com.ovr.oceanview_reservation_api.dto.QuestionAnswerRequest;
import com.ovr.oceanview_reservation_api.dto.QuestionCreateRequest;
import com.ovr.oceanview_reservation_api.model.Question;
import com.ovr.oceanview_reservation_api.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    // 1) Submit question
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Question submit(@Valid @RequestBody QuestionCreateRequest req) {
        return questionService.submit(req);
    }

    // 2) View all questions
    @GetMapping
    public List<Question> getAll() {
        return questionService.getAll();
    }

    // 2) View one question by QuestionId
    @GetMapping("/{questionId}")
    public Question getOne(@PathVariable String questionId) {
        return questionService.getOne(questionId);
    }

    // 3) Answer question (send email)
    @PatchMapping("/{questionId}/answer")
    public Question answer(@PathVariable String questionId,
                           @Valid @RequestBody QuestionAnswerRequest req) {
        return questionService.answer(questionId, req);
    }
}