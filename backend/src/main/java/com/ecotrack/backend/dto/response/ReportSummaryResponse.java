package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryResponse {
    private UserInfo user;
    private CarbonSummary carbonSummary;
    private List<CategoryEmissionResponse> categoryBreakdown;
    private List<CarbonEntryResponse> recentActivities;
    private List<GoalProgressResponse> goals;
    private LocalDateTime generatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String fullName;
        private String email;
        private Integer ecoPoints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonSummary {
        private Double totalCarbonEmission;
        private Long totalEntries;
        private Double averageEmission;
    }
}
