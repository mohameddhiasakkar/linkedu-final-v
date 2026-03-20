package com.linkedu.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.linkedu.backend.entities.Quiz;
import com.linkedu.backend.repositories.QuizRepository;
import com.linkedu.backend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class QuizController {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Long createdById) {
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setCreatedBy(userRepository.findById(createdById).orElseThrow());
        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    // STUDENT: Get all quizzes
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizRepository.findAll());
    }

    // STUDENT: Get specific quiz
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizRepository.findById(id).orElseThrow());
    }
}
