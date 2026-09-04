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

    // --- Admin Analytics Expanded Queries ---
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT c.user) FROM ChallengeParticipation c WHERE c.joinedAt >= :startDate AND c.joinedAt <= :endDate")
    long countDistinctUsersByJoinedAtBetween(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);
    
    long countByStatusAndJoinedAtBetween(ChallengeParticipationStatus status, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
