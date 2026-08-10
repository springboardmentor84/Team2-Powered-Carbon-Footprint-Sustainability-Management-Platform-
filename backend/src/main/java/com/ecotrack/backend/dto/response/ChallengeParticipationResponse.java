package com.ecotrack.backend.dto.response;

import com.ecotrack.backend.enums.ChallengeParticipationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeParticipationResponse {
    private Long id;
    private Long challengeId;
    private String challengeTitle;
    private Long userId;
    private String userName;
    private LocalDateTime joinedAt;
    private ChallengeParticipationStatus status;
}
