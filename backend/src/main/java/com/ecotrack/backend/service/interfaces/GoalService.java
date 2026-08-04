package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.GoalRequest;
import com.ecotrack.backend.dto.response.GoalResponse;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(String email, GoalRequest request);
    List<GoalResponse> getMyGoals(String email);
    GoalResponse getGoalById(Long id, String email);
    GoalResponse updateGoal(Long id, String email, GoalRequest request);
    void deleteGoal(Long id, String email);
    com.ecotrack.backend.dto.response.GoalProgressResponse getGoalProgress(Long id, String email);
}
