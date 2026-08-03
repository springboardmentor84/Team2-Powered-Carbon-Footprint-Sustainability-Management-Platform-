package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.DashboardSummaryResponse;
import com.ecotrack.backend.dto.response.CarbonEntryResponse;

import java.util.List;

public interface DashboardService {
    DashboardSummaryResponse getSummary(String email);
    List<CategoryEmissionResponse> getCategoryEmissions(String email);
    Double getDailyEmissions(String email);
    Double getWeeklyEmissions(String email);
    Double getMonthlyEmissions(String email);
    List<CarbonEntryResponse> getRecentEntries(String email);
}
