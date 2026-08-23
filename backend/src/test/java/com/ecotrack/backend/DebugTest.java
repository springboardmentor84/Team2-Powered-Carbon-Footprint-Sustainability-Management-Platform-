package com.ecotrack.backend;

import com.ecotrack.backend.entity.*;
import com.ecotrack.backend.repository.*;
import com.ecotrack.backend.service.impl.ChallengeParticipationServiceImpl;
import com.ecotrack.backend.enums.ChallengeCategory;
import com.ecotrack.backend.enums.CarbonCategory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootTest
public class DebugTest {
    @Autowired
    private ChallengeParticipationServiceImpl service;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ChallengeRepository challengeRepository;
    @Autowired
    private ChallengeParticipationRepository partRepo;

    @Test
    public void testProgress() {
        User user = userRepository.findById(7L).get();
        Challenge challenge = challengeRepository.findById(14L).get();
        ChallengeParticipation part = partRepo.findByUserIdAndChallengeId(7L, 14L).get();
        
        var response = service.calculateProgressReadOnly(challenge, user, part);
        System.out.println("DEBUG PROGRESS: " + response.getCurrentProgress());
        System.out.println("DEBUG COMPLETION: " + response.getCompletionPercentage());
    }
}
