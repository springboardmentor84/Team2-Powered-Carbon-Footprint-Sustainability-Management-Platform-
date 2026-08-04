package com.ecotrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalProgressResponse {
    private Long goalId;
    private String title;
    private Double targetCarbon;
    private Double currentCarbon;
    private Double remainingCarbon;
    private Double completionPercentage;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
}
