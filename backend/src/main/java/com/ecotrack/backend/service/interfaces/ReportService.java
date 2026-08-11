package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.ReportSummaryResponse;

import java.time.LocalDate;

public interface ReportService {
    ReportSummaryResponse getReportSummary(String email, LocalDate startDate, LocalDate endDate);
    byte[] generateCsvReport(String email, LocalDate startDate, LocalDate endDate);
    byte[] generatePdfReport(String email, LocalDate startDate, LocalDate endDate);
}
