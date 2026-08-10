package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.RewardPointsResponse;
import com.ecotrack.backend.dto.response.RewardTransactionResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.entity.RewardTransaction;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.NotificationRepository;
import com.ecotrack.backend.repository.RewardTransactionRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.RewardService;
import com.ecotrack.backend.service.interfaces.BadgeService;
import com.ecotrack.backend.service.interfaces.NotificationService;
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
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

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
        checkAndNotifyMilestones(user);
    }
    
    @Override
    public void revertRewardForCarbonEntry(CarbonEntry carbonEntry) {
        List<RewardTransaction> transactions = rewardTransactionRepository.findByCarbonEntryId(carbonEntry.getId());
        
        int totalPointsToDeduct = 0;
        for (RewardTransaction tx : transactions) {
            totalPointsToDeduct += tx.getPoints();
            tx.setCarbonEntry(null);
            rewardTransactionRepository.save(tx);
        }
        
        if (totalPointsToDeduct > 0) {
            User user = carbonEntry.getUser();
            int newPoints = Math.max(0, user.getEcoPoints() - totalPointsToDeduct);
            user.setEcoPoints(newPoints);
            
            RewardTransaction negativeTransaction = RewardTransaction.builder()
                    .user(user)
                    .carbonEntry(null)
                    .points(-totalPointsToDeduct)
                    .reason("Carbon entry deleted")
                    .build();
                    
            rewardTransactionRepository.save(negativeTransaction);
            userRepository.save(user);
        }
    }
    
    private void checkAndNotifyMilestones(User user) {
        int[] milestones = {100, 250, 500, 1000};
        int currentPoints = user.getEcoPoints();
        
        for (int milestone : milestones) {
            if (currentPoints >= milestone) {
                String title = "Eco Point Milestone";
                String message = "You reached " + milestone + " Eco Points. Keep going!";
                if (!notificationRepository.existsByUserAndTitleAndMessage(user, title, message)) {
                    notificationService.createNotification(user, title, message);
                }
            }
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void processRewardForChallengeCompletion(com.ecotrack.backend.entity.User user, com.ecotrack.backend.entity.Challenge challenge) {
        String reason = "Challenge Completed: " + challenge.getId();
        if (rewardTransactionRepository.existsByUser_IdAndReason(user.getId(), reason)) {
            return;
        }

        int points = challenge.getRewardPoints();
        user.setEcoPoints(user.getEcoPoints() + points);

        RewardTransaction transaction = RewardTransaction.builder()
                .user(user)
                .points(points)
                .reason(reason)
                .build();

        rewardTransactionRepository.save(transaction);
        userRepository.save(user);

        badgeService.checkAndUnlockBadges(user);
        checkAndNotifyMilestones(user);
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
