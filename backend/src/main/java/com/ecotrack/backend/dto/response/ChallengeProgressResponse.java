package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeProgressResponse {
    private Long challengeId;
    private String challengeTitle;
    private Double target;
    private Double currentProgress;
    private String unit;
    private Double completionPercentage;
    private String participationStatus;
    private String challengeStatus;
    private Boolean rewardGranted;
}
