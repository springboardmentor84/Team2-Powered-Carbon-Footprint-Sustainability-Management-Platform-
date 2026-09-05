package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.AdminReportGenerationRequest;
import com.ecotrack.backend.dto.response.AdminReportResponse;
import java.util.List;

public interface AdminReportService {
    AdminReportResponse generateAndSaveReport(String adminEmail, AdminReportGenerationRequest request);
    List<AdminReportResponse> getReportHistory();
    byte[] downloadReport(Long reportId);
}
