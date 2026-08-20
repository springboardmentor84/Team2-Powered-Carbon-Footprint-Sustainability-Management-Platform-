package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.GamificationSummaryResponse;
import com.ecotrack.backend.service.interfaces.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/summary")
    public ResponseEntity<GamificationSummaryResponse> getSummary(Authentication authentication) {
        return ResponseEntity.ok(gamificationService.getGamificationSummary(authentication.getName()));
    }

    @PostMapping("/rewards/{id}/redeem")
    public ResponseEntity<Void> redeemReward(
            @PathVariable Long id,
            Authentication authentication) {
        gamificationService.redeemReward(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
