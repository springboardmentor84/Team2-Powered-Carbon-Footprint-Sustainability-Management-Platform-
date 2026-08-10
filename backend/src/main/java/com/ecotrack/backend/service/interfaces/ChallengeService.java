package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.ChallengeRequest;
import com.ecotrack.backend.dto.response.ChallengeResponse;

import java.util.List;

public interface ChallengeService {
    ChallengeResponse createChallenge(String email, ChallengeRequest request);
    List<ChallengeResponse> getAllChallenges();
    ChallengeResponse getChallengeById(Long id);
    ChallengeResponse updateChallenge(Long id, String email, ChallengeRequest request);
    void deleteChallenge(Long id, String email);
}
