package com.ecotrack.backend.config;

import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@ecotrack.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .fullName("EcoTrack Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@1234"))
                    .role(Role.ADMIN)
                    .ecoPoints(0)
                    .active(true)
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created: {} / Admin@1234", adminEmail);
        } else {
            log.info("Admin user already exists: {}", adminEmail);
        }
    }
}
