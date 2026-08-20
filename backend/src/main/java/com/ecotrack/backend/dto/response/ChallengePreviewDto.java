package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengePreviewDto {
    private Long id;
    private String title;
    private String description;
    private Double target;
    private String unit;
    private Double progress;
    private Integer rewardPoints;
}
