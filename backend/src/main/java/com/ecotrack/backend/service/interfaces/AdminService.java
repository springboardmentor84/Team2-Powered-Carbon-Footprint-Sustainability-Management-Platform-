package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.AdminDashboardMetricsResponse;

import java.util.List;
import com.ecotrack.backend.dto.response.UserAdminResponse;

public interface AdminService {
    AdminDashboardMetricsResponse getDashboardMetrics();
    org.springframework.data.domain.Page<UserAdminResponse> getAllUsers(String search, com.ecotrack.backend.enums.Role role, Boolean active, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, org.springframework.data.domain.Pageable pageable);
    com.ecotrack.backend.dto.response.AdminUserDetailsResponse getUserById(Long id);
}
