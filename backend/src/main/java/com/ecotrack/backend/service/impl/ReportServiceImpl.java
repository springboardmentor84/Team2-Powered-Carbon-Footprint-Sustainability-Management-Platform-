package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.CarbonEntryResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.GoalProgressResponse;
import com.ecotrack.backend.dto.response.ReportSummaryResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.GoalRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.ReportService;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final UserRepository userRepository;
    private final CarbonEntryRepository carbonEntryRepository;
    private final GoalRepository goalRepository;

    @Override
    public ReportSummaryResponse getReportSummary(String email, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateDates(startDate, endDate);

        List<CarbonEntry> entries = getCarbonEntries(email, startDate, endDate);
        List<CategoryEmissionResponse> categories = aggregateCategories(entries);

        Long totalEntries = (long) entries.size();
        Double totalCarbon = entries.stream().mapToDouble(CarbonEntry::getCarbonEmission).sum();
        Double averageEmission = totalEntries > 0 ? totalCarbon / totalEntries : 0.0;

        List<GoalProgressResponse> goals = goalRepository.findAllByUser(user).stream()
                .map(this::mapToGoalProgress)
                .collect(Collectors.toList());

        return ReportSummaryResponse.builder()
                .user(ReportSummaryResponse.UserInfo.builder()
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .ecoPoints(user.getEcoPoints())
                        .build())
                .carbonSummary(ReportSummaryResponse.CarbonSummary.builder()
                        .totalCarbonEmission(roundToTwoDecimals(totalCarbon))
                        .totalEntries(totalEntries)
                        .averageEmission(roundToTwoDecimals(averageEmission))
                        .build())
                .categoryBreakdown(categories)
                .recentActivities(entries.stream().map(this::mapToEntryResponse).collect(Collectors.toList()))
                .goals(goals)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public byte[] generateCsvReport(String email, LocalDate startDate, LocalDate endDate) {
        validateDates(startDate, endDate);
        List<CarbonEntry> entries = getCarbonEntries(email, startDate, endDate);

        StringBuilder csv = new StringBuilder();
        csv.append("id,category,activity,quantity,unit,carbonEmission,createdAt\n");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (CarbonEntry entry : entries) {
            csv.append(entry.getId()).append(",");
            csv.append(escapeCsv(entry.getCategory().name())).append(",");
            csv.append(escapeCsv(entry.getActivity())).append(",");
            csv.append(entry.getQuantity()).append(",");
            csv.append(escapeCsv(entry.getUnit())).append(",");
            csv.append(roundToTwoDecimals(entry.getCarbonEmission())).append(",");
            csv.append(entry.getCreatedAt().format(formatter)).append("\n");
        }

        return csv.toString().getBytes();
    }

    @Override
    public byte[] generatePdfReport(String email, LocalDate startDate, LocalDate endDate) {
        ReportSummaryResponse summary = getReportSummary(email, startDate, endDate);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);

        document.open();
        
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

        Paragraph title = new Paragraph("ECOTRACK SUSTAINABILITY REPORT", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        document.add(new Paragraph("User Information", subtitleFont));
        document.add(new Paragraph("Name: " + summary.getUser().getFullName(), regularFont));
        document.add(new Paragraph("Email: " + summary.getUser().getEmail(), regularFont));
        document.add(new Paragraph("Eco Points: " + summary.getUser().getEcoPoints(), regularFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Carbon Summary", subtitleFont));
        document.add(new Paragraph("Total Entries: " + summary.getCarbonSummary().getTotalEntries(), regularFont));
        document.add(new Paragraph("Total Carbon Emission: " + summary.getCarbonSummary().getTotalCarbonEmission() + " kg", regularFont));
        document.add(new Paragraph("Average Emission: " + summary.getCarbonSummary().getAverageEmission() + " kg", regularFont));
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Category Breakdown", subtitleFont));
        if (summary.getCategoryBreakdown().isEmpty()) {
            document.add(new Paragraph("No data available.", regularFont));
        } else {
            for (CategoryEmissionResponse cat : summary.getCategoryBreakdown()) {
                document.add(new Paragraph(cat.getCategory().name() + ": " + cat.getTotalEmission() + " kg", regularFont));
            }
        }
        document.add(new Paragraph(" "));

        document.add(new Paragraph("Goals & Progress", subtitleFont));
        if (summary.getGoals().isEmpty()) {
            document.add(new Paragraph("No goals set.", regularFont));
        } else {
            for (GoalProgressResponse goal : summary.getGoals()) {
                document.add(new Paragraph("Goal: " + goal.getTitle() + " | Status: " + goal.getStatus(), regularFont));
                document.add(new Paragraph("Target: " + goal.getTargetCarbon() + " kg | Current: " + goal.getCurrentCarbon() + " kg (" + goal.getCompletionPercentage() + "%)", regularFont));
                document.add(new Paragraph(" "));
            }
        }

        document.add(new Paragraph("Report Generated At: " + summary.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), regularFont));

        document.close();
        return out.toByteArray();
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }

    private List<CarbonEntry> getCarbonEntries(String email, LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return carbonEntryRepository.findByUser_EmailAndCreatedAtBetweenOrderByCreatedAtDesc(
                    email, startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));
        }
        return carbonEntryRepository.findByUser_EmailOrderByCreatedAtDesc(email);
    }

    private List<CategoryEmissionResponse> aggregateCategories(List<CarbonEntry> entries) {
        return entries.stream()
                .collect(Collectors.groupingBy(CarbonEntry::getCategory, Collectors.summingDouble(CarbonEntry::getCarbonEmission)))
                .entrySet().stream()
                .map(e -> new CategoryEmissionResponse(e.getKey(), roundToTwoDecimals(e.getValue())))
                .collect(Collectors.toList());
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

    private CarbonEntryResponse mapToEntryResponse(CarbonEntry entry) {
        return CarbonEntryResponse.builder()
                .id(entry.getId())
                .category(entry.getCategory())
                .activity(entry.getActivity())
                .quantity(entry.getQuantity())
                .unit(entry.getUnit())
                .carbonEmission(roundToTwoDecimals(entry.getCarbonEmission()))
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }

    private GoalProgressResponse mapToGoalProgress(Goal goal) {
        Double remaining = Math.max(0, goal.getTargetCarbon() - goal.getCurrentCarbon());
        Double percentage = 0.0;
        if (goal.getTargetCarbon() > 0) {
            percentage = (goal.getCurrentCarbon() / goal.getTargetCarbon()) * 100;
        }
        
        return GoalProgressResponse.builder()
                .goalId(goal.getId())
                .title(goal.getTitle())
                .targetCarbon(goal.getTargetCarbon())
                .currentCarbon(roundToTwoDecimals(goal.getCurrentCarbon()))
                .remainingCarbon(roundToTwoDecimals(remaining))
                .completionPercentage(roundToTwoDecimals(percentage))
                .status(goal.getStatus().name())
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .build();
    }
}
