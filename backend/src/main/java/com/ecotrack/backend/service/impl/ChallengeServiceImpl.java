package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.request.ChallengeRequest;
import com.ecotrack.backend.dto.response.ChallengeResponse;
import com.ecotrack.backend.entity.Challenge;
import com.ecotrack.backend.entity.User;
import com.ecotrack.backend.enums.Role;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.ChallengeRepository;
import com.ecotrack.backend.repository.UserRepository;
import com.ecotrack.backend.service.interfaces.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeServiceImpl implements ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ChallengeResponse createChallenge(String email, ChallengeRequest request) {
        validateDates(request);

        User user = getUserByEmail(email);

        Challenge challenge = Challenge.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .target(request.getTarget())
                .unit(request.getUnit())
                .rewardPoints(request.getRewardPoints())
                .createdBy(user)
                .build();

        Challenge savedChallenge = challengeRepository.save(challenge);
        return mapToResponse(savedChallenge);
    }

    @Override
    public List<ChallengeResponse> getAllChallenges() {
        return challengeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ChallengeResponse getChallengeById(Long id) {
        Challenge challenge = getChallengeByIdInternal(id);
        return mapToResponse(challenge);
    }

    @Override
    @Transactional
    public ChallengeResponse updateChallenge(Long id, String email, ChallengeRequest request) {
        validateDates(request);

        User user = getUserByEmail(email);
        Challenge challenge = getChallengeByIdInternal(id);

        verifyOwnershipOrAdmin(challenge, user);

        challenge.setTitle(request.getTitle());
        challenge.setDescription(request.getDescription());
        challenge.setCategory(request.getCategory());
        challenge.setStartDate(request.getStartDate());
        challenge.setEndDate(request.getEndDate());
        challenge.setTarget(request.getTarget());
        challenge.setUnit(request.getUnit());
        challenge.setRewardPoints(request.getRewardPoints());

        Challenge updatedChallenge = challengeRepository.save(challenge);
        return mapToResponse(updatedChallenge);
    }

    @Override
    @Transactional
    public void deleteChallenge(Long id, String email) {
        User user = getUserByEmail(email);
        Challenge challenge = getChallengeByIdInternal(id);

        verifyOwnershipOrAdmin(challenge, user);

        challengeRepository.delete(challenge);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private Challenge getChallengeByIdInternal(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + id));
    }

    private void verifyOwnershipOrAdmin(Challenge challenge, User user) {
        boolean isOwner = challenge.getCreatedBy().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to modify this challenge");
        }
    }

    private void validateDates(ChallengeRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after or equal to start date");
        }
    }

    private ChallengeResponse mapToResponse(Challenge challenge) {
        return ChallengeResponse.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .category(challenge.getCategory())
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .target(challenge.getTarget())
                .unit(challenge.getUnit())
                .rewardPoints(challenge.getRewardPoints())
                .createdById(challenge.getCreatedBy().getId())
                .createdByName(challenge.getCreatedBy().getFullName())
                .createdAt(challenge.getCreatedAt())
                .updatedAt(challenge.getUpdatedAt())
                .build();
    }
}
