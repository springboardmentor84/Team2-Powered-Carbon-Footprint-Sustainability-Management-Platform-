package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.BadgeDto;
import com.ecotrack.backend.dto.response.ChallengePreviewDto;
import com.ecotrack.backend.dto.response.GamificationSummaryResponse;
import com.ecotrack.backend.dto.response.RewardDto;
import com.ecotrack.backend.entity.Badge;
import com.ecotrack.backend.entity.Challenge;
import com.ecotrack.backend.entity.Reward;
import com.ecotrack.backend.entity.RewardRedemption;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.BadgeRepository;
import com.ecotrack.backend.repository.ChallengeParticipationRepository;
import com.ecotrack.backend.repository.ChallengeRepository;
import com.ecotrack.backend.repository.RewardRedemptionRepository;
import com.ecotrack.backend.repository.RewardRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.GamificationService;
import com.ecotrack.backend.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationServiceImpl implements GamificationService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository rewardRedemptionRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository challengeParticipationRepository;
    private final com.ecotrack.backend.service.interfaces.ChallengeParticipationService challengeParticipationService;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public GamificationSummaryResponse getGamificationSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        int ecoPoints = user.getEcoPoints() != null ? user.getEcoPoints() : 0;
        int level = calculateLevel(ecoPoints);
        String levelName = getLevelName(level);
        int pointsForNext = getPointsForLevel(level + 1);
        int pointsForCurrent = getPointsForLevel(level);

        int pointsToNextLevel = Math.max(0, pointsForNext - ecoPoints);
        double progressPercentage = 100.0;
        if (level < 6) {
            progressPercentage = (double) (ecoPoints - pointsForCurrent) / (pointsForNext - pointsForCurrent) * 100.0;
            progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        }

        List<Badge> allBadges = badgeRepository.findAll();
        List<Long> unlockedIds = user.getBadges().stream().map(Badge::getId).collect(Collectors.toList());

        List<BadgeDto> earnedBadges = allBadges.stream()
                .filter(b -> unlockedIds.contains(b.getId()))
                .map(this::mapToBadgeDto)
                .peek(dto -> dto.setUnlocked(true))
                .collect(Collectors.toList());

        List<BadgeDto> lockedBadges = allBadges.stream()
                .filter(b -> !unlockedIds.contains(b.getId()))
                .map(this::mapToBadgeDto)
                .peek(dto -> dto.setUnlocked(false))
                .collect(Collectors.toList());

        List<RewardDto> availableRewards = rewardRepository.findByActiveTrue().stream()
                .map(r -> RewardDto.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .description(r.getDescription())
                        .pointsRequired(r.getPointsRequired())
                        .icon(r.getIcon())
                        .build())
                .collect(Collectors.toList());

        // Simple active challenges preview (ones ending after today)
        LocalDate today = LocalDate.now();
        List<ChallengePreviewDto> activeChallenges = challengeRepository.findAll().stream()
                .filter(c -> !c.getEndDate().isBefore(today))
                .map(c -> {
                    double progress = challengeParticipationRepository
                            .findByUserIdAndChallengeId(user.getId(), c.getId())
                            .map(p -> challengeParticipationService.calculateProgressReadOnly(c, user, p).getCurrentProgress())
                            .orElse(0.0);
                    return ChallengePreviewDto.builder()
                            .id(c.getId())
                            .title(c.getTitle())
                            .description(c.getDescription())
                            .target(c.getTarget())
                            .unit(c.getUnit())
                            .rewardPoints(c.getRewardPoints())
                            .progress(progress)
                            .build();
                })
                .collect(Collectors.toList());

        return GamificationSummaryResponse.builder()
                .ecoPoints(ecoPoints)
                .currentLevel(level)
                .levelName(levelName)
                .pointsToNextLevel(pointsToNextLevel)
                .progressPercentage(progressPercentage)
                .earnedBadges(earnedBadges)
                .lockedBadges(lockedBadges)
                .availableRewards(availableRewards)
                .activeChallenges(activeChallenges)
                .build();
    }

    @Override
    @Transactional
    public void redeemReward(String email, Long rewardId) {
        User user = userRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new IllegalArgumentException("Reward not found"));

        if (!reward.getActive()) {
            throw new IllegalStateException("Reward is not active");
        }

        if (user.getEcoPoints() < reward.getPointsRequired()) {
            throw new IllegalStateException("Not enough EcoPoints to redeem this reward");
        }

        // Deduct points
        user.setEcoPoints(user.getEcoPoints() - reward.getPointsRequired());
        userRepository.save(user);

        // Record redemption
        RewardRedemption redemption = RewardRedemption.builder()
                .user(user)
                .reward(reward)
                .pointsCost(reward.getPointsRequired())
                .build();
        rewardRedemptionRepository.save(redemption);

        log.info("User {} redeemed reward: {}", email, reward.getName());

        notificationService.createNotification(
                user,
                "Reward Redeemed",
                "You successfully redeemed: " + reward.getName()
        );
    }

    private BadgeDto mapToBadgeDto(Badge badge) {
        return BadgeDto.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .icon(badge.getIcon())
                .pointsRequired(badge.getPointsRequired())
                .build();
    }

    private int calculateLevel(int points) {
        if (points < 500) return 1;
        if (points < 1000) return 2;
        if (points < 2000) return 3;
        if (points < 3500) return 4;
        if (points < 5000) return 5;
        return 6;
    }

    private int getPointsForLevel(int level) {
        switch (level) {
            case 1: return 0;
            case 2: return 500;
            case 3: return 1000;
            case 4: return 2000;
            case 5: return 3500;
            case 6: return 5000;
            default: return 5000;
        }
    }

    private String getLevelName(int level) {
        switch (level) {
            case 1: return "Eco Beginner";
            case 2: return "Green Contributor";
            case 3: return "Sustainability Advocate";
            case 4: return "Earth Protector";
            case 5: return "Eco Champion";
            case 6: return "Carbon Master";
            default: return "Legend";
        }
    }
}
