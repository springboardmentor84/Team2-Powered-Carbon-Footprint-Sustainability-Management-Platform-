package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.*;
import com.ecotrack.backend.enums.ChallengeParticipationStatus;
import com.ecotrack.backend.enums.GoalStatus;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.repository.*;
import com.ecotrack.backend.service.interfaces.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final CarbonEntryRepository carbonEntryRepository;
    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository challengeParticipationRepository;
    private final GeneratedReportRepository generatedReportRepository;

    private LocalDateTime getStart(LocalDate date) {
        return date != null ? date.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
    }

    private LocalDateTime getEnd(LocalDate date) {
        return date != null ? date.atTime(LocalTime.MAX) : LocalDateTime.now().plusYears(100);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminAnalyticsOverviewResponse getOverview(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = getStart(startDate);
        LocalDateTime end = getEnd(endDate);

        long totalUsers = userRepository.countByRoleAndCreatedAtBetween(Role.USER, start, end);
        long activeUsers = userRepository.countByRoleAndActiveTrueAndCreatedAtBetween(Role.USER, start, end);
        long totalEntries = carbonEntryRepository.countByCreatedAtBetween(start, end);
        Double totalEmissionsObj = carbonEntryRepository.sumGlobalCarbonEmissionBetween(start, end);
        double totalEmissions = totalEmissionsObj != null ? totalEmissionsObj : 0.0;
        
        double averageEmission = totalEntries > 0 ? totalEmissions / totalEntries : 0.0;

        EngagementMetricsDTO engagement = EngagementMetricsDTO.builder()
                .totalGoals(goalRepository.countByCreatedAtBetween(start, end))
                .activeGoals(goalRepository.countByStatusAndCreatedAtBetween(GoalStatus.ACTIVE, start, end))
                .completedGoals(goalRepository.countByStatusAndCreatedAtBetween(GoalStatus.COMPLETED, start, end))
                .failedGoals(goalRepository.countByStatusAndCreatedAtBetween(GoalStatus.FAILED, start, end))
                .totalChallenges(challengeRepository.countByCreatedAtBetween(start, end))
                .activeChallenges(challengeRepository.countActiveChallengesBetween(LocalDate.now(), start, end))
                .totalChallengeParticipants(challengeParticipationRepository.countDistinctUsersByJoinedAtBetween(start, end))
                .completedChallengeParticipations(0) // Not tracked by DB schema
                .reportsGenerated(generatedReportRepository.countByGeneratedAtBetween(start, end))
                .build();
        
        return AdminAnalyticsOverviewResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalEntries(totalEntries)
                .totalEmissions(totalEmissions)
                .averageEmission(averageEmission)
                .engagement(engagement)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryEmissionResponse> getCategoryEmissions(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = getStart(startDate);
        LocalDateTime end = getEnd(endDate);
        return carbonEntryRepository.findGlobalCategoryEmissionsBetween(start, end);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrendDTO> getEmissionTrends(String period, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = getStart(startDate);
        LocalDateTime end = getEnd(endDate);
        
        List<Object[]> results;
        if ("weekly".equalsIgnoreCase(period)) {
            results = carbonEntryRepository.findWeeklyTrend(start, end);
        } else if ("monthly".equalsIgnoreCase(period)) {
            results = carbonEntryRepository.findMonthlyTrend(start, end);
        } else if ("yearly".equalsIgnoreCase(period)) {
            results = carbonEntryRepository.findYearlyTrend(start, end);
        } else {
            results = carbonEntryRepository.findDailyTrend(start, end); // default to daily
        }

        List<TrendDTO> trends = new ArrayList<>();
        
        for (Object[] result : results) {
            if (result[0] != null && result[1] != null) {
                // native query returns timestamp/date in result[0]
                String periodLabel = result[0].toString().split(" ")[0]; // Just take the date part
                double emission = ((Number) result[1]).doubleValue();
                trends.add(new TrendDTO(periodLabel, emission));
            }
        }
        
        return trends;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopUserEmissionDTO> getTopUsers(int limit, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = getStart(startDate);
        LocalDateTime end = getEnd(endDate);
        return carbonEntryRepository.findTopUsersByEmissionBetween(start, end, PageRequest.of(0, limit));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityMetricDTO> getMostRecordedActivities(int limit, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = getStart(startDate);
        LocalDateTime end = getEnd(endDate);
        return carbonEntryRepository.findMostRecordedActivitiesBetween(start, end, PageRequest.of(0, limit));
    }
}
