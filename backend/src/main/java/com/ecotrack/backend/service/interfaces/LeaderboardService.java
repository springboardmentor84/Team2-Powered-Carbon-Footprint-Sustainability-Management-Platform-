package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.LeaderboardResponse;
import com.ecotrack.backend.dto.response.MyRankResponse;

import java.util.List;

public interface LeaderboardService {
    List<LeaderboardResponse> getLeaderboard();
    MyRankResponse getMyRank(String email);
}
