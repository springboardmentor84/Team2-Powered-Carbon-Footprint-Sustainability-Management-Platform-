package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.GoalRequest;
import com.ecotrack.backend.dto.response.GoalResponse;
import com.ecotrack.backend.entity.Goal;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.GoalStatus;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.GoalRepository;
import com.ecotrack.backend.repository.NotificationRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.service.interfaces.GoalService;
import com.ecotrack.backend.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final CarbonEntryRepository carbonEntryRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public GoalResponse createGoal(String email, GoalRequest request) {
        User user = getUserByEmail(email);

        Goal goal = Goal.builder()
                .user(user)
                .title(request.getTitle())
                .targetCarbon(request.getTargetCarbon())
                .currentCarbon(0.0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(GoalStatus.ACTIVE)
                .build();

        Goal savedGoal = goalRepository.save(goal);
        return mapToGoalResponse(savedGoal);
    }

    @Override
    public List<GoalResponse> getMyGoals(String email) {
        User user = getUserByEmail(email);
        return goalRepository.findAllByUser(user).stream()
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());
    }

    @Override
    public GoalResponse getGoalById(Long id, String email) {
        User user = getUserByEmail(email);
        Goal goal = getGoalByIdAndUser(id, user);
        return mapToGoalResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long id, String email, GoalRequest request) {
        User user = getUserByEmail(email);
        Goal goal = getGoalByIdAndUser(id, user);

        goal.setTitle(request.getTitle());
        goal.setTargetCarbon(request.getTargetCarbon());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());
        goal.setUpdatedAt(LocalDateTime.now());

        Goal updatedGoal = goalRepository.save(goal);
        return mapToGoalResponse(updatedGoal);
    }

    @Override
    @Transactional
    public void deleteGoal(Long id, String email) {
        User user = getUserByEmail(email);
        Goal goal = getGoalByIdAndUser(id, user);
        goalRepository.delete(goal);
    }

    @Override
    @Transactional
    public com.ecotrack.backend.dto.response.GoalProgressResponse getGoalProgress(Long id, String email) {
        User user = getUserByEmail(email);
        Goal goal = getGoalByIdAndUser(id, user);

        LocalDateTime startDateTime = goal.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = goal.getEndDate().atTime(LocalTime.MAX);

        Double sumEmission = carbonEntryRepository.sumCarbonEmissionByUser_EmailAndCreatedAtBetween(
                email, startDateTime, endDateTime);

        double currentCarbon = sumEmission != null ? sumEmission : 0.0;
        
        double remainingCarbon = goal.getTargetCarbon() - currentCarbon;
        if (remainingCarbon < 0) {
            remainingCarbon = 0.0;
        }

        double completionPercentage = (currentCarbon / goal.getTargetCarbon()) * 100;
        if (completionPercentage > 100) {
            completionPercentage = 100.0;
        }
        completionPercentage = Math.round(completionPercentage * 100.0) / 100.0;

        GoalStatus currentStatus = goal.getStatus();
        GoalStatus newStatus = currentStatus;

        if (currentCarbon >= goal.getTargetCarbon()) {
            newStatus = GoalStatus.COMPLETED;
        } else if (LocalDate.now().isAfter(goal.getEndDate())) {
            newStatus = GoalStatus.FAILED;
        } else {
            newStatus = GoalStatus.ACTIVE;
        }

        boolean shouldSave = false;
        if (currentStatus != newStatus) {
            goal.setStatus(newStatus);
            shouldSave = true;
        }
        if (Double.compare(goal.getCurrentCarbon(), currentCarbon) != 0) {
            goal.setCurrentCarbon(currentCarbon);
            shouldSave = true;
        }

        if (shouldSave) {
            goal.setUpdatedAt(LocalDateTime.now());
            goalRepository.save(goal);
            
            if (currentStatus != GoalStatus.COMPLETED && newStatus == GoalStatus.COMPLETED) {
                String title = "Goal Completed";
                String message = "Congratulations! You successfully completed your goal '" + goal.getTitle() + "'.";
                if (!notificationRepository.existsByUserAndTitleAndMessage(user, title, message)) {
                    notificationService.createNotification(user, title, message);
                }
            }
        }

        return com.ecotrack.backend.dto.response.GoalProgressResponse.builder()
                .goalId(goal.getId())
                .title(goal.getTitle())
                .targetCarbon(goal.getTargetCarbon())
                .currentCarbon(currentCarbon)
                .remainingCarbon(remainingCarbon)
                .completionPercentage(completionPercentage)
                .status(newStatus.name())
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private Goal getGoalByIdAndUser(Long id, User user) {
        return goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id: " + id));
    }

    private GoalResponse mapToGoalResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .targetCarbon(goal.getTargetCarbon())
                .currentCarbon(goal.getCurrentCarbon())
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .status(goal.getStatus().name())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
