package com.linkedu.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.linkedu.backend.entities.QuestionQuizAssignment;
import com.linkedu.backend.repositories.QuestionQuizAssignmentRepository;
import com.linkedu.backend.repositories.QuestionRepository;
import com.linkedu.backend.repositories.QuizRepository;
import com.linkedu.backend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quiz-assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class AgentQuizController {

    private final QuestionQuizAssignmentRepository assignmentRepo;
    private final QuestionRepository questionRepo;
    private final QuizRepository quizRepo;
    private final UserRepository userRepo;

    @PostMapping
    public ResponseEntity<?> assignQuestionToQuiz(
            @RequestParam Long questionId,
            @RequestParam Long quizId,
            @RequestParam Long agentId) {
        QuestionQuizAssignment assignment = new QuestionQuizAssignment();
        assignment.setQuestion(questionRepo.findById(questionId).orElseThrow());
        assignment.setQuiz(quizRepo.findById(quizId).orElseThrow());
        assignment.setAssignedBy(userRepo.findById(agentId).orElseThrow());
        return ResponseEntity.ok(assignmentRepo.save(assignment));
    }
}
