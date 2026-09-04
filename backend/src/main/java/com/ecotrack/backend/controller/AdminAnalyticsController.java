package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.AdminAnalyticsOverviewResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.TopUserEmissionDTO;
import com.ecotrack.backend.dto.response.TrendDTO;
import com.ecotrack.backend.service.interfaces.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AdminAnalyticsOverviewResponse> getOverview() {
        return ResponseEntity.ok(adminAnalyticsService.getOverview());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryEmissionResponse>> getCategories() {
        return ResponseEntity.ok(adminAnalyticsService.getCategoryEmissions());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendDTO>> getTrends(@RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(adminAnalyticsService.getMonthlyTrends(targetYear));
    }

    @GetMapping("/users")
    public ResponseEntity<List<TopUserEmissionDTO>> getTopUsers(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminAnalyticsService.getTopUsers(limit));
    }
}
