package com.ecotrack.backend.dto.response;

import com.ecotrack.backend.enums.ChallengeCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private ChallengeCategory category;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double target;
    private String unit;
    private Integer rewardPoints;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
