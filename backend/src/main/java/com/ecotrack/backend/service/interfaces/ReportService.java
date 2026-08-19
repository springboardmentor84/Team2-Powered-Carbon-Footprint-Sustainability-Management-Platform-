package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.GenerateReportRequest;
import com.ecotrack.backend.dto.response.GeneratedReportResponse;
import com.ecotrack.backend.dto.response.ReportSummaryResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    ReportSummaryResponse getReportSummary(String email, LocalDate startDate, LocalDate endDate);
    byte[] generateCsvReport(String email, LocalDate startDate, LocalDate endDate);
    byte[] generatePdfReport(String email, LocalDate startDate, LocalDate endDate);
    
    GeneratedReportResponse generateAndSaveReport(String email, GenerateReportRequest request);
    List<GeneratedReportResponse> getReportHistory(String email);
    byte[] downloadReport(String email, Long reportId);
}
