package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Long totalActivities;
    private Double totalEmissions;
    private Double averageEmissions;
    private String topCategory;
    
    // Monthly data (1-12 representing Jan-Dec)
    private Map<Integer, Double> monthlyEmissions;
    
    private List<CategoryEmissionResponse> categoryBreakdown;
}
