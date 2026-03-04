package com.ovr.oceanview_reservation_api.repository;

import com.ovr.oceanview_reservation_api.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface QuestionRepository extends MongoRepository<Question, String> {
    Optional<Question> findByQuestionId(String questionId);
    boolean existsByQuestionId(String questionId);
}