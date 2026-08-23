package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminChallengeDetailsResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Double target;
    private Integer reward;
    private LocalDate startDate;
    private LocalDate endDate;
    private String createdBy;
    private LocalDateTime createdAt;
    
    // Aggregated stats
    private Long participantCount;
    private Long completionCount;
    private String status;
}
