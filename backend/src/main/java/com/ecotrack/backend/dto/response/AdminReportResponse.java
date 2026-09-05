package com.ecotrack.backend.dto.response;

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
public class AdminReportResponse {
    private Long id;
    private String reportPeriod;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalEmissions;
    private Integer totalActivities;
    private String format;
    private Integer downloads;
    private LocalDateTime generatedAt;
    private String generatedBy; // Admin email/name
}
