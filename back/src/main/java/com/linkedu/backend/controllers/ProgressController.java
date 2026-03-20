package com.linkedu.backend.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.linkedu.backend.entities.Progress;
import com.linkedu.backend.entities.enums.ProgressStage;
import com.linkedu.backend.entities.enums.ProgressStatus;
import com.linkedu.backend.repositories.ProgressRepository;
import com.linkedu.backend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class ProgressController {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;

    // CREATE
    @PostMapping
    public ResponseEntity<Progress> createProgress(
            @RequestParam Long studentId,
            @RequestParam ProgressStage stage) {
        Progress progress = new Progress();
        progress.setStudent(userRepository.findById(studentId).orElseThrow());
        progress.setStage(stage);
        return ResponseEntity.ok(progressRepository.save(progress));
    }

    // READ ALL for student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Progress>> getStudentProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(progressRepository.findByStudent(
                userRepository.findById(studentId).orElseThrow()));
    }

    // UPDATE status
    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Progress> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Progress progress = progressRepository.findById(id).orElseThrow();
        progress.setStatus(ProgressStatus.valueOf(status));
        progress.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(progressRepository.save(progress));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgress(@PathVariable Long id) {
        progressRepository.deleteById(id);
        return ResponseEntity.ok("Progress deleted");
    }
}
