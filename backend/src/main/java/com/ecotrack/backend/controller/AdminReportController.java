package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.request.AdminReportGenerationRequest;
import com.ecotrack.backend.dto.response.AdminReportResponse;
import com.ecotrack.backend.service.interfaces.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    public ResponseEntity<List<AdminReportResponse>> getReportHistory() {
        return ResponseEntity.ok(adminReportService.getReportHistory());
    }

    @PostMapping("/generate")
    public ResponseEntity<AdminReportResponse> generateReport(@Valid @RequestBody AdminReportGenerationRequest request, Authentication authentication) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(adminReportService.generateAndSaveReport(adminEmail, request));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) {
        byte[] fileData = adminReportService.downloadReport(id);
        
        HttpHeaders headers = new HttpHeaders();
        // Just setting a generic content type as it can be PDF or CSV
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "admin-report-" + id);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(fileData);
    }
}
