package com.ecotrack.backend.service.impl;

import com.ecotrack.backend.dto.response.ChallengeLeaderboardResponse;
import com.ecotrack.backend.dto.response.ChallengeProgressResponse;
import com.ecotrack.backend.entity.Challenge;
import com.ecotrack.backend.entity.ChallengeParticipation;
import com.ecotrack.backend.enums.ChallengeParticipationStatus;
import com.ecotrack.backend.exception.custom.ResourceNotFoundException;
import com.ecotrack.backend.repository.ChallengeParticipationRepository;
import com.ecotrack.backend.repository.ChallengeRepository;
import com.ecotrack.backend.service.interfaces.ChallengeLeaderboardService;
import com.ecotrack.backend.service.interfaces.ChallengeParticipationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChallengeLeaderboardServiceImpl implements ChallengeLeaderboardService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final ChallengeParticipationService participationService;

    @Override
    public List<ChallengeLeaderboardResponse> getChallengeLeaderboard(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + challengeId));

        List<ChallengeParticipation> participations = participationRepository.findByChallengeIdAndStatus(challenge.getId(), ChallengeParticipationStatus.JOINED);

        List<ChallengeLeaderboardResponse> leaderboard = new ArrayList<>();

        for (ChallengeParticipation p : participations) {
            ChallengeProgressResponse progress = participationService.calculateProgressReadOnly(challenge, p.getUser(), p);
            
            ChallengeLeaderboardResponse lbResponse = ChallengeLeaderboardResponse.builder()
                    .userId(p.getUser().getId())
                    .fullName(p.getUser().getFullName())
                    .profileImage(p.getUser().getProfileImage())
                    .currentProgress(progress.getCurrentProgress())
                    .target(progress.getTarget())
                    .unit(progress.getUnit())
                    .completionPercentage(progress.getCompletionPercentage())
                    .challengeStatus(progress.getChallengeStatus())
                    .build();
            leaderboard.add(lbResponse);
        }

        leaderboard.sort((a, b) -> {
            int c = Double.compare(b.getCurrentProgress(), a.getCurrentProgress());
            if (c != 0) return c;
            
            c = Double.compare(b.getCompletionPercentage(), a.getCompletionPercentage());
            if (c != 0) return c;
            
            // Tiebreaker: JoinedAt (we don't have it in the DTO, so we must find it or just use UserID)
            return a.getUserId().compareTo(b.getUserId());
        });

        int rank = 1;
        for (ChallengeLeaderboardResponse response : leaderboard) {
            response.setRank(rank++);
        }

        return leaderboard;
    }
}
