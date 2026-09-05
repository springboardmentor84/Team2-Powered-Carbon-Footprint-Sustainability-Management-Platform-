package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsOverviewResponse {
    private long totalUsers;
    private long totalEntries;
    private double totalEmissions;
    private double averageEmission;
    private long activeUsers;
    private EngagementMetricsDTO engagement;
}
