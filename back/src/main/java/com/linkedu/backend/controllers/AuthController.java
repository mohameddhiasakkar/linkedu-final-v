package com.linkedu.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.linkedu.backend.dto.ContractRegistrationDTO;
import com.linkedu.backend.dto.GuestRegistrationDTO;
import com.linkedu.backend.dto.LoginRequestDTO;
import com.linkedu.backend.services.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class AuthController {

    private final AuthService authService;

    // ← FIXED: Use LoginRequestDTO (identifier + password)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO dto) {
        return authService.authenticate(dto);  // Now passes DTO
    }

    @PostMapping("/register/contract")
    public ResponseEntity<?> registerWithContract(@RequestBody ContractRegistrationDTO dto) {
        return authService.registerWithContract(dto);
    }

    @PostMapping("/register/guest")
    public ResponseEntity<?> registerAsGuest(@RequestBody GuestRegistrationDTO dto) {
        return authService.registerAsGuest(dto);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        return authService.verifyEmail(token);
    }

}
