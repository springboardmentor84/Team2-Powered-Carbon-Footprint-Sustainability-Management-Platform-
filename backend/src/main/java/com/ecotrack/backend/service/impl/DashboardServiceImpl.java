package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.CarbonEntryResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.DashboardSummaryResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CarbonEntryRepository carbonEntryRepository;

    @Override
    public DashboardSummaryResponse getSummary(String email) {
        Long totalEntries = carbonEntryRepository.countByUser_Email(email);
        Double totalCarbonEmission = carbonEntryRepository.sumCarbonEmissionByUser_Email(email);
        
        if (totalCarbonEmission == null) {
            totalCarbonEmission = 0.0;
        }

        Double averageEmission = 0.0;
        if (totalEntries != null && totalEntries > 0) {
            averageEmission = totalCarbonEmission / totalEntries;
        }

        return DashboardSummaryResponse.builder()
                .totalEntries(totalEntries == null ? 0L : totalEntries)
                .totalCarbonEmission(roundToTwoDecimals(totalCarbonEmission))
                .averageEmission(roundToTwoDecimals(averageEmission))
                .build();
    }

    @Override
    public List<CategoryEmissionResponse> getCategoryEmissions(String email) {
        return carbonEntryRepository.findCategoryEmissionsByUser_Email(email).stream()
                .peek(response -> {
                    if (response.getTotalEmission() != null) {
                        response.setTotalEmission(roundToTwoDecimals(response.getTotalEmission()));
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public Double getDailyEmissions(String email) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return getEmissionsInRange(email, startOfDay, endOfDay);
    }

    @Override
    public Double getWeeklyEmissions(String email) {
        LocalDateTime startOfWeek = LocalDate.now().minusDays(6).atStartOfDay(); // Last 7 days including today
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return getEmissionsInRange(email, startOfWeek, endOfDay);
    }

    @Override
    public Double getMonthlyEmissions(String email) {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return getEmissionsInRange(email, startOfMonth, endOfDay);
    }

    @Override
    public List<CarbonEntryResponse> getRecentEntries(String email) {
        return carbonEntryRepository.findTop5ByUser_EmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Double getEmissionsInRange(String email, LocalDateTime start, LocalDateTime end) {
        Double total = carbonEntryRepository.sumCarbonEmissionByUser_EmailAndCreatedAtBetween(email, start, end);
        if (total == null) return 0.0;
        return roundToTwoDecimals(total);
    }

    private Double roundToTwoDecimals(Double value) {
        if (value == null) return 0.0;
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private CarbonEntryResponse mapToResponse(CarbonEntry entry) {
        return CarbonEntryResponse.builder()
                .id(entry.getId())
                .category(entry.getCategory())
                .activity(entry.getActivity())
                .quantity(entry.getQuantity())
                .unit(entry.getUnit())
                .carbonEmission(entry.getCarbonEmission())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
