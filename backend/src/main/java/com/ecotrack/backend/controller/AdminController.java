package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.AdminDashboardMetricsResponse;
import com.ecotrack.backend.service.interfaces.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.ecotrack.backend.dto.response.UserAdminResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardMetricsResponse> getAdminDashboard() {
        return ResponseEntity.ok(adminService.getDashboardMetrics());
    }

    @GetMapping("/users")
    public ResponseEntity<org.springframework.data.domain.Page<UserAdminResponse>> getAllUsers(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search,
            @org.springframework.web.bind.annotation.RequestParam(required = false) com.ecotrack.backend.enums.Role role,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Boolean active,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(search, role, active, startDate, endDate, pageable));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<com.ecotrack.backend.dto.response.AdminUserDetailsResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }
}
