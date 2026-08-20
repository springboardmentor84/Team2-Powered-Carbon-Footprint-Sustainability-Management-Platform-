package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.AnalyticsResponse;

public interface AnalyticsService {
    AnalyticsResponse getAnalytics(String email);
}
