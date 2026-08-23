package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.LeaderboardResponse;
import com.ecotrack.backend.dto.response.MyRankResponse;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardResponse> getLeaderboard() {
        List<User> users = userRepository.findAllByRoleAndActiveTrueOrderByEcoPointsDesc(com.ecotrack.backend.enums.Role.USER);
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        
        int currentRank = 1;
        Integer previousPoints = null;
        
        for (User user : users) {
            if (previousPoints != null && !user.getEcoPoints().equals(previousPoints)) {
                currentRank++;
            }
            leaderboard.add(LeaderboardResponse.builder()
                    .rank(currentRank)
                    .fullName(user.getFullName())
                    .ecoPoints(user.getEcoPoints())
                    .badgeCount(user.getBadges() != null ? user.getBadges().size() : 0)
                    .profileImage(user.getProfileImage())
                    .build());
            previousPoints = user.getEcoPoints();
        }
        
        return leaderboard;
    }

    @Override
    @Transactional(readOnly = true)
    public MyRankResponse getMyRank(String email) {
        List<User> users = userRepository.findAllByRoleAndActiveTrueOrderByEcoPointsDesc(com.ecotrack.backend.enums.Role.USER);
        
        int currentRank = 1;
        Integer previousPoints = null;
        Integer myRank = null;
        User targetUser = null;
        
        for (User user : users) {
            if (previousPoints != null && !user.getEcoPoints().equals(previousPoints)) {
                currentRank++;
            }
            if (user.getEmail().equals(email)) {
                targetUser = user;
                myRank = currentRank;
                break;
            }
            previousPoints = user.getEcoPoints();
        }
        
        // If it's an admin, they might not be in the list, so we fetch them manually
        if (targetUser == null) {
            targetUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            // Admins don't have a rank on the public leaderboard, but we return 0 or null
            // For now, let's just return rank 0 for users not in the leaderboard list
            myRank = 0;
        }
        
        return MyRankResponse.builder()
                .rank(myRank)
                .fullName(targetUser.getFullName())
                .ecoPoints(targetUser.getEcoPoints())
                .badgeCount(targetUser.getBadges() != null ? targetUser.getBadges().size() : 0)
                .profileImage(targetUser.getProfileImage())
                .build();
    }
}
