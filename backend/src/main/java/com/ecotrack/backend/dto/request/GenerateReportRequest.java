package com.ecotrack.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateReportRequest {
    @NotBlank(message = "reportPeriod is required")
    private String reportPeriod;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format; // "PDF" or "CSV"
}
