package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.RewardPointsResponse;
import com.ecotrack.backend.dto.response.RewardTransactionResponse;
import com.ecotrack.backend.service.interfaces.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<RewardTransactionResponse>> getRewardHistory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rewardService.getRewardHistory(email));
    }

    @GetMapping("/points")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<RewardPointsResponse> getTotalPoints(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rewardService.getTotalPoints(email));
    }
}
