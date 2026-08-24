package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.RecommendationResponse;
import com.ecotrack.backend.service.interfaces.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean refresh) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(recommendationService.getRecommendations(email, refresh));
    }
}
