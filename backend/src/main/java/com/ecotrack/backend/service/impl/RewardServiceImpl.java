package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.RewardPointsResponse;
import com.ecotrack.backend.dto.response.RewardTransactionResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.RewardTransaction;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.RewardTransactionRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.RewardService;
import com.ecotrack.backend.service.interfaces.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardServiceImpl implements RewardService {

    private final RewardTransactionRepository rewardTransactionRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;

    @Override
    public List<RewardTransactionResponse> getRewardHistory(String email) {
        return rewardTransactionRepository.findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(transaction -> RewardTransactionResponse.builder()
                        .id(transaction.getId())
                        .points(transaction.getPoints())
                        .reason(transaction.getReason())
                        .createdAt(transaction.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public RewardPointsResponse getTotalPoints(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return RewardPointsResponse.builder()
                .ecoPoints(user.getEcoPoints())
                .build();
    }

    @Override
    public void processRewardForCarbonEntry(CarbonEntry carbonEntry) {
        int points = calculatePointsForActivity(carbonEntry.getActivity());
        
        User user = carbonEntry.getUser();
        user.setEcoPoints(user.getEcoPoints() + points);
        
        RewardTransaction transaction = RewardTransaction.builder()
                .user(user)
                .carbonEntry(carbonEntry)
                .points(points)
                .reason(carbonEntry.getActivity().trim())
                .build();
                
        rewardTransactionRepository.save(transaction);
        userRepository.save(user);
        
        badgeService.checkAndUnlockBadges(user);
    }

    private int calculatePointsForActivity(String activity) {
        if (activity == null) return 1;
        
        String normalizedActivity = activity.trim().toLowerCase();
        
        return switch (normalizedActivity) {
            case "walking" -> 25;
            case "bicycle" -> 20;
            case "bus" -> 10;
            case "train", "metro" -> 8;
            case "electric vehicle" -> 12;
            case "car", "other" -> 2;
            case "motorcycle" -> 4;
            case "electricity", "water", "food", "shopping", "waste" -> 5;
            default -> 1;
        };
    }
}
