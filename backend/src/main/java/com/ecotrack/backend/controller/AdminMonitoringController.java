package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.SystemHealthResponse;
import com.ecotrack.backend.service.interfaces.SystemMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/system")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMonitoringController {

    private final SystemMonitoringService systemMonitoringService;

    @GetMapping("/health")
    public ResponseEntity<SystemHealthResponse> getHealth() {
        return ResponseEntity.ok(systemMonitoringService.getSystemHealth());
    }
}
