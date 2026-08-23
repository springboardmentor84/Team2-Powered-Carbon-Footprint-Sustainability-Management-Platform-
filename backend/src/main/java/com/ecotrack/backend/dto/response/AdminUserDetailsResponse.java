package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserDetailsResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Integer ecoPoints;
    private Boolean active;
    private LocalDateTime createdAt;
    
    // Aggregated stats
    private Long totalCarbonEntries;
    private Double totalCarbonEmissions;
    
    private Long activeGoals;
    private Long completedGoals;
    
    private Long activeChallenges;
    private Long completedChallenges;
    private Long expiredChallenges;
    private Long totalParticipations;
    
    private Long rewardActivities;
    private Long totalRewardedPoints;
    
    private String profileImage;
}
