package com.ecotrack.backend.service;

import com.ecotrack.backend.dto.response.ReportSummaryResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.CarbonCategory;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.GeneratedReportRepository;
import com.ecotrack.backend.repository.GoalRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.impl.ReportServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportServiceImpl Unit Tests")
class ReportServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CarbonEntryRepository carbonEntryRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private GeneratedReportRepository generatedReportRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private User buildUser() {
        return User.builder()
                .id(1L).fullName("Test User").email("user@ecotrack.com")
                .role(Role.USER).ecoPoints(100).active(true).build();
    }

    private CarbonEntry buildEntry(CarbonCategory category, double emission) {
        CarbonEntry entry = CarbonEntry.builder()
                .category(category)
                .activity("Test activity")
                .quantity(1.0)
                .unit("km")
                .carbonEmission(emission)
                .build();
        org.springframework.test.util.ReflectionTestUtils.setField(entry, "createdAt", LocalDateTime.now());
        org.springframework.test.util.ReflectionTestUtils.setField(entry, "updatedAt", LocalDateTime.now());
        return entry;
    }

    // ============================================================
    // REPORT SUMMARY
    // ============================================================

    @Test
    @DisplayName("getReportSummary - returns correct totals and category breakdown")
    void getReportSummary_returnsCorrectData() {
        // Arrange
        User user = buildUser();
        List<CarbonEntry> entries = List.of(
                buildEntry(CarbonCategory.TRANSPORT, 20.0),
                buildEntry(CarbonCategory.TRANSPORT, 10.0),
                buildEntry(CarbonCategory.FOOD, 15.0)
        );

        when(userRepository.findByEmail("user@ecotrack.com")).thenReturn(Optional.of(user));
        when(carbonEntryRepository.findByUser_EmailOrderByCreatedAtDesc("user@ecotrack.com"))
                .thenReturn(entries);
        when(goalRepository.findAllByUser(user)).thenReturn(List.of());

        // Act
        ReportSummaryResponse response = reportService.getReportSummary(
                "user@ecotrack.com", null, null);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getCarbonSummary().getTotalEntries()).isEqualTo(3L);
        assertThat(response.getCarbonSummary().getTotalCarbonEmission()).isEqualTo(45.0);
        assertThat(response.getCarbonSummary().getAverageEmission()).isEqualTo(15.0);
        assertThat(response.getUser().getEmail()).isEqualTo("user@ecotrack.com");
        assertThat(response.getCategoryBreakdown()).hasSize(2); // TRANSPORT + FOOD
    }

    @Test
    @DisplayName("getReportSummary - throws ResourceNotFoundException when user not found")
    void getReportSummary_userNotFound_throwsException() {
        when(userRepository.findByEmail("unknown@ecotrack.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                reportService.getReportSummary("unknown@ecotrack.com", null, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getReportSummary - throws IllegalArgumentException when startDate is after endDate")
    void getReportSummary_invalidDateRange_throwsException() {
        User user = buildUser();
        when(userRepository.findByEmail("user@ecotrack.com")).thenReturn(Optional.of(user));

        LocalDate start = LocalDate.of(2026, 8, 25);
        LocalDate end = LocalDate.of(2026, 8, 1); // end before start

        assertThatThrownBy(() ->
                reportService.getReportSummary("user@ecotrack.com", start, end))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Start date cannot be after end date");
    }

    // ============================================================
    // CSV EXPORT
    // ============================================================

    @Test
    @DisplayName("generateCsvReport - CSV contains header row and data rows")
    void generateCsvReport_containsHeaderAndData() {
        // Arrange
        List<CarbonEntry> entries = List.of(
                buildEntry(CarbonCategory.TRANSPORT, 12.5),
                buildEntry(CarbonCategory.FOOD, 8.0)
        );

        when(carbonEntryRepository.findByUser_EmailOrderByCreatedAtDesc("user@ecotrack.com"))
                .thenReturn(entries);

        // Act
        byte[] csv = reportService.generateCsvReport("user@ecotrack.com", null, null);
        String csvContent = new String(csv);

        // Assert
        assertThat(csvContent).contains("id,category,activity,quantity,unit,carbonEmission,createdAt");
        assertThat(csvContent).contains("TRANSPORT");
        assertThat(csvContent).contains("FOOD");
        assertThat(csvContent).contains("12.5");
        assertThat(csvContent).contains("8.0");
    }

    @Test
    @DisplayName("generateCsvReport - returns only header for empty entry list")
    void generateCsvReport_noEntries_returnsOnlyHeader() {
        when(carbonEntryRepository.findByUser_EmailOrderByCreatedAtDesc("empty@ecotrack.com"))
                .thenReturn(List.of());

        byte[] csv = reportService.generateCsvReport("empty@ecotrack.com", null, null);
        String csvContent = new String(csv);

        assertThat(csvContent).contains("id,category,activity");
        // Only one line (the header) — no data rows
        assertThat(csvContent.trim().lines().count()).isEqualTo(1);
    }

    // ============================================================
    // PDF EXPORT
    // ============================================================

    @Test
    @DisplayName("generatePdfReport - returns non-empty byte array with valid PDF header")
    void generatePdfReport_returnsValidPdfBytes() {
        // Arrange
        User user = buildUser();
        List<CarbonEntry> entries = List.of(buildEntry(CarbonCategory.ELECTRICITY, 25.0));

        when(userRepository.findByEmail("user@ecotrack.com")).thenReturn(Optional.of(user));
        when(carbonEntryRepository.findByUser_EmailOrderByCreatedAtDesc("user@ecotrack.com"))
                .thenReturn(entries);
        when(goalRepository.findAllByUser(user)).thenReturn(List.of());

        // Act
        byte[] pdf = reportService.generatePdfReport("user@ecotrack.com", null, null);

        // Assert: PDF files start with the magic bytes "%PDF"
        assertThat(pdf).isNotEmpty();
        String header = new String(pdf, 0, Math.min(4, pdf.length));
        assertThat(header).isEqualTo("%PDF");
    }
}
