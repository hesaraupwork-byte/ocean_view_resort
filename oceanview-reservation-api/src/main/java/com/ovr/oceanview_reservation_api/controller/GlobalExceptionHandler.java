package com.ovr.oceanview_reservation_api.controller;

import com.ovr.oceanview_reservation_api.exception.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleNotFound(NotFoundException ex) {
        Map<String, Object> res = new HashMap<>();
        res.put("error", "NOT_FOUND");
        res.put("message", ex.getMessage());
        return res;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleBadRequest(IllegalArgumentException ex) {
        Map<String, Object> res = new HashMap<>();
        res.put("error", "BAD_REQUEST");
        res.put("message", ex.getMessage());
        return res;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> res = new HashMap<>();
        res.put("error", "VALIDATION_ERROR");

        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fields.put(err.getField(), err.getDefaultMessage()));

        res.put("fields", fields);
        return res;
    }
}