package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.RewardPointsResponse;
import com.ecotrack.backend.dto.response.RewardTransactionResponse;
import com.ecotrack.backend.entity.CarbonEntry;

import java.util.List;

public interface RewardService {
    List<RewardTransactionResponse> getRewardHistory(String email);
    RewardPointsResponse getTotalPoints(String email);
    void processRewardForCarbonEntry(CarbonEntry carbonEntry);
}
