package com.ecotrack.backend.controller;

import com.ecotrack.backend.dto.request.GoalRequest;
import com.ecotrack.backend.dto.response.GoalResponse;
import com.ecotrack.backend.service.interfaces.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<GoalResponse> createGoal(
            @Valid @RequestBody GoalRequest request,
            Principal principal) {
        GoalResponse response = goalService.createGoal(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<GoalResponse>> getMyGoals(Principal principal) {
        List<GoalResponse> responses = goalService.getMyGoals(principal.getName());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<GoalResponse> getGoalById(
            @PathVariable Long id,
            Principal principal) {
        GoalResponse response = goalService.getGoalById(id, principal.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<GoalResponse> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request,
            Principal principal) {
        GoalResponse response = goalService.updateGoal(id, principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id,
            Principal principal) {
        goalService.deleteGoal(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<com.ecotrack.backend.dto.response.GoalProgressResponse> getGoalProgress(
            @PathVariable Long id,
            Principal principal) {
        com.ecotrack.backend.dto.response.GoalProgressResponse response = goalService.getGoalProgress(id, principal.getName());
        return ResponseEntity.ok(response);
    }
}
