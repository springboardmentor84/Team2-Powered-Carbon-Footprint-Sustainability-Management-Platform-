package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.AdminReportGenerationRequest;
import com.ecotrack.backend.dto.response.AdminReportResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.GeneratedReport;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.GeneratedReportRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.AdminReportService;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminReportServiceImpl implements AdminReportService {

    private final UserRepository userRepository;
    private final CarbonEntryRepository carbonEntryRepository;
    private final GeneratedReportRepository generatedReportRepository;

    @Override
    public AdminReportResponse generateAndSaveReport(String adminEmail, AdminReportGenerationRequest request) {
        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        validateDates(request.getStartDate(), request.getEndDate());

        List<CarbonEntry> entries = getCarbonEntries(request.getStartDate(), request.getEndDate());
        Double totalCarbon = entries.stream().mapToDouble(CarbonEntry::getCarbonEmission).sum();

        byte[] fileBytes;
        if ("CSV".equalsIgnoreCase(request.getFormat())) {
            fileBytes = generateCsvReport(entries);
        } else {
            fileBytes = generatePdfReport(adminUser, entries, request.getStartDate(), request.getEndDate());
        }

        GeneratedReport report = GeneratedReport.builder()
                .user(adminUser)
                .reportPeriod("SYSTEM_WIDE")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalEmissions(roundToTwoDecimals(totalCarbon))
                .totalActivities(entries.size())
                .format(request.getFormat() != null ? request.getFormat().toUpperCase() : "PDF")
                .downloads(0)
                .fileData(fileBytes)
                .build();

        GeneratedReport savedReport = generatedReportRepository.save(report);
        return mapToAdminReportResponse(savedReport);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminReportResponse> getReportHistory() {
        return generatedReportRepository.findAll().stream()
                .map(this::mapToAdminReportResponse)
                .collect(Collectors.toList());
    }

    @Override
    public byte[] downloadReport(Long reportId) {
        GeneratedReport report = generatedReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setDownloads(report.getDownloads() + 1);
        generatedReportRepository.save(report);
        return report.getFileData();
    }

    private byte[] generateCsvReport(List<CarbonEntry> entries) {
        StringBuilder csv = new StringBuilder();
        csv.append("id,userEmail,category,activity,quantity,unit,carbonEmission,createdAt\n");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (CarbonEntry entry : entries) {
            csv.append(entry.getId()).append(",");
            csv.append(escapeCsv(entry.getUser().getEmail())).append(",");
            csv.append(escapeCsv(entry.getCategory().name())).append(",");
            csv.append(escapeCsv(entry.getActivity())).append(",");
            csv.append(entry.getQuantity()).append(",");
            csv.append(escapeCsv(entry.getUnit())).append(",");
            csv.append(roundToTwoDecimals(entry.getCarbonEmission())).append(",");
            csv.append(entry.getCreatedAt().format(formatter)).append("\n");
        }
        return csv.toString().getBytes();
    }

    private byte[] generatePdfReport(User adminUser, List<CarbonEntry> entries, LocalDate startDate, LocalDate endDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);

        document.open();
        
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

        Paragraph title = new Paragraph("ECOTRACK SYSTEM REPORT", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        document.add(new Paragraph("Generated By: " + adminUser.getFullName() + " (" + adminUser.getEmail() + ")", regularFont));
        String period = (startDate != null ? startDate.toString() : "Beginning") + " to " + (endDate != null ? endDate.toString() : "Present");
        document.add(new Paragraph("Period: " + period, regularFont));
        document.add(new Paragraph(" "));

        Double totalCarbon = entries.stream().mapToDouble(CarbonEntry::getCarbonEmission).sum();
        long totalUsers = userRepository.count();

        document.add(new Paragraph("System Summary", subtitleFont));
        document.add(new Paragraph("Total Registered Users: " + totalUsers, regularFont));
        document.add(new Paragraph("Total Entries in Period: " + entries.size(), regularFont));
        document.add(new Paragraph("Total Carbon Emission in Period: " + roundToTwoDecimals(totalCarbon) + " kg", regularFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Category Breakdown", subtitleFont));
        List<CategoryEmissionResponse> categories = entries.stream()
                .collect(Collectors.groupingBy(CarbonEntry::getCategory, Collectors.summingDouble(CarbonEntry::getCarbonEmission)))
                .entrySet().stream()
                .map(e -> new CategoryEmissionResponse(e.getKey(), roundToTwoDecimals(e.getValue())))
                .collect(Collectors.toList());

        if (categories.isEmpty()) {
            document.add(new Paragraph("No data available.", regularFont));
        } else {
            for (CategoryEmissionResponse cat : categories) {
                document.add(new Paragraph(cat.getCategory().name() + ": " + cat.getTotalEmission() + " kg", regularFont));
            }
        }
        document.add(new Paragraph(" "));
        document.close();
        return out.toByteArray();
    }

    private AdminReportResponse mapToAdminReportResponse(GeneratedReport report) {
        return AdminReportResponse.builder()
                .id(report.getId())
                .reportPeriod(report.getReportPeriod())
                .startDate(report.getStartDate())
                .endDate(report.getEndDate())
                .totalEmissions(report.getTotalEmissions())
                .totalActivities(report.getTotalActivities())
                .format(report.getFormat())
                .downloads(report.getDownloads())
                .generatedAt(report.getGeneratedAt())
                .generatedBy(report.getUser() != null ? report.getUser().getEmail() : "Unknown")
                .build();
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }

    private List<CarbonEntry> getCarbonEntries(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return carbonEntryRepository.findAll().stream()
                    .filter(e -> !e.getCreatedAt().toLocalDate().isBefore(startDate) && !e.getCreatedAt().toLocalDate().isAfter(endDate))
                    .collect(Collectors.toList());
        }
        return carbonEntryRepository.findAll();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private Double roundToTwoDecimals(Double value) {
        if (value == null) return 0.0;
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
