package com.ecotrack.backend.repository;

import com.ecotrack.backend.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeRepository extends org.springframework.data.jpa.repository.JpaRepository<Challenge, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Challenge c WHERE c.startDate <= :date AND c.endDate >= :date")
    long countActiveChallenges(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Challenge c WHERE c.endDate < :date")
    long countCompletedChallenges(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Challenge c WHERE " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(CAST(:startDate AS java.time.LocalDateTime) IS NULL OR c.createdAt >= :startDate) AND " +
           "(CAST(:endDate AS java.time.LocalDateTime) IS NULL OR c.createdAt <= :endDate)")
    org.springframework.data.domain.Page<Challenge> findFilteredChallenges(
            @org.springframework.data.repository.query.Param("search") String search, 
            @org.springframework.data.repository.query.Param("category") com.ecotrack.backend.enums.ChallengeCategory category, 
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, 
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate, 
            org.springframework.data.domain.Pageable pageable);
}
