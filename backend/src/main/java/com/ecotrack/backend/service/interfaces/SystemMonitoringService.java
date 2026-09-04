package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.SystemHealthResponse;

public interface SystemMonitoringService {
    SystemHealthResponse getSystemHealth();
}
