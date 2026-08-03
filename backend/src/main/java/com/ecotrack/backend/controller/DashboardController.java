package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.CarbonEntryResponse;
import com.ecotrack.backend.dto.response.CategoryEmissionResponse;
import com.ecotrack.backend.dto.response.DashboardSummaryResponse;
import com.ecotrack.backend.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getSummary(authentication.getName()));
    }

    @GetMapping("/category")
    public ResponseEntity<List<CategoryEmissionResponse>> getCategoryEmissions(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getCategoryEmissions(authentication.getName()));
    }

    @GetMapping("/daily")
    public ResponseEntity<Double> getDailyEmissions(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getDailyEmissions(authentication.getName()));
    }

    @GetMapping("/weekly")
    public ResponseEntity<Double> getWeeklyEmissions(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getWeeklyEmissions(authentication.getName()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<Double> getMonthlyEmissions(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getMonthlyEmissions(authentication.getName()));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<CarbonEntryResponse>> getRecentEntries(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getRecentEntries(authentication.getName()));
    }
}
