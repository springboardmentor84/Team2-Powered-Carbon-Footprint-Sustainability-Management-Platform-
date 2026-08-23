package com.ecotrack.backend.service.interfaces;

import com.ecotrack.backend.dto.request.ChallengeRequest;
import com.ecotrack.backend.dto.response.ChallengeResponse;

import java.util.List;

public interface ChallengeService {
    ChallengeResponse createChallenge(String userEmail, ChallengeRequest request);
    List<ChallengeResponse> getAllChallenges();
    org.springframework.data.domain.Page<ChallengeResponse> getAllChallenges(String search, com.ecotrack.backend.enums.ChallengeCategory category, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, org.springframework.data.domain.Pageable pageable);
    ChallengeResponse getChallengeById(Long id);
    com.ecotrack.backend.dto.response.AdminChallengeDetailsResponse getChallengeDetailsById(Long id);
    ChallengeResponse updateChallenge(Long id, String email, ChallengeRequest request);
    void deleteChallenge(Long id, String email);
}
