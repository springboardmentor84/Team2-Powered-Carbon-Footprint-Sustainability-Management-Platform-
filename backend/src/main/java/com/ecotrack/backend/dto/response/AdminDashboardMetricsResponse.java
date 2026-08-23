package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardMetricsResponse {
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    
    private long totalEcoPointsGenerated;
    private long totalRewardActivities;
    private long totalCarbonActivities;
    
    private long totalChallenges;
    private long completedChallenges;
    private long activeChallengeParticipations;
    
    private double totalCarbonEmissions;
    private double averageCarbonEmission;
    
    private long activeGoals;
    private long completedGoals;
    
    // Using generic maps for now, can be structured if needed
    private java.util.List<com.ecotrack.backend.dto.response.CategoryEmissionResponse> categoryEmissions;
    private java.util.List<java.util.Map<String, Object>> recentActivity;
    private java.util.List<com.ecotrack.backend.dto.response.UserAdminResponse> topEcoUsers;
    private long activeChallenges;
}
