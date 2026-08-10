package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeLeaderboardResponse {
    private Integer rank;
    private Long userId;
    private String fullName;
    private String profileImage;
    private Double currentProgress;
    private Double target;
    private String unit;
    private Double completionPercentage;
    private String challengeStatus;
}
