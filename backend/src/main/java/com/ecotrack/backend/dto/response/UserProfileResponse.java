package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    private String fullName;
    private String email;
    private String profileImage;
    private String preferences;
    private Integer ecoPoints;
    private String role;
    private String nextLevel;
    private Integer pointsRemaining;
    private Integer progressPercentage;
}
