package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.AnalyticsResponse;
import com.ecotrack.backend.service.interfaces.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(Principal principal) {
        AnalyticsResponse response = analyticsService.getAnalytics(principal.getName());
        return ResponseEntity.ok(response);
    }
}
