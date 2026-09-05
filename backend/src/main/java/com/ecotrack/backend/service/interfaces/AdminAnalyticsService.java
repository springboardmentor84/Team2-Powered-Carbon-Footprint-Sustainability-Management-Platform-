package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.AdminAnalyticsOverviewResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.TopUserEmissionDTO;
import com.ecotrack.backend.dto.response.TrendDTO;
import com.ecotrack.backend.dto.response.ActivityMetricDTO;
import com.ecotrack.backend.dto.response.EngagementMetricsDTO;

import java.util.List;
import java.time.LocalDate;

public interface AdminAnalyticsService {
    AdminAnalyticsOverviewResponse getOverview(LocalDate startDate, LocalDate endDate);
    List<CategoryEmissionResponse> getCategoryEmissions(LocalDate startDate, LocalDate endDate);
    List<TrendDTO> getEmissionTrends(String period, LocalDate startDate, LocalDate endDate);
    List<TopUserEmissionDTO> getTopUsers(int limit, LocalDate startDate, LocalDate endDate);
    List<ActivityMetricDTO> getMostRecordedActivities(int limit, LocalDate startDate, LocalDate endDate);
}
