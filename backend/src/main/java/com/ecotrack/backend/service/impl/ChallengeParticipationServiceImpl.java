package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.ChallengeParticipationResponse;
import com.ecotrack.backend.entity.Challenge;
import com.ecotrack.backend.entity.ChallengeParticipation;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.ChallengeParticipationStatus;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.ChallengeParticipationRepository;
import com.ecotrack.backend.repository.ChallengeRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.ChallengeParticipationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.ecotrack.backend.dto.response.ChallengeProgressResponse;
import com.ecotrack.backend.entity.CarbonEntry;
import com.ecotrack.backend.enums.CarbonCategory;
import com.ecotrack.backend.repository.CarbonEntryRepository;
import com.ecotrack.backend.repository.RewardTransactionRepository;
import com.ecotrack.backend.service.interfaces.RewardService;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class ChallengeParticipationServiceImpl implements ChallengeParticipationService {

    private final ChallengeParticipationRepository participationRepository;
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final CarbonEntryRepository carbonEntryRepository;
    private final RewardService rewardService;
    private final RewardTransactionRepository rewardTransactionRepository;

    @Override
    @Transactional
    public ChallengeParticipationResponse joinChallenge(Long challengeId, String email) {
        User user = getUserByEmail(email);
        Challenge challenge = getChallengeById(challengeId);

        if (challenge.getEndDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot join a challenge that has already ended.");
        }

        Optional<ChallengeParticipation> existingOpt = participationRepository.findByUserIdAndChallengeId(user.getId(), challenge.getId());

        if (existingOpt.isPresent()) {
            ChallengeParticipation existing = existingOpt.get();
            if (existing.getStatus() == ChallengeParticipationStatus.JOINED) {
                throw new IllegalStateException("You have already joined this challenge.");
            }
            // Re-join if they previously left
            existing.setStatus(ChallengeParticipationStatus.JOINED);
            return mapToResponse(participationRepository.save(existing));
        }

        ChallengeParticipation newParticipation = ChallengeParticipation.builder()
                .user(user)
                .challenge(challenge)
                .status(ChallengeParticipationStatus.JOINED)
                .build();

        return mapToResponse(participationRepository.save(newParticipation));
    }

    @Override
    @Transactional
    public void leaveChallenge(Long challengeId, String email) {
        User user = getUserByEmail(email);
        Challenge challenge = getChallengeById(challengeId);

        ChallengeParticipation participation = participationRepository.findByUserIdAndChallengeId(user.getId(), challenge.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You are not participating in this challenge."));

        if (participation.getStatus() == ChallengeParticipationStatus.LEFT) {
            throw new IllegalStateException("You have already left this challenge.");
        }

        participation.setStatus(ChallengeParticipationStatus.LEFT);
        participationRepository.save(participation);
    }

    @Override
    public List<ChallengeParticipationResponse> getMyChallenges(String email) {
        User user = getUserByEmail(email);
        List<ChallengeParticipation> participations = participationRepository.findByUserIdAndStatus(user.getId(), ChallengeParticipationStatus.JOINED);
        return participations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ChallengeParticipationResponse> getChallengeParticipants(Long challengeId) {
        Challenge challenge = getChallengeById(challengeId);
        List<ChallengeParticipation> participations = participationRepository.findByChallengeIdAndStatus(challenge.getId(), ChallengeParticipationStatus.JOINED);
        return participations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ChallengeProgressResponse getChallengeProgress(Long challengeId, String email) {
        User user = getUserByEmail(email);
        Challenge challenge = getChallengeById(challengeId);

        ChallengeParticipation participation = participationRepository.findByUserIdAndChallengeId(user.getId(), challenge.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You are not participating in this challenge."));

        if (participation.getStatus() != ChallengeParticipationStatus.JOINED) {
            throw new IllegalStateException("You must actively join the challenge to track progress.");
        }

        ChallengeProgressResponse response = calculateProgressReadOnly(challenge, user, participation);

        // Process side effects (rewards) based on the calculated status
        if ("COMPLETED".equals(response.getChallengeStatus())) {
            rewardService.processRewardForChallengeCompletion(user, challenge);
            
            // Re-check rewardGranted after processing
            boolean rewardGranted = rewardTransactionRepository.existsByUser_IdAndReason(user.getId(), "Challenge Completed: " + challenge.getId());
            response.setRewardGranted(rewardGranted);
        }

        return response;
    }

    @Override
    public ChallengeProgressResponse calculateProgressReadOnly(Challenge challenge, User user, ChallengeParticipation participation) {
        List<CarbonEntry> entries = carbonEntryRepository.findByUser_EmailAndCreatedAtBetween(
                user.getEmail(), 
                challenge.getStartDate().atStartOfDay(), 
                challenge.getEndDate().atTime(LocalTime.MAX)
        );

        double progress = 0.0;
        for (CarbonEntry entry : entries) {
            if (matchesChallengeCategory(entry, challenge.getCategory())) {
                if (entry.getUnit() != null && entry.getUnit().equalsIgnoreCase(challenge.getUnit())) {
                    progress += entry.getQuantity();
                }
            }
        }

        double target = challenge.getTarget();
        double completion = (target > 0) ? (progress / target) * 100 : 0.0;
        if (completion > 100.0) completion = 100.0;
        completion = Math.round(completion * 100.0) / 100.0;

        String chStatus;
        if (progress >= target) {
            chStatus = "COMPLETED";
        } else if (LocalDate.now().isAfter(challenge.getEndDate())) {
            chStatus = "EXPIRED";
        } else if (progress > 0) {
            chStatus = "IN_PROGRESS";
        } else {
            chStatus = "NOT_STARTED";
        }

        boolean rewardGranted = rewardTransactionRepository.existsByUser_IdAndReason(user.getId(), "Challenge Completed: " + challenge.getId());

        return ChallengeProgressResponse.builder()
                .challengeId(challenge.getId())
                .challengeTitle(challenge.getTitle())
                .target(target)
                .currentProgress(progress)
                .unit(challenge.getUnit())
                .completionPercentage(completion)
                .participationStatus(participation.getStatus().name())
                .challengeStatus(chStatus)
                .rewardGranted(rewardGranted)
                .build();
    }

    private boolean matchesChallengeCategory(CarbonEntry entry, com.ecotrack.backend.enums.ChallengeCategory challengeCategory) {
        if (entry.getCategory() == null || entry.getActivity() == null) return false;
        String activity = entry.getActivity().toLowerCase();
        
        switch (challengeCategory) {
            case CYCLE_TO_WORK:
                return entry.getCategory() == CarbonCategory.TRANSPORT && (activity.contains("bike") || activity.contains("cycle"));
            case ENERGY_SAVING:
                return entry.getCategory() == CarbonCategory.ELECTRICITY;
            case WATER_CONSERVATION:
                return entry.getCategory() == CarbonCategory.WATER;
            case ZERO_WASTE:
                return entry.getCategory() == CarbonCategory.WASTE;
            case PLASTIC_FREE:
                return entry.getCategory() == CarbonCategory.WASTE && (activity.contains("plastic") || activity.contains("single-use"));
            case TREE_PLANTATION:
                return entry.getCategory() == CarbonCategory.OTHER && (activity.contains("tree") || activity.contains("plant"));
            default:
                return false;
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Challenge getChallengeById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + id));
    }

    private ChallengeParticipationResponse mapToResponse(ChallengeParticipation p) {
        return ChallengeParticipationResponse.builder()
                .id(p.getId())
                .challengeId(p.getChallenge().getId())
                .challengeTitle(p.getChallenge().getTitle())
                .userId(p.getUser().getId())
                .userName(p.getUser().getFullName())
                .joinedAt(p.getJoinedAt())
                .status(p.getStatus())
                .build();
    }
}
