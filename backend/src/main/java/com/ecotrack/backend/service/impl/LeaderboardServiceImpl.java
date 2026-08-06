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
        List<User> users = userRepository.findAllByOrderByEcoPointsDesc();
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        
        int currentRank = 1;
        for (User user : users) {
            leaderboard.add(LeaderboardResponse.builder()
                    .rank(currentRank++)
                    .fullName(user.getFullName())
                    .ecoPoints(user.getEcoPoints())
                    .badgeCount(user.getBadges() != null ? user.getBadges().size() : 0)
                    .profileImage(user.getProfileImage())
                    .build());
        }
        
        return leaderboard;
    }

    @Override
    @Transactional(readOnly = true)
    public MyRankResponse getMyRank(String email) {
        List<User> users = userRepository.findAllByOrderByEcoPointsDesc();
        
        int rank = 1;
        User targetUser = null;
        
        for (User user : users) {
            if (user.getEmail().equals(email)) {
                targetUser = user;
                break;
            }
            rank++;
        }
        
        if (targetUser == null) {
            throw new UsernameNotFoundException("User not found");
        }
        
        return MyRankResponse.builder()
                .rank(rank)
                .fullName(targetUser.getFullName())
                .ecoPoints(targetUser.getEcoPoints())
                .badgeCount(targetUser.getBadges() != null ? targetUser.getBadges().size() : 0)
                .profileImage(targetUser.getProfileImage())
                .build();
    }
}
