package com.linkedu.backend.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.linkedu.backend.entities.enums.Role;
import com.linkedu.backend.services.UserService;

import lombok.RequiredArgsConstructor;
@CrossOrigin(origins = "http://localhost:4200")

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")  // ← Only ADMIN can assign roles
    public ResponseEntity<?> assignRole(@PathVariable Long userId, @RequestParam String role) {
        userService.assignRole(userId, Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(Map.of("message", "Role assigned: " + role));
    }
}
