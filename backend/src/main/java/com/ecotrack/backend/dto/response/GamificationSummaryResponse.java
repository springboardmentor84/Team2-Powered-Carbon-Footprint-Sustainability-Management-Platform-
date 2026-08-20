package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationSummaryResponse {
    private Integer ecoPoints;
    private Integer currentLevel;
    private String levelName;
    private Integer pointsToNextLevel;
    private Double progressPercentage;
    
    private List<BadgeDto> earnedBadges;
    private List<BadgeDto> lockedBadges;
    private List<RewardDto> availableRewards;
    private List<ChallengePreviewDto> activeChallenges;
}
