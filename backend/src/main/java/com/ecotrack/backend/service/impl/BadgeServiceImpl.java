package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.BadgeResponse;
import com.ecotrack.backend.entity.Badge;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.repository.BadgeRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.BadgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BadgeResponse> getMyBadges(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return user.getBadges().stream()
                .map(badge -> BadgeResponse.builder()
                        .id(badge.getId())
                        .name(badge.getName())
                        .description(badge.getDescription())
                        .icon(badge.getIcon())
                        .pointsRequired(badge.getPointsRequired())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void checkAndUnlockBadges(User user) {
        List<Badge> allBadges = badgeRepository.findAll();
        boolean unlockedNewBadge = false;

        for (Badge badge : allBadges) {
            if (user.getEcoPoints() >= badge.getPointsRequired()) {
                // Check if user already has this badge
                boolean alreadyHasBadge = user.getBadges().stream()
                        .anyMatch(b -> b.getId().equals(badge.getId()));

                if (!alreadyHasBadge) {
                    user.getBadges().add(badge);
                    unlockedNewBadge = true;
                    log.info("User {} unlocked badge: {}", user.getEmail(), badge.getName());
                }
            }
        }

        if (unlockedNewBadge) {
            userRepository.save(user);
        }
    }
}
