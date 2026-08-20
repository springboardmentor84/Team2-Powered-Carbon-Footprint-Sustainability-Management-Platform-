package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.AnalyticsResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.service.interfaces.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final CarbonEntryRepository carbonEntryRepository;

    @Override
    public AnalyticsResponse getAnalytics(String email) {
        Long totalActivities = carbonEntryRepository.countByUser_Email(email);
        
        Double totalEmissions = carbonEntryRepository.sumCarbonEmissionByUser_Email(email);
        if (totalEmissions == null) {
            totalEmissions = 0.0;
        }

        Double averageEmissions = totalActivities > 0 ? totalEmissions / totalActivities : 0.0;

        List<CategoryEmissionResponse> categoryBreakdown = carbonEntryRepository.findCategoryEmissionsByUser_Email(email);
        
        String topCategory = "-";
        double maxEmission = -1.0;
        for (CategoryEmissionResponse response : categoryBreakdown) {
            if (response.getTotalEmission() > maxEmission) {
                maxEmission = response.getTotalEmission();
                topCategory = response.getCategory().name();
            }
        }

        int currentYear = LocalDate.now().getYear();
        List<Object[]> monthlyData = carbonEntryRepository.findMonthlyEmissionsByUserEmailAndYear(email, currentYear);
        
        Map<Integer, Double> monthlyEmissions = new HashMap<>();
        for (int i = 1; i <= 12; i++) {
            monthlyEmissions.put(i, 0.0);
        }
        
        for (Object[] row : monthlyData) {
            if (row[0] != null && row[1] != null) {
                // PostgreSQL EXTRACT(MONTH) returns numeric/double/integer depending on the driver
                Integer month = ((Number) row[0]).intValue();
                Double sum = ((Number) row[1]).doubleValue();
                monthlyEmissions.put(month, sum);
            }
        }

        return AnalyticsResponse.builder()
                .totalActivities(totalActivities)
                .totalEmissions(Math.round(totalEmissions * 100.0) / 100.0)
                .averageEmissions(Math.round(averageEmissions * 100.0) / 100.0)
                .topCategory(topCategory)
                .monthlyEmissions(monthlyEmissions)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }
}
