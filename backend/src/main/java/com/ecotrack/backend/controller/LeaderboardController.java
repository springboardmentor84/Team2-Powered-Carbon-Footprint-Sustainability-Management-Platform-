package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.LeaderboardResponse;
import com.ecotrack.backend.dto.response.MyRankResponse;
import com.ecotrack.backend.service.interfaces.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        List<LeaderboardResponse> leaderboard = leaderboardService.getLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<MyRankResponse> getMyRank(Principal principal) {
        String email = principal.getName();
        MyRankResponse myRank = leaderboardService.getMyRank(email);
        return ResponseEntity.ok(myRank);
    }
}
