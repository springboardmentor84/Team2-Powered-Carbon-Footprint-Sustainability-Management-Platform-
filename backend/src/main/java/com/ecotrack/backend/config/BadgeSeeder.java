package com.ecotrack.backend.config;

import com.ecotrack.backend.entity.Badge;
import com.ecotrack.backend.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeSeeder implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    @Override
    public void run(String... args) {
        log.info("Checking and seeding default badges...");

        List<Badge> defaultBadges = List.of(
                Badge.builder()
                        .name("Eco Beginner")
                        .description("Earn your first eco points.")
                        .pointsRequired(1)
                        .icon("seedling")
                        .build(),
                Badge.builder()
                        .name("Green Explorer")
                        .description("Reach 100 eco points.")
                        .pointsRequired(100)
                        .icon("leaf")
                        .build(),
                Badge.builder()
                        .name("Carbon Saver")
                        .description("Reach 250 eco points.")
                        .pointsRequired(250)
                        .icon("tree")
                        .build(),
                Badge.builder()
                        .name("Eco Champion")
                        .description("Reach 500 eco points.")
                        .pointsRequired(500)
                        .icon("trophy")
                        .build()
        );

        for (Badge badge : defaultBadges) {
            if (!badgeRepository.existsByName(badge.getName())) {
                badgeRepository.save(badge);
                log.info("Seeded badge: {}", badge.getName());
            }
        }
        
        log.info("Badge seeding completed.");
    }
}
