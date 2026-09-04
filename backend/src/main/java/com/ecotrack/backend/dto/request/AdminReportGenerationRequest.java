package com.ecotrack.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AdminReportGenerationRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String format; // "PDF" or "CSV"
}
