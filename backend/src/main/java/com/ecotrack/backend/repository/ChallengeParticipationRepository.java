package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.ChallengeParticipation;
import com.ecotrack.backend.enums.ChallengeParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, Long> {
    Optional<ChallengeParticipation> findByUserIdAndChallengeId(Long userId, Long challengeId);
    List<ChallengeParticipation> findByUserIdAndStatus(Long userId, ChallengeParticipationStatus status);
    List<ChallengeParticipation> findByChallengeIdAndStatus(Long challengeId, ChallengeParticipationStatus status);
    long countByStatus(ChallengeParticipationStatus status);
}
