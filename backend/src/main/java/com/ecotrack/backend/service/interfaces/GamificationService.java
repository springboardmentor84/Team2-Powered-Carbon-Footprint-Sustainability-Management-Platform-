package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.GamificationSummaryResponse;

public interface GamificationService {
    GamificationSummaryResponse getGamificationSummary(String email);
    void redeemReward(String email, Long rewardId);
}
