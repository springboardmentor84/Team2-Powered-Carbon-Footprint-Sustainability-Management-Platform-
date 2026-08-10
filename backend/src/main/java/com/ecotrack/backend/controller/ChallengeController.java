package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.request.ChallengeRequest;
import com.ecotrack.backend.dto.response.ChallengeResponse;
import com.ecotrack.backend.service.interfaces.ChallengeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ChallengeResponse> createChallenge(
            @Valid @RequestBody ChallengeRequest request,
            Principal principal) {
        ChallengeResponse response = challengeService.createChallenge(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<ChallengeResponse>> getAllChallenges() {
        List<ChallengeResponse> responses = challengeService.getAllChallenges();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ChallengeResponse> getChallengeById(@PathVariable Long id) {
        ChallengeResponse response = challengeService.getChallengeById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ChallengeResponse> updateChallenge(
            @PathVariable Long id,
            @Valid @RequestBody ChallengeRequest request,
            Principal principal) {
        ChallengeResponse response = challengeService.updateChallenge(id, principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteChallenge(
            @PathVariable Long id,
            Principal principal) {
        challengeService.deleteChallenge(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
