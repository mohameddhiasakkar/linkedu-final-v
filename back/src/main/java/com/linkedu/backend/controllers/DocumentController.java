package com.linkedu.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.linkedu.backend.dto.documentDTO.VerifyDocumentRequestDTO;
import com.linkedu.backend.entities.documents.Document;
import com.linkedu.backend.services.DocumentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")

public class DocumentController {

    private final DocumentService documentService;

    // ================= CV =================
    @PostMapping(value = "/cv", consumes = "multipart/form-data")
    public ResponseEntity<Document> uploadCv(
            @RequestParam Long studentId,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String summary,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String skills
    ) {
        return ResponseEntity.ok(
                documentService.uploadCv(studentId, file, summary, experience, skills)
        );
    }

    // ================= PASSPORT =================
    @PostMapping(value = "/passport", consumes = "multipart/form-data")
    public ResponseEntity<Document> uploadPassport(
            @RequestParam Long studentId,
            @RequestParam MultipartFile file,
            @RequestParam String issueDate,
            @RequestParam String expiryDate,
            @RequestParam String issuingCountry
    ) {
        return ResponseEntity.ok(
                documentService.uploadPassport(studentId, file, issueDate, expiryDate, issuingCountry)
        );
    }

    // ================= ID CARD =================
    @PostMapping(value = "/id-card", consumes = "multipart/form-data")
    public ResponseEntity<Document> uploadIdCard(
            @RequestParam Long studentId,
            @RequestParam MultipartFile file,
            @RequestParam String numId,
            @RequestParam String birthday
    ) {
        return ResponseEntity.ok(
                documentService.uploadIdCard(studentId, file, numId, birthday)
        );
    }

    // ================= GET STUDENT DOCUMENTS =================
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Document>> getStudentDocuments(
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(
                documentService.getStudentDocuments(studentId)
        );
    }

    // ======== VERIFY DOCUMENTS BY ASSIGNED AGENT =========
    @PutMapping("/{documentId}/verify")
    public ResponseEntity<Document> verifyDocument(
            @PathVariable Long documentId,
            @RequestParam Long agentId,
            @RequestBody VerifyDocumentRequestDTO request
    ) {

        return ResponseEntity.ok(
                documentService.verifyDocument(
                        documentId,
                        agentId,
                        request.getStatus()
                )
        );
    }
}