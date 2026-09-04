package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.AdminAnalyticsOverviewResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.TopUserEmissionDTO;
import com.ecotrack.backend.dto.response.TrendDTO;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsOverviewResponse getOverview() {
        long totalUsers = userRepository.countByRole(Role.USER);
        long activeUsers = userRepository.countByRoleAndActiveTrue(Role.USER);
        long totalEntries = carbonEntryRepository.count();
        Double totalEmissionsObj = carbonEntryRepository.sumGlobalCarbonEmission();
        double totalEmissions = totalEmissionsObj != null ? totalEmissionsObj : 0.0;
        
        double averageEmission = totalEntries > 0 ? totalEmissions / totalEntries : 0.0;
        
        return AdminAnalyticsOverviewResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalEntries(totalEntries)
                .totalEmissions(totalEmissions)
                .averageEmission(averageEmission)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryEmissionResponse> getCategoryEmissions() {
        return carbonEntryRepository.findGlobalCategoryEmissions();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrendDTO> getMonthlyTrends(int year) {
        List<Object[]> results = carbonEntryRepository.findGlobalMonthlyEmissionsByYear(year);
        List<TrendDTO> trends = new ArrayList<>();
        
        // Initialize all 12 months with 0
        for (int i = 1; i <= 12; i++) {
            String monthName = Month.of(i).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            trends.add(new TrendDTO(monthName, 0.0));
        }
        
        for (Object[] result : results) {
            if (result[0] != null && result[1] != null) {
                int monthIndex = ((Number) result[0]).intValue() - 1;
                double emission = ((Number) result[1]).doubleValue();
                if (monthIndex >= 0 && monthIndex < 12) {
                    trends.get(monthIndex).setAmount(emission);
                }
            }
        }
        
        return trends;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopUserEmissionDTO> getTopUsers(int limit) {
        return carbonEntryRepository.findTopUsersByEmission(PageRequest.of(0, limit));
    }
}
