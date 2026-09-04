package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EngagementMetricsDTO {
    private long totalGoals;
    private long activeGoals;
    private long completedGoals;
    private long failedGoals;
    
    private long totalChallenges;
    private long activeChallenges;
    private long totalChallengeParticipants;
    private long completedChallengeParticipations;
    
    private long reportsGenerated;
}
