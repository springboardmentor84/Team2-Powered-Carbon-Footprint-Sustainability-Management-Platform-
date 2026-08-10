package com.ecotrack.backend.dto.request;

import com.ecotrack.backend.enums.ChallengeCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ChallengeCategory category;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Target is required")
    @Positive(message = "Target must be positive")
    private Double target;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Reward points are required")
    @PositiveOrZero(message = "Reward points must not be negative")
    private Integer rewardPoints;
}
