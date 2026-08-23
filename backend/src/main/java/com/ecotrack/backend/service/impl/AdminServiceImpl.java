package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.AdminDashboardMetricsResponse;
import com.ecotrack.backend.enums.ChallengeParticipationStatus;
import com.ecotrack.backend.enums.GoalStatus;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.ChallengeParticipationRepository;
import com.ecotrack.backend.repository.ChallengeRepository;
import com.ecotrack.backend.repository.GoalRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final CarbonEntryRepository carbonEntryRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository challengeParticipationRepository;
    private final GoalRepository goalRepository;
    private final com.ecotrack.backend.repository.RewardTransactionRepository rewardTransactionRepository;

    @Override
    public AdminDashboardMetricsResponse getDashboardMetrics() {
        long totalUsers = userRepository.countByRole(Role.USER);
        long activeUsers = userRepository.countByRoleAndActiveTrue(Role.USER);
        long inactiveUsers = totalUsers - activeUsers;
        
        Long sumPoints = rewardTransactionRepository.sumTotalPointsAwarded();
        long totalEcoPoints = (sumPoints != null) ? sumPoints : 0L;
        long totalRewardActivities = rewardTransactionRepository.count();
        
        long carbonActivities = carbonEntryRepository.count();
        Double sumEmissions = carbonEntryRepository.sumGlobalCarbonEmission();
        double totalCarbonEmissions = (sumEmissions != null) ? sumEmissions : 0.0;
        double averageCarbonEmission = (carbonActivities > 0) ? totalCarbonEmissions / carbonActivities : 0.0;
        
        java.time.LocalDate today = java.time.LocalDate.now();
        long totalChallenges = challengeRepository.count();
        long activeChallenges = challengeRepository.countActiveChallenges(today);
        long completedChallenges = challengeRepository.countCompletedChallenges(today);
        long activeParticipations = challengeParticipationRepository.countByStatus(ChallengeParticipationStatus.JOINED);

        long activeGoals = goalRepository.countByStatus(GoalStatus.ACTIVE);
        long completedGoals = goalRepository.countByStatus(GoalStatus.COMPLETED);
        
        java.util.List<com.ecotrack.backend.dto.response.UserAdminResponse> topUsers = userRepository.findTop5ByRoleOrderByEcoPointsDesc(Role.USER).stream()
                .map(this::mapToUserAdminResponse)
                .toList();

        final java.util.List<java.util.Map<String, Object>> recentActivity = new java.util.ArrayList<>();
        
        userRepository.findTop5ByOrderByCreatedAtDesc().forEach(u -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("type", "USER");
            map.put("description", "New user joined: " + u.getFullName());
            map.put("createdAt", u.getCreatedAt());
            recentActivity.add(map);
        });

        carbonEntryRepository.findTop5ByOrderByCreatedAtDesc().forEach(c -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("type", "CARBON");
            map.put("description", "New carbon entry: " + c.getActivity() + " (" + c.getCarbonEmission() + " kg)");
            map.put("createdAt", c.getCreatedAt());
            recentActivity.add(map);
        });

        goalRepository.findTop5ByOrderByCreatedAtDesc().forEach(g -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("type", "GOAL");
            map.put("description", "New goal created: " + g.getTitle());
            map.put("createdAt", g.getCreatedAt());
            recentActivity.add(map);
        });

        recentActivity.sort((m1, m2) -> ((java.time.LocalDateTime) m2.get("createdAt")).compareTo((java.time.LocalDateTime) m1.get("createdAt")));
        java.util.List<java.util.Map<String, Object>> finalRecentActivity = recentActivity.size() > 5 ? recentActivity.subList(0, 5) : recentActivity;

        return AdminDashboardMetricsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .totalEcoPointsGenerated(totalEcoPoints)
                .totalRewardActivities(totalRewardActivities)
                .totalCarbonActivities(carbonActivities)
                .totalCarbonEmissions(totalCarbonEmissions)
                .averageCarbonEmission(averageCarbonEmission)
                .totalChallenges(totalChallenges)
                .activeChallenges(activeChallenges)
                .completedChallenges(completedChallenges)
                .activeChallengeParticipations(activeParticipations)
                .activeGoals(activeGoals)
                .completedGoals(completedGoals)
                .categoryEmissions(carbonEntryRepository.findGlobalCategoryEmissions())
                .topEcoUsers(topUsers)
                .recentActivity(finalRecentActivity)
                .build();
    }
    @Override
    public org.springframework.data.domain.Page<com.ecotrack.backend.dto.response.UserAdminResponse> getAllUsers(String search, Role role, Boolean active, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, org.springframework.data.domain.Pageable pageable) {
        return userRepository.findFilteredUsers(search, role, active, startDate, endDate, pageable)
                .map(this::mapToUserAdminResponse);
    }

    @Override
    public com.ecotrack.backend.dto.response.AdminUserDetailsResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToAdminUserDetailsResponse)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    private com.ecotrack.backend.dto.response.AdminUserDetailsResponse mapToAdminUserDetailsResponse(com.ecotrack.backend.entity.User user) {
        long totalCarbonEntries = carbonEntryRepository.countByUser_Email(user.getEmail());
        Double sumEmissions = carbonEntryRepository.sumCarbonEmissionByUser_Email(user.getEmail());
        
        long activeGoals = goalRepository.findAllByUser(user).stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE).count();
        long completedGoals = goalRepository.findAllByUser(user).stream()
                .filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();

        java.util.List<com.ecotrack.backend.entity.ChallengeParticipation> participations = 
                challengeParticipationRepository.findByUserIdAndStatus(user.getId(), ChallengeParticipationStatus.JOINED);
        
        long totalParticipations = participations.size();
        long activeChallenges = 0;
        long expiredChallenges = 0;
        long completedChallenges = 0; // Completion tracking not fully implemented
        
        java.time.LocalDate today = java.time.LocalDate.now();
        for (var p : participations) {
            if (p.getChallenge().getEndDate().isBefore(today)) {
                expiredChallenges++;
            } else {
                activeChallenges++;
            }
        }

        java.util.List<com.ecotrack.backend.entity.RewardTransaction> rewards = 
                rewardTransactionRepository.findByUserEmailOrderByCreatedAtDesc(user.getEmail());
        long rewardActivities = rewards.size();
        long totalRewardedPoints = rewards.stream()
                .mapToLong(r -> r.getPoints() != null ? r.getPoints() : 0)
                .sum();

        return com.ecotrack.backend.dto.response.AdminUserDetailsResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .ecoPoints(user.getEcoPoints())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .totalCarbonEntries(totalCarbonEntries)
                .totalCarbonEmissions(sumEmissions != null ? sumEmissions : 0.0)
                .activeGoals(activeGoals)
                .completedGoals(completedGoals)
                .activeChallenges(activeChallenges)
                .completedChallenges(completedChallenges)
                .expiredChallenges(expiredChallenges)
                .totalParticipations(totalParticipations)
                .rewardActivities(rewardActivities)
                .totalRewardedPoints(totalRewardedPoints)
                .profileImage(user.getProfileImage())
                .build();
    }

    private com.ecotrack.backend.dto.response.UserAdminResponse mapToUserAdminResponse(com.ecotrack.backend.entity.User user) {
        return com.ecotrack.backend.dto.response.UserAdminResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .ecoPoints(user.getEcoPoints())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
