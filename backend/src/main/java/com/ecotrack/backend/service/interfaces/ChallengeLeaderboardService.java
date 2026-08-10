package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.ChallengeLeaderboardResponse;
import java.util.List;

public interface ChallengeLeaderboardService {
    List<ChallengeLeaderboardResponse> getChallengeLeaderboard(Long challengeId);
}
