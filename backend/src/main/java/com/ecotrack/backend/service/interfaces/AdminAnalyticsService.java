package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.AdminAnalyticsOverviewResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.TopUserEmissionDTO;
import com.ecotrack.backend.dto.response.TrendDTO;

import java.util.List;

public interface AdminAnalyticsService {
    AdminAnalyticsOverviewResponse getOverview();
    List<CategoryEmissionResponse> getCategoryEmissions();
    List<TrendDTO> getMonthlyTrends(int year);
    List<TopUserEmissionDTO> getTopUsers(int limit);
}
