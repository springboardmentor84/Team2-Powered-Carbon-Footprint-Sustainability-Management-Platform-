package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.response.ChallengeParticipationResponse;
import com.ecotrack.backend.service.interfaces.ChallengeParticipationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

import com.ecotrack.backend.service.interfaces.ChallengeLeaderboardService;

@RestController
@RequestMapping("/api/v1/challenges")
@RequiredArgsConstructor
public class ChallengeParticipationController {

    private final ChallengeParticipationService participationService;
    private final ChallengeLeaderboardService leaderboardService;

    @PostMapping("/{id}/join")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ChallengeParticipationResponse> joinChallenge(
            @PathVariable Long id,
            Principal principal) {
        ChallengeParticipationResponse response = participationService.joinChallenge(id, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/leave")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> leaveChallenge(
            @PathVariable Long id,
            Principal principal) {
        participationService.leaveChallenge(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ChallengeParticipationResponse>> getMyChallenges(Principal principal) {
        List<ChallengeParticipationResponse> responses = participationService.getMyChallenges(principal.getName());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}/participants")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ChallengeParticipationResponse>> getChallengeParticipants(@PathVariable Long id) {
        List<ChallengeParticipationResponse> responses = participationService.getChallengeParticipants(id);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<com.ecotrack.backend.dto.response.ChallengeProgressResponse> getChallengeProgress(
            @PathVariable Long id,
            Principal principal) {
        com.ecotrack.backend.dto.response.ChallengeProgressResponse response = participationService.getChallengeProgress(id, principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/leaderboard")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<com.ecotrack.backend.dto.response.ChallengeLeaderboardResponse>> getChallengeLeaderboard(@PathVariable Long id) {
        List<com.ecotrack.backend.dto.response.ChallengeLeaderboardResponse> responses = leaderboardService.getChallengeLeaderboard(id);
        return ResponseEntity.ok(responses);
    }
}
