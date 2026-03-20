package com.linkedu.backend.controllers;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.linkedu.backend.entities.StudentProfile;
import com.linkedu.backend.services.StudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class StudentController {

    private final StudentService studentService;

    // Get students of logged-in agent
    @GetMapping("/my-students")
    public ResponseEntity<?> getMyStudents(Authentication authentication) {
        String agentEmail = authentication.getName();
        List<StudentProfile> students = studentService.getStudentsByAgentEmail(agentEmail);
        return ResponseEntity.ok(students);
    }

    // Assign agent to a student
    @PostMapping("/assign-agent")
    public ResponseEntity<?> assignAgent(
            @RequestParam Long studentId,
            @RequestParam Long agentId) {
        StudentProfile student = studentService.assignAgentToStudent(studentId, agentId);
        return ResponseEntity.ok(student);
    }

    // Get students of a specific agent by ID
    @GetMapping("/agent/{agentId}/students")
    public ResponseEntity<?> getAgentStudents(@PathVariable Long agentId) {
        List<StudentProfile> students = studentService.getStudentsByAgent(agentId);
        return ResponseEntity.ok(students);
    }
}