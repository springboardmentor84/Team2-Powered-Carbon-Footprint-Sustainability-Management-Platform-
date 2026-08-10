package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.response.ChallengeParticipationResponse;

import java.util.List;

public interface ChallengeParticipationService {
    ChallengeParticipationResponse joinChallenge(Long challengeId, String email);
    void leaveChallenge(Long challengeId, String email);
    List<ChallengeParticipationResponse> getMyChallenges(String email);
    List<ChallengeParticipationResponse> getChallengeParticipants(Long challengeId);
    com.ecotrack.backend.dto.response.ChallengeProgressResponse getChallengeProgress(Long challengeId, String email);
    com.ecotrack.backend.dto.response.ChallengeProgressResponse calculateProgressReadOnly(com.ecotrack.backend.entity.Challenge challenge, com.ecotrack.backend.entity.User user, com.ecotrack.backend.entity.ChallengeParticipation participation);
}
